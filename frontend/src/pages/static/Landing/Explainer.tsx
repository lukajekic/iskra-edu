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
    <div className='min-h-screen w-full py-12 px-6 md:p-20 flex flex-col justify-between gap-8 box-border'>
      <Reveal>
        <Sectiontitle text={'Sta je to Iskra?'}></Sectiontitle>
      </Reveal>

      <Reveal delay={80}>
        <p className="text-lg md:text-xl w-full md:w-1/2 mt-4 md:mt-10 leading-relaxed">
          Iskra je savremena platforma koja unapređuje način na koji učenici rešavaju zadatke i usvajaju programiranje.
          Omogućava brzo rešavanje zadataka, automatsku proveru i trenutnu povratnu informaciju — čineći proces učenja
          jednostavnijim, efikasnijim i znatno zanimljivijim. ⚡
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

      <Reveal delay={200} className='flex-1 w-full flex items-center justify-center min-h-[250px] md:min-h-0'>
        <div className="mockup-frame w-full h-full flex items-center justify-center">
          <img src={mockup1} className='max-h-[50vh] md:max-h-full object-contain w-full rounded-xl' alt="" />
        </div>
      </Reveal>

      <a className='self-center mt-4' href="#why">
        <Button className='h-12 w-12 md:h-15 md:w-15 flex items-center justify-center rounded-full' variant={'outline'}>
          <ArrowDown className='size-6 md:size-10'></ArrowDown>
        </Button>
      </a>
    </div>
  )
}

export default Explainer
