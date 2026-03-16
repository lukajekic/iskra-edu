import mongoose from "mongoose";
import { BuildValidationReturn } from "../utilities/ReturnValidationError.js";
import { UserModel } from "../models/UserModel.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { DocumentModel } from "../models/DocumentModel.js";
import { MessageModel } from "../models/MessageModel.js";

export const createAccount = async (req, res) => {
    let body = req.body || {}
    let { name, type, username, password, institution, ref, code } = body
    if (!name || !type || !username || !password) {
        return res.status(400).json(BuildValidationReturn("Missing required Account data.", "error", "Make sure all required data is entered."))
    }

    let users_with_username = await UserModel.countDocuments({ username })
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

        let teacher = await UserModel.findOne({ "activegroup.code": code })
        if (!teacher) {
            return res.status(400).json(BuildValidationReturn("Teacher not in DB, queried by code, maybe teacher disabled the group", "error", "We cannot find your Teacher in our records."))
        }
        toInsert.teacherRef = new mongoose.Types.ObjectId(teacher._id)
        toInsert.solutions = []
        toInsert.username = "temp"
        toInsert.password = await bcrypt.hash("temp", salt)




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
}  //ISPRAVNO - 9. 3. 2026.


export const Login = async (req, res) => {
    let { username, password } = req.body || {}

    if (!username || !password) {
        return res.status(400).json(BuildValidationReturn("Missing credentials.", "error", "Please enter both username and password."))
    }

    let user = await UserModel.findOne({ username })
    if (!user) {
        return res.status(400).json(BuildValidationReturn("Invalid credentials.", "error", "Your login credentials aren't valid."))
    }

    let verified = await bcrypt.compare(password, user.password)

    if (!verified) {
        return res.status(400).json(BuildValidationReturn("Invalid credentials.", "error", "Your login credentials aren't valid."))
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
}  //ISPRAVNO - 9. 3. 2026.

export const Logout = async (req, res) => {
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
}  //ISPRAVNO - 9. 3. 2026.


function generatejwt(userid, expiresin) {
    return jwt.sign({ id: userid }, process.env.JWT_SECRET, { expiresIn: expiresin })
}  //ISPRAVNO - 9. 3. 2026.


export const MyProfile = async (req, res) => {
    const useriD = req.user._id
    if (!useriD) {
        return res.status(400).json(BuildValidationReturn("no user id in req.user", "error", "Our server cannot recognize your User ID"))
    }

    let user = await UserModel.findById(useriD).select('-password').populate('teacherRef', 'name institution').lean()
    if (!user) {
        return res.status(400).json(BuildValidationReturn("no user in db, queried by req.user._id", "error", "We couldn't locate your Account on our end."))
    }

    if (user.type === 'student_temp' || user.type === 'student_permanent') {
        delete user.solutions

    }


    return res.status(200).json(user)
}  //ISPRAVNO - 9. 3. 2026.


export const RedirectMe = async (req, res) => {
    try {
        const token = req.cookies.token

        if (!token) {
            return res.status(200).json({ "redirect": "/auth/onboarding" })
        }

        const verify = jwt.verify(token, process.env.JWT_SECRET)

        if (verify) {
            const user = await UserModel.findById(verify.id)

            if (!user) {
                return res.status(200).json({ "redirect": "/auth/onboarding" })
            }

            if (user.type === "student_permanent" || user.type === "student_temp") {
                return res.status(200).json({ "redirect": "/app/student/home", "userID": verify.id })
            } else if (user.type === "teacher") {
                return res.status(200).json({ "redirect": "/app/teacher", "userID": verify.id })
            }
        } else {
            return res.status(200).json({ "redirect": "/auth/onboarding" })
        }

    } catch (error) {
        return res.status(500).json(BuildValidationReturn("server error on redirect endpoint", "error", "We cannot find where to redirect you."))
    }
}


export const Documentation = async (req, res) => {
    try {
        let items = await DocumentModel.find();
        return res.status(200).json(items)
    } catch (error) {
        return res.status(500).json(BuildValidationReturn("error on fetching docs", "error", "Cannot get documentation."))
    }
}

export const getMessages = async (req, res) => {
    try {
        const userType = req.user.type

        if (userType === "teacher") {
            let messages = await MessageModel.find().sort({ date: -1 })

            return res.status(200).json(messages)
        }

        return res.status(400).json(BuildValidationReturn("lacking role", "error", "You are not allowed to access messages."))
    } catch (error) {
        return res.status(500).json(BuildValidationReturn(error.message, "error", "Cannot get messages."))
    }
}

export const readMessage = async (req, res) => {
    try {
        const userid = req.user._id
        const { message } = req.body || {}

        if (!userid || !message) {
            return res.status(400).json(BuildValidationReturn("missing data", "error", "Missing either User or Message ID"))
        }

        const userType = req.user.type

        if (userType === "teacher") {
            await MessageModel.findByIdAndUpdate(message, { $push: { read: userid } }, { new: true })
            return res.status(200).json({ "message": "OK" })
        }

        return res.status(400).json(BuildValidationReturn("lacking role", "error", "You are not allowed to access messages."))



    } catch (error) {
        return res.status(500).json(BuildValidationReturn(error.message, "error", "Cannot read message."))

    }
}

export const MyWorkhourGroup = async(req,res)=>{
    try {
        const userID = req.user._id
        if (!userID) {
            return res.status(400).json(BuildValidationReturn("no user id", "error", "We cannot detect your User ID."))
        }

        let user = await UserModel.findById(userID)

        if (user.type !== "teacher") {
            return res.status(400).json(BuildValidationReturn("lacking role", "error", "You are not allowed to access workhour groups."))
        }
        return res.status(200).json(user.activegroup)
    } catch (error) {
        return res.status(500).json(BuildValidationReturn(error.message, "error", "Unexpected error occured."))
    }
}


export const createWorkhourGroup = async(req, res)=>{
    try {
        const userid = req.user._id
        if (!userid) {
            return res.status(400).json(BuildValidationReturn("no user id", "error", "We cannot detect your User ID."))
        }


        let user = await UserModel.findById(userid)


//brisanje ucenika prethodne grupe
if (user.activegroup?.code) {
    await UserModel.deleteMany({type: "student_temp", groupCodeRef: user.activegroup.code})
}

        let now = Date.now()
        let due = new Date(now + 45 * 60 * 1000)
        let due_iso = due.toISOString()
        let classcode = await createClassCode()

        user.activegroup = {
            code: classcode,
            expiry: due_iso
        }

        await user.save()

        return res.status(200).json(BuildValidationReturn("new group created", "success", "New Worhour group is created successfully."))

    } catch (error) {
        return res.status(500).json(BuildValidationReturn(error.message, "error", "Unexpected error occured."))
    }
}


const createClassCode = async ()=>{
    let code = ""
    let characters = "23456789QWERTYUPASDFGHJKLZXCVBNM" //bez slova poput I i O

    for (let index = 0; index < 8; index++) {
        const letterindex = Math.floor(Math.random() * characters.length)
        code += characters.charAt(letterindex)
        
    }

    let any = await UserModel.countDocuments({"activegroup.code": code})
    if (any > 0) {
        return await createClassCode()
    } else {
        return code
    }

}

export const WorkhourTimer = async(req,res)=>{
    try {
        const userid = req.user._id
        if (!userid) {
            return res.status(400).json(BuildValidationReturn("no user id", "error", "We cannot detect your User ID."))
        }


        let user = await UserModel.findById(userid)
        if (user.type !== "teacher") {
            return res.status(400).json(BuildValidationReturn("lacking role", "error", "You are not allowed to access workhour groups."))
        }

        if (user.activegroup?.expiry) {
            return res.status(200).json(new Date(user.activegroup.expiry))
        }

        return res.status(404).json(BuildValidationReturn("no timer", "warning", "You have no active workhour groups."))
    } catch (error) {
        return res.status(500).json(BuildValidationReturn(error.message, "error", "Unexpected error occured."))
    }
}

export const endWorkhour = async(req, res)=>{
    try {
        const userid = req.user._id
        if (!userid) {
            return res.status(400).json(BuildValidationReturn("no user id", "error", "We cannot detect your User ID."))
        }

        let user = await UserModel.findById(userid)
        if (user.type !== "teacher") {
            return res.status(400).json(BuildValidationReturn("lacking role", "error", "You are not allowed to access workhour groups."))
        }

        //brisanje ucenika prethodne grupe
if (user.activegroup?.code) {
    await UserModel.deleteMany({type: "student_temp", groupCodeRef: user.activegroup.code})
}

user.activegroup = {
    expiry: null,
    code: null
}

await user.save()

return res.status(200).json(BuildValidationReturn("ok", "success", "Ended workhour successfully."))
    } catch (error) {
        return res.status(500).json(BuildValidationReturn(error.message, "error", "Unexpected error occured."))
    }
}

export const WorkhourPorgress = async(req,res) =>{
    try {
        const userid = req.user._id
        if (!userid) {
            return res.status(400).json(BuildValidationReturn("no user id", "error", "We cannot detect your User ID."))
        }

        let user = await UserModel.findById(userid)
        if (user.type !== "teacher") {
            return res.status(400).json(BuildValidationReturn("lacking role", "error", "You are not allowed to access workhour groups."))
        }

        let students = await UserModel.find({teacherRef: userid, type: "student_temp"})
        let toreturn = students.reduce((acc, curr)=>{
            let correctansers = curr.solutions.filter(item => item.status === "accepted") || []
            let studentprogress = {
                name: curr.name,
                studentid: curr._id,
                correct: correctansers.length || 0
            }
            acc.push(studentprogress)
            return acc


        }, [])

        return res.status(200).json(toreturn)


    } catch (error) {
        return res.status(500).json(BuildValidationReturn(error.message, "error", "Unexpected error occured."))
    }
}