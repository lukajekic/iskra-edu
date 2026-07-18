import { useState } from 'react'
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
import { Building, Check, ChevronDown, File, FileText, MessageCircle, Pencil, PowerOff, SquareUserRound, User, UserCircle, Users } from 'lucide-react'
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
import { IskraApps } from '@/assets/constants'

type ModalStatus = {
  my_profile: boolean,
  messages: boolean,
  documents: boolean
}

export type ProfileType = {
    _id:          string;
    name:         string;
    type:         string;
    username:     string;
    teacherRef:   TeacherRef;
    userExpiry?:   Date;
    groupCodeRef?: string;
    __v:          number;
}

export type TeacherRef = {
    _id:         string;
    name:        string;
    institution: string;
}
type StudentNavbarProps = {
  myProfile?: ProfileType
}

const StudentNavbar = ({ myProfile }: StudentNavbarProps) => {

const [currentApp] = useState("lms_student")

  const apps = IskraApps.filter(app => app.students === true)

  const activeApp = apps.find((a) => a.id === currentApp);
  const [modalStatus, setModalStatus] = useState<ModalStatus>({
    my_profile: false,
    messages: false,
    documents: false
  })
  return (
    <>
      {/* POPRAVLJENO: Smanjen visinski menadžer na mobilnom sa 120px na 78px da se ukloni veliki prazan prostor */}
      <div id='height_manager' className="md:h-[62px] h-[78px] mt-2 w-full flex justify-center" />

      {/* POPRAVLJENO: Zadržan kompaktan izgled na mobilnom bez suvišnog vertikalnog širenja */}
      <div id='student-navbar-main' className="w-[calc(100%-20px)] md:w-[calc(100%-40px)] left-1/2 -translate-x-1/2 h-auto min-h-[60px] md:h-[60px] py-1.5 md:py-0 fixed top-2 bg-white z-50 flex flex-wrap md:flex-nowrap justify-between items-center border-[1px] px-3 border-[#cecece]/75 rounded-lg gap-2">
        <div className="flex items-center gap-2 h-full">
          <img src="/favicon.png" className='size-10' alt="" />
          <div className="flex items-end gap-1">
            <h1 className='text-3xl font-bold hidden md:block'>Iskra</h1>
            <p className='mb-[2px] hidden md:block'>za učenike</p>
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
    

    <div className="h-full flex-1 min-w-0 flex justify-end pr-0 md:pr-4 items-center gap-3">

  <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center h-[40px] gap-2 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800">
        {activeApp?.icon && <activeApp.icon className="w-4 h-4 text-primary" />}
        <span className="font-semibold text-sm">{activeApp?.name}</span>
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-64 p-2">
        <div className="px-2 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
          Iskra aplikacije
        </div>
        {apps.map((app) => {
          const Icon = app.icon;
          const isActive = app.id === currentApp;
          
          return (
            <DropdownMenuItem
              key={app.id}
              className={`flex items-center justify-between p-2 cursor-pointer ${isActive ? "bg-slate-100 dark:bg-slate-800" : ""}`}
              onClick={() => window.location.href = app.url}
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <span className="font-medium">{app.name}</span>
              </div>
              {isActive && <Check className="w-4 h-4 text-emerald-600" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>

      <div className="flex gap-2 items-center">
        <UserCircle className='size-[30px] mr-2 text-gray-700 md:block hidden'></UserCircle>
        <div className="flex flex-col items-end md:items-start text-xs md:text-sm">
          <span className="text-gray-700 uppercase break-all">{
            myProfile?.type === 'student_permanent' ? (<>Trajni nalog</>) : myProfile?.type === 'student_temp' ? (<>
            <div className=''><StudentTimer date={myProfile?.userExpiry}></StudentTimer></div>
            </>) : (<>/</>)
            }</span>
          <span className='break-all text-right md:text-left font-medium'>{myProfile?.name}</span>
        </div>
        <Button onClick={()=>{ HandleLogout()}} variant={'destructive'} size="sm" className="h-9 md:h-10 md:px-4 px-3"><PowerOff className="size-4 md:mr-2"></PowerOff><span className="hidden sm:inline">Odjava</span></Button>
      </div>
    </div>
      </div>

      {/* sistemske poruke */}
      <Dialog open={modalStatus.messages} onOpenChange={(val)=>{setModalStatus(prev => ({...prev, messages: val}))}} >
        <DialogContent showCloseButton={true} className='w-full max-w-5xl md:w-[70%] h-[90vh] md:h-[80%] flex flex-col gap-2 p-4 md:p-6'>
          <DialogHeader className='text-lg font-bold h-fit'>
            Poruke
          </DialogHeader>
<div className="border-1 w-full h-full overflow-hidden flex flex-col md:flex-row items-stretch gap-2">
    <div className="w-full md:w-[30%] h-[35%] md:h-full flex flex-col gap-0 items-start overflow-y-auto border-b md:border-b-0 md:border-r border-gray-200">

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
    <p className={`text-[14px] md:text-[16px] ${item.unread ? "text-[#194872] font-bold" : "text-gray-500"}`}>
      Nadogradnja sistema
    </p>
  </div>
))}
    </div>
  <div className="p-3 md:p-5 w-full md:w-[70%] h-[65%] md:h-full border-[2px] border-[#194872] flex flex-col min-h-0">
    <p className="text-[18px] md:text-[20px] text-[#194872] font-semibold">
      Najavljivanje nadogradnje sistema
    </p>
        <p className={`text-xs text-gray-500`}>00. 00. 0000. 00:00</p>

<Separator className='my-2'></Separator>

<div className="flex-1 overflow-y-auto">
  <p className='text-[14px] md:text-[15px] text-gray-700'>Ovde postaviti rezultate rich text editora.
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

<DialogFooter className="flex-row justify-end gap-2 pt-2">
  <Button variant={'outline'} onClick={()=>{setModalStatus(prev=>({...prev, messages: false}))}}>Zatvori poruke</Button>
</DialogFooter>
        </DialogContent>
      </Dialog>




      {/* dokumenta */}
      <Dialog open={modalStatus.documents}  onOpenChange={(val)=>{setModalStatus(prev => ({...prev, documents: val}))}}>
<DialogContent className='max-h-[80vh] w-full max-w-xl flex flex-col min-h-0 p-4 md:p-6'>
          <DialogHeader className='text-lg font-bold'>
            Uputstva za korisnike
          </DialogHeader>
<div className="overflow-y-auto flex-1">
  {Array.from({length: 10}).map((item, index)=>(
  <div key={index} className="w-full  p-3 border-b-1 flex gap-2 text-[#194872] hover:text-[#c55258] hover:cursor-pointer items-center">
    <FileText className='w-[24px]'></FileText>
<span className='text-[16px] flex-1 text-ellipsis overflow-hidden whitespace-nowrap'>Naziv uputstva za korisnike.pdf</span>
  </div>
))}
</div>

        </DialogContent>
      </Dialog>



      {/* profil */}
      <Dialog open={modalStatus.my_profile} onOpenChange={(val)=>{setModalStatus(prev => ({...prev, my_profile: val}))}} >
        <DialogContent className='w-full max-w-xl p-4 md:p-6'>
          <DialogHeader className='font-bold text-lg'>Moj profil</DialogHeader>
          <div className="w-full flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <img src={usericon} className='w-[100px] h-[100px] rounded-[50%] shadow-sm object-cover' alt="" />
            <div id="profileinfo" className="text-center sm:text-left flex-1">
              <p className="text-xl font-bold">Ime i prezime</p>
              <p className="text-gray-700">@lukajekic</p>
              <div className="my-2 space-y-1">
                <p className="text-gray-700 flex items-center justify-center sm:justify-start gap-2 text-sm"><Building className="size-4 shrink-0"></Building>Gimazija „Svetozar Markovic“ Novi Sad</p>
                <p className="text-gray-700 flex items-center justify-center sm:justify-start gap-2 text-sm"><Users className="size-4 shrink-0"></Users><span><strong>Ukupno ucenika: </strong>309</span></p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button variant={'outline'} className="w-full sm:w-auto"><Pencil className="size-4 mr-2"></Pencil>Izmeni profil</Button>
            <Button onClick={()=>{setModalStatus(prev=>({...prev, my_profile: false}))}} className="w-full sm:w-auto">Zatvori</Button>
          </DialogFooter>





          {/* nested izmena profila */}

<Dialog >
      <form action="">

  <DialogContent className="w-full max-w-md">
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

      <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
        <Button type='button' variant={'outline'} className="w-full sm:w-auto">Odustani</Button>
        <Button type='submit' className="w-full sm:w-auto">Sacuvaj</Button>
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