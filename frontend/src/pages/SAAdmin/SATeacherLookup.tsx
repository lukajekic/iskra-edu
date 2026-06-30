import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import axios from 'axios'
import React, { useContext, useState } from 'react'
import { toast } from 'sonner'
import { TeacherListContext } from './SAHome'

interface TeacherData {
    _id: string;
    name: string;
    type: string;
    username: string;
    activegroup?: {
        _id: string;
    };
    institution: string;
    super_admin: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

const SATeacherLookup = () => {
    const [selectedTeacherId, setSelectedTeacherId] = useState<string>('')
    const [teacherData, setTeacherData] = useState<TeacherData | null>(null)

    const onSubmit = async (event)=>{
        try {
            event.preventDefault()
            
            if (!selectedTeacherId) {
                toast.error("Molimo odaberite profesora.")
                return
            }

            console.log("Traženi ID:", selectedTeacherId);

            const response = await axios.get(`${import.meta.env.VITE_BACKEND}/user/me/teachers/${selectedTeacherId}`)

            if (response.status === 200) {
                toast.success("Profesor uspešno pronađen.")
                setTeacherData(response.data)
            }
        } catch (error) {
            toast.error("ERROR.")   
        }
    }

    const teacherList = useContext(TeacherListContext)
  return (
    <>
    <div className="flex flex-col gap-6">
        <form onSubmit={onSubmit} className='flex flex-col gap-2' action="">
            <div>
                <Label className='pb-2' htmlFor='teacherID'>Ime i prezime:</Label>
                <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Odaberite profesora..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Profesori</SelectLabel>
                      {teacherList?.map((item, index)=>(
                        <SelectItem key={index} value={item._id}><span className="font-bold">{item.name}</span> - {item.username}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
            </div>

            <ButtonGroup className='self-end mt-5'>
                <Button type='submit'>Pretrazi</Button>
            </ButtonGroup>
        </form>

        {teacherData && (
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 mt-4">
                <h3 className="text-lg font-semibold tracking-tight mb-4">Profil profesora</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-muted-foreground block">Ime i prezime:</span>
                        <span className="font-medium text-base">{teacherData.name}</span>
                    </div>
                    <div>
                        <span className="text-muted-foreground block">Korisničko ime:</span>
                        <span className="font-medium text-base">{teacherData.username}</span>
                    </div>
                
                    <div>
                        <span className="text-muted-foreground block">Institucija:</span>
                        <span className="font-medium text-base">{teacherData.institution}</span>
                    </div>
                    <div>
                        <span className="text-muted-foreground block">Super Admin:</span>
                        <span className="font-medium text-base">
                            {teacherData.super_admin ? "Da" : "Ne"}
                        </span>
                    </div>
                    <div>
                        <span className="text-muted-foreground block">Kreiran:</span>
                        <span className="font-medium text-base">
                            {new Date(teacherData.createdAt).toLocaleDateString('sr-RS')}
                        </span>
                    </div>
                </div>
            </div>
        )}
    </div>
    </>
  )
}

export default SATeacherLookup