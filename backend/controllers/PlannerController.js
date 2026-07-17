import mongoose from "mongoose";
import { PlannerFolderModel } from "../models/PlannerFolderModel.js";
import { PlannerPlanModel } from "../models/PlannerPlanModel.js";
import { UserModel } from "../models/UserModel.js";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const PLAN_MODEL = "openai/gpt-oss-120b";
const PLAN_RESERVATION = 3500;
const DEFAULT_DAILY_BALANCE = 20000;

const cleanText = (value, maxLength) => String(value || "").trim().slice(0, maxLength);

function getBalance(user) {
  return Number.isFinite(user.plannerTokenBalance) ? user.plannerTokenBalance : DEFAULT_DAILY_BALANCE;
}

function titleFromTopic(topic) {
  return `Priprema: ${topic}`.slice(0, 200);
}

function buildSystemPrompt({ grade, schoolType, classType, language, previouslyCovered, coveredHow }) {
  const previousContext = previouslyCovered
    ? `Tema je već obrađivana na sledeći način: ${coveredHow || "nije unet dodatni opis"}. Nadoveži se na to znanje.`
    : "Tema ranije nije obrađivana; uvedi je postepeno.";

  return `Ti si IskraAI, napredni asistent edukativne platforme \"Iskra\" namenjene učenicima informatike u Srbiji.
Tvoj zadatak je da pružaš precizne, strukturisane i pedagoške odgovore u Markdown formatu.

### KONTEKSTUALNA PODEŠAVANJA
- Razred učenika: ${grade}
- Vrsta škole: ${schoolType}
- Tip časa: ${classType}
- Programski jezik / predmetni kontekst: ${language}
- ${previousContext}

### PRAVILA PONAŠANJA
1. Prilagodi jezik, obim i primere navedenom razredu i vrsti škole. Za gimnaziju objasni teorijsku pozadinu i logiku; za tehničku školu naglasi praktičnu primenu i sintaksu.
2. Koristi Sokratov metod: uz rešenje dodaj pitanja koja vode učenika kroz razmišljanje.
3. Uvek koristi Markdown. Sav kod mora biti u blokovima sa jasno navedenim jezikom.
4. Ako ispravljaš korisnikov kod, ne preimenuj njegove promenljive niti strukturu; optimizuj samo logiku i dodaj komentare.
5. Kreiraj upotrebljiv nastavni materijal: ciljeve/ishode, vremensku strukturu, teoriju, primere, aktivnost, proveru znanja i domaći zadatak.`;
}

async function reserveTokens(userId, amount) {
  const now = new Date();
  const balanceOrDefault = { $ifNull: ["$plannerTokenBalance", DEFAULT_DAILY_BALANCE] };
  const cycleExpired = {
    $and: [
      { $ne: [{ $ifNull: ["$plannerTokenResetAt", null] }, null] },
      { $lte: ["$plannerTokenResetAt", now] },
    ],
  };
  const startNewCycle = { $or: [cycleExpired, { $eq: [{ $ifNull: ["$plannerTokenResetAt", null] }, null] }] };

  // Jedan atomski update: po isteku ciklusa lazy vraća 20k, otvara novi rok od sat vremena,
  // a zatim rezerviše tokene za trenutni zahtev. Nema posebnog cron procesa.
  return UserModel.findOneAndUpdate(
    { _id: userId, $expr: { $or: [cycleExpired, { $gte: [balanceOrDefault, amount] }] } },
    [{
      $set: {
        plannerTokenBalance: { $subtract: [{ $cond: [cycleExpired, DEFAULT_DAILY_BALANCE, balanceOrDefault] }, amount] },
        plannerTokenCycleStartedAt: { $cond: [startNewCycle, "$$NOW", "$plannerTokenCycleStartedAt"] },
        plannerTokenResetAt: { $cond: [startNewCycle, { $add: ["$$NOW", 60 * 60 * 1000] }, "$plannerTokenResetAt"] },
      },
    }],
    // Mongoose 9 zahteva eksplicitnu dozvolu za MongoDB update pipeline (niz u trećem argumentu).
    { new: true, updatePipeline: true },
  );
}

async function reconcileTokens(userId, reserved, actual) {
  const adjustment = reserved - actual;
  if (adjustment === 0) return UserModel.findById(userId);

  // Pozitivan adjustment je refund; negativan je dodatna naplata stvarne potrošnje.
  return UserModel.findByIdAndUpdate(userId, { $inc: { plannerTokenBalance: adjustment } }, { new: true });
}

async function requestGroq(messages, maxTokens) {
  if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY nije podešen na serveru.");

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: PLAN_MODEL, messages, temperature: 0.3, max_tokens: maxTokens }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.error?.message || "Groq servis nije uspeo da generiše odgovor.");

  const content = payload?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Groq je vratio prazan odgovor.");
  return { content, usage: payload.usage || {} };
}

