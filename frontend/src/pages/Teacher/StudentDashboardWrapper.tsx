import StudentNavbar from '@/components/custom/StudentNavbar'
import { AppSidebarStudent } from '@/components/ui/app-sidebar-student'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import axios from 'axios'
import { Ban, Menu } from 'lucide-react'
import React, { createContext, useEffect, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { io } from "socket.io-client";
import { CreateMetricaEvent } from "@lukajekic/metrica-sdk";
import { Dialog, DialogContent } from '@/components/ui/dialog'
export const WorkForbiddenContext = createContext(
  {work_forbidden: false,
  set_work_forbidden: () => {}}
)

const StudentDashboardWrapper = () => {
const [work_forbidden, set_work_forbidden] = useState(false)
  const socketRef = useRef(null)
  const [socket_solution, set_socket_solution] = useState()
  const [openforbididalog, setopenforbiddialog] = useState(false)
  const handleOnboarding = async (socket) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND}/user/me/redirect?teacherref=true&return_work_forbidden=true`)
      if (response.data) {
        if (response.data.redirect !== '/app/student/home') {
          location.href = response.data.redirect
        } else {
          socket.emit("join_room", response.data.userID.toString())
          socket.emit("join_room_fwork_warning", response.data.teacherRef.toString())
        }

        if (response.data.work_forbidden && response.data.work_forbidden === true) {
          set_work_forbidden(true)
          setopenforbiddialog(true)
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

    socket.on("work_forbidden_action", ()=>{
      console.log("ZABRANA DALJEG RADA!")
      set_work_forbidden(true)
      setopenforbiddialog(true)
    })

    handleOnboarding(socket)

    return () => {
    socket.off("solution_status_update");
    socket.off("metrica_pyjudge");
    socket.off("work_forbidden_action");
    socket.disconnect();
  };
  }, [])

  return (
   <WorkForbiddenContext.Provider value={{work_forbidden, set_work_forbidden}}>
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


    <Dialog open={openforbididalog} onOpenChange={(val)=>{setopenforbiddialog(val)}}>
      <DialogContent>
        <div className="flex flex-col gap-2 items-center">
          <Ban className='text-red-700 size-15'></Ban>

          <p className="text-lg text-center text-gray-700">Dalje slanje rešenja je zabranjeno. Možeš videti do sad poslata rešenja.</p>
        </div>
      </DialogContent>
    </Dialog>
   </WorkForbiddenContext.Provider>
  )
}

export default StudentDashboardWrapper