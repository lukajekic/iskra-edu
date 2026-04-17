import PageTitle from '@/components/custom/PageTitle'
import { Button } from '@/components/ui/button'
import { Ban, Fullscreen, Info, LogOut, PlusSquare, Users, X } from 'lucide-react'
import React, { use, useEffect, useState } from 'react'
import Footer from '@/components/custom/Footer'
import { DataTable } from '@/components/custom/data-table'
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Field, FieldGroup } from '@/components/ui/field'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import moment from 'moment-timezone'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import axios from 'axios'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { io } from 'socket.io-client'
import { useUserId } from '@/context/UserContext'
import { Badge } from '@/components/ui/badge'
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
import { toast } from 'sonner'

type ProgressPerStudent = {
    name:      string;
    studentid: string;
    correct:   number;
    createdAt: Date;
}



const Group =   () => {
const [groupActive, setGroupActive] = useState(false)
const [codeFullScreen, setCodeFullScreen] = useState(false)
const [workhourData, setWorhourData] = useState()
const [openEndModal, setopenendmodal] = useState(false)
const [openForbidModal, SetOpenForbidModal] = useState(false)

const [progress, setProgress] = useState([])
const { userID } = useUserId()
const [workhourProgress, setWorkhourProgress] = useState<ProgressPerStudent[]>([])


const endclass = async()=>{
  try {
    const response = await axios.delete(`${import.meta.env.VITE_BACKEND}/user/me/workhour/end`)
    if (response.status === 200) {
      location.reload()
    }
  } catch (error) {
    console.error(error)
  }
}

const forbidwork = async()=>{
  try {
    const response = await axios.post(`${import.meta.env.VITE_BACKEND}/user/me/workhour/forbid`)
    if (response.status === 200) {
toast.success("Uspesno!")
SetOpenForbidModal(false)
    }
  } catch (error) {
    console.error(error)
  }
}


const fetchWorhourData = async()=>{
  try {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND}/user/me/workhour`)
    if (response.status === 200 && response.data) {
      setWorhourData(response.data)
      const diff = new Date(response.data.expiry).getTime() - new Date().getTime()

      if (diff > 0) {
        setGroupActive(true)
      } else {
        setGroupActive(false)
      }
    } else {
      setGroupActive(false)
    }
  } catch (error) {
    console.error(error)
    setGroupActive(false)
  }
}


const fetchWorhourProgress = async()=>{
  try {
    const response = await axios.get<ProgressPerStudent[]>(`${import.meta.env.VITE_BACKEND}/user/me/workhour/progress`)
    if (response.status === 200 && response.data) {
      setWorkhourProgress(response.data)
    }
  } catch (error) {
    console.error(error)
    setWorkhourProgress([])
  }
}




const createNewGroup = async()=>{
  try {
    const response = await axios.post(`${import.meta.env.VITE_BACKEND}/user/me/workhour/create`)
    if (response.status === 200) {
      location.reload()
    }
  } catch (error) {
    
  }
}

useEffect(() => {
  fetchWorhourData();
  fetchWorhourProgress()
  console.log("globalni id:", userID)

  if (userID) {
    let socket = io(import.meta.env.VITE_BACKEND)

    socket.emit("join_room", userID);

    const handleJoinStudent = (newStudent) => {
      console.log("NOVI UCENIK STIGAO:", newStudent);
      setWorkhourProgress((prev) => [...prev, newStudent]);

      //dodati ga u tabelu
    }


    const handleProgressUpdate = (updateData) => {
      console.log("NOVI INCREMENT STIGAO:", updateData);

      //INCRMENETUJ SCORE

      setWorkhourProgress(prev =>
        prev.map(item => item.studentid === updateData.studentid ? {...item, correct: item.correct + 1} : item)
      )
    }

    socket.on('join_student', handleJoinStudent)
    socket.on('increment_progress', handleProgressUpdate)

    return () => {
      socket.off('join_student', handleJoinStudent);
      socket.off('increment_progress', handleProgressUpdate)
    };
  }
}, [userID]);
  return (
    <>
    <PageTitle title='Nastavna grupa' subtitle='Započnite nastavno predavanje ili pratite napredak aktivnog.'></PageTitle>

    <div className="w-full flex gap-0 justify-between">
           <Alert className='mt-3 h-fit w-full lg:w-[70%]'>
      <Info></Info>
      <AlertTitle>
        Preporuka
      </AlertTitle>
      <AlertDescription>
        reporučeno je da svim svojim đacima kreirate naloge u odeljku „Učenici“ i tako im omogućite vežbanje zadataka kod kuće i dugoročno praćenje napredka i uvid u svoje radove. Ukoliko se odlučite za pristup kodom, ovde možete kreirati grupu koja će važiti 45 minuta.
        <br></br>
        <strong className='text-red-600'>Nakon isteka perioda važenja grupe svi podaci o napredku biće obrisani.</strong>
      </AlertDescription>
    </Alert>
    
        <img src="/undraw_educator_6dgp.svg" className='  h-[150px] hidden lg:block ' alt="" />
        </div>
   
    {!groupActive ? (
      <Button onClick={()=>{createNewGroup()}}><Users></Users>Nova grupa</Button>
    ) : (
      <>
      <div>
        <span className="font-bold text-2xl">Kod za pristup</span>
        <div className="border-1  text-orange-700 w-fit rounded-2xl mt-2 flex ">
          <span className="p-5 text-5xl font-bold">{workhourData?.code?.slice(0, 4)}<span className='select-none'>-</span>{workhourData?.code?.slice(4)}</span>
          <Button onClick={()=>{setCodeFullScreen(true)}} variant={'outline'} className='h-auto text-gray-500 border-1 border-transparent border-l-1 border-l-[var(--border)] rounded-r-2xl rounded-l-none'><Fullscreen className='size-6'></Fullscreen></Button>
        </div>
      </div>
      <div className="w-full flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger>
                  <Button variant={'destructive'}><X></X>Završi čas</Button>

        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-fit'>
          <DropdownMenuItem variant='destructive' onClick={()=>{setopenendmodal(true)}}>
<LogOut></LogOut>Odjavi sve učenike
          </DropdownMenuItem>

            <DropdownMenuItem variant='destructive' onClick={()=>{SetOpenForbidModal(true)}}>
<Ban></Ban> Zabrani dalji rad
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      </div>
      <Separator className='mb-5 mt-2'></Separator>
      <div>
        <span className="font-bold text-2xl">Napredak grupe</span>
        <div className="p-5 border-1 text-5xl font-bold   rounded-2xl mt-2">
 <Table >
      <TableCaption>Kraj tabele.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Ime i prezime</TableHead>
          <TableHead>Vreme prijave</TableHead>
          <TableHead className="text-right">Napredak (urađeni zadaci)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {workhourProgress.sort((a,b)=>b.correct - a.correct).map((item, index) => (
          <TableRow key={item.studentid}>
            <TableCell>{item.name}</TableCell>
            <TableCell>{moment.utc(item.createdAt).local().format("HH:mm")}</TableCell>
            <TableCell className="text-right">
              <Badge className='bg-green-600 text-lg h-[32px]'>
                {item.correct.toString()}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
   
      </TableFooter>
    </Table>
        </div>
      </div>
      </>
    )}
        <div className="h-5"></div>



{/* edit */}
<Drawer  direction='right' >
  <DrawerContent className='pb-[60px]'>
    <DrawerHeader className='font-bold text-lg'>
      Izmeni učenika
    </DrawerHeader>
    <FieldGroup className='px-5'>
      <Field>
        <Label>
          Ime i prezime
        </Label>
        <Input></Input>
        </Field>


        <Field>
        <Label>
          Ime i prezime
        </Label>
        <Input></Input>
        </Field>
    </FieldGroup>
    <DrawerFooter>
    <Button variant={'outline'}>Odusani</Button>
    <Button>Sacuvaj</Button>
  </DrawerFooter>
  </DrawerContent>
  
</Drawer>


<Dialog >
  <DialogContent>
    <DialogHeader>
      Dodaj ucenika
    </DialogHeader>
    <FieldGroup>
      <Field>
        <Label>
          Ime i prezime
        </Label>
        <Input>
        </Input>
      </Field>
    </FieldGroup>
    <Alert>
              <Info></Info>

      <AlertTitle>
        Podaci za prijavu
      </AlertTitle>
      <AlertDescription>
        Podaci za prijavu na portal za ucenike bice automatski generisani i uvek dostupni Vama u tabeli.
      </AlertDescription>
    </Alert>
    <DialogFooter>
      <Button variant={'outline'}>Odustani</Button>
      <Button>Sacuvaj</Button>
    </DialogFooter>
    </DialogContent>
</Dialog>
    <Footer></Footer>

    <Dialog open={codeFullScreen} onOpenChange={(val)=>{setCodeFullScreen(val)}} >
      <DialogContent className='min-w-fit'>
          <div className='w-fit'>
        <span className="font-bold text-2xl">Kod za pristup</span>
        <div className="p-5 border-1 text-7xl font-bold text-orange-700 w-fit rounded-2xl mt-2">{workhourData?.code?.slice(0, 4)}<span className='select-none'>-</span>{workhourData?.code?.slice(4)}</div>
      </div>
      </DialogContent>
    </Dialog>


      <AlertDialog open={openEndModal} onOpenChange={(e)=>{setopenendmodal(e)}}>
    
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Da li ste sigurni?</AlertDialogTitle>
          <AlertDialogDescription>
            Ukoliko sada završite čas, nećete imati dalji uvid napretka ičenika dok ne počnete sledeći čas.
            Vaši učenici biće momentalno odjavljeni.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={()=>[setopenendmodal(false)]}>Odustani</AlertDialogCancel>
          <AlertDialogAction variant={'destructive'} onClick={()=>{endclass()}}>Potvrdi</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <AlertDialog open={openForbidModal} onOpenChange={(e)=>{SetOpenForbidModal(e)}}>
    
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Da li ste sigurni?</AlertDialogTitle>
          <AlertDialogDescription>
            Zabranom rada imaćete uvid u rešenja Vaših učenika, ali dalje slanje zadataka će biti omogućeno dok ne pokrente novu grupu.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={()=>[SetOpenForbidModal(false)]}>Odustani</AlertDialogCancel>
          <AlertDialogAction variant={'destructive'} onClick={()=>{forbidwork()}}>Potvrdi</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}

export default Group