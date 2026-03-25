import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import http from 'http'
import { connectMongoDB } from './utilities/mongodb.js'
import userrouter from './routes/UserRoutes.js'
import MyFolderRoutes from './routes/MyFolderRoutes.js'
import MyTasksRouter from './routes/MyTasksRoutes.js'
import StoreRoutes from './routes/StoreRoutes.js'
import MyStudentsRoutes from './routes/MyStudentsRoutes.js'
import StudentAppRoutes from './routes/StudentAppRoutes.js'
import { Server } from 'socket.io'
dotenv.config()
const app = express()
connectMongoDB()
app.use(cors({
    origin: ["http://localhost:5173", "https://k547nh3t-5173.euw.devtunnels.ms", "https://iskra-edu.vercel.app"],
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
app.use('/my/tasks', MyTasksRouter)
app.use('/store', StoreRoutes)
app.use('/my/students', MyStudentsRoutes)
app.use('/app/student', StudentAppRoutes)
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

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

io.on('connection', (socket)=>{
  socket.emit('message', 'konektovano')

  socket.on('test', (data) => {
    console.log("poslao:", data);
    socket.emit('message', 'Primljeno');
  })


  socket.on('join_room', (roomName) => {
  socket.join(roomName)
  console.log(`Socket ${socket.id} je ušao u sobu: ${roomName}`);
  
  socket.emit('message', `Usao si ušao u sobu: ${roomName}`);
})
})

app.set('socketio', io)
app.post('/devstatus', (req, res) => {
  io.to('69af08bb9e31852b60dad191').emit('solution_status_update', {
    task: "69b5b9b48c66c60fbb8121e0",
    status: "accepted"
  });

  return res.sendStatus(200); // Koristi sendStatus za čist 200 OK
});
server.listen(process.env.PORT || 7860, '0.0.0.0', ()=>{
    console.log("Server je pokrenut na portu", process.env.PORT || 7860)
})