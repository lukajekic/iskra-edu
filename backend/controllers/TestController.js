import mongoose, { mongo } from "mongoose"
import { BuildValidationReturn } from "../utilities/ReturnValidationError.js";
import { TestModel } from "../models/TestModel.js";


export const InitializeTest = async(req, res)=>{
    try {
        const {title=null, grade=null} = req.body || {}
        if (!title || !grade) {
            return res.status(400).json(BuildValidationReturn("no title or grade", 'error', 'Fill all required fields.'))
        }

        const authorID = req.user._id
        if (!authorID) {
            return res.status(400).json(BuildValidationReturn("Not Authorized.", 'error', "Not Authorized."))
        }

        if (req.user.type !== 'teacher') {
            return res.status(400).json(BuildValidationReturn('Not Authorized.', 'error', 'Not Authorized.'))
        }

        let newItem = new TestModel({
            title,
            grade,
            author: authorID
        })

        await newItem.save()

        return res.status(201).json({"message": "OK", "_id": newItem._id})
    } catch (error) {
        return res.status(500).json(BuildValidationReturn(error.message, 'error', 'Unexpected error occured.'))
    }
}

export const getTests = async(req, res)=>{
    try {
        const singleID = req.query.id ?? null
        const authorID = req.user._id
        if (!authorID) {
            return res.status(400).json(BuildValidationReturn("Not Authorized.", 'error', "Not Authorized."))
        }

        if (req.user.type !== 'teacher') {
            return res.status(400).json(BuildValidationReturn('Not Authorized.', 'error', 'Not Authorized.'))
        }
        if (!singleID) {
            let tests = await TestModel.find({author: new mongoose.Types.ObjectId(req.user._id)})
            return res.status(200).json(tests)
        }

        let tests = await TestModel.findOne({author: new mongoose.Types.ObjectId(authorID), _id: new mongoose.Types.ObjectId(singleID)})
        return res.status(200).json(tests)
    } catch (error) {
        return res.status(500).json(BuildValidationReturn(error.message, 'error', 'Unexpected error occured.'))
    }
}




export const editTest = async(req, res)=>{
    try {
        const singleID = req.query.id ?? null
        const authorID = req.user._id
        if (!authorID) {
            return res.status(400).json(BuildValidationReturn("Not Authorized.", 'error', "Not Authorized."))
        }

        if (req.user.type !== 'teacher') {
            return res.status(400).json(BuildValidationReturn('Not Authorized.', 'error', 'Not Authorized.'))
        }
        if (!singleID) {
            return res.status(400).json(BuildValidationReturn("No test ID", 'error', 'Missing Test ID.'))
        }
        if (!req.body || req.body == {}) {
            return res.status(400).json(BuildValidationReturn('No req.body', 'error', 'Missing update data.'))
        }


        let test = await TestModel.findOne({
            author: new mongoose.Types.ObjectId(authorID),
            _id: new mongoose.Types.ObjectId(singleID)
        })

        if (!test) {
            return res.status(400).json(BuildValidationReturn('No Item found to update.', 'error', "No item found to update."))
        }

        test.set(req.body);

        const updatedTest = await test.save()

        return res.status(200).json(updatedTest)
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json(BuildValidationReturn(error.message, 'error', 'Podaci nisu prošli validaciju modela.'))
        }
        return res.status(500).json(BuildValidationReturn(error.message, 'error', 'Unexpected error occured.'))
    }
}