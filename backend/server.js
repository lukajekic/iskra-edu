import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import http from 'http'
import { connectMongoDB } from './utilities/mongodb.js'
import userrouter from './routes/UserRoutes.js'
import MyFolderRoutes from './routes/MyFolderRoutes.js'
dotenv.config()
const app = express()
connectMongoDB()
app.use(cors({
    origin: "http://localhost:8123",
    credentials: true
}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser())

//demo api
app.get("/", (_, res)=>{
res.send("Zdravo, Iskra.")
})


app.get("/run", async (req, res)=>{
    let stdouts = []
    for (let index = 0; index < 5; index++) {
        const result = await runPythonCode(index)
        stdouts.push(result)
        
    }
    res.json(stdouts)
})

//kraj demo api-ja


//rute

app.use("/user", userrouter)
app.use("/my/folders", MyFolderRoutes)
async function runPythonCode(index) {
  const url = "https://lukajekic-python-judge.hf.space/run";
  
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    "code": "print(input(), input(), input())",
    "input_data": `Luka\nJekic\n${index}`,
    "timeout": 5
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };

  try {
    const response = await fetch(url, requestOptions);
    const result = await response.json();
    console.log("Rezultat:", result);
    return result
  } catch (error) {
    console.error("Greška:", error);
    return error
  }
}

app.listen(3000, ()=>{
    console.log("Server je pokrenut na portu 3000")
})