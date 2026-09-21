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
    /* PROMENJENO: Uklonjen min-h-screen, dodatan max-w-6xl i svedeni padinzi */
    <section className='w-full py-12 md:py-16 px-4 md:px-8 box-border max-w-6xl mx-auto flex flex-col gap-6 md:gap-8'>
      <Reveal>
        <Sectiontitle text={'Zašto Iskra?'}></Sectiontitle>
      </Reveal>

      {/* PROMENJENO: Izbačeni flex-1, min-h-0 i ublažene margine */}
      <div id="flexparent" className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-2 md:mt-4">
        {cards.map(({ icon: Icon, title, text }, i) => (
          <Reveal key={title} delay={i * 100} className="h-full">
            {/* PROMENJENO: Zamenjen p-6 sa p-5, h1 zamenjen sa h3 i zategnute margine */}
            <div className="whycard p-5 rounded-xl border bg-card/40 h-full flex flex-col justify-between">
              <div>
                <div className="whycard-icon mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* PROMENJENO: Smanjene dimenzije dugmeta na umereniju veličinu */}
      <a href="#parent-report" className='self-center mt-2'>
        <Button className='h-10 w-10 md:h-11 md:w-11 flex items-center justify-center rounded-full' variant={'outline'}>
          <ArrowDown className='size-5 md:size-6'></ArrowDown>
        </Button>
      </a>
    </section>
  )
}

export default WhyIskra