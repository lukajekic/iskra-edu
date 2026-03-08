import mongoose from "mongoose";
import { BuildValidationReturn } from "../utilities/ReturnValidationError";
import { UserModel } from "../models/UserModel";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export const createAccount = async(req, res)=>{
    let body = req.body || {}
    let {name, type, username, password, institution, ref, code} = body
    if (!name || !type || !username || !password) {
        return res.status(400).json(BuildValidationReturn("Missing required Account data.", "error", "Make sure all required data is entered."))
    }

    let users_with_username = await UserModel.countDocuments({username})
    if (users_with_username > 0) {
        username = `${username}${users_with_username + 1}`
    }

    let toInsert = {}
    toInsert.name = name
    toInsert.type = type
    toInsert.username = username

    const salt = await bcrypt.genSalt(10)
    let hashed = await bcrypt.hash(password, salt)

    toInsert.password = hashed

    if (type === "teacher") {
        if (!institution) {
            return res.status(400).json(BuildValidationReturn("Missing institution.", "error", "Your Account Info is missing Institution name."))
        }

        toInsert.institution = institution
        toInsert.activegroup = {}
    } else if (type === "student_permanent") {
        if (!ref) {
            return res.status(400).json(BuildValidationReturn("Missing Teacher reference", "error", "Student Account is missing refernece to Teacher's Account."))
        }

        toInsert.teacherRef = new mongoose.Types.ObjectId(ref)
        toInsert.solutions = []
    } else if (type === "student_temp") {
       

        if (!code) {
            return res.status(400).json(BuildValidationReturn("Missing access code", "error", "Make sure you have entered correct Class code."))
        }

        let teacher = await UserModel.findOne({"activegroup.code": code})
        if (!teacher) {
                    return res.status(400).json(BuildValidationReturn("Teacher not in DB, queried by code, maybe teacher disabled the group", "error", "We cannot find your Teacher in our records."))
                }
        toInsert.teacherRef = new mongoose.Types.ObjectId(teacher._id)
        toInsert.solutions = []
        toInsert.username = "temp"
        toInsert.password = "temp"

        
        

        if (teacher.activegroup.code != code) {
            return res.status(400).json(BuildValidationReturn("teacher.activegroup.code != code", "error", "Invalid Class code."))
        }

        

        toInsert.userExpiry = teacher.activegroup.expiry
        toInsert.groupCodeRef = teacher.activegroup.code

        const now = new Date()
        let expiryDate = new Date(teacher.activegroup.expiry);
        let difference = expiryDate.getTime() - now.getTime()
        const jwtexpiry = Math.floor(difference / 1000)
        const finalMaxAge = difference > 0 ? difference : 0;

        let toSave = new UserModel(toInsert)
    await toSave.save()
    
        res.cookie("token", generatejwt(toSave._id, jwtexpiry), {
            maxAge: finalMaxAge, //dinamicno
            secure: true,
            httpOnly: true,
            sameSite: "none"
        })

        return res.status(200).json(BuildValidationReturn("LOGIN OK", "success", "Successful Login.")) 

    }



    //cuvanje kreiranog objekta
    let toSave = new UserModel(toInsert)
    await toSave.save()
    return res.status(201).json(BuildValidationReturn("User created.", "success", "New User created successfully."))
}


export const Login = async(req, res)=>{
    let {username, password} = req.body || {}

    if (!username || !password) {
        return res.status(400).json(BuildValidationReturn("Missing credentials.", "error", "Please enter both username and password."))
    }

    let user = await UserModel.findOne({username})
    if (!user) {
        return res.status(401).json(BuildValidationReturn("Invalid credentials.", "error", "Your login credentials aren't valid."))
    }

    let verified = await bcrypt.compare(password, user.password)

    if (!verified) {
        return res.status(401).json(BuildValidationReturn("Invalid credentials.", "error", "Your login credentials aren't valid."))
    }

    if (user.type === "student_temp") {
        return res.status(400).json(BuildValidationReturn("TEMP ACC ERR", "error", "You cannot use login endpoint for logging into temporary accounts."))
    } else {
        res.cookie("token", generatejwt(user._id, 5400), {
            maxAge: 5400000, //1.5 sati
            secure: true,
            httpOnly: true,
            sameSite: "none"
        })
    }

    return res.status(200).json(BuildValidationReturn("LOGIN OK", "success", "Successful Login."))
}

export const Logout = async(req,res)=>{
    try {
       res.cookie("token", "", {
            maxAge: 0, //odjava
            secure: true,
            httpOnly: true,
            sameSite: "none"
        })

        return res.status(200).json(BuildValidationReturn("LOGOUT OK", "success", "Successful Logout."))
    } catch (error) {
        return res.status(500).json(BuildValidationReturn(error.message, "error", "Unexpected error occured."))
    }
}


function generatejwt(userid, expiresin) {
    return jwt.sign({id: userid}, process.env.JWT_SECRET, {expiresIn: expiresin})
}


export const MyProfile = async(req, res)=>{
    const useriD = req.user._id
    if (!useriD) {
        return res.status(400).json(BuildValidationReturn("no user id in req.user", "error", "Our server cannot recognize your User ID"))
    }

    let user = await UserModel.findById(useriD)
    if (!user) {
        return res.status(400).json(BuildValidationReturn("no user in db, queried by req.user._id", "error", "We couldn't locate your Account on our end."))
    }


    return res.status(200).json(user)
}