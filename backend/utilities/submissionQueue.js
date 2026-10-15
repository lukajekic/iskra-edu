import crypto from "node:crypto";
import mongoose from "mongoose";
import { UserModel } from "../models/UserModel.js";
import { SolutionModel } from "../models/TestSolutionModel.js";
import { SubmissionJobModel } from "../models/SubmissionJobModel.js";
import { createJudgeBatch, getJudgeBatch, normalizeJudgeResult } from "./judge0.js";
import { logEvent } from "./eventLogger.js";

const MAX_ATTEMPTS = 4;
const JOB_TTL_DAYS = 30;
// Yield regularly so newly arriving exam jobs can jump ahead of practice backlog.
const MAX_DISPATCHES_PER_CYCLE = 5;
const RETRYABLE_HTTP = new Set([408, 429, 500, 502, 503, 504]);
let pumping = false;
let workerTimer;

function reconciliationIntervalMs() {
  return process.env.JUDGE0_CALLBACK_BASE_URL ? 15_000 : 4_000;
}

function expiryDate() {
  return new Date(Date.now() + JOB_TTL_DAYS * 24 * 60 * 60 * 1000);
}

export async function createSubmissionJob(data) {
  const job = await SubmissionJobModel.create({
    ...data,
    priority: data.kind === "exam" ? 0 : 10,
    status: "queued",
    attempts: 0,
    availableAt: new Date(),
    nextPollAt: new Date(),
    expiresAt: expiryDate(),
  });
  console.log('JOB:', job)
  return job;
}

export function kickSubmissionQueue() {
  if (pumping || mongoose.connection.readyState !== 1) return;
  setImmediate(() => { void pumpQueue(); });
}

export function startSubmissionQueue() {
  if (workerTimer) return;
  workerTimer = setInterval(kickSubmissionQueue, 4_000);
  workerTimer.unref?.();
  kickSubmissionQueue();
}

async function pumpQueue() {
  if (pumping || mongoose.connection.readyState !== 1) return;
  pumping = true;
  try {
    const now = new Date();
    // Backfill jobs created before queue priorities were introduced.
    await SubmissionJobModel.updateMany({ kind: "exam", priority: { $exists: false } }, { $set: { priority: 0 } });
    await SubmissionJobModel.updateMany({ kind: "practice", priority: { $exists: false } }, { $set: { priority: 10 } });
    const interruptedFinalization = await SubmissionJobModel.findOne({ status: "finalizing" }).sort({ updatedAt: 1 });
    if (interruptedFinalization) await continueFinalization(interruptedFinalization);
    await SubmissionJobModel.updateMany(
      { status: "dispatching", leaseUntil: { $lte: now } },
      { $set: { status: "queued", availableAt: now }, $unset: { leaseUntil: 1 } },
    );

    let dispatchedThisCycle = 0;
    while (dispatchedThisCycle < MAX_DISPATCHES_PER_CYCLE) {
      const job = await SubmissionJobModel.findOneAndUpdate(
        { status: "queued", availableAt: { $lte: new Date() }, attempts: { $lt: MAX_ATTEMPTS } },
        { $set: { status: "dispatching", leaseUntil: new Date(Date.now() + 60_000) }, $inc: { attempts: 1 } },
        { new: true, sort: { priority: 1, availableAt: 1, createdAt: 1 } },
      ).select("+sourceCode +cases");

      if (!job) break;

      try {
        const tokens = await createJudgeBatch({
          jobId: job._id,
          language: job.language,
          sourceCode: job.sourceCode,
          cases: job.cases,
        });
        job.judgeSubmissions = tokens.map(({ token, caseIndex }) => ({ token, caseIndex }));
        job.status = "running";
        job.nextPollAt = new Date();
        job.leaseUntil = undefined;
        job.lastError = undefined;
        await job.save();
        logEvent({
          category: "grading",
          type: "grading.judge0_submitted",
          severity: "info",
          outcome: "success",
          target: { type: "judge", ref: new URL(process.env.JUDGE0_BASE_URL).hostname },
          details: { language: job.language, result: "batch_submitted", queueWaitMs: Date.now() - job.createdAt.getTime() },
        });
        dispatchedThisCycle += 1;
      } catch (error) {
        const diagnostic = safeError(error);
        console.error("Judge0 batch submission failed:", diagnostic);
        logEvent({
          category: "grading",
          type: "grading.judge0_failed",
          severity: "error",
          outcome: "failure",
          target: { type: "judge", ref: process.env.JUDGE0_BASE_URL ? new URL(process.env.JUDGE0_BASE_URL).hostname : "judge0" },
          details: {
            language: job.language,
            result: "batch_submit_failed",
            httpStatus: Number(error.status) || 0,
            reason: diagnostic.toLowerCase().replace(/[^a-z0-9_.:-]+/g, "_").slice(0, 80),
          },
          error,
        });
        const retryable = error.retryable || RETRYABLE_HTTP.has(error.status);
        job.lastError = safeError(error);
        job.leaseUntil = undefined;
        if (retryable && job.attempts < MAX_ATTEMPTS) {
          job.status = "queued";
          job.availableAt = new Date(Date.now() + Math.min(30_000, 1_000 * (2 ** (job.attempts - 1))));
          await job.save();
          break;
        }
        await failJob(job, "judge_unavailable");
        dispatchedThisCycle += 1;
      }
    }
    if (dispatchedThisCycle === MAX_DISPATCHES_PER_CYCLE) setImmediate(kickSubmissionQueue);
  } catch (error) {
    console.error("Judge0 queue pump error:", safeError(error));
  } finally {
    pumping = false;
  }
}

