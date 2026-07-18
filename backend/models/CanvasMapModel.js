import mongoose from "mongoose";

const canvasMapSchema = new mongoose.Schema({
  userRef: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  topic: { type: String, required: true, trim: true, maxlength: 500 },
  subject: { type: String, required: true, trim: true, maxlength: 100 },
  grade: { type: String, required: true, maxlength: 50 },
  schoolType: { type: String, required: true, maxlength: 100 },
  content: { type: String, required: true },
  mermaidCode: { type: String, required: true },
  model: { type: String, required: true },
  usage: {
    promptTokens: { type: Number, default: 0 },
    completionTokens: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
  },
}, { timestamps: true });

canvasMapSchema.index({ userRef: 1, updatedAt: -1 });

export const CanvasMapModel = mongoose.model("CanvasMap", canvasMapSchema);
