import React from 'react'
import { Link } from 'react-router-dom'
import Sectiontitle from './Sectiontitle'
import Reveal from './Reveal'
import { ArrowDown, ArrowUpRight, FileCheck2, ShieldCheck, FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import './landingcss.css'

const features = [
  { icon: FileCheck2, label: 'Detaljan uvid u svaki zadatak i test' },
  { icon: ShieldCheck, label: 'Bezbedno, uz saglasnost roditelja' },
  { icon: FileDown, label: 'Izvoz u PDF za trenutak' },
]

const ParentReportSection = () => {
  return (
    <div className='min-h-screen w-full py-12 px-6 md:p-20 flex flex-col justify-between gap-8 box-border'>
      <Reveal>
        <Sectiontitle text={'Izveštaj za roditelje'}></Sectiontitle>
      </Reveal>

      <Reveal delay={80}>
        <p className="text-lg md:text-xl w-full md:w-1/2 mt-4 md:mt-10 leading-relaxed">
          Roditelji i staratelji mogu, uz saglasnost i prijavu na učenički nalog, u svakom trenutku
          preuzeti potpun izveštaj o aktivnostima svog deteta na Iskri, svaki predati zadatak, svaki
          test i svaka povratna informacija nastavnika i Iskra Judge sistema za ocenjivanje, jasno i pregledno, spremno za štampu. 
        </p>
      </Reveal>

      <Reveal delay={140}>
        <div className="flex flex-wrap gap-3 md:gap-4">
          {features.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="feature-chip flex items-center gap-2 rounded-full border px-4 py-2 text-sm md:text-base"
            >
              <Icon className="size-4 text-primary" />
              {label}
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={200} className='flex-1 w-full'>
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 h-full">
          <div className="mockup-frame w-full md:w-1/2 flex items-center justify-center p-8 md:p-10">
            <img
              src="/undraw_progress-overview_wl8n.svg"
              className='w-full max-w-[280px] md:max-w-[320px] object-contain'
              alt="Ilustracija pregleda napretka učenika"
            />
          </div>

          <div className="w-full md:w-1/2 flex flex-col items-center md:items-start gap-4 text-center md:text-left">
            <p className="text-sm md:text-base text-muted-foreground max-w-sm">
              Izveštaj je dostupan u svakom trenutku. Preuzimanje podataka moguće je klikom na dugme ispod.
            </p>
            <Link to="/app/parent/report">
              <Button size={'lg'} className='gap-2 h-14 px-8 text-base md:text-lg rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow'>
                <ArrowUpRight className='size-5' />
                Preuzmite izveštaj
              </Button>
            </Link>
          </div>
        </div>
      </Reveal>

      <a className='self-center mt-4' href="#apps">
        <Button className='h-12 w-12 md:h-15 md:w-15 flex items-center justify-center rounded-full' variant={'outline'}>
          <ArrowDown className='size-6 md:size-10'></ArrowDown>
        </Button>
      </a>
    </div>
  )
}

export default ParentReportSection
