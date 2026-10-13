import crypto from "crypto";
import { logEvent } from "../utilities/eventLogger.js";

export function eventRequestContext(req, res, next) {
  req.eventRequestId = crypto.randomUUID();
  req.eventStartedAt = process.hrtime.bigint();
  res.setHeader("x-request-id", req.eventRequestId);

  res.once("finish", () => {
    const elapsedMs = Number(process.hrtime.bigint() - req.eventStartedAt) / 1_000_000;
    req.eventStatusCode = res.statusCode;
    req.eventDurationMs = elapsedMs;

    if (res.statusCode === 429) {
      if (req.eventRateLimitLogged) return;
      logEvent({
        category: "rate_limit",
        type: "rate_limit.rejected",
        severity: "warning",
        outcome: "blocked",
        details: { httpStatus: 429, durationMs: elapsedMs },
        dedupe: true,
      }, req);
    } else if (res.statusCode >= 500) {
      if (req.eventErrorLogged) return;
      logEvent({
        category: "error",
        type: "http.server_error",
        severity: "error",
        outcome: "failure",
        details: { httpStatus: res.statusCode, durationMs: elapsedMs },
      }, req);
    } else if (elapsedMs >= 10_000) {
      logEvent({
        category: "availability",
        type: "http.slow_request",
        severity: "warning",
        outcome: "success",
        details: { httpStatus: res.statusCode, durationMs: elapsedMs, thresholdMs: 10_000 },
      }, req);
    }
  });

  next();
}

export function eventErrorHandler(error, req, res, next) {
  req.eventErrorLogged = true;
  const statusCode = Number.isInteger(error?.status) && error.status >= 400 && error.status <= 599 ? error.status : 500;
  req.eventStatusCode = statusCode;
  const rejectedLargeBody = statusCode === 413;
  logEvent({
    category: rejectedLargeBody ? "security" : "error",
    type: rejectedLargeBody ? "security.request_rejected" : "http.unhandled_error",
    severity: rejectedLargeBody ? "warning" : "error",
    outcome: rejectedLargeBody ? "blocked" : "failure",
    details: rejectedLargeBody ? { reason: "request_body_too_large", httpStatus: statusCode } : {},
    error,
  }, req);

  if (res.headersSent) return next(error);
  return res.status(statusCode >= 400 && statusCode < 600 ? statusCode : 500).json({
    message: rejectedLargeBody ? "Request body is too large." : "Internal server error.",
    requestId: req.eventRequestId,
  });
}
