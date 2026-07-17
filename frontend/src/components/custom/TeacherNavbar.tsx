import React, { act, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown';

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
import { Building, File, FileText, LayoutDashboard, Mail, MessageCircle, Pencil, Phone, PowerOff, SquareUserRound, Users, Menu, X, ChevronLeft, BookOpen, LayoutGrid, ChevronDown, Check } from 'lucide-react'
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
import { CircularBorderSpinner } from './CircularBorderSpinner';

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
    super_admin?:   boolean;
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
  const [openFullScreenLoader, SetOpenFullScreenLoader] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const [currentApp] = useState("lms")
  const apps = [
    { id: "lms", name: "Iskra LMS", url: "/app/teacher", icon: BookOpen },
    { id: "planner", name: "Iskra Planner", url: "/app/planner", icon: LayoutGrid },
  ];
  const activeApp = apps.find((a) => a.id === currentApp);

// Onemogućavanje skrolovanja pozadine kada je mobilni meni preko celog ekrana otvoren
useEffect(() => {
  if (isMobileMenuOpen) {
    document.body.classList.add('overflow-hidden')
  } else {
    document.body.classList.remove('overflow-hidden')
  }
  return () => document.body.classList.remove('overflow-hidden')
}, [isMobileMenuOpen])

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
      if (location.pathname !== "/app/teacher/group") {
        SetOpenFullScreenLoader(true)
      }
      const response = await axios.get(`${import.meta.env.VITE_BACKEND}/user/me?count=true`)
      if (response.status === 200) {
setMyProfile(response.data ?? {})
setTimeout(() => {
  SetOpenFullScreenLoader(false)
}, 300);
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
      <div className="h-[70px]" />

      {/* DESKTOP NAVBAR (prikazuje se samo na ekranima srednje veličine i većim - md:) */}
      <div className="hidden md:flex max-w-[calc(100%-2rem)] mx-auto h-[60px] fixed top-2 left-4 right-4 bg-white z-50 justify-between items-center pl-5 border-1 pb-[2px] rounded-xl shadow-sm">
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

        <div className="flex items-center">
            {/* Switch Dropdown (Levi deo) */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className='h-[59px] rounded-l-none rounded-r-none border-0 border-r-0  shadow-none flex items-center gap-2 px-4 border-1 border-b-0'
                >
                    {activeApp && <activeApp.icon className="size-5 text-primary" />}
                    <span className="font-bold text-primary">{activeApp?.name}</span>
                    <ChevronDown className="size-4 ml-1 text-primary" />
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mt-[10px] ml-[20px]">
                <DropdownMenuLabel>Iskra aplikacije</DropdownMenuLabel>
                {apps.map((app) => (
                    <DropdownMenuItem key={app.id} onClick={() => location.href = app.url} className="flex justify-between items-center cursor-pointer">
                    <span className="flex items-center gap-2">
                        <app.icon className="size-4" /> {app.name}
                    </span>
                    {app.id === currentApp && <Check className="size-4 text-emerald-600" />}
                    </DropdownMenuItem>
                ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Profil */}
            <DropdownMenu>
            <DropdownMenuTrigger className='rounded-r-xl' asChild>
                <Button
                variant="outline"
                className='h-[59px] rounded-r-xl rounded-l-none border-0 border-l shadow-none flex flex-col items-end gap-0 border-1 border-b-0'
                >
                <span className="font-bold">Profesor</span>
                <span className='text-lg font-light'>
                    {myProfile?.name}
                </span>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-50 mt-[10px] mr-[20px]" >
                <DropdownMenuGroup className=''>
                <DropdownMenuLabel>Moj nalog</DropdownMenuLabel>
                <DropdownMenuItem onClick={()=>{setModalStatus(prev=>({...prev, my_profile: true}))}}>
                    <SquareUserRound></SquareUserRound> Moj profil
                </DropdownMenuItem>

                {myProfile?.super_admin && (
                    <DropdownMenuItem onClick={()=>{location.href = "/admin"}}>
                    <LayoutDashboard></LayoutDashboard> Administrativni portal
                </DropdownMenuItem>
                )}

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
      </div>

      {/* MOBILNI HEADER (Mini traka na vrhu sa hamburger menijem, sakrivena na md:) */}
      <div className="flex md:hidden max-w-[calc(100%-2rem)] mx-auto h-[60px] fixed top-2 left-4 right-4 bg-white z-50 justify-between items-center px-4 border-1 rounded-xl shadow-sm">
        <div className="flex items-center gap-2">
          <img src="/favicon.png" className='size-8' alt="" />
          <h1 className='text-2xl font-bold'>Iskra</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
          <Menu className="size-6" />
        </Button>
      </div>

      {/* MOBILNI FULL PAGE MENI (Prekriva ceo ekran, z-index 9999, nema skrolovanja iza) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-[9999] flex flex-col p-6 animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Mobilni zatvori zaglavlje */}
          <div className="flex justify-between items-center pb-4 border-b">
            <div className="flex items-center gap-2">
              <img src="/favicon.png" className='size-8' alt="" />
              <h1 className='text-2xl font-bold'>Iskra</h1>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
              <X className="size-6" />
            </Button>
          </div>

          {/* Profil informacije */}
          <div className="my-6 space-y-2">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Profesor</span>
              <span className="text-2xl font-bold text-[#194872]">{myProfile?.name}</span>
            </div>
            <div className="flex flex-col pt-2">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1">
                <Building className="size-3.5" /> Obrazovna institucija
              </span>
              <span className="text-base text-slate-700">{myProfile?.institution}</span>
            </div>
          </div>

          <Separator className="my-2" />

          {/* mobile nav */}
          <div className="flex-1 overflow-y-auto space-y-3 py-4">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">Moj nalog</p>
              
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 text-base h-12"
                onClick={() => { setIsMobileMenuOpen(false); setModalStatus(prev => ({...prev, my_profile: true})) }}
              >
                <SquareUserRound className="size-5" /> Moj profil
              </Button>

              {myProfile?.super_admin && (
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 text-base h-12"
                  onClick={() => { setIsMobileMenuOpen(false); location.href = "/admin" }}
                >
                  <LayoutDashboard className="size-5" /> Administrativni portal
                </Button>
              )}

              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 text-base h-12"
                onClick={() => { setIsMobileMenuOpen(false); setModalStatus(prev => ({...prev, messages: true})) }}
              >
                <MessageCircle className="size-5" /> Poruke
              </Button>

              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 text-base h-12"
                onClick={() => { setIsMobileMenuOpen(false); setModalStatus(prev => ({...prev, support: true})) }}
              >
                <Phone className="size-5" /> Tehnička podrška
              </Button>
            </div>

            <Separator className="my-4" />

            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">Dokumentacija</p>
              
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 text-base h-12"
                onClick={() => { setIsMobileMenuOpen(false); setModalStatus(prev => ({...prev, documents: true})) }}
              >
                <File className="size-5" /> Uputstva za korisnike
              </Button>

              <Link to={'/legal/privacy'} onClick={() => setIsMobileMenuOpen(false)} className="block">
                <Button variant="ghost" className="w-full justify-start text-base h-12 px-3">
                  Politika privatnosti
                </Button>
              </Link>

              <Link to={'/legal/terms'} onClick={() => setIsMobileMenuOpen(false)} className="block">
                <Button variant="ghost" className="w-full justify-start text-base h-12 px-3">
                  Uslovi upotrebe
                </Button>
              </Link>
            </div>
          </div>

          <Separator className="my-2" />

          {/* Odjava na dnu */}
          <div className="pt-4 pb-6">
            <Button 
              variant="destructive" 
              className="w-full h-12 gap-3 text-base"
              onClick={() => { setIsMobileMenuOpen(false); HandleLogout() }}
            >
              <PowerOff className="size-5" /> Odjava
            </Button>
          </div>
        </div>
      )}



{/* sistemske poruke */}
<Dialog open={modalStatus.messages} onOpenChange={(val)=>{setModalStatus(prev => ({...prev, messages: val}))}}>
  <DialogContent showCloseButton={true} className='max-w-full sm:max-w-5xl w-[95%] sm:w-full h-[85vh] flex flex-col gap-4 p-4 sm:p-6'>
    
    <DialogHeader className='text-xl font-bold flex flex-row items-center gap-3 h-fit'>
      {activeMessage && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="sm:hidden p-0 h-8 w-8" 
          onClick={() => setActiveMessage(null)}
        >
          <ChevronLeft></ChevronLeft>
        </Button>
      )}
      <span>Poruke</span>
    </DialogHeader>

    <div className="border border-slate-200 w-full flex-1 overflow-hidden flex items-stretch rounded-xl bg-slate-50/50 min-h-0">
      
      {/*Lista poruka */}
      <div className={`w-full sm:w-[35%] h-full flex flex-col bg-white border-r border-slate-200 overflow-y-auto min-h-0 ${activeMessage ? 'hidden sm:flex' : 'flex'}`}>
        {messages?.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Nemate sistemskih poruka.</div>
        ) : (
          messages?.map((item, index) => {
            const isRead = determineReadCall(item, true);
            const isActive = activeMessage?._id === item._id;
            
            return (
              <div
                onClick={() => { setActiveMessage(item); determineReadCall(item); }}
                key={index}
                className={`w-full p-4 border-b border-slate-100 transition-all duration-100 hover:cursor-pointer flex flex-col gap-1.5 border-l-4
                  ${isRead ? "bg-white border-l-transparent" : "bg-[#194872]/5 border-l-[#194872]"} 
                  ${isActive ? "bg-slate-100/90" : "hover:bg-slate-50/80"}`}
              >
                <span className="text-[11px] font-medium text-slate-400 tracking-wide">
                  {moment(item.date).format("DD. MM. YYYY. HH:mm")}
                </span>
                
                <p className={`text-sm flex items-center gap-2.5 leading-snug line-clamp-2 ${!isRead ? "text-[#194872] font-bold" : "text-gray-500"}`}>
                  <Mail className={`size-4 flex-shrink-0 ${!isRead ? 'text-[#194872]' : 'text-slate-400'}`} />
                  <span className="break-words">{item.title}</span>
                </p>
              </div>
            );
          })
        )}
      </div>

      {/*Sadrzaj poruke */}
      <div className={`w-full sm:w-[65%] h-full bg-white flex flex-col min-h-0 ${activeMessage ? 'flex' : 'hidden sm:flex items-center justify-center text-slate-400 bg-slate-50/30'}`}>
        {activeMessage ? (
          <div className="p-5 sm:p-6 h-full flex flex-col min-h-0 w-full animate-in fade-in-50 duration-200">
            
            <div className="flex flex-col gap-1 mb-3 flex-shrink-0">
              <h2 className="text-lg sm:text-xl font-bold text-[#194872] leading-tight break-words">
                {activeMessage.title}
              </h2>
              
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 font-medium mt-1">
                <span>{moment(activeMessage.date).format("D. MM. YYYY. HH:mm")}</span>
              </div>
            </div>

            <Separator className='my-3'></Separator>

            <div className="flex-1 overflow-y-auto pr-1 min-h-0">
              <div 
                dangerouslySetInnerHTML={{ __html: activeMessage.description ?? "" }} 
                className='text-sm sm:text-base text-slate-700 leading-relaxed iskra-rich-text prose max-w-none'
              />
            </div>
            
          </div>
        ) : (
          <div className="text-center p-6 flex flex-col items-center gap-2">
            <Mail className="size-8 text-slate-300" />
            <p className="text-sm font-medium">Izaberite poruku iz liste da biste je pročitali</p>
          </div>
        )}
      </div>

    </div>

    <DialogFooter className="flex-shrink-0 sm:justify-end border-t border-slate-100 pt-3">
      <Button variant='outline' onClick={() => { setModalStatus(prev => ({ ...prev, messages: false })) }}>
        Zatvori poruke
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>




      {/* dokumenta */}
 <Dialog open={modalStatus.documents} onOpenChange={(val)=>{setModalStatus(prev => ({...prev, documents: val}))}}>
  <DialogContent className='max-w-full sm:max-w-4xl w-[95%] sm:w-full max-h-[80vh] p-6 sm:p-8 flex flex-col min-h-0'>
    <DialogHeader className='text-xl font-bold mb-4'>
      Uputstva za korisnike
    </DialogHeader>

    <div className="flex flex-col sm:flex-row items-center sm:items-stretch justify-center gap-6 sm:gap-10 flex-1 min-h-0">
      
      <div className="flex items-center justify-center flex-shrink-0">
        <img 
          src="/undraw_documents_9rcz.svg" 
          className='w-full max-w-[150px] sm:max-w-[240px] h-auto object-contain' 
          alt="Documents illustration" 
        />
      </div>

      <div className="overflow-y-auto flex-1 w-full border rounded-lg bg-card min-h-0">
        {documents.map((item, index) => (
          <a 
            key={index} 
            target='_blank' 
            href={item.link} 
            className="w-full p-4 border-b last:border-b-0 flex gap-3 text-[#194872] hover:text-[#c55258] hover:bg-slate-50/50 transition-colors items-center"
          >
            <FileText className='w-5 h-5 flex-shrink-0' />
            <span className='text-base font-medium flex-1 line-clamp-2'>{item.title}</span>
          </a>
        ))}
      </div>

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
            <p className="text-gray-700 italic">Za izmenu Vašeg imena ili institucije u kojoj ste zaposleni, <a className="text-primary hover:underline hover:cursor-pointer" onClick={()=>{
              setModalStatus(prev => ({...prev, my_profile: false})),
              setModalStatus(prev => ({...prev, support: true}))
            }}>kontaktirajte korisničku podršku.</a></p>

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
  <DialogContent className='max-w-full sm:max-w-4xl w-[95%] sm:w-full p-6 sm:p-8'>
    <DialogHeader className='text-xl font-bold'>Tehnička podrška</DialogHeader>
    
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 mt-6">
      
      <img 
        src="/undraw_envelope_hem0.svg" 
        className='w-full max-w-[180px] sm:max-w-[280px] h-auto object-contain' 
        alt="Support illustration" 
      />
      
      <div className='w-full max-w-md sm:max-w-lg text-base sm:text-lg text-center sm:text-left flex flex-col gap-3'>
        <p className="text-muted-foreground leading-relaxed">
          Molimo Vas da podršku kontaktirate na mejl ispod. Vaš mejl biće zaveden kao slučaj u sistemu za tehničku podršku.
        </p>
        <span className='font-bold text-lg sm:text-xl text-primary block break-all mt-2'>
          podrska@iskraedu.zohodesk.eu
        </span>
      </div>

    </div>
  </DialogContent>
</Dialog>

{/* FULL SCREEN LOADER */}
<Dialog open={openFullScreenLoader}>
  <DialogContent showCloseButton={false} className='min-w-full rounded-none min-h-screen flex justify-center items-center duration-0'>
<CircularBorderSpinner size='lg'></CircularBorderSpinner>
  </DialogContent>
</Dialog>


    </>
  )
}

export default TeacherNavbar