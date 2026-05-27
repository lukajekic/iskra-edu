import mongoose from "mongoose";
import { TaskModel } from "../models/TaskModel.js";
import { BuildValidationReturn } from "../utilities/ReturnValidationError.js";
import { validateTaskLanguage, validateTaskOutput } from "../utilities/validateTaskManifest.js";
import { UserModel } from "../models/UserModel.js";
import { Foldermodel } from "../models/FolderModel.js";

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


        let {title, richText, folder, tests, ai_allowed} = req.body || {}

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

        if (ai_allowed !== undefined) {
            task.ai_allowed = ai_allowed
        }

        await task.save()

        return res.status(200).json(BuildValidationReturn("ok", "success", "updated Task successfully."))

    } catch (error) {
        return res.status(500).json(BuildValidationReturn(error.message, "error", "Unexpected error occured."))
    }
}


export const MySingleTask = async(req, res)=>{
    try {
        if (req.user.type !== 'teacher') {
            return res.status(400).json(BuildValidationReturn("lacking role.", "error", "You cannot access this resource."))
        }

        let {taskID} = req.body || {}
        if (!taskID) {
            return res.status(400).json(BuildValidationReturn("lacking task id.", "error", "Please provide Task ID."))
        }

        let task = await TaskModel.findOne({_id: taskID, ownerRef: req.user._id}).populate('folder')
        if (!task) {
            return res.status(404).json(BuildValidationReturn("not found.", "error", "Task not found."))
        }

        let toreturn = {
            taskData: task,
            editable: false,
            published: task.published || false
        }

        if (task.ownerRef.equals(task.author)) {
            toreturn.editable = true
        }

        return res.status(200).json(toreturn)
    } catch (error) {
        return res.status(500).json(BuildValidationReturn(error.message, "error", "Unexpected error occured."))
    }
}


// Servisna funkcija
export const deleteTasksLogic = async (tasks, userId) => {
    let success = 0;
    let fail = 0;
    let deleted = [];
    let error_msgs = [];

    for (let task_id of tasks) {
        try {
            const task = await TaskModel.findById(task_id);
            
            if (!task) {
                throw new Error(`Task ${task_id} nije pronađen.`);
            }

            if (task.ownerRef.toString() !== userId.toString()) {
                throw new Error(`Nemate dozvolu za brisanje zadatka ${task_id}.`);
            }

            // 3. Ako je prošla provera, nastavi sa brisanjem
            await UserModel.updateMany(
                { "solutions.taskID": task_id },
                { $pull: { solutions: { taskID: task_id } } }
            );
            
            await TaskModel.findByIdAndDelete(task_id);
            
            success += 1;
            deleted.push(task_id);
        } catch (error) {
            fail += 1;
            error_msgs.push(error.message);
        }
    }
    return { deleted, success, fail, error_msgs };
};
// Originalni kontroler
export const DeleteTasks = async (req, res) => {
    try {
        let tasks = req.body.tasks ?? [];
        const result = await deleteTasksLogic(tasks, req.user._id);
        
        return res.status(200).json({
            deleted: result.deleted,
            successful: result.success,
            failed: result.fail
        });
    } catch (error) {
        return res.status(500).json(BuildValidationReturn(error.message, "error", "Unexpected error occured."));
    }
};

export const DeleteFolder = async (req, res) => {
    try {
        const folderId = req.body.folder || "";
        if (!mongoose.Types.ObjectId.isValid(folderId)) {
            return res.status(400).json(BuildValidationReturn("Invalid folder ID format", "error", "Neispravan ID foldera."));
        }
        const tasks = await TaskModel.find({ 
            folderRef: new mongoose.Types.ObjectId(folderId) 
        }).select('_id')

        const taskIds = tasks.map(t => t._id.toString());

        const result = await deleteTasksLogic(taskIds, req.user._id);
        await Foldermodel.findByIdAndDelete(folderId)
        return res.status(200).json({
            deleted: result.deleted,
            successful: result.success,
            failed: result.fail
        });
    } catch (error) {
        return res.status(500).json(BuildValidationReturn(error.message, "error", "Unexpected error occured."));
    }
};