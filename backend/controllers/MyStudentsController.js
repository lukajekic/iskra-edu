import mongoose from "mongoose"
import { TaskModel } from "../models/TaskModel.js"
import { UserModel } from "../models/UserModel.js"
import { BuildValidationReturn } from "../utilities/ReturnValidationError.js"
import bcrypt, { hash } from 'bcrypt'

export const getStudents = async(req, res)=>{
    try {
        if (!req.user._id) {
            return res.status(400).json(BuildValidationReturn("no req.user._id", "error", "We cannot read your User ID."))
        }

        if (req.user.type !== "teacher") {
            return res.status(400).json(BuildValidationReturn("lacking role.", "error", "You are not authorized to access Students."))
        }
        let students = await UserModel.find({teacherRef: req.user._id,  type: "student_permanent"}).select("-password -solutions -teacherRef").lean()

        return res.status(200).json(students)
    } catch (error) {
        return res.status(500).json(BuildValidationReturn(error.message, "error", "Unexpected error occured."))
    }
}

export const editStudent = async(req, res)=>{
    try {
        const {id, name, password} = req.body || {}

        if (!id) {
            return res.status(400).json(BuildValidationReturn("no student id.", "error", "Please provide Student ID."))
        }

        if (!req.user._id) {
            return res.status(400).json(BuildValidationReturn("no req.user._id", "error", "We cannot read your User ID."))
        }

        if (req.user.type !== "teacher") {
            return res.status(400).json(BuildValidationReturn("lacking role.", "error", "You are not authorized to access Students."))
        }

        let student = await UserModel.findById(id)
        if (!student) {
            return res.status(400).json(BuildValidationReturn("not found.", "error", "Student not found."))
        }

        if (student.teacherRef.toString() !== req.user._id.toString()) {
            return res.status(400).json(BuildValidationReturn("lacking role.", "error", "You are not authorized to access this Student."))
        }

        if (name) {
            student.name = name
        }

        if (password) {
            const salt = await bcrypt.genSalt(10)
            const hashed = await bcrypt.hash(password, salt)
            student.password = hashed
        }

        await student.save()

        return res.status(200).json(BuildValidationReturn("ok", "success", "Student updated successfully."))

    } catch (error) {
        return res.status(500).json(BuildValidationReturn(error.message, "error", "Unexpected error occured."))
    }
}



export const deleteStudent = async(req, res)=>{
    try {
        
        const {id} = req.body || {}

        if (!id) {
            return res.status(400).json(BuildValidationReturn("no student id.", "error", "Please provide Student ID."))
        }

        if (req.user.type !== "teacher") {
            return res.status(400).json(BuildValidationReturn("lacking role.", "error", "You are not authorized to access Students."))
        }

        let student = await UserModel.findById(id)
        if (!student) {
            return res.status(400).json(BuildValidationReturn("not found.", "error", "Student not found."))
        }

        if (student.teacherRef.toString() !== req.user._id.toString()) {
            return res.status(400).json(BuildValidationReturn("lacking role.", "error", "You are not authorized to access this Student."))
        }

        await student.deleteOne()
        

        return res.status(200).json(BuildValidationReturn("deleted.", "success", "Student deleted successfully."))
    } catch (error) {
     return res.status(500).json(BuildValidationReturn(error.message, "error", "Unexpected error occured."))   
    }
}


export const StudentsProgress = async(req, res)=>{
    try {
        const teacherid = req.user._id

        if (!teacherid) {
            return res.status(400).json(BuildValidationReturn("no req.user._id", "error", "We cannot read your User ID."))
        }

        if (req.user.type !== "teacher") {
            return res.status(400).json(BuildValidationReturn("lacking role.", "error", "You are not authorized to access Students."))
        }

        let tasks_count = await TaskModel.countDocuments({ownerRef: new mongoose.Types.ObjectId(req.user._id)})
        let students = await UserModel.find({teacherRef: new mongoose.Types.ObjectId(req.user._id), type: "student_permanent"}).select("name solutions")

        let napredak = students.reduce((acc, item)=>{
            let counts = { done: 0, revise: 0 };
    
    item.solutions.forEach(sol => {
        if (sol.status === "accepted") {
            counts.done++
        }
        else if (sol.status === "revise") {
                counts.revise++
            }
    });
          

            let info = {
                name: item.name,
                progress: {
                    none: tasks_count - (counts.done + counts.revise),
                    revise: counts.revise,
                    accepted: counts.done
                }
            }

            acc.push(info)
            return acc
        }, [])

        return res.status(200).json(napredak)
    } catch (error) {
        return res.status(500).json(BuildValidationReturn(error.message, "error", "Unexpected error occured."))
    }
}