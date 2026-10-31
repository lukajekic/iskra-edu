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
import ParentReportSection from './ParentReportSection'
import InvestorSection from './Investors'
import { useSeasonalTheme } from './useSeasonalTheme'
import Snowfall from './custom/Snowfall'
const LandingPage = () => {

  const theme = useSeasonalTheme()



  useEffect(()=>{
    CreateMetricaView(import.meta.env.VITE_METRICA)
  }, [])

  const [longLoading, setLongLoading] = useState(false);

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
  // typing je gotov kad se ispiše poslednja reč ("Iskra.")
const isDone =
  currentWordIndex === words.length - 1 &&
  currentText === words[words.length - 1]

  const handleRedirect = async()=>{
    const longLoadingTimer = setTimeout(() => {
        setLongLoading(true);
      }, 1000);
    try {
      setBtnLoading(true)
      
      const response = await axios.get(`${import.meta.env.VITE_BACKEND}/user/me/redirect`)
      if (response.data) {
        setBtnLoading(false)
        clearTimeout(longLoadingTimer) // PROMENJENO: clearTimeout umesto clearInterval
        setLongLoading(false)
        location.href = response.data.redirect
        
      }
    } catch (error) {
      console.error(error)
      clearTimeout(longLoadingTimer) // PROMENJENO: clearTimeout umesto clearInterval
      setLongLoading(false)
      setBtnLoading(false)
    }
  }

  return (
  <div data-theme={theme}>
    <section
      id="hero"
      className="hero pattern-bg min-h-screen w-full flex flex-col items-center justify-center p-4 text-center box-border relative overflow-hidden"
    >
      {theme === 'winter' && <Snowfall />}

      <div className="relative z-10 flex flex-col items-center gap-[25px]">
        <img src="/favicon.png" className="h-[75px] mb-6" alt="" />

        <h1 className="text-5xl md:text-8xl text-primary font-semibold mb-8 h-[60px] md:h-[110px]">
          Zdravo,{' '}
          <span className="typing-pill" data-typing={!isDone}>
            <span className="typing-text transition-all duration-300">{currentText}</span>
          </span>
          {currentWordIndex !== words.length - 1 && (
            <span className="animate-pulse font-light text-muted-foreground">|</span>
          )}
        </h1>

        <div id="actions" className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md">
          <Button disabled={btnLoading} className="w-full sm:w-auto" onClick={() => { handleRedirect() }} size={'lg'}>
            {btnLoading ? (<><Loader small></Loader>{longLoading && ("Pokretanje platforme u toku...")}</>) : (<><ArrowUpRight />Pristupi platformi</>)}
          </Button>
          <a href="#explainer" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto" size={'lg'} variant={'outline'}>Saznaj vise</Button>
          </a>
        </div>
      </div>
    </section>

    {/* ostale sekcije ostaju iste */}
    <section id='explainer'><Explainer></Explainer></section>
    <section id='why'><WhyIskra></WhyIskra></section>
    <section id='parent-report'><ParentReportSection></ParentReportSection></section>
    <section id='apps'><IskraApps></IskraApps></section>
    <section id="contact"><Signup></Signup></section>
    <section><InvestorSection></InvestorSection></section>
  </div>
)
}

export default LandingPage