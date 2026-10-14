import crypto from "crypto";
import mongoose from "mongoose";
import { EventLogModel } from "../models/EventLogModel.js";

const DETAIL_KEYS = new Set([
  "reason",
  "result",
  "language",
  "judge",
  "httpStatus",
  "durationMs",
  "queueWaitMs",
  "executionMs",
  "limit",
  "windowMs",
  "thresholdMs",
  "suppressed",
]);
const SAFE_ERROR_NAMES = new Set([
  "Error", "TypeError", "ReferenceError", "SyntaxError", "RangeError", "URIError", "EvalError",
  "AggregateError", "MongoServerError", "MongooseServerSelectionError", "MongoNetworkError",
  "CastError", "ValidationError", "AbortError", "FetchError",
]);
const SAFE_ERROR_CODES = /^(ERR_[A-Z0-9_]{1,60}|E[A-Z0-9_]{2,60}|[0-9]{3,6})$/;
const SAFE_SERVICES = new Set(["backend", "frontend", "judge"]);
const SAFE_TARGET_TYPES = new Set(["judge", "api", "database", "frontend", "backend", "process"]);
const EVENT_TYPES = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*){1,4}$/;
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_DEDUPE_KEYS = 5_000;
const MAX_PENDING_EVENTS = 1_000;
const EVENT_BATCH_SIZE = 50;
const dedupeState = new Map();
const pendingEvents = [];
let drainingEvents = false;
let lastStorageWarningAt = 0;

function getRetentionDays() {
  const configured = Number.parseInt(process.env.EVENT_LOG_RETENTION_DAYS || "30", 10);
  return Number.isFinite(configured) ? Math.min(365, Math.max(1, configured)) : 30;
}

function getHmacKey() {
  return process.env.EVENT_LOG_HMAC_SECRET || process.env.JWT_SECRET || "";
}

function pseudonymize(value, namespace) {
  const key = getHmacKey();
  if (!value || !key) return null;
  return crypto.createHmac("sha256", key).update(`${namespace}:${value}`).digest("hex");
}

function safeRoute(req) {
  const routePath = req.route?.path;
  if (typeof routePath !== "string") return null;
  const fullRoute = `${req.baseUrl || ""}${routePath}`;
  return fullRoute.slice(0, 200);
}

function getActorType(user) {
  if (!user) return "unknown";
  if (user.type === "student_temp" || user.type === "student_permanent") return "student";
  if (user.type === "teacher") return "teacher";
  if (["super_admin", "district", "school_main", "school_tenant"].includes(user.type)) return "admin";
  if (user.type === "portal") return "portal";
  return "unknown";
}

function safeDetails(details = {}) {
  const clean = {};
  for (const [key, value] of Object.entries(details || {})) {
    if (!DETAIL_KEYS.has(key)) continue;
    if (typeof value === "number" && Number.isFinite(value)) {
      clean[key] = Math.max(0, Math.min(value, 2_147_483_647));
    } else if (typeof value === "boolean") {
      clean[key] = value;
    } else if (typeof value === "string" && /^[a-zA-Z0-9_.:-]{1,80}$/.test(value)) {
      clean[key] = value;
    }
  }
  return clean;
}

function safeError(error) {
  if (!error) return {};
  const name = SAFE_ERROR_NAMES.has(error.name) ? error.name : "Error";
  const code = typeof error.code === "string" && SAFE_ERROR_CODES.test(error.code)
    ? error.code
    : Number.isInteger(error.code) && error.code >= 0 && error.code <= 999_999
      ? String(error.code)
      : null;
  const fingerprint = crypto
    .createHash("sha256")
    .update(`${name}:${code || "no-code"}`)
    .digest("hex");
  return { name, code, fingerprint };
}

function shouldDedupe(input, request) {
  if (!input.dedupe) return { allowed: true, suppressed: 0 };
  const sourceRef = request?.sourceRef || "unknown-source";
  const key = `${input.type}:${sourceRef}:${request?.route || "unknown-route"}`;
  const now = Date.now();
  const current = dedupeState.get(key);

  if (current && now - current.lastAt < RATE_LIMIT_WINDOW_MS) {
    current.suppressed += 1;
    return { allowed: false, suppressed: 0 };
  }

  let suppressed = current?.suppressed || 0;
  dedupeState.delete(key);
  if (dedupeState.size >= MAX_DEDUPE_KEYS) {
    const oldestKey = dedupeState.keys().next().value;
    if (oldestKey) dedupeState.delete(oldestKey);
  }
  dedupeState.set(key, { lastAt: now, suppressed: 0 });
  return { allowed: true, suppressed };
}

function warnStorageUnavailable() {
  const now = Date.now();
  if (now - lastStorageWarningAt < 60_000) return;
  lastStorageWarningAt = now;
  console.warn("Event log write skipped because MongoDB is unavailable.");
}

