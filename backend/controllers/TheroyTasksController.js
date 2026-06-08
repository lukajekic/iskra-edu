import mongoose from "mongoose"
import { BuildValidationReturn } from "../utilities/ReturnValidationError.js";
import { LessonModel } from "../models/LessonModel.js";
import { TheroyTAskModel } from "../models/TheoryTaskModel.js";


export const getTheoryTasks = async(req, res)=>{
    try {
        if (!req.user.type || req.user.type !== 'teacher') {
            return res.status(400).json(BuildValidationReturn('no teacher role.', 'error', 'You are not authorized to access this data.'))
        }

        if (!req.user._id) {
            return res.status(400).json(BuildValidationReturn('no req.user._id', 'error', 'Missing Account ID'))
        }

        let data = await TheroyTAskModel.find({ owner: new mongoose.Types.ObjectId(req.user._id) })
        return res.status(200).json(data)
    } catch (error) {
        return res.status(500).json(BuildValidationReturn(error.message, 'error', "unexpected error occured."))
    }
}


export const createTheoryTask = async(req, res)=>{
    try {
        if (!req.user.type || req.user.type !== 'teacher') {
            return res.status(400).json(BuildValidationReturn('no teacher role.', 'error', 'You are not authorized to access this data.'))
        }

        if (!req.user._id) {
            return res.status(400).json(BuildValidationReturn('no req.user._id', 'error', 'Missing Account ID'))
        }

        let {title=null, lesson=null} = req.body || {}
        if (!title || !lesson){
            return res.status(400).json(BuildValidationReturn('missing title or grade', 'error', 'Fill all the required fields.'))
        }

        let new_item = new TheroyTAskModel({owner:req.user._id, title, lesson, answers:[], correct_answer:null, description:""})
        await new_item.save()
        return res.status(201).json({ message: 'Task created successfully', data: new_item });
    } catch (error) {
        return res.status(500).json(BuildValidationReturn(error.message, 'error', "unexpected error occured."))
    }
}

export const updateCorrectAnswer = async(req, res)=>{
    try {
        const {taskID = null, index = null} = req.body || {}

        if (!req.user.type || req.user.type !== 'teacher') {
            return res.status(400).json(BuildValidationReturn('no teacher role.', 'error', 'You are not authorized to access this data.'))
        }

        if (!req.user._id) {
            return res.status(400).json(BuildValidationReturn('no req.user._id', 'error', 'Missing Account ID'))
        }


        let task = await TheroyTAskModel.findById(taskID)
        if (!task) {
            return res.status(400).json(BuildValidationReturn('not found.', 'error', "Task not found."))
        }

        if (task.owner.toString() !== req.user._id.toString()) {
            return res.status(400).json(BuildValidationReturn('not authorized.', 'error', 'Not Authorized.'))
        }


        let new_correct = task.answers[index]
        if (!new_correct) {
            return res.status(400).json(BuildValidationReturn('not found by index.', 'error', 'Anser not found.'))
        }

        task.correct_answer = new_correct

        await task.save()

        return res.status(200).json(BuildValidationReturn('ok.', 'success', 'Success!'))
    } catch (error) {
        return res.status(500).json(BuildValidationReturn(error.message, 'error', "Unexpected error occured."))
        
    }
}

export const addAnswer = async(req, res)=>{
    try {
        const {taskID = null, answer = null} = req.body || {}

        if (!req.user.type || req.user.type !== 'teacher') {
            return res.status(400).json(BuildValidationReturn('no teacher role.', 'error', 'You are not authorized to access this data.'))
        }

        if (!req.user._id) {
            return res.status(400).json(BuildValidationReturn('no req.user._id', 'error', 'Missing Account ID'))
        }

        if (!answer) {
            return res.status(400).json(BuildValidationReturn('no answer.', 'error', 'You must provide answer.'))
        }
        let task = await TheroyTAskModel.findById(taskID)
        if (!task) {
            return res.status(400).json(BuildValidationReturn('not found.', 'error', "Task not found."))
        }

        if (task.owner.toString() !== req.user._id.toString()) {
            return res.status(400).json(BuildValidationReturn('not authorized.', 'error', 'Not Authorized.'))
        }

        await TheroyTAskModel.updateOne(
            { _id: taskID },
            { $addToSet: { answers: answer } }
        );

        return res.status(200).json(BuildValidationReturn('ok.', 'success', 'Success!'))
    } catch (error) {
        return res.status(500).json(BuildValidationReturn(error.message, 'error', "Unexpected error occured."))
        
    }
}

