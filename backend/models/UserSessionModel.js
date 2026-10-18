import mongoose from "mongoose";

const schema = new mongoose.Schema({
  userRef: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  scope: { type: String, enum: ["standard", "portal"], required: true },
  authVersion: { type: Number, required: true, default: 0 },
  userAgent: { type: String, default: "Nepoznat uređaj", maxlength: 300 },
  createdAt: { type: Date, default: Date.now, required: true },
  expiresAt: { type: Date, required: true },
  revokedAt: { type: Date, default: null },
}, { versionKey: false, collection: "user_sessions" });

schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
schema.index({ userRef: 1, scope: 1, revokedAt: 1, expiresAt: 1 });

export const UserSessionModel = mongoose.model("UserSession", schema);
