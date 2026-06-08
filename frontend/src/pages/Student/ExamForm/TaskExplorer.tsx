import PageTitle from '@/components/custom/PageTitle'
import React from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
const TaskExplorer = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  return (
    <div className='w-full p-5'>
        <p className="text-2xl font-bold border-b-1 pb-2 mb-2">Zadaci</p>
        <p className="text-lg font-semibold">Teorijski zadaci</p>

        {Array.from({length: 5}).map((item, index)=>(

          <HoverCard openDelay={250} closeDelay={100}>
      <HoverCardTrigger asChild>
        <div onClick={()=>{setSearchParams({task: index.toString()})}} className="p-2 border-b-1 flex items-center gap-2 hover:bg-gray-100 hover:shadow">
          <div id="dot-status" className="w-5 h-5 rounded-[50%] bg-gray-700"></div>
          <span>Naziv zadatka</span>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="flex w-64 flex-col gap-0.5 rounded-none">
        <div className="absolute -top-2 left-6 h-4 w-4 rotate-45 border-l border-t bg-popover" />
        <div className="font-semibold text-lg">Naziv zadatka</div>
        <div><span className="font-bold text-gray-700">Maks. poena:</span> <span className='font-bold text-gray-600'>20</span></div>
        <hr />
        

        <div 
  className="mt-1 text-xs text-muted-foreground line-clamp-3 overflow-hidden" 
  dangerouslySetInnerHTML={{
    __html: `<p class="inline">Zdravo, <strong>ovo</strong> je veoma dugačak opis <span style="text-decoration: underline;">nekog</span> kompleksnog <em>zadatka</em> koji sadrži mnogo detaljnih informacija. Cilj ovog teksta je da simulira realan scenario gde korisnik unosi opširan opis kroz Rich Text Editor, a mi u UI-ju moramo da ga prikažemo kompaktno. Ako tekst pređe tri linije, Tailwind-ov line-clamp će se pobrinuti da se automatski dodaju tri tačke na kraju i da dizajn ostane čist, bez obzira na to koliko još teksta ovde napisali.</p>`
  }}
/>


      </HoverCardContent>
    </HoverCard>
          
        ))}


        <p className="text-lg font-semibold mt-5">Praktični zadaci</p>

        {Array.from({length: 5}).map((item, index)=>(
          <div className="p-2 border-b-1 flex items-center gap-2 hover:bg-gray-100 hover:shadow">
          <div id="dot-status" className="w-5 h-5 rounded-[50%] bg-gray-700"></div>
          <span>Naziv zadatka</span>
        </div>
        ))}


    </div>
  )
}

export default TaskExplorer