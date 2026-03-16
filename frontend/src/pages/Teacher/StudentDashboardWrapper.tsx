import StudentNavbar from '@/components/custom/StudentNavbar'
import { AppSidebar } from '@/components/ui/app-sidebar'
import { AppSidebarStudent } from '@/components/ui/app-sidebar-student'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { io } from "socket.io-client";
const StudentDashboardWrapper = () => {
  let socket = io(import.meta.env.VITE_BACKEND)
  const [socket_solution, set_socket_solution] = useState()
socket.on("message", (data) => {
  console.log("Stigla je poruka:", data);
});

socket.on("solution_status_update", (data) => {
  set_socket_solution(data)
});

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
      <AppSidebarStudent  />
      <main className='p-5 w-full'>
        <Outlet context={socket_solution}></Outlet>
      </main>
    </SidebarProvider>
    </div>  
  )
}

export default StudentDashboardWrapper