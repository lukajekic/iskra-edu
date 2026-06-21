import mongoose from "mongoose"
import { Foldermodel } from "../models/FolderModel.js"
import { BuildValidationReturn } from "../utilities/ReturnValidationError.js"
import { TaskModel } from "../models/TaskModel.js"
import { UserModel } from "../models/UserModel.js"
import crypto from "crypto";
import { AILogModel } from "../models/AILogModel.js"

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
        const {id} = req.params || {}
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
        const {taskID} = req.params || {} 
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
    let metrica_http_count = 0
    const {solutionID, code, taskID, iskra_anticheat_paste, iskra_anticheat_tab} = req.body || {}
    if (!code || !taskID) {
        return res.status(400).json(BuildValidationReturn("validation failed.", "error", "Please send all required data."))
    }

                        const io = req.app.get('socketio')


    let student = await UserModel.findById(req.user._id)
    let flags = []
    if (iskra_anticheat_paste && iskra_anticheat_paste === "true") {
        flags.push("iskra_anticheat_paste")
    }
    if (iskra_anticheat_tab && iskra_anticheat_tab === "true") {
        flags.push("iskra_anticheat_tab")
    }
    if (!allowed_users.includes(student.type)) {
            return res.status(400).json(BuildValidationReturn("lacking role.", "error", "You are not authorized to access this data."))
        }

        let studentid = student._id
        let task = await TaskModel.findById(taskID)


        if (!task) {
            return res.status(400).json(BuildValidationReturn("not found. (task)", "error", "Task not found."))
        }


        if (solutionID) {
            let existing_solution = student.solutions.find(item => item.solutionID === solutionID)

            if (existing_solution && existing_solution.status === 'accepted') {
                return res.status(400).json(BuildValidationReturn('already correct.', 'error', 'You cannot submit already accepted answers.'))
            }
            student.solutions = student.solutions.filter(item => item.solutionID !== solutionID) // brisanje
        }


let grading_date = new Date()

