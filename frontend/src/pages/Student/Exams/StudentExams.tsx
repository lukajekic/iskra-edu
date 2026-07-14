import PageTitle from '@/components/custom/PageTitle'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import axios from 'axios'
import moment, { tz } from 'moment-timezone'
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
        setTimeout(async() => {
            try {
              const respomse = await axios.post(`${import.meta.env.VITE_BACKEND}/studentexams/initialize?test=${activeExamID}`)
            if (respomse.status === 201) {
setLoadingExam(false)
            navigate(`/app/exam/${activeExamID}`)
            } else {
              toast.error("Desila se greska!")
              setLoadingExam(false)
              setOpenTermsModal(false)
            }
            } catch (error) {
              toast.error("Desila se greska!")
              setLoadingExam(false)
              setOpenTermsModal(false)
            }
            
        }, 1500)

        
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
    <section className='p-4 md:p-5'>
    <PageTitle title='Kontrolni zadaci' subtitle='Ovde možeš pogledati sve kontrolne zadatke.'></PageTitle>

  <div className="flex flex-wrap gap-4 mt-5">
  {data?.assigned_tests?.map((item, index) => (
    <div key={index} className="p-5 shadow-[0_2px_6px_rgba(0,0,0,0.2)] w-full sm:w-[350px] break-words rounded-[5px]">
      <span><span className="font-bold">Naziv: </span>{item.title}</span>
      <br />
      
      {/* [PROMENJENO]: Zamena teksta sa pojedinačnim shadcn Badge komponentama */}
      <div className="flex items-center gap-2 mt-1">
        <span className="font-bold">Odeljenja:</span>
        <div className="flex flex-wrap gap-1.5">
          <p>{item.classes || "..."}</p>
        </div>
      </div>
      
      <Button onClick={() => { setOpenConfirmationModal(true), setActiveExamID(item._id) }} className='rounded-[5px] mt-2 w-full sm:w-auto'>Pokreni</Button>
    </div>
  ))}
</div>

   <AlertDialog open={openConfirmaitonModal}>
      <AlertDialogContent className='rounded-[5px] max-w-[calc(100%-2rem)] mx-auto'>
        <AlertDialogHeader>
          <AlertDialogTitle>Da li ste sigurni?</AlertDialogTitle>
          <AlertDialogDescription>
            Kontrolnom zadatku možete pristupiti samo jednom. Nakon izlaza sa platforme kontrolni zadatak će biti završen.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className='flex flex-col-reverse sm:flex-row gap-2 mt-4'>
          <Button onClick={()=>{setOpenConfirmationModal(false)}} variant={'outline'} className='rounded-[5px] w-full sm:w-auto'>Odustani</Button>
          <Button onClick={()=>{setOpenConfirmationModal(false), setOpenTermsModal(true)}} className='rounded-[5px] w-full sm:w-auto'>Nastavi</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <Dialog open={openTermsModal}>
        <DialogContent showCloseButton={false} className='rounded-[5px] max-w-[calc(100%-2rem)] mx-auto'>
            <DialogHeader>
                <DialogTitle className='text-lg font-bold'>Pravila kontrolnog zadatka</DialogTitle>
            </DialogHeader>
<ul className="list-disc list-inside space-y-2 text-sm md:text-base">
    <li>
        Napuštanje platforme ISKRA je zabranjeno, kontrolni će biti obeležen kao nevažeći ukoliko napustite platformu.
    </li>

    <li>
        Za sve konsultacije, oslonite se isključivo na predmetnog profesora.
    </li>

    <li>Prepisivanje, komunikacija i dogovaranje sa drugim učesnicima kontrolnog zadatka je strogo zabranjeno.</li>

    <li>Nemojte ometati ostale učesnike.</li>
