import { CardTitle } from '@/components/ui/card'
import axios from 'axios'
import React, { act, useEffect, useState } from 'react'
import "./solutionintepreter.css"
import {  ArrowUpRightIcon, Car, Check, Clock, FolderCodeIcon, Pencil, ScanText, User, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import Prism from "prismjs";


import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"


import "prismjs/themes/prism-tomorrow.css";

import "prismjs/components/prism-python";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import BagdeTimer from '../BagdeTimer'
interface props {
    UserID: string
}

export type Student = {
    _id:          string;
    name:         string;
    type:         string;
    username:     string;
    teacherRef:   string;
    userExpiry?:   Date;
    groupCodeRef?: string;
    solutions:    Solution[];
    createdAt:    Date;
    updatedAt:    Date;
    __v:          number;
}

export type Solution = {
    flags:        string[];
    solutionID:   string;
    status:       string;
    code:         string;
    stderr?:       string;
    taskID:       TaskID;
    grading_date: Date;
    stdok?: string;
}

export type TaskID = {
    _id:           string;
    title:         string;
    language:      string;
    outputType:    string;
    author:        string;
    folder:        string;
    ownerRef:      string;
    downloaded:    any[];
    tests:         Test[];
    __v:           number;
    richText:      string;
    published:     boolean;
    storeOriginID: string;
}

export type Test = {
    input:  any[];
    output: string[];
    _id:    string;
}


const SolutionIntepreter = ({UserID}: props) => {

      // Sve potrebno za grade edit
    const [selectedNewStatus, setSelectedNewStatus] = useState<string|null>(null)
    const [newStatusNote, setNewStatusNote] = useState("")



const [student, setStudent] = useState<Student>()
const [activeSolution, setActiveSolution] = useState<Solution>()
    const FetchStudent = async(studentid:string) =>{
         if (!studentid) {
            return
        }

        const response = await axios.get<Student>(`${import.meta.env.VITE_BACKEND}/user/inspect/student/${studentid.toString()}`)

        if (response.status === 200) {
setStudent(response.data)
        }
        
    }

    const RegradeSolution = async() => {
      try {

if (student?._id && activeSolution?.taskID._id && selectedNewStatus) {
  const response = await axios.put(`${import.meta.env.VITE_BACKEND}/user/inspect/student/regrade`, {
          studentid: student?._id,
          taskid: activeSolution?.taskID._id,
          status: selectedNewStatus,
          note: newStatusNote
        })

        if (response.status === 200) {
          toast.success('Uspesno!')
          await FetchStudent(student._id)
          if (selectedNewStatus === 'accepted') {
            setActiveSolution(prev => ({
            ...(prev as any),
            status: selectedNewStatus,
            stdok: newStatusNote
          }))
          } else if (selectedNewStatus === 'revise') {
            setActiveSolution(prev => ({
            ...(prev as any),
            status: selectedNewStatus,
            stderr: newStatusNote
          }))
          }
        }
} else {
  toast.error("Nedostaju obavezni podaci.")
}

        
      } catch (error) {
        toast.error('Desila se greska!')
      }
    }

    useEffect(()=>{
if (UserID) {
  FetchStudent(UserID)
}
    }, [UserID])

    useEffect(() => {
    Prism.highlightAll();
  }, [activeSolution]);



    const options = [{
      alias: "Odobreno",
      value: "accepted"
    },
    {
      alias: "Odbijeno",
      value: "revise"
    }
  ]
  return (
    <div className="w-full h-full"> 
      <div 
        id="columns" 
        className='flex items-start gap-4  h-full overflow-y-auto pb-10'
      >
          <div className="w-[22%] h-full flex flex-col"> {/* Dodato h-full i flex-col ovde */}
  <CardTitle className='text-lg'>Podaci o uceniku</CardTitle>

  <div className="flex-1 w-full flex flex-col gap-2"> {/* flex-1 ovde natera ovaj div da zauzme ostatak visine kolone */}
    <div className="info-value mt-4">
      <h1><User></User>Ime i prezime</h1>
      <p>{student?.name}</p>
    </div>

   {student?.userExpiry && (
     <div className="info-value">
      <h1><Clock></Clock>Preostalo vreme grupe</h1>
      <p>{student?.userExpiry ? (
      <BagdeTimer date={student.userExpiry} />
    ) : (
      "Učitavanje..."
    )}</p>
    </div>
   )}

    {/* Sada će ovaj crveni div popuniti sav preostali prostor do dna kolone */}
    <div className="p-2 flex-1 rounded-[10px] border border-[#cecece] h-auto overflow-y-auto">
      <CardTitle className='mb-2'>Zadaci</CardTitle>
    {student?.solutions.map((item, index)=>{
      if (item.status === 'accepted') {
return (
  <div onClick={()=>{setActiveSolution(item)}} className={`${item.flags.length > 0 ? "bg-red-100" : ""} w-full hover:cursor-pointer p-2 flex items-center gap-3 border-b hover:shadow-sm transition-shadow hover:rounded`}>
        <div className="w-5 h-5 bg-green-600 rounded-lg  flex justify-center items-center">
          <Check className='text-white size-4'></Check>
        </div>
        <p>{item.taskID.title}</p>
      </div>
)
      } else if (item.status === 'revise') {
        return (
<div onClick={()=>{setActiveSolution(item)}} className={`${item.flags.length > 0 ? "bg-red-100" : ""} w-full hover:cursor-pointer p-2 flex items-center gap-3 border-b hover:shadow-sm transition-shadow hover:rounded`}>
        <div className="w-5 h-5 bg-red-600 rounded-lg  flex justify-center items-center">
          <X className='text-white size-4'></X>
        </div>
        <p>{item.taskID.title}</p>
      </div>
        )
      }
    })}




       


       




    </div>
  </div>
</div>







{activeSolution ? (
   <div className="w-[40%] h-full flex flex-col border-r"> {/* Dodato h-full i flex-col ovde */}
  <CardTitle className='text-lg mb-2'>Detalji zadatka</CardTitle>

  <p className="text-2xl font-bold">{activeSolution?.taskID.title || ""}</p>

  <div
    className="iskra-rich-text max-w-full mt-3 break-words pr-4"
    dangerouslySetInnerHTML={{ __html: activeSolution?.taskID.richText ?? ""}}
  />

   
  </div>
) : (
   <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderCodeIcon />
        </EmptyMedia>
        <EmptyTitle>Zadatak nije izabran</EmptyTitle>
        <EmptyDescription>
          Za prikaz detalja zadatka i rešenja učenika, izaberite zadatak sa leve strane prozora.
        </EmptyDescription>
      </EmptyHeader>
 

    </Empty>
)}




{activeSolution && (

 <div className="w-[40%] max-w-[40%] h-full flex flex-col ">
  <CardTitle className='text-lg mb-2'>Rešenje zadatka</CardTitle>
  <div className="w-full p-4 border-1 rounded-lg flex items-center gap-4 justify-between">
{activeSolution.status === 'accepted' && (
  <div id="solution-grade-info flex flex-col items-start">
  <p className="text-xl text-green-600">Odobreno</p>
  <p className="text-green-800">{activeSolution.stdok || "Nema beleske..."}</p>
</div>
)}

{activeSolution.status === 'revise' && (
  <div id="solution-grade-info flex flex-col items-start">
  <p className="text-xl text-red-600">Odbijeno</p>
  <p className="text-red-800">{activeSolution.stderr || "Nema beleske..."}</p>
</div>
)}

<DropdownMenu>
  <DropdownMenuTrigger>
<Button variant={'secondary'}><Pencil></Pencil></Button>

  </DropdownMenuTrigger>
  <DropdownMenuContent className='w-fit' align='end'>
<div className="shad-group ">
  {options.map((obj) => (
    <label key={obj.alias} className="shad-item">
      <input 
        type="radio" 
        name="filter" 
        value={obj.value} 
        className="shad-input"
        onChange={(e)=>{console.log(e.target.value), setSelectedNewStatus(e.target.value)}}
        checked={selectedNewStatus === obj.value}
      />
      <span className="shad-box">{obj.alias}</span>
    </label>
  ))}
</div>

<Textarea value={newStatusNote} onChange={(e)=>{setNewStatusNote(e.target.value)}} className='mt-2' placeholder='Unesite belesku ovde...'></Textarea>
<div className="flex justify-end mt-2">
  <Button onClick={()=>{RegradeSolution()}} className=''>Sacuvaj</Button>
</div>
  </DropdownMenuContent>
</DropdownMenu>
  </div>

  {activeSolution?.flags.length && (
    <div id="warnings" className='mt-2'>
    <p className=" text-lg">Upozorenja</p>
    <div className="flex gap-2 items-center p-2 flex-wrap">
      {activeSolution.flags.includes("iskra_anticheat_paste") && (
        <Tooltip>
        <TooltipTrigger>
      <Badge className='text-sm p-3' variant={'destructive'}>Potencijalno kopiranje koda</Badge>

        </TooltipTrigger>
        <TooltipContent>
          <p>Učenik je potencijalno kopirao kod sa drugih sajtova ili ostalih izvora (Google, ChatGPT, Gemini,...)</p>
        </TooltipContent>
      </Tooltip>
      )}


{activeSolution.flags.includes("iskra_anticheat_tab") && (
        <Tooltip>
        <TooltipTrigger>
            <Badge className='text-sm p-3' variant={'destructive'}>Napuštanje Iskre</Badge>

        </TooltipTrigger>
        <TooltipContent>
          <p>Učenik je na duže vreme napustio platformu, potencijalno gledanje rešenja na računaru.</p>
        </TooltipContent>
      </Tooltip>
      )}

      

    </div>

    <p className="text-red-800">
      Ova upozorenja zasnovana su na interakciji korisnika sa platformom Iskre i služe u informativne svrhe profesorima kao indikator potencijalnih kontaminacija procesa ocenjivanja.
    </p>
  </div>
  )}
    <p className="mt-2 text-lg">Rešenje</p>

  <div className="code-container">
      <pre>
        <code className="language-python">
          {activeSolution?.code || ""}
        </code>
      </pre>
    </div>
  
</div>
)}




</div>





      </div>
    
  )
}

export default SolutionIntepreter