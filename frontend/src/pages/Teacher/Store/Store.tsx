import PageTitle from '@/components/custom/PageTitle'
import { Button } from '@/components/ui/button'
import { CircleAlert, Info, PlusSquare } from 'lucide-react'
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
import RichTextEditor from '@/components/custom/RichTextEditor'
import Editor from 'react-simple-wysiwyg';
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
const Store =   () => {

const [data, setData] = useState<Payment[]>([])
const [html, setHtml] = useState('my <b>HTML</b>');
  
  
  useEffect(() => {
    const loadData = async () => {
      const result = await getData()
      setData(result)
    }

    loadData()
  }, [])

  return (
    <>
    <PageTitle title='Zbirka zadataka' subtitle='Preuzmite zadatke drugih profesora i obogatite svoje časove.'></PageTitle>

    <div className="w-full flex gap-0 justify-between items-center">
           <div className='mt-3 h-fit w-full lg:w-[70%]'>
            <Alert className=''>
      <Info></Info>
      <AlertTitle>
        Preporuka
      </AlertTitle>
      <AlertDescription>
        Sve zadatke koje sami napravite možete podeliti u zbirku i odabrati da li želite priazati Vaš identitet ili ostati anonimni.
      </AlertDescription>
    </Alert>
<Alert variant={'destructive'} className='my-3'>
  <CircleAlert></CircleAlert>
  <AlertTitle>Upozorenje</AlertTitle>
  <AlertDescription>
    Zadatke koje preuzmete iz zbirke (od drugih autora) ostaju u Vašim folderima, ukoliko autor ukloni zadatak iz zbirke. Na zadatke koje Vi objavite se primenjuje ista praksa.
    <div className="h-2"></div>
    <strong>Preuzetim zadacima ne možete izmeniti naziv, opis i instrukcije, kao i testove.</strong>
  </AlertDescription>
</Alert>
           </div>
   
    
        <img src="/undraw_folder-files_5www.svg" className='  h-[150px] hidden lg:block ' alt="" />
        </div>
   
        <div className="h-5"></div>
<DataTable filter={{key: "email", input_label: "Pretraga..."}} data={data} columns={columns}></DataTable>



{/* edit */}
<Drawer   direction='right'  >
  <DrawerContent className='pb-[60px]'>
    <DrawerHeader className='font-bold text-lg'>
      Izmeni učenika
    </DrawerHeader>

    <DrawerFooter>
    <Button variant={'outline'}>Odusani</Button>
    <Button>Sacuvaj</Button>
  </DrawerFooter>
  </DrawerContent>
  
</Drawer>



    <Footer></Footer>
    </>
  )
}

export default Store