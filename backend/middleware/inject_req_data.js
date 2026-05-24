import jwt from 'jsonwebtoken'
import { UserModel } from '../models/UserModel.js'
import mongoose from 'mongoose'
import { BuildValidationReturn } from '../utilities/ReturnValidationError.js'

export const inject_req_data = async(req, res, next) =>{
 try {
    const token = req.cookies.token

    if (!token) {
        req.user = null
        return next()
    }

    const verify = jwt.verify(token, process.env.JWT_SECRET)

    if (verify) {
        const user = await UserModel.findById(verify.id)

        if (user) {
            req.user = user
            req.user.id = user._id.toString()
            req.user._id = user._id.toString()
        } else {
            req.user = null
        }
        next()
    } else {
        req.user = null
        next()
    }
 } catch (error) {
    req.user = null
    next()
 }   
}