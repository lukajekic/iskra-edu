import PageTitle from '@/components/custom/PageTitle'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

const StudentExams = () => {
    const [activeExamID, setActiveExamID] = useState("")
    const [openConfirmaitonModal, setOpenConfirmationModal] = useState(false)
    const [openTermsModal, setOpenTermsModal] = useState(false)
    const [loadingExam, setLoadingExam] = useState(false)
    const [data, setData] = useState()
    const navigate = useNavigate()
    const StartExam = async()=>{
        setTimeout(() => {
            toast.info("Kontrolni zadatak je započet!")
            setLoadingExam(false)
            navigate('/app/exam/abc')
        }, 5000)

        
    }

    const getData = async()=>{
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND}/studentexams`)
        if (response.status === 200) {
          setData(response.data)
        }
      } catch (error) {
        toast.error("Desila se greska")
      }
    }

    useEffect(()=>{
      getData()
    }, [])
  return (
    <>
    <section className='p-5'>
    <PageTitle title='Kontrolni zadaci' subtitle='Ovde možeš pogledati sve kontrolne zadatke.'></PageTitle>

  <div className="flex flex-wrap gap-2 mt-5">
  {Array.from({ length: 5 }).map((item, index) => (
    <div key={index} className="p-5 shadow-[0_2px_6px_rgba(0,0,0,0.2)] w-fit">
      <span><span className="font-bold">Naziv: </span>Test1</span>
      <br />
      
      {/* [PROMENJENO]: Zamena teksta sa pojedinačnim shadcn Badge komponentama */}
      <div className="flex items-center gap-2 mt-1">
        <span className="font-bold">Odeljenja:</span>
        <div className="flex flex-wrap gap-1.5">
          {["V-1", "V-2", "V-3", "V-4", "V-5", "V-6", "V-7"].map((odeljenje) => (
            <Badge key={odeljenje} variant="secondary" className="rounded-[4px]">
              {odeljenje}
            </Badge>
          ))}
        </div>
      </div>
      
      <Button onClick={() => { setOpenConfirmationModal(true) }} className='rounded-[5px] mt-2'>Pokreni</Button>
    </div>
  ))}
</div>

   <AlertDialog open={openConfirmaitonModal}>
      <AlertDialogContent className='rounded-[5px]'>
        <AlertDialogHeader>
          <AlertDialogTitle>Da li ste sigurni?</AlertDialogTitle>
          <AlertDialogDescription>
            Kontrolnom zadatku možete pristupiti samo jednom. Nakon izlaza sa platforme kontrolni zadatak će biti završen.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button onClick={()=>{setOpenConfirmationModal(false)}} variant={'outline'} className='rounded-[5px]'>Odustani</Button>
          <Button onClick={()=>{setOpenConfirmationModal(false), setOpenTermsModal(true)}} className='rounded-[5px]'>Nastavi</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <Dialog open={openTermsModal}>
        <DialogContent showCloseButton={false} className='rounded-[5px]'>
            <DialogHeader>
                <DialogTitle className='text-lg font-bold'>Pravila kontrolnog zadatka</DialogTitle>
            </DialogHeader>
<ul className="list-disc list-inside space-y-2">
    <li>
        Napuštanje platforme ISKRA je zabranjeno, kontrolni će biti obeležen kao nevažeći ukoliko napustite platformu.
    </li>

    <li>
        Za sve konsultacije, oslonite se isključivo na predmetnog profesora.
    </li>

    <li>Prepisivanje, komunikacija i dogovaranje sa drugim učesnicima kontrolnog zadatka je strogo zabranjeno.</li>

    <li>Nemojte ometati ostale učesnike.</li>
</ul>

            <DialogFooter>
                {!loadingExam && (
                    <Button onClick={()=>{setOpenTermsModal(false)}} className='rounded-[5px]' variant={'outline'}>Odustani</Button>
                )}
                <Button disabled={loadingExam} onClick={()=>{[setLoadingExam(true), StartExam()]}} className='rounded-[5px]'>
                    {loadingExam ? (
                        <Spinner data-icon="inline-start" />
                    ) : (
                        <span>Potvrdi i zapocni rad</span>
                    )}
                    </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </section>
    <section className='p-5'>
    <PageTitle title='Ocenjene provere' subtitle='Ovde možeš pogledati sve ocenjene kontrolne zadatke.'></PageTitle>

   <div className="flex flex-wrap gap-2 mt-5">
     {Array.from({ length: 5 }).map((_, index) => {
  // index ide od 0 do 4, pa dobijamo ocene od 5 do 1
  const ocena = 5 - index; 
  
  const boje = {
    5: { border: 'border-t-green-500', text: 'text-green-500' },
    4: { border: 'border-t-teal-500', text: 'text-teal-500' },
    3: { border: 'border-t-yellow-500', text: 'text-yellow-500' },
    2: { border: 'border-t-orange-500', text: 'text-orange-500' },
    1: { border: 'border-t-red-500', text: 'text-red-500' },
  }[ocena];

  return (
    <div key={index} className={`p-5 shadow-[0_2px_6px_rgba(0,0,0,0.2)] w-fit border-t-[2px] ${boje.border}`}>
      <span><span className="font-bold">Naziv: </span>Test1</span>
      <br />
      <span><span className="font-bold">Predato: </span>31. 05. 2026. 13:27</span>
      <br />
      <hr />
      <span className='text-lg'>
        <span className="font-bold">Ocena: </span>
        <span className={boje.text}>{ocena}</span>
      </span>
      <br />
      <Button variant={'outline'} onClick={() => { setOpenConfirmationModal(true) }} className='rounded-[5px] mt-2'>Otvori</Button>
    </div>
  );
})}
   </div>

   <AlertDialog open={openConfirmaitonModal}>
      <AlertDialogContent className='rounded-[5px]'>
        <AlertDialogHeader>
          <AlertDialogTitle>Da li ste sigurni?</AlertDialogTitle>
          <AlertDialogDescription>
            Kontrolnom zadatku možete pristupiti samo jednom. Nakon izlaza sa platforme kontrolni zadatak će biti završen.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button onClick={()=>{setOpenConfirmationModal(false)}} variant={'outline'} className='rounded-[5px]'>Odustani</Button>
          <Button onClick={()=>{setOpenConfirmationModal(false), setOpenTermsModal(true)}} className='rounded-[5px]'>Nastavi</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <Dialog open={openTermsModal}>
        <DialogContent showCloseButton={false} className='rounded-[5px]'>
            <DialogHeader>
                <DialogTitle className='text-lg font-bold'>Pravila kontrolnog zadatka</DialogTitle>
            </DialogHeader>
<ul className="list-disc list-inside space-y-2">
    <li>
        Napuštanje platforme ISKRA je zabranjeno, kontrolni će biti obeležen kao nevažeći ukoliko napustite platformu.
    </li>

    <li>
        Za sve konsultacije, oslonite se isključivo na predmetnog profesora.
    </li>

    <li>Prepisivanje, komunikacija i dogovaranje sa drugim učesnicima kontrolnog zadatka je strogo zabranjeno.</li>

    <li>Nemojte ometati ostale učesnike.</li>
</ul>

            <DialogFooter>
                {!loadingExam && (
                    <Button onClick={()=>{setOpenTermsModal(false)}} className='rounded-[5px]' variant={'outline'}>Odustani</Button>
                )}
                <Button disabled={loadingExam} onClick={()=>{[setLoadingExam(true), StartExam()]}} className='rounded-[5px]'>
                    {loadingExam ? (
                        <Spinner data-icon="inline-start" />
                    ) : (
                        <span>Potvrdi i zapocni rad</span>
                    )}
                    </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </section>
    </>
  )
}

export default StudentExams