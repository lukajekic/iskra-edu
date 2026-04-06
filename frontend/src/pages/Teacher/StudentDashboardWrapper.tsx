import StudentNavbar from '@/components/custom/StudentNavbar'
import { AppSidebarStudent } from '@/components/ui/app-sidebar-student'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import axios from 'axios'
import { Menu } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { io } from "socket.io-client";
import { CreateMetricaEvent } from "@lukajekic/metrica-sdk";

const StudentDashboardWrapper = () => {
  const socketRef = useRef(null)
  const [socket_solution, set_socket_solution] = useState()

  const handleOnboarding = async (socket) => {
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

  useEffect(() => {
    const socket = io(import.meta.env.VITE_BACKEND)
    socketRef.current = socket

    socket.on("solution_status_update", (data) => {
      console.log("solution_status_update data:", data)
      set_socket_solution(data)
    });

    socket.on("metrica_pyjudge", () => {
      CreateMetricaEvent(import.meta.env.VITE_METRICA, "69d3dd48bcef93be94541ad6")
      console.log("socket-pyjudge")
    })

    handleOnboarding(socket)

    return () => socket.disconnect()
  }, [])

  return (
    <div className="">
      <StudentNavbar />
      <SidebarProvider>
        <SidebarTrigger className="z-50 h-10 w-10 border border-input bg-background hover:bg-accent rounded-md shadow-sm mt-2 ml-5 flex md:hidden fixed">
          <Menu className="h-5 w-5" />
          <span>Meni</span>
        </SidebarTrigger>
        <AppSidebarStudent />
        <main className='p-5 w-full'>
          <Outlet context={socket_solution} />
        </main>
      </SidebarProvider>
    </div>
  )
}

export default StudentDashboardWrapper