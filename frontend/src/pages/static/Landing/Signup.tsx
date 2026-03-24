import React from 'react'
import Sectiontitle from './Sectiontitle'
import { ArrowUpRight } from 'lucide-react'

const Signup = () => {
  return (
    <div className="h-screen max-h-screen grid grid-cols-2 grid-rows-1 items-start p-20">
        <div id="info">
            <Sectiontitle text='Zainteresovani ste?'>

            </Sectiontitle>

                                <p className="text-xl w-1/2 mt-10">Za detaljnu prezentaciju platforme, pitanja u vezi primene platforme i zahteva za ponudu, molimo Vas kontaktirajte nas.
                                
                                <br />
                                <br />
                                
                                Tu smo da odgovorimo u najkraćem roku.</p>


        </div>

        <a target='_blank' href='https://forms.gle/a9kKbTemVmbyJSii8' className='h-full w-full' id="contactbtn">
<div className="transition-colors w-full h-full border-2 border-primary rounded-4xl flex flex-col p-10 justify-between text-primary hover:bg-primary hover:text-white">

    <div className="flex-1">
        <ArrowUpRight className='h-full w-auto'></ArrowUpRight>
    </div>
    <div className="flex-1 flex items-end">
        <h1 className='uppercase w-full text-8xl max-w-full break-all'>Kontaktirajte <br />nas</h1>
    </div>
</div>
        </a>
    </div>
  )
}

export default Signup