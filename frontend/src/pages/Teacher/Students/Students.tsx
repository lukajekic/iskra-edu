import PageTitle from '@/components/custom/PageTitle'
import { Button } from '@/components/ui/button'
import { Info, PlusSquare } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import Footer from '@/components/custom/Footer'
import { DataTable } from '@/components/custom/data-table'
import { columns, type Payment } from './columns'
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Field, FieldGroup } from '@/components/ui/field'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

type ModalStatus = {
  create: boolean,
  edit: boolean
}
async function getData(): Promise<Payment[]> {

  // Fetch data from your API here.
  return [
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },

    {
      id: "sadefr",
      amount: 200,
      status: "success",
      email: "a@example.com",
    },
    // ...
  ]
}
const Students =   () => {
    const [modalStatus, setModalState] = useState<ModalStatus>({
    create: false,
    edit: false
  })
  const [data, setData] = useState<Payment[]>([])
  useEffect(() => {
    const loadData = async () => {
      const result = await getData()
      setData(result)
    }

    loadData()
  }, [])

  return (
    <>
    <PageTitle title='Učenici' subtitle='Trajni nalozi Vaših učenika'></PageTitle>

    <div className="w-full flex gap-0 justify-between">
           <Alert className='mt-3 h-fit w-full lg:w-[70%]'>
      <Info></Info>
      <AlertTitle>
        Preporuka
      </AlertTitle>
      <AlertDescription>
        Preporučeno je da na početku upotrebe Iskra sistema kreirate sivm sovjim učenicima naloge i omogućite rad i vežbu zadataka od kuće, stalni pristup, uvid u lična prethodna rešenja bez vremenskih ograničenja.
      </AlertDescription>
    </Alert>
    
        <img src="/undraw_true-friends_1h3v.svg" className='  h-[150px] hidden lg:block ' alt="" />
        </div>
   
    <Button onClick={()=>{setModalState(prev =>({...prev, create: true}))}}><PlusSquare></PlusSquare>Novi učenik</Button>
        <div className="h-5"></div>
<DataTable filter={{key: "email", input_label: "Pretraga..."}} data={data} columns={columns}></DataTable>



{/* edit */}
<Drawer  direction='right' open={modalStatus.edit} onOpenChange={(val)=>setModalState(prev => ({...prev, edit: val}))} >
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
    <Button variant={'outline'} onClick={()=>setModalState(prev =>({...prev, edit: false}))}>Odusani</Button>
    <Button>Sacuvaj</Button>
  </DrawerFooter>
  </DrawerContent>
  
</Drawer>


<Dialog open={modalStatus.create} onOpenChange={(val)=>setModalState(prev => ({...prev, create: val}))} >
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
      <Button onClick={()=>setModalState(prev =>({...prev, create: false}))}  variant={'outline'}>Odustani</Button>
      <Button>Sacuvaj</Button>
    </DialogFooter>
    </DialogContent>
</Dialog>
    <Footer></Footer>
    </>
  )
}

export default Students