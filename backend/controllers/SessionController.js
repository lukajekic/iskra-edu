import { UserModel } from "../models/UserModel.js";
import { UserSessionModel } from "../models/UserSessionModel.js";
import { formatSession } from "../utilities/userSessions.js";
import mongoose from "mongoose";
import { logEvent } from "../utilities/eventLogger.js";

const now = () => new Date();
const sessionFilter = (userId, scope, authVersion) => ({
  userRef: userId,
  scope,
  authVersion: authVersion || 0,
  revokedAt: null,
  expiresAt: { $gt: now() },
});
const authVersionFor = (user, scope) => scope === "portal"
  ? (user.portal_access_data?.auth_version || 0)
  : (user.auth_version || 0);
const publicSessions = (sessions, currentId) => sessions.map((session) => formatSession(session, currentId));

export async function getMySessions(req, res) {
  const scope = req.user.type === "portal" ? "portal" : "standard";
  if (req.user.type === "student_temp") return res.status(403).json({ message: "Ova opcija nije dostupna za privremene učeničke naloge." });
  const sessions = await UserSessionModel.find(sessionFilter(req.user._id, scope, authVersionFor(req.user, scope))).sort({ createdAt: -1 }).lean();
  return res.status(200).json({ sessions: publicSessions(sessions, req.sessionId) });
}

export async function revokeMySession(req, res) {
  const scope = req.user.type === "portal" ? "portal" : "standard";
  if (req.user.type === "student_temp") return res.status(403).json({ message: "Ova opcija nije dostupna za privremene učeničke naloge." });
  if (!mongoose.isValidObjectId(req.params.sessionId)) return res.status(400).json({ message: "Neispravna oznaka sesije." });
  const result = await UserSessionModel.deleteOne({
    _id: req.params.sessionId,
    userRef: req.user._id,
    scope,
    revokedAt: null,
    expiresAt: { $gt: now() },
  });
  if (!result.deletedCount) return res.status(404).json({ message: "Sesija nije pronađena ili je već odjavljena." });
  logEvent({ category: "auth", type: "auth.session_revoked", severity: "info", outcome: "success", details: { reason: "user_revoked_one_session" } }, req);
  return res.status(200).json({ success: true, currentRevoked: String(req.params.sessionId) === String(req.sessionId) });
}

export async function revokeAllMySessions(req, res) {
  const scope = req.user.type === "portal" ? "portal" : "standard";
  if (req.user.type === "student_temp") return res.status(403).json({ message: "Ova opcija nije dostupna za privremene učeničke naloge." });
  if (scope === "portal") {
    await UserModel.updateOne({ _id: req.user._id }, { $inc: { "portal_access_data.auth_version": 1 } });
  } else {
    await UserModel.updateOne({ _id: req.user._id }, { $inc: { auth_version: 1 } });
  }
  await UserSessionModel.deleteMany({ userRef: req.user._id, scope });
  logEvent({ category: "auth", type: "auth.sessions_revoked", severity: "info", outcome: "success", details: { reason: "user_revoked_all_sessions" } }, req);
  return res.status(200).json({ success: true, currentRevoked: true });
}

async function getTeacherStudent(req, res) {
  if (req.user.type !== "teacher") return null;
  if (!mongoose.isValidObjectId(req.params.studentId)) {
    res.status(404).json({ message: "Trajni učenički nalog nije pronađen." });
    return null;
  }
  const student = await UserModel.findOne({
    _id: req.params.studentId,
    teacherRef: req.user._id,
    type: { $in: ["student", "student_permanent"] },
  }).select("_id username name type auth_version").lean();
  if (!student) return res.status(404).json({ message: "Trajni učenički nalog nije pronađen." });
  return student;
}

