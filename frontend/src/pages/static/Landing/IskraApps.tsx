import React from 'react'
import Sectiontitle from './Sectiontitle'
import Reveal from './Reveal'
import { Button } from '@/components/ui/button'
import { ArrowDown, Code2, LayoutDashboard, NotebookPen, Terminal } from 'lucide-react' // IZMENA: Novi ikone za aplikacije
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
    <div className='min-h-screen w-full py-12 px-6 md:p-20 flex flex-col justify-between gap-8 box-border'>
      <Reveal>
        <Sectiontitle text={'Iskra Aplikacije'}></Sectiontitle> 
      </Reveal>

      <div id="flexparent" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 flex-1 min-h-0 mt-6 md:mt-10 mb-5 auto-rows-fr">
        {apps.map(({ icon: Icon, title, tag, text }, i) => ( // IZMENA: Destrukturisan 'tag'
          <Reveal key={title} delay={i * 100} className="h-full">
            <div className="whycard p-8 rounded-xl border h-full flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:text-white">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="whycard-icon flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5">
                    <Icon className="size-6 text-primary" />
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full border bg-muted/50 text-muted-foreground">
                    {tag}
                  </span>
                </div>
                <h1 className="text-2xl font-bold mb-3 tracking-tight">{title}</h1>
                <p className="text-sm md:text-base leading-relaxed text-muted-foreground">{text}</p>
              </div>
              
              
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

export default IskraApps