import PageTitle from '@/components/custom/PageTitle'
import { Button } from '@/components/ui/button'
import { Import, Info, PlusSquare } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import Footer from '@/components/custom/Footer'
import { DataTable } from '@/components/custom/data-table'
import { getColumns } from './columns'
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Field, FieldGroup } from '@/components/ui/field'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"



import axios from 'axios'
import { setDate } from 'date-fns'
import { useUserId } from '@/context/UserContext'
import { toast } from 'sonner'
import LoaderModal from '@/components/custom/LoaderModal'

type ModalStatus = {
  create: boolean,
  edit: boolean,
  delete: boolean
}

type Student = {
    _id:      string;
    name:     string;
    username: string;
    __v:      number;
}


const Students =   () => {
  const [loading, setLoading] = useState(true)
  const {userID} = useUserId()
    const [modalStatus, setModalState] = useState<ModalStatus>({
    create: false,
    edit: false,
    delete: false
  })

  const [editStudentForm, setEditStudentForm] = useState({
    name: "",
    newpassword: "",
    _id: ""
  })

  const [createStudentForm, setCreateStudentForm] = useState({
    name: "",
    password: ""

  })

  const createStudent = async()=>{
    if (!createStudentForm.name || !createStudentForm.password) {
      toast.error("Unesite osnovne podatke.")
    }
    try {
      setLoading(true)
      const response = await axios.post(`${import.meta.env.VITE_BACKEND}/user/create`, {
        name: createStudentForm.name,
        password: createStudentForm.password,
        type: "student_permanent",
username: createStudentForm.name.toLowerCase().replace(/đ/g, "dj").normalize('NFD').replace(/[\u0300-\u036f]/g, "").replaceAll(" ", "."),
ref: userID
})

if (response.status === 201) {
  setModalState(prev => ({...prev, create: false}))
  getStudents()
  setLoading(false)
}
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }
  const [data, setData] = useState<Student[]>([])


  const deleteStudent = async()=>{
    try {
      setLoading(true)
      const response = await axios.put(`${import.meta.env.VITE_BACKEND}/my/students/delete`, {
        id: editStudentForm._id
      })

      if (response.status === 200) {
        setModalState(prev => ({...prev, delete: false}))
        getStudents()
        setLoading(false)
      }
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }

  const editStudent = async()=>{
    try {
      setLoading(true)
      const response = await axios.put(`${import.meta.env.VITE_BACKEND}/my/students/edit`, {
        id: editStudentForm._id,
        name: editStudentForm.name,
        password: editStudentForm.newpassword
      })

      if (response.status === 200) {
 setModalState(prev => ({...prev, edit: false}))
        getStudents()
        setLoading(false)
      }
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }
  const getStudents = async()=>{
  try {
    setLoading(true)
    const response = await axios.get<Student[]>(`${import.meta.env.VITE_BACKEND}/my/students`)
    console.log(response)
    if (response.status === 200) {
      setData(response.data)
      setLoading(false)
    }
  } catch (error) {
    console.error(error)
    setLoading(false)
  }
}


  useEffect(() => {
    getStudents()
  }, [])

  return (
    <>
    <PageTitle title='Učenici' subtitle='Trajni nalozi Vaših učenika'></PageTitle>

    <div className="w-full flex gap-0 justify-between">
           <Alert className='mt-3 h-fit w-full lg:w-[70%]'>
      <Info></Info>
      <AlertTitle>
        Preporuka
      </AlertTitle>
      <AlertDescription>
        Preporučeno je da na početku upotrebe Iskra sistema kreirate sivm sovjim učenicima naloge i omogućite rad i vežbu zadataka od kuće, stalni pristup, uvid u lična prethodna rešenja bez vremenskih ograničenja.
      </AlertDescription>
    </Alert>
    
        <img src="/undraw_true-friends_1h3v.svg" className='  h-[150px] hidden lg:block ' alt="" />
        </div>
   
    <Button onClick={()=>{setModalState(prev =>({...prev, create: true}))}}><PlusSquare></PlusSquare>Novi učenik</Button>
        <div className="h-5"></div>
<DataTable  filter={{key: "name", input_label: "Pretraga..."}} data={data} columns={getColumns({onEdit: (student)=> [setModalState(prev => ({...prev, edit: true})), setEditStudentForm({name: student.name, newpassword: "", _id: student._id})], onDelete: (student)=> [setModalState(prev => ({...prev, delete: true})), setEditStudentForm({name: student.name, newpassword: "", _id: student._id})]})}></DataTable>



{/* edit */}
<Drawer  direction='right' open={modalStatus.edit} onOpenChange={(val)=>setModalState(prev => ({...prev, edit: val}))} >
  <DrawerContent className='pb-[60px]'>
    <DrawerHeader className='font-bold text-lg'>
      Izmeni učenika
    </DrawerHeader>
    <FieldGroup className='px-5'>
      <Field>
        <Label>
          Ime i prezime
        </Label>
        <Input value={editStudentForm.name} onChange={(e)=>{setEditStudentForm(prev => ({...prev, name: e.target.value}))}}></Input>
        </Field>


        <Field>
        <Label>
          Nova lozinka
        </Label>
        <Input value={editStudentForm.newpassword} onChange={(e)=>{setEditStudentForm(prev => ({...prev, newpassword: e.target.value}))}}></Input>
        </Field>
    </FieldGroup>
    <DrawerFooter>
    <Button variant={'outline'} onClick={()=>setModalState(prev =>({...prev, edit: false}))}>Odusani</Button>
    <Button onClick={()=>{editStudent()}}>Sacuvaj</Button>
  </DrawerFooter>
  </DrawerContent>
  
</Drawer>


<Dialog open={modalStatus.create} onOpenChange={(val)=>setModalState(prev => ({...prev, create: val}))} >
  <DialogContent>
    <DialogHeader>
      Dodaj ucenika
    </DialogHeader>
    <FieldGroup>
      <Field>
        <Label>
          Ime i prezime
        </Label>
        <Input onChange={(e)=>{setCreateStudentForm(prev => ({...prev, name: e.target.value}))}}>
        </Input>
      </Field>


         <Field>
        <Label>
          Lozinka
        </Label>
        <Input onChange={(e)=>{setCreateStudentForm(prev => ({...prev, password: e.target.value}))}}>
        </Input>
      </Field>
    </FieldGroup>
    <Alert>
              <Info></Info>

      <AlertTitle>
        Podaci za prijavu
      </AlertTitle>
      <AlertDescription>
        Podaci za prijavu na portal za ucenike bice automatski generisani i uvek dostupni Vama u tabeli.
      </AlertDescription>
    </Alert>
    <DialogFooter>
      <Button onClick={()=>setModalState(prev =>({...prev, create: false}))}  variant={'outline'}>Odustani</Button>
      <Button onClick={()=>{createStudent()}}>Sacuvaj</Button>
    </DialogFooter>
    </DialogContent>
</Dialog>


<AlertDialog open={modalStatus.delete} onOpenChange={(val)=>{setModalState(prev => ({...prev, delete: val}))}}>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Da li ste sigurni?</AlertDialogTitle>
          <AlertDialogDescription>
            Brisanjem učenika obrisaćete i sva rešenja zadataka i postignute poene na platformi.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={()=>{setModalState(prev => ({...prev, delete: false}))}}>Odustani</AlertDialogCancel>
          <AlertDialogAction onClick={()=>[deleteStudent()]}>Obriši</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

<LoaderModal open={loading}></LoaderModal>
    <Footer></Footer>
    </>
  )
}

export default Students