export async function getTeacherStudentSessions(req, res) {
  const student = await getTeacherStudent(req, res);
  if (res.headersSent) return;
  if (!student) return res.status(403).json({ message: "Samo nastavnik može upravljati sesijama svojih učenika." });
  const sessions = await UserSessionModel.find(sessionFilter(student._id, "standard", student.auth_version)).sort({ createdAt: -1 }).lean();
  return res.status(200).json({ user: { id: student._id, name: student.name, username: student.username }, sessions: publicSessions(sessions, null) });
}

export async function teacherRevokeStudentSessions(req, res) {
  const student = await getTeacherStudent(req, res);
  if (res.headersSent) return;
  if (!student) return res.status(403).json({ message: "Samo nastavnik može upravljati sesijama svojih učenika." });
  await UserModel.updateOne({ _id: student._id, teacherRef: req.user._id }, { $inc: { auth_version: 1 } });
  await UserSessionModel.deleteMany({ userRef: student._id, scope: "standard" });
  logEvent({ category: "auth", type: "auth.sessions_revoked", severity: "info", outcome: "success", details: { reason: "teacher_revoked_student_sessions" } }, req);
  return res.status(200).json({ success: true });
}

export async function searchUserSessions(req, res) {
  const username = typeof req.query.username === "string" ? req.query.username.trim() : "";
  if (username.length < 2) return res.status(400).json({ message: "Unesite najmanje dva znaka korisničkog imena." });
  const escaped = username.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const users = await UserModel.find({ username: { $regex: `^${escaped}`, $options: "i" }, type: { $ne: "student_temp" } })
    .select("_id username name type auth_version portal_access_data.auth_version")
    .limit(20)
    .lean();
  const results = await Promise.all(users.map(async (user) => {
    const scope = user.type === "portal" ? "portal" : "standard";
    const sessions = await UserSessionModel.find(sessionFilter(user._id, scope, authVersionFor(user, scope))).sort({ createdAt: -1 }).lean();
    return {
      user: { id: String(user._id), username: user.username, name: user.name || user.username, type: user.type },
      sessions: publicSessions(sessions, req.sessionId && String(user._id) === String(req.user._id) ? req.sessionId : null),
    };
  }));
  return res.status(200).json({ results });
}

export async function adminRevokeSession(req, res) {
  if (!mongoose.isValidObjectId(req.params.sessionId)) return res.status(400).json({ message: "Neispravna oznaka sesije." });
  const session = await UserSessionModel.findOne({ _id: req.params.sessionId, revokedAt: null, expiresAt: { $gt: now() } });
  if (!session) return res.status(404).json({ message: "Sesija nije pronađena ili je već odjavljena." });
  const user = await UserModel.findById(session.userRef).select("type");
  if (!user || user.type === "student_temp") return res.status(404).json({ message: "Korisnik ili sesija nisu pronađeni." });
  await UserSessionModel.deleteOne({ _id: session._id });
  logEvent({ category: "auth", type: "auth.session_revoked", severity: "info", outcome: "success", details: { reason: "portal_admin_revoked_one_session" } }, req);
  return res.status(200).json({ success: true });
}

export async function adminRevokeAllUserSessions(req, res) {
  if (!mongoose.isValidObjectId(req.params.userId)) return res.status(400).json({ message: "Neispravna oznaka korisnika." });
  const user = await UserModel.findOne({ _id: req.params.userId, type: { $ne: "student_temp" } });
  if (!user) return res.status(404).json({ message: "Korisnik nije pronađen." });
  const scope = user.type === "portal" ? "portal" : "standard";
  if (scope === "portal") {
    await UserModel.updateOne({ _id: user._id }, { $inc: { "portal_access_data.auth_version": 1 } });
  } else {
    await UserModel.updateOne({ _id: user._id }, { $inc: { auth_version: 1 } });
  }
  await UserSessionModel.deleteMany({ userRef: user._id, scope });
  logEvent({ category: "auth", type: "auth.sessions_revoked", severity: "info", outcome: "success", details: { reason: "portal_admin_revoked_all_sessions" } }, req);
  return res.status(200).json({ success: true });
}
