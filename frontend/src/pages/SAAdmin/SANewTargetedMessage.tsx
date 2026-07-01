import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import axios from 'axios'
import React, { useContext, useState } from 'react'
import { toast } from 'sonner'
import { TeacherListContext } from './SAHome'

const SANewTargetedMessage = () => {
    const [selectedTeacherId, setSelectedTeacherId] = useState("")
    const teacherList = useContext(TeacherListContext)
    const onSubmit = async (event)=>{
        try {
            event.preventDefault()
            let data00 = new FormData(event.target)
            let data = Object.fromEntries(data00.entries())
            
            data.target = selectedTeacherId && selectedTeacherId.trim() !== "" ? selectedTeacherId : null

            console.log(data);

            const response = await axios.post(`${import.meta.env.VITE_BACKEND}/user/me/messages-specific`, data)

            if (response.status === 201) {
                toast.success("OK.")
                event.target.reset() 
                setSelectedTeacherId("")
            }
        } catch (error) {
            toast.error("ERROR.")   
        }
    }

    return (
        <>
        <form onSubmit={onSubmit} className='flex flex-col gap-2' action="">
            <div>
                <Label className='pb-2' htmlFor='title'>Naslov poruke:</Label>
                <Input name='title' required id='title'></Input>
            </div>

            <div>
                <Label className='pb-2' htmlFor='description'>Poruka (HTML format):</Label>
                <Textarea name='description' required id='description'></Textarea>
            </div>

            <div>
                <Label className='pb-2' htmlFor='teacherID'>Ime i prezime:</Label>
                <Select required value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Odaberite profesora" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {teacherList?.map((item, index)=>(
                        <SelectItem key={index} value={item._id}>
                          <span className="font-bold">{item.name}</span> - {item.username}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
            </div>

            <ButtonGroup className='self-end mt-5'>
                <Button variant={'outline'} type='reset' onClick={() => setSelectedTeacherId("")}>Resetuj vrednosti</Button>
                <Button type='submit'>Posalji poruku</Button>
            </ButtonGroup>
        </form>
        </>
    )
}

export default SANewTargetedMessage