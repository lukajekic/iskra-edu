import React from 'react'
import Sectiontitle from './Sectiontitle'
import Reveal from './Reveal'
import { Button } from '@/components/ui/button'
import { Download, Trophy, TrendingUp, Landmark } from 'lucide-react'

const highlights = [
  { icon: Trophy, label: 'Vukobratovićevi dani robotike (Nov 2026)' },
  { icon: Landmark, label: 'Startup takmičenje i pitching' },
  { icon: TrendingUp, label: 'Projekcije rasta i finansijski model' },
]

const InvestorSection = () => {
  return (
    <section id="investors" className='w-full py-12 md:py-16 px-4 md:px-8 box-border max-w-6xl mx-auto flex flex-col gap-6 md:gap-8'>
      <Reveal>
        <Sectiontitle text={'Za investitore'} />
      </Reveal>

      <Reveal delay={80}>
        <p className="text-base md:text-lg max-w-2xl mt-2 md:mt-4 leading-relaxed text-muted-foreground">
          Iskra aktivno razvija svoj poslovni i održivi model usmeren ka modernizaciji obrazovanja. 
          Ponosno objavljujemo da će Iskra biti deo startup takmičenja u okviru održavanja 
          <strong className="text-foreground font-semibold"> Vukobratovićevih dana robotike u novembru 2026. godine</strong>.
        </p>
      </Reveal>

    

      <Reveal delay={200} className='w-full my-2 md:my-4'>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 rounded-xl border bg-card/30 p-6 md:p-8">
          <div className="flex flex-col gap-1 max-w-md">
            <h3 className="text-lg font-semibold tracking-tight">Finansijski izveštaj</h3>
            <p className="text-sm text-muted-foreground">
              Preuzmite trenutni primerak finansijskog izveštaja i pregledajte projekcije poslovanja platforme.
            </p>
          </div>

          <a 
            href="/finansijski-izvestaj.pdf" 
            download="Iskra_Finansijski_Izvestaj.pdf" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button size={'default'} className='gap-2 h-11 px-6 text-sm md:text-base rounded-full shadow-md hover:shadow-lg transition-shadow whitespace-nowrap'>
              <Download className='size-4 md:size-5' />
              Preuzmite izveštaj (PDF)
            </Button>
          </a>
        </div>
      </Reveal>
    </section>
  )
}

export default InvestorSection