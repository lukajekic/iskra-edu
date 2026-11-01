// @ts-nocheck
import { CardTitle } from '@/components/ui/card'
import axios from 'axios'
import React, { act, useEffect, useState } from 'react'
import "./solutionintepreter.css"
import {  AlertCircle, ArrowUpRightIcon, Car, Check, Clock, CodeXml, FolderCodeIcon, Pencil, ScanText, Section, User, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import Prism from "prismjs";
import { cn } from "@/lib/utils"


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
import Loader from '../Loader'
import Sectiontitle from './SectionTitle'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
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
const [loadingTasks, setLoadingTasks] = useState(false)
const [OpenWarningsConfirmationModal, setOpenWarningsConfirmationModal] = useState(false)

const [student, setStudent] = useState<Student>()
const [activeSolution, setActiveSolution] = useState<Solution>()
    const FetchStudent = async(studentid:string) =>{
         if (!studentid) {
            return
        }
        setLoadingTasks(true)

        const response = await axios.get<Student>(`${import.meta.env.VITE_BACKEND}/user/inspect/student/${studentid.toString()}`)

        if (response.status === 200) {
setStudent(response.data)
setLoadingTasks(false)
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


    const DeleteWarnings = async() => {
      try {

if (student?._id && activeSolution?.taskID._id) {
  const response = await axios.put(`${import.meta.env.VITE_BACKEND}/user/inspect/student/delete-warnings`, {
          studentid: student?._id,
          taskid: activeSolution?.taskID._id
        })

        if (response.status === 200) {
          toast.success('Uspesno!')
          await FetchStudent(student._id)
            setActiveSolution(prev => ({
            ...(prev as any),
            flags: []
            }))
           
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
        className='flex flex-col md:flex-row items-start gap-4 h-full overflow-y-auto pb-10'
      >
          <div className="w-full md:w-[22%] h-auto md:h-full flex flex-col shrink-0"> {/* Dodato h-full i flex-col ovde */}
  <Sectiontitle text='Podaci o učeniku'></Sectiontitle>

  <div className="flex-1 w-full flex flex-col gap-2"> {/* flex-1 ovde natera ovaj div da zauzme ostatak visine kolone */}
    <div className="info-value mt-4">
      <h1><User></User>Ime i prezime</h1>
      <p>{student?.name}</p>
    </div>

   {student?.userExpiry && (
     <div className="info-value">
      <h1><Clock></Clock>Preostalo vreme nastavne grupe</h1>
      <p>{student?.userExpiry ? (
      <BagdeTimer date={student.userExpiry} />
    ) : (
      "Učitavanje..."
    )}</p>
    </div>
   )}

    <div className="p-2 flex-1 rounded-[10px] border border-[#cecece] h-[250px] md:h-auto overflow-y-auto">
      <CardTitle className='mb-2'>Zadaci</CardTitle>

      {loadingTasks && (
        <div className="flex justify-center">
          <Loader></Loader>
        </div>
      )}
    <div className="flex flex-col gap-2">
      {student?.solutions.sort((a,b)=>{
      return new Date(b.grading_date).getTime() - new Date(a.grading_date).getTime()
    }).map((item, index)=>{
      if (!item?.taskID?.title) {
        return null;
      }

      if (item.status === 'accepted') {
return (
  <div key={item.solutionID || index} onClick={()=>{setActiveSolution(item)}} className={`${item.flags.length > 0 ? "bg-red-100" : ""} w-full hover:cursor-pointer p-2 flex items-center gap-3 border-1 hover:shadow-sm transition-shadow rounded-sm`}>
        <div className="shrink-0 w-5 h-5 bg-green-600 rounded-[7px]  flex justify-center items-center">
          <Check className='text-white size-4'></Check>
        </div>
        <p>{item?.taskID?.title}</p>
      </div>
)
      } else if (item.status === 'revise') {
        return (
<div key={item.solutionID || index} onClick={()=>{setActiveSolution(item)}} className={`${item.flags.length > 0 ? "bg-red-100" : ""} w-full hover:cursor-pointer p-2 flex items-center gap-3 border-1 hover:shadow-sm transition-shadow rounded-sm`}>
        <div className="shrink-0 w-5 h-5 bg-red-600 rounded-[7px]  flex justify-center items-center">
          <X className='text-white size-4'></X>
        </div>
        <p>{item?.taskID?.title}</p>
      </div>
        )
      }
      return null;
    })}
    </div>




       


       




    </div>
  </div>
</div>







{activeSolution ? (
   <div className="w-full md:w-[40%] h-auto md:h-full flex flex-col   pt-4 md:pt-0 "> {/* Dodato h-full i flex-col ovde */}
   <Sectiontitle text='Detalji zadatka'></Sectiontitle>

  <p className="text-2xl font-bold mt-3">{activeSolution?.taskID?.title || ""}</p>

  <div
    className="iskra-rich-text max-w-full mt-3 break-words pr-4"
    dangerouslySetInnerHTML={{ __html: activeSolution?.taskID?.richText ?? ""}}
  />

   
  </div>
) : (
   <Empty className="w-full md:w-[40%]">
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

 <div className="w-full md:w-[40%] md:max-w-[40%] h-auto md:h-full flex flex-col border-t md:border-t-0 pt-4 md:pt-0">
  <Sectiontitle text='Rešenje zadatka'></Sectiontitle>
  <div className={`${activeSolution.status === "accepted" ? "bg-green-100" : activeSolution.status === "revise" ? "bg-red-100" : ""} w-full p-4 border-1 rounded-lg flex items-center gap-4 justify-between mt-3`}>
{activeSolution.status === 'accepted' && (
  <div id="solution-grade-info" className="flex flex-col items-start">
  <p className="text-xl text-green-800">Odobreno</p>
  <p className="text-green-800">{activeSolution.stdok || "Nema beleske..."}</p>
</div>
)}

{activeSolution.status === 'revise' && (
  <div id="solution-grade-info" className="flex flex-col items-start">
  <p className="text-xl text-red-800">Odbijeno</p>
  <p className="text-red-800">{activeSolution.stderr || "Nema beleske..."}</p>
</div>
)}
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button
      className={`${
        activeSolution.status === "accepted"
          ? "bg-green-800 hover:bg-green-900 text-white"
          : activeSolution.status === "revise"
          ? "bg-red-800 hover:bg-red-900 text-white"
          : ""
      }`}
      variant="secondary"
    >
      <Pencil />
    </Button>
  </DropdownMenuTrigger>

  <DropdownMenuContent className="w-fit p-2 max-w-[300px]" align="end">
    <ToggleGroup
  type="single"
  value={selectedNewStatus}
  onValueChange={(val) => {
    if (val) setSelectedNewStatus(val)
  }}
  className="relative grid w-full grid-cols-2 gap-0 rounded-lg bg-muted p-1"
>
  {/* Klizna kockica */}
  <span
    aria-hidden
    className={cn(
      "pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-md shadow-sm",
      "transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
      selectedNewStatus === "accepted" && "translate-x-0 bg-green-800",
      selectedNewStatus === "revise" && "translate-x-full bg-red-800",
      selectedNewStatus !== "accepted" &&
        selectedNewStatus !== "revise" &&
        "opacity-0"
    )}
  />

  <ToggleGroupItem
    value="accepted"
    aria-label="Tačno"
    className={cn(
      "relative z-10 flex items-center justify-center gap-2 rounded-md border-0 bg-transparent shadow-none transition-colors duration-300",
      "text-muted-foreground hover:bg-transparent hover:text-green-800",
      "data-[state=on]:bg-transparent data-[state=on]:text-white data-[state=on]:hover:text-white"
    )}
  >
    <Check className="h-4 w-4" />
    <span>Tačno</span>
  </ToggleGroupItem>

  <ToggleGroupItem
    value="revise"
    aria-label="Netačno"
    className={cn(
      "relative z-10 flex items-center justify-center gap-2 rounded-md border-0 bg-transparent shadow-none transition-colors duration-300",
      "text-muted-foreground hover:bg-transparent hover:text-red-800",
      "data-[state=on]:bg-transparent data-[state=on]:text-white data-[state=on]:hover:text-white"
    )}
  >
    <X className="h-4 w-4" />
    <span>Netačno</span>
  </ToggleGroupItem>
</ToggleGroup>
    <Textarea
      value={newStatusNote}
      onChange={(e) => setNewStatusNote(e.target.value)}
      className="mt-2"
      placeholder="Unesite belesku ovde..."
    />

    <div className="flex justify-end mt-2 gap-2">
      {activeSolution.flags.length > 0 && (
        <Button onClick={()=>{setOpenWarningsConfirmationModal(true)}} variant={'destructive'}>Poništi upozorenja</Button>
      )}
      <Button onClick={() => RegradeSolution()}>Sačuvaj</Button>
    </div>
  </DropdownMenuContent>
</DropdownMenu>
  </div>

  {activeSolution?.flags.length > 0 && (
    <div id="warnings" className='mt-5'>
    <p className=" flex items-center gap-2 text-lg text-red-700"><span><AlertCircle></AlertCircle></span>Upozorenja</p>
    <div className="flex gap-2 items-center p-2 flex-wrap">
      {activeSolution.flags.includes("iskra_anticheat_paste") && (
        <Tooltip>
        <TooltipTrigger asChild>
      <Badge className='text-sm p-3' variant={'destructive'}>Potencijalno kopiranje koda</Badge>

        </TooltipTrigger>
        <TooltipContent>
          <p>Učenik je potencijalno kopirao kod sa drugih sajtova ili ostalih izvora (Google, ChatGPT, Gemini,...)</p>
        </TooltipContent>
      </Tooltip>
      )}


{activeSolution.flags.includes("iskra_anticheat_tab") && (
        <Tooltip>
        <TooltipTrigger asChild>
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
    <p className=" flex items-center gap-2 text-lg text-gray-700 mt-3"><span><CodeXml></CodeXml></span>Rešenje učenika</p>

<div className="code-container overflow-hidden rounded-lg [&_pre]:m-0 [&_pre]:rounded-lg">
  <pre>
    <code className="language-python">
      {activeSolution?.code || ""}
    </code>
  </pre>
</div>
  
</div>
)}




</div>





<AlertDialog open={OpenWarningsConfirmationModal} onOpenChange={(val)=>{setOpenWarningsConfirmationModal(val)}}>
      {/* Izmenjeno: max-w-[calc(100%-2rem)] i rounded-lg za lepši prikaz na telefonu */}
      <AlertDialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[425px] rounded-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className='text-center w-full'>Da li želite da poništite upozorenja?</AlertDialogTitle>

        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2 mt-4">
          <AlertDialogCancel onClick={()=>{setOpenWarningsConfirmationModal(false)}} className="w-full sm:w-auto mt-0">Odustani</AlertDialogCancel>
          <AlertDialogAction onClick={()=>{setOpenWarningsConfirmationModal(false), DeleteWarnings()}} className="w-full sm:w-auto" variant={'destructive'}>Potvrdi</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>




      </div>
    
  )
}

export default SolutionIntepreter