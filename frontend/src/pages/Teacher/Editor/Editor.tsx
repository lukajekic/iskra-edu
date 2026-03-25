import PageTitle from '@/components/custom/PageTitle'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Field, FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertTriangleIcon, Ban, ChevronRight, CircleOff, CircleQuestionMark, Download, File, Import, PlusSquare, SquarePlus, Trash, Upload } from 'lucide-react'
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
            tests: taskData?.taskData.tests || []
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
                <div id="task-materials" className="border-1 rounded-xl p-8">
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
                                <div className="quill-wrapper border-1 shadow-xs">
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
                                <div className="w-full flex gap-2 items-center">
                                    <div id="language" className='basis-1/2'>
                                        <Field>
                                            <Label>Programski jezik</Label>

                                 <Select value={taskData?.taskData.language}> 
      <SelectTrigger disabled className="w-1/2">
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


                                    <div id="folder" className='basis-1/2'>
                                        <Field>
                                            <Label>Folder</Label>

                                 <Select  value={taskData?.taskData.folder.title || "."}>
      <Tooltip>
        <TooltipTrigger className=''>
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
       <SelectItem value={taskData?.taskData.folder.title || "."}><img src={foldericon} className='w-4'></img>{taskData?.taskData.folder.title}</SelectItem>
      
        </SelectGroup>
      </SelectContent>
    </Select>
                                        </Field>
                                    </div>


                                </div>
                            </Field>
                        </FieldGroup>

                        <Separator className='my-10'></Separator>

                        <h1 className='text-3xl font-bold'>Testovi</h1>

