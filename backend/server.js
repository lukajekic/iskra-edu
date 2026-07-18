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
import LessonRouter from './routes/LessonRoutes.js'
import TheoryTaskRouter from './routes/TheoryTaskRoutes.js'
import TestRouter from './routes/TestRoutes.js'
dotenv.config()
import  visualizer  from 'express-routes-visualizer'
import StudentExamsRouter from './routes/StudentExamsRoutes.js'
import PlannerRouter, { aiRouter } from './routes/PlannerRoutes.js'
import CanvasRouter from './routes/CanvasRoutes.js'
const app = express()
connectMongoDB()



app.use(cors({
    origin: ["http://localhost:5173", "https://k547nh3t-5173.euw.devtunnels.ms", "https://iskra-edu.vercel.app"],
    credentials: true
}));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser())

//demo api
app.get("/", (_, res)=>{
const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>Hello, World!</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
 <link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet">

<section id="hero" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; color: #CC5500; text-align: center; font-family: 'Inter', sans-serif;">
  <img alt="" src="/favicon.png" style="margin-bottom: 1rem;">
  <h1 style="margin: 0;">Zdravo, Iskra.</h1>
    <p style="margin: 0; margin-top:10px;">Pristupite platformi preko portala.</p>

</section>
  </body>
</html>
`

res.type('html')
res.send(html)
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
app.use('/my/lessons', LessonRouter)
app.use('/my/theory-tasks', TheoryTaskRouter)
app.use('/my/tests', TestRouter)
app.use('/store', StoreRoutes)
app.use('/my/students', MyStudentsRoutes)
app.use('/app/student', StudentAppRoutes)
app.use('/studentexams', StudentExamsRouter)
app.use('/planner', PlannerRouter)
app.use('/api/ai', aiRouter)
app.use('/api/canvas', CanvasRouter)
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



socket.on('join_room_fwork_warning', (roomName) => {
  socket.join(roomName)
  console.log(`Socket ${socket.id} je ušao u sobu za work_forbidden: ${roomName}`);
  
  socket.emit('message', `Usao si ušao u sobu (work_forbidden) profesora: ${roomName}`);
})

socket.on('join_exam_room', (roomName)=>{
  socket.join(roomName)
  console.log(`Soket ${socket.id} je usao u sobu za realtime updejte ispita za solution id: ${roomName}`)

  socket.emit('message', `Usao si u sobu za realtime updejte ispita za soluiton id ${roomName}`)

  socket.emit('update_exam_solution_status', {abc: "cde"})
  
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
server.listen(process.env.PORT || 3000, '0.0.0.0', ()=>{
    console.log("Server je pokrenut na portu", process.env.PORT || 7860)
})
