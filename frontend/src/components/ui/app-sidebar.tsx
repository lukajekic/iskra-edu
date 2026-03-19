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

import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu" // Popravljena putanja
import { Link, useLocation } from "react-router-dom";
import { Badge } from "./badge";
import { Separator } from "./separator";
import BagdeTimer from "../custom/BagdeTimer";
import { useEffect, useState } from "react";
import axios from "axios";
const items = [
  { title: "Učenici", url: "/app/teacher/students", icon: Users },
  { title: "Napredak", url: "/app/teacher/progress", icon: ChartSpline },
  { title: "Zadaci", url: "/app/teacher/tasks", icon: CircleCheck },
  { title: "Zbirka zadataka", url: "/app/teacher/store", icon: BookCheck },
];




export function AppSidebar() {
  const location = useLocation();
  const [myWorkhour, setMyWorkhour] = useState<string>()

  const getWorkhour = async()=>{
    try {
      const response = await axios.get<string>(`${import.meta.env.VITE_BACKEND}/user/me/workhour/timer`)
      if (response.status === 200) {
        setMyWorkhour(response.data)
      }
    } catch (error) {
      console.error(error)
    }
  
  }

  useEffect(()=>{
    getWorkhour()
  }, [])
  return (
    <Sidebar className="top-[60px]">
      <SidebarContent >
        <SidebarGroup>
          <SidebarMenu className="mt-2">

            <SidebarMenuItem>
                             <Link to={'/app/teacher/group'}>

              <SidebarMenuButton className={` bg-gray-800 text-white [&:hover,&:active]:bg-gray-900 [&:hover,&:active]:text-white ${location.pathname === "/app/teacher/group" ? "w-[calc(100%-6px)]" : "w-full"}  `}>
               <CirclePile></CirclePile>
               Nastavna grupa 
{myWorkhour && <Badge className="ml-auto"><BagdeTimer date={myWorkhour}></BagdeTimer></Badge>}
{location.pathname === "/app/teacher/group" && (
                        <div className="ml-auto h-full w-1 rounded-full bg-primary absolute -right-[2px] " />
                      )}
              </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>

            <Separator className="my-2"></Separator>
            {items.map((item) => {
              const isActive = location.pathname === item.url;

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                      {isActive && (
                        <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}



            
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}