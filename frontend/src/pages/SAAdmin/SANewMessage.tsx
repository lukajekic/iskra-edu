import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import axios from 'axios'
import React, { useState } from 'react'
import { toast } from 'sonner'

const SANewMessage = () => {
    const onSubmit =async (event)=>{
        try {
            event.preventDefault()
        let data00 = new FormData(event.target)
        let data = Object.fromEntries(data00.entries())
        console.log(data);

        const response = await axios.post(`${import.meta.env.VITE_BACKEND}/user/me/messages`, data)

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
            <Label className='pb-2' htmlFor='title'>Naslov poruke:</Label>
            <Input name='title' required id='title'></Input>
        </div>

        <div>
            <Label className='pb-2' htmlFor='description'>Poruka (HTML format):</Label>
            <Textarea name='description' required id='description'></Textarea>
        </div>

        <div>
            <Label className='pb-2' htmlFor='date'>Datum poruke:</Label>
          <input name='date' required id='date' type="datetime-local" />

        </div>

        <ButtonGroup className='self-end mt-5'>
            <Button variant={'outline'} type='reset'>Resetuj vrednosti</Button>
            <Button type='submit'>Posalji poruku</Button>
        </ButtonGroup>
    </form>
    </>
  )
}

export default SANewMessage