import TeacherNavbar from '@/components/custom/TeacherNavbar'
import { AppSidebar } from '@/components/ui/app-sidebar'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import React from 'react'
import { Outlet } from 'react-router-dom'

const TeacherDshboardWrapper = () => {
  return (
    <div className="">
      <TeacherNavbar></TeacherNavbar>
      <SidebarProvider >
      <AppSidebar  />
      <main className='p-5 w-full'>
        <Outlet></Outlet>
      </main>
    </SidebarProvider>
    </div>  
  )
}

export default TeacherDshboardWrapper