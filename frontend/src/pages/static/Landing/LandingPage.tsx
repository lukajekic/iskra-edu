import { Button } from '@/components/ui/button'
import './landingcss.css'

import React from 'react'
import { ArrowUpRight } from 'lucide-react'
import axios from 'axios'
import Explainer from './Explainer'
import WhyIskra from './WhyIskra'
import Signup from './Signup'

const LandingPage = () => {

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
    <section id="hero" className="hero pattern-bg">
        <img src="/favicon.png" className='h-[75px] -mt-20' alt="" />
        <h1 className="text-8xl text-primary font-semibold">Zdravo, Iskra.</h1>
        <div id="actions">
            <Button onClick={()=>{hadleRedirect()}} size={'lg'}><ArrowUpRight></ArrowUpRight>Pristupi platformi</Button>
            <a href="#explainer"><Button  size={'lg'} variant={'outline'}>Saznaj vise</Button></a>
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