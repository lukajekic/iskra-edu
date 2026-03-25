import React, { act, useEffect, useState } from 'react'
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
import { Building, File, FileText, MessageCircle, Pencil, Phone, PowerOff, SquareUserRound, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '../ui/dialog'
import { Separator } from '../ui/separator'
import usericon from '../../assets/user.png'
import { Field, FieldGroup } from '../ui/field'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { HandleLogout } from '@/utils/logout'
import axios from 'axios'
import { toast } from 'sonner'
import { useUserId } from '@/context/UserContext'
import moment from 'moment-timezone'

type ModalStatus = {
  my_profile: boolean,
  messages: boolean,
  documents: boolean,
support: boolean
}

type Document = {
    _id:   string;
    title: string;
    link:  string;
}

type Message = {
    _id:         string;
    title:       string;
    description: string;
    read:        string[];
    date:        Date;
}

type Profile = {
    _id:            string;
    name:           string;
    type:           string;
    username:       string;
    activegroup?:    Activegroup;
    institution:    string;
    __v:            number;
    students_count?: number;
}

type Activegroup = {
    expiry: Date;
    code:   string;
    _id:    string;
}
const TeacherNavbar = () => {
  const {userID, setUserID} = useUserId()
  const [documents, setDocuments] = useState<Document[]>([])
const [messages, setMessages] = useState<Message[]>()
const [activeMessage, setActiveMessage] = useState<Message>()
const [myProfile, setMyProfile] = useState<Profile>()
const sendReadStatus = async(messageid:string)=>{
  try {
    const response = await axios.post(`${import.meta.env.VITE_BACKEND}/user/me/messages/read`, {
      message: messageid //iz cookia ce procitati user id tako da session storage ne utice mngoo osim na ui prikaz unread
    })

    if (response.status === 200) {
      return 
    }
  } catch (error) {
    console.error(error)
  }
}

const determineReadCall = (message:Message, dontcall:boolean=false)=>{
try {
  if (message) {
    let read = message.read.find(item => item === userID)
    if (!read) {
      
      if (dontcall) {
        return false
      } else {
console.log('procatiti ovu poruku na serveru', message._id)
sendReadStatus(message._id)
return
      }
    } else {
      return true
    }
  }
} catch (error) {
  
}
}
  const getDocuments = async()=>{
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND}/user/me/documents`)
      if (response.status === 200) {
setDocuments(response.data ?? [])
      }
    } catch (error) {
      
    }
  }



    const getProfile = async()=>{
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND}/user/me?count=true`)
      if (response.status === 200) {
setMyProfile(response.data ?? {})
      }
    } catch (error) {
      console.error(error)
    }
  }


  const getMessages = async()=>{
    console.log("preuzimanje poruka....")
    try {
      const response = await axios.get<Message[]>(`${import.meta.env.VITE_BACKEND}/user/me/messages`)
      if (response.status === 200) {
setMessages(response.data ?? [])
let unread = response.data.filter(item => !item.read.includes(userID))

if (unread.length > 0) {
  
  toast.info("Imate neprocitane poruke.")
}

if (response.data.length > 0) {
  let first_message = response.data[0]
  setActiveMessage(first_message)
 
  
}
      }
    } catch (error) {
      
    }
  }
  useEffect(()=>{
    getProfile()
getDocuments()

  }, [])

  const [modalStatus, setModalStatus] = useState<ModalStatus>({
    my_profile: false,
    messages: false,
    documents: false,
    support: false
  })


  //za citanje poruke index
  useEffect(()=>{
if (messages && messages?.length  > 0 && modalStatus.messages === true) {
  let first_message = messages[0]
  setActiveMessage(first_message)
  if (!first_message.read.includes(userID ?? "")) {
    console.log("index poruku read-ovati", first_message._id)
    sendReadStatus(first_message._id)
  }
  
}
  }, [modalStatus.messages])

  useEffect(()=>{
if (myProfile?._id) {
  setUserID(myProfile._id)
}
  }, [myProfile])

  useEffect(()=>{
if (userID) {
  console.log("context spreman, vraca:", userID)
  getMessages()
} else {
  console.log("context jos nije spreman")
}
  }, [userID])
  return (
    <>
      <div className="h-[62px]" />

      <div className="w-full h-[60px] fixed top-0 bg-white z-50 flex justify-between items-center pl-5 border-b-[2px] border-amber-500 pb-[2px]">
        <div className="flex items-center gap-2 h-full">
          <img src="/favicon.png" className='size-10' alt="" />
          <div className="flex items-end gap-1">
            <h1 className='text-3xl font-bold'>Iskra</h1>
            <p className='mb-[2px]'>za profesore</p>
          </div>

          <div className="border-x w-fit h-full flex flex-col items-start gap-0 justify-center px-5 ml-2">
            <span className='font-bold flex items-center'>
              <Building className='size-5 mr-2' />
              Obrazovna institucija:
            </span>
            <span>{myProfile?.institution}</span>
          </div>
        </div>

        {/* auth */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className='h-[60px] border-0 border-l rounded-none shadow-none flex flex-col items-end gap-0'
            >
              <span className="font-bold">Profesor</span>
              <span className='text-lg font-light'>
                {myProfile?.name}
              </span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-50 rounded-r-none rounded-tl-none -mt-[1px]" >
            <DropdownMenuGroup className=''>
              <DropdownMenuLabel>Moj nalog</DropdownMenuLabel>
              <DropdownMenuItem onClick={()=>{setModalStatus(prev=>({...prev, my_profile: true}))}}>
                <SquareUserRound></SquareUserRound> Moj profil
              </DropdownMenuItem>

              <DropdownMenuItem onClick={()=>{setModalStatus(prev=>({...prev, messages: true}))}}>
                <MessageCircle></MessageCircle> Poruke
              </DropdownMenuItem>

              <DropdownMenuItem onClick={()=>{setModalStatus(prev=>({...prev, support: true}))}}>
                <Phone></Phone> Tehnička podrška
              </DropdownMenuItem>


            <DropdownMenuSeparator />
             </DropdownMenuGroup>

            
           <DropdownMenuGroup>
               <DropdownMenuLabel className='capitalize'>dokumentacija</DropdownMenuLabel>
              <DropdownMenuItem onClick={()=>{setModalStatus(prev=>({...prev, documents: true}))}}>
                <File></File> Uputstva za korisnike
              </DropdownMenuItem>

               <Link target='_blank' to={'/legal/privacy'}>
               <DropdownMenuItem>
                Politika privatnosti
              </DropdownMenuItem>
              </Link>

               <Link target='_blank' to={'/legal/terms'}>
               <DropdownMenuItem>
                Uslovi upotrebe
              </DropdownMenuItem>
              </Link>



           </DropdownMenuGroup>
                          <DropdownMenuSeparator />

             <DropdownMenuGroup>
                <DropdownMenuItem onClick={()=>{HandleLogout()}} variant='destructive'>
                <PowerOff></PowerOff>
                Odjava
              </DropdownMenuItem>
            </DropdownMenuGroup>

             




          </DropdownMenuContent>
        </DropdownMenu>
      </div>





      {/* sistemske poruke */}
      <Dialog   open={modalStatus.messages} onOpenChange={(val)=>{setModalStatus(prev => ({...prev, messages: val}))}} >
        <DialogContent showCloseButton={true} className='min-w-[70%] w-[70%] min-h-[80%] h-[80%] flex flex-col gap-2'>
          <DialogHeader className='text-lg font-bold h-fit'>
            Poruke
          </DialogHeader>
<div className="border-1 w-full h-full overflow-hidden flex items-start">
    <div className=" w-[30%] h-full flex flex-col gap-0 items-start overflow-y-auto">

     {messages?.map((item, index) => (
  <div
  onClick={()=>{setActiveMessage(item),  determineReadCall(item)}}
    key={index}
    className={`w-full h-fit p-2 border-b-1 
      ${determineReadCall(item, true) ? "bg-white" : "bg-[#cecece]/15"} 
      hover:bg-white hover:border-l-2 hover:border-l-blue-400 hover:cursor-pointer`}
  >
    <p className={`text-xs text-gray-500`}>{moment(item.date).format("DD. MM. YYYY. HH:mm")}</p>
    <p className={`text-[16px] ${!determineReadCall(item, true) ? "text-[#194872] font-bold" : "text-gray-500"}`}>
      {item.title}
    </p>
  </div>
))}
    </div>
  <div className="p-5 w-[70%] h-full border-[2px] border-[#194872] flex flex-col">
    <p className="text-[20px] text-[#194872]">
      {activeMessage?.title}
    </p>
        <p className={`text-xs text-gray-500`}>{moment(activeMessage?.date).format("D.. MM. YYYY. HH:mm")}</p>

<Separator className='my-2'></Separator>

<div className="flex-1 overflow-y-auto">
  <p dangerouslySetInnerHTML={{ __html: activeMessage?.description ?? "" }} className='text-[15px] text-gray-700 iskra-rich-text'>
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
  {documents.map((item, index)=>(
  <a key={index} target='_blank' href={item.link}  className="w-full  p-3 border-b-1 flex gap-2 text-[#194872] hover:text-[#c55258] hover:cursor-pointer items-center">
    <FileText className='w-[24px]'></FileText>
<span className='text-[16px] flex-1'>{item.title}</span>
  </a>
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
              <p className="text-xl font-bold">{myProfile?.name}</p>
              <p className="text-gray-700">@{myProfile?.username}</p>
              <br></br>
              <p className="text-gray-700 inline-flex items-center gap-2"><Building></Building>{myProfile?.institution}</p>
              <br></br>
              <p className="text-gray-700 inline-flex items-center gap-2"><Users></Users><strong>Ukupno ucenika:</strong>{myProfile?.students_count || 0}</p>

            </div>
          </div>

          <DialogFooter>
            <Button className='hidden' variant={'outline'}><Pencil></Pencil>Izmeni profil</Button>
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





      {/*podrska*/}

<Dialog open={modalStatus.support} onOpenChange={(val)=>{setModalStatus(prev => ({...prev, support: val}))}}>
  <DialogContent className='min-w-fit p-5'>
    <DialogHeader className='text-lg font-bold'>Tehnička podrška</DialogHeader>
    <div className="flex items-center gap-5">
      <img src="/undraw_calling_d6vk.svg" className='w-[250px]' alt="" />
      <span className='w-[350px] text-lg text-right'>Molimo Vas da podršku kontaktirate na mejl ispod. Vaš mejl biće zaveden kao slučaj u sistemu za tehničku podršku.
        <br />
        <br />
        <span className='font-bold'>podrska@iskraedu.zohodesk.eu</span>
      </span>
    </div>
  </DialogContent>
</Dialog>


    </>
  )
}

export default TeacherNavbar