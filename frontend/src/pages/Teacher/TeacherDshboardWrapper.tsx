import TeacherNavbar from '@/components/custom/TeacherNavbar'
import { AppSidebar } from '@/components/ui/app-sidebar'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import axios from 'axios'
import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { CreateMetricaView } from "@lukajekic/metrica-sdk";

const TeacherDshboardWrapper = () => {

useEffect(()=>{
    CreateMetricaView(import.meta.env.VITE_METRICA)
  }, [])
      const handleOnboarding = async()=>{
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND}/user/me/redirect`)
      if (response.data) {
        if (response.data.redirect !== '/app/teacher') {
          location.href = response.data.redirect
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
      <TeacherNavbar></TeacherNavbar>
      <SidebarProvider >
      <AppSidebar  />
      <SidebarInset>
        <main className='p-5 w-full'>
        <Outlet></Outlet>
      </main>
      </SidebarInset>
      
    </SidebarProvider>
    </div>  
  )
}

export default TeacherDshboardWrapper