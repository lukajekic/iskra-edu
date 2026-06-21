import React from 'react'
import Sectiontitle from './Sectiontitle'
import { Button } from '@/components/ui/button'
import { ArrowDown } from 'lucide-react'
import './landingcss.css'
import mockup1 from './assets/mockup1.png'

const WhyIskra = () => {
  return (
    <div className='min-h-screen w-full py-12 px-6 md:p-20 flex flex-col justify-between gap-8 box-border'>
      <Sectiontitle text={'Zasto Iskra?'}></Sectiontitle>
      
      <div id="flexparent" className="grid grid-cols-1 md:grid-cols-3 gap-5 flex-1 min-h-0 mt-6 md:mt-10 mb-5">
        <div className="whycard transition-colors p-6 rounded-lg border">
          <h1 className="text-xl font-semibold mb-3">Pokretanje alata</h1>
          <p className="text-sm md:text-base leading-relaxed">
            Okruženja za učenje programiranja često se u učionici pokreću dugo i uz brojne konsultacije sa profesorima u vezi sa nepotrebnim opcijama.
          </p>
        </div>

        <div className="whycard transition-colors p-6 rounded-lg border">
          <h1 className="text-xl font-semibold mb-3">Provera zadataka</h1>
          <p className="text-sm md:text-base leading-relaxed">
            Iskra olakšava pregled zadataka i učenicima i profesorima. Svojim naprednim sistemom automatskog pregledanja može smanjiti većinu konsultacija sa profesorima i omogućiti učenicima da sami provere svoj zadatak.
          </p>
        </div> 

        <div className="whycard transition-colors p-6 rounded-lg border">
          <h1 className="text-xl font-semibold mb-3">Uvid u napredak</h1>
          <p className="text-sm md:text-base leading-relaxed">
            Profesorima je omogućeno da vide napredak svojih učenika, za vreme jednog školskog časa ili u dužem periodu rada.
          </p>
        </div>
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