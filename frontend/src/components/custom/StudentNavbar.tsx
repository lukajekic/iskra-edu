import React, { useEffect, useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '../ui/button'
import { Building, File, FileText, MessageCircle, Pencil, PowerOff, SquareUserRound, User, UserCircle, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '../ui/dialog'
import { Separator } from '../ui/separator'
import usericon from '../../assets/user.png'
import { Field, FieldGroup } from '../ui/field'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { toast } from 'sonner'
import { HandleLogout } from '@/utils/logout'
import axios from 'axios'
import StudentTimer from './StudentTimer'

type ModalStatus = {
  my_profile: boolean,
  messages: boolean,
  documents: boolean
}
const StudentNavbar = () => {


  const [modalStatus, setModalStatus] = useState<ModalStatus>({
    my_profile: false,
    messages: false,
    documents: false
  })
const [myProfile, setMyProfile] = useState()
  const getProfile = async()=>{
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND}/user/me`)
      if (response.status === 200) setMyProfile(response.data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(()=>{
    getProfile()
  }, [])
  return (
    <>
      <div id='height_manager' className="h-[62px] mt-2 w-full flex justify-center" />

      <div id='student-navbar-main' className=" w-[calc(100%-40px)] left-1/2 -translate-x-1/2 h-[60px] fixed top-2  bg-white z-50 flex justify-between items-center  border-[1px] pl-3 border-[#cecece]/75 rounded-lg pb-[2px]">
        <div className="flex items-center gap-2 h-full">
          <img src="/favicon.png" className='size-10' alt="" />
          <div className="flex items-end gap-1">
            <h1 className='text-3xl font-bold'>Iskra</h1>
            <p className='mb-[2px]'>za učenike</p>
          </div>

        {/*   <div className="border-x w-fit h-full flex flex-col items-start gap-0 justify-center px-5 ml-2">
            <span className='font-bold flex items-center'>
              <Building className='size-5 mr-2' />
              Obrazovna institucija:
            </span>
            <span>Gimazija „Svetozar Markovic“ Novi Sad</span>
          </div> */}

          <Tooltip>
            <TooltipTrigger>
              <div className="border-x w-fit h-full flex flex-col items-start gap-0 justify-center px-5 border-l-0 hidden md:flex">
            <span className='font-bold flex items-center'>
              <User className='size-5 mr-2' />
              Predmetni profesor:
            </span>
            <span>{myProfile?.teacherRef?.name}</span>
          </div>
            </TooltipTrigger>
            <TooltipContent>
              {myProfile?.teacherRef?.institution}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* auth */}
    

    <div className="h-full  flex-1 min-w-0 flex justify-end pr-4">

      <div className="flex items-center gap-2">
        <UserCircle className='size-[30px] mr-2 text-gray-700'></UserCircle>
        <div className="flex flex-col">
          <span className="text-gray-700 uppercase break-all">{
            myProfile?.type === 'student_permanent' ? (<>Trajni nalog</>) : myProfile?.type === 'student_temp' ? (<><StudentTimer date={myProfile?.userExpiry}></StudentTimer></>) : (<>/</>)
            }</span>
          <span className='break-all'>{myProfile?.name}</span>
        </div>
        <Button onClick={()=>{ HandleLogout()}} variant={'destructive'}><PowerOff></PowerOff>Odjava</Button>
      </div>
    </div>
      </div>





      {/* sistemske poruke */}
      <Dialog   open={modalStatus.messages} onOpenChange={(val)=>{setModalStatus(prev => ({...prev, messages: val}))}} >
        <DialogContent showCloseButton={true} className='min-w-[70%] w-[70%] min-h-[80%] h-[80%] flex flex-col gap-2'>
          <DialogHeader className='text-lg font-bold h-fit'>
            Poruke
          </DialogHeader>
<div className="border-1 w-full h-full overflow-hidden flex items-start">
    <div className=" w-[30%] h-full flex flex-col gap-0 items-start overflow-y-auto">

     {Array.from({ length: 5 }, (_, index) => ({
  unread: index === 1 || index === 2,
})).map((item, index) => (
  <div
    key={index}
    className={`w-full h-fit p-2 border-b-1 
      ${item.unread ? "bg-white" : "bg-[#cecece]/15"} 
      hover:bg-white hover:border-l-2 hover:border-l-blue-400`}
  >
    <p className={`text-xs text-gray-500`}>00. 00. 0000. 00:00</p>
    <p className={`text-[16px] ${item.unread ? "text-[#194872] font-bold" : "text-gray-500"}`}>
      Nadogradnja sistema
    </p>
  </div>
))}
    </div>
  <div className="p-5 w-[70%] h-full border-[2px] border-[#194872] flex flex-col">
    <p className="text-[20px] text-[#194872]">
      Najavljivanje nadogradnje sistema
    </p>
        <p className={`text-xs text-gray-500`}>00. 00. 0000. 00:00</p>

<Separator className='my-2'></Separator>

<div className="flex-1 overflow-y-auto">
  <p className='text-[15px] text-gray-700'>Ovde postaviti rezultate rich text editora.
  Ovde postaviti rezultate rich text editora.
  Ovde postaviti rezultate rich text editora.
  Ovde postaviti rezultate rich text editora.
  Ovde postaviti rezultate rich text editora.
  Ovde postaviti rezultate rich text editora.
  Ovde postaviti rezultate rich text editora.
  Ovde postaviti rezultate rich text editora.
  Ovde postaviti rezultate rich text editora.
  Ovde postaviti rezultate rich text editora.
  Ovde postaviti rezultate rich text editora.
  Ovde postaviti rezultate rich text editora.
  Ovde postaviti rezultate rich text editora.
  Ovde postaviti rezultate rich text editora.
  Ovde postaviti rezultate rich text editora.
  Ovde postaviti rezultate rich text editora.
  Ovde postaviti rezultate rich text editora.
  Ovde postaviti rezultate rich text editora.
  Ovde postaviti rezultate rich text editora.
  Ovde postaviti rezultate rich text editora.
  Ovde postaviti rezultate rich text editora.
  Ovde postaviti rezultate rich text editora.
  Ovde postaviti rezultate rich text editora.
  Ovde postaviti rezultate rich text editora.
  Ovde postaviti rezultate rich text editora.
  Ovde postaviti rezultate rich text editora.
  Ovde postaviti rezultate rich text editora.
  Ovde postaviti rezultate rich text editora.
  Ovde postaviti rezultate rich text editora.
  Ovde postaviti rezultate rich text editora.
  Ovde postaviti rezultate rich text editora.
  Ovde postaviti rezultate rich text editora.
  Ovde postaviti rezultate rich text editora.
  Ovde postaviti rezultate rich text editora.
  Ovde postaviti rezultate rich text editora.
  Ovde postaviti rezultate rich text editora.
  Ovde postaviti rezultate rich text editora.
  Ovde postaviti rezultate rich text editora.
  Ovde postaviti rezultate rich text editora.
  Ovde postaviti rezultate rich text editora.
  Ovde postaviti rezultate rich text editora.
  Ovde postaviti rezultate rich text editora.
  Ovde postaviti rezultate rich text editora.
  Ovde postaviti rezultate rich text editora.
  Ovde postaviti rezultate rich text editora.

<br></br>
  -----Kraj poruke.-----
</p>
</div>
  </div>

</div>

<DialogFooter>
  <Button variant={'outline'} onClick={()=>{setModalStatus(prev=>({...prev, messages: false}))}}>Zatvori poruke</Button>
</DialogFooter>
        </DialogContent>
      </Dialog>




      {/* dokumenta */}
      <Dialog open={modalStatus.documents}  onOpenChange={(val)=>{setModalStatus(prev => ({...prev, documents: val}))}}>
<DialogContent className='max-h-[80vh] min-w-1/2 flex flex-col min-h-0'>
          <DialogHeader className='text-lg font-bold'>
            Uputstva za korisnike
          </DialogHeader>
<div className="overflow-y-auto flex-1">
  {Array.from({length: 10}).map((item, index)=>(
  <div className="w-full  p-3 border-b-1 flex gap-2 text-[#194872] hover:text-[#c55258] hover:cursor-pointer items-center">
    <FileText className='w-[24px]'></FileText>
<span className='text-[16px] flex-1'>Naziv uputstva za korisnike.pdf</span>
  </div>
))}
</div>

        </DialogContent>
      </Dialog>



      {/* profil */}
      <Dialog open={modalStatus.my_profile} onOpenChange={(val)=>{setModalStatus(prev => ({...prev, my_profile: val}))}} >
        <DialogContent className='min-w-[40%]'>
          <DialogHeader className='font-bold text-lg'>Moj profil</DialogHeader>
          <div className="w-full flex items-center gap-3">
            <img src={usericon} className='w-[100px] rounded-[50%] shadow-sm' alt="" />
            <div id="profileinfo">
              <p className="text-xl font-bold">Ime i prezime</p>
              <p className="text-gray-700">@lukajekic</p>
              <br></br>
              <p className="text-gray-700 inline-flex items-center gap-2"><Building></Building>Gimazija „Svetozar Markovic“ Novi Sad</p>
              <br></br>
              <p className="text-gray-700 inline-flex items-center gap-2"><Users></Users><strong>Ukupno ucenika:</strong>309</p>

            </div>
          </div>

          <DialogFooter>
            <Button variant={'outline'}><Pencil></Pencil>Izmeni profil</Button>
            <Button onClick={()=>{setModalStatus(prev=>({...prev, my_profile: false}))}}>Zatvori</Button>
          </DialogFooter>





          {/* nested izmena profila */}

<Dialog >
      <form action="">

  <DialogContent>
    <DialogHeader className='text-lg font-bold'>
      Izmeni profil
    </DialogHeader>

      <FieldGroup>
        <Field>
          <Label>
            Ime i prezime
          </Label>
          <Input></Input>
        </Field>

        <Field>
          <Label>
            Obrazovna ustanova
          </Label>

          <Input></Input>
        </Field>
      </FieldGroup>

      <DialogFooter>
        <Button type='button' variant={'outline'}>Odustani</Button>
        <Button type='submit'>Sacuvaj</Button>
      </DialogFooter>
  </DialogContent>
      </form>

</Dialog>
{/* --kraj nested izmena profila */}
        </DialogContent>
      </Dialog>


      
    </>
  )
}

export default StudentNavbar