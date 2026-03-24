import StudentNavbar from '@/components/custom/StudentNavbar'
import React, { useEffect, useState } from 'react'
import Editor from '@monaco-editor/react';
import { loader } from '@monaco-editor/react';
import { useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Play, Send } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';

import confetti from "canvas-confetti"
import Footer from '@/components/custom/Footer';
import EmptyStudents from './EmptyStudents';
import axios from 'axios';
import { toast } from 'sonner';

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
  const socket_data = useOutletContext()
const [disableSend, setDisableSend] = useState(false)


const handleSolutionSend = async()=>{
  try {
    if(!code) {
      toast.error("Morate napisati program kako biste poslali resenje.")
      return
    }

    setDisableSend(true)

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
      }

      if (socket_data?.status === 'server') {
        getSolution(true);
      }
      }
    }
  }, [socket_data])
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
    <div className="w-full max-w-full min-w-full flex items-start gap-0">
   <div id="student-task-details" className='p-4 basis-1/2 max-w-1/2 min-w-0 overflow-hidden'> 
  {/* Dodat overflow-hidden ovde ^ */}
  <p className="text-4xl font-bold break-words">{task?.title}</p>
  <div
    className="iskra-rich-text max-w-full mt-3 break-words"
    dangerouslySetInnerHTML={{ __html: task?.richText ?? ""}}
  />
</div>
    <div id="student-solution-editor" className='p-4 basis-1/2'>
<div className=" w-full overflow-hidden rounded-lg flex flex-col">
  <div id="solution-actions" className='w-full border-1 rounded-lg h-fit p-2 flex justify-between'>
    <div id="sa-left">
      <Tooltip>
        <TooltipTrigger>
          <Button disabled variant={'ghost'} className='text-green-600 hover:bg-green-600 hover:text-white' onClick={()=>{setOpenInputAlert(true)}}><Play></Play>Pokreni kod</Button>
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
  <div id="grading-status" className={`mt-5 rounded-t-lg flex items-center px-5 py-4 justify-between gap-2 h-fit   ${gradeStatus == "none" ? "bg-[#e6e6e6]" : gradeStatus == "accepted" ? "bg-[#2db32d] text-white" : gradeStatus == "revise" ? "bg-[#ff5959] text-white" : gradeStatus == "grading" ? "bg-[#ffdb4d]" : "bg-white" }`}>
    <div className='flex gap flex-col flex-1' id="send-info">
      <span className='text-2xl font-bold' hidden>ID 148721908</span>
      <span className='text-sm hidden'>00. 00. 0000. 00:00</span>
      {solution?.stderr && (
        <span className="text-md">{solution?.stderr}</span>
      )}
    </div>

      <div className='flex gap flex-col' id="grade-info">
      <span className='text-2xl font-bold'>{gradeStatus === 'accepted' ? "Prihvaćeno" : gradeStatus === 'grading' ? 'Ocenjivanje u toku...' : gradeStatus === 'revise' ? 'Pokušaj ponovo' : "Nije urađeno"}</span>
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
   </>
  )
}

export default StudentHome