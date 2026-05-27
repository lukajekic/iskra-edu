import PageTitle from '@/components/custom/PageTitle'
import { Button } from '@/components/ui/button'
import { Download, Info, PlusSquare, RefreshCcw } from 'lucide-react'
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
import axios from 'axios'
import LoaderModal from '@/components/custom/LoaderModal'
import SolutionIntepreter from '@/components/custom/SolutionIntepreter/SolutionIntepreter'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
type ProgressType = {
  name: string,
  progress: {
    accepted: number,
    revise: number,
    none: number
  }
}

const Progress =   () => {
const [data, setData] = useState<ProgressType[]>([])
const [loading, setLoading] = useState(true)
const [studentIspectorID, setStudentIspectorID] = useState<string|null>(null);
(window as any).setStudentIspectorID = setStudentIspectorID



 const columnsConfig = [
    { header: 'Ime i prezime', dataKey: 'name' },
    { header: 'Neuradjenih', dataKey: 'progress.none' },
            { header: 'Netacnih', dataKey: 'progress.revise' },
    { header: 'Tacnih', dataKey: 'progress.accepted' }
  ];
  

  const handleExport = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('ISKRA', 15, 20);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Generisano: ' + new Date().toLocaleDateString(), 15, 26);

  const getNestedValue = (obj, path) => 
  path.split('.').reduce((acc, key) => acc?.[key], obj);

const tableRows = data.map(item =>
  columnsConfig.map(col => getNestedValue(item, col.dataKey))
);




    autoTable(doc, {
  columns: columnsConfig,
  body: tableRows,
  startY: 35,
  margin: { top: 20, right: 15, bottom: 20, left: 15 },
  styles: {
    font: 'Helvetica',
    fontSize: 10,
    cellPadding: 4,
  },
  headStyles: {
    fillColor: [41, 128, 185],
    textColor: 255,
    fontStyle: 'bold'
  },
  alternateRowStyles: {
    fillColor: [245, 247, 250]
  }
});

    doc.save('izvestaj.pdf');
  };



const fetchProgress = async()=>{
  try {
    setLoading(true)
    const response = await axios.get(`${import.meta.env.VITE_BACKEND}/my/students/progress`)
    if (response.status === 200) {
setData(response.data)
setLoading(false)
    }
  } catch (error) {
    console.error(error)
    setLoading(false)
  }
}



  useEffect(() => {
    fetchProgress()
  }, [])

  return (
    <>
    <PageTitle title='Napredak' subtitle='Pratite napredak Vaših učenika.'></PageTitle>
    <div className="w-full flex gap-0 justify-between">
      <Alert className='mt-3 w-full lg:w-[70%] pr-0 mr-0 h-fit'>
      <Info></Info>
      <AlertTitle>
        Napredak
      </AlertTitle>
      <AlertDescription>
        Broj prikazanih urađenih/pogrešno urađenih/neurađenih zadataka predstavlja broj zadataka sa tim statusom u odnsou na sve zadatke koje ste Vi postavili, ukoliko predajete I, II, III i IV razredima, odličnim se uspehom smatra ukoliko učenik uradi 25% zadataka. <strong>Netačno urađeni zadaci se boduju sa malim brojem bodovima, kao motivacija učenicima da započnu rešavanje težih zadataka.</strong>
      </AlertDescription>
    </Alert>

    <img src="/undraw_progress-overview_wl8n.svg" className='  h-[150px] hidden lg:block ' alt="" />
    </div>
    <div className="h-2"></div>
    <Button onClick={()=>{fetchProgress()}} className='mb-2'><RefreshCcw></RefreshCcw>Osveži podatke</Button>
    <Button className='ml-2' variant={'outline'} onClick={handleExport}><Download></Download>Izvoz podataka</Button>

<DataTable  filter={{key: "name", input_label: "Pretraga..."}} data={data} columns={columns} studentIspectorID={studentIspectorID} setStudentIspectorID={setStudentIspectorID}></DataTable>



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

    <LoaderModal open={loading}></LoaderModal>

    <Dialog open={studentIspectorID ? true : false} onOpenChange={(e)=>{
  if (e === false) {
    setStudentIspectorID(null)
  }
}}>
  <DialogContent className='max-w-[95vw] w-[95vw] min-w-[95vw] h-[90vh] max-h-[90vh] flex flex-col p-6'>
    <div className="flex-1 overflow-hidden">
        {studentIspectorID && (
          <SolutionIntepreter UserID={studentIspectorID} />
        )}
    </div>
  </DialogContent>
</Dialog>
    </>
  )
}

export default Progress