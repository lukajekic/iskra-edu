import React from 'react'
import Sectiontitle from './Sectiontitle'
import mockup1 from './assets/mockup1.png'
import { ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

const Explainer = () => {
  return (
    <div className='min-h-screen w-full py-12 px-6 md:p-20 flex flex-col justify-between gap-8 box-border'>
      <Sectiontitle text={'Sta je to Iskra?'}></Sectiontitle>
      
      <p className="text-lg md:text-xl w-full md:w-1/2 mt-4 md:mt-10 leading-relaxed">
        Iskra je savremena platforma koja unapređuje način na koji učenici rešavaju zadatke i usvajaju programiranje. 
        Omogućava brzo rešavanje zadataka, automatsku proveru i trenutnu povratnu informaciju — čineći proces učenja 
        jednostavnijim, efikasnijim i znatno zanimljivijim. ⚡
      </p>
      
      <div className='flex-1 w-full flex items-center justify-center min-h-[250px] md:min-h-0'>
        <img src={mockup1} className='max-h-[50vh] md:max-h-full object-contain w-full' alt="" />
      </div>
      
      <a className='self-center mt-4' href="#why">
        <Button className='h-12 w-12 md:h-15 md:w-15 flex items-center justify-center rounded-full' variant={'outline'}>
          <ArrowDown className='size-6 md:size-10'></ArrowDown>
        </Button>
      </a>
    </div>
  )
}

export default Explainer