{/* python testovi  */}
{taskData?.taskData.language === 'python' && (
    <>
        {/* python standard testovi */}

    {taskData.taskData.outputType === 'standard' && (
        <>
        <Alert className='mt-3'>
                            <File></File>
                            <AlertTitle>Uputstvo za kreiranje testova</AlertTitle>
                            <AlertDescription>
                                Spremili smo jednostavno uputstvo kako da najlakše napišete testove zadataka (metode kojima se ispituje tačnost rešenja učenika) i sebi olakšate pregledanje zadataka.
                                
                                <br></br>
                                <br></br>
                                <div className="flex justify-end">
<Button asChild>
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
                            <Button className='mt-3' onClick={()=>{setOpenTestmaker(true)}}><SquarePlus></SquarePlus>Kreiraj novi test</Button>
                        )}

                        {/* test kreator */}
                        {openTestMaker && (
                            <div className="w-full draft-box h-fit rounded-lg p-5 mt-5">
                                                    <h1 className='text-2xl font-bold'>Novi test</h1>
                                                    <Separator className='my-3'></Separator>
                        <div className="flex w-full gap-2">
                            <Button onClick={()=>{set_standard_temp_new_test(prev => ({
                                ...prev,
                                input: [...prev.input, ""]
                            }))}}><PlusSquare></PlusSquare>Novi ulaz</Button>
                            <div id="inputs" className="flex-1 flex flex-col gap-2">
                                {standard_temp_new_test.input.map((item, index)=>{
                                    return (
                                        <div className="flex items-center gap-2">
                                            <div className="draft-box p-4 rounded-lg min-w-[3.5rem] flex justify-center items-center">{index + 1}</div>
                                            <div className="w-full flex items-center gap-2">
                                                <Input value={standard_temp_new_test.input[index]} onChange={(e) => {
                    set_standard_temp_new_test(prev => ({
                        ...prev,
                        input: prev.input.map((val, i) => i === index ? e.target.value : val)
                    }))
                }} className='bg-white'></Input>
                <Button onClick={()=>{set_standard_temp_new_test(prev => ({
        ...prev,
        input: prev.input.filter((_, i) => i !== index)
    }));}} variant={'destructive'}>Obrisi ulaz</Button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
<Separator className='my-5'></Separator>
                         <div className="flex w-full gap-2">
                             <Button onClick={()=>{set_standard_temp_new_test(prev => ({
                                ...prev,
                                output: [...prev.output, ""]
                            }))}}><PlusSquare></PlusSquare>Novi izlaz</Button>
                            <div id="outputs" className="flex-1 flex flex-col gap-2">
                                {standard_temp_new_test.output.map((item, index)=>{
                                    return (
                                        <div className="flex items-center gap-2">
                                            <div className="draft-box p-4 rounded-lg min-w-[3.5rem] flex justify-center items-center">{index + 1}</div>
                                            <div className="flex items-center gap-2 w-full">
                                                <Input value={standard_temp_new_test.output[index]} onChange={(e) => {
                    set_standard_temp_new_test(prev => ({
                        ...prev,
                        output: prev.output.map((val, i) => i === index ? e.target.value : val)
                    }))
                }} className='bg-white flex-1'></Input>
                <Button onClick={()=>{set_standard_temp_new_test(prev => ({
        ...prev,
        output: prev.output.filter((_, i) => i !== index)
    }));}} variant={'destructive'}>Obrisi izlaz</Button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mt-5">
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
                                }}  className='p-5  bg-green-600 hover:bg-green-700'>SAČUVAJ TEST</Button>
                            <Button variant={'outline'} onClick={()=>{setOpenTestmaker(false), set_standard_temp_new_test({input: [], output: []})}}>Odustani</Button>
                        </div>
                        </div>
                        )}

                        <Separator className='my-5'></Separator>

                       <div className="flex flex-col gap-2">
                         {taskData.taskData.tests.map((item, index)=>{
                            return (
                                <div className="flex items-center gap-2">
                                    <div className="draft-box p-4 rounded-[50%] min-w-[3.5rem] max-h-[3.5rem] flex justify-center items-center text-lg font-bold">{index + 1}</div>
                                    <div className="border-1 rounded-lg p-4 flex-1">
                                        <p className="text-lg font-bold">Ulazi</p>
                                        {item.input.length === 0 && (
                                           <span className='inline-flex items-center text-gray-500 italic gap-2'> <CircleOff className='size-5'></CircleOff> Nema ulaza...</span>
                                        )}
                                        <ol>
                                            {item.input.map((item, index)=>{
                                                
                                                return (
                                                <li key={index}>{item}</li>
                                                )
                                                
                         })}
                                            
                                        </ol>

                               

                                        <p className="text-lg font-bold mt-1">Izlazi</p>
                                        {item.output.length === 0 && (
                                           <span className='inline-flex items-center text-gray-500 italic gap-2'> <CircleOff className='size-5'></CircleOff> Nema ulaza...</span>
                                        )}
                                        <ol>
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
                                    <Button onClick={()=>{setTestDeletionData({modal: true, index: index})}} className='flex flex-col items-center h-auto self-stretch' variant={'destructive'}><Trash></Trash>
                                    <span>Obriši test</span>
                                    </Button>
                                </div>
                            )

                        })}
                       </div>
                        </>
    )}
    </>
)}
                        
                       
<div className="flex w-full items-center justify-end mt-5 gap-3">
    <Button variant={'outline'} onClick={()=>{navigate('/app/teacher/tasks')}}>Odustani</Button>
                        <Button onClick={()=>{
                            if (selfPublished) {
                                updateTask(false)
                            } else {
                                setOpenSaveModal(true)
                            }
                        }}>Sačuvaj izmene</Button>
</div>
                    </form>
                </div>
            </div>
        ): editingAllowed === "store-origin" ?(
            <Empty className='border-1 mt-5'>
                <EmptyHeader>
                    <Ban></Ban>
                    <EmptyTitle>
                        Zabranjene izmene
                    </EmptyTitle>
                </EmptyHeader>
                <EmptyDescription>
                    Na zadacima koje ste preuzeli iz „Zbirke zadataka“ nisu dozvoljene izmene.
                </EmptyDescription>

                <EmptyContent>
                    <Link to={'/app/teacher/tasks'}><Button>Povratak na zadatke</Button></Link>
                </EmptyContent>
            </Empty>
        ) : (<></>) }


<Footer></Footer>

<Dialog open={openSaveModal} onOpenChange={(val)=>[setOpenSaveModal(val)]}>
    <DialogContent className='min-w-fit'>
        <div className="flex flex-col gap-2 items-center">
            <CircleQuestionMark className='size-15 text-amber-700'></CircleQuestionMark>
            <p className="text-lg text-center">Da li želite da sačuvate zadatak i testove zadatka?</p>
        </div>

        <DialogFooter>
            <div className="flex justify-between items-center gap-7">
                <Button onClick={()=>{setOpenSaveModal(false)}} variant={'outline'}>Odustani</Button>
                <div className="flex items-center gap-2">
                    <Button onClick={()=>{updateTask(false)}} className='border-amber-600 text-amber-700' variant={'outline'}>Sačuvaj za ličnu upotrebu</Button>
                    <Button onClick={()=>{updateTask(true)}} variant={'default'}>Sačuvaj i objavi u Zbirku zadataka</Button>
                </div>
            </div>
        </DialogFooter>
    </DialogContent>
</Dialog>

<Dialog open={func_openModalAnimation}>
    <DialogContent showCloseButton={false} className=' min-h-fit min-w-fit p-4'>
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
  <DrawerContent className='pb-[60px]'>
    <DrawerHeader className='font-bold text-lg border-b'>
      Detalji zadatka
    </DrawerHeader>

    <div className="p-4">
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
<div className="flex items-center gap-3 mt-5">

                  <Switch className='' checked={publisherData.anon} onCheckedChange={(val)=>{setPublisherData(prev => ({...prev, anon: val}))}} id="anonymous" />
                          <Label htmlFor="anonymous">Objavi zadatak anonimno.</Label>
                    
</div>
    </div>

    <DrawerFooter>
    <Button onClick={()=>{navigate('/app/teacher/tasks')}} variant={'outline'}>Odustani</Button>
    <Button onClick={()=>{
     
     publishTask()
    }}><Upload></Upload>Objavi zadatak</Button>
  </DrawerFooter>
  </DrawerContent>
  
</Drawer>

<AlertDialog open={testDeteletionData.modal}>
<AlertDialogContent>
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
</>
  )
}

export default Editor