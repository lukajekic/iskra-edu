import React from 'react'
import Sectiontitle from './Sectiontitle'
import { Button } from '@/components/ui/button'
import { ArrowDown } from 'lucide-react'
import './landingcss.css'
import mockup1 from './assets/mockup1.png'
const WhyIskra = () => {



  return (
 <div className='min-h-screen h-screen max-h-screen p-20 flex flex-col'>
    <Sectiontitle text={'Zasto Iskra?'}></Sectiontitle>
   <div id="flexparent" className="grid grid-cols-3 gap-5 flex-1 min-h-0 mt-10 mb-5">
    <div  className="whycard transition-colors">

        <h1>Pokretanje alata</h1>

        <p>Okruženja za učenje programiranja često se u učionici pokreću dugo i uz brojne konsultacije sa profesorima u vezi sa nepotrebnim opcijama.</p>
    </div>
 <div className="whycard transition-colors">

        <h1>Provera zadataka</h1>

        <p>Iskra olakšava pregled zadataka i učenicima i profesorima. Svojim naprednim sistemom automatskog pregledanja može smanjiti većinu konsultacija sa profesorima i omogućiti učenicima da sami provere svoj zadatak.</p>
    </div> 


     <div className="whycard transition-colors">

        <h1>Uvid u napredak</h1>
<p>
    Profesorima je omogućeno da vide napredak svojih učenika, za vreme jednog školskog časa ili u dužem periodu rada.
</p>
    </div>


</div>
    <a href="#contact" className='self-center'><Button className='h-15 w-15 self-center' variant={'outline'}><ArrowDown className='size-10'></ArrowDown></Button></a>
    </div>  )
}

export default WhyIskra