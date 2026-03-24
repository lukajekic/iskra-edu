import React from 'react'
import Sectiontitle from './Sectiontitle'
import mockup1 from './assets/mockup1.png'
import { ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
const Explainer = () => {
  return (
    <div className='min-h-screen max-h-screen p-20 flex flex-col'>
    <Sectiontitle text={'Sta je to Iskra?'}></Sectiontitle>
    <p className="text-xl w-1/2 mt-10">Iskra je savremena platforma koja unapređuje način na koji učenici rešavaju zadatke i usvajaju programiranje. Omogućava brzo rešavanje zadataka, automatsku proveru i trenutnu povratnu informaciju — čineći proces učenja jednostavnijim, efikasnijim i znatno zanimljivijim. ⚡</p>
    <img src={mockup1} className='flex-1 min-h-0 object-contain w-full' alt="" />
    <a className='self-center' href="#why"><Button className='h-15 w-15 self-center' variant={'outline'}><ArrowDown className='size-10'></ArrowDown></Button></a>
    </div>
  )
}

export default Explainer