import Groq from "groq-sdk";
import { UserModel } from "../models/UserModel.js";
import { CanvasMapModel } from "../models/CanvasMapModel.js";
import { CANVAS_CREDIT_LIMIT, CANVAS_GENERATION_COST } from "../middleware/checkCanvasTokens.js";

const CANVAS_MODEL = "openai/gpt-oss-120b";

const cleanText = (value, maxLength) => String(value || "").trim().slice(0, maxLength);
const extractMermaidCode = (content) => content.match(/```mermaid\s*([\s\S]*?)```/i)?.[1]?.trim() || content.trim();

// Uklanja prose koji je model eventualno dodao izvan Mermaid bloka. Pravila
// prompta i ovaj normalizator zajedno daju stabilan kod i za starije modele.
const normalizeMermaidCode = (content) => {
  const code = extractMermaidCode(content).replace(/\r/g, "");
  const graphStart = code.search(/^\s*(?:graph|flowchart)\s+(?:TD|LR)\b/im);
  if (graphStart < 0) return code.trim();
  return code.slice(graphStart)
    .split("\n")
    .filter((line) => !/^\s*(?:#|```|classDef\b|class\b|style\b|click\b|linkStyle\b|subgraph\b|end\b)/i.test(line))
    .join("\n")
    .trim();
};

// Canvas prihvata namerno uzak Mermaid podskup koji prompt i generiše. Time
// uhvatimo sintaksu koju Mermaid ne može da iscrta pre nego što mapa uđe u bazu.
const isValidCanvasMermaid = (code) => {
  const lines = code.split("\n").map((line) => line.trim()).filter(Boolean);
  if (!/^graph\s+(TD|LR)$/i.test(lines.shift() || "")) return false;
  if (lines.length < 2 || lines.length > 40) return false;
  const node = String.raw`[A-Z][A-Z0-9_]*(?:\["[^"\[\]{}\n]+"\]|\("[^"\[\]{}\n]+"\))?`;
  const connection = new RegExp(String.raw`^${node}(?:\s+-->\s+${node})+$`);
  return lines.every((line) => connection.test(line));
};

function buildSystemPrompt({ predmet, razred, vrstaSkole }) {
  return `Ti si Iskra Canvas AI, napredni modul edukativne platforme "Iskra" u Srbiji koji pretvara kompleksne školske lekcije u vizuelne dijagrame i mape uma.

### TVOJA KONTEKSTUALNA PODEŠAVANJA:
- Predmet: ${predmet}
- Razred: ${razred}
- Vrsta škole: ${vrstaSkole}

### TVOJA PRAVILA PONAŠANJA:
1. UNIVERZALNOST: Prilagodi rečnik i težinu koncepta predmetu ${predmet} za ${razred}. razred (${vrstaSkole}).
2. GLAVNI IZLAZ: Vrati ISKLJUČIVO jedan validan \`\`\`mermaid blok. Ne dodaj h1, uvod, zaključak ni bilo koji tekst van bloka.
3. VIZUELNA STRUKTURA: Prva linija mora biti tačno \`graph TD\` ili \`graph LR\`. Za identifikatore koristi samo A-Z, 0-9 i _. Svaka tekstualna oznaka mora biti pod navodnicima: \`A["Glavni pojam"] --> B("Kratak detalj")\`. Ne koristi \`subgraph\`, \`style\`, \`classDef\`, \`click\`, HTML, emoji niti znakove \`[\`, \`]\`, \`{\`, \`}\` unutar oznaka.
4. JEZIK: Sav tekst unutar grafikona mora biti na srpskom jeziku.
5. BEZ DODATNOG TEKSTA: Mapa ima 6–14 čvorova, kratke oznake (najviše 7 reči) i samo jednostavne veze \`-->\`. Nemoj pisati uvode niti zaključke.`;
}

export const generateCanvasMap = async (req, res) => {
  const predmet = cleanText(req.body?.predmet, 100);
  const razred = cleanText(req.body?.razred, 50);
  const vrstaSkole = cleanText(req.body?.vrstaSkole, 100);
  const tema = cleanText(req.body?.tema, 500);

  if (!predmet || !razred || !vrstaSkole || !tema) {
    // Middleware je već napravio rezervaciju; nevalidan zahtev se refundira.
    await UserModel.findByIdAndUpdate(req.user._id, { $inc: { canvasTokenBalance: CANVAS_GENERATION_COST } });
    return res.status(400).json({ success: false, message: "Predmet, razred, vrsta škole i tema su obavezni." });
  }

  try {
    if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY nije podešen na serveru.");

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      model: CANVAS_MODEL,
      messages: [
        { role: "system", content: buildSystemPrompt({ predmet, razred, vrstaSkole }) },
        { role: "user", content: `Napravi vizuelnu mapu uma za lekciju: ${tema}.` },
      ],
      temperature: 0.2,
      max_tokens: 3000,
    });

    const data = completion.choices?.[0]?.message?.content?.trim();
    if (!data) throw new Error("Groq je vratio prazan odgovor.");

    const mermaidCode = normalizeMermaidCode(data);
    if (!isValidCanvasMermaid(mermaidCode)) {
      throw new Error("Generisana mapa nema važeću Mermaid sintaksu. Canvas krediti su refundirani.");
    }
    const map = await CanvasMapModel.create({
      userRef: req.user._id, title: tema.slice(0, 200), topic: tema, subject: predmet,
      grade: razred, schoolType: vrstaSkole, content: data, mermaidCode, model: CANVAS_MODEL,
      usage: { promptTokens: completion.usage?.prompt_tokens || 0, completionTokens: completion.usage?.completion_tokens || 0, totalTokens: completion.usage?.total_tokens || 0 },
    });

    return res.status(201).json({
      success: true,
      map,
      // Kredit je već atomski skinut u middleware-u, pre poziva ka Groq-u.
      newBalance: req.canvasBalance,
      cost: CANVAS_GENERATION_COST,
      usage: map.usage,
    });
  } catch (error) {
    // Kada Groq ili obrada odgovora ne uspeju, vraćamo kompletnu rezervaciju.
    const user = await UserModel.findByIdAndUpdate(
      req.user._id,
      { $inc: { canvasTokenBalance: req.canvasTokenReservation || CANVAS_GENERATION_COST } },
      { new: true },
    );
    console.error("Groq Canvas Error:", error);
    const message = error.message?.includes("Mermaid sintaksu")
      ? error.message
      : "Greška prilikom generisanja mape. Canvas krediti su refundirani.";
    return res.status(502).json({ success: false, message, newBalance: user?.canvasTokenBalance, refunded: true });
  }
};