function safeError(error) {
  if (Number(error?.status) === 401 || Number(error?.status) === 403) return "Judge0 authentication or authorization failed.";
  if (Number(error?.status) === 429) return "Judge0 rate limit reached.";
  if (Number(error?.status) >= 500) return "Judge0 is temporarily unavailable.";
  if (error?.providerMessage) return `Judge0 rejected the request: ${error.providerMessage}`;
  return String(error?.message || "Judge0 request failed.").slice(0, 300);
}

function normalizeOutput(value = "") {
  return String(value).replace(/\r\n/g, "\n").replace(/\n$/, "");
}

function evaluate(job) {
  const cases = job.cases || [];
  const ordered = [...(job.judgeSubmissions || [])].sort((a, b) => a.caseIndex - b.caseIndex);
  const failed = ordered.find((entry) => {
    const expected = cases[entry.caseIndex]?.expectedOutput ?? "";
    return entry.statusId !== 3 || normalizeOutput(entry.stdout) !== normalizeOutput(expected);
  });

  if (!failed) {
    return { correct: true, pointsAwarded: job.kind === "exam" ? job.maxPoints : undefined, feedback: "Rešenje je ispravno." };
  }

  let failureKind = "wrong_answer";
  let feedback = "Sintaksa koda je u redu, ali se izlaz ne poklapa sa očekivanim rezultatom.";
  let actualOutput = failed.stdout || "";
  if (failed.statusId === 6) {
    failureKind = "compile_error";
    feedback = "Kompajliranje nije uspelo. Proveri sintaksu i pokušaj ponovo.";
    actualOutput = failed.compileOutput || failed.stderr || failed.message || "";
  } else if (failed.statusId === 5) {
    failureKind = "time_limit";
    feedback = "Program je prekoračio vremensko ograničenje.";
  } else if (failed.statusId > 3) {
    failureKind = "runtime_error";
    feedback = "Program se nije uspešno završio.";
    actualOutput = failed.stderr || failed.message || failed.statusDescription || "";
  }

  return {
    correct: false,
    pointsAwarded: 0,
    feedback,
    failedTestIndex: failed.caseIndex,
    expectedOutput: cases[failed.caseIndex]?.expectedOutput ?? "",
    actualOutput: String(actualOutput).slice(0, 8_000),
    failureKind,
  };
}

