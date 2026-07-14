import mongoose, { isObjectIdOrHexString } from "mongoose"
import { Foldermodel } from "../models/FolderModel.js"
import { BuildValidationReturn } from "../utilities/ReturnValidationError.js"
import { TaskModel } from "../models/TaskModel.js"
import { UserModel } from "../models/UserModel.js"
import crypto from "crypto";
import { TestModel } from "../models/TestModel.js"
import { SolutionModel } from "../models/TestSolutionModel.js"
import { TheroyTAskModel } from "../models/TheoryTaskModel.js"
import bcrypt from 'bcrypt'
const allowed_users = ['student_permanent']

export const getExams = async (req, res) => {
    try {
        const userID = req.user._id
        const teacherRef = req.user.teacherRef

        if (!userID) {
            return res.status(400).json(BuildValidationReturn('No user id middleware', 'error', 'Missing User ID.'))
        }

        if (!teacherRef) {
            return res.status(400).json(BuildValidationReturn('No teacher ref middleware', 'error', 'Your account is not connected to any teacher account.'))
        }

        if (!req.user.type) {
            return res.status(400).json(BuildValidationReturn('No req.user.type from middleware', 'error', 'Missing Account Type'))
        }

        if (!allowed_users.includes(req.user.type)) {
            return res.status(400).json(BuildValidationReturn('Not right account type.', 'error', 'Your Account cannot access these resources.'))
        }
        const teacherObjectId = new mongoose.Types.ObjectId(teacherRef);
        const studentObjectId = new mongoose.Types.ObjectId(userID);


        const tests_assigned = await TestModel.aggregate([
            {
                $match: {
                    author: teacherObjectId,
                    "settings.disableEdits": true
                }
            },
            {
                $lookup: {
                    from: 'solutions',
                    let: { test_id: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$test_ref', '$$test_id'] },
                                        { $eq: ['$student_ref', studentObjectId] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'studentSolutions'
                }
            },
            {
                $match: {
                    studentSolutions: { $size: 0 }
                }
            },
            {
                $project: {
                    studentSolutions: 0
                }
            }
        ])



        const solutions_graded = await SolutionModel.find({ student_ref: new mongoose.Types.ObjectId(userID), submission_status: "graded" }).populate("test_ref", "title").select("-action_required -answers -createdAt -student_ref -submission_status -test_ref -total_points_awarded -total_points_possible  -__v")

        const return_obj = {
            "assigned_tests": tests_assigned,
            "graded_solutions": solutions_graded
        }

        return res.status(200).json(return_obj)

    } catch (error) {
        return res.status(500).json(BuildValidationReturn(error.message, 'error', 'Unexpected error occured.'))
    }
}

export const InitializeSolution = async (req, res) => {
    try {
        const userid = req.user._id

        const testid = req.query.test

        const usertype = req.user.type

        if (!userid) {
            return res.status(400).json(BuildValidationReturn('No user id middleware', 'error', 'Missing User ID.'))
        }

        if (!testid) {
            return res.status(400).json(BuildValidationReturn('No test id from query param', 'error', 'Missing Test ID.'))
        }



        if (!usertype) {
            return res.status(400).json(BuildValidationReturn('No req.user.type from middleware', 'error', 'Missing Account Type'))
        }

        if (!allowed_users.includes(usertype)) {
            return res.status(400).json(BuildValidationReturn('Not right account type.', 'error', 'Your Account cannot access these resources.'))
        }


        let test = await TestModel.findById(testid)

        if (!test) {
            return res.status(400).json(BuildValidationReturn('no test found.', 'error', 'Test not found.'))
        }

        const existingSolution = await SolutionModel.findOne({ test_ref: testid, student_ref: userid });
        if (existingSolution) {
            return res.status(400).json({ success: false, message: 'Solution already initialized.', data: existingSolution });
        }

        const blankAnswers = test.questions.map(q => ({
            question_id: q.questionID,
            task_type: q.taskType,
            student_answer: null, // Blanko vrednost
            points_awarded: 0,
            max_points: q.points_max,
            feedback: '',
            status: 'none'
        }));

        const newSolution = new SolutionModel({
            test_ref: testid,
            student_ref: userid,
            submission_status: 'in_progress',
            answers: blankAnswers,
            total_points_awarded: 0,
            started_at: new Date()
        });

        await newSolution.save();

        return res.status(201).json({
            success: true,
            message: 'Solution initialized successfully.',
            data: newSolution
        });


    } catch (error) {
        return res.status(500).json(BuildValidationReturn(error.message, 'error', 'Unexpected error occured.'))
    }
}
export const getTasksData = async (req, res) => {
    try {
        const userid = req.user._id
        const testid = req.query.test
        const usertype = req.user.type

        if (!userid) {
            return res.status(400).json(BuildValidationReturn('No user id middleware', 'error', 'Missing User ID.'))
        }
        if (!testid) {
            return res.status(400).json(BuildValidationReturn('No test id from query param', 'error', 'Missing Test ID.'))
        }
        if (!usertype) {
            return res.status(400).json(BuildValidationReturn('No req.user.type from middleware', 'error', 'Missing Account Type'))
        }
        if (!allowed_users.includes(usertype)) {
            return res.status(400).json(BuildValidationReturn('Not right account type.', 'error', 'Your Account cannot access these resources.'))
        }

        let test = await TestModel.findById(testid).lean()

        if (!test) {
            return res.status(400).json(BuildValidationReturn('no test found.', 'error', 'Test not found.'))
        }

        let Solution = await SolutionModel.findOne({
            test_ref: new mongoose.Types.ObjectId(testid),
            student_ref: new mongoose.Types.ObjectId(userid),
            submission_status: { $in: ["in_progress", "graded"] }
        }).lean()

        if (!Solution) {
            return res.status(400).json(BuildValidationReturn('no solution found.', 'error', 'Solution not found.'))
        }

        let solutionid = Solution._id

        const populatedQuestionsPromises = test.questions.map(async (q) => {
            let populatedData = null;
            
            let questionIdStr = "";
            if (q.questionID) {
                if (typeof q.questionID === 'string') {
                    questionIdStr = q.questionID;
                } else if (q.questionID.$oid) {
                    questionIdStr = q.questionID.$oid;
                } else if (q.questionID.toString) {
                    questionIdStr = q.questionID.toString();
                }
            }

            if (q.taskType === "Task") {
                const excludedTaskFields = '-author -folder -ownerRef -downloaded -ai_users -ai_allowed -tests -published -storeOriginID';

                populatedData = await TaskModel.findById(questionIdStr)
                    .select(excludedTaskFields)
                    .lean();

            } else if (q.taskType === "TheoryTask") {
                const excludedTheoryFields = '-lesson -correct_answer -owner -createdAt -updatedAt -__v';

                populatedData = await TheroyTAskModel.findById(questionIdStr)
                    .select(excludedTheoryFields)
                    .lean();
            }

            const matchingAnswer = Solution.answers?.find((ans) => {
                if (!ans.question_id) return false;
                const ansIdStr = ans.question_id.$oid || ans.question_id.toString();
                return ansIdStr === questionIdStr;
            });

            let displayStatus = 'none'

            if (matchingAnswer) {
                const realStatus = matchingAnswer.status || 'none';

                if (q.taskType === "TheoryTask") {
                    if (realStatus === 'correct' || realStatus === 'incorrect') {
                        displayStatus = 'done';
                    } else {
                        displayStatus = realStatus;
                    }
                } else if (q.taskType === "Task") {
                    displayStatus = realStatus;
                }
            }

            return {
                ...q,
                taskType: q.taskType,
                status: displayStatus,
                student_answer: matchingAnswer?.student_answer ?? null,
                taskDetails: populatedData
            };
        });

        const allPopulatedQuestions = await Promise.all(populatedQuestionsPromises);

        const tasksResult = {
            practicalTasks: [],
            theoryTasks: []
        };

        allPopulatedQuestions.forEach((q) => {
            if (q.taskType === "Task") {
                tasksResult.practicalTasks.push(q);
            } else if (q.taskType === "TheoryTask") {
                tasksResult.theoryTasks.push(q);
            }
        });
        tasksResult.solutionid = solutionid
        return res.status(200).json({
            success: true,
            data: tasksResult,
            anticheat_action_required: Solution.action_required
        });

    } catch (error) {
        return res.status(500).json(BuildValidationReturn(error.message, 'error', 'Unexpected error occured.'))
    }
}

export const finishTest = async (req, res) => {
    try {
        const userid = req.user._id
        const testid = req.query.test
        const usertype = req.user.type

        if (!userid) {
            return res.status(400).json(BuildValidationReturn('No user id middleware', 'error', 'Missing User ID.'))
        }
        if (!testid) {
            return res.status(400).json(BuildValidationReturn('No test id from query param', 'error', 'Missing Test ID.'))
        }
        if (!usertype) {
            return res.status(400).json(BuildValidationReturn('No req.user.type from middleware', 'error', 'Missing Account Type'))
        }
        if (!allowed_users.includes(usertype)) {
            return res.status(400).json(BuildValidationReturn('Not right account type.', 'error', 'Your Account cannot access these resources.'))
        }


        let test = await TestModel.findById(testid).lean()

        if (!test) {
            return res.status(400).json(BuildValidationReturn('no test found.', 'error', 'Test not found.'))
        }

        let Solution = await SolutionModel.findOne({
            test_ref: new mongoose.Types.ObjectId(testid),
            student_ref: new mongoose.Types.ObjectId(userid),
            submission_status: { $in: ["in_progress"] }
        })

        if (!Solution) {
            return res.status(400).json(BuildValidationReturn('solution not found with arameters of test_ref, student_ref, and status in progress', 'error', 'Solution not found.'))
        }
        let total_points = 0
        let total_points_possible = 0
        for (const answer of Solution.answers) {
            if (answer.status === 'none') {
                answer.status = 'incorrect'
                answer.feedback = 'Zadatak nije uradjen.'
                answer.points_awarded = 0 
            }
            total_points += (answer.points_awarded || 0)
            total_points_possible += (answer.max_points || 0)
        }

        Solution.markModified('answers')

        Solution.total_points_awarded = total_points
        Solution.total_points_possible = total_points_possible
        Solution.submission_status = 'submitted'
        
        await Solution.save()

        return res.status(200).json(BuildValidationReturn('OK.', 'success', 'Test finished.'))
    } catch (error) {
        return res.status(500).json(BuildValidationReturn(error.message, 'error', 'Unexpected error occured.'))
    }
}

export const ApproveAntiCheat = async (req, res) => {
    try {
        const studentid = req.user._id
        const testid = req.query.test
        const usertype = req.user.type

        let entered_pass = req.body.password || ""

        if (!studentid) {
            return res.status(400).json(BuildValidationReturn('No user id middleware', 'error', 'Missing student ID.'))
        }
        if (!testid) {
            return res.status(400).json(BuildValidationReturn('No test id from query param', 'error', 'Missing Test ID.'))
        }
        if (!usertype) {
            return res.status(400).json(BuildValidationReturn('No req.user.type from middleware', 'error', 'Missing Account Type'))
        }
        if (!allowed_users.includes(usertype)) {
            return res.status(400).json(BuildValidationReturn('Not right account type.', 'error', 'Your Account cannot access these resources.'))
        }
        if (!entered_pass) {
            return res.status(400).json(BuildValidationReturn("password missing.", 'error', "Enter Teacher's password."))
        }

        let Solution = await SolutionModel.findOne({
            test_ref: new mongoose.Types.ObjectId(testid),
            student_ref: new mongoose.Types.ObjectId(studentid),
            submission_status: { $in: ["in_progress"] }
        })

        if (!Solution) {
            return res.status(400).json(BuildValidationReturn('solution not found with arameters of test_ref, student_ref, and status in progress', 'error', 'Solution not found.'))
        }

        if (!Solution.action_required) {
            return res.status(400).json(BuildValidationReturn("Cannot validate.", "error", "Cannot validate."))
        }

        let teacherid = req.user.teacherRef
        if (!teacherid) {
            return res.status(400).json(BuildValidationReturn("No teacher id", "error", "No Teacher ID."))
        }

        let teacher_account = await UserModel.findById(teacherid)
        if (!teacher_account) {
            return res.status(400).json(BuildValidationReturn("Teacher not found.", "error", "Teacher not Found."))
        }

        let verified = await bcrypt.compare(entered_pass, teacher_account.password)

        if (!verified) {
            return res.status(400).json(BuildValidationReturn("Incorrect password.", "error", "Incorrect password."))
        }

        Solution.action_required = false
        await Solution.save()
        return res.status(200).json({ success: true })

    } catch (error) {
        return res.status(500).json(BuildValidationReturn(error.message, 'error', 'Unexpected error occured.'))
    }
}

export const ReportCheat = async (req, res) => {
    try {
        const studentid = req.user._id
        const testid = req.query.test
        const usertype = req.user.type


        if (!studentid) {
            return res.status(400).json(BuildValidationReturn('No user id middleware', 'error', 'Missing student ID.'))
        }
        if (!testid) {
            return res.status(400).json(BuildValidationReturn('No test id from query param', 'error', 'Missing Test ID.'))
        }
        if (!usertype) {
            return res.status(400).json(BuildValidationReturn('No req.user.type from middleware', 'error', 'Missing Account Type'))
        }
        if (!allowed_users.includes(usertype)) {
            return res.status(400).json(BuildValidationReturn('Not right account type.', 'error', 'Your Account cannot access these resources.'))
        }

        let Solution = await SolutionModel.findOne({
            test_ref: new mongoose.Types.ObjectId(testid),
            student_ref: new mongoose.Types.ObjectId(studentid),
            submission_status: { $in: ["in_progress"] }
        })

        if (!Solution) {
            return res.status(400).json(BuildValidationReturn('solution not found with arameters of test_ref, student_ref, and status in progress', 'error', 'Solution not found.'))
        }

        Solution.action_required = true
        await Solution.save()
        return res.status(200).json({ success: true })
    } catch (error) {
        return res.status(500).json(BuildValidationReturn(error.message, 'error', 'Unexpected error occured.'))
    }
}


export const CheckTheorySolution = async (req, res) => {
    try {
        const { mutation_id = null, answer = null, test_id = null } = req.body || {}
        const studentid = req.user._id
        const usertype = req.user.type
        if (!mutation_id || !answer || !test_id) {
            return res.status(400).json(BuildValidationReturn("Enter all the required data.", 'error', "Missing required data."))
        }

        if (!studentid) {
            return res.status(400).json(BuildValidationReturn('No user id middleware', 'error', 'Missing student ID.'))
        }
        if (!test_id) {
            return res.status(400).json(BuildValidationReturn('No test id from query param', 'error', 'Missing Test ID.'))
        }
        if (!usertype) {
            return res.status(400).json(BuildValidationReturn('No req.user.type from middleware', 'error', 'Missing Account Type'))
        }
        if (!allowed_users.includes(usertype)) {
            return res.status(400).json(BuildValidationReturn('Not right account type.', 'error', 'Your Account cannot access these resources.'))
        }

        let Solution = await SolutionModel.findOne({
            test_ref: new mongoose.Types.ObjectId(test_id),
            student_ref: new mongoose.Types.ObjectId(studentid),
            submission_status: { $in: ["in_progress"] }
        })

        if (!Solution) {
            return res.status(400).json(BuildValidationReturn('solution not found with arameters of test_ref, student_ref, and status in progress', 'error', 'Solution not found.'))
        }

        let task_to_mutate = Solution.answers.find(item =>
            item.task_type === "TheoryTask" &&
            item.question_id.toString() === mutation_id.toString()
        )

        if (!task_to_mutate) {
            return res.status(400).json(BuildValidationReturn("Task not found.", 'error', 'Task not found.'))
        }

        let ref_task = await TheroyTAskModel.findById(task_to_mutate.question_id)
        if (!ref_task) {
            return res.status(400).json(BuildValidationReturn("Task not found.", 'error', 'Task not found.'))
        }

        task_to_mutate.student_answer = answer

        let correct_answer = ref_task.correct_answer
        let status = ""
        if (correct_answer === answer) {
            task_to_mutate.status = "correct"
            task_to_mutate.points_awarded = task_to_mutate.max_points
            status = "correct"
        } else {
            task_to_mutate.status = "incorrect"
            task_to_mutate.points_awarded = 0
            status = 'incorrect'
        }

        // PROMENJENO: Mongoose zahteva da se eksplicitno naznači izmena u nizu pre .save() ako su u pitanju kompleksni objekti
        Solution.markModified('answers')

        // PROMENJENO: Čuva se ceo roditeljski dokument `Solution`, a ne pod-objekat `task_to_mutate`
        await Solution.save()

        const io = req.app.get('socketio')

        if (io) {
            io.to(Solution._id.toString()).emit("update_exam_solution_status", {
                tasktype: "TheoryTask",
                status: "done",
                id: mutation_id
            })
        }

        return res.status(200).json({ success: true })
    } catch (error) {
        return res.status(500).json(BuildValidationReturn(error.message, 'error', 'Unexpected error occured.'))
    }
}


let activeInstance = -1
let instances = {
    0: "https://lukajekic-python-judge.hf.space",
    1: "https://lukajekic-python-judge-2.hf.space"
}
let activeRubyInstance = -1

let ruby_instances = {
    0: "https://iskra-edu.onrender.com"
}

let determineInstance = () => {
    let keys = Object.keys(instances)
    let new_active = -1
    if (activeInstance + 1 === keys.length) {
        new_active = 0
    } else {
        new_active = activeInstance + 1
    }
    activeInstance = new_active

    return instances[activeInstance]
}

let determineRubyInstance = () => {
    let keys = Object.keys(ruby_instances)
    let new_active = -1
    if (activeRubyInstance + 1 === keys.length) {
        new_active = 0
    } else {
        new_active = activeRubyInstance + 1
    }
    activeRubyInstance = new_active

    return ruby_instances[activeRubyInstance]
}

export const checkPracticalSolution = async (req, res) => {
    try {
        const { mutation_id = null, answer = null, test_id = null } = req.body || {}
        const studentid = req.user._id
        const usertype = req.user.type
        if (!mutation_id || !answer || !test_id) {
            return res.status(400).json(BuildValidationReturn("Enter all the required data.", 'error', "Missing required data."))
        }

        if (!studentid) {
            return res.status(400).json(BuildValidationReturn('No user id middleware', 'error', 'Missing student ID.'))
        }
        if (!test_id) {
            return res.status(400).json(BuildValidationReturn('No test id from query param', 'error', 'Missing Test ID.'))
        }
        if (!usertype) {
            return res.status(400).json(BuildValidationReturn('No req.user.type from middleware', 'error', 'Missing Account Type'))
        }
        if (!allowed_users.includes(usertype)) {
            return res.status(400).json(BuildValidationReturn('Not right account type.', 'error', 'Your Account cannot access these resources.'))
        }

        let Solution = await SolutionModel.findOne({
            test_ref: new mongoose.Types.ObjectId(test_id),
            student_ref: new mongoose.Types.ObjectId(studentid),
            submission_status: { $in: ["in_progress"] }
        })

        if (!Solution) {
            return res.status(400).json(BuildValidationReturn('solution not found with arameters of test_ref, student_ref, and status in progress', 'error', 'Solution not found.'))
        }

        let task_to_mutate = Solution.answers.find(item =>
            item.task_type === "Task" &&
            item.question_id.toString() === mutation_id.toString()
        )

        if (!task_to_mutate) {
            return res.status(400).json(BuildValidationReturn("Task not found. [In task_to_mutate]", 'error', 'Task not found.'))
        }

        let ref_task = await TaskModel.findById(task_to_mutate.question_id)
        if (!ref_task) {
            return res.status(400).json(BuildValidationReturn("Task not found. [In TaskModel]", 'error', 'Task not found.'))
        }

        console.log(ref_task)

        task_to_mutate.student_answer = answer

        if (!ref_task.tests || ref_task.tests.length === 0) {
            task_to_mutate.status = 'incorrect'
            task_to_mutate.feedback = "Zadatak nije prihvaćen jer Isrka ne može proveriti zadatak ako zadatak ne poseduje testove za proveru."
            task_to_mutate.points_awarded = 0
            Solution.markModified('answers')
            await Solution.save()
            return res.status(200).json({
                success: true,
                correct: false,
                points_awarded: 0
            })
        } else {


            if (ref_task.language === "python" || ref_task.language === "ruby") {
                let stderr = ""
                if (ref_task.outputType === "standard") {
                    console.log(ref_task)
                    let tests = ref_task.tests

                    for (const test of tests) {
                        let stdin = test.input.join("\n");
                        
                        let testing_instance = ""
                        if (ref_task.language === "python") {
                            testing_instance = determineInstance()
                        } else if (ref_task.language === "ruby") {
                            testing_instance = determineRubyInstance()
                        }

                        try {
                            const response = await fetch(`${testing_instance}/run`, {
                                method: 'POST',
                                body: JSON.stringify({ code: answer, input_data: stdin, timeout: 5 }),
                                headers: { 'Content-Type': 'application/json' }
                            })


                            const data = await response.json()

                            if (data.stderr) {
                                stderr = data.stderr
                                task_to_mutate.status = 'incorrect'
                                task_to_mutate.feedback = "Sintaksa zadatka nije ispravna."
                                task_to_mutate.points_awarded = 0
                                Solution.markModified('answers')
                                await Solution.save()
                                return res.status(200).json({
                                    success: true,
                                    correct: false,
                                    points_awarded: 0
                                })

                                await Solution.save()
                            } else {
                                let expected_output = test.output.join("\n")
                                let output_real = data.stdout.replace(/\n$/, "")
                                if (expected_output !== output_real) {
                                    task_to_mutate.status = 'incorrect'
                                    task_to_mutate.feedback = "Sintaksa koda je u redu, ali ispis programa se ne poklapa sa ocekivanjima testova zadatka."
                                    task_to_mutate.points_awarded = 0
                                    Solution.markModified('answers')
                                    await Solution.save()
                                    return res.status(200).json({
                                        success: true,
                                        correct: false,
                                        points_awarded: 0
                                    })

                                    await Solution.save()


                                }
                            }
                        } catch (error) {
                            console.error("Greška pri testiranju:", error);
                            return res.status(500).json(BuildValidationReturn(error.message, "error", "Your solution cannot be checked due to an error."))
                        }
                    }

                    task_to_mutate.status = 'correct'
                    task_to_mutate.feedback = "Zadatak je ispravno uradjen."
                    task_to_mutate.points_awarded = task_to_mutate.max_points
                    Solution.markModified('answers')
                    await Solution.save()
                    return res.status(200).json({
                        success: true,
                        correct: true,
                        points_awarded: task_to_mutate.max_points
                    })

                    await Solution.save()
                }
            }
        }
    } catch (error) {
        return res.status(500).json(BuildValidationReturn(error.message, 'error', 'Unexpected error occured.'))
    }
}


export const getResultData = async (req, res) => {
    try {
        const userid = req.user._id
        const testid = req.query.test
        const usertype = req.user.type

        if (!userid) {
            return res.status(400).json(BuildValidationReturn('No user id middleware', 'error', 'Missing User ID.'))
        }
        if (!testid) {
            return res.status(400).json(BuildValidationReturn('No test id from query param', 'error', 'Missing Test ID.'))
        }
        if (!usertype) {
            return res.status(400).json(BuildValidationReturn('No req.user.type from middleware', 'error', 'Missing Account Type'))
        }
        if (!allowed_users.includes(usertype)) {
            return res.status(400).json(BuildValidationReturn('Not right account type.', 'error', 'Your Account cannot access these resources.'))
        }

        let test = await TestModel.findById(testid).lean()

        if (!test) {
            return res.status(400).json(BuildValidationReturn('no test found.', 'error', 'Test not found.'))
        }

        let Solution = await SolutionModel.findOne({
            test_ref: new mongoose.Types.ObjectId(testid),
            student_ref: new mongoose.Types.ObjectId(userid),
            submission_status: { $in: ["graded"] }
        }).lean()

        if (!Solution) {
            return res.status(400).json(BuildValidationReturn('no solution found.', 'error', 'Solution not found.'))
        }

        let solutionid = Solution._id

        const populatedQuestionsPromises = test.questions.map(async (q) => {
            let populatedData = null;
            const questionIdStr = q.questionID?.$oid || q.questionID;

            if (q.taskType === "Task") {
                const excludedTaskFields = '-author -folder -ownerRef -downloaded -ai_users -ai_allowed -tests -published -storeOriginID';

                populatedData = await TaskModel.findById(questionIdStr)
                    .select(excludedTaskFields)
                    .lean();

            } else if (q.taskType === "TheoryTask") {
                const excludedTheoryFields = '-lesson  -owner -createdAt -updatedAt -__v';

                populatedData = await TheroyTAskModel.findById(questionIdStr)
                    .select(excludedTheoryFields)
                    .lean();
            }

            const matchingAnswer = Solution.answers?.find(
                (ans) => ans.question_id.toString() === questionIdStr.toString()
            );

            let displayStatus = 'none'

            if (matchingAnswer) {
                const realStatus = matchingAnswer.status || 'none';
                    displayStatus = realStatus;
                
            }

            return {
                ...q,
                status: displayStatus,
                student_answer: matchingAnswer?.student_answer ?? null,
                taskDetails: populatedData,
                feedback: matchingAnswer?.feedback ?? null,
                points_awarded: matchingAnswer?.points_awarded ?? 0,
            };
        });

        const allPopulatedQuestions = await Promise.all(populatedQuestionsPromises);



        let returnData = {
            answers: null,
            grade: null,
            title: null,
            total_points: null,
            max_points: null
        }

        returnData.answers = allPopulatedQuestions

        returnData.grade = Solution.grade_value
        returnData.title = test.title
        returnData.total_points = Solution.total_points_awarded
        returnData.max_points = Solution.total_points_possible
       
 
        return res.status(200).json({
            success: true,
            data: returnData
                });

    } catch (error) {
        return res.status(500).json(BuildValidationReturn(error.message, 'error', 'Unexpected error occured.'))
    }
}

export const getGradingCandidates = async(req, res)=>{
    try {
        const userid = req.user._id
        const testid = req.query.test
        const usertype = req.user.type

        if (!userid) {
            return res.status(400).json(BuildValidationReturn('No user id middleware', 'error', 'Missing User ID.'))
        }
        if (!testid) {
            return res.status(400).json(BuildValidationReturn('No test id from query param', 'error', 'Missing Test ID.'))
        }
        if (!usertype) {
            return res.status(400).json(BuildValidationReturn('No req.user.type from middleware', 'error', 'Missing Account Type'))
        }
        if (usertype !== 'teacher') {
            return res.status(400).json(BuildValidationReturn('Not right account type.', 'error', 'Your Account cannot access these resources.'))
        }

        let test = await TestModel.findById(testid).lean()

        if (!test) {
            return res.status(400).json(BuildValidationReturn('no test found.', 'error', 'Test not found.'))
        }

        if (test.author.toString() !== req.user._id.toString()) {
            return res.status(400).json(BuildValidationReturn("Not Authorized.", 'error', 'Not Authorized.'))
        }

       const solutions = await SolutionModel.find({
    test_ref: test._id,
    submission_status: { $in: ["submitted", "graded"] }
}).select("total_points_awarded total_points_possible grade_value started_at").populate("student_ref", "name")

let returnData = {
    solutions: solutions,
    test_title: test.title,
    scale: test.scale
}

return res.status(200).json(returnData)
    } catch (error) {
       return res.status(500).json(BuildValidationReturn(error.message, 'error', 'Unexpected error occured.')) 
    }
}

export const getCandidateData = async(req, res)=>{
    try {
        const userid = req.user._id
        const solutionID = req.query.solution
        const usertype = req.user.type

        if (!userid) {
            return res.status(400).json(BuildValidationReturn('No user id middleware', 'error', 'Missing User ID.'))
        }
        if (!solutionID) {
            return res.status(400).json(BuildValidationReturn('No solution id from query param', 'error', 'Missing Solution ID.'))
        }
        if (!usertype) {
            return res.status(400).json(BuildValidationReturn('No req.user.type from middleware', 'error', 'Missing Account Type'))
        }
        if (usertype !== 'teacher') {
            return res.status(400).json(BuildValidationReturn('Not right account type.', 'error', 'Your Account cannot access these resources.'))
        }

        let Solution = await SolutionModel.findOne({
            _id: solutionID,
            submission_status: { $in: ["graded", "submitted"] }
        }).lean()

        if (!Solution) {
            return res.status(400).json(BuildValidationReturn('no solution found.', 'error', 'Solution not found.'))
        }

        let test = await TestModel.findById(Solution.test_ref).lean()

        if (!test) {
            return res.status(400).json(BuildValidationReturn('no test found.', 'error', 'Test not found.'))
        }

        let solutionid = Solution._id

        const populatedQuestionsPromises = test.questions.map(async (q) => {
            let populatedData = null;
            const questionIdStr = q.questionID?.$oid || q.questionID;

            if (q.taskType === "Task") {
                const excludedTaskFields = '-author -folder -ownerRef -downloaded -ai_users -ai_allowed -tests -published -storeOriginID -language -outputType -__v -_id';

                populatedData = await TaskModel.findById(questionIdStr)
                    .select(excludedTaskFields)
                    .lean();

            } else if (q.taskType === "TheoryTask") {
                const excludedTheoryFields = '-lesson  -owner -createdAt -updatedAt -__v -_id -answers';

                populatedData = await TheroyTAskModel.findById(questionIdStr)
                    .select(excludedTheoryFields)
                    .lean();
            }

            const matchingAnswer = Solution.answers?.find(
                (ans) => ans.question_id.toString() === questionIdStr.toString()
            );

            let displayStatus = 'none'

            if (matchingAnswer) {
                const realStatus = matchingAnswer.status || 'none';
                    displayStatus = realStatus;
                
            }

            return {
                ...q,
                status: displayStatus,
                student_answer: matchingAnswer?.student_answer ?? null,
                taskDetails: populatedData,
                feedback: matchingAnswer?.feedback ?? null,
                points_awarded: matchingAnswer?.points_awarded ?? 0,
            };
        });

        const allPopulatedQuestions = await Promise.all(populatedQuestionsPromises);



        let returnData = {
            answers: null,
            grade: null,
            total_points: null,
            max_points: null
        }

        returnData.answers = allPopulatedQuestions

        returnData.grade = Solution.grade_value
        returnData.title = test.title
        returnData.total_points = Solution.total_points_awarded
        returnData.max_points = Solution.total_points_possible
       
 
        return res.status(200).json({
            success: true,
            data: returnData
                });


    } catch (error) {
       return res.status(500).json(BuildValidationReturn(error.message, 'error', 'Unexpected error occured.')) 

    }
}


export const gradeCandidateExam = async (req, res) => {
    try {
        const userid = req.user._id
        const usertype = req.user.type
        
        const { solutionID, grade_value, answers } = req.body

        if (!userid) {
            return res.status(400).json(BuildValidationReturn('No user id middleware', 'error', 'Missing User ID.'))
        }
        if (!usertype) {
            return res.status(400).json(BuildValidationReturn('No req.user.type from middleware', 'error', 'Missing Account Type'))
        }
        if (usertype !== 'teacher') {
            return res.status(400).json(BuildValidationReturn('Not right account type.', 'error', 'Your Account cannot access these resources.'))
        }
        if (!solutionID) {
            return res.status(400).json(BuildValidationReturn('Missing solutionID in body', 'error', 'Missing Solution ID.'))
        }
        if (grade_value === undefined || grade_value === null) {
            return res.status(400).json(BuildValidationReturn('Missing grade_value in body', 'error', 'Missing Grade Value.'))
        }
        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json(BuildValidationReturn('Answers must be an array', 'error', 'Invalid Answers Data.'))
        }

        let solution = await SolutionModel.findOne({
            _id: solutionID,
            submission_status: { $in: ["graded", "submitted"] }
        })

        if (!solution) {
            return res.status(400).json(BuildValidationReturn('no solution found.', 'error', 'Solution not found.'))
        }

        let test = await TestModel.findById(solution.test_ref).lean()
        if (!test) {
            return res.status(400).json(BuildValidationReturn('no test found.', 'error', 'Test not found.'))
        }

        if (test.author.toString() !== userid.toString()) {
        return res.status(403).json(BuildValidationReturn('Teacher does not own this test.', 'error', 'Unauthorized access to this exam.'))
        }


        let calculatedTotalPoints = 0

        solution.answers = solution.answers.map((dbAnswer) => {
            const dbQuestionIdStr = dbAnswer.question_id?.toString() || dbAnswer.questionID?.toString()

            const clientUpdate = answers.find(ans => {
                const clientQuestionIdStr = ans.questionID?.$oid || ans.questionID || ans.question_id || ans._id
                return clientQuestionIdStr?.toString() === dbQuestionIdStr
            })

            if (clientUpdate) {
                const points = Math.max(0, Math.min(Number(clientUpdate.points_awarded) || 0, dbAnswer.points_max || Infinity))
                
                dbAnswer.points_awarded = points
                dbAnswer.feedback = clientUpdate.feedback !== undefined ? clientUpdate.feedback : dbAnswer.feedback
                
                dbAnswer.status = points > 0 ? 'correct' : 'incorrect'
            }

            calculatedTotalPoints += (dbAnswer.points_awarded || 0)
            return dbAnswer
        })

        solution.total_points_awarded = calculatedTotalPoints
        solution.grade_value = Number(grade_value)
        solution.submission_status = "graded"

        await solution.save()

        return res.status(200).json({
            success: true,
            message: "Ispit je uspešno ocenjen.",
            data: {
                solutionID: solution._id,
                grade_value: solution.grade_value,
                total_points_awarded: solution.total_points_awarded,
                submission_status: solution.submission_status
            }
        })

    } catch (error) {
        return res.status(500).json(BuildValidationReturn(error.message, 'error', 'Unexpected error occurred.'))
    }
}


export const getTestAnalyticsReport = async (req, res) => {
    try {
        const userid = req.user._id;
        const usertype = req.user.type;
        const { testID } = req.query;

        if (!userid || usertype !== 'teacher') {
            return res.status(403).json({ success: false, message: 'Samo nastavnici mogu pristupiti analitici.' });
        }
        if (!testID) {
            return res.status(400).json({ success: false, message: 'ID testa je neophodan.' });
        }

        const test = await TestModel.findById(testID).lean();
        if (!test) {
            return res.status(404).json({ success: false, message: 'Test nije pronađen.' });
        }
        if (test.author.toString() !== userid.toString()) {
            return res.status(403).json({ success: false, message: 'Nemate autorizaciju nad ovim testom.' });
        }

        const analytics = await SolutionModel.aggregate([
            { 
                $match: { 
                    test_ref: new mongoose.Types.ObjectId(testID),
                    submission_status: "graded" 
                } 
            },
            {
                $facet: {
                    "generalStats": [
                        {
                            $group: {
                                _id: null,
                                totalGraded: { $sum: 1 },
                                avgPoints: { $avg: "$total_points_awarded" },
                                maxPointsAwarded: { $max: "$total_points_awarded" },
                                minPointsAwarded: { $min: "$total_points_awarded" },
                                avgGrade: { $avg: "$grade_value" },
                                avgTimeSpent: {
                                    $avg: {
                                        $divide: [
                                            { $subtract: [ { $ifNull: ["$submitted_at", new Date()] }, "$started_at" ] },
                                            60000
                                        ]
                                    }
                                }
                            }
                        }
                    ],
                    "gradeDistribution": [
                        {
                            $group: {
                                _id: "$grade_value",
                                count: { $sum: 1 }
                            }
                        }
                    ],
"taskAnalytics": [
    { $unwind: "$answers" },
    {
        $group: {
            _id: "$answers.question_id",
            taskTitle: { $first: { $ifNull: ["$answers.taskDetails.title", "Bez naslova"] } },
            avgPointsAwarded: { $first: { $ifNull: ["$answers.points_awarded", 0] } },
            
            maxPointsPossible: { 
                $first: { 
                    $ifNull: [
                        "$answers.points_max", 
                        { $ifNull: ["$answers.taskDetails.points_max", 20] }
                    ] 
                } 
            },
            correctCount: {
                $sum: { $cond: [ { $eq: ["$answers.status", "correct"] }, 1, 0 ] }
            }
        }
    }
],
                    "studentList": [
                        {
                            $lookup: {
                                from: "users",
                                localField: "student_ref",
                                foreignField: "_id",
                                as: "studentInfo"
                            }
                        },
                        { $unwind: "$studentInfo" },
                        {
                            $project: {
                                solutionID: "$_id",
                                name: "$studentInfo.name",
                                score: "$total_points_awarded",
                                grade: "$grade_value",
                                timeSpent: {
                                    $round: [
                                        {
                                            $divide: [
                                                { $subtract: [ { $ifNull: ["$submitted_at", new Date()] }, "$started_at" ] },
                                                60000
                                            ]
                                        },
                                        0
                                    ]
                                }
                            }
                        },
                        { $sort: { name: 1 } }
                    ]
                }
            }
        ]);

        const generalData = analytics[0]?.generalStats[0] || {
            totalGraded: 0, avgPoints: 0, maxPointsAwarded: 0, minPointsAwarded: 0, avgGrade: 0, avgTimeSpent: 0
        };

        const responsePayload = {
            testTitle: test.title,
            maxPointsPossible: test.total_points_possible || 0,
            general: {
                ...generalData,
                avgTimeSpent: Math.round(generalData.avgTimeSpent || 0)
            },
            grades: analytics[0]?.gradeDistribution || [],
            tasks: analytics[0]?.taskAnalytics || [],
            studentList: analytics[0]?.studentList || []
        };

        return res.status(200).json({
            success: true,
            data: responsePayload
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};