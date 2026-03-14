import mongoose from "mongoose"
import { Foldermodel } from "../models/FolderModel.js"
import { BuildValidationReturn } from "../utilities/ReturnValidationError.js"
import { TaskModel } from "../models/TaskModel.js"

const allowed_users = ['student_temp', 'student_permanent']


export const getFolders = async(req, res)=>{
    try {
        
        if (!allowed_users.includes(req.user.type)) {
            return res.status(400).json(BuildValidationReturn("lacking role.", "error", "You are not authorized to access this data."))
        }

        if (!req.user.teacherRef){
            return res.status(400).json(BuildValidationReturn("No teacherref", "error", "Your account is not connected to any teacher."))
        }

         let results = await Foldermodel.aggregate([
    // 1. Filtriraj foldere za određenog nastavnika koji su otvoreni
    {
        $match: {
            teacherRef: new mongoose.Types.ObjectId(req.user.teacherRef),
            open: true
        }
    },
    // 2. Spoji sa kolekcijom "tasks" (pazi da je name u bazi tačan, npr. "tasks")
    {
        $lookup: {
            from: "tasks", // Ime kolekcije u bazi (obično množina)
            localField: "_id", // Polje u Folderu (po kojem tražiš taskove)
            foreignField: "folder", // Polje u Tasku koje drži naziv foldera
            as: "zadaci" // Kako će se zvati niz sa taskovima u rezultatu
        }
    },
    // 3. Selektuj samo polja koja ti trebaju
    {
        $project: {
            folderName: "$title",
            folderId: "$_id",
            "zadaci.title": 1,
            "zadaci.language": 1,
            "zadaci._id": 1,
            _id: 0 // Isključi originalni _id ako ti smeta dupla struktura
        }
    }
])


return res.status(200).json(results)

    } catch (error) {
        return res.status(500).json(BuildValidationReturn(error.message, "error", "Cannot get Tasks."))
    }
}


export const getTask = async(req, res)=>{
    try {
        const {id} = req.body || {}
        if (!id) {
            return res.status(400).json(BuildValidationReturn("no task id", "error", "Please provide Task ID."))
        }
 if (!allowed_users.includes(req.user.type)) {
            return res.status(400).json(BuildValidationReturn("lacking role.", "error", "You are not authorized to access this data."))
        }

        if (!req.user.teacherRef){
            return res.status(400).json(BuildValidationReturn("No teacherref", "error", "Your account is not connected to any teacher."))
        }


        let task = await TaskModel.findById(id).select("-author -tests -published -storeOriginID").lean()

        if (!task) {
                        return res.status(400).json(BuildValidationReturn("not found.", "error", "We cannot find this Task."))

        }

        if (!task.ownerRef) {
            return res.status(400).json(BuildValidationReturn("cannot determine task owner, maybe error or fetching task which is for store", "error", "We cannot find this Task."))
        }
        if (task.ownerRef.toString() !== req.user.teacherRef.toString()) {
            return res.status(400).json(BuildValidationReturn("student's teacher !== task owner", "error", "You are not allowed to access this Task."))
        }

return res.status(200).json(task)

    } catch (error) {
        return res.status(500).json(BuildValidationReturn(error.message, "error", "Cannot get Task details."))
    }
}

export const getSolution = async(req, res)=>{
    try {
        const studentid = req.user._id
        const {taskID} = req.body || {} 
        if (!studentid) {
            return res.status(400).json(BuildValidationReturn("no req.user._id", "error", "We cannot determine your Student ID."))
        }

        if (!taskID) {
            return res.status(400).json(BuildValidationReturn("no task id", "error", "Please provide Task ID."))
        }

         if (!allowed_users.includes(req.user.type)) {
            return res.status(400).json(BuildValidationReturn("lacking role.", "error", "You are not authorized to access this data."))
        }


        let solutions = req.user.solutions || []
        console.log(solutions)


    let single_solution = solutions.find(item => item.taskID.equals(taskID))

        return res.status(200).json(single_solution || null)

    } catch (error) {
        return res.status(500).json(BuildValidationReturn(error.message, 'error', "Cannot get your Solution."))
    }
}