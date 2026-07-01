import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogContent as DialogContent, // Promenjeno/Zadržano radi stabilnosti
} from "@/components/ui/alert-dialog"
import axios from 'axios'
import React, { useContext, useState } from 'react'
import { toast } from 'sonner'
import { TeacherListContext } from './SAHome'

interface TeacherData {
    _id: string;
    name: string;
    type: string;
    username: string;
    login_banned: boolean;
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
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
    const [isPending, setIsPending] = useState<boolean>(false)

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

    const handleBanToggle = async () => {
        if (!teacherData) return
        
        try {
            setIsPending(true)
            const targetStatus = !teacherData.login_banned

            const response = await axios.put(`${import.meta.env.VITE_BACKEND}/user/me/teachers/ban/${teacherData._id}`, {
                login_banned: targetStatus
            })

            if (response.status === 200) {
                toast.success(targetStatus ? "Korisnik uspešno suspendovan." : "Korisnik uspešno aktiviran.")
                setTeacherData({
                    ...teacherData,
                    login_banned: targetStatus
                })
            }
        } catch (error) {
            toast.error("Greška prilikom izmene statusa.")
        } finally {
            setIsPending(false)
            setIsDialogOpen(false)
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
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 mt-4 flex flex-col gap-6">
                <div>
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
                            <span className="text-muted-foreground block">Zabrana prijave:</span>
                            <span className="font-medium text-base">
                                {teacherData.login_banned ? "Da" : "Ne"}
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

                {/* Sekcija za promenu statusa se sada nalazi na samom dnu kartice */}
                <div className="border-t pt-4 flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label htmlFor="login-ban-switch" className="text-base font-medium">Zabrana prijave (Ban)</Label>
                        <p className="text-sm text-muted-foreground">
                            {teacherData.login_banned 
                                ? "Korisniku je trenutno zabranjen pristup sistemu." 
                                : "Korisnik može nesmetano da se uloguje."}
                        </p>
                    </div>

                    <div className="flex items-center">
                        {/* Izmešten Switch van AlertDialogTrigger-a kako bi ispravno primao klikove */}
                        <Switch 
                            id="login-ban-switch"
                            checked={teacherData.login_banned}
                            onCheckedChange={() => setIsDialogOpen(true)}
                        />

                        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Da li ste sigurni?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {teacherData.login_banned 
                                            ? `Ova akcija će omogućiti profesoru ${teacherData.name} ponovni pristup aplikaciji.`
                                            : `Ova akcija će suspendovati profesora ${teacherData.name} i onemogućiti mu prijavu na sistem.`}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel disabled={isPending}>Odustani</AlertDialogCancel>
                                    <AlertDialogAction 
                                        disabled={isPending} 
                                        onClick={(e) => {
                                            e.preventDefault()
                                            handleBanToggle()
                                        }}
                                    >
                                        {isPending ? "Ažuriranje..." : "Potvrdi"}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </div>
        )}
    </div>
    </>
  )
}

export default SATeacherLookup