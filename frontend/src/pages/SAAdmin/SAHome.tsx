import { Button } from '@/components/ui/button'
import React, { useEffect } from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import SANewMessage from './SANewMessage'
import axios from 'axios'
import SANewUser from './SANewUser'
const SAHome = () => {

    const consent = sessionStorage.getItem("sa_consent") && sessionStorage.getItem("sa_consent") === 'true'
    const setConsent = ()=>{
        sessionStorage.setItem("sa_consent", "true")
    }

    const cards = [
        {
            title: "Nova poruka",
            element: <SANewMessage></SANewMessage>
        },

        {
            title: "Dodaj profesora",
            element: <SANewUser></SANewUser>
        }
    ]

    useEffect(()=>{
        axios.get(`${import.meta.env.VITE_BACKEND}/user/me/superadmin`)
    })
  return (
    <div className='sa-admin-theme p-5'>




        <h1 className="text-4xl">Iskra - Administrativni panel</h1>
        <p>Verzija panela: 1.0</p>
        <div className="flex flex-wrap items-top justify-start mt-5 gap-5">
            {cards.map((item, index)=>(
                <div key={index} className="h-[400px] w-[400px] border-1 rounded-lg flex flex-col">
                <p className='font-bold border-b-1 p-2  shadow-[0px_4px_6px_0px_rgba(0,_0,_0,_0.1)]'>{item.title}</p>
                <div className="p-2 flex-1 overflow-y-auto">{item.element}</div>
            </div>
            ))}
        </div>

            <AlertDialog open={!consent} >
     
      <AlertDialogContent className='sa-admin-theme'>
        <AlertDialogHeader>
          <AlertDialogTitle>Pristup administrativnom panelu!</AlertDialogTitle>
          <AlertDialogDescription>
            Svaki neovlašćen pristup panelu može biti kažnjiv po odredbama Krivičnog Zakonika Republike Srbije.
            <br />
            <br />
            Opcije na administrativnom panelu nose visoku dozu odgovornosti, koristite panel sa oprezom.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={()=>{[setConsent(), location.reload()]}}>Pristupi</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </div>
  )
}

export default SAHome