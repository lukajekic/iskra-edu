import mongoose from "mongoose";

const testCaseSchema = new mongoose.Schema({
  // Empty stdin and empty expected output are both valid test cases.
  input: { type: String, default: "" },
  expectedOutput: { type: String, default: "" },
}, { _id: false });

const judgeResultSchema = new mongoose.Schema({
  token: { type: String, required: true },
  caseIndex: { type: Number, required: true },
  statusId: Number,
  statusDescription: String,
  stdout: String,
  stderr: String,
  compileOutput: String,
  message: String,
  exitCode: Number,
  time: Number,
  memory: Number,
  finishedAt: Date,
}, { _id: false });

const submissionJobSchema = new mongoose.Schema({
  kind: { type: String, enum: ["practice", "exam"], required: true },
  ownerRef: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  taskRef: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
  solutionRef: { type: mongoose.Schema.Types.ObjectId, ref: "Solution" },
  questionRef: { type: mongoose.Schema.Types.ObjectId },
  practiceSolutionId: String,
  maxPoints: Number,
  caseCount: { type: Number, default: 0 },
  priority: { type: Number, default: 10, index: true },
  language: { type: String, enum: ["python", "ruby"], required: true },
  sourceCode: { type: String, required: true, select: false },
  cases: { type: [testCaseSchema], required: true, select: false },
  status: { type: String, enum: ["queued", "dispatching", "running", "finalizing", "completed", "failed"], default: "queued", index: true },
  completionStatus: { type: String, enum: ["completed", "failed"] },
  attempts: { type: Number, default: 0 },
  leaseUntil: Date,
  availableAt: { type: Date, default: Date.now },
  nextPollAt: { type: Date, default: Date.now },
  judgeSubmissions: { type: [judgeResultSchema], default: [] },
  result: {
    correct: Boolean,
    pointsAwarded: Number,
    feedback: String,
    failedTestIndex: Number,
    expectedOutput: String,
    actualOutput: String,
    failureKind: String,
  },
  lastError: String,
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

submissionJobSchema.index({ status: 1, priority: 1, availableAt: 1, createdAt: 1 });
submissionJobSchema.index({ ownerRef: 1, _id: 1 });
submissionJobSchema.index({ "judgeSubmissions.token": 1 });
submissionJobSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const SubmissionJobModel = mongoose.model("SubmissionJob", submissionJobSchema);