export const GetTHTask = async(req, res)=>{
    try {
        const  {id=null} = req.params || {}

        if (!req.user.type || req.user.type !== 'teacher') {
            return res.status(400).json(BuildValidationReturn('no teacher role.', 'error', 'You are not authorized to access this data.'))
        }

        if (!req.user._id) {
            return res.status(400).json(BuildValidationReturn('no req.user._id', 'error', 'Missing Account ID'))
        }

        let task = await TheroyTAskModel.findById(id)
        if (!task) {
            return res.status(400).json(BuildValidationReturn('not found.', 'error', "Task not found."))
        }

        if (task.owner.toString() !== req.user._id.toString()) {
            return res.status(400).json(BuildValidationReturn('not authorized.', 'error', 'Not Authorized.'))
        }

        return res.status(200).json(task)
    } catch (error) {
        return res.status(500).json(BuildValidationReturn(error.message, 'error', "Unexpected error occured."))
    }
}


export const DeleteAnswer = async(req, res)=>{
    try {
        const {taskID = null, index = null} = req.body || {}

        if (!req.user.type || req.user.type !== 'teacher') {
            return res.status(400).json(BuildValidationReturn('no teacher role.', 'error', 'You are not authorized to access this data.'))
        }

        if (!req.user._id) {
            return res.status(400).json(BuildValidationReturn('no req.user._id', 'error', 'Missing Account ID'))
        }


        let task = await TheroyTAskModel.findById(taskID)
        if (!task) {
            return res.status(400).json(BuildValidationReturn('not found.', 'error', "Task not found."))
        }

        if (task.owner.toString() !== req.user._id.toString()) {
            return res.status(400).json(BuildValidationReturn('not authorized.', 'error', 'Not Authorized.'))
        }


        let new_correct = null
       

        task.correct_answer = new_correct

        if (task.answers && task.answers.length > index) {
    task.answers.splice(index, 1)
        }

        await task.save()

        return res.status(200).json(BuildValidationReturn('ok.', 'success', 'Success!'))
    } catch (error) {
        return res.status(500).json(BuildValidationReturn(error.message, 'error', "Unexpected error occured."))
        
    }
}


export const editInstructions = async(req, res)=>{
    try {
        const {title = null, description = null, taskID=null} = req.body || {}

        if (!req.user.type || req.user.type !== 'teacher') {
            return res.status(400).json(BuildValidationReturn('no teacher role.', 'error', 'You are not authorized to access this data.'))
        }

        if (!req.user._id) {
            return res.status(400).json(BuildValidationReturn('no req.user._id', 'error', 'Missing Account ID'))
        }

 
           
        let task = await TheroyTAskModel.findById(taskID)
        if (!task) {
            return res.status(400).json(BuildValidationReturn('not found.', 'error', "Task not found."))
        }

        if (task.owner.toString() !== req.user._id.toString()) {
            return res.status(400).json(BuildValidationReturn('not authorized.', 'error', 'Not Authorized.'))
        }

        task.title = title
        if (description) {
            task.description = description
        }

        await task.save()

        return res.status(200).json(BuildValidationReturn('ok.', 'success', 'Success!'))
    } catch (error) {
        return res.status(500).json(BuildValidationReturn(error.message, 'error', "Unexpected error occured."))
        
    }
}