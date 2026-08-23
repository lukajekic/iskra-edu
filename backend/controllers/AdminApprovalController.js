import crypto from "crypto";
import { BuildValidationReturn } from "../utilities/ReturnValidationError.js";
import { AdminApprovalRequestModel } from "../models/AdminApprovalRequestModel.js";
import { UserModel } from "../models/UserModel.js";
import { SolutionModel } from "../models/TestSolutionModel.js";
import { TestModel } from "../models/TestModel.js";
import { ParentConsentModel } from "../models/ParentConsentModel.js";
import { MessageModel } from "../models/MessageModel.js";

const ACTIONS = {
  delete_class_students: "Trajno brisanje svih učenika odeljenja",
  reset_class_progress: "Reset napretka celog odeljenja",
  delete_test_solutions: "Brisanje svih rešenja testova",
};
const isSuperAdmin = (user) => user?.super_admin === true || user?.super_admin === "true";

export const createMassActionRequest = async (req, res) => {
  try {
    if (req.user.type !== "teacher") return res.status(403).json(BuildValidationReturn("Not Authorized.", "error", "Samo profesor može poslati zahtev."));
    const { action } = req.body || {};
    if (!ACTIONS[action]) return res.status(400).json(BuildValidationReturn("Invalid action.", "error", "Nepoznata masovna radnja."));

    await AdminApprovalRequestModel.updateMany(
      { teacherRef: req.user._id, action, status: "pending" },
      { $set: { status: "failed", failureReason: "Zamenjeno novijim zahtevom." } },
    );
    // Tačno 10 base64url znakova (60 bita entropije), namenjeno ručnom unosu uz rok od 2 minuta.
    const token = crypto.randomBytes(8).toString("base64url").slice(0, 10);
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);
    const request = await AdminApprovalRequestModel.create({ token, action, teacherRef: req.user._id, expiresAt });
    return res.status(201).json({ token, expiresAt, action, label: ACTIONS[action], requestId: request._id });
  } catch (error) {
    return res.status(500).json(BuildValidationReturn(error.message, "error", "Zahtev nije kreiran."));
  }
};

const executeApprovedAction = async (request, io) => {
  const teacherId = request.teacherRef;
  if (request.action === "delete_class_students") {
    const students = await UserModel.find({ teacherRef: teacherId, type: "student_permanent" }).select("_id").lean();
    const studentIds = students.map((student) => student._id);
    const studentIdStrings = studentIds.map((studentId) => studentId.toString());
    studentIdStrings.forEach((studentId) => io?.to(studentId).emit("account_deleted"));
    await Promise.all([
      SolutionModel.deleteMany({ student_ref: { $in: studentIds } }),
      ParentConsentModel.deleteMany({ studentRef: { $in: studentIds } }),
      MessageModel.deleteMany({ target: { $in: studentIdStrings } }),
      MessageModel.updateMany({}, { $pull: { read: { $in: studentIdStrings } } }),
      UserModel.deleteMany({ _id: { $in: studentIds } }),
    ]);
    return { deletedStudents: studentIds.length };
  }

  if (request.action === "reset_class_progress") {
    const students = await UserModel.find({ teacherRef: teacherId, type: "student_permanent" }).select("_id").lean();
    const studentIds = students.map((student) => student._id);
    const [users, testSolutions] = await Promise.all([
      UserModel.updateMany({ _id: { $in: studentIds } }, { $set: { solutions: [] } }),
      SolutionModel.deleteMany({ student_ref: { $in: studentIds } }),
    ]);
    return { resetStudents: users.modifiedCount, deletedTestSolutions: testSolutions.deletedCount };
  }

  const tests = await TestModel.find({ author: teacherId }).select("_id").lean();
  const testIds = tests.map((test) => test._id);
  const deleted = await SolutionModel.deleteMany({ test_ref: { $in: testIds } });
  return { deletedTestSolutions: deleted.deletedCount, affectedTests: testIds.length };
};

export const authorizeMassActionRequest = async (req, res) => {
  try {
    if (!isSuperAdmin(req.user)) return res.status(403).json(BuildValidationReturn("Not Authorized.", "error", "Samo super-admin može odobriti zahtev."));
    const token = String(req.body?.token || "").replace(/^(?:ISKRA-ACTION:|I:)/, "");
    if (!token) return res.status(400).json(BuildValidationReturn("Missing token.", "error", "Skenirajte ili unesite QR kod."));

    const request = await AdminApprovalRequestModel.findOneAndUpdate(
      { token, status: "pending", expiresAt: { $gt: new Date() } },
      { $set: { status: "executing", approvedBy: req.user._id } },
      { new: true },
    );
    if (!request) return res.status(404).json(BuildValidationReturn("Invalid or expired request.", "error", "QR kod je nevažeći, istekao je ili je već iskorišćen."));

    try {
      const result = await executeApprovedAction(request, req.app.get("socketio"));
      request.status = "executed";
      request.executedAt = new Date();
      request.result = result;
      await request.save();
      return res.status(200).json({ message: "Masovna radnja je odobrena i izvršena.", action: request.action, label: ACTIONS[request.action], result });
    } catch (executionError) {
      request.status = "failed";
      request.failureReason = executionError.message;
      await request.save();
      return res.status(500).json(BuildValidationReturn(executionError.message, "error", "Odobrenje je evidentirano, ali izvršenje radnje nije uspelo."));
    }
  } catch (error) {
    return res.status(500).json(BuildValidationReturn(error.message, "error", "Odobrenje nije uspelo."));
  }
};
