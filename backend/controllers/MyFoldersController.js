import mongoose, { mongo } from "mongoose";
import { Foldermodel } from "../models/FolderModel.js";
import { BuildValidationReturn } from "../utilities/ReturnValidationError.js";

export const getFolders = async (req, res) =>{
    try {
        let filters = {
            teacherRef: req.user._id
        }

        let items = await Foldermodel.find(filters)
        return res.status(200).json(items)
    } catch (error) {
        return res.status(500).json(BuildValidationReturn("error on myfolders controller, func: getFolders", "error", "We cannot fetch your folders."))
    }
}

export const getFoldersAndTasks = async(req, res)=>{
    try {
         let results = await Foldermodel.aggregate([
            // 1. Filtriraj foldere za određenog nastavnika koji su otvoreni
            {
                $match: {
                    teacherRef: new mongoose.Types.ObjectId(req.user._id)
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
                    visible: "$open",
                    "zadaci.title": 1,
                    "zadaci.language": 1,
                    "zadaci._id": 1,
                    _id: 0 // Isključi originalni _id ako ti smeta dupla struktura
                }
            }
        ])

        return res.status(200).json(results)
    } catch (error) {
        return res.status(500).json(BuildValidationReturn(error.message, "error", "Unexpected error occured."))
    }
}

export const createFolder = async (req, res)=>{
    try {

        let {title} = req.body || {}
        if (!title) {
            return res.status(400).json(BuildValidationReturn("no folder title", "error", "You must provide folder title."))
        }
        let toInsert = {
            title: title,
            open: true,
            teacherRef: new mongoose.Types.ObjectId(req.user._id)
        }

        const toSave = new Foldermodel(toInsert)
        await toSave.save()

        return res.status(201).json(BuildValidationReturn("OK", "success", "New folder created."))
    } catch (error) {
        return res.status(500).json(BuildValidationReturn("error on myfolders controller, func: createFolder", "error", "We cannot create new folder."))
    }
}

export const editFolder = async(req, res)=>{
    try {
        const {_id, title, open} = req.body || {}

        if (!title && open === undefined) {
            return res.status(400).json(BuildValidationReturn("no update values", "error", "You must provide at least one edit."))
        }

        let folder = await Foldermodel.findById(_id)
        if (title) {
            folder.title = title
        }

        if (open !== undefined) {  //jer je bool pa ce praviti problem sa if open
            folder.open = open
        }

        await folder.save()
        return res.status(200).json(BuildValidationReturn("OK", "success", "Updated folder successfully."))
    } catch (error) {
        return res.status(500).json(BuildValidationReturn(error.message, "error", "Unexpected error occured."))
    }
}