</ul>

            <DialogFooter className='flex flex-col-reverse sm:flex-row gap-2 mt-4'>
                {!loadingExam && (
                    <Button onClick={()=>{setOpenTermsModal(false)}} className='rounded-[5px] w-full sm:w-auto' variant={'outline'}>Odustani</Button>
                )}
                <Button disabled={loadingExam} onClick={()=>{[setLoadingExam(true), StartExam()]}} className='rounded-[5px] w-full sm:w-auto'>
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
    <section className='p-4 md:p-5'>
    <PageTitle title='Ocenjene provere' subtitle='Ovde možeš pogledati sve ocenjene kontrolne zadatke.'></PageTitle>

   <div className="flex flex-wrap gap-4 mt-5">
     {data?.graded_solutions?.slice()
  ?.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map((item, index) => {
  // index ide od 0 do 4, pa dobijamo ocene od 5 do 1
  const ocena = item.grade_value
  
  const boje = {
    5: { border: 'border-t-green-500', text: 'text-green-500' },
    4: { border: 'border-t-teal-500', text: 'text-teal-500' },
    3: { border: 'border-t-yellow-500', text: 'text-yellow-500' },
    2: { border: 'border-t-orange-500', text: 'text-orange-500' },
    1: { border: 'border-t-red-500', text: 'text-red-500' },
  }[ocena];

  return (
    <div key={index} className={`p-5 shadow-[0_2px_6px_rgba(0,0,0,0.2)] w-full sm:w-[350px] break-words border-t-[2px] rounded-[5px] ${boje.border}`}>
      <span><span className="font-bold">Naziv: </span>{item?.test_ref?.title}</span>
      <br />
      <span><span className="font-bold">Vreme rada: </span>{moment(item?.started_at).tz("Europe/Belgrade").format("DD. MM. YYYY. HH:mm")}</span>
      <br />
      <hr className='my-2' />
      <span className='text-lg'>
        <span className="font-bold">Ocena: </span>
        <span className={boje.text}>{ocena}</span>
      </span>
      <br />
      <Button variant={'outline'} onClick={() => { navigate(`/app/exam-results/${item?.test_ref?._id}`) }} className='rounded-[5px] mt-2 w-full sm:w-auto'>Otvori</Button>
    </div>
  );
})}
   </div>

   <AlertDialog open={openConfirmaitonModal}>
      <AlertDialogContent className='rounded-[5px] max-w-[calc(100%-2rem)] mx-auto'>
        <AlertDialogHeader>
          <AlertDialogTitle>Da li ste sigurni?</AlertDialogTitle>
          <AlertDialogDescription>
            Kontrolnom zadatku možete pristupiti samo jednom. Nakon izlaza sa platforme kontrolni zadatak će biti završen.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className='flex flex-col-reverse sm:flex-row gap-2 mt-4'>
          <Button onClick={()=>{setOpenConfirmationModal(false)}} variant={'outline'} className='rounded-[5px] w-full sm:w-auto'>Odustani</Button>
          <Button onClick={()=>{setOpenConfirmationModal(false), setOpenTermsModal(true)}} className='rounded-[5px] w-full sm:w-auto'>Nastavi</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <Dialog open={openTermsModal}>
        <DialogContent showCloseButton={false} className='rounded-[5px] max-w-[calc(100%-2rem)] mx-auto'>
            <DialogHeader>
                <DialogTitle className='text-lg font-bold'>Pravila kontrolnog zadatka</DialogTitle>
            </DialogHeader>
<ul className="list-disc list-inside space-y-2 text-sm md:text-base">
    <li>
        Napuštanje platforme ISKRA je zabranjeno, kontrolni će biti obeležen kao nevažeći ukoliko napustite platformu.
    </li>

    <li>
        Za sve konsultacije, oslonite se isključivo na predmetnog profesora.
    </li>

    <li>Prepisivanje, komunikacija i dogovaranje sa drugim učesnicima kontrolnog zadatka je strogo zabranjeno.</li>

    <li>Nemojte ometati ostale učesnike.</li>
</ul>

            <DialogFooter className='flex flex-col-reverse sm:flex-row gap-2 mt-4'>
                {!loadingExam && (
                    <Button onClick={()=>{setOpenTermsModal(false)}} className='rounded-[5px] w-full sm:w-auto' variant={'outline'}>Odustani</Button>
                )}
                <Button disabled={loadingExam} onClick={()=>{[setLoadingExam(true), StartExam()]}} className='rounded-[5px] w-full sm:w-auto'>
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