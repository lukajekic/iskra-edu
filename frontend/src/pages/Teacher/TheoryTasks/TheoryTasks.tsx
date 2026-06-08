import PageTitle from '@/components/custom/PageTitle'
import { Button } from '@/components/ui/button'
import { BookText, CircleCheck, FileQuestionMark, FolderPlus, Info, PlusSquare } from 'lucide-react'
import React, { act, useEffect, useState } from 'react'
import Footer from '@/components/custom/Footer'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import foldericon from "../../../assets/folder.png"
import py_icon from "../../../assets/python.svg"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from '@/components/ui/switch'
import axios from 'axios'
import { useNavigate, useSearchParams } from 'react-router-dom'
import LoaderModal from '@/components/custom/LoaderModal'
import { Input } from '@/components/ui/input'
import { Field } from '@/components/ui/field'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog'
import { toast } from 'sonner'

type ModalStatus = {
  newtask: boolean,
  newfolder: boolean,
  folderinfo: boolean
}

type Lesson = {
  title: string,
  grade: string,
  _id: string
}

type Zadaci = {
    _id:      string;
    title: string,
    lesson: string
}

type NewTask = {
  title: string,
  lesson: string
}

const TheoryTasks = () => {
  const grades = [
    "V razred osnovne škole",
    "VI razred osnovne škole",
    "VII razred osnovne škole",
    "VIII razred osnovne škole",
    "I razred srednje škole",
    "II razred srednje škole",
    "III razred srednje škole",
    "IV razred srednje škole"
  ]

  const [SearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [tasks, setTasks] = useState<Zadaci[]>([])
  const [modalStatus, setModalState] = useState<ModalStatus>({
    newtask: false,
    newfolder: false,
    folderinfo: false
  })

  // Stanja za forme
  const [newFolderName, setNewFolderName] = useState<string>("")
  const [newFolderGrade, setNewFolderGrade] = useState<string>("")
  const [newTaskForm, setNewTaskForm] = useState<NewTask>({
    title: "",
    lesson: ""
    })
const [activeFolder, setActiveFolder] = useState<Lesson|null>(null)
  const getFolders = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${import.meta.env.VITE_BACKEND}/my/lessons`)
      if (response.status === 200) {
        setLessons(response.data)
        setLoading(false)
      }
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }

  const GetTasks = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${import.meta.env.VITE_BACKEND}/my/theory-tasks`)
      if (response.status === 200) {
        setTasks(response.data)
        setLoading(false)
      }
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }

  const openEditor = (taskID:string)=>{
    navigate(`/app/teacher/theory-editor/${taskID}`)
  }

  const createFolder = async () => {
    try {
      setLoading(true)
      const response = await axios.post(`${import.meta.env.VITE_BACKEND}/my/lessons`, {
        title: newFolderName,
        grade: newFolderGrade
      })

      if (response.status === 201) {
        getFolders()
        setModalState(prev => ({...prev, newfolder: false}))
        setNewFolderName("")
        setNewFolderGrade("")
        setLoading(false)
      }
    } catch (error) {
      toast.error("Greška pri kreiranju lekcije")
      setLoading(false)
    }
  }

  const initializeTask = async () => {
    try {
      setLoading(true)
      const response = await axios.post(`${import.meta.env.VITE_BACKEND}/my/theory-tasks`, newTaskForm)
      if (response.status === 201) {
        setLoading(false)
        setModalState(prev => ({...prev, newtask: false}))
        navigate(`/app/teacher/theory-editor/${response.data.data._id}`)
      }
    } catch (error) {
      toast.error("Greška pri kreiranju zadatka")
      setLoading(false)
    }
  }

  useEffect(() => {
    getFolders()
    GetTasks()
    if (SearchParams.get("ActiveModal") === "new_folder") {
      setModalState(prev => ({...prev, newfolder: true}))
    }
  }, [])

  return (
    <>
      <PageTitle title='Teorijski zadaci' subtitle='Pratite sve Vaše lekcije i zadatke koje ste organizovali u njih.' />
      
      <div className="w-full flex gap-0 justify-between">
        <div className='w-full lg:w-[70%] pr-0 mr-0 h-fit'>
          <Alert className='mt-3'>
            <Info />
            <AlertTitle>Hijerarhija</AlertTitle>
            <AlertDescription>
              Svaki zadatak koji kreirate mora biti smešten u jednu lekciju.
            </AlertDescription>
          </Alert>

          <div className="flex items-center gap-2 mt-3">
            <Button onClick={() => setModalState(prev => ({...prev, newtask: true}))}><PlusSquare className="mr-2" />Novi zadatak</Button>
            <Button onClick={() => setModalState(prev => ({...prev, newfolder: true}))} variant={'outline'}><FolderPlus className="mr-2" />Nova lekcija</Button>
          </div>
        </div>
        <img src="/undraw_education_3vwh.svg" className='h-[150px] hidden lg:block' alt="" />
      </div>

      <div className="w-full flex gap-2 flex-wrap py-2">
        <Accordion type="single" collapsible className="w-full">
          {grades.map((grade) => (
            <AccordionItem value={grade} key={grade}>
              <AccordionTrigger className='font-bold text-md'>{grade}</AccordionTrigger>
              <AccordionContent className=''>
                {lessons.filter(f => f.grade === grade).map(folder => (
                  <div key={folder._id} className="p-2 hover:bg-slate-50 rounded-lg flex items-center gap-2 cursor-pointer" onClick={() => {setActiveFolder(folder) ,setModalState(prev => ({...prev, folderinfo: true})) }}>
                    <BookText className="size-4" />
                    <span>{folder.title}</span>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <Dialog open={modalStatus.newtask} onOpenChange={(val) => setModalState(prev => ({...prev, newtask: val}))}>
        <DialogContent>
          <DialogHeader>Dodaj zadatak</DialogHeader>
          <Field>
            <Label>Naziv zadatka</Label>
            <Input value={newTaskForm.title} onChange={(e) => setNewTaskForm(prev => ({...prev, title: e.target.value}))} />
          </Field>
          <Field>
            <Label>Lekcija</Label>
            <Select onValueChange={(val) => setNewTaskForm(prev => ({...prev, lesson: val}))}>
              <SelectTrigger><SelectValue placeholder="Izaberite lekciju" /></SelectTrigger>
              <SelectContent>
                {lessons.map((item) => (
                  <SelectItem value={item._id}  >
                    <div className="flex items-center gap-2"><img src={foldericon} className='w-4' />{item.title}</div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <DialogFooter>
            <Button variant={'outline'} onClick={() => setModalState(prev => ({...prev, newtask: false}))}>Odustani</Button>
            <Button onClick={initializeTask}>Sacuvaj</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modalStatus.newfolder} onOpenChange={(val) => setModalState(prev => ({...prev, newfolder: val}))}>
        <DialogContent>
          <DialogHeader>Dodaj lekciju</DialogHeader>
          <Field>
            <Label>Naziv lekcije</Label>
            <Input value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} />
          </Field>
          <Field>
            <Label>Razred</Label>
            <Select onValueChange={(val) => setNewFolderGrade(val)}>
              <SelectTrigger><SelectValue placeholder="Odaberite razred" /></SelectTrigger>
              <SelectContent>
                {grades.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <DialogFooter>
            <Button variant={'outline'} onClick={() => setModalState(prev => ({...prev, newfolder: false}))}>Odustani</Button>
            <Button onClick={createFolder}>Sacuvaj</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />


      <Dialog open={modalStatus.folderinfo} onOpenChange={(val)=>setModalState(prev => ({...prev, folderinfo: val}))} >
  <DialogContent showCloseButton={true}>
<DialogHeader><span>Lekcija: <strong>{activeFolder?.title}</strong></span></DialogHeader>

<div className="flex flex-col gap-2">
   
{tasks.filter(item => item.lesson === activeFolder?._id).map((item, index)=>(
  <div key={index} onClick={()=>{openEditor(item._id)}} className="p-2 border-1 active:border-2 active:border-blue-400 rounded-lg flex items-center gap-2 hover:cursor-pointer">
  <CircleCheck/>
  <span key={index} className="flex-1 break-all">{item.title}</span>
</div>
))}

{tasks.filter(item => item.lesson === activeFolder?._id).length == 0 ? (
  <p className='italic'>Nema zadataka za ovu lekciju.</p>
) : ''}


</div>



  </DialogContent>
</Dialog>

      <LoaderModal open={loading} />
    </>
  )
}

export default TheoryTasks