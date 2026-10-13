import { logEvent } from "./eventLogger.js";

export async function requestJudge(url, body, { language, req }) {
  const startedAt = process.hrtime.bigint();

  try {
    const response = await fetch(`${url}/run`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;

    logEvent({
      category: "grading",
      type: "grading.judge_response",
      severity: response.ok ? "info" : "warning",
      outcome: response.ok ? "success" : "failure",
      target: { type: "judge", ref: new URL(url).hostname },
      details: {
        language,
        result: response.ok ? "response_received" : "http_error",
        httpStatus: response.status,
        durationMs,
      },
    }, req);

    return { response, data };
  } catch (error) {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    logEvent({
      category: "grading",
      type: "grading.judge_failed",
      severity: "error",
      outcome: "failure",
      target: { type: "judge", ref: new URL(url).hostname },
      details: { language, result: "request_or_response_failed", durationMs },
      error,
    }, req);
    throw error;
  }
}
