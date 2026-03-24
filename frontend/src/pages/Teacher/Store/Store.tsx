import PageTitle from '@/components/custom/PageTitle'
import { Button } from '@/components/ui/button'
import { CircleAlert, Download, Import, Info, PlusSquare, Search, User, UserCircle } from 'lucide-react'
import React, { act, useEffect, useState } from 'react'
import Footer from '@/components/custom/Footer'
import { DataTable } from '@/components/custom/data-table'
import {getColumns, type Task, type Payment } from './columns'
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Field, FieldGroup } from '@/components/ui/field'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import RichTextEditor from '@/components/custom/RichTextEditor'
import Editor from 'react-simple-wysiwyg';
import { toast } from 'sonner'
import axios, { all } from 'axios'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Grades, SupportedLanguages } from '@/assets/constants'
import LoaderModal from '@/components/custom/LoaderModal'
import { Separator } from '@/components/ui/separator'
import foldericon from '../../../assets/folder.png'

type Folder = {
    _id:        string;
    title:      string;
    teacherRef: string;
    open:       boolean;
    __v:        number;
}
type MyFolders = {
  folders: Folder[],
  fetched: boolean
}

const Store =   () => {

  const [myFolders, setMyFolders] = useState<MyFolders>({
    fetched: false,
    folders: []
  })

  const fetchMyFolders = async()=>{
    try {
      if (!myFolders.fetched) {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND}/my/folders`)
        if (response.status === 200) {
          setMyFolders({
            fetched: true,
            folders: response.data
          })
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  const [openLoader, setOpenLoader] = useState(false)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
const [allTasks, setAllTasks] = useState([])
const [query, setQuery] = useState({
  grade: "",
  language: ""
})


const [openFolderPicker, setOpenFolderPicker] = useState(false)

const downloadTask = async(folderID:string)=>{
  try {
    const response = await axios.post(`${import.meta.env.VITE_BACKEND}/store/download`, {
      taskID: activeTask?._id,
      folderID: folderID
    })

    if (response.status === 200) {
      setTimeout(() => {
        setOpenFolderPicker(false)
        setOpenLoader(false)
        setActiveTask(null)
        toast.success("Uspesno preuzimanje!")
      }, 650);
    }
  } catch (error) {
    setOpenFolderPicker(false)
    setOpenLoader(false)
    toast.error("Desila se greska!")
  }
}

const validateQuery = ()=>{
  if (!query.grade || !query.language) {
    toast.error("Popunite polja za programski jezik i razred.")
    setOpenLoader(false)
    return false
  }

  return true
}

const executeQuery = async()=>{
  try {
    const response = await axios.post(`${import.meta.env.VITE_BACKEND}/store`, query)

    if (response.status === 200) {
      return response.data
    }
  } catch (error) {
toast.error("Nije uspela pretraga zadataka.")
throw new Error("Neuspesan poziv APIju");
setOpenLoader(false)


  }
}

const fetchData = async()=>{
  setOpenLoader(true)
  try {
    if (validateQuery()) {
      let toset = await executeQuery()
      setTimeout(() => {
        setAllTasks(toset)
    
      setOpenLoader(false)
      }, 650);
    }
  } catch (error) {
    setOpenLoader(false)
    toast.error("Desila se greska.")
  }
}



const modifyQuery = (field:string, value:any) =>{
  if (!field) {
    throw new Error("Nema prenesneog polja za modifikaciju");
    
  }

  setQuery(prev => ({
    ...prev,
    [field]: value
  }))
}


useEffect(()=>{
  console.log("nov akitvni zadatak", activeTask)
}, [activeTask])


  return (
    <>
    <PageTitle title='Zbirka zadataka' subtitle='Preuzmite zadatke drugih profesora i obogatite svoje časove.'></PageTitle>

    <div className="w-full flex gap-0 justify-between items-center">
           <div className='mt-3 h-fit w-full lg:w-[70%]'>
            <Alert className=''>
      <Info></Info>
      <AlertTitle>
        Preporuka
      </AlertTitle>
      <AlertDescription>
        Sve zadatke koje sami napravite možete podeliti u zbirku i odabrati da li želite priazati Vaš identitet ili ostati anonimni.
      </AlertDescription>
    </Alert>
<Alert variant={'destructive'} className='my-3'>
  <CircleAlert></CircleAlert>
  <AlertTitle>Upozorenje</AlertTitle>
  <AlertDescription>
    Zadatke koje preuzmete iz zbirke (od drugih autora) ostaju u Vašim folderima, ukoliko autor ukloni zadatak iz zbirke. Na zadatke koje Vi objavite se primenjuje ista praksa.
    <div className="h-2"></div>
    <strong>Preuzetim zadacima ne možete izmeniti naziv, opis i instrukcije, kao i testove.</strong>
  </AlertDescription>
</Alert>
           </div>
   
    
        <img src="/undraw_folder-files_5www.svg" className='  h-[150px] hidden lg:block ' alt="" />
        </div>
   

   <div className="rounded-lg border-1 p-4">
    <div className="text-gray-600 text-lg inline-flex items-center gap-2">
      <Search></Search>
      <span>Pretraga</span>
    </div>

    <div className="flex jusitfy-between gap-4 items-center w-full max-w-[1000px] mt-2">
          <Select onValueChange={(val)=>{modifyQuery("grade", val)}}>
      <SelectTrigger className="flex-1">
        <SelectValue  placeholder="Izaberite razred..." />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Razredi</SelectLabel>
          {Grades.map((item, index)=>{
            return (
              <SelectItem value={item} key={index}>{item}</SelectItem>
            )
          })}
      
        </SelectGroup>
      </SelectContent>
    </Select>

           <Select onValueChange={(val)=>{modifyQuery("language", val)}}>
      <SelectTrigger className="flex-1">
        <SelectValue placeholder="Izaberite jezik..." />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Programski jezici</SelectLabel>
          {SupportedLanguages.map((item, index)=>{
            return (
              <SelectItem value={item.value} key={index}>
                {item.icon && (
                  <img src={item.icon} alt="" className='size-5' />
                )}
                {item.label}</SelectItem>
            )
          })}
        </SelectGroup>
      </SelectContent>
    </Select>

    <Button onClick={()=>{fetchData()}}>
      <Search></Search>
      Pretrazi
    </Button>


    </div>
   </div>
        <div className="h-5"></div>
<DataTable filter={{key: "", input_label: ""}} data={allTasks} columns={getColumns({onPreview: (task:Task)=>{setActiveTask(task)}})}></DataTable>



{/* edit */}
<Drawer open={activeTask ? true : false} onOpenChange={(val)=>{
  if (!val) {
    setActiveTask(null)
  }
}}   direction='right'  >
  <DrawerContent className='pb-[60px]'>
    <DrawerHeader className='font-bold text-lg border-b'>
      Detalji zadatka
    </DrawerHeader>

    <div className="overflow-y-auto">
      <div className="w-full p-4">
      <p className="text-xl font-bold">{activeTask?.title}</p>
      <Separator className='my-2'></Separator>
     {activeTask?.author && (
       <div id="task-author-info" className="flex justify-between items-center gap-2">
        <UserCircle/>
        <div id="author-info-data" className="flex flex-col items-left flex-1">
          <p className="text-lg font-semibold">{activeTask.author.name}</p>
          <p className="text-gray-700">{activeTask.author.institution}</p>
        </div>
      </div>
     )}
        <div
  className="iskra-rich-text  max-w-full mt-3"
  dangerouslySetInnerHTML={{ __html: activeTask?.richText}}
/>

<Separator></Separator>
      <p className="text-xl font-bold ">Testovi zadatka</p>
    </div>

   <table id='tests-table' className='w-full'>
    {activeTask?.tests.map((item, index)=>(
      <tr>
        <td className='text-center text-2xl font-semibold'>
          {index+1}
        </td>

        <td className='p-1'>
          <span className="font-semibold text-lg">
            ULAZI:
          </span>
          <ul className='list-disc list-inside'>
            {item?.input.map((testitem , index)=>(
            <li key={index}>{testitem}</li>
          ))}
          </ul>

          <Separator></Separator>

          <span className="font-semibold text-lg">
            IZLAZI:
          </span>
          <ul className='list-disc list-inside'>
            {item.output.map((testitem , index)=>(
            <li key={index}>{testitem}</li>
          ))}
          </ul>


        </td>
      </tr>
    ))}
   </table>
    </div>

    <DrawerFooter>
    <Button onClick={()=>{setActiveTask(null)}} variant={'outline'}>Zatvori</Button>
    <Button onClick={()=>{
      fetchMyFolders()
      setOpenFolderPicker(true)
     
    }}><Download></Download>Preuzmi zadatak</Button>
  </DrawerFooter>
  </DrawerContent>
  
</Drawer>

<LoaderModal open={openLoader}></LoaderModal>





<Dialog open={openFolderPicker} onOpenChange={(val)=>setOpenFolderPicker(val)} >
  <DialogContent showCloseButton={true}>
<DialogHeader><span>Izaberite Folder</span></DialogHeader>


<div className="flex flex-col gap-2">
  {myFolders.folders.map((item, index)=>(
  <div onClick={()=>{
    setOpenLoader(true)
    downloadTask(item._id)
  }} className="p-2 border-b-1 active:border-2 active:border-blue-400 rounded-lg flex items-center gap-2 hover:cursor-pointer">
  <img src={foldericon} className='size-6' alt="" />
  <span key={index} className="flex-1 break-all">{item?.title}</span>
</div>
))}
</div>



  </DialogContent>
</Dialog>



    <Footer></Footer>
    </>
  )
}

export default Store