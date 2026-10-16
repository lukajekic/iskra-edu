import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
  testId: { type: String, required: true },
  module: { type: String, enum: ["planner", "mentor", "canvas"], required: true },
  category: { type: String, required: true },
  title: { type: String, required: true },
  prompt: { type: String, required: true },
  expectedBehavior: { type: String, required: true },
  actualResult: { type: String, default: "" },
  status: { type: String, enum: ["passed", "failed", "review", "error"], required: true },
  rating: { type: String, enum: ["satisfactory", "unsatisfactory", null], default: null },
  reviewerNote: { type: String, default: "" },
  durationMs: { type: Number, default: 0 },
  model: { type: String, default: "" },
}, { _id: false });

const schema = new mongoose.Schema({
  suiteVersion: { type: String, required: true },
  startedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  startedByName: { type: String, default: "" },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  status: { type: String, enum: ["completed", "partial"], required: true },
  summary: {
    total: { type: Number, default: 0 },
    passed: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    review: { type: Number, default: 0 },
    errors: { type: Number, default: 0 },
    satisfactory: { type: Number, default: 0 },
    unsatisfactory: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
  },
  results: { type: [resultSchema], default: [] },
}, { timestamps: true });

schema.index({ startedAt: -1 });

export const AISafetyReportModel = mongoose.model("AISafetyReport", schema);
