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
import { Link, useLocation } from "react-router-dom";
import { Badge } from "./badge";
import { Separator } from "./separator";
import foldericon from "../../assets/folder.png"
import { useState } from "react";

const items = [
  { title: "Učenici", url: "/app/teacher/students", icon: Users },
  { title: "Napredak", url: "/app/teacher/progress", icon: ChartSpline },
  { title: "Zadaci", url: "/app/teacher/tasks", icon: CircleCheck },
  { title: "Zbirka zadataka", url: "/app/teacher/store", icon: BookCheck },
];
export function AppSidebarStudent() {
    const [openTaskPicker, setOpenTaskPicker] = useState(false)
  
  const location = useLocation();
  return (
    <Sidebar variant="floating" className="top-[70px] pl-5 pb-[75px]">
      <SidebarContent >
        <SidebarGroup>
          <SidebarMenu className="mt-2">

           
{Array.from({length: 20}).map((item ,index)=>{
  return (
    <div onClick={()=>{setOpenTaskPicker(true)}} key={index} className="noselect w-full h-fit p-2 flex items-center rounded-lg border-2 border-transparent active:border-blue-500 gap-2 hover:cursor-pointer">
      <img src={foldericon} className="w-[20px]" alt="" />
      <span className="flex-1 text-gray-500 break-all">{index}: Ime folderaIme folderaIme folderaIme folderaIme foldera</span>
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
       {Array.from({length: 15}).map((item,index)=>(
        <div key={index} className='noselect h-fit w-[200px] border-1 m-px rounded-xl active:border-2 active:border-blue-500 active:m-0 hover:cursor-pointer flex flex-col items-center p-3'>
          <img className='w-[40px]' src={py_icon}></img>
          <span className="break-all mt-2 text-center">Zadatk 1 python vebz aobuka za tesirnaje platofmr eiskar a uceniek</span>
        </div>
      ))}
     </div>


    </DialogContent>
   </Dialog>
    </Sidebar>
  )
}