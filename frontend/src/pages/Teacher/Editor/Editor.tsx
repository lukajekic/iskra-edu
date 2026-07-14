// @ts-nocheck
import PageTitle from '@/components/custom/PageTitle'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Field, FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertTriangleIcon, Ban, ChevronRight, CircleAlert, CircleOff, CircleQuestionMark, Download, File, Import, PlusSquare, Sparkle, SquarePlus, Trash, Upload } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import './react-quill-override.css'
import py_icon from '../../../assets/python.svg'
import foldericon from '../../../assets/folder.png'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog'
import { DotLottieReact } from '@lottiefiles/dotlottie-react';


export type TaskData = {
    taskData:  TaskDataClass;
    editable:  boolean;
    published: boolean;
}

export type TaskDataClass = {
    downloaded:    any[];
    _id:           string;
    language:      string;
    outputType:    string;
    tests:         Test[];
    folder:        Folder;
    title:         string;
    ownerRef:      string;
    richText:      string;
    author:        string;
    published:     boolean;
    storeOriginID: string;
    ai_allowed: boolean;

}

export type Folder = {
    _id:        string;
    title:      string;
    teacherRef: string;
    open:       boolean;
    __v:        number;
}

export type Test = {
    _id:    string;
    input:  any[];
    output: string[];
}
import Footer from '@/components/custom/Footer'
import axios from 'axios'
import { Grades, SupportedLanguages } from '@/assets/constants'
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader } from '@/components/ui/drawer'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import LoaderModal from '@/components/custom/LoaderModal'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
const Editor = () => {
    const params = useParams()
    const navigate = useNavigate()
    const taskID = params.id
const [loading, setLoading] = useState(true)

const deleteTask = async()=>{
    try {
        setLoading(true)
        const response = await axios.post(`${import.meta.env.VITE_BACKEND}/my/tasks/delete`, {
                tasks: [taskID]
            })

        if (response.status === 200){
            toast.success("Uspesno!")
            setLoading(false)
            navigate('/app/teacher/tasks')
        }
        else{
            toast.error('Desila se greska!')
        setLoading(false)
        }
    } catch (error) {
        toast.error('Desila se greska!')
        setLoading(false)
    }
}

    const getTask = async()=>{
        try {
                    setLoading(true)

            const response = await axios.post<TaskData>(`${import.meta.env.VITE_BACKEND}/my/tasks/geteditortask`, {
                taskID: taskID
            })

            if (response.status === 200) {
setTaskData(response.data)

if (response.data.editable) {
    setEditingAllowed('true')
    setSelfPublished(response.data.published || false)
} else {
    setEditingAllowed('store-origin')
    setSelfPublished(false)
}

setLoading(false)
            }
        } catch (error) {
            console.error(error)
            setLoading(false)
            navigate('/app/teacher', {replace: true})
        }
    }
    const playAnimation = () => {
    if (checkmark.current) {
        checkmark.current.seek(0)
        checkmark.current.play()
    }
    
    setOpenModalAnimation(true);
    
    setTimeout(() => {
        setOpenModalAnimation(false);
    }, 2000);
}

const updateTask = async(pushToStore:boolean=false)=>{
    try {
        setLoading(true)
        let updateBody = {
            taskID: taskID,
            title: taskData?.taskData.title,
            richText: taskData?.taskData.richText || "",
            // TODO: folder: taskData?.taskData.folder || "",
            tests: taskData?.taskData.tests || [],
            ai_allowed: taskData?.taskData?.ai_allowed
        }

        const update_response = await axios.put(`${import.meta.env.VITE_BACKEND}/my/tasks/edit`, updateBody)
        if (update_response.status === 200) {
            if (pushToStore && selfPublished === false) {
                setOpenPublisher(true)
                setOpenSaveModal(false)
                setLoading(false)
            } else {
                setLoading(false)
                setOpenSaveModal(false)
                playAnimation()
                setTimeout(() => {
                    navigate('/app/teacher/tasks')
                }, 2000);
            }
        }
    } catch (error) {
        console.error(error)
    }
}

const publishTask = async()=>{
    try {
        if (!publisherData.grade) {
            toast.error("Odaberite razred za objavljivanje zadatka.")
            return
        }
      if (!selfPublished) {
        setLoading(true)
        const response = await axios.post(`${import.meta.env.VITE_BACKEND}/store/publish`, {
...publisherData,
taskID: taskID
        })

        if (response.status === 200) {
            setLoading(false)
              playAnimation()
                setTimeout(() => {
                    navigate('/app/teacher/tasks')
                }, 2000);
        }
      }  
    } catch (error) {
        setLoading(false)
        console.error(error)
    }
}

useEffect(()=>{
    getTask()
}, [])
    const checkmark = useRef(null)
    const [openDeleteModal, setOpenDeleteModal] = useState(false)
    const [editingAllowed, setEditingAllowed] = useState<"true" | "store-origin">("true")
    const [selfPublished, setSelfPublished] = useState(false)
    const [func_openModalAnimation, setOpenModalAnimation ] = useState(false)

    const [descriptionValue, setDescriptionValue] = useState("")

    const [openTestMaker, setOpenTestmaker] = useState(false)

    const [openSaveModal, setOpenSaveModal] = useState(false)
    const [taskData, setTaskData] = useState<TaskData>()
    const [standard_temp_new_test, set_standard_temp_new_test] = useState({
        input: [],
        output: []
    })
    const [openPublisher, setOpenPublisher] = useState(false)
    const [publisherData, setPublisherData] = useState({
        grade:"",
        anon: false
    })


    const [testDeteletionData, setTestDeletionData] = useState({
        modal: false,
        index: -1
    })


    const deleteTest = ()=>{
        let index = testDeteletionData.index
        let filtered = taskData?.taskData.tests.filter((item, i)=>i !== index)
        setTaskData(prev => ({
            ...prev,
            taskData: {
                ...prev?.taskData,
                tests: filtered
            }
        }))

        setTestDeletionData({
            modal: false,
            index: -1
        })
        return
    }
  return (
    <>
        <PageTitle title='Uređivač zadatka' subtitle='Jedno mesto da uređujete naziv, uputstva i testove Vašeg zadatka.'></PageTitle>
        <div className="p-4 mt-4 border-1 rounded-lg border-[var(--border)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
             <div className="flex items-center space-x-2">
      <Switch onCheckedChange={(e) => {
        setTaskData(prev => {
            console.log(e)
            if (!prev) return prev;
            return {
                ...prev,
                taskData: {
                    ...prev.taskData,
                    ai_allowed: e
                }
            };
        });
    }} id="ai-allow" checked={taskData?.taskData.ai_allowed || false} />
      <Label htmlFor="ai-allow" className="flex items-center gap-1.5">Dozvoli upotrebu IskraAI <Sparkle className='size-5'></Sparkle></Label>
    </div>

{editingAllowed === "store-origin" && (
 <Button className='mt-2 sm:mt-0 w-full sm:w-auto' onClick={()=>{
                                updateTask(false)
                            
                        }}>Sačuvaj izmene</Button>
)}
      
        </div>
        {selfPublished && (
             <Alert className="max-w-full mt-5 border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
      <AlertTriangleIcon />
      <AlertTitle>Vaše izmene neće biti javno dostupne!</AlertTitle>
      <AlertDescription>
        S obzirom da ste zadatak već objavili na „Zbirku zadataka“, izmene koje sada napravite biće vidljive samo Vašim učenicima, u „Zbirci zadataka“ se ne mogu naknadno promene praviti.
        <br />        <strong>Hvala Vam što doprinosite sadržaju platforme objavljivanjem zadataka.😊</strong>
      </AlertDescription>
    </Alert>
        )}
        {editingAllowed === "true" ? (
            <div className='mt-5'>
                <div id="task-materials" className="border-1 rounded-xl p-4 md:p-8">
                    <form onSubmit={(e)=>{e.preventDefault()}}>
                        <FieldGroup>
                            <Field>
                                <Label htmlFor='task-title'>
                                    Naziv zadatka
                                    
                                </Label>

                              <Input 
    id='task-title'
    value={taskData?.taskData.title || ''}
    onChange={(e) => {
        setTaskData(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                taskData: {
                    ...prev.taskData,
                    title: e.target.value
                }
            };
        });
    }} 
/>
                            </Field>

                            <Field>
                                <Label>Tekst zadatka</Label>
                                <div className="quill-wrapper border-1 shadow-xs h-[300px] md:h-auto">
<ReactQuill 
  value={taskData?.taskData.richText || ""} 
  onChange={(content) => {
    setTaskData(prev => {
      if (!prev) return prev; 
      
      return {
        ...prev,
        taskData: {
          ...prev.taskData,
          richText: content
        }
      };
    });
  }}  
  theme='snow' 
  className='h-[calc(100%-50px)]'
/>                                </div>
{/* <div
  className="iskra-rich-text text-gray-800 leading-relaxed bg-gray-50 p-4 rounded border border-gray-200 prose prose-sm max-w-none"
  dangerouslySetInnerHTML={{ __html: '<h1>Heading&nbsp;1</h1><p></p><h2>Heading&nbsp;2</h2><p></p><h3>Heading&nbsp;3</h3><p></p><p>Normal</p><p></p><p><strong>Bold</strong></p><p></p><p><em>Italic</em></p><p></p><p><u>Underline</u></p><p></p><p><a href="Link" rel="noopener noreferrer" target="_blank">Link</a></p><p></p><ol><li>decimalna</li></ol><p></p><ul><li>tackasta</li></ul>' }}
/> */}
                            </Field>

                            <Field>
                                <div className="w-full flex flex-col md:flex-row gap-4 items-center">
                                    <div id="language" className='w-full md:basis-1/2'>
                                        <Field>
                                            <Label>Programski jezik</Label>

                                 <Select value={taskData?.taskData.language}> 
      <SelectTrigger disabled className="w-full md:w-1/2">
        <SelectValue placeholder="" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Dostupni jezici</SelectLabel>
          {SupportedLanguages.map((item, index)=>{
                      return (
                        <SelectItem value={item.value} key={index}>
                          {item.icon && (
                            <img src={item.icon} alt="" className='size-5' />
                          )}
                          {item.label}</SelectItem>
                      )
                    })}

        </SelectGroup>
      </SelectContent>
    </Select>
                                        </Field>
                                    </div>


                                    <div id="folder" className='w-full md:basis-1/2'>
                                        <Field>
                                            <Label>Folder</Label>

                                 <Select  value={taskData?.taskData.folder.title || "."}>
      <Tooltip>
        <TooltipTrigger className='w-full'>
            <SelectTrigger disabled className="w-full">
        <SelectValue placeholder="" />
      </SelectTrigger>
        </TooltipTrigger>
        <TooltipContent>
            Trenutne izmene foldera nisu moguće.
        </TooltipContent>
      </Tooltip>
      <SelectContent>
     <SelectGroup>
          <SelectLabel>Folders</SelectLabel>
       {/* index    */}
       <SelectItem value={taskData?.taskData.folder.title || "."}><img src={foldericon} className='w-4' alt=""></img>{taskData?.taskData.folder.title}</SelectItem>
      
        </SelectGroup>
      </SelectContent>
    </Select>
                                        </Field>
                                    </div>


                                </div>
                            </Field>
                        </FieldGroup>

                        <Separator className='my-10'></Separator>

                        <h1 className='text-2xl md:text-3xl font-bold'>Testovi</h1>

{/* python i ruby testovi  */}
{((taskData?.taskData.language === 'python' || taskData?.taskData.language === 'ruby') && (
    <>
        {/* standard testovi */}

    {taskData.taskData.outputType === 'standard' && (
        <>
        <Alert className='mt-3'>
                            <File className="shrink-0"></File>
                            <AlertTitle>Uputstvo za kreiranje testova</AlertTitle>
                            <AlertDescription>
                                Spremili smo jednostavno uputstvo kako da najlakše napišete testove zadataka (metode kojima se ispituje tačnost rešenja učenika) i sebi olakšate pregledanje zadataka.
                                
                                <br></br>
                                <br></br>
                                <div className="flex justify-start md:justify-end">
<Button asChild className="w-full md:w-auto">
  <a 
    target="_blank" 
    href="https://lukajekic.github.io/iskra-documents/kreiranje-testova.pdf"
  >
    <Download />
    Preuzmi uputstvo
  </a>
</Button>                                </div>
                            </AlertDescription>
                            
                        </Alert>

                         {!openTestMaker && (
                            <Button className='mt-3 w-full md:w-auto' onClick={()=>{setOpenTestmaker(true)}}><SquarePlus></SquarePlus>Kreiraj novi test</Button>
                        )}

                        {/* test kreator */}
                        {openTestMaker && (
                            <div className="w-full draft-box h-fit rounded-lg p-3 md:p-5 mt-5">
                                                    <h1 className='text-xl md:text-2xl font-bold'>Novi test</h1>
                                                    <Separator className='my-3'></Separator>
                        <div className="flex flex-col md:flex-row w-full gap-4">
                            <Button className="w-full md:w-auto shrink-0" onClick={()=>{set_standard_temp_new_test(prev => ({
                                ...prev,
                                input: [...prev.input, ""]
                            }))}}><PlusSquare></PlusSquare>Novi ulaz</Button>
                            <div id="inputs" className="flex-1 flex flex-col gap-2">
                                {standard_temp_new_test.input.map((item, index)=>{
                                    return (
                                        <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                            <div className="draft-box p-3 rounded-lg min-w-[3.5rem] flex justify-center items-center">{index + 1}</div>
                                            <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                                <Input value={standard_temp_new_test.input[index]} onChange={(e) => {
                    set_standard_temp_new_test(prev => ({
                        ...prev,
                        input: prev.input.map((val, i) => i === index ? e.target.value : val)
                    }))
                }} className='bg-white flex-1'></Input>
                <Button onClick={()=>{set_standard_temp_new_test(prev => ({
        ...prev,
        input: prev.input.filter((_, i) => i !== index)
    }));}} variant={'destructive'} className="w-full sm:w-auto">Obrisi ulaz</Button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
<Separator className='my-5'></Separator>
                         <div className="flex flex-col md:flex-row w-full gap-4">
                             <Button className="w-full md:w-auto shrink-0" onClick={()=>{set_standard_temp_new_test(prev => ({
                                ...prev,
                                output: [...prev.output, ""]
                            }))}}><PlusSquare></PlusSquare>Novi izlaz</Button>
                            <div id="outputs" className="flex-1 flex flex-col gap-2">
                                {standard_temp_new_test.output.map((item, index)=>{
                                    return (
                                        <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                            <div className="draft-box p-3 rounded-lg min-w-[3.5rem] flex justify-center items-center">{index + 1}</div>
                                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
                                                <Input value={standard_temp_new_test.output[index]} onChange={(e) => {
                    set_standard_temp_new_test(prev => ({
                        ...prev,
                        output: prev.output.map((val, i) => i === index ? e.target.value : val)
                    }))
                }} className='bg-white flex-1'></Input>
                <Button onClick={()=>{set_standard_temp_new_test(prev => ({
        ...prev,
        output: prev.output.filter((_, i) => i !== index)
    }));}} variant={'destructive'} className="w-full sm:w-auto">Obrisi izlaz</Button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-5">
                            <Button onClick={()=>{
                                if (standard_temp_new_test.output.length > 0) {
                                    setTaskData(prev => ({
                                ...prev,
                                taskData: {
                                    ...prev?.taskData,
                                    tests: [...prev?.taskData.tests, standard_temp_new_test]
                                }
                            })) ,setOpenTestmaker(false), set_standard_temp_new_test({input: [], output: []})
                                } else {
                                    toast.error("Test mora imati bar jedan izlaz.")
                                }
                                }}  className='p-5 bg-green-600 hover:bg-green-700 w-full sm:w-auto'>SAČUVAJ TEST</Button>
                            <Button variant={'outline'} onClick={()=>{setOpenTestmaker(false), set_standard_temp_new_test({input: [], output: []})}} className="w-full sm:w-auto">Odustani</Button>
                        </div>
                        </div>
                        )}

                        <Separator className='my-5'></Separator>

                       <div className="flex flex-col gap-4">
                         {taskData.taskData.tests.map((item, index)=>{
                            return (
                                <div key={item._id || index} className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                                    <div className="draft-box p-4 rounded-full min-w-[3.5rem] max-h-[3.5rem] flex justify-center items-center text-lg font-bold self-center">{index + 1}</div>
                                    <div className="border-1 rounded-lg p-4 flex-1">
                                        <p className="text-lg font-bold">Ulazi</p>
                                        {item.input.length === 0 && (
                                           <span className='inline-flex items-center text-gray-500 italic gap-2'> <CircleOff className='size-5'></CircleOff> Nema ulaza...</span>
                                        )}
                                        <ol className="list-decimal pl-4">
                                            {item.input.map((item, index)=>{
                                                
                                                return (
                                                <li key={index}>{item}</li>
                                                )
                                                
                         })}
                                            
                                        </ol>

                               

                                        <p className="text-lg font-bold mt-2">Izlazi</p>
                                        {item.output.length === 0 && (
                                           <span className='inline-flex items-center text-gray-500 italic gap-2'> <CircleOff className='size-5'></CircleOff> Nema ulaza...</span>
                                        )}
                                        <ol className="list-decimal pl-4">
                                             {item.output.map((item, index)=>{
                                                return (
                                                <li key={index}>{item !== "" && (item)}
                                                {item === "" && (
                                                     <span className='text-gray-500 italic'>Prazna linija...</span>

                                                )}
                                                </li>
                                                )
                         })}
                                        </ol>
                                    </div>
                                    <Button onClick={()=>{setTestDeletionData({modal: true, index: index})}} className='flex flex-row md:flex-col items-center justify-center gap-2 h-auto py-3 md:py-0 md:self-stretch' variant={'destructive'}><Trash></Trash>
                                    <span>Obriši test</span>
                                    </Button>
                                </div>
                            )

                        })}
                       </div>
                        </>
    )}
    </>
))}
                        
                       
<div className="w-full flex flex-col md:flex-row justify-between items-stretch md:items-end gap-4 mt-8">
    <Button onClick={()=>{setOpenDeleteModal(true)}} variant={'destructive'} className="w-full md:w-auto">Obrisi zadatak</Button>
    <div className="flex flex-col sm:flex-row w-full md:w-auto items-stretch sm:items-center justify-end gap-3">
    <Button variant={'outline'} onClick={()=>{navigate('/app/teacher/tasks')}} className="w-full sm:w-auto">Odustani</Button>
                        <Button onClick={()=>{
                            if (selfPublished) {
                                updateTask(false)
                            } else {
                                setOpenSaveModal(true)
                            }
                        }} className="w-full sm:w-auto">Sačuvaj izmene</Button>
</div>
</div>
                    </form>
                </div>
            </div>
        ): editingAllowed === "store-origin" ?(
            <Empty className='border-1 mt-5 p-4'>
                <EmptyHeader>
                    <Ban></Ban>
                    <EmptyTitle>
                        Zabranjene izmene
                    </EmptyTitle>
                </EmptyHeader>
                <EmptyDescription>
                    Na zadacima koje ste preuzeli iz „Zbirke zadataka“ nisu dozvoljene izmene.
                </EmptyDescription>

                <EmptyContent className='flex flex-col sm:flex-row gap-2 w-full justify-center'>
                    <Link to={'/app/teacher/tasks'} className="w-full sm:w-auto"><Button className="w-full">Povratak na zadatke</Button></Link>
                        <Button onClick={()=>{setOpenDeleteModal(true)}} variant={'destructive'} className="w-full sm:w-auto">Obrisi zadatak</Button>

                </EmptyContent>
            </Empty>
        ) : (<></>) }


<Footer></Footer>

<Dialog open={openSaveModal} onOpenChange={(val)=>[setOpenSaveModal(val)]}>
    <DialogContent className='max-w-[90vw] md:min-w-fit rounded-lg'>
        <div className="flex flex-col gap-2 items-center p-2">
            <CircleQuestionMark className='size-12 md:size-15 text-amber-700'></CircleQuestionMark>
            <p className="text-base md:text-lg text-center">Da li želite da sačuvate zadatak i testove zadatka?</p>
        </div>

        <DialogFooter className="mt-4">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 w-full">
                <Button onClick={()=>{setOpenSaveModal(false)}} variant={'outline'} className="w-full sm:w-auto order-last sm:order-first">Odustani</Button>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 sm:justify-end">
                    <Button onClick={()=>{updateTask(false)}} className='border-amber-600 text-amber-700 w-full sm:w-auto' variant={'outline'}>Sačuvaj za ličnu upotrebu</Button>
                    <Button onClick={()=>{updateTask(true)}} variant={'default'} className="w-full sm:w-auto">Sačuvaj i objavi u Zbirku zadataka</Button>
                </div>
            </div>
        </DialogFooter>
    </DialogContent>
</Dialog>

<Dialog open={func_openModalAnimation}>
    <DialogContent showCloseButton={false} className='min-h-fit max-w-[90vw] md:min-w-fit p-4 rounded-lg'>
        <DotLottieReact
      src="https://lottie.host/a32aec36-5cb0-4a61-94a2-7557bb000486/oNxnTYRLYq.lottie"
      loop
      autoplay
      dotLottieRefCallback={(dotLottie) => {
    checkmark.current = dotLottie;
  }}
    />
    </DialogContent>
</Dialog>




{/* publisher */}
<Drawer open={openPublisher} onOpenChange={(val)=>{
  if (!val) {
    setOpenPublisher(val)
  }
}}   direction='right'  >
  <DrawerContent className='pb-[60px] max-w-full sm:max-w-md ml-auto'>
    <DrawerHeader className='font-bold text-lg border-b'>
      Detalji zadatka
    </DrawerHeader>

    <div className="p-4 flex flex-col gap-5">
              <Select onValueChange={(val)=>{setPublisherData(prev => ({
                ...prev,
                grade: val
              }))}}>
              <SelectTrigger className="w-full">
                <SelectValue  placeholder="Izaberite razred..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Razredi</SelectLabel>
                  {Grades.map((item, index)=>{
                    return (
                      <SelectItem value={item} key={index}>{item}</SelectItem>
                    )
                  })}
              
                </SelectGroup>
              </SelectContent>
            </Select>
<div className="flex items-center gap-3">

                  <Switch className='' checked={publisherData.anon} onCheckedChange={(val)=>{setPublisherData(prev => ({...prev, anon: val}))}} id="anonymous" />
                          <Label htmlFor="anonymous" className="cursor-pointer">Objavi zadatak anonimno.</Label>

                        
                    
</div>


    </div>

    <DrawerFooter className="flex flex-col gap-2">
    <Button onClick={()=>{navigate('/app/teacher/tasks')}} variant={'outline'} className="w-full">Odustani</Button>
    <Button onClick={()=>{
     
     publishTask()
    }} className="w-full"><Upload></Upload>Objavi zadatak</Button>
  </DrawerFooter>
  </DrawerContent>
  
</Drawer>

<AlertDialog open={testDeteletionData.modal}>
<AlertDialogContent className="max-w-[90vw] md:max-w-lg rounded-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Da li ste sigurni?</AlertDialogTitle>
          <AlertDialogDescription>
            Da li želite obrisati test za pregledanje zadatka? Brisanje testa neće biti efekivno dok ne sačuvate promene.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={()=>[setTestDeletionData({modal: false, index: -1})]}>Odustani</AlertDialogCancel>
          <AlertDialogAction variant={'destructive'} onClick={()=>{deleteTest()}}>Potvrdi</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

<LoaderModal open={loading}></LoaderModal>


  <AlertDialog onOpenChange={(val)=>{setOpenDeleteModal(val)}} open={openDeleteModal}>

      <AlertDialogContent className="max-w-[90vw] md:max-w-lg rounded-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Da li ste sigurni?</AlertDialogTitle>
          <AlertDialogDescription>
            Brisanjem zadatka obrisaćete i sva rešenja učenika vezana za ovaj zadatak.
            <br />
            <span className="font-bold text-[var(--destructive)]">Ova radnja ne može biti opozvana.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Odustani</AlertDialogCancel>
          <AlertDialogAction onClick={()=>{deleteTask()}} variant={'destructive'}>Nastavi</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>


</>
  )
}

export default Editor