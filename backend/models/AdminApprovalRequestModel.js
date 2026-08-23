import mongoose from "mongoose";

const schema = new mongoose.Schema({
  token: { type: String, required: true, unique: true, index: true },
  action: { type: String, required: true, enum: ["delete_class_students", "reset_class_progress", "delete_test_solutions"] },
  teacherRef: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  status: { type: String, enum: ["pending", "executing", "executed", "failed"], default: "pending", index: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  executedAt: { type: Date, default: null },
  result: { type: mongoose.Schema.Types.Mixed, default: null },
  failureReason: { type: String, default: null },
}, { timestamps: true });

export const AdminApprovalRequestModel = mongoose.model("AdminApprovalRequest", schema);
