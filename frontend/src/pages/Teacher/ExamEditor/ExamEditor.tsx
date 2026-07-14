import PageTitle from '@/components/custom/PageTitle'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldContent, FieldDescription, FieldTitle } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import axios from 'axios'
import { Info, InfoIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
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
import LoaderModal from '@/components/custom/LoaderModal'
export interface IQuestion {
    taskType: 'Task' | 'TheoryTask'; // Striktni enum tipovi za frontend validaciju
    questionID: string;              // Na frontendu ObjectId dolazi kao string
    points_max?: number;             // Opciono polje (Number)
}

// 2. Glavni interfejs za Test koji koristiš na frontendu
export interface ITest {
    _id: string;                     // Svaki dokument sa backend-a ima svoj jedinstveni ID
    title: string;
    author: string;                  // ID autora dolazi kao string (ID korisnika)
    grade: string;
    classes?: String;                 // Niz odeljenja (opciono)
    active?: boolean;                // Opciono polje, tipizirano kao boolean
    questions: IQuestion[];          // Niz pitanja sa definisanom strukturom iznad
    scale?: Record<string, any>;     // Tip za Object (mapa ključ-vrednost)
    settings?: {
        disableEdits: boolean;       // Podstruktura za podešavanja
    };
    createdAt: string;               // Mongoose timestamps na frontendu dolaze kao ISO stringovi
    updatedAt: string;               // Mongoose timestamps na frontendu dolaze kao ISO stringovi
    solutionsCount?: number,
    gradedSolutions?: number
}

const ExamEditor = () => {
    const [loading, setLoading] = useState(true)
    const [testMaxPoints, setTestMaxPoints] = useState(0)
    
    const {id} = useParams()
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
    const [test, settest] = useState<ITest>()
    const navigate = useNavigate()
    const [practicalTasks, setPracticalTasks] = useState([])
    const [lessons, setLessons] = useState([])
    const [theoryTasks, setTheoryTasks] = useState([])
    const [openSaveModal, setOpenSaveModal] = useState(false)
    const [openDeleteModal, setOpenDeleteModal] = useState(false)

    const getTest = async()=>{
        try {
            const response = await axios.get<ITest>(`${import.meta.env.VITE_BACKEND}/my/tests?id=${id}`)
            if (response.status === 200 && response.data) {
                // Osiguravamo da scale objekat ima podrazumevane vrednosti ako ne postoje na backendu
                const fetchedTest = response.data;
                if (!fetchedTest.scale) {
                    fetchedTest.scale = { one: 0, two: '', three: '', four: '', five: '' };
                } else {
                    fetchedTest.scale.one = 0
                }
                settest(fetchedTest)
                if (fetchedTest.settings?.disableEdits) {
                    navigate('/app/teacher/exams/all')
                    toast.error("Izmene nisu dozvoljenje.")
                }

                setLoading(false)
            }
        } catch (error) {
            navigate('/app/teacher/exams/all')
        }
    }

    const getPracticalTasks = async()=>{
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND}/my/folders/tasks`)
            if (response.status === 200) {
                setPracticalTasks(response.data)
            }
        } catch (error) {
            toast.error("Desila se greska!")
            navigate('/app/teacher/exams/all')
        }
    }

    const getLessons = async()=>{
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND}/my/lessons`)
            if (response.status === 200) {
                setLessons(response.data)
            }
        } catch (error) {
            toast.error("Desila se greska pri ucitavanju lekcija!")
        }
    }

    const getTheoryTasks = async()=>{
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND}/my/theory-tasks`)
            if (response.status === 200) {
                setTheoryTasks(response.data)
            }
        } catch (error) {
            toast.error("Desila se greska pri ucitavanju teorijskih zadataka!")
        }
    }

    const saveTest = async()=>{
        try {
            const response = await axios.put(`${import.meta.env.VITE_BACKEND}/my/tests?id=${id}`, test)
            setLoading(false)
            if (response.status === 200) {
                toast.success("Uspesno!")
                navigate('/app/teacher/exams/all')
            }

        } catch (error) {
            toast.error("Desila se greska!")
        }
    }

    useEffect(()=>{
        getTest()
        getPracticalTasks()
        getLessons()
        getTheoryTasks()
    }, [])

    useEffect(()=>{
        console.log(test)
    }, [test])

    const updateTestField = <K extends keyof ITest>(key: K, value: ITest[K]) => {
        settest(prev => {
            if (!prev) return prev;
            return { ...prev, [key]: value };
        });
    };

    // Nova funkcija za izmenu pojedinačnih ocena unutar scale objekta
    const handleScaleChange = (gradeKey: 'one' | 'two' | 'three' | 'four' | 'five', value: number) => {
        if (!test) return;
        
        const updatedScale = {
            ...test.scale,
            [gradeKey]: value
        };
        
        updateTestField('scale', updatedScale);
    };

    // Funkcija za hendlovanje selektovanja i deselektovanja zadataka (univerzalna za oba tipa)
    const handleTaskToggle = (taskId: string, checked: boolean, taskType: 'Task' | 'TheoryTask') => {
        if (!test) return;

        let updatedQuestions = [...test.questions];

        if (checked) {
            // Ako je čekirano, dodajemo u niz ako već ne postoji
            if (!updatedQuestions.some(q => q.questionID === taskId)) {
                updatedQuestions.push({
                    taskType: taskType, 
                    questionID: taskId,
                    points_max: 0 // Vrednost bodova je 0 prema zahtevu
                });
            }
        } else {
            // Ako je odčekirano, uklanjamo iz niza
            updatedQuestions = updatedQuestions.filter(q => q.questionID !== taskId);
        }

        updateTestField('questions', updatedQuestions);
    };


    const getTaskTitle = (questionID: string, taskType: 'Task' | 'TheoryTask') => {
        if (taskType === 'Task') {
            for (const folder of practicalTasks) {
                const foundTask = folder?.zadaci?.find((task: any) => task._id === questionID);
                if (foundTask) return foundTask.title;
            }
        } else if (taskType === 'TheoryTask') {
            const foundTheoryTask = theoryTasks.find((task: any) => task._id === questionID);
            if (foundTheoryTask) return foundTheoryTask.title;
        }
        return 'Učitavanje naslova...';
    };

    const handlePointsChange = (questionID: string, points: number) => {
        if (!test) return;

        const updatedQuestions = test.questions.map(q => {
            if (q.questionID === questionID) {
                return { ...q, points_max: points };
            }
            return q;
        });

        updateTestField('questions', updatedQuestions);
    };

    const recalculateMaxPoints = ()=>{
        let questions = test?.questions
        let max = 0
        questions?.forEach(element => {
            max += element?.points_max || 0
        });

        setTestMaxPoints(max)
    }

    useEffect(()=>{
        recalculateMaxPoints()
    }, [test?.questions])

   const validateScale = () => {
        let one = test?.scale?.one
        let two = test?.scale?.two
        let three = test?.scale?.three
        let four = test?.scale?.four
        let five = test?.scale?.five

        if (
            one === undefined || one === '' ||
            two === undefined || two === '' ||
            three === undefined || three === '' ||
            four === undefined || four === '' ||
            five === undefined || five === ''
        ) {
            toast.warning("Napišite bodovnu skalu!")
            return false
        }

        const n1 = Number(one);
        const n2 = Number(two);
        const n3 = Number(three);
        const n4 = Number(four);
        const n5 = Number(five);

        if (n5 > n4 && n4 > n3 && n3 > n2 && n2 > n1) {
            if (n5 > testMaxPoints) {
                toast.error(`Maksimalna ocena ne može nositi više od ${testMaxPoints} bodova!`)
                return false
            }
            console.log("Ok - skala bodova")
            return true
        } else {
            toast.error("Napišite skalu bodova ispravno! Svaka ocena mora imati strogo više bodova od prethodne.")
            return false
        }
    }
useEffect(()=>{
if (openSaveModal === true) {
    let ok = validateScale()
    if (!ok) {
        setOpenSaveModal(false)
    }
}
}, [openSaveModal])
   
    return (
        <div className="w-full overflow-hidden">
            <PageTitle title='Kreiranje kontrolnog zadatka' subtitle='Ovde možete urediti kontrolni zadatak.'></PageTitle>
            <Alert className='mt-2'>
                <InfoIcon></InfoIcon>
                <AlertTitle>Obaveštenje</AlertTitle>
                <AlertDescription>
                    Jednom kada učenicima aktivirate kontrolni zadatak nećete moći praviti dalje izmene.
                </AlertDescription>
            </Alert>

            <section className="mt-5 border-b-1 pb-2">
                <h2 className="text-2xl font-bold pb-2">Osnovni podaci</h2>
                {/* Izmenjeno: flex-col na mobilnim uređajima, flex-row na desktopu (md:) */}
                <div id="info-wrapper-1" className="flex flex-col md:flex-row items-stretch md:items-center justify-between w-full gap-3 md:gap-5">
                    <Field className="w-full">
                        <Label>
                            Naziv kontrolnog zadatka
                        </Label>
                        <Input 
                            value={test?.title || ''} 
                            onChange={(e) => updateTestField('title', e.target.value)} 
                        />
                    </Field>
                    <Field className="w-full">
                        <Label>Razred</Label>
                        <Select 
                            value={test?.grade || ''} 
                            onValueChange={(val) => updateTestField('grade', val)}
                        >
                            <SelectTrigger><SelectValue placeholder="Odaberite razred" /></SelectTrigger>
                            <SelectContent>
                                {grades.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </Field>
                </div>

                <Field className='mt-2'>
                        <Label>
                            Odeljenja (koja rade ovaj test)
                        </Label>
                        <Input 
                            value={test?.classes || ''} 
                            onChange={(e) => updateTestField('classes', e.target.value)}
                            placeholder='Unesite odeljenja u formatu: V-1, V-2, V-3,...'
                        />
                    </Field>
            </section>

            <section className="mt-5 border-b-1 pb-2">
                <h2 className="text-2xl font-bold pb-2">Zadaci</h2>

                  <Alert className="my-2 border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
      <Info />
      <AlertTitle>U ovoj sekciji odaberite sve zadatke koje želite da se pronađu na kontrolnom zadatku, kasnije ćete dodeliti bodove.</AlertTitle>

    </Alert>

                {/* Izmenjeno: flex-col na mobilnom uređaju omogućava slaganje praktičnih i teorijskih zadataka jedan ispod drugog */}
                <div className="flex flex-col md:flex-row items-start w-full gap-5">
                    {/* LEVA STRANA - PRAKTICNI ZADACI */}
                    {/* Izmenjeno: širina w-full na mobilnom, border i padding prilagođeni mobilnom rasporedu */}
                    <div id="left" className='border-r-0 md:border-r-1 border-b md:border-b-0 pb-4 md:pb-0 w-full md:w-1/2 pr-0 md:pr-3'>
                        <h3 className="text-xl font-bold mb-2">Praktični zadaci</h3>
                        <Accordion type='single' collapsible>
                            {practicalTasks.map((folder, index)=>{
                                return(
                                    <AccordionItem key={folder?.folderName || index} value={folder?.folderName}>
                                        <AccordionTrigger className='font-bold text-md text-left'>{folder?.folderName}</AccordionTrigger>
                                        <AccordionContent>
                                            {folder?.zadaci.map((task, index)=>{
                                                // Provera da li se trenutni zadatak nalazi u listi selektovanih pitanja
                                                const isChecked = test?.questions.some(q => q.questionID === task._id) || false;

                                                return (
                                                    <Field orientation="horizontal" className='mt-1' key={task._id || index}>
                                                        <Checkbox 
                                                            id={`task-${task._id}`} 
                                                            checked={isChecked}
                                                            onCheckedChange={(checked: boolean) => handleTaskToggle(task._id, checked, 'Task')}
                                                        />
                                                        <FieldContent>
                                                            <FieldTitle>{task.title}</FieldTitle>
                                                        </FieldContent>
                                                    </Field>
                                                )
                                            })}
                                        </AccordionContent>
                                    </AccordionItem>
                                )
                            })}
                        </Accordion>
                    </div>

                    {/* DESNA STRANA - TEORIJSKI ZADACI */}
                    {/* Izmenjeno: širina w-full na mobilnom, resetovano levo rastojanje */}
                    <div id="right" className='w-full md:w-1/2 pl-0 md:pl-3'>
                        <h3 className="text-xl font-bold mb-2">Teorijski zadaci</h3>
                        <Accordion type='single' collapsible>
                            {lessons.map((lesson, index)=>{
                                // Filtriramo teorijske zadatke koji pripadaju ovoj lekciji
                                const currentLessonTasks = theoryTasks.filter(task => task.lesson === lesson._id);

                                return(
                                    <AccordionItem key={lesson?._id || index} value={lesson?.title}>
                                        <AccordionTrigger className='font-bold text-md text-left'>{lesson?.title} <span className='font-normal text-gray-600 ml-1'>- [{lesson?.grade}]</span></AccordionTrigger>
                                        <AccordionContent>
                                            {currentLessonTasks.map((task, index)=>{
                                                // Provera da li se trenutni teorijski zadatak nalazi u listi selektovanih pitanja
                                                const isChecked = test?.questions.some(q => q.questionID === task._id) || false;

                                                return (
                                                    <Field orientation="horizontal" className='mt-1' key={task._id || index}>
                                                        <Checkbox 
                                                            id={`theory-task-${task._id}`} 
                                                            checked={isChecked}
                                                            onCheckedChange={(checked: boolean) => handleTaskToggle(task._id, checked, 'TheoryTask')}
                                                        />
                                                        <FieldContent>
                                                            <FieldTitle>{task.title}</FieldTitle>
                                                        </FieldContent>
                                                    </Field>
                                                )
                                            })}
                                        </AccordionContent>
                                    </AccordionItem>
                                )
                            })}
                        </Accordion>
                    </div>
                </div>
            </section>


<section className="mt-5 border-b-1 pb-2">
    <h2 className="text-2xl font-bold">Bodovi</h2>
    <Alert className="my-2 border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
      <Info />
      <AlertTitle>U ovoj sekciji potrebno je da za svaki zadatak upisete koliko bodova nosi.</AlertTitle>

    </Alert>

    {/* Izmenjeno: flex-col i w-full na mobilnim, sm: i lg: širine su optimizovane da popune prostor bez pucanja dizajna */}
    <div className="flex gap-2 flex-wrap">
        {test?.questions.map((question, index)=>(
            <div className="p-4 shadow-sm w-full sm:w-[calc(50%-0.5rem)] lg:w-[400px] border-1 rounded-md" key={question.questionID || index}>
                <p className="text-md font-semibold break-words">
                    {getTaskTitle(question.questionID, question.taskType)}
                </p>
                <hr className="my-2" />
                <Field>
                    <Label>Broj bodova</Label>
                    <Input 
                        value={question.points_max ?? ''} 
                        type='number'
                        onChange={(e) => handlePointsChange(question.questionID, Number(e.target.value))}
                    />
                </Field>
            </div>
        ))}
    </div>
</section>

<section className="mt-5 border-b-1 pb-2">
    <h2 className="text-2xl font-bold">Bodovna skala</h2>
 <Alert className="my-2 border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
      <Info />
      <AlertTitle>U ovoj sekciji unesite minimalan broj za svaku ocenu. Po ovoj skali će sistem automatskog ocenjivanja predložiti ocenu.</AlertTitle>

    </Alert>

    <p className='text-lg my-2'>Vaš test nosi maksimalno <span className='font-bold'>{testMaxPoints} bodova</span>.</p>
{/* Izmenjeno: Spakovano u overflow kontejner kako tabela ne bi slomila stranu na mobilnim ekranima od 320px */}
<div className="w-full overflow-x-auto pb-1">
  <table className="table-fixed border-separate border-spacing-0 border border-slate-200 rounded-md overflow-hidden min-w-[280px]">
      <thead>
          <tr className="bg-slate-50">
              <th className="w-[50px] h-[30px] text-center  font-semibold text-slate-600 border-b border-r border-slate-200">1</th>
              <th className="w-[50px] h-[30px] text-center  font-semibold text-slate-600 border-b border-r border-slate-200">2</th>
              <th className="w-[50px] h-[30px] text-center  font-semibold text-slate-600 border-b border-r border-slate-200">3</th>
              <th className="w-[50px] h-[30px] text-center  font-semibold text-slate-600 border-b border-r border-slate-200">4</th>
              <th className="w-[50px] h-[30px] text-center font-semibold text-slate-600 border-b">5</th>
          </tr>
      </thead>
      <tbody>
          <tr>
              <td className="w-[50px] h-[35px] p-0 border-r border-slate-200 bg-white shadow-inner">
                  <Input value={0} disabled className="w-full h-full text-center border-none rounded-none  bg-transparent p-0 m-0" />
              </td>
              <td className="w-[50px] h-[35px] p-0 border-r border-slate-200 bg-white shadow-inner">
                  <Input 
                      type="number"
                      value={test?.scale?.two ?? ''} 
                      onChange={(e) => handleScaleChange('two', Number(e.target.value))}
                      className="w-full h-full text-center border-none rounded-none  bg-transparent p-0 m-0" 
                  />
              </td>
              <td className="w-[50px] h-[35px] p-0 border-r border-slate-200 bg-white shadow-inner">
                  <Input 
                      type="number"
                      value={test?.scale?.three ?? ''} 
                      onChange={(e) => handleScaleChange('three', Number(e.target.value))}
                      className="w-full h-full text-center border-none rounded-none  bg-transparent p-0 m-0" 
                  />
              </td>
              <td className="w-[50px] h-[35px] p-0 border-r border-slate-200 bg-white shadow-inner">
                  <Input 
                      type="number"
                      value={test?.scale?.four ?? ''} 
                      onChange={(e) => handleScaleChange('four', Number(e.target.value))}
                      className="w-full h-full text-center border-none rounded-none  bg-transparent p-0 m-0" 
                  />
              </td>
              <td className="w-[50px] h-[35px] p-0 bg-white shadow-inner">
                  <Input 
                      type="number"
                      value={test?.scale?.five ?? ''} 
                      onChange={(e) => handleScaleChange('five', Number(e.target.value))}
                      className="w-full h-full text-center border-none rounded-none  bg-transparent p-0 m-0" 
                  />
              </td>
          </tr>
      </tbody>
  </table>
</div>
</section>

{/* Izmenjeno: flex-col-reverse i širina w-full na mobilnim uređajima, gap na dugmićima */}
<section id="actions" className='mt-4 flex flex-col-reverse sm:flex-row gap-2 sm:justify-between w-full'>
    <Button onClick={()=>{setOpenSaveModal(true)}} className="w-full sm:w-auto">Sačuvaj kontrolni zadatak</Button>
    <Button variant={'destructive'} onClick={()=>{setOpenDeleteModal(true)}} disabled className="w-full sm:w-auto">Obriši kontrolni zadatak</Button>
</section>


<AlertDialog open={openSaveModal} onOpenChange={(val)=>{setOpenSaveModal(val)}}>
      {/* Izmenjeno: max-w-[calc(100%-2rem)] i rounded-lg za lepši prikaz na telefonu */}
      <AlertDialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[425px] rounded-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className='text-center w-full'>Da li želite da sačuvate promene?</AlertDialogTitle>

        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2 mt-4">
          <AlertDialogCancel onClick={()=>{setOpenSaveModal(false)}} className="w-full sm:w-auto mt-0">Odustani</AlertDialogCancel>
          <AlertDialogAction onClick={()=>{saveTest()}} className="w-full sm:w-auto">Sačuvaj</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

<AlertDialog open={openDeleteModal} onOpenChange={(val)=>{setOpenDeleteModal(val)}}>
      {/* Izmenjeno: max-w-[calc(100%-2rem)] i rounded-lg za lepši prikaz na telefonu */}
      <AlertDialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[425px] rounded-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className='text-center w-full'>Da li želite da obrišete kontrolni zadatak?</AlertDialogTitle>

        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2 mt-4">
          <AlertDialogCancel onClick={()=>{setOpenDeleteModal(false)}} className="w-full sm:w-auto mt-0">Odustani</AlertDialogCancel>
          <AlertDialogAction variant={'destructive'} className="w-full sm:w-auto">Obriši</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
        <LoaderModal open={loading}></LoaderModal>

        </div>

    )
}

export default ExamEditor