export const getPlannerBalance = async (req, res) => {
  const balance = getBalance(req.user);
  if (req.user.plannerTokenBalance === undefined) await UserModel.findByIdAndUpdate(req.user._id, { plannerTokenBalance: balance });
  return res.json({ balance, dailyLimit: DEFAULT_DAILY_BALANCE, used: DEFAULT_DAILY_BALANCE - balance, cycleStartedAt: req.user.plannerTokenCycleStartedAt || null, resetAt: req.user.plannerTokenResetAt || null });
};

export const listPlannerFolders = async (req, res) => {
  const folders = await PlannerFolderModel.aggregate([
    { $match: { userRef: new mongoose.Types.ObjectId(req.user._id) } },
    { $lookup: { from: "plannerplans", localField: "_id", foreignField: "folderRef", as: "plans" } },
    { $project: { name: 1, createdAt: 1, updatedAt: 1, planCount: { $size: "$plans" } } },
    { $sort: { updatedAt: -1, name: 1 } },
  ]);
  return res.json({ folders });
};

export const createPlannerFolder = async (req, res) => {
  const name = cleanText(req.body?.name, 80);
  if (!name) return res.status(400).json({ error: "Naziv foldera je obavezan." });
  try {
    const folder = await PlannerFolderModel.create({ userRef: req.user._id, name });
    return res.status(201).json({ folder });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ error: "Folder sa tim nazivom već postoji." });
    throw error;
  }
};

export const renamePlannerFolder = async (req, res) => {
  const name = cleanText(req.body?.name, 80);
  if (!name) return res.status(400).json({ error: "Naziv foldera je obavezan." });
  if (!mongoose.isObjectIdOrHexString(req.params.id)) return res.status(400).json({ error: "Neispravan identifikator foldera." });
  try {
    const folder = await PlannerFolderModel.findOneAndUpdate({ _id: req.params.id, userRef: req.user._id }, { name }, { new: true, runValidators: true });
    if (!folder) return res.status(404).json({ error: "Folder nije pronađen." });
    return res.json({ folder });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ error: "Folder sa tim nazivom već postoji." });
    throw error;
  }
};

export const deletePlannerFolder = async (req, res) => {
  if (!mongoose.isObjectIdOrHexString(req.params.id)) return res.status(400).json({ error: "Neispravan identifikator foldera." });
  const folder = await PlannerFolderModel.findOne({ _id: req.params.id, userRef: req.user._id });
  if (!folder) return res.status(404).json({ error: "Folder nije pronađen." });

  // Planovi pripadaju isključivo ovom korisniku; zato brisanje foldera bezbedno briše i njegov sadržaj.
  const deletedPlans = await PlannerPlanModel.deleteMany({ userRef: req.user._id, folderRef: folder._id });
  await folder.deleteOne();
  return res.json({ deletedFolderId: req.params.id, deletedPlans: deletedPlans.deletedCount });
};

export const listPlannerPlans = async (req, res) => {
  const filter = { userRef: req.user._id };
  if (req.query.folderId) filter.folderRef = req.query.folderId;
  const plans = await PlannerPlanModel.find(filter).select("title topic folderRef updatedAt createdAt grade classType").sort({ updatedAt: -1 }).lean();
  return res.json({ plans });
};

export const getPlannerPlan = async (req, res) => {
  if (!mongoose.isObjectIdOrHexString(req.params.id)) return res.status(400).json({ error: "Neispravan identifikator plana." });
  const plan = await PlannerPlanModel.findOne({ _id: req.params.id, userRef: req.user._id }).lean();
  if (!plan) return res.status(404).json({ error: "Plan nije pronađen." });
  return res.json({ plan });
};

export const updatePlannerPlan = async (req, res) => {
  if (!mongoose.isObjectIdOrHexString(req.params.id)) return res.status(400).json({ error: "Neispravan identifikator plana." });
  const updates = {};

  if (Object.hasOwn(req.body || {}, "title")) {
    const title = cleanText(req.body.title, 200);
    if (!title) return res.status(400).json({ error: "Naziv plana je obavezan." });
    updates.title = title;
  }

  if (Object.hasOwn(req.body || {}, "folderId")) {
    const folderId = req.body.folderId || null;
    if (folderId && !mongoose.isObjectIdOrHexString(folderId)) return res.status(400).json({ error: "Neispravan identifikator foldera." });
    if (folderId && !(await PlannerFolderModel.exists({ _id: folderId, userRef: req.user._id }))) return res.status(404).json({ error: "Izabrani folder nije pronađen." });
    updates.folderRef = folderId;
  }

  if (!Object.keys(updates).length) return res.status(400).json({ error: "Nema izmena za čuvanje." });
  const plan = await PlannerPlanModel.findOneAndUpdate({ _id: req.params.id, userRef: req.user._id }, updates, { new: true, runValidators: true });
  if (!plan) return res.status(404).json({ error: "Plan nije pronađen." });
  return res.json({ plan });
};

