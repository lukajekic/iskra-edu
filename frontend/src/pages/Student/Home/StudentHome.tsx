import StudentNavbar from '@/components/custom/StudentNavbar'
import React, { useState } from 'react'
import Editor from '@monaco-editor/react';
import { loader } from '@monaco-editor/react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Play, Send } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';

import confetti from "canvas-confetti"

type props = {
  openPicker: {
    folderID: string,
    open: boolean
  }
}
const StudentHome = () => {
  const [gradeStatus, setGradeStatus] = useState<"none" | "accepted" | "revise" | "grading">("accepted")
  const [params] = useSearchParams()
  const [openInputAlert, setOpenInputAlert] = useState(false)
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



  return (
   <>
   {taskID && (
    <div className="w-full max-w-full min-w-full flex items-start gap-0">
    <div id="student-task-details" className='p-4 basis-1/2'>
      <p className="text-4xl font-bold">Naziv zadatka</p>
   <p className='mt-2'>Ovde ide <strong>rich text</strong> opis.</p>
    </div>
    <div id="student-solution-editor" className='p-4 basis-1/2'>
<div className=" w-full overflow-hidden rounded-lg flex flex-col">
  <div id="solution-actions" className='w-full border-1 rounded-lg h-fit p-2 flex justify-between'>
    <div id="sa-left">
      <Tooltip>
        <TooltipTrigger>
          <Button variant={'ghost'} className='text-green-600 hover:bg-green-600 hover:text-white'><Play></Play>Pokreni kod</Button>
        </TooltipTrigger>

        <TooltipContent>
          Tvoj kod neće biti poslat, dok ne klikneš na dugme „Pošalji na pregled“ <br />
          Ova opcija namenjena da testiraš svoj kod pre slanja.
        </TooltipContent>
      </Tooltip>
    </div>
    <div id="sa-right">
      <Button variant={'default'} onClick={()=>{handleConfetti()}}><Send></Send>Pošalji na pregled</Button>
    </div>
  </div>
  <div id="grading-status" className={`mt-5 rounded-t-lg flex items-center px-5 py-4 justify-between gap-2 h-fit   ${gradeStatus == "none" ? "bg-[#e6e6e6]" : gradeStatus == "accepted" ? "bg-[#2db32d] text-white" : gradeStatus == "revise" ? "bg-[#ff5959] text-white" : gradeStatus == "grading" ? "bg-[#ffdb4d]" : "bg-white" }`}>
    <div className='flex gap flex-col' id="send-info">
      <span className='text-2xl font-bold'>ID 148721908</span>
      <span className='text-sm'>00. 00. 0000. 00:00</span>
    </div>

      <div className='flex gap flex-col' id="grade-info">
      <span className='text-2xl font-bold'>Pokusaj ponovo</span>
      <span className='text-sm'>00. 00. 0000. 00:00</span>
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

></Editor>
</div>
    </div>
   </div>
   )}


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