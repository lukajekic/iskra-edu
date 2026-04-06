import StudentNavbar from '@/components/custom/StudentNavbar'
import { AppSidebar } from '@/components/ui/app-sidebar'
import { AppSidebarStudent } from '@/components/ui/app-sidebar-student'
import { Button } from '@/components/ui/button'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import axios from 'axios'
import { Menu } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { io } from "socket.io-client";
import { CreateMetricaView, CreateMetricaEvent } from "@lukajekic/metrica-sdk";



const StudentDashboardWrapper = () => {
  let socket = io(import.meta.env.VITE_BACKEND)
  const [socket_solution, set_socket_solution] = useState()
socket.on("message", (data) => {
  console.log("Stigla je poruka:", data);
});

socket.on("solution_status_update", (data) => {
  set_socket_solution(data)
});

socket.on("metrica_pyjudge", ()=>{
CreateMetricaEvent(import.meta.env.VITE_METRICA, "69d3dd48bcef93be94541ad6")
console.log("socket-pyjudge")
})

    const handleOnboarding = async()=>{
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND}/user/me/redirect`)
      if (response.data) {
        if (response.data.redirect !== '/app/student/home') {
          location.href = response.data.redirect
        } else {
          socket.emit("join_room", response.data.userID)
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  //onready

  useEffect(()=>{
handleOnboarding()
  }, [])
  return (
    <div className="">
      <StudentNavbar></StudentNavbar>
      <SidebarProvider >
             <SidebarTrigger className="z-50 h-10 w-10 border border-input bg-background hover:bg-accent rounded-md shadow-sm mt-2 ml-5 flex md:hidden fixed">
              <Menu className="h-5 w-5" />
    <span>Meni</span>
             </SidebarTrigger>

      <AppSidebarStudent  />
      <main className='p-5 w-full'>
        <Outlet context={socket_solution}></Outlet>
      </main>
    </SidebarProvider>
    </div>  
  )
}

export default StudentDashboardWrapper