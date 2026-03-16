import { BookCheck, ChartSpline, ChevronDown, CircleCheck, CirclePile, File, Home, Settings, User, User2, Users } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
 import py_icon from "../../assets/python.svg"

import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu" // Popravljena putanja
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Badge } from "./badge";
import { Separator } from "./separator";
import foldericon from "../../assets/folder.png"
import { useEffect, useState } from "react";
import axios from "axios";
type Folder = {
    zadaci:     Task[];
    folderName: string;
    folderId:   string;
}

type Task = {
  _id: string,
  language: "python",
  title: string
}
export function AppSidebarStudent() {
    const [openTaskPicker, setOpenTaskPicker] = useState(false)
    let [folders, setFolders] = useState<Folder[]>()
let [tasks, setTasks] = useState<Task[]>()
    const getFolders = async()=>{
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND}/app/student/folders`)
        if (response.data) {
          setFolders(response.data)
        }
      } catch (error) {
        console.error(error)
      }
    }
  const [searchParams, setSearchParams] = useSearchParams();

    useEffect(()=>{
      getFolders()
      console.log(searchParams.get('task'))
    }, [])

    useEffect(()=>{
      console.log(`Promena task parametra: ${searchParams.get('task')}`)
    }, [searchParams])
  
  return (
    <Sidebar variant="floating" className="top-[70px] pl-5 pb-[75px]">
      <SidebarContent >
        <SidebarGroup>
          <SidebarMenu className="mt-2">

           
{folders?.map((item ,index)=>{
  return (
    <div onClick={()=>{setTasks(item.zadaci), setOpenTaskPicker(true)}} key={index} className="noselect w-full h-fit p-2 flex items-center rounded-lg border-2 border-transparent active:border-blue-500 gap-2 hover:cursor-pointer">
      <img src={foldericon} className="w-[20px]" alt="" />
      <span className="flex-1 text-gray-500 break-all">{item.folderName}</span>
    </div>
  )
})}


            
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>



      
   <Dialog open={openTaskPicker} onOpenChange={(val)=>{setOpenTaskPicker(val)}}>
    <DialogContent className='min-w-[70%]'>
      <DialogHeader className='text-xl font-bold'>
Odabir zadatka
      </DialogHeader>

     <div className="w-full flex flex-wrap h-[300px] overflow-y-auto gap-2 justify-center">
       {tasks?.map((item,index)=>(
        <div key={index} onClick={()=>{setSearchParams({task: item._id}), setOpenTaskPicker(false)}} className='noselect h-fit w-[200px] border-1 m-px rounded-xl active:border-2 active:border-blue-500 active:m-0 hover:cursor-pointer flex flex-col items-center p-3'>
          <img className='w-[40px]' src={py_icon}></img>
          <span className="break-all mt-2 text-center">{item.title}</span>
        </div>
      ))}
     </div>


    </DialogContent>
   </Dialog>
    </Sidebar>
  )
}