import bcrypt from "bcrypt";
import { UserModel } from "../models/UserModel.js";
import { SolutionModel } from "../models/TestSolutionModel.js";
import { ParentConsentModel } from "../models/ParentConsentModel.js";
import { BuildValidationReturn } from "../utilities/ReturnValidationError.js";
import { CONSENT_MARKDOWN, CONSENT_VERSION } from "../content/parentConsentNotice.js";

export const getConsentNotice = async (req, res) => {
  return res.status(200).json({
    version: CONSENT_VERSION,
    markdown: CONSENT_MARKDOWN,
  });
};

export const getStudentActivityReport = async (req, res) => {
  try {
    const { username, password, parentName, consent, consentVersion } = req.body || {};

    if (!username || !password) {
      return res
        .status(400)
        .json(BuildValidationReturn("missing credentials", "error", "Unesite korisničko ime i lozinku učenika."));
    }

    const cleanParentName = String(parentName || "").trim();
    if (!cleanParentName || cleanParentName.length < 2) {
      return res
        .status(400)
        .json(BuildValidationReturn("missing parent name", "error", "Unesite ime i prezime roditelja/staratelja."));
    }

    if (consent !== true) {
      return res
        .status(400)
        .json(BuildValidationReturn("consent not given", "error", "Morate prihvatiti saglasnost o obradi podataka pre nastavka."));
    }

    if (consentVersion !== CONSENT_VERSION) {
      return res
        .status(409)
        .json(
          BuildValidationReturn(
            "stale consent version",
            "error",
            "Tekst saglasnosti je u međuvremenu ažuriran. Osvežite stranicu i pokušajte ponovo."
          )
        );
    }

    const genericAuthError = () =>
      res.status(400).json(BuildValidationReturn("invalid credentials", "error", "Neispravno korisničko ime ili lozinka."));

    const student = await UserModel.findOne({ username: String(username).trim() });
    if (!student || !student.password) {
      return genericAuthError();
    }

    const passwordOk = await bcrypt.compare(password, student.password);
    if (!passwordOk) {
      return genericAuthError();
    }

    if (student.type !== "student_permanent") {
      return res
        .status(400)
        .json(
          BuildValidationReturn(
            "not a permanent student account",
            "error",
            "Izveštaj je dostupan samo za stalne (redovne) učeničke naloge, ne za privremene naloge sa časa."
          )
        );
    }

    if (student.login_banned) {
      return res
        .status(400)
        .json(BuildValidationReturn("login banned", "error", "Ovaj učenički nalog je trenutno blokiran za prijavu."));
    }

    await ParentConsentModel.create({
      studentRef: student._id,
      studentUsername: student.username,
      parentName: cleanParentName,
      consentVersion: CONSENT_VERSION,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] || "",
    });

    const [fullStudent, testSolutions] = await Promise.all([
      UserModel.findById(student._id)
        .select("-password")
        .populate({ path: "teacherRef", select: "name institution" })
        .populate({ path: "solutions.taskID", select: "title language outputType grade folder" })
        .lean(),
      SolutionModel.find({ student_ref: student._id })
        .populate({ path: "test_ref", select: "title grade classes createdAt" })
        .lean(),
    ]);

    if (!fullStudent) {
      return res.status(404).json(BuildValidationReturn("not found after auth", "error", "Nalog učenika nije pronađen."));
    }

    const tasks = (fullStudent.solutions || []).map((sol) => ({
      taskId: sol.taskID?._id ?? sol.taskID ?? null,
      taskTitle: sol.taskID?.title ?? "(zadatak je obrisan ili više nije dostupan)",
      language: sol.taskID?.language ?? null,
      outputType: sol.taskID?.outputType ?? null,
      status: sol.status ?? null,
      code: sol.code ?? null,
      stderr: sol.stderr ?? null,
      expectedOutput: sol.dev_ocekivani_output ?? null,
      actualOutput: sol.dev_output ?? null,
      gradingDate: sol.grading_date ?? null,
      flags: sol.flags ?? [],
    }));

    const tests = testSolutions.map((sol) => ({
      testId: sol.test_ref?._id ?? sol.test_ref ?? null,
      testTitle: sol.test_ref?.title ?? "(test je obrisan ili više nije dostupan)",
      grade: sol.test_ref?.grade ?? null,
      classes: sol.test_ref?.classes ?? null,
      submissionStatus: sol.submission_status,
      totalPointsAwarded: sol.total_points_awarded,
      totalPointsPossible: sol.total_points_possible,
      gradeValue: sol.grade_value,
      startedAt: sol.started_at,
      submittedAt: sol.submitted_at ?? null,
      answers: (sol.answers || []).map((a) => ({
        questionId: a.question_id,
        taskType: a.task_type,
        studentAnswer: a.student_answer,
        pointsAwarded: a.points_awarded,
        maxPoints: a.max_points ?? null,
        feedback: a.feedback || "",
        status: a.status,
      })),
    }));

    const report = {
      generatedAt: new Date().toISOString(),
      requestedBy: {
        parentName: cleanParentName,
        consentVersion: CONSENT_VERSION,
      },
      student: {
        id: fullStudent._id,
        name: fullStudent.name,
        username: fullStudent.username,
        institution: fullStudent.institution || null,
        teacher: fullStudent.teacherRef
          ? { name: fullStudent.teacherRef.name, institution: fullStudent.teacherRef.institution || null }
          : null,
        accountCreatedAt: fullStudent.createdAt,
      },
      tasks,
      tests,
      summary: {
        tasksTotal: tasks.length,
        tasksAccepted: tasks.filter((t) => t.status === "accepted").length,
        tasksInRevision: tasks.filter((t) => t.status === "revise").length,
        testsTotal: tests.length,
        testsGraded: tests.filter((t) => t.submissionStatus === "graded").length,
        averageTestScorePercent:
          tests.length > 0
            ? Math.round(
                (tests.reduce((acc, t) => acc + (t.totalPointsPossible > 0 ? t.totalPointsAwarded / t.totalPointsPossible : 0), 0) /
                  tests.length) *
                  100
              )
            : null,
      },
    };

    return res.status(200).json(report);
  } catch (error) {
    return res
      .status(500)
      .json(BuildValidationReturn(error.message, "error", "Došlo je do neočekivane greške pri generisanju izveštaja."));
  }
};
