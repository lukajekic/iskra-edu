import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import axios from 'axios'
import React, { useState } from 'react'
import { toast } from 'sonner'

const SANewUser = () => {
    const onSubmit =async (event)=>{
        try {
            event.preventDefault()
        let data00 = new FormData(event.target)
        let data = Object.fromEntries(data00.entries())
        data['type'] = 'teacher'
        console.log(data);

        const response = await axios.post(`${import.meta.env.VITE_BACKEND}/user/create`, data)

        if (response.status === 201) {
            toast.success("OK.")
        }
        } catch (error) {
         toast.error("ERROR.")   
        }
        
    }
  return (
    <>
    <form onSubmit={onSubmit} className='flex flex-col gap-2' action="">
        <div>
            <Label className='pb-2' htmlFor='name'>Ime i prezime:</Label>
            <Input name='name' required id='name'></Input>
        </div>

        <div>
            <Label className='pb-2' htmlFor='username'>Korisnicko ime:</Label>
            <Input name='username' required id='username'></Input>
        </div>

        <div>
            <Label className='pb-2' htmlFor='password'>Lozinka:</Label>
            <Input name='password' required id='password'></Input>

        </div>

         <div>
            <Label className='pb-2' htmlFor='institution'>Institucija:</Label>
            <Input name='institution' required id='institution'></Input>

        </div>

        <ButtonGroup className='self-end mt-5'>
            <Button variant={'outline'} type='reset'>Resetuj vrednosti</Button>
            <Button type='submit'>Napravi nalog</Button>
        </ButtonGroup>
    </form>
    </>
  )
}

export default SANewUser