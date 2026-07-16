import React from 'react'
import Sectiontitle from './Sectiontitle'
import Reveal from './Reveal'
import { Button } from '@/components/ui/button'
import { ArrowDown, Rocket, CheckCircle2, TrendingUp } from 'lucide-react'
import './landingcss.css'
import mockup1 from './assets/mockup1.png'

const cards = [
  {
    icon: Rocket,
    title: 'Pokretanje alata',
    text: 'Okruženja za učenje programiranja često se u učionici pokreću dugo i uz brojne konsultacije sa profesorima u vezi sa nepotrebnim opcijama.',
  },
  {
    icon: CheckCircle2,
    title: 'Provera zadataka',
    text: 'Iskra olakšava pregled zadataka i učenicima i profesorima. Svojim naprednim sistemom automatskog pregledanja može smanjiti većinu konsultacija sa profesorima i omogućiti učenicima da sami provere svoj zadatak.',
  },
  {
    icon: TrendingUp,
    title: 'Uvid u napredak',
    text: 'Profesorima je omogućeno da vide napredak svojih učenika, za vreme jednog školskog časa ili u dužem periodu rada.',
  },
]

const WhyIskra = () => {
  return (
    <div className='min-h-screen w-full py-12 px-6 md:p-20 flex flex-col justify-between gap-8 box-border'>
      <Reveal>
        <Sectiontitle text={'Zasto Iskra?'}></Sectiontitle>
      </Reveal>

      <div id="flexparent" className="grid grid-cols-1 md:grid-cols-3 gap-5 flex-1 min-h-0 mt-6 md:mt-10 mb-5">
        {cards.map(({ icon: Icon, title, text }, i) => (
          <Reveal key={title} delay={i * 100} className="h-full">
            <div className="whycard p-6 rounded-lg border h-full">
              <div>
                <div className="whycard-icon mb-4 flex h-11 w-11 items-center justify-center rounded-full">
                  <Icon className="size-5" />
                </div>
                <h1 className="text-xl font-semibold mb-3">{title}</h1>
              </div>
              <p className="text-sm md:text-base leading-relaxed">{text}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <a href="#contact" className='self-center mt-4'>
        <Button className='h-12 w-12 md:h-15 md:w-15 flex items-center justify-center rounded-full' variant={'outline'}>
          <ArrowDown className='size-6 md:size-10'></ArrowDown>
        </Button>
      </a>
    </div>
  )
}

export default WhyIskra
