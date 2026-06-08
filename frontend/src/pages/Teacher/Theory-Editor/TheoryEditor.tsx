import PageTitle from '@/components/custom/PageTitle'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AlertTriangleIcon, BookText, Check, Trash } from 'lucide-react'
import React, { useEffect, useState } from 'react'
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'sonner'

     type TheroyTask = {
    _id: string; // Mongoose uvek dodaje _id kao string (kada se pošalje sa backend-a kao JSON)
    title: string;
    lesson: string; // Na frontendu ObjectId obično dobijaš kao string
    answers?: any[];
    correct_answer?: string;
    owner: string;
    description?: string;
    createdAt?: string; // Datumi sa API-ja najčešće stižu kao ISO string
    updatedAt?: string;
}
const TheoryEditor = () => {
    const params = useParams()
    const navigate = useNavigate()
    const taskID = params.id
    const [openMutateModal, setOpenMutateModal] = useState<"edit"|"delete"|"none">("none")
const [newAnswerValue, setNewANswerValue] = useState("")


const [updateCorrectIndex, setUpdateCorrectIndex] = useState<number|null>(null)
const newAnswer = async()=>{
    try {
        if (!newAnswerValue ) {
            toast.warning("Unesite resenje!")
            return 
        }
        const response = await axios.post(`${import.meta.env.VITE_BACKEND}/my/theory-tasks/add-answer`, {
            taskID,
            answer: newAnswerValue
        })

        if (response.status === 200) {
            toast.success("Uspesno!")
            getTask()
            setNewANswerValue("")
        }
    } catch (error) {
        toast.error("Greska")
    }
}


const UpdateInstructions = async()=>{
    try {
        if (!task?.title ) {
            toast.warning("Unesite naziv!")
            return 
        }
        const response = await axios.put(`${import.meta.env.VITE_BACKEND}/my/theory-tasks/edit`, {
            title: task.title,
            description: task?.description || "",
            taskID
        })

        if (response.status === 200) {
            toast.success("Uspesno!")
            getTask()
            setNewANswerValue("")
        }
    } catch (error) {
        toast.error("Greska")
    }
}

const [task, setTask] = useState<TheroyTask | null>(null)
    const getTask = async()=>{
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND}/my/theory-tasks/${taskID}`)
            if (response.status === 200) {
                setTask(response.data)
            }
        } catch (error) {
            toast.error('Greska.')
        }
    }
    const MutateAnswer = async(mutationType:string, index:number) =>{
        try {
            let body = {
            taskID,
            index
        }

        if (index === null) {
            return 
        }

        let endpoint = ""
        if (mutationType === 'update') {
            endpoint = `${import.meta.env.VITE_BACKEND}/my/theory-tasks/update-answer`
        } else if (mutationType === 'delete') {
            endpoint = `${import.meta.env.VITE_BACKEND}/my/theory-tasks/delete-answer`
        }

        let response = await axios.put(endpoint, body)
        if (response.status === 200) {
            toast.success("Uspesno!")
            getTask()
            setOpenMutateModal('none')
        } else {
            toast.error('Greska!')
        }
        } catch (error) {
            toast.error('Greska!')
        }
    }

    useEffect(()=>{
        getTask()
    }, [])
  return (
    <>
            <PageTitle title='Uređivač teorijskog zadatka' subtitle='Jedno mesto da uređujete naziv, opis i rešenje zadatka.'></PageTitle>
            <div className="w-full mt-5" id="instructions-editor">
                <Field>
                    <Label>Naziv zadatka</Label>
                    <Input 
                     value={task?.title} 
                     onChange={(e) => {
                     setTask(prev => ({ ...prev, title: e.target.value }));
                     }}
                     >
</Input>
                </Field>

                <Field className='mt-2'>
                    <Label>Opis zadatka</Label>
                    <Textarea
                    value={task?.description} 
                     onChange={(e) => {
                     setTask(prev => ({ ...prev, description: e.target.value }));
                     }}></Textarea>
                </Field>

                <div className="flex justify-end mt-3">
                    <Button onClick={()=>{UpdateInstructions()}}>Sacuvaj instrukcije</Button>
                </div>
            </div>
<p className="text-2xl font-bold mt-5">Resenja zadatka</p>



            <div id='answers-editor' className="w-full flex items-start mt-2">
                
                <div id="left-1" className="w-1/2 border-r-1 min-h-5 p-4 -mt-2">
                 
                 {task?.answers?.map((item, index)=>(
                    <div className="p-2 hover:bg-slate-50 rounded-lg flex items-center gap-2 cursor-pointer border-1 justify-between mt-2">
                    <span>{item}</span>
                    <div className="flex gap-2 items-center">
                        <Button variant={'destructive'} onClick={()=>{setUpdateCorrectIndex(index), setOpenMutateModal('delete')}}><Trash></Trash></Button>
                    <Button onClick={()=>{setUpdateCorrectIndex(index), setOpenMutateModal('edit')}} variant={'outline'}><Check></Check></Button>
                    </div>
                  </div>
                 ))}

                 <div className="flex w-full items-center gap-2 mt-5">
                    <Input value={newAnswerValue} onChange={(e)=>{setNewANswerValue(e.target.value)}} placeholder='Unesite novo ponudjeno resenje...'></Input>
                    <Button onClick={()=>{newAnswer()}} className='w-fit'>Dodaj</Button>
                 </div>
                 </div>
                {task?.correct_answer ? (
                    <div id="right-1" className="w-1/2 min-h-5 p-4">
                <p className="text-green-600">Tačno rešenje zadatka:</p>
                <p className="text-green-700 text-xl inline-flex items-center gap-2"><Check></Check>{task?.correct_answer}</p>
                </div>
                ) : (<>
                    {/* <span className="italic p-4">Niste postavili tacno resenje...</span> */}
                     <Alert className="mt-2 w-1/2 m-4 border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
      <AlertTriangleIcon />
      <AlertTitle>UPOZORENJE:</AlertTitle>
      <AlertDescription>
        Niste postavili tačno rešenje zadatka. Molimo Vas, sada odaberite tačno rešenje, kako bi učenici mogli neometano raditi zadatak.
      </AlertDescription>
    </Alert>
    </>
                )}
            </div>

            {/* delete */}
            <AlertDialog open={openMutateModal === 'delete'} >

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Da li ste sigurni?</AlertDialogTitle>
          <AlertDialogDescription>
            Klikom na Potvrdi - obrisaćete ovo rešenje od ponuđenih za ovaj zadatak. Moraćete postaviti novo tačno rešenje.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={()=>{setOpenMutateModal('none')}}>Odustani</AlertDialogCancel>
          <AlertDialogAction variant={'destructive'} onClick={()=>{MutateAnswer('delete', updateCorrectIndex)}}>Potvrdi</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

     {/* novo tacno */}
            <AlertDialog open={openMutateModal === 'edit'}  >

      <AlertDialogContent >
        <AlertDialogHeader>
          <AlertDialogTitle>Da li ste sigurni?</AlertDialogTitle>
          <AlertDialogDescription>
            Klikom na Potvrdi - obeležićete ovo rešenje kao tačno. 
            <br />
            <br />
            <span className="italic">Ukoliko je neki učenik već radio ovaj zadatak na prethodnim kontrolnim zadacima i dobio tačan odgovor, taj zadatak će ostati tačan.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={()=>[setOpenMutateModal('none')]}>Odustani</AlertDialogCancel>
          <AlertDialogAction onClick={()=>{MutateAnswer('update', updateCorrectIndex)}}>Potvrdi</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}

export default TheoryEditor