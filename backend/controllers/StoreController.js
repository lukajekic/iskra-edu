import mongoose from "mongoose"
import { TaskModel } from "../models/TaskModel.js"
import { BuildValidationReturn } from "../utilities/ReturnValidationError.js"



export const getTasks = async(req, res)=>{
    try {
        const {grade, language} = req.body || {}

        if (!grade || !language) {
            return res.status(400).json(BuildValidationReturn("missing essential filters", "error", "Please provide grade and language filters."))
        }

        if (req.user.type !== 'teacher') {
            return res.status(400).json(BuildValidationReturn("not teacher.", "error", "You are not allowed to access Tasks Store."))
        }

        let tasks = await TaskModel.find({
            grade,
            language,
            author: {$ne: req.user._id},
            folder: "000000000000000000000000"
        }).lean() //samo za preuzimanje podataka

        return res.status(200).json(tasks)
        


    } catch (error) {
        return res.status(500).json(BuildValidationReturn(error.message, "error", "Unexpected error occured."))
    }
}

export const publishTask = async(req, res)=>{
    try {
        const {taskID, grade} = req.body || {}

        if (!taskID) {
            return res.status(400).json(BuildValidationReturn("no task id", "error", "Please provide Task ID."))
        }

        if (!grade) {
            return res.status(400).json(BuildValidationReturn("no grade parameter.", "error", "You must provide appropriate grade for this Task."))
        }

        if (req.user.type !== "teacher") {
            return res.status(400).json(BuildValidationReturn("not teacher", "error", "You are not allowed to publish tasks."))
        }

        let task = await TaskModel.findById(taskID)
        if (!task) {
            return res.status(404).json(BuildValidationReturn("not found", "error", "Task not found."))
        }

        if (task.author.toString() !== task.ownerRef.toString()) {
            return res.status(400).json(BuildValidationReturn("different owner and author.", "error", "You are not authorized to publish this task."))
        }

        if (task.published && task.published === true) {
            return res.status(400).json(BuildValidationReturn("already published.", "error", "This task is already published."))
        }

        let newTask = task.toObject()


        newTask.ownerRef = null
        delete newTask._id
        delete newTask.__v

        const toPublish = new TaskModel(newTask)
        toPublish.folder = new mongoose.Types.ObjectId("000000000000000000000000")
        toPublish.grade = grade
        task.published = true
        task.storeOriginID = toPublish._id

        await toPublish.save({validateBeforeSave: false})
        await task.save()

        return res.status(200).json(BuildValidationReturn("ok", "success", "Task published successfully."))




    } catch (error) {
        return res.status(500).json(BuildValidationReturn(error.message, "error", "Unexpected error occured."))
    }
}


export const downloadTask = async(req,res)=>{
    try {
        const {taskID, folderID} = req.body || {}

        if (!taskID || !folderID) {
            return res.status(400).json(BuildValidationReturn("validation failed.", "error", "Missing Task ID or Folder ID"))
        }

        let storeTask = await TaskModel.findById(taskID)

        let toDownload = storeTask.toObject()

        delete toDownload.__v
        delete toDownload._id

        toDownload.ownerRef = req.user._id
        toDownload.storeOriginID = storeTask._id
        toDownload.folder = new mongoose.Types.ObjectId(folderID)


        let toSave = new TaskModel(toDownload)
        await toSave.save()

        return res.status(200).json(BuildValidationReturn("ok", "success", "Downloaded Task successfully."))
    } catch (error) {
        return res.status(500).json(BuildValidationReturn(error.message, "error", "Unexpected error occured."))
    }
}