async function continueFinalization(job) {
  const terminalStatus = job.completionStatus || "completed";
  const result = job.result || {};

  if (job.kind === "practice") {
    const user = await UserModel.findById(job.ownerRef);
    const solution = user?.solutions?.find((item) => item.solutionID === job.practiceSolutionId);
    if (user && solution) {
      solution.status = terminalStatus === "completed" ? (result.correct ? "accepted" : "revise") : "revise";
      solution.stderr = terminalStatus === "completed"
        ? (result.correct ? "" : result.feedback)
        : "Ocenjivanje trenutno nije dostupno. Pokušaj ponovo kasnije.";
      solution.dev_ocekivani_output = result.expectedOutput;
      solution.dev_output = result.actualOutput;
      solution.grading_date = new Date();
      await user.save();

      const io = globalThis.__iskraSocketIO;
      io?.to(String(job.ownerRef)).emit("solution_status_update", {
        task: String(job.taskRef),
        status: solution.status,
        grading_date: solution.grading_date,
        stderr: solution.stderr,
        stdok: solution.stdok,
        dev_ocekivani_output: solution.dev_ocekivani_output,
        dev_output: solution.dev_output,
        // Offer the AI mentor after an unsuccessful check. The client then
        // calls the eligibility endpoint before showing the help dialog.
        ai_modal: solution.status === "revise",
      });
      if (result.correct && user.teacherRef) {
        io?.to(String(user.teacherRef)).emit("increment_progress", { studentid: String(user._id) });
      }
    }
  } else if (job.solutionRef && job.questionRef) {
    const solution = await SolutionModel.findById(job.solutionRef);
    const answer = solution?.answers?.find((item) => String(item.question_id) === String(job.questionRef));
    if (solution && answer) {
      answer.status = terminalStatus === "completed" ? (result.correct ? "correct" : "incorrect") : "grading_error";
      answer.points_awarded = terminalStatus === "completed" ? (result.pointsAwarded || 0) : 0;
      answer.feedback = terminalStatus === "completed" ? result.feedback : "Ocenjivanje trenutno nije dostupno. Pokušaj ponovo kasnije.";
      answer.grading_job_id = null;
      solution.markModified("answers");
      await solution.save();
      const io = globalThis.__iskraSocketIO;
      io?.to(String(job.solutionRef)).emit("update_exam_solution_status", {
        tasktype: "Task",
        status: terminalStatus === "failed" ? "grading_error" : (result.correct ? "correct" : "incorrect"),
        id: String(job.questionRef),
        jobId: String(job._id),
        points_awarded: terminalStatus === "completed" ? (result.pointsAwarded || 0) : 0,
        feedback: terminalStatus === "completed" ? (result.feedback || "") : "Ocenjivanje trenutno nije dostupno. Pokušaj ponovo kasnije.",
      });
    }
  }

  await SubmissionJobModel.updateOne(
    { _id: job._id, status: "finalizing" },
    { $set: { status: terminalStatus, expiresAt: expiryDate() }, $unset: { completionStatus: 1, leaseUntil: 1 } },
  );
  logEvent({
    category: "grading",
    type: terminalStatus === "completed" ? "grading.judge0_completed" : "grading.judge0_failed",
    severity: terminalStatus === "completed" ? "info" : "error",
    outcome: terminalStatus === "completed" ? "success" : "failure",
    target: { type: "judge", ref: process.env.JUDGE0_BASE_URL ? new URL(process.env.JUDGE0_BASE_URL).hostname : "judge0" },
    details: {
      language: job.language,
      result: terminalStatus === "completed" ? (result.correct ? "accepted" : "rejected") : "provider_failed",
      executionMs: Math.round((job.judgeSubmissions || []).reduce((total, item) => total + (Number(item.time) || 0), 0) * 1000),
    },
  });
}

async function applyResult(job, result, terminalStatus = "completed") {
  const stored = await SubmissionJobModel.findOneAndUpdate(
    { _id: job._id, status: { $in: ["running", "dispatching", "queued"] } },
    {
      $set: {
        status: "finalizing",
        completionStatus: terminalStatus,
        result,
        expiresAt: expiryDate(),
        lastError: terminalStatus === "failed" ? result.feedback : null,
      },
      $unset: { sourceCode: 1, cases: 1, leaseUntil: 1 },
    },
    { new: true },
  );
  if (stored) await continueFinalization(stored);
}

