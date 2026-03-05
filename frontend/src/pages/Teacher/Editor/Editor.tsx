import PageTitle from '@/components/custom/PageTitle'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Field, FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertTriangleIcon, Ban } from 'lucide-react'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const Editor = () => {
    const [editingAllowed, setEditingAllowed] = useState<"true" | "store-origin">("true")
    const [selfPublished, setSelfPublished] = useState(true)
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
                        </FieldGroup>
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

</>
  )
}

export default Editor