import { Button } from '@/components/ui/button'
import './landingcss.css'
import { CreateMetricaView } from "@lukajekic/metrica-sdk";

import React, { useEffect } from 'react'
import { ArrowUpRight } from 'lucide-react'
import axios from 'axios'
import Explainer from './Explainer'
import WhyIskra from './WhyIskra'
import Signup from './Signup'

const LandingPage = () => {

  useEffect(()=>{
    CreateMetricaView(import.meta.env.VITE_METRICA)
  }, [])

  const hadleRedirect = async()=>{
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND}/user/me/redirect`)
      if (response.data) {
        location.href = response.data.redirect
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
    <section id="hero" className="hero pattern-bg min-h-screen w-full flex flex-col items-center justify-center p-4 text-center box-border">
        <img src="/favicon.png" className='h-[75px] mb-6' alt="" />
        <h1 className="text-5xl md:text-8xl text-primary font-semibold mb-8">Zdravo, Iskra.</h1>
        <div id="actions" className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md">
            <Button className="w-full sm:w-auto" onClick={()=>{hadleRedirect()}} size={'lg'}><ArrowUpRight></ArrowUpRight>Pristupi platformi</Button>
            <a href="#explainer" className="w-full sm:w-auto"><Button className="w-full sm:w-auto" size={'lg'} variant={'outline'}>Saznaj vise</Button></a>
        </div>
    </section>

    <section id='explainer'>
        <Explainer></Explainer>
    </section>

    <section id='why'>
        <WhyIskra></WhyIskra>
    </section>

    <section id="contact">
        <Signup></Signup>
    </section>
    </>
  )
}

export default LandingPage