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
    /* PROMENJENO: Uklonjen min-h-screen, dodatan max-w-6xl i svedeni padinzi */
    <section className='w-full py-12 md:py-16 px-4 md:px-8 box-border max-w-6xl mx-auto flex flex-col gap-6 md:gap-8'>
      <Reveal>
        <Sectiontitle text={'Izveštaj za roditelje'}></Sectiontitle>
      </Reveal>

      {/* PROMENJENO: Prilagođena maksimalna širina (max-w-2xl) i ublažene margine */}
      <Reveal delay={80}>
        <p className="text-base md:text-lg max-w-2xl mt-2 md:mt-4 leading-relaxed text-muted-foreground">
          Roditelji i staratelji mogu, uz saglasnost i prijavu na učenički nalog, u svakom trenutku
          preuzeti potpun izveštaj o aktivnostima svog deteta na Iskri, svaki predati zadatak, svaki
          test i svaka povratna informacija nastavnika i Iskra Judge sistema za ocenjivanje, jasno i pregledno, spremno za štampu. 
        </p>
      </Reveal>

      {/* PROMENJENO: Svedeni chip-ovi sa prirodnijim fontom i paddingom */}
      <Reveal delay={140}>
        <div className="flex flex-wrap gap-2.5">
          {features.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="feature-chip flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs md:text-sm font-medium bg-background shadow-sm"
            >
              <Icon className="size-4 text-primary" />
              {label}
            </div>
          ))}
        </div>
      </Reveal>

      {/* PROMENJENO: Uklonjen flex-1, sređene dimenzije ilustracije i pading oko nje */}
      <Reveal delay={200} className='w-full my-2 md:my-4'>
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12 rounded-xl border bg-card/30 p-6 md:p-8">
          <div className="mockup-frame w-full md:w-1/2 flex items-center justify-center p-2">
            <img
              src="/undraw_progress-overview_wl8n.svg"
              className='w-full max-w-[240px] md:max-w-[280px] max-h-[220px] object-contain'
              alt="Ilustracija pregleda napretka učenika"
            />
          </div>

          {/* PROMENJENO: Sređene dimenzije dugmeta na umereni h-11 i prelom teksta */}
          <div className="w-full md:w-1/2 flex flex-col items-center md:items-start gap-4 text-center md:text-left">
            <p className="text-sm md:text-base text-muted-foreground max-w-sm">
              Izveštaj je dostupan u svakom trenutku. Preuzimanje podataka moguće je klikom na dugme ispod.
            </p>
            <Link to="/app/parent/report">
              <Button size={'default'} className='gap-2 h-11 px-6 text-sm md:text-base rounded-full shadow-md hover:shadow-lg transition-shadow'>
                <ArrowUpRight className='size-4 md:size-5' />
                Preuzmite izveštaj
              </Button>
            </Link>
          </div>
        </div>
      </Reveal>

      {/* PROMENJENO: Normalizovane dimenzije skrol dugmeta */}
      <a className='self-center mt-2' href="#apps">
        <Button className='h-10 w-10 md:h-11 md:w-11 flex items-center justify-center rounded-full' variant={'outline'}>
          <ArrowDown className='size-5 md:size-6'></ArrowDown>
        </Button>
      </a>
    </section>
  )
}

export default ParentReportSection