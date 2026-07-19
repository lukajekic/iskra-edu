import { Button } from '@/components/ui/button'
import './landingcss.css'
import { CreateMetricaView } from '@lukajekic/metrica-sdk'

import { useEffect, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import axios from 'axios'
import Explainer from './Explainer'
import WhyIskra from './WhyIskra'
import Signup from './Signup'
import Loader from '@/components/custom/Loader';
import IskraApps from './IskraApps'

const LandingPage = () => {

  useEffect(()=>{
    CreateMetricaView(import.meta.env.VITE_METRICA)
  }, [])

  const [btnLoading, setBtnLoading] = useState(false)

  const words = ["svete.", "obrazovanju.", "budućnosti.", "Iskra."]
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentText, setCurrentText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [typingSpeed, setTypingSpeed] = useState(150)

  useEffect(() => {
    let timer;
    const fullWord = words[currentWordIndex];

    if (!isDeleting) {
      timer = setTimeout(() => {
        setCurrentText(fullWord.substring(0, currentText.length + 1));
      }, typingSpeed);

      if (currentText === fullWord) {
        if (currentWordIndex === words.length - 1) {
          return;
        }
        timer = setTimeout(() => setIsDeleting(true), 1200);
      }
    } else {
      timer = setTimeout(() => {
        setCurrentText(fullWord.substring(0, currentText.length - 1));
      }, 75);

      if (currentText === "") {
        setIsDeleting(false);
        setCurrentWordIndex((prev) => prev + 1);
      }
    }

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentWordIndex]);

  const hadleRedirect = async()=>{
    try {
      setBtnLoading(true)
      const response = await axios.get(`${import.meta.env.VITE_BACKEND}/user/me/redirect`)
      if (response.data) {
        setBtnLoading(false)
        location.href = response.data.redirect
      }
    } catch (error) {
      console.error(error)
      setBtnLoading(false)
    }
  }

  return (
    <>
    <section id="hero" className="hero pattern-bg min-h-screen w-full flex flex-col items-center justify-center p-4 text-center box-border">
        <img src="/favicon.png" className='h-[75px] mb-6' alt="" />
        <h1 className="text-5xl md:text-8xl text-primary font-semibold mb-8 h-[60px] md:h-[110px]">
            Zdravo, <span className="transition-all duration-300">{currentText}</span>
            {currentWordIndex !== words.length - 1 && (
              <span className="animate-pulse font-light text-muted-foreground">|</span>
            )}
        </h1>
        <div id="actions" className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md">
            <Button disabled={btnLoading} className="w-full sm:w-auto" onClick={()=>{hadleRedirect()}} size={'lg'}>{
              btnLoading ? (<Loader small></Loader>) : (<><ArrowUpRight/>Pristupi platformi</>)
              }</Button>
            <a href="#explainer" className="w-full sm:w-auto"><Button className="w-full sm:w-auto" size={'lg'} variant={'outline'}>Saznaj vise</Button></a>
        </div>
    </section>

    <section id='explainer'>
        <Explainer></Explainer>
    </section>

    <section id='why'>
        <WhyIskra></WhyIskra>
    </section>

    <section id='apps'>
      <IskraApps></IskraApps>
    </section>

    <section id="contact">
        <Signup></Signup>
    </section>
    </>
  )
}

export default LandingPage