export const getCanvasBalance = async (req, res) => {
  const user = await UserModel.findById(req.user._id).select("canvasTokenBalance canvasTokenCycleStartedAt canvasTokenResetAt").lean();
  return res.json({ balance: user?.canvasTokenBalance ?? CANVAS_CREDIT_LIMIT, limit: CANVAS_CREDIT_LIMIT, resetAt: user?.canvasTokenResetAt || null, cost: CANVAS_GENERATION_COST });
};

export const listCanvasMaps = async (req, res) => {
  const maps = await CanvasMapModel.find({ userRef: req.user._id }).select("title topic subject grade schoolType updatedAt createdAt").sort({ updatedAt: -1 }).lean();
  return res.json({ maps });
};

export const getCanvasMap = async (req, res) => {
  const map = await CanvasMapModel.findOne({ _id: req.params.id, userRef: req.user._id }).lean();
  if (!map) return res.status(404).json({ message: "Mapa nije pronađena." });
  return res.json({ map });
};

export const deleteCanvasMap = async (req, res) => {
  const result = await CanvasMapModel.deleteOne({ _id: req.params.id, userRef: req.user._id });
  if (!result.deletedCount) return res.status(404).json({ message: "Mapa nije pronađena." });
  return res.json({ deletedMapId: req.params.id });
};

export const renameCanvasMap = async (req, res) => {
  const title = cleanText(req.body?.title, 200);
  if (!title) return res.status(400).json({ message: "Naziv mape je obavezan." });
  const map = await CanvasMapModel.findOneAndUpdate({ _id: req.params.id, userRef: req.user._id }, { title }, { new: true, runValidators: true });
  if (!map) return res.status(404).json({ message: "Mapa nije pronađena." });
  return res.json({ map });
};