export const deletePlannerPlan = async (req, res) => {
  if (!mongoose.isObjectIdOrHexString(req.params.id)) return res.status(400).json({ error: "Neispravan identifikator plana." });
  const result = await PlannerPlanModel.deleteOne({ _id: req.params.id, userRef: req.user._id });
  if (!result.deletedCount) return res.status(404).json({ error: "Plan nije pronađen." });
  return res.json({ deletedPlanId: req.params.id });
};

export const generatePlan = async (req, res) => {
  const topic = cleanText(req.body?.topic, 500);
  const grade = cleanText(req.body?.grade, 30);
  const schoolType = cleanText(req.body?.schoolType, 50);
  const classType = cleanText(req.body?.classType, 80);
  const language = cleanText(req.body?.language, 40) || "ruby";
  const previouslyCovered = Boolean(req.body?.previouslyCovered);
  const coveredHow = cleanText(req.body?.coveredHow, 1000);
  const folderId = req.body?.folderId || null;

  if (!topic || !grade || !schoolType || !classType) return res.status(400).json({ error: "Tema, razred, vrsta škole i tip časa su obavezni." });
  if (previouslyCovered && !coveredHow) return res.status(400).json({ error: "Opišite kako je tema ranije obrađivana." });
  if (folderId && !mongoose.isObjectIdOrHexString(folderId)) return res.status(400).json({ error: "Neispravan identifikator foldera." });
  if (folderId && !(await PlannerFolderModel.exists({ _id: folderId, userRef: req.user._id }))) return res.status(404).json({ error: "Izabrani folder nije pronađen." });

  const reservedUser = await reserveTokens(req.user._id, PLAN_RESERVATION);
  if (!reservedUser) return res.status(402).json({ error: "Nemate dovoljno tokena za generisanje plana.", required: PLAN_RESERVATION, available: getBalance(req.user) });

  try {
    const { content, usage } = await requestGroq([
      { role: "system", content: buildSystemPrompt({ grade, schoolType, classType, language, previouslyCovered, coveredHow }) },
      { role: "user", content: `Kreiraj detaljan plan rada i pripremu za čas na temu: ${topic}` },
    ], PLAN_RESERVATION);
    const totalTokens = Number(usage.total_tokens || usage.completion_tokens || PLAN_RESERVATION);
    const user = await reconcileTokens(req.user._id, PLAN_RESERVATION, totalTokens);
    const plan = await PlannerPlanModel.create({ userRef: req.user._id, folderRef: folderId, title: titleFromTopic(topic), content, topic, grade, schoolType, classType, language, previouslyCovered, coveredHow, model: PLAN_MODEL, usage: { promptTokens: usage.prompt_tokens || 0, completionTokens: usage.completion_tokens || 0, totalTokens } });
    return res.status(201).json({ plan, balance: getBalance(user), usage: plan.usage });
  } catch (error) {
    await reconcileTokens(req.user._id, PLAN_RESERVATION, 0); // kompletan refund ako Groq ili čuvanje ne uspe
    return res.status(502).json({ error: error.message || "Generisanje plana nije uspelo." });
  }
};

export const revisePlannerPlan = async (req, res) => {
  const instruction = cleanText(req.body?.instruction, 1000);
  if (!instruction) return res.status(400).json({ error: "Unesite instrukciju za izmenu plana." });
  if (!mongoose.isObjectIdOrHexString(req.params.id)) return res.status(400).json({ error: "Neispravan identifikator plana." });
  const plan = await PlannerPlanModel.findOne({ _id: req.params.id, userRef: req.user._id });
  if (!plan) return res.status(404).json({ error: "Plan nije pronađen." });

  const reservedUser = await reserveTokens(req.user._id, PLAN_RESERVATION);
  if (!reservedUser) return res.status(402).json({ error: "Nemate dovoljno tokena za izmenu plana.", required: PLAN_RESERVATION, available: getBalance(req.user) });

  try {
    const { content, usage } = await requestGroq([
      { role: "system", content: "Ti si IskraAI. Vrati kompletnu, izmenjenu verziju postojećeg nastavnog plana u Markdown-u. Sačuvaj korisne delove, primeni instrukciju i ne dodaj meta-komentare." },
      { role: "user", content: `POSTOJEĆI PLAN:\n${plan.content}\n\nINSTRUKCIJA ZA IZMENU:\n${instruction}` },
    ], PLAN_RESERVATION);
    const totalTokens = Number(usage.total_tokens || usage.completion_tokens || PLAN_RESERVATION);
    const user = await reconcileTokens(req.user._id, PLAN_RESERVATION, totalTokens);
    plan.content = content;
    plan.usage = { promptTokens: usage.prompt_tokens || 0, completionTokens: usage.completion_tokens || 0, totalTokens };
    await plan.save();
    return res.json({ plan, balance: getBalance(user), usage: plan.usage });
  } catch (error) {
    await reconcileTokens(req.user._id, PLAN_RESERVATION, 0);
    return res.status(502).json({ error: error.message || "Izmena plana nije uspela." });
  }
};
