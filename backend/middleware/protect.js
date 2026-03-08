import jwt from 'jsonwebtoken'
import { UserModel } from '../models/UserModel'
import mongoose from 'mongoose'
import { BuildValidationReturn } from '../utilities/ReturnValidationError'

export const protect = async(req, res, next) =>{
 try {
    const token = req.cookies.token

    if (!token) {
        return res.status(401).json(BuildValidationReturn("You are not authenticated to access this API, no Token found.", null, null))
    }

    const verify = jwt.verify(token, process.env.JWT_SECRET)

    if (verify) {
        const user = await UserModel.findById(verify.id)

        if (!user) {
        return res.status(401).json(BuildValidationReturn("User ID located through cookie token but no user found with that ID.", null, null))
        }

        req.user = user
        req.user.id = user._id.toString()
        req.user._id = user._id.toString()
        next()
    } else {
                return res.status(401).json(BuildValidationReturn("You are not authenticated to access this API, your token failed on jwt.verify.", null, null))
    }
 } catch (error) {
    return res.status(500).json(BuildValidationReturn("Server error on protect middleware", null, null))
 }   
}