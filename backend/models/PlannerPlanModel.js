import mongoose from "mongoose";

const plannerPlanSchema = new mongoose.Schema(
  {
    userRef: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    folderRef: { type: mongoose.Schema.Types.ObjectId, ref: "PlannerFolder", default: null, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, required: true },
    topic: { type: String, required: true, trim: true, maxlength: 500 },
    grade: { type: String, required: true },
    schoolType: { type: String, required: true },
    classType: { type: String, required: true },
    language: { type: String, default: "ruby" },
    previouslyCovered: { type: Boolean, default: false },
    coveredHow: { type: String, default: "" },
    model: { type: String, required: true },
    usage: {
      promptTokens: { type: Number, default: 0 },
      completionTokens: { type: Number, default: 0 },
      totalTokens: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

plannerPlanSchema.index({ userRef: 1, updatedAt: -1 });

export const PlannerPlanModel = mongoose.model("PlannerPlan", plannerPlanSchema);