let new_id = crypto.randomUUID()
        if (!task.tests || task.tests.length === 0) {
            student.solutions.push({
                solutionID: new_id,
                status: "revise",
                stderr: "Zadatak nije ispravno kreiran, molimo Vas obratite se Vasem predmetnom profesoru. (zadatak nema unete testove za proveru)",
                code: code,
                taskID: taskID,
                grading_date,
                flags: flags
            })

            await student.save()
            io.to(studentid.toString()).emit("solution_status_update", {
                task: taskID,
                status: "server",
                ai_modal: true
            })

            return res.status(200).json(BuildValidationReturn("solution checked.", "info", "Your solution is graded, results will be listed here."))
        } else {
             io.to(studentid.toString()).emit("solution_status_update", {
                task: taskID,
                status: "grading"
            })


            if (task.language === "python") {
                let stderr = ""
                if (task.outputType === "standard") {
                    let tests = task.tests

for (const test of tests) {
    let stdin = test.input.join("\n");
    let testing_instance = determineInstance()

    try {
        metrica_http_count += 1
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
                taskID: taskID,
                grading_date,
                flags: flags
            })

            await student.save()
            console.log("Metrica_http_count:", metrica_http_count)
            io.to(studentid.toString()).emit("solution_status_update", {
                task: taskID,
                status: "server", //pozvace status sa servera,
                metrica_http_count,
                ai_modal: true
            })
            return res.status(200).json(BuildValidationReturn("solution checked.", "info", "Your solution was checked, results are listed here."))
            
        } else {
        let expected_output = test.output.join("\n")
        let output_real = data.stdout.replace(/\n$/, "")
        if (expected_output !== output_real) {
            stderr = "Tvoj kod nije ispravan. Sintaksa tvog koda je u redu, međutim krajnji odgovor tvog programa nije. Proveri kako primaš i ispisuješ podatke. ✨"
            student.solutions.push({
                solutionID: new_id,
                status: "revise",
                stderr: stderr,
                code: code,
                taskID: taskID,
                dev_ocekivani_output: expected_output,
                dev_output: output_real,
                grading_date,
                flags: flags
            })

            await student.save()
            console.log("Metrica_http_count:", metrica_http_count)
            io.to(studentid.toString()).emit("solution_status_update", {
                task: taskID,
                status: "server", //pozvace status sa servera
                metrica_http_count,
                ai_modal: true
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
                taskID: taskID,
                grading_date,
                flags: flags
            })

            sendRealtimeProgressUpdate(io, student.teacherRef, student._id)
console.log("Metrica_http_count:", metrica_http_count)
            await student.save()
            io.to(studentid.toString()).emit("solution_status_update", {
                task: taskID,
                status: "accepted", //nema sta novo osim statusa
                metrica_http_count,
                grading_date
            })
            return res.status(200).json(BuildValidationReturn("solution checked.", "info", "Your solution was checked, results are listed here."))
                }




//matplotlib

else if (task.outputType === "matplotlib") {
                    let tests = task.tests

for (const test of tests) {
    let stdin = test.input.join("\n");
    let testing_instance = determineInstance()

    try {
        metrica_http_count += 1
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
                taskID: taskID,
                grading_date,
                flags: flags
            })

            await student.save()
            io.to(studentid.toString()).emit("solution_status_update", {
                task: taskID,
                status: "server", //pozvace status sa servera
                metrica_http_count,
                ai_modal: true
            })
            return res.status(200).json(BuildValidationReturn("solution checked.", "info", "Your solution was checked, results are listed here."))
            
        } else {
        let expected_output = test.output[0].replace(/\n$/, "")
        let output_real = data.stdout.replace(/\n$/, "")
        let graph = data.stdout //data.image_b64.replace("---IMG_START---", "").replace("---IMG_END---", "")


        if (expected_output !== output_real) {
            stderr = "Tvoj kod nije ispravan. Sintaksa tvog koda je u redu, međutim krajnji odgovor tvog programa nije. Proveri kako primaš i ispisuješ podatke i grafikone. ✨"
            student.solutions.push({
                solutionID: new_id,
                status: "revise",
                stderr: stderr,
                code: code,
                taskID: taskID,
                dev_ocekivani_output: expected_output,
                dev_output: output_real,
                grading_date,
                flags: flags
            })

            await student.save()
            io.to(studentid.toString()).emit("solution_status_update", {
                task: taskID,
                status: "server", //pozvace status sa servera
                metrica_http_count,
                ai_modal: true
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
                taskID: taskID,
                grading_date,
                flags: flags
            })

            sendRealtimeProgressUpdate(io, student.teacherRef, student._id)

            await student.save()
            io.to(studentid.toString()).emit("solution_status_update", {
                task: taskID,
                status: "accepted", //svakako je jedino sto novo vidi status pa da ne fetchuje ponovo
                metrica_http_count,
                grading_date
            })
            return res.status(200).json(BuildValidationReturn("solution checked.", "info", "Your solution was checked, results are listed here."))
                }



            }
        }


}


function sendRealtimeProgressUpdate(io, teacherID, studentID){
    try {
        if (!teacherID || !studentID) {
            console.log("funkciji za progress update fali nesto od parametara.")
            return
        }


        io.to(teacherID.toString()).emit("increment_progress",{
            studentid: studentID.toString()
        })

        return
    } catch (error) {
        console.log(error)
        return 
    }
}

export const RunCode = async (req, res) => {
    try {
        const body = req.body;
        
        if (!body || Object.keys(body).length === 0) {
            const errorResponse = BuildValidationReturn("no http body", "error", "Invalid data.");
            return res.status(400).json(errorResponse);
        }

        let testing_instance = determineInstance();
        
        const response = await fetch(`${testing_instance}/run`, {
            method: 'POST',
            body: JSON.stringify(body), 
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        return res.status(response.status).json(data);

    } catch (error) {
        const errorResponse = BuildValidationReturn(error.message, "error", "Unexpected error occured.");
        return res.status(500).json(errorResponse);
    }
}

export const getAIMentorHelp = async(req, res)=>{
    const html_coimng_soon = `
    <!DOCTYPE html>
        <html lang="sr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Iskra AI Mentor — Dolazi Uskoro</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    background-color: #0b0f19;
                    color: #f3f4f6;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    overflow: hidden;
                    position: relative;
                }
                /* Neonski efekat u pozadini */
                body::before {
                    content: '';
                    position: absolute;
                    width: 300px;
                    height: 300px;
                    background: radial-gradient(circle, rgba(249, 115, 22, 0.15) 0%, rgba(0,0,0,0) 70%);
                    top: 20%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 0;
                }
                .container {
                    text-align: center;
                    z-index: 1;
                    padding: 20px;
                    max-width: 600px;
                }
                .badge {
                    display: inline-block;
                    background: rgba(249, 115, 22, 0.1);
                    border: 1px solid rgba(249, 115, 22, 0.3);
                    color: #f97316;
                    padding: 6px 16px;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 24px;
                    animation: pulse 2s infinite;
                }
                h1 {
                    font-size: 2.8rem;
                    font-weight: 800;
                    letter-spacing: -0.05em;
                    margin-bottom: 16px;
                    background: linear-gradient(to right, #ffffff, #9ca3af);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                h1 span {
                    background: linear-gradient(to right, #f97316, #fbcfe8);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                p {
                    font-size: 1.15rem;
                    color: #9ca3af;
                    line-height: 1.6;
                    margin-bottom: 32px;
                }
                .card {
                    background: rgba(17, 24, 39, 0.7);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 16px;
                    padding: 24px;
                    backdrop-filter: blur(10px);
                    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.4);
                }
                .feature-list {
                    text-align: left;
                    list-style: none;
                    margin-top: 12px;
                }
                .feature-list li {
                    font-size: 0.95rem;
                    color: #d1d5db;
                    margin-bottom: 12px;
                    display: flex;
                    align-items: center;
                }
                .feature-list li::before {
                    content: '✦';
                    color: #f97316;
                    margin-right: 10px;
                    font-size: 1.1rem;
                }
                @keyframes pulse {
                    0% { opacity: 0.6; }
                    50% { opacity: 1; }
                    100% { opacity: 0.6; }
                }
            </style>
        </head>
        <body>

            <div class="container">
                <div class="badge">U razvoju</div>
                <h1>Iskra <span>AI Mentor</span></h1>
                <p>Podižemo učenje kodiranja na sledeći nivo. Tvoj lični asistent za analizu koda, pronalaženje bagova i pametne smernice stiže direktno na platformu.</p>
                
                <div class="card">
                    <ul class="feature-list">
                        <li>Pedagoški pristup otklanjanju problema</li>
                        <li>Podsticaj na razmišljanje o fundamentalnim konceptima</li>
                        <li>100% Anonimno</li>
                    </ul>
                </div>
              
              <p style="font-size:10px;margin-top:10px;">Za detalje o obradi podataka i anonimnosti, posetite dokumentaciju politike privatnosti.</p>
            </div>

        </body>
        </html>
    `



    // res.type('html')
    // res.send(html_coimng_soon)

    const studentid = req.user._id
        const {taskID} = req.params || {} 
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

    if (!single_solution) {
        return res.status(400).json(BuildValidationReturn("no solution found.", "error", "Solution not found."))
    }

    let task =  await TaskModel.findById(taskID)

    if (!task) {
        return res.status(400).json(BuildValidationReturn("Task not found.", "error", "Task not found."))
    }

    let solution_ai_used = task.ai_users.includes(req.user._id.toString()) || false
    let task_ai_allowed = task.ai_allowed ?? true

    if (!solution_ai_used && task_ai_allowed) {
        console.log("STARTING AI")
        let ai_response = await CallAI(task.richText, single_solution.code)

        if (ai_response === 'error') {
            return res.status(400).json(BuildValidationReturn("AI ERROR.", "error", "IskraAI cannot be used now."))
        }

        //ako radi

        task.ai_users.push(studentid.toString())
        await task.save()

        // logovanje u mongodb

        let new_ailog = AILogModel({
            taskID: taskID,
            task_description: task.richText,
            code: single_solution.code,
            ai_suggestion: ai_response ?? "",
            metadata: {
                timestamp: new Date(),
                language: task.language,
                model: "llama-3-8b-instruct"
            },

            dataset_export: false
        })

        await new_ailog.save()
        return res.status(200).json(ai_response ?? ".")

    } else{
        return res.status(400).json(BuildValidationReturn("AI forbidden.", "warning", "You cannot use AI on Non-AI tasks or if you already used it for this task."))
    }
}

async function CallAI(task_description, user_code) {
    let json = {
        "messages": [
            {
                "role": "system",
                "content": "AI Mentor. Pravila: Odgovaraj na srpskom, mentorski, max 2-3 rečenice. Zabranjen kod, backticks, zagrade, računski simboli i engleski nazivi funkcija (print, input, float, int). Koristi Sokratski metod sa pitanjem na kraju. Nikada ne postavljaj follow-up pitanja jer ucenik ti ne moze odgovoriti. Ono sto ti jednom kazes ucenik se dalje ne moze dopisivati."
            },
            {
                "role": "user",
                "content": `Zadatak:\n\n${task_description}\n\nKod:\n\n${user_code}`
            }
        ],
        "max_tokens": 500,
        "temperature": 0.6
    }

    try {
        const response = await fetch(process.env.AI_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": process.env.AI_API_KEY
            },
            body: JSON.stringify(json)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`AI API Error HTTP ${response.status}:`, errorText);
            return "error";
        }

        const data = await response.json();
        console.log("AI RESPONSE DATA:", data)
        const aiMessage = data?.result?.choices?.[0]?.message?.content || data?.result?.response || "";
        console.log("AI MESSAGE:", aiMessage)
        return aiMessage;
    } catch (err) {
        console.error("AI Fetch error:", err);
        return "error";
    }
}

export const checkIskraAIEligibility = async(req, res)=>{
    try {
        const studentid = req.user._id

        const {taskID} = req.params || {} 
        if (!studentid) {
            return res.status(200).json({"eligible": false})
        }

        if (!taskID) {
            return res.status(200).json({"eligible": false})        }

         if (!allowed_users.includes(req.user.type)) {
            return res.status(200).json({"eligible": false})        }



        let solutions = req.user.solutions || []
        console.log(solutions)


    let single_solution = solutions.find(item => item.taskID.equals(taskID))

    if (!single_solution) {
            return res.status(200).json({"eligible": false})
            }

    let task =  await TaskModel.findById(taskID)

    if (!task) {
            return res.status(200).json({"eligible": false})
            }

    let solution_ai_used = task.ai_users.includes(req.user._id.toString()) || false
    let task_ai_allowed = task.ai_allowed ?? true

    if (!solution_ai_used && task_ai_allowed) {
        return res.status(200).json({"eligible": true})
    }
        return res.status(200).json({"eligible": false})
    } catch (error) {
        return res.status(500).json({"eligible": false, "block": "catch", "error": error})
    }
}