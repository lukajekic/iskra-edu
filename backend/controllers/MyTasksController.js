import mongoose from "mongoose";
import { TaskModel } from "../models/TaskModel.js";
import { BuildValidationReturn } from "../utilities/ReturnValidationError.js";
import { validateTaskLanguage, validateTaskOutput } from "../utilities/validateTaskManifest.js";

export const MyTasks = async(req, res)=>{
    try {
        let {folder} = req.body || {}

        let filters = {
            ownerRef: req.user._id
        }
        if (folder) {
            filters.folder = new mongoose.Types.ObjectId(folder)
        }

        let tasks = await TaskModel.find(filters)

        return res.status(200).json(tasks)
    } catch (error) {
        return res.status(500).json(BuildValidationReturn(error.message, "error", "Unexpected error occured."))
    }
}

export const CreateTask = async(req,res)=>{
    try {
        if (!req.user || req.user.type !== "teacher") {
            return res.status(400).json(BuildValidationReturn("lacking role or req.user", "error", "You are not allowed to create tasks."))
        }

        let {title, language, folder, outputType} = req.body || {}

        if (!title || !language || !folder || !outputType) {
            return res.status(400).json(BuildValidationReturn("validation failed", "error", "Please fill all fields."))
        }

        if (!validateTaskLanguage(language) || !validateTaskOutput(outputType)) {
            return res.status(400).json(BuildValidationReturn("invalid output or lang", "error", "Invalid output type or programming language."))
        }

        let newitem = new TaskModel({title, language, folder, outputType, author: req.user._id, ownerRef: req.user._id})

        await newitem.save()

return res.status(200).json({
    ...BuildValidationReturn("ok", "success", "Create new Task successfully."),
    _id: newitem._id
});    } catch (error) {
        return res.status(500).json(BuildValidationReturn(error.message, "error", "Unexpected error occured."))
    }
}


export const DeleteTask = async(req,res)=>{
    try {
        const userid = req.user._id

        const {taskID} = req.body || {}

        if (!taskID) {
            return res.status(400).json(BuildValidationReturn("no taskid", "error", "Please provide Task ID."))
        }

        let task = await TaskModel.findById(taskID)

        if (!task) {
            return res.status(400).json(BuildValidationReturn("not found", "error", "Task not found."))
        }

        if (task.ownerRef.toString() !== userid.toString()) {
            return res.status(400).json(BuildValidationReturn("owner ref !== userid from token", "error", "You are not authorized to delete this Task."))
        }


        await task.deleteOne()

        return res.status(200).json(BuildValidationReturn("ok", "success", "Deleted task successfully."))
    } catch (error) {
        return res.status(500).json(BuildValidationReturn(error.message, "error", "Unexpected error occured."))
    }
}

export const EditTask = async(req, res)=>{
    try {
        const userid = req.user._id
        const {taskID} = req.body || {}

        if (!taskID) {
            return res.status(400).json(BuildValidationReturn("no taskid", "error", "Please provide Task ID."))
        }

        let task = await TaskModel.findById(taskID)

        if (!task) {
            return res.status(400).json(BuildValidationReturn("not found", "error", "Task not found."))
        }

        if (task.ownerRef.toString() !== userid.toString()) {
            return res.status(400).json(BuildValidationReturn("owner ref !== userid from token", "error", "You are not authorized to edit this Task."))
        }


        let {title, richText, folder, tests} = req.body || {}

        if (title) {
            task.title = title
        }

        if (richText) {
            task.richText = richText
        }

        if (folder) {
            task.folder = new mongoose.Types.ObjectId(folder)
        }

        if (tests && tests.length > 0) { //testovi moraju postojati
            task.tests = tests
        }

        await task.save()

        return res.status(200).json(BuildValidationReturn("ok", "success", "updated Task successfully."))

    } catch (error) {
        return res.status(500).json(BuildValidationReturn(error.message, "error", "Unexpected error occured."))
    }
}