async function drainEventQueue() {
  if (drainingEvents) return;
  drainingEvents = true;
  try {
    while (pendingEvents.length > 0 && mongoose.connection.readyState === 1) {
      const batch = pendingEvents.splice(0, EVENT_BATCH_SIZE);
      try {
        await EventLogModel.insertMany(batch, { ordered: false });
      } catch {
        warnStorageUnavailable();
      }
    }
    if (pendingEvents.length > 0 && mongoose.connection.readyState !== 1) warnStorageUnavailable();
  } finally {
    drainingEvents = false;
    if (pendingEvents.length > 0 && mongoose.connection.readyState === 1) {
      queueMicrotask(() => { void drainEventQueue(); });
    }
  }
}

mongoose.connection.on("connected", () => {
  if (pendingEvents.length > 0 && !drainingEvents) queueMicrotask(() => { void drainEventQueue(); });
});


export function logEvent(input = {}, req = null) {
  try {
    if (!input || !EVENT_TYPES.test(input.type || "")) return;

    const user = req?.user;
    const sourceRef = pseudonymize(req?.ip, "source");
    const route = safeRoute(req);
    const requestDurationMs = Number.isFinite(req?.eventDurationMs)
      ? Math.round(req.eventDurationMs)
      : req?.eventStartedAt
        ? Math.round(Number(process.hrtime.bigint() - req.eventStartedAt) / 1_000_000)
        : null;
    const request = req
      ? {
          id: req.eventRequestId || null,
          method: typeof req.method === "string" ? req.method.slice(0, 10) : null,
          route,
          statusCode: Number.isInteger(req.eventStatusCode) ? req.eventStatusCode : null,
          durationMs: requestDurationMs,
          sourceRef,
        }
      : {};

    const dedupeResult = shouldDedupe(input, request);
    if (!dedupeResult.allowed) return;

    const details = safeDetails(input.details);
    if (dedupeResult.suppressed > 0) details.suppressed = dedupeResult.suppressed;

    const retentionMs = getRetentionDays() * 24 * 60 * 60 * 1000;
    const event = {
      schemaVersion: 1,
      eventId: crypto.randomUUID(),
      occurredAt: new Date(),
      expiresAt: new Date(Date.now() + retentionMs),
      category: input.category,
      type: input.type,
      severity: input.severity || "info",
      outcome: input.outcome || "success",
      service: SAFE_SERVICES.has(input.service) ? input.service : "backend",
      environment: ["development", "test", "production"].includes(process.env.NODE_ENV) ? process.env.NODE_ENV : "development",
      actor: {
        type: getActorType(user),
        ref: pseudonymize(user?._id?.toString?.(), "actor"),
      },
      request,
      target: {
        type: SAFE_TARGET_TYPES.has(input.target?.type) ? input.target.type : null,
        ref: typeof input.target?.ref === "string" && /^[a-zA-Z0-9_.:-]{1,80}$/.test(input.target.ref)
          ? input.target.ref
          : null,
      },
      details,
      error: safeError(input.error),
    };

    if (mongoose.connection.readyState !== 1) {
      warnStorageUnavailable();
      return;
    }

    if (pendingEvents.length >= MAX_PENDING_EVENTS) {
      const lowerPriorityIndex = pendingEvents.findIndex((pending) => pending.severity === "info" || pending.severity === "warning");
      if (input.severity === "fatal" || input.severity === "error") {
        if (lowerPriorityIndex >= 0) pendingEvents.splice(lowerPriorityIndex, 1);
        else {
          warnStorageUnavailable();
          return;
        }
      } else {
        warnStorageUnavailable();
        return;
      }
    }

    pendingEvents.push(event);
    if (!drainingEvents) queueMicrotask(() => { void drainEventQueue(); });
  } catch {
    // Logging must never break an application request or error handler.
  }
}

export function createRateLimitHandler({ type, limit, windowMs }) {
  return (req, res, _next, options) => {
    const statusCode = options.statusCode || 429;
    const resetTime = req.rateLimit?.resetTime;
    const existingRetryAfter = Number(res.getHeader("Retry-After"));
    const retryAfterSeconds = Math.max(1, Math.ceil(resetTime instanceof Date
      ? (resetTime.getTime() - Date.now()) / 1000
      : Number.isFinite(existingRetryAfter) && existingRetryAfter > 0
        ? existingRetryAfter
        : windowMs / 1000));
    req.eventRateLimitLogged = true;
    req.eventStatusCode = statusCode;
    logEvent({
      category: "rate_limit",
      type,
      severity: "warning",
      outcome: "blocked",
      details: { reason: "request_limit_exceeded", limit, windowMs, httpStatus: statusCode },
      dedupe: true,
    }, req);
    res.setHeader("Retry-After", String(retryAfterSeconds));
    return res.status(statusCode).json({
      ...(options.message && typeof options.message === "object" ? options.message : { message: options.message }),
      retryAfterSeconds,
    });
  };
}
