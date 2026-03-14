import mongoose from "mongoose"
import { Foldermodel } from "../models/FolderModel.js"
import { BuildValidationReturn } from "../utilities/ReturnValidationError.js"
import { TaskModel } from "../models/TaskModel.js"
import { UserModel } from "../models/UserModel.js"

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

let activeInstance = -1
let instances = {
    0: "https://lukajekic-python-judge.hf.space",
    1: "https://lukajekic-python-judge-2.hf.space"
}
let determineInstance = ()=>{
    let keys = Object.keys(instances)
    let new_active = -1
    if (activeInstance + 1 === keys.length) {
        new_active = 0
    } else {
        new_active = activeInstance + 1
    }
    activeInstance = new_active

    return instances[activeInstance]
}
export const sendSolution = async(req,res)=>{
    const {solutionID, code, taskID} = req.body || {}
    if (!code || !taskID) {
        return res.status(400).json(BuildValidationReturn("validation failed.", "error", "Please send all required data."))
    }

    let student = await UserModel.findById(req.user._id)
    if (!allowed_users.includes(student.type)) {
            return res.status(400).json(BuildValidationReturn("lacking role.", "error", "You are not authorized to access this data."))
        }

        let studentid = student._id
        let task = await TaskModel.findById(taskID)

            const io = req.app.get('socketio')

        if (!task) {
            return res.status(400).json(BuildValidationReturn("not found. (task)", "error", "Task not found."))
        }


        if (solutionID) {
            student.solutions = student.solutions.filter(item => item.solutionID !== solutionID) // brisanje
        }


let new_id = crypto.randomUUID()
        if (!task.tests || task.tests.length === 0) {
            student.solutions.push({
                solutionID: new_id,
                status: "revise",
                stderr: "Zadatak nije ispravno kreiran, molimo Vas obratite se Vasem predmetnom profesoru. (zadatak nema unete testove za proveru)",
                code: code,
                taskID: taskID
            })

            await student.save()
            io.to(studentid).emit("solution_status_update", {
                task: taskID,
                status: "grading"
            })

            return res.status(200).json(BuildValidationReturn("solution checked.", "info", "Your solution is graded, results will be listed here."))
        } else {
            if (task.language === "python") {
                let stderr = ""
                if (task.outputType === "standard") {
                    let tests = task.tests

for (const test of tests) {
    let stdin = test.input.join("\\n");
    let testing_instance = determineInstance()

    try {
        const response = await fetch(`${testing_instance}/run`, {
            method: 'POST',
            body: JSON.stringify({ code, input_data: stdin, timeout: 5 }),
            headers: { 'Content-Type': 'application/json' }
        })
        const data = await response.json()

        if (data.stderr) {
            stderr = data.stderr
            student.solutions.push({
                solutionID: new_id,
                status: "revise",
                stderr: `❌ Python nije mogao razumeti tvoj kod: ${stderr}`,
                code: code,
                taskID: taskID
            })

            await student.save()
            io.to(studentid).emit("solution_status_update", {
                task: taskID,
                status: "server" //pozvace status sa servera
            })
            return res.status(200).json(BuildValidationReturn("solution checked.", "info", "Your solution was checked, results are listed here."))
            
        } else {
        let expected_output = test.output.join("\\n")
        if (expected_output !== data.stdout) {
            stderr = "Tvoj kod nije ispravan. Sintaksa tvog koda je u redu, međutim krajnji odgovor tvog programa nije. Proveri kako primaš i ispisuješ podatke. ✨"
            student.solutions.push({
                solutionID: new_id,
                status: "revise",
                stderr: stderr,
                code: code,
                taskID: taskID
            })

            await student.save()
            io.to(studentid).emit("solution_status_update", {
                task: taskID,
                status: "server" //pozvace status sa servera
            })
            return res.status(200).json(BuildValidationReturn("solution checked.", "info", "Your solution was checked, results are listed here."))
            
        }
        }
    } catch (error) {
        console.error("Greška pri testiranju:", error);
        return res.status(500).json(BuildValidationReturn(error.message, "error", "Your solution cannot be checked due to an error."))
    }
}
    
student.solutions.push({
                solutionID: new_id,
                status: "accepted",
                stderr: "",
                code: code,
                taskID: taskID
            })

            await student.save()
            io.to(studentid).emit("solution_status_update", {
                task: taskID,
                status: "server" //pozvace status sa servera
            })
            return res.status(200).json(BuildValidationReturn("solution checked.", "info", "Your solution was checked, results are listed here."))
                }




//matplotlib

else if (task.outputType === "matplotlib") {
                    let tests = task.tests

for (const test of tests) {
    let stdin = test.input.join("\\n");
    let testing_instance = determineInstance()

    try {
        const response = await fetch(`${testing_instance}/run`, {
            method: 'POST',
            body: JSON.stringify({ code, input_data: stdin, timeout: 5 }),
            headers: { 'Content-Type': 'application/json' }
        })
        const data = await response.json()

        if (data.stderr) {
            stderr = data.stderr
            student.solutions.push({
                solutionID: new_id,
                status: "revise",
                stderr: `❌ Python nije mogao razumeti tvoj kod: ${stderr}`,
                code: code,
                taskID: taskID
            })

            await student.save()
            io.to(studentid).emit("solution_status_update", {
                task: taskID,
                status: "server" //pozvace status sa servera
            })
            return res.status(200).json(BuildValidationReturn("solution checked.", "info", "Your solution was checked, results are listed here."))
            
        } else {
        let expected_output = test.output[0]
        let graph = data.stdout //data.image_b64.replace("---IMG_START---", "").replace("---IMG_END---", "")


        if (expected_output !== graph) {
            stderr = "Tvoj kod nije ispravan. Sintaksa tvog koda je u redu, međutim krajnji odgovor tvog programa nije. Proveri kako primaš i ispisuješ podatke i grafikone. ✨"
            student.solutions.push({
                solutionID: new_id,
                status: "revise",
                stderr: stderr,
                code: code,
                taskID: taskID
            })

            await student.save()
            io.to(studentid).emit("solution_status_update", {
                task: taskID,
                status: "server" //pozvace status sa servera
            })
            return res.status(200).json(BuildValidationReturn("solution checked.", "info", "Your solution was checked, results are listed here."))
            
        }
        }
    } catch (error) {
        console.error("Greška pri testiranju:", error);
        return res.status(500).json(BuildValidationReturn(error.message, "error", "Your solution cannot be checked due to an error."))
    }
}
    
student.solutions.push({
                solutionID: new_id,
                status: "accepted",
                stderr: "",
                code: code,
                taskID: taskID
            })

            await student.save()
            io.to(studentid).emit("solution_status_update", {
                task: taskID,
                status: "server" //pozvace status sa servera
            })
            return res.status(200).json(BuildValidationReturn("solution checked.", "info", "Your solution was checked, results are listed here."))
                }



            }
        }


}