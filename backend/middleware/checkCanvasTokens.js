import { UserModel } from "../models/UserModel.js";

// Canvas ima sopstveni kreditni fond. Rezervacija je atomska da paralelni
// zahtevi ne mogu oba da potroše isti preostali broj kredita.
export const CANVAS_GENERATION_COST = 10;
export const CANVAS_CREDIT_LIMIT = 50;

export const checkCanvasTokens = async (req, res, next) => {
  try {
    const requiredFields = ["predmet", "razred", "vrstaSkole", "tema"];
    if (requiredFields.some((field) => !String(req.body?.[field] || "").trim())) {
      return res.status(400).json({ success: false, message: "Predmet, razred, vrsta škole i tema su obavezni." });
    }

    const now = new Date();
    const balance = { $ifNull: ["$canvasTokenBalance", CANVAS_CREDIT_LIMIT] };
    const cycleExpired = { $and: [{ $ne: [{ $ifNull: ["$canvasTokenResetAt", null] }, null] }, { $lte: ["$canvasTokenResetAt", now] }] };
    const startCycle = { $or: [cycleExpired, { $eq: [{ $ifNull: ["$canvasTokenResetAt", null] }, null] }] };
    const user = await UserModel.findOneAndUpdate({
      _id: req.user._id,
      $expr: { $or: [cycleExpired, { $gte: [balance, CANVAS_GENERATION_COST] }] },
    }, [{ $set: {
      canvasTokenBalance: { $subtract: [{ $cond: [cycleExpired, CANVAS_CREDIT_LIMIT, balance] }, CANVAS_GENERATION_COST] },
      canvasTokenCycleStartedAt: { $cond: [startCycle, "$$NOW", "$canvasTokenCycleStartedAt"] },
      canvasTokenResetAt: { $cond: [startCycle, { $add: ["$$NOW", 60 * 60 * 1000] }, "$canvasTokenResetAt"] },
    } }], { new: true, updatePipeline: true });

    if (!user) {
      const currentUser = await UserModel.findById(req.user._id).select("canvasTokenBalance").lean();
      return res.status(403).json({
        success: false,
        message: "Nemate dovoljno kredita za generisanje Canvas mape.",
        required: CANVAS_GENERATION_COST,
        available: currentUser?.canvasTokenBalance ?? CANVAS_CREDIT_LIMIT,
      });
    }

    req.canvasTokenReservation = CANVAS_GENERATION_COST;
    req.canvasBalance = user.canvasTokenBalance;
    return next();
  } catch (error) {
    return next(error);
  }
};
