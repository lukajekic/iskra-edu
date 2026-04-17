import StudentNavbar from '@/components/custom/StudentNavbar'
import React, { useContext, useEffect, useState } from 'react'
import Editor from '@monaco-editor/react';
import { loader } from '@monaco-editor/react';
import { useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, Play, Send, X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';

import confetti from "canvas-confetti"
import Footer from '@/components/custom/Footer';
import EmptyStudents from './EmptyStudents';
import axios from 'axios';
import { toast } from 'sonner';
import TerminalRunner from '@/components/custom/TerminalRunner';
import TerminalResponse from '@/components/custom/TerminalResponse';
import { CreateMetricaView, CreateMetricaEvent } from "@lukajekic/metrica-sdk";
import moment from 'moment-timezone';
import { WorkForbiddenContext } from '@/pages/Teacher/StudentDashboardWrapper';

type props = {
  openPicker: {
    folderID: string,
    open: boolean
  }
}

type Task = {
    _id:        string;
    language:   string;
    outputType: string;
    folder:     string;
    title:      string;
    ownerRef:   string;
    richText?:   string;
}


const StudentHome = () => {

  const metrica_events = {
    "accepted": "69d3dcffbcef93be94541ac1",
    "incorrect": "69d3dd18bcef93be94541ac8",
    "process": "69d3dd34bcef93be94541acf",
    "pyjudge": "69d3dd48bcef93be94541ad6"
  }

  useEffect(()=>{
      CreateMetricaView(import.meta.env.VITE_METRICA)
    }, [])
  const socket_data = useOutletContext()
const [disableSend, setDisableSend] = useState(false)
const prebrojInpute = (kod:string) => {
  const bezStringova = kod
    .replace(/"[^"\\]*(?:\\.[^"\\]*)*"/g, '') // Brise duple navodnike
    .replace(/'[^'\\]*(?:\\.[^'\\]*)*'/g, ''); // Brise obicne navodnike

  // Brise komentare
  const bezKomentara = bezStringova.replace(/#[^\n]*/g, '');

  // Broji prave pozive
  const matches = bezKomentara.match(/input\s*\(/g);
  return matches ? matches.length : 0;
};

const handleCodeRun = ()=>{
  if (!code){
    toast.error("Morate napisati program kako bi ga pokrenuli.")
  }

  setTErminalResponse(null)

  let inputcount = prebrojInpute(code)
  console.log("ocekivani inputi", inputcount)
  setTerminalInputCount(inputcount)
  setopenTerminal(true)

  
}

const [openTerminal, setopenTerminal]= useState(false)
const [terminalInputCount, setTerminalInputCount] = useState(0)
const [terminalResponse, setTErminalResponse] = useState()

const handleSolutionSend = async()=>{
  try {
    if(!code) {
      toast.error("Morate napisati program kako biste poslali resenje.")
      return
    }

    setDisableSend(true)
    CreateMetricaEvent(import.meta.env.VITE_METRICA, metrica_events.process)
    const response = await axios.post(`${import.meta.env.VITE_BACKEND}/app/student/solution/create`, {
      solutionID: solution.solutionID,
      code: code,
      taskID: searchParams.get('task')
    })
  } catch (error) {
    console.error(error)
  }
}


  useEffect(() => {
    if (socket_data) {
      console.log("!!! Primljen update preko socketa u Child-u:", socket_data);

      if (socket_data.metrica_http_count){
        for (let index = 0; index < socket_data.metrica_http_count; index++) {
          CreateMetricaEvent(import.meta.env.VITE_METRICA, metrica_events.pyjudge)

          
        }
      }
      
      // Ovde mapiraj podatke sa socketa na tvoj lokalni state
      // Na primer, ako socket šalje: { status: "accepted", solutionID: "..." }
      if (socket_data?.task === searchParams.get('task')) {
        if (socket_data?.status) {
        setGradeStatus(socket_data?.status);
      }

      // Ovde možeš dodati i druge akcije, npr. ako je "accepted" baci konfete
      if (socket_data?.status === "accepted" || socket_data?.status === 'grading') {
        
        setDisableSend(true)
      }  else {
        setTimeout(() => {
          setDisableSend(false)
        }, 15000);
      }

      if (socket_data?.status === 'accepted') {
        handleConfetti();
        setSolution(prev => ({...prev, stderr: ""}))

        if (socket_data.grading_date) {
          setSolution(prev => ({...prev, grading_date: socket_data.grading_date}))
        }
        CreateMetricaEvent(import.meta.env.VITE_METRICA, metrica_events.accepted)
      }

      if (socket_data?.status === 'server') {
        getSolution(true);
      }
      }
    }

    console.log("Socket_data", socket_data)
  }, [socket_data])

  const { work_forbidden, set_work_forbidden } = useContext(WorkForbiddenContext)

  const [gradeStatus, setGradeStatus] = useState<"none" | "accepted" | "revise" | "grading">("none")
  const [params] = useSearchParams()
  const [openInputAlert, setOpenInputAlert] = useState(false)
  const [task, setTask] = useState<Task>()
  const [solution, setSolution] = useState()
  const [code, setCode] = useState("")
  const taskID = params.get("task")
  const handleConfetti = () => {
    const end = Date.now() + 3 * 1000 // 3 seconds
    const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"]
    const frame = () => {
      if (Date.now() > end) return
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: 0, y: 0.5 },
        colors: colors,
      })
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        startVelocity: 60,
        origin: { x: 1, y: 0.5 },
        colors: colors,
      })
      requestAnimationFrame(frame)
    }
    frame()
  }
  const [searchParams, setSearchParams] = useSearchParams();

const getTask = async()=>{
  try {
    const response = await axios.get<Task>(`${import.meta.env.VITE_BACKEND}/app/student/task/${searchParams.get('task')}`)
    if (response.data) {
      setTask(response.data)
    }
  } catch (error) {
    console.error(error)
  }
}


const getSolution = async (shouldWait = false) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND}/app/student/solution/${searchParams.get('task')}`);
    
    if (response.data) {
      const status = response.data.status;
      setSolution(response.data);
      setGradeStatus(status);
      setCode(response.data.code);

      if (status === 'accepted' || status === 'grading') {
        setDisableSend(true);
        
      } 
      else if (status === 'revise') {
        if (shouldWait) {
          CreateMetricaEvent(import.meta.env.VITE_METRICA, metrica_events.incorrect)
          setDisableSend(true); 
          setTimeout(() => {
            setDisableSend(false);
          }, 15000);
        } else {
          setDisableSend(false);
        }
      } 
      else {
        setDisableSend(false);
      }
    } else {
      setSolution({ status: "none", code: "" });
      setGradeStatus("none");
      setDisableSend(false);
      setCode("")
    }
  } catch (error) {
    console.error(error);
  }
};

    useEffect(()=>{
      console.log(`Promena task parametra (main): ${searchParams.get('task')}`)
      getTask()
      getSolution()
    }, [searchParams])


  return (
   <>
   {taskID && (
    <div className="w-full max-w-full min-w-full flex flex-col md:flex-row items-start gap-0 pt-5 md:pt-0">
   <div id="student-task-details" className='p-4 md:basis-1/2 md:max-w-1/2 min-w-0 overflow-hidden'> 
  {/* Dodat overflow-hidden ovde ^ */}
  <p className="text-4xl font-bold break-words">{task?.title}</p>
  <div
    className="iskra-rich-text max-w-full mt-3 break-words"
    dangerouslySetInnerHTML={{ __html: task?.richText ?? ""}}
  />
</div>
    <div id="student-solution-editor" className='p-4 md:basis-1/2 w-full '>
<div className=" w-full overflow-hidden rounded-lg flex flex-col">
  {!work_forbidden && (
    <div id="solution-actions" className='w-full min-w-full border-1 rounded-lg h-fit p-2 flex justify-between'>
    <div id="sa-left">
      <Tooltip>
        <TooltipTrigger>
          <Button  variant={'ghost'} className='text-green-600 hover:bg-green-600 hover:text-white' onClick={()=>{handleCodeRun()}}><Play></Play>Pokreni kod</Button>
        </TooltipTrigger>

        <TooltipContent>
          Tvoj kod neće biti poslat, dok ne klikneš na dugme „Pošalji na pregled“ <br />
          Ova opcija namenjena da testiraš svoj kod pre slanja.
        </TooltipContent>
      </Tooltip>
    </div>
    <div id="sa-right">
      <Button disabled={disableSend} variant={'default'} onClick={()=>{handleSolutionSend()}}><Send></Send>Pošalji na pregled</Button>
    </div>
  </div>
  )}
  <div id="grading-status" className={`mt-5 rounded-t-lg flex flex-col-reverse items-start md:flex-row md:items-center px-5 py-4 justify-between gap-2 h-fit   ${gradeStatus == "none" ? "bg-[#e6e6e6]" : gradeStatus == "accepted" ? "bg-[#2db32d] text-white" : gradeStatus == "revise" ? "bg-[#ff5959] text-white" : gradeStatus == "grading" ? "bg-[#ffdb4d]" : "bg-white" }`}>
    <div className='flex gap flex-col flex-1' id="send-info">
      <span className='text-2xl font-bold' hidden>ID 148721908</span>
      <span className='text-md '>{
        (solution?.grading_date && solution?.status === "accepted") ? moment(solution?.grading_date).tz("Europe/Belgrade").format("DD. MM. YYYY. HH:mm") : ""
        }</span>
      {solution?.stderr && (
        <span className="text-md">{solution?.stderr}</span>
      )}
    </div>

      <div className='flex gap flex-col' id="grade-info">
      <span className='text-2xl font-bold'>{gradeStatus === 'accepted' ? (<span className='inline-flex items-center gap-2'><Check/>Prihvaćeno</span>) : gradeStatus === 'grading' ? 'Ocenjivanje u toku...' : gradeStatus === 'revise' ? (<span className='inline-flex items-center gap-2'><X/>Pokušaj ponovo</span>) : "Nije urađeno"}</span>
      <span className='text-sm hidden'>00. 00. 0000. 00:00</span>
    </div>
  </div>
  <div className="h-5 bg-[#1e1e1e]"></div>
  
  <Editor
options={{
    selectOnLineNumbers: true,
    renderWhitespace: "all",
    quickSuggestions: {
      other: true,
      comments: true,
      strings: true
    },
    suggestOnTriggerCharacters: true,
    wordBasedSuggestions: "allDocuments", // Ovo će nuditi reči koje si već kucao
    links: true,
    colorDecorators: true,
  }}
className='rounded-2xl'
height={500}
theme='vs-dark'
defaultLanguage='python'
onChange={(e)=>{console.log(JSON.stringify(e)), setCode(e)}}
value={code}
></Editor>
</div>
    </div>
   </div>
   )}

{!taskID && (
  <>
  <EmptyStudents></EmptyStudents>
  <div className="h-5"></div>
  </>
)}
   <Footer></Footer>


<Dialog   >
  <DialogContent showCloseButton={false} className='min-w-fit max-w-fit w-fit'>
<Spinner className='size-6'></Spinner>
  </DialogContent>
</Dialog>



<Dialog open={openInputAlert} onOpenChange={(val)=>{setOpenInputAlert(val)}}>
  <DialogContent className='min-w-fit p-5'>
    <DialogHeader className='text-lg font-bold'>Upozorenje!</DialogHeader>
    <div className="flex items-center gap-5">
      <img src="/undraw_working-together_r43a.svg" className='w-[250px]' alt="" />
      <span className='w-[250px] text-lg text-right'>Programi koji zahtevaju <strong>"input()"</strong> ne mogu biti pokrenuti, trenutno je moguće isključivo poslati zadatak na pregled i tako uvideti tačnost zadataka.</span>
    </div>
  </DialogContent>
</Dialog>
{openTerminal && (
  <TerminalRunner codeOrigin={code} onClose={(response)=>{setopenTerminal(false), console.log(response), setTErminalResponse(response)}} count={terminalInputCount}></TerminalRunner>
)}

{terminalResponse && (
  <>
  <TerminalResponse response={terminalResponse} onClose={()=>{setTErminalResponse(null)}}></TerminalResponse>
  </>
)}
   </>
  )
}

export default StudentHome