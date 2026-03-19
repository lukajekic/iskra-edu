import PageTitle from '@/components/custom/PageTitle'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Field, FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertTriangleIcon, Ban, CircleQuestionMark, Download, File, PlusSquare, SquarePlus } from 'lucide-react'
import React, { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
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



import Footer from '@/components/custom/Footer'
const Editor = () => {
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
    const checkmark = useRef(null)
    const [editingAllowed, setEditingAllowed] = useState<"true" | "store-origin">("true")
    const [selfPublished, setSelfPublished] = useState(true)
    const [func_openModalAnimation, setOpenModalAnimation ] = useState(false)

    const [descriptionValue, setDescriptionValue] = useState("")

    const [openTestMaker, setOpenTestmaker] = useState(false)

    const [openSaveModal, setOpenSaveModal] = useState(false)
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

                                <Input id='task-title'></Input>
                            </Field>

                            <Field>
                                <Label>Tekst zadatka</Label>
                                <div className="quill-wrapper border-1 shadow-xs">
                                    <ReactQuill value={descriptionValue} onChange={(e)=>{setDescriptionValue(e)}}  theme='snow' className='h-[calc(100%-50px)]'></ReactQuill>
                                </div>
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

                                 <Select  defaultValue='python'>
      <SelectTrigger disabled className="w-1/2">
        <SelectValue placeholder="" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Dostupni jezici</SelectLabel>
          <SelectItem value="python"><img src={py_icon} className='w-4'></img>Python</SelectItem>

        </SelectGroup>
      </SelectContent>
    </Select>
                                        </Field>
                                    </div>


                                    <div id="folder" className='basis-1/2'>
                                        <Field>
                                            <Label>Folder</Label>

                                 <Select  defaultValue='apple1'>
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
          <SelectItem value="apple1"><img src={foldericon} className='w-4'></img>Apple 1</SelectItem>
          <SelectItem value="apple2"><img src={foldericon} className='w-4'></img>Apple 2</SelectItem>
          <SelectItem value="apple3"><img src={foldericon} className='w-4'></img>Apple 3</SelectItem>

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

                        <Alert className='mt-3'>
                            <File></File>
                            <AlertTitle>Uputstvo za kreiranje testova</AlertTitle>
                            <AlertDescription>
                                Spremili smo jednostavno uputstvo kako da najlakše napišete testove zadataka (metode kojima se ispituje tačnost rešenja učenika) i sebi olakšate pregledanje zadataka.
                                
                                <br></br>
                                <br></br>
                                <div className="flex justify-end">
                                    <Button className=''><Download></Download>Preuzmi uputstvo</Button>
                                </div>
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
                            <Button><PlusSquare></PlusSquare>Novi ulaz</Button>
                            <div id="inputs" className="flex-1 flex flex-col gap-2">
                                {Array.from({length: 2}).map((item, index)=>{
                                    return (
                                        <div className="flex items-center gap-2">
                                            <div className="draft-box p-4 rounded-lg min-w-[3.5rem] flex justify-center items-center">{index + 1}</div>
                                            <Input className='bg-white'></Input>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
<Separator className='my-5'></Separator>
                         <div className="flex w-full gap-2">
                            <Button><PlusSquare></PlusSquare>Novi izlaz</Button>
                            <div id="outputs" className="flex-1 flex flex-col gap-2">
                                {Array.from({length: 2}).map((item, index)=>{
                                    return (
                                        <div className="flex items-center gap-2">
                                            <div className="draft-box p-4 rounded-lg min-w-[3.5rem] flex justify-center items-center">{index + 1}</div>
                                            <Input className='bg-white'></Input>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mt-5">
                            <Button className='p-5  bg-green-600 hover:bg-green-700'>SAČUVAJ TEST</Button>
                            <Button variant={'outline'} onClick={()=>{setOpenTestmaker(false)}}>Odustani</Button>
                        </div>
                        </div>
                        )}

                        <Separator className='my-5'></Separator>

                       <div className="flex flex-col gap-2">
                         {Array.from({length: 5}).map((item, index)=>{
                            return (
                                <div className="flex items-center gap-2">
                                    <div className="draft-box p-4 rounded-[50%] min-w-[3.5rem] max-h-[3.5rem] flex justify-center items-center text-lg font-bold">{index + 1}</div>
                                    <div className="border-1 rounded-lg p-4 flex-1">
                                        <p className="text-lg font-bold">Ulazi</p>
                                        <ol>
                                            <li>Ana</li>
                                            <li>Jovanovic</li>
                                        </ol>

                               

                                        <p className="text-lg font-bold mt-1">Izlazi</p>
                                        <ol>
                                            <li>Ana</li>
                                            <li>Jovanovic</li>
                                        </ol>
                                    </div>
                                </div>
                            )

                        })}
                       </div>
<div className="flex w-full items-center justify-end mt-5 gap-3">
    <Button variant={'outline'} onClick={()=>{playAnimation()}}>Odustani</Button>
                        <Button onClick={()=>{setOpenSaveModal(true)}}>Sačuvaj izmene</Button>
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
                    <Button className='border-amber-600 text-amber-700' variant={'outline'}>Sačuvaj za ličnu upotrebu</Button>
                    <Button variant={'default'}>Sačuvaj i objavi u Zbirku zadataka</Button>
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
</>
  )
}

export default Editor