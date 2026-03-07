import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import http from 'http'
dotenv.config()
const app = express()
app.use(cors({
    origin: "http://localhost:8123",
    credentials: true
}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser())

app.get("/", (_, res)=>{
res.send("Zdravo, Iskra.")
})

app.listen(3000, ()=>{
    console.log("Server je pokrenut na portu 3000")
})