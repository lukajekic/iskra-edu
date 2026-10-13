import mongoose from "mongoose";

const eventDetailsSchema = new mongoose.Schema(
  {
    reason: { type: String, maxlength: 80 },
    result: { type: String, maxlength: 80 },
    language: { type: String, maxlength: 80 },
    judge: { type: String, maxlength: 80 },
    httpStatus: { type: Number, min: 100, max: 599 },
    durationMs: { type: Number, min: 0 },
    queueWaitMs: { type: Number, min: 0 },
    executionMs: { type: Number, min: 0 },
    limit: { type: Number, min: 0 },
    windowMs: { type: Number, min: 0 },
    thresholdMs: { type: Number, min: 0 },
    suppressed: { type: Number, min: 0 },
  },
  { _id: false, strict: "throw" },
);

const eventLogSchema = new mongoose.Schema(
  {
    schemaVersion: { type: Number, required: true, default: 1 },
    eventId: { type: String, required: true, unique: true },
    occurredAt: { type: Date, required: true, default: Date.now },
    expiresAt: { type: Date, required: true },
    category: {
      type: String,
      required: true,
      enum: ["error", "grading", "auth", "security", "availability", "rate_limit"],
    },
    type: { type: String, required: true, maxlength: 80 },
    severity: { type: String, required: true, enum: ["info", "warning", "error", "fatal"] },
    outcome: { type: String, required: true, enum: ["success", "failure", "blocked", "timeout"] },
    service: { type: String, required: true, maxlength: 40 },
    environment: { type: String, required: true, maxlength: 40 },
    actor: {
      type: {
        type: String,
        enum: ["student", "teacher", "admin", "portal", "unknown", null],
        default: null,
      },
      ref: { type: String, default: null, maxlength: 64 },
    },
    request: {
      id: { type: String, default: null, maxlength: 64 },
      method: { type: String, default: null, maxlength: 10 },
      route: { type: String, default: null, maxlength: 200 },
      statusCode: { type: Number, default: null, min: 100, max: 599 },
      durationMs: { type: Number, default: null, min: 0 },
      sourceRef: { type: String, default: null, maxlength: 64 },
    },
    target: {
      type: { type: String, default: null, maxlength: 40 },
      ref: { type: String, default: null, maxlength: 80 },
    },
    details: { type: eventDetailsSchema, default: () => ({}) },
    error: {
      code: { type: String, default: null, maxlength: 80 },
      name: { type: String, default: null, maxlength: 80 },
      fingerprint: { type: String, default: null, maxlength: 64 },
    },
  },
  {
    collection: "event_logs",
    versionKey: false,
    strict: "throw",
    minimize: false,
  },
);

eventLogSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
eventLogSchema.index({ occurredAt: -1 });
eventLogSchema.index({ category: 1, occurredAt: -1 });
eventLogSchema.index({ type: 1, occurredAt: -1 });
eventLogSchema.index({ "request.id": 1 }, { partialFilterExpression: { "request.id": { $type: "string" } } });
eventLogSchema.index({ "request.sourceRef": 1, occurredAt: -1 }, { partialFilterExpression: { "request.sourceRef": { $type: "string" } } });
eventLogSchema.index({ "actor.ref": 1, occurredAt: -1 }, { partialFilterExpression: { "actor.ref": { $type: "string" } } });

export const EventLogModel = mongoose.model("EventLog", eventLogSchema);
