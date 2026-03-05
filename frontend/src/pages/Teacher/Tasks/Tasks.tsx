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


type ModalStatus = {
  newtask: boolean,
  newfolder: boolean,
  folderinfo: boolean
}
async function getData(): Promise<Payment[]> {
  // Fetch data from your API here.
  return [
    {
      id: "728ed52f",
       status: "pending",
     done: [10, 4, 70],
    },

    {
      id: "sadefr",
      status: "success",
     done: [55, 2, 27],
    },
    // ...
  ]
}
const Tasks =   () => {
     const [modalStatus, setModalState] = useState<ModalStatus>({
      newtask: false,
      newfolder: false,
      folderinfo: false
    })
const [data, setData] = useState<Payment[]>([])
  useEffect(() => {
    const loadData = async () => {
      const result = await getData()
      setData(result)
    }

    loadData()
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
  <button onClick={()=>{setModalState(prev => ({...prev, folderinfo: true}))}} id="folder" className="border border-gray-200 rounded-lg w-35 min-h-30 active:border-[2px] active:border-blue-400 px-2 flex flex-col gap-2 items-center pt-2 pb-2 hover:cursor-pointer"><img src={foldericon} className='h-[80px]' alt="" />
  <p className='break-all'>Naziv foldera naziv folderadsfgfhfgdsfdghnggefgdb</p></button>
</div>


<Dialog open={modalStatus.newtask} onOpenChange={(val)=>setModalState(prev => ({...prev, newtask: val}))}>
  <DialogContent>
    <DialogHeader>
      Dodaj zadatak
    </DialogHeader>
    <FieldGroup>
      <Field>
        <Label>
          Naziv zadatka
        </Label>
        <Input>
        </Input>
      </Field>


  <Field>
        <Label>
          Programski jezik
        </Label>
        <Select>
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
          Folder
        </Label>
        <Select>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Folders</SelectLabel>
          <SelectItem value="apple1"><img src={foldericon} className='w-4'></img>Apple 1</SelectItem>
          <SelectItem value="apple2"><img src={foldericon} className='w-4'></img>Apple 2</SelectItem>
          <SelectItem value="apple3"><img src={foldericon} className='w-4'></img>Apple 3</SelectItem>

        </SelectGroup>
      </SelectContent>
    </Select>
      </Field>
    </FieldGroup>
 
    <DialogFooter>
      <Button onClick={()=>{setModalState(prev => ({...prev, newtask: false}))}} variant={'outline'}>Odustani</Button>
      <Button>Sacuvaj</Button>
    </DialogFooter>
    </DialogContent>
</Dialog>


<Dialog open={modalStatus.newfolder} onOpenChange={(val)=>setModalState(prev => ({...prev, newfolder: val}))}>
  <DialogContent>
    <DialogHeader>
      Dodaj folder
    </DialogHeader>
    <Label>Imenujte folder</Label>
    <div className="flex flex-col items-center gap-2">
      <img src={foldericon} className='w-[75px]' alt="" />
      <Input className='text-center'></Input>
    </div>

    <DialogFooter>
      <Button onClick={()=>{setModalState(prev => ({...prev, newfolder: false}))}} variant={'outline'}>Odustani</Button>
      <Button>Sacuvaj</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>


<Dialog open={modalStatus.folderinfo} onOpenChange={(val)=>setModalState(prev => ({...prev, folderinfo: val}))} >
  <DialogContent showCloseButton={true}>
<DialogHeader>Folder: foldername</DialogHeader>
<div className="p-2 border-b-1 active:border-2 active:border-blue-400 rounded-lg flex items-center gap-2 hover:cursor-pointer">
  <img src={py_icon} className='size-6' alt="" />
  <span className="flex-1 break-all">fdgihjyortejfdogbhoefjgornjfdogrbjdrdojfognbjnohtrgjew3pojfgebhgerfjg</span>
</div>
  </DialogContent>
</Dialog>
    <Footer></Footer>
    </>
  )
}

export default Tasks