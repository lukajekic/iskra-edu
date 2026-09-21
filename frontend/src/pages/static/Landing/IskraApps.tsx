import React from 'react'
import Sectiontitle from './Sectiontitle'
import Reveal from './Reveal'
import { Button } from '@/components/ui/button'
import { ArrowDown, Code2, LayoutDashboard, NotebookPen, Terminal } from 'lucide-react'
import './landingcss.css'

const apps = [
  {
    icon: Code2,
    title: 'Iskra LMS',
    tag: 'Za učenike i profesore',
    text: 'Svestrana platforma za profesore i učenike sa automatskim pregledom koda, pregledanjem kontrolnih zadataka,...',
  },
  {
    icon: NotebookPen,
    title: 'Iskra Planner',
    tag: 'Za profesore',
    text: 'Snažan modul za brzo i jednostavno kreiranje i organizaciju nastavnih planova i ideja za kvalitetnije časove.',
  },
  {
    icon: LayoutDashboard,
    title: 'Iskra Canvas',
    tag: 'Za učenike i profesore',
    text: 'Unesite osnovne podatke o željenoj temi i pošaljite na obradu. Za pet sekundi, pred Vama je interaktivna mapa uma za tu temu.',
  },
]

const IskraApps = () => {
  return (
    /* PROMENJENO: Uklonjen min-h-screen, dodatan max-w-6xl i svedeni padinzi */
    <section id="apps" className='w-full py-12 md:py-16 px-4 md:px-8 box-border max-w-6xl mx-auto flex flex-col gap-6 md:gap-8'>
      <Reveal>
        <Sectiontitle text={'Iskra Aplikacije'}></Sectiontitle> 
      </Reveal>

      {/* PROMENJENO: Izbačeni flex-1, min-h-0 i ublažene gornje i donje margine */}
      <div id="flexparent" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-2 md:mt-4 auto-rows-fr">
        {apps.map(({ icon: Icon, title, tag, text }, i) => (
          <Reveal key={title} delay={i * 100} className="h-full">
            {/* PROMENJENO: Umereniji p-6/p-7, sklanjanje hover:text-white i uvođenje suptilnog transform/shadow hover efekta */}
            <div className="whycard p-6 rounded-xl border bg-card/40 h-full flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div>
                <div className="flex items-center justify-between mb-4">
                  {/* PROMENJENO: Smanjen okvir ikone na h-10 w-10 */}
                  <div className="whycard-icon flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full border bg-muted/60 text-muted-foreground">
                    {tag}
                  </span>
                </div>
                {/* PROMENJENO: h1 zamenjen sa h3 (text-xl font-semibold) */}
                <h3 className="text-xl font-semibold mb-2 tracking-tight">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* PROMENJENO: Normalizovano dugme za skrol */}
      <a href="#contact" className='self-center mt-2'>
        <Button className='h-10 w-10 md:h-11 md:w-11 flex items-center justify-center rounded-full' variant={'outline'}>
          <ArrowDown className='size-5 md:size-6'></ArrowDown>
        </Button>
      </a>
    </section>
  )
}

export default IskraApps