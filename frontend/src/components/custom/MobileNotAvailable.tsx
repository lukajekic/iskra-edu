import React from 'react'
import { Button } from '../ui/button'
import axios from 'axios'

type redirectObj = {
  redirect: string
}

const MobileNotAvailable = () => {

     const handleRedirect = async()=>{
    try {
      const response = await axios.get<redirectObj>(`${import.meta.env.VITE_BACKEND}/user/me/redirect`)
      if (response.data) {
        
        console.log(response.data)
        location.href = response.data.redirect
      }
    } catch (error) {
      location.href = '/auth/onboarding'
    }
  }


  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="flex flex-col gap-8 w-full max-w-md mx-auto items-center justify-center text-center">
            <img className='w-full max-w-[280px] sm:max-w-[360px] h-auto object-contain' src="/undraw_access-denied_krem.svg" alt="" />
            <h1 className="text-xl sm:text-2xl font-bold text-primary px-2">Ova stranica ne podržava mobilne telefone!</h1>
            <Button onClick={()=>{handleRedirect()}} className='w-full sm:w-fit px-8 h-12 rounded-2xl text-lg'>Preusmeri me</Button>
        </div>
    </div>
  )
}

export default MobileNotAvailable