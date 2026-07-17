import mongoose from "mongoose";

const plannerFolderSchema = new mongoose.Schema(
  {
    userRef: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
  },
  { timestamps: true },
);

plannerFolderSchema.index({ userRef: 1, name: 1 }, { unique: true });

export const PlannerFolderModel = mongoose.model("PlannerFolder", plannerFolderSchema);
