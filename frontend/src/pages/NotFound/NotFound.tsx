import { Button } from '@/components/ui/button'
import React from 'react'

const NotFound = () => {
  return (
    <>
    <div className="w-full h-screen fixed top-0 left-0 overflow-hidden flex justify-between">
      <div className="w-1/2 h-full overflow-hidden flex items-center p-10">
      <img src="/undraw_taken_mshk.svg" className='object-contain' alt="" />
      </div>

      <div className="w-1/2 h-full overflow-hidden flex flex-col items-center p-10 justify-center">
      <h1 className="text-5xl font-bold text-amber-600">Desila se greska!</h1>
      
      <p className='color-gray-700 text-2xl mt-5'>Stranica koju tražiš nije pronađena, klikni na dugme kako bi bio preumseren autoamtski na stranicu za prijavu ili ako si već prijavljen na odgovarajuć portal.</p>


      <Button className='px-7 h-15 rounded-2xl text-xl mt-10'>Preusmeri me</Button>
      </div>


    </div>
    </>
  )
}

export default NotFound