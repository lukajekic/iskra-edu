import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Button } from '@/components/ui/button'
import axios from 'axios'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useGlobalTasksData } from './ExamForm'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Field } from '@/components/ui/field'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export interface Root {
  practicalTasks: PracticalTask[]
  theoryTasks: TheoryTask[]
}

export interface PracticalTask {
  taskType: string
  questionID: string
  points_max: number
  _id: string
  taskDetails: TaskDetails,
  status: ['none', 'grading', 'correct', 'incorrect']
}

export interface TaskDetails {
  _id: string
  title: string
  language: string
  outputType: string
  __v: number
  richText: string
}

export interface TheoryTask {
  taskType: string
  questionID: string
  points_max: number
  _id: string
  taskDetails: TaskDetails2,
  status: ['none', 'done']
}

export interface TaskDetails2 {
  _id: string
  title: string
  answers: string[]
  description: string
}
const statusColors: Record<string, string> = {
  none: 'bg-gray-700',
  done: 'bg-yellow-600',
  grading: 'bg-purple-600',
  correct: 'bg-green-600',
  incorrect: 'bg-red-600',
};

const TaskExplorer = () => {
  const [, setSearchParams] = useSearchParams();
  const [openFinsihModal, setOpenFinishModal] = useState(false)
  const [openAntiCheatValidationModal, setOpenAntiCheatValidationModal] = useState(false)
  const [openCredentialModal, setOpenCredentialModal] = useState(false)
  const { tasksData, setTasksData } = useGlobalTasksData()
  const navigate = useNavigate()
  const { id } = useParams();

function openFullscreen() {
  const elem = document.documentElement as any;
  const requestMethod = elem.requestFullscreen || elem.webkitRequestFullscreen || elem.mozRequestFullScreen || elem.msRequestFullscreen;
  if (requestMethod) {
    requestMethod.call(elem);
  }
}

function closeFullscreen() {
  const exitMethod = document.exitFullscreen || (document as any).webkitExitFullscreen || (document as any).mozCancelFullScreen || (document as any).msExitFullscreen;
  exitMethod?.call(document);
}
  const getTasks = async()=>{
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND}/studentexams/taskdata?test=${id}`)
      if (response.status === 200) {
        setTasksData(response.data.data)
        setOpenAntiCheatValidationModal(response.data.anticheat_action_required || false)
        openFullscreen()
      }
    } catch (error) {
      toast.error('Desila se greska.')
      navigate('/app/student/home')
    }
  }

  useEffect(()=>{
    getTasks()


window.onbeforeunload = function() {
  return "Data will be lost if you leave the page, are you sure?";
};


  }, [])
  const [approvalPass, setapprovalPass] = useState("")
  const finishTest = async()=>{
    try {
      window.onbeforeunload = null;
      const response = await axios.post(`${import.meta.env.VITE_BACKEND}/studentexams/finish?test=${id}`)
      if (response.status === 200) {
        toast.info("Kontrolni zadatak je predat.")
        closeFullscreen()
        navigate('/app/student/home')
      }
    } catch (error) {
      toast.error("Desila se greska.")
    }
  }

  const ValidateAntiCheat = async()=>{
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND}/studentexams/validate-anticheat?test=${id}`, {
        password: approvalPass
      })

      if (response.status === 200) {
        toast.success("OK")
        setOpenAntiCheatValidationModal(false)
        setOpenCredentialModal(false)
        setapprovalPass("")
      }
    } catch (error) {
      toast.error("Pogresna lozinka!")
    }
  }


  useEffect(() => {
    const handleVisibilityChange = async() => {
      if (document.hidden) {
        await axios.post(`${import.meta.env.VITE_BACKEND}/studentexams/report-cheating?test=${id}`)
        setOpenAntiCheatValidationModal(true)
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [])

  return (
    <div className='w-full p-5'>
        <p className="text-2xl font-bold border-b pb-2 mb-2">Zadaci</p>
        <p className="text-lg font-semibold">Praktični zadaci</p>

        {tasksData?.practicalTasks.map((item)=>(

          <HoverCard key={item._id} openDelay={250} closeDelay={100}>
      <HoverCardTrigger asChild>
        <div onClick={()=>{setSearchParams({task: item.taskDetails._id.toString(), type: item.taskType})}} className="p-2 border-b flex items-center gap-2 hover:bg-gray-100 hover:shadow hover:cursor-pointer">
<div id="dot-status" className={`w-5! h-5! shrink-0 rounded-[50%] ${statusColors[item?.status] || 'bg-gray-700'}`}></div>
          <span>{item.taskDetails.title}</span>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="flex w-64 flex-col gap-0.5 rounded-none">
        <div className="absolute -top-2 left-6 h-4 w-4 rotate-45 border-l border-t bg-popover" />
        <div className="font-semibold text-lg">{item.taskDetails.title}</div>
        <div><span className="font-bold text-gray-700">Maks. poena:</span> <span className='font-bold text-gray-600'>{item.points_max}</span></div>
        <hr />
        

        <div 
  className="mt-1 text-xs text-muted-foreground line-clamp-3 overflow-hidden" 
  dangerouslySetInnerHTML={{
    __html: item.taskDetails.richText
  }}
/>


      </HoverCardContent>
    </HoverCard>
          
        ))}


        <p className="text-lg font-semibold mt-5">Teorijski zadaci</p>

        {tasksData?.theoryTasks.map((item)=>(
          <div key={item._id} onClick={()=>{setSearchParams({task: item.taskDetails._id.toString(), type: item.taskType})}} className="p-2 border-b flex items-center gap-2 hover:bg-gray-100 hover:shadow hover:cursor-pointer">
          <div id="dot-status" className={`w-5 h-5 shrink-0 rounded-[50%] ${statusColors[item?.status] || 'bg-gray-700'}`}></div>
          <span>{item.taskDetails.title}</span>
        </div>
        ))}

<div className="flex justify-end mt-2">
          <Button className='bg-yellow-500 my-2' onClick={()=>{setOpenFinishModal(true)}}>Predaj kontrolni zadatak</Button>
        </div>

        <div id="status-explainer" className='flex items-center gap-2'>
          <div id="dot-status" className="w-5 h-5 shrink-0 rounded-[50%] bg-yellow-600"></div>
          <p className='text-gray-500'>-</p>
          <p className='text-gray-500 italic'>Označava status gde je zadatak popunjen (nevezano za to da li je ispravno urađen)</p>
          </div> 
           <div id="status-explainer" className='flex items-center gap-2'>
          <div id="dot-status" className="w-5 h-5 shrink-0 rounded-[50%] bg-purple-600"></div>
          <p className='text-gray-500'>-</p>
          <p className='text-gray-500 italic'>Označava status gde je zadatak u procesu ocenjivanja, potrebno je sačekati dok sistem ne odgovori sa statusom.</p>
          </div> 

            <AlertDialog open={openFinsihModal} onOpenChange={(val)=>{setOpenFinishModal(val)}}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Da li želiš predati kontrolni?</AlertDialogTitle>
          <AlertDialogDescription>
            Ukoliko potvrdiš, tvoj kontrolni zadatak biće poslat profesoru na pregled.
            Naknadne konsultacije oko tačnosti zadataka, možeš regulisati sa predmetnim profesorom.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={()=>{setOpenFinishModal(false)}}>Odustani</AlertDialogCancel>
          <AlertDialogAction onClick={()=>{finishTest()}}>Predaj</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    
    <Dialog open={openAntiCheatValidationModal}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Potrebna dozvola</DialogTitle>
        </DialogHeader>

        <p className="text-md text-gray-700 text-center">
          Uočeno je napuštanje platforme Iskra.
          <br />
          Možete odabrati opciju da sada predate kontrolni zadatak ili da zahtevate od profesora odobrenje za nastavak rada.
        </p>

        <DialogFooter>
          <Button onClick={()=>{finishTest()}} variant={'destructive'}>Predaj</Button>
          <Button onClick={()=>{setOpenCredentialModal(true)}}>Zatrazi dozvolu</Button>
          
        </DialogFooter>
      </DialogContent>
    </Dialog>

      <Dialog open={openCredentialModal}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Potrebna dozvola</DialogTitle>
        </DialogHeader>

     <Field>
      <Label>Lozinka profesora:</Label>
      <Input onChange={(e)=>{setapprovalPass(e.target.value)}} value={approvalPass} type='password'></Input>
     </Field>

        <DialogFooter>
          <Button onClick={()=>{setOpenCredentialModal(false)}} variant={'outline'}>Odustani</Button>
          <Button onClick={()=>{ValidateAntiCheat()}}>Potvrdi</Button>
          
        </DialogFooter>
      </DialogContent>
    </Dialog>


         </div>
  )
}

export default TaskExplorer