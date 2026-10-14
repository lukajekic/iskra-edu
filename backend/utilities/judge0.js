import { createHmac } from "node:crypto";

const DEFAULT_TIMEOUT_MS = 12_000;

function config() {
  const rawBaseUrl = process.env.JUDGE0_BASE_URL?.trim();
  if (!rawBaseUrl) throw new Error("Judge0 nije konfigurisan: nedostaje JUDGE0_BASE_URL.");
  const baseUrl = new URL(rawBaseUrl);
  if (baseUrl.protocol !== "https:" && baseUrl.hostname !== "localhost" && baseUrl.hostname !== "127.0.0.1") {
    throw new Error("Judge0 adresa mora koristiti HTTPS.");
  }

  const headers = { "Content-Type": "application/json", Accept: "application/json" };
  if (process.env.JUDGE0_AUTH_TOKEN) headers[process.env.JUDGE0_AUTH_TOKEN_HEADER || "X-Auth-Token"] = process.env.JUDGE0_AUTH_TOKEN;
  if (process.env.JUDGE0_AUTH_USER) headers[process.env.JUDGE0_AUTH_USER_HEADER || "X-Auth-User"] = process.env.JUDGE0_AUTH_USER;
  const rapidApiHost = process.env.JUDGE0_RAPIDAPI_HOST?.trim()
    || (baseUrl.hostname.endsWith(".rapidapi.com") ? baseUrl.hostname : "");
  if (rapidApiHost) headers["x-rapidapi-host"] = rapidApiHost;
  return { baseUrl: baseUrl.toString().replace(/\/$/, ""), headers };
}

export function languageId(language) {
  const name = String(language || "").toLowerCase();
  const value = name === "python"
    ? process.env.JUDGE0_PYTHON_LANGUAGE_ID || "71"
    : name === "ruby"
      ? process.env.JUDGE0_RUBY_LANGUAGE_ID || "72"
      : null;
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) throw new Error(`Judge0 nema podešen language_id za ${name || "nepoznat jezik"}.`);
  return id;
}

