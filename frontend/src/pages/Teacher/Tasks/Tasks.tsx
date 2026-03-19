import PageTitle from '@/components/custom/PageTitle'
import { Button } from '@/components/ui/button'
import { FolderPlus, Info, PlusSquare } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import Footer from '@/components/custom/Footer'
import { DataTable } from '@/components/custom/data-table'
import { columns, type Payment } from './columns'
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Field, FieldGroup } from '@/components/ui/field'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import foldericon from "../../../assets/folder.png"
import py_icon from "../../../assets/python.svg"

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
import { useNavigate } from 'react-router-dom'


type ModalStatus = {
  newtask: boolean,
  newfolder: boolean,
  folderinfo: boolean
}

type Folder = {
    zadaci:     Zadaci[];
    folderName: string;
    folderId:   string;
    visible: boolean
}

 type Zadaci = {
    _id:      string;
    language: string;
    title:    string;
}

type NewTask = {
  title: string,
  folder: string,
  language: string,
  outputType: "standard" | "matplotlib"
}

const Tasks =   () => {
  const navigate = useNavigate()
  const [proposedFolderView, setProposedFolderView] = useState<boolean|null>(null)
  const[newFolderName, setNewFodlerName] = useState<string>("")
  const createFodler = async()=>{
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND}/my/folders/create`, {
        title: newFolderName
      })

      if (response.status === 201) {
        getFolders()
        setModalState(prev => ({...prev, newfolder: false}))
        setNewFodlerName("")
      }
    } catch (error) {
      
    }
  }
     const [modalStatus, setModalState] = useState<ModalStatus>({
      newtask: false,
      newfolder: false,
      folderinfo: false
      
    })



// forma novog zadatka
 const [newTaskForm, setNewTaskForm] = useState<NewTask>({
  title: "",
  folder: "",
  language: "python",
  outputType: "standard"
})

const initializeTask = async()=>{
  try {
    const response = await axios.post(`${import.meta.env.VITE_BACKEND}/my/tasks/initialize`, newTaskForm)
    if (response.status === 200) {
      setModalState(prev => ({...prev, newtask: false}))
      setNewTaskForm({
  title: "",
  folder: "",
  language: "python",
  outputType: "standard"
})
navigate(`/app/teacher/editor/${response.data._id}`)
    }
  } catch (error) {
    console.error(error)
  }
}

const [data, setData] = useState<Folder[]>([])
const [activeFolder, setActiveFolder] = useState<Folder>()

const publishVisibility = async()=>{
  try {
    const response = await axios.put(`${import.meta.env.VITE_BACKEND}/my/folders/edit`, {
      _id: activeFolder?.folderId,
      open: proposedFolderView
    })

    if (response.status === 200) {
      setProposedFolderView(null)
      setModalState(prev => ({...prev, folderinfo: false}))
      getFolders()
    }
  } catch (error) {
    console.error(error)
  }
}


const getFolders = async ()=>{
  try {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND}/my/folders/tasks`)
    if (response.status === 200) {
      setData(response.data)
    }
  } catch (error) {
    console.error(error)
  }
}
  useEffect(() => {
    getFolders()
  }, [])

  return (
    <>
    <PageTitle title='Zadaci' subtitle='Pratite sve Vaše foldere i zadatke koje ste organizovali u njih.'></PageTitle>
    <div className="w-full flex gap-0 justify-between">
   <div className='w-full lg:w-[70%] pr-0 mr-0 h-fit'>
       <Alert className='mt-3 '>
      <Info></Info>
      <AlertTitle>
        Hijerarhija
      </AlertTitle>
      <AlertDescription>
        Svaki zadatak koji kreirate ili preuzmete mora biti smešten u jedan folder, u okviru tog foldera ga otražuju Vaši učenici.
      </AlertDescription>
    </Alert>


 <div className="flex items-center gap-2 mt-3">
      <Button onClick={()=>{setModalState(prev => ({...prev, newtask: true}))}}><PlusSquare></PlusSquare>Novi zadatak</Button>
      <Button onClick={()=>{setModalState(prev => ({...prev, newfolder: true}))}} variant={'outline'}><FolderPlus></FolderPlus>Novi folder</Button>
    </div>
   </div>
    

    <img src="/undraw_scrum-board_7bgh.svg" className='  h-[150px] hidden lg:block ' alt="" />
    </div>
    <div className="h-2"></div>
   

        <div className="h-2"></div>

<div className="w-full flex gap-2 flex-wrap py-2">
  {data.map((item, index)=>(
    <button key={index} onClick={()=>{setActiveFolder(item), setModalState(prev => ({...prev, folderinfo: true}))}} id="folder" className="border border-gray-200 rounded-lg w-35 min-h-30 active:border-[2px] active:border-blue-400 px-2 flex flex-col gap-2 items-center pt-2 pb-2 hover:cursor-pointer"><img src={foldericon} className='h-[80px]' alt="" />
  <p className='break-all'>{item?.folderName}</p></button>
  ))}
</div>


<Dialog open={modalStatus.newtask} onOpenChange={(val)=>setModalState(prev => ({...prev, newtask: val}))}>
 <form onSubmit={(e)=>{e.preventDefault()}} action="">
   <DialogContent>
    <DialogHeader>
      Dodaj zadatak
    </DialogHeader>
    <FieldGroup>
      <Field>
        <Label>
          Naziv zadatka
        </Label>
        <Input value={newTaskForm?.title} onChange={(e)=>{setNewTaskForm(prev => ({...prev, title: e.target.value}))}} name='title' type='text' required>
        </Input>
      </Field>


  <Field>
        <Label>
          Programski jezik
        </Label>
        <Select value={newTaskForm?.language} onValueChange={(e)=>{setNewTaskForm(prev => ({...prev, language: e}))}} name='language' required>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Dostupni jezici</SelectLabel>
          <SelectItem value="python"><img src={py_icon} className='w-4'></img>Python</SelectItem>

        </SelectGroup>
      </SelectContent>
    </Select>
      </Field>


        <Field>
        <Label>
          Vrsta ispisa
        </Label>
        <Select value={newTaskForm?.outputType} onValueChange={(e)=>{setNewTaskForm(prev => ({...prev, outputType: e}))}} name='outputType' required>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Dostupni jezici</SelectLabel>
          <SelectItem value="standard">Standardni ispis</SelectItem>
          <SelectItem value="matplotlib">Biblioteka matplotlib</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
      </Field>


      <Field>
        <Label>
          Folder
        </Label>
        <Select value={newTaskForm?.folder} onValueChange={(e)=>{console.log(e), setNewTaskForm(prev => ({...prev, folder: e}))}} name='folder' required >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Folderi</SelectLabel>
{data.map((item, index)=>(
            <SelectItem key={index} value={item.folderId}><img src={foldericon} className='w-4'></img>{item?.folderName}</SelectItem>

))}

        </SelectGroup>
      </SelectContent>
    </Select>
      </Field>
    </FieldGroup>
 
    <DialogFooter>
      <Button type='button' onClick={()=>{setModalState(prev => ({...prev, newtask: false})), setNewTaskForm({
  title: "",
  folder: "",
  language: "python",
  outputType: "standard"
})}} variant={'outline'}>Odustani</Button>
      <Button type='submit' onClick={()=>{initializeTask()}}>Sacuvaj</Button>
    </DialogFooter>
    </DialogContent>
 </form>
</Dialog>


<Dialog open={modalStatus.newfolder} onOpenChange={(val)=>setModalState(prev => ({...prev, newfolder: val}))}>
  <DialogContent>
    <DialogHeader>
      Dodaj folder
    </DialogHeader>
    <Label>Imenujte folder</Label>
    <div className="flex flex-col items-center gap-2">
      <img src={foldericon} className='w-[75px]' alt="" />
      <Input value={newFolderName} onChange={(e)=>{setNewFodlerName(e.target.value)}} className='text-center'></Input>
    </div>

    <DialogFooter>
      <Button type='button' onClick={()=>{setModalState(prev => ({...prev, newfolder: false}))}} variant={'outline'}>Odustani</Button>
      <Button type='submit' onClick={()=>{createFodler()}}>Sacuvaj</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>


<Dialog open={modalStatus.folderinfo} onOpenChange={(val)=>setModalState(prev => ({...prev, folderinfo: val}))} >
  <DialogContent showCloseButton={true}>
<DialogHeader><span>Folder: <strong>{activeFolder?.folderName}</strong></span></DialogHeader>


<div className="flex items-center space-x-2">
      <Switch checked={!activeFolder?.visible} onCheckedChange={(val)=>{setActiveFolder(prev => ({...prev, visible: !val})), console.log(!val), setProposedFolderView(!val)}} id="airplane-mode" />
      <Label htmlFor="airplane-mode">Sakrij folder od učenika</Label>
    </div>
<div className="flex flex-col gap-2">
  {activeFolder?.zadaci.map((item, index)=>(
  <div className="p-2 border-b-1 active:border-2 active:border-blue-400 rounded-lg flex items-center gap-2 hover:cursor-pointer">
  <img src={py_icon} className='size-6' alt="" />
  <span key={index} className="flex-1 break-all">{item.title}</span>
</div>
))}
</div>



  </DialogContent>
</Dialog>

<Dialog open={proposedFolderView !== null}>
  <DialogContent>
    <DialogHeader>Izmeni folder</DialogHeader>
    {proposedFolderView ? (
<>
<div className="flex flex-col items-center gap-2">
  <img src="/undraw_private-files_m2bw.svg" className='size-30' alt="" />
  <p className="text-xl font-bold text-center">Da li želite da prikažete ovaj folder i sve njegove zadatke učenicima?</p>
</div>
</>
    ) : (<>
    <div className="flex flex-col items-center gap-2">
  <img src="/undraw_private-files_m2bw.svg" className='size-30' alt="" />
  <p className="text-xl font-bold text-center">Da li želite da sakrijete ovaj folder i sve njegove zadatke od učenika?</p>
</div>
</>)}
    <DialogFooter>
      <Button onClick={()=>{
    setActiveFolder(prev => ({
      ...prev, 
      visible: !proposedFolderView 
    }));

    setProposedFolderView(null);
  }} variant={'outline'}>Odustani</Button>
      <Button onClick={()=>{publishVisibility()}}>Nastavi</Button>
      </DialogFooter>
  </DialogContent>


</Dialog>
    <Footer></Footer>
    </>
  )
}

export default Tasks