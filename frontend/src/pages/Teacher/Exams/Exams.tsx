import PageTitle from '@/components/custom/PageTitle'
import { Button } from '@/components/ui/button'
import { BookText, ChartColumnIncreasing, CircleCheck, Eye, FileQuestionMark, FolderPlus, GraduationCap, Info, Pencil, PlusSquare } from 'lucide-react'
import React, { act, useEffect, useState } from 'react'
import Footer from '@/components/custom/Footer'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import foldericon from "../../../assets/folder.png"
import py_icon from "../../../assets/python.svg"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import axios from 'axios'
import { useNavigate, useSearchParams } from 'react-router-dom'
import LoaderModal from '@/components/custom/LoaderModal'
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from 'sonner'
import { ButtonGroup } from '@/components/ui/button-group'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Field, FieldGroup } from '@/components/ui/field'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export interface IQuestion {
    taskType: 'Task' | 'TheoryTask';
    questionID: string;
    points_max?: number;
}

export interface ITest {
    _id: string;
    title: string;
    author: string;
    grade: string;
    classes?: any[];
    active?: boolean;
    questions: IQuestion[];
    scale?: Record<string, any>;
    settings?: {
        disableEdits: boolean;
    };
    createdAt: string;
    updatedAt: string;
    solutionsCount?: number,
    gradedSolutions?: number
}

const Exams = () => {
  const grades = [
    "V razred osnovne škole",
    "VI razred osnovne škole",
    "VII razred osnovne škole",
    "VIII razred osnovne škole",
    "I razred srednje škole",
    "II razred srednje škole",
    "III razred srednje škole",
    "IV razred srednje škole"
  ]

  const [SearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
const [tests, setTests] = useState<ITest[]>([])
const [newTest, setNewTest] = useState({
  title: "",
  grade: ""
})

const [de_test, set_de_test] = useState<ITest | null>(null)
const [newTestModal, setNewTestModal] = useState(false)
  const getTests = async()=>{
    try {
      const response = await axios.get<ITest[]>(`${import.meta.env.VITE_BACKEND}/my/tests`)
      if (response.status === 200) {
        setLoading(false)
        setTests(response.data)
      }
    } catch (error) {
      setLoading(false)
      toast.error('Desila se greska.')
    }
  }

const disableEdits = async (test: ITest) => {
  try {
    const updatedTest = {
      ...test,
      settings: {
        ...test.settings,
        disableEdits: true
      }
    }

    const response = await axios.put(`${import.meta.env.VITE_BACKEND}/my/tests?id=${test._id}`, updatedTest)
    
    if (response.status === 200) {
      toast.success("Uspesno!")
      getTests()
      set_de_test(null)
    }
  } catch (error) {
    toast.error("Desila se greska!")
  }
}

  const initializeTest = async()=>{
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND}/my/tests/initialize`, newTest)
      if (response.status === 201){
        toast.success("Uspesno!")
        location.reload()
      }
    } catch (error) {
      toast.error("Desila se greska!")
    }
  }

  useEffect(()=>{
    getTests()
  }, [])

  return (
    <>
      <PageTitle title='Kontrolni zadaci' subtitle='Pratite sve Vaše kontrolne zadatke.' />
      
      <div className="w-full flex gap-0 justify-between">
        <div className='w-full lg:w-[70%] pr-0 mr-0 h-fit'>
          <Alert className='mt-3'>
            <Info />
            <AlertTitle>Upozorenje</AlertTitle>
            <AlertDescription>
              Jednom kada test prikazete ucenicima, dalje izmene i sakrivanje istog nece biit moguce.
            </AlertDescription>
          </Alert>

          <div className="flex items-center gap-2 mt-3">
            <Button onClick={()=>{setNewTestModal(true)}}><PlusSquare className="" />Novi kontrolni zadatak</Button>
          </div>
        </div>
        <img src="/undraw_document-ready_o5d5.svg" className='h-[150px] hidden lg:block' alt="" />
      </div>

      <div className="w-full flex gap-2 flex-wrap py-2">
        <Accordion type="single" collapsible className="w-full">
          {grades.map((grade) => (
            <AccordionItem value={grade} key={grade}>
              <AccordionTrigger className='font-bold text-md'>{grade}</AccordionTrigger>
              <AccordionContent className='pl-4 space-y-2'>
                {tests.filter(f => f.grade === grade).length === 0 && (
                  <p className="italic">Nema kontrolnih zadataka za ovaj razred...</p>
                )}

                {tests.filter(f => f.grade === grade).map(test => (
                <div key={test._id} className="w-full flex justify-between border rounded-md p-2 items-center">
                  <div id="left">
                    <p className='text-lg font-bold !mb-0'>{test.title}</p>
                    {test.classes ? (
                      <p className="text-xs text-gray-700">{test.classes}</p>
                    ) : (
                      <p className="text-xs text-gray-700 italic">Niste postavili zeljena odeljenja za ovaj kontrolni zadatak...</p>
                    )}
                  </div>

                  <div id="right">
                    <ButtonGroup>
  {!test.settings?.disableEdits && (
    <Button onClick={()=>{set_de_test(test)}}><Eye /> Prikazi ucenicima</Button>
  )}
  
  {test.settings?.disableEdits && (
    <Button onClick={()=>{navigate(`/app/teacher/exams/grade/${test._id}`)}}><GraduationCap /> Oceni</Button>
  )}
  
  {test.settings?.disableEdits && (
    <Button  onClick={()=>{navigate(`/app/teacher/exams/reports/${test._id}`)}}><ChartColumnIncreasing /> Izvestaji</Button>
  )}
  
  {!test.settings?.disableEdits && (
    <Button onClick={()=>[navigate(`/app/teacher/exams/edit/${test._id}`)]}><Pencil /> Izmeni</Button>
  )}
</ButtonGroup>
                  </div>
                </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

<Dialog open={newTestModal} onOpenChange={(val)=>{setNewTestModal(val)}}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dodaj kontrolni zadatak</DialogTitle>
    </DialogHeader>
        
      <FieldGroup>
        <Field>
          <Label>Naziv</Label>
          <Input value={newTest.title} onChange={(e)=>{setNewTest(prev => ({...prev, title: e.target.value}))}}></Input>
        </Field>

        <Field>
          <Label>Razred</Label>
          <Select  onValueChange={(e)=>{setNewTest(prev => ({...prev, grade: e}))}}>
            <SelectTrigger>
              <SelectValue placeholder="Odaberite razred..."></SelectValue>
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                {grades.map((item, index)=>(
                  <SelectItem key={index} value={item}>{item}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>

    <DialogFooter>
      <Button variant={'outline'} onClick={()=>{setNewTestModal(false)}}>Odustani</Button>
      <Button onClick={()=>{initializeTest()}}>Sacuvaj</Button>
    </DialogFooter>
  </DialogContent>
  </Dialog> 



<AlertDialog open={de_test}>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Da li ste sigurni?</AlertDialogTitle>
          <AlertDialogDescription>
            Nakon prikaza učenicima, test neće biti moguće naknadno izmeniti ili sakriti.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={()=>{set_de_test(null)}}>Odustani</AlertDialogCancel>
          <AlertDialogAction onClick={()=>{disableEdits(de_test)}}>Nastavi</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

      <Footer />



      <LoaderModal open={loading} />
    </>
  )
}

export default Exams