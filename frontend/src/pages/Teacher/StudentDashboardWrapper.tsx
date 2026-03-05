import StudentNavbar from '@/components/custom/StudentNavbar'
import { AppSidebar } from '@/components/ui/app-sidebar'
import { AppSidebarStudent } from '@/components/ui/app-sidebar-student'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import React from 'react'
import { Outlet } from 'react-router-dom'

const StudentDashboardWrapper = () => {
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