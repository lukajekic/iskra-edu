import mongoose from "mongoose"
import { Foldermodel } from "../models/FolderModel.js"
import { BuildValidationReturn } from "../utilities/ReturnValidationError.js"
import { TaskModel } from "../models/TaskModel.js"
import { UserModel } from "../models/UserModel.js"
import crypto from "crypto";
import { TestModel } from "../models/TestModel.js"
import { SolutionModel } from "../models/TestSolutionModel.js"

const allowed_users = ['student_permanent']

export const getExams = async(req, res)=>{
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

        console.log("--- DEBUG PODACI ---");
console.log("Originalni teacherRef iz req.user:", req.user.teacherRef, "Tip:", typeof req.user.teacherRef);
console.log("Kastovani teacherObjectId:", teacherObjectId);
console.log("--------------------");
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



        const solutions_graded = await SolutionModel.find({student_ref: new mongoose.Types.ObjectId(userID), submission_status: "graded"})

        const return_obj = {
            "assigned_tests": tests_assigned,
            "graded_solutions": solutions_graded
        }

        return res.status(200).json(return_obj)

    } catch (error) {
        return res.status(500).json(BuildValidationReturn(error.message, 'error', 'Unexpected error occured.'))
    }
}

export const InitializeSolution = async(req, res)=>{
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
            feedback: ''
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