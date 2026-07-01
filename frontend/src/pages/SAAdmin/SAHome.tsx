import { createContext, useEffect, useState } from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import SANewMessage from './SANewMessage'
import axios from 'axios'
import SANewUser from './SANewUser'
import { toast } from 'sonner'
import SATeacherLookup from './SATeacherLookup'
import SANewTargetedMessage from './SANewTargetedMessage'
export  const TeacherListContext = createContext()

const SAHome = () => {

  const [teacherList, setTeacherList] = useState([])

  const getTeachers = async()=>{
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND}/user/me/teachers/all`)
      if (response.status === 200) {
        setTeacherList(response.data)
      }
    } catch (error) {
      toast.error("GRESKA: Preuzimanje profesora.")
    }
  }

  useEffect(()=>{
    getTeachers()
  }, [])

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
        },

        {
          title: "Podaci o profesoru",
          element: <SATeacherLookup></SATeacherLookup>
        },

        {
          title: "Nova poruka korisniku",
          element: <SANewTargetedMessage></SANewTargetedMessage>
        }
    ]

    useEffect(()=>{
        axios.get(`${import.meta.env.VITE_BACKEND}/user/me/superadmin`)
    }, [])
  return (
    <TeacherListContext.Provider value={teacherList}>
      <div className='sa-admin-theme p-5'>




        <h1 className="text-4xl">Iskra - Administrativni panel</h1>
        <p>Verzija panela: 1.2</p>
        <div className="flex flex-wrap items-top justify-start mt-5 gap-5">
            {cards.map((item, index)=>(
                <div key={index} className="h-100 w-100 border rounded-lg flex flex-col">
                <p className='font-bold border-b p-2 shadow-[0px_4px_6px_0px_rgba(0,0,0,0.1)]'>{item.title}</p>
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
    </TeacherListContext.Provider>
  )
}

export default SAHome