async function failJob(job, failureKind) {
  await applyResult(job, {
    correct: false,
    pointsAwarded: 0,
    feedback: failureKind === "judge_unavailable"
      ? "Ocenjivanje trenutno nije dostupno. Pokušaj ponovo kasnije."
      : "Ocenjivanje nije uspelo.",
    failureKind,
  }, "failed");
}

async function persistJudgeResults(jobId, results) {
  if (!results.length) return;
  const job = await SubmissionJobModel.findById(jobId).select("+cases");
  if (!job || job.status !== "running") return;

  const byToken = new Map(results.map((result) => [result.token, normalizeJudgeResult(result)]));
  job.judgeSubmissions = job.judgeSubmissions.map((entry) => {
    const updated = byToken.get(entry.token);
    return updated ? { ...entry.toObject(), ...updated, caseIndex: entry.caseIndex } : entry;
  });
  job.nextPollAt = new Date(Date.now() + reconciliationIntervalMs());
  await job.save();

  const allFinished = job.judgeSubmissions.length > 0 && job.judgeSubmissions.every((entry) => Number(entry.statusId) > 2);
  if (allFinished) {
    await applyResult(job, evaluate(job));
    kickSubmissionQueue();
  }
}

export async function acceptJudgeCallback(jobId, signature, result) {
  const secret = process.env.JUDGE0_CALLBACK_SECRET || process.env.JWT_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(String(jobId)).digest("hex");
  const actualBuffer = Buffer.from(String(signature));
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) return false;

  const normalized = normalizeJudgeResult(result);
  const job = await SubmissionJobModel.findOne({ _id: jobId, status: "running", "judgeSubmissions.token": normalized.token });
  if (!job) return false;
  await persistJudgeResults(jobId, [result]);
  kickSubmissionQueue();
  return true;
}

export async function getSubmissionJobStatus(jobId, ownerId) {
  let job = await SubmissionJobModel.findOne({ _id: jobId, ownerRef: ownerId });
  if (!job) return null;

  if (job.status === "queued") kickSubmissionQueue();
  if (job.status === "running" && job.nextPollAt <= new Date()) {
    const claimed = await SubmissionJobModel.findOneAndUpdate(
      { _id: job._id, status: "running", nextPollAt: { $lte: new Date() } },
      { $set: { nextPollAt: new Date(Date.now() + reconciliationIntervalMs()) } },
      { new: true },
    );
    if (claimed) {
      try {
        const current = await SubmissionJobModel.findById(job._id);
        const results = await getJudgeBatch(current.judgeSubmissions.map((item) => item.token));
        await persistJudgeResults(job._id, results);
      } catch (error) {
        // A later status request or a Judge0 callback retries reconciliation.
        console.error("Judge0 status reconciliation failed:", safeError(error));
        await SubmissionJobModel.updateOne({ _id: job._id, status: "running" }, { $set: { nextPollAt: new Date(Date.now() + Math.max(5_000, reconciliationIntervalMs())) } });
      }
    }
    job = await SubmissionJobModel.findById(job._id);
  }

  if (!job) return null;
  return {
    jobId: String(job._id),
    kind: job.kind,
    status: job.status,
    progress: {
      completed: job.judgeSubmissions.filter((item) => Number(item.statusId) > 2).length,
      total: job.judgeSubmissions.length || (job.status === "queued" ? job.caseCount : 0),
    },
    result: job.result ? {
      correct: job.result.correct,
      points_awarded: job.result.pointsAwarded,
      feedback: job.result.feedback,
      failed_test_index: job.result.failedTestIndex,
      expected_output: job.result.expectedOutput,
      actual_output: job.result.actualOutput,
      failure_kind: job.result.failureKind,
    } : undefined,
  };
}

export async function runJudgeCallback(req, res) {
  const accepted = await acceptJudgeCallback(req.params.jobId, req.query.signature, req.body);
  return res.sendStatus(accepted ? 204 : 404);
}
