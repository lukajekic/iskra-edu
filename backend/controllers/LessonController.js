import mongoose from "mongoose"
import { BuildValidationReturn } from "../utilities/ReturnValidationError.js";
import { LessonModel } from "../models/LessonModel.js";


export const getLessons = async(req, res)=>{
    try {
        if (!req.user.type || req.user.type !== 'teacher') {
            return res.status(400).json(BuildValidationReturn('no teacher role.', 'error', 'You are not authorized to access this data.'))
        }

        if (!req.user._id) {
            return res.status(400).json(BuildValidationReturn('no req.user._id', 'error', 'Missing Account ID'))
        }

        let data = await LessonModel.find({ owner: new mongoose.Types.ObjectId(req.user._id) })
        return res.status(200).json(data)
    } catch (error) {
        return res.status(500).json(BuildValidationReturn(error.message, 'error', "unexpected error occured."))
    }
}


export const createLesson = async(req, res)=>{
    try {
        if (!req.user.type || req.user.type !== 'teacher') {
            return res.status(400).json(BuildValidationReturn('no teacher role.', 'error', 'You are not authorized to access this data.'))
        }

        if (!req.user._id) {
            return res.status(400).json(BuildValidationReturn('no req.user._id', 'error', 'Missing Account ID'))
        }

        let {title=null, grade=null} = req.body || {}
        if (!title || !grade){
            return res.status(400).json(BuildValidationReturn('missing title or grade', 'error', 'Fill all the required fields.'))
        }

        let new_item = new LessonModel({owner:req.user._id, title, grade})
        await new_item.save()
        return res.status(201).json({ message: 'Lesson created successfully', data: new_item });
    } catch (error) {
        return res.status(500).json(BuildValidationReturn(error.message, 'error', "unexpected error occured."))
    }
}