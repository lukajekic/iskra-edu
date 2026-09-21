import React from 'react'
import Sectiontitle from './Sectiontitle'
import Reveal from './Reveal'
import mockup1 from './assets/mockup1.png'
import { ArrowDown, Gauge, CheckCircle2, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

const features = [
  { icon: Gauge, label: 'Brzo rešavanje zadataka' },
  { icon: CheckCircle2, label: 'Automatska provera' },
  { icon: Zap, label: 'Trenutna povratna informacija' },
]

const Explainer = () => {
  return (
    <section className='w-full py-12 md:py-20 px-4 md:px-8 box-border max-w-6xl mx-auto flex flex-col gap-8'>
      <Reveal>
        <Sectiontitle text={'Šta je to Iskra?'} />
      </Reveal>

      <Reveal delay={80}>
        <p className="text-base md:text-lg max-w-2xl text-muted-foreground leading-relaxed">
          Iskra je savremena platforma koja unapređuje način na koji učenici rešavaju zadatke i usvajaju programiranje.
          Omogućava brzo rešavanje zadataka, automatsku proveru i trenutnu povratnu informaciju — čineći proces učenja
          jednostavnijim, efikasnijim i znatno zanimljivijim. ⚡
        </p>
      </Reveal>

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

      <Reveal delay={200} className='w-full flex justify-center py-4'>
        <div className="mockup-frame w-full flex justify-center">
          <img 
            src={mockup1} 
            className='max-h-[350px] md:max-h-[420px] object-contain w-auto rounded-xl shadow-md border' 
            alt="Iskra mockup" 
          />
        </div>
      </Reveal>

      <a className='self-center' href="#why">
        <Button className='h-10 w-10 md:h-11 md:w-11 flex items-center justify-center rounded-full' variant={'outline'}>
          <ArrowDown className='size-5 md:size-6'></ArrowDown>
        </Button>
      </a>
    </section>
  )
}

export default Explainer