async function request(path, { method = "GET", body, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const { baseUrl, headers } = config();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
    const text = await response.text();
    let data;
    try { data = text ? JSON.parse(text) : null; }
    catch { throw new Error(`Judge0 je vratio neispravan JSON (HTTP ${response.status}).`); }
    if (!response.ok) {
      const error = new Error(`Judge0 zahtev nije uspeo (HTTP ${response.status}).`);
      error.status = response.status;
      error.retryable = response.status === 408 || response.status === 429 || response.status >= 500;
      const providerMessage = data && typeof data === "object"
        ? (data.error || data.message || data.detail || data.description)
        : null;
      if (typeof providerMessage === "string") error.providerMessage = providerMessage.replace(/[\r\n\t]+/g, " ").slice(0, 300);
      throw error;
    }
    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      const timeoutError = new Error("Judge0 nije odgovorio u predviđenom roku.");
      timeoutError.retryable = true;
      throw timeoutError;
    }
    if (error.status === undefined) error.retryable = true;
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function callbackUrl(jobId) {
  const base = process.env.JUDGE0_CALLBACK_BASE_URL?.trim();
  const secret = process.env.JUDGE0_CALLBACK_SECRET || process.env.JWT_SECRET;
  if (!base || !secret) return undefined;
  const signature = createHmac("sha256", secret).update(String(jobId)).digest("hex");
  return `${base.replace(/\/$/, "")}/internal/judge0/callback/${jobId}?signature=${signature}`;
}

function encodeText(value) {
  return Buffer.from(String(value ?? ""), "utf8").toString("base64");
}

function decodeText(value, encoded) {
  if (!encoded || !value) return value || "";
  try { return Buffer.from(value, "base64").toString("utf8"); }
  catch { return ""; }
}

export async function createJudgeBatch({ jobId, language, sourceCode, cases }) {
  if (!Array.isArray(cases) || cases.length === 0) throw new Error("Za ocenjivanje je potreban bar jedan test.");
  const lang = languageId(language);
  const callback = callbackUrl(jobId);
  const submissions = cases.map((testCase) => ({
    source_code: encodeText(sourceCode),
    language_id: lang,
    stdin: encodeText(testCase.input),
    cpu_time_limit: 3,
    cpu_extra_time: 1,
    wall_time_limit: 8,
    memory_limit: 131072,
    max_processes_and_or_threads: 20,
    enable_network: false,
    ...(callback ? { callback_url: callback } : {}),
  }));
  const result = await request("/submissions/batch?base64_encoded=true", {
    method: "POST",
    body: { submissions },
  });
  const tokens = Array.isArray(result) ? result : result?.submissions;
  if (!Array.isArray(tokens) || tokens.length !== cases.length || tokens.some((item) => !item?.token)) {
    throw new Error("Judge0 nije vratio token za svaki test.");
  }
  return tokens.map((item, caseIndex) => ({ token: item.token, caseIndex }));
}

export async function getJudgeBatch(tokens) {
  if (!tokens?.length) return [];
  const fields = "token,stdout,stderr,compile_output,message,exit_code,status,time,memory,finished_at";
  const query = new URLSearchParams({ tokens: tokens.join(","), base64_encoded: "true", fields });
  const result = await request(`/submissions/batch?${query.toString()}`);
  return (Array.isArray(result) ? result : (result?.submissions || [])).map((item) => ({ ...item, stdout: decodeText(item.stdout, true), stderr: decodeText(item.stderr, true), compile_output: decodeText(item.compile_output, true), message: decodeText(item.message, true) }));
}

export function normalizeJudgeResult(result) {
  const rawStatus = result?.status;
  return {
    token: result?.token,
    statusId: Number(rawStatus?.id || result?.status_id || 0),
    statusDescription: rawStatus?.description || "Unknown",
    stdout: result?.stdout || "",
    stderr: result?.stderr || "",
    compileOutput: result?.compile_output || "",
    message: result?.message || "",
    exitCode: result?.exit_code ?? null,
    time: result?.time ?? null,
    memory: result?.memory ?? null,
    finishedAt: result?.finished_at ? new Date(result.finished_at) : null,
  };
}

export async function executeJudge0({ language, sourceCode, stdin = "", timeoutSeconds = 5 }) {
  if (sourceCode.length > 100_000 || String(stdin).length > 100_000) {
    const error = new Error("Kod ili ulazni podaci su predugački.");
    error.status = 413;
    throw error;
  }
  const result = await request("/submissions?base64_encoded=true&wait=false", {
    method: "POST",
    body: {
      source_code: encodeText(sourceCode),
      language_id: languageId(language),
      stdin: encodeText(stdin),
      cpu_time_limit: Math.max(1, Math.min(Number(timeoutSeconds) || 5, 5)),
      cpu_extra_time: 1,
      wall_time_limit: 10,
      memory_limit: 131072,
      max_processes_and_or_threads: 20,
      enable_network: false,
    },
  });
  if (!result?.token) throw new Error("Judge0 nije vratio token izvršavanja.");

  const deadline = Date.now() + 30_000;
  let delay = 500;
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, delay));
    const fields = "token,stdout,stderr,compile_output,message,exit_code,status,time,memory";
    const submission = await request(`/submissions/${encodeURIComponent(result.token)}?base64_encoded=true&fields=${encodeURIComponent(fields)}`);
    const decoded = { ...submission, stdout: decodeText(submission.stdout, true), stderr: decodeText(submission.stderr, true), compile_output: decodeText(submission.compile_output, true), message: decodeText(submission.message, true) };
    const normalized = normalizeJudgeResult(decoded);
    if (normalized.statusId > 2) {
      return {
        ...normalized,
        stderr: normalized.stderr || normalized.compileOutput || (normalized.statusId === 3 ? "" : normalized.statusDescription),
      };
    }
    delay = Math.min(Math.round(delay * 1.5), 2000);
  }
  const error = new Error("Ocenjivač još obrađuje kod. Pokušaj ponovo za nekoliko sekundi.");
  error.status = 504;
  throw error;
}
