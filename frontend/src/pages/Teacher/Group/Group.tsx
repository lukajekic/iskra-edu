import PageTitle from '@/components/custom/PageTitle'
import { Button } from '@/components/ui/button'
import { Fullscreen, Info, PlusSquare, Users } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import Footer from '@/components/custom/Footer'
import { DataTable } from '@/components/custom/data-table'
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Field, FieldGroup } from '@/components/ui/field'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
const Group =   () => {
const [groupActive, setGroupActive] = useState(true)
const [codeFullScreen, setCodeFullScreen] = useState(false)
const invoices = [
  {
    invoice: "INV001",
    paymentStatus: "Paid",
    totalAmount: "$250.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV002",
    paymentStatus: "Pending",
    totalAmount: "$150.00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV003",
    paymentStatus: "Unpaid",
    totalAmount: "$350.00",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "INV004",
    paymentStatus: "Paid",
    totalAmount: "$450.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV005",
    paymentStatus: "Paid",
    totalAmount: "$550.00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV006",
    paymentStatus: "Pending",
    totalAmount: "$200.00",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "INV007",
    paymentStatus: "Unpaid",
    totalAmount: "$300.00",
    paymentMethod: "Credit Card",
  },
]

useEffect(()=>{
  fetch('https://jsonplaceholder.typicode.com/todos/1')
      .then(response => response.json())
      .then(json => console.log(json))
}, [])
  return (
    <>
    <PageTitle title='Nastavna grupa' subtitle='Započnite nastavno predavanje ili pratite napredak aktivnog.'></PageTitle>

    <div className="w-full flex gap-0 justify-between">
           <Alert className='mt-3 h-fit w-full lg:w-[70%]'>
      <Info></Info>
      <AlertTitle>
        Preporuka
      </AlertTitle>
      <AlertDescription>
        reporučeno je da svim svojim đacima kreirate naloge u odeljku „Učenici“ i tako im omogućite vežbanje zadataka kod kuće i dugoročno praćenje napredka i uvid u svoje radove. Ukoliko se odlučite za pristup kodom, ovde možete kreirati grupu koja će važiti 45 minuta.
        <br></br>
        <strong className='text-red-600'>Nakon isteka perioda važenja grupe svi podaci o napredku biće obrisani.</strong>
      </AlertDescription>
    </Alert>
    
        <img src="/undraw_educator_6dgp.svg" className='  h-[150px] hidden lg:block ' alt="" />
        </div>
   
    {!groupActive ? (
      <Button><Users></Users>Nova grupa</Button>
    ) : (
      <>
      <div>
        <span className="font-bold text-2xl">Kod za pristup</span>
        <div className="border-1  text-orange-700 w-fit rounded-2xl mt-2 flex ">
          <span className="p-5 text-5xl font-bold">AG23-3HSE</span>
          <Button onClick={()=>{setCodeFullScreen(true)}} variant={'outline'} className='h-auto text-gray-500 border-1 border-transparent border-l-1 border-l-[var(--border)] rounded-r-2xl rounded-l-none'><Fullscreen className='size-6'></Fullscreen></Button>
        </div>
      </div>
      <Separator className='my-5'></Separator>
      <div>
        <span className="font-bold text-2xl">Napredak grupe</span>
        <div className="p-5 border-1 text-5xl font-bold   rounded-2xl mt-2">
 <Table >
      <TableCaption>Kraj tabele.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Ime i prezime</TableHead>
          <TableHead>Period aktivnosti u grupi</TableHead>
          <TableHead className="text-right">Napredak (urađeni zadaci)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.invoice}>
            <TableCell>{invoice.paymentStatus}</TableCell>
            <TableCell>{invoice.paymentMethod}</TableCell>
            <TableCell className="text-right">{invoice.totalAmount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
   
      </TableFooter>
    </Table>
        </div>
      </div>
      </>
    )}
        <div className="h-5"></div>



{/* edit */}
<Drawer  direction='right' >
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
    <Button variant={'outline'}>Odusani</Button>
    <Button>Sacuvaj</Button>
  </DrawerFooter>
  </DrawerContent>
  
</Drawer>


<Dialog >
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
      <Button variant={'outline'}>Odustani</Button>
      <Button>Sacuvaj</Button>
    </DialogFooter>
    </DialogContent>
</Dialog>
    <Footer></Footer>

    <Dialog open={codeFullScreen} onOpenChange={(val)=>{setCodeFullScreen(val)}} >
      <DialogContent className='min-w-fit'>
          <div className='w-fit'>
        <span className="font-bold text-2xl">Kod za pristup</span>
        <div className="p-5 border-1 text-7xl font-bold text-orange-700 w-fit rounded-2xl mt-2">AG23-3HSE</div>
      </div>
      </DialogContent>
    </Dialog>
    </>
  )
}

export default Group