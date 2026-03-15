import StudentNavbar from '@/components/custom/StudentNavbar'
import { AppSidebar } from '@/components/ui/app-sidebar'
import { AppSidebarStudent } from '@/components/ui/app-sidebar-student'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import axios from 'axios'
import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'

const StudentDashboardWrapper = () => {

    const handleOnboarding = async()=>{
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND}/user/me/redirect`)
      if (response.data) {
        if (response.data.redirect !== '/app/student/home') {
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
      <StudentNavbar></StudentNavbar>
      <SidebarProvider >
      <AppSidebarStudent  />
      <main className='p-5 w-full'>
        <Outlet></Outlet>
      </main>
    </SidebarProvider>
    </div>  
  )
}

export default StudentDashboardWrapper