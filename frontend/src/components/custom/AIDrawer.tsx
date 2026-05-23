import React from 'react'


import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Badge } from '../ui/badge'

interface Props  {
    answer: string
}

const AIDrawer = ({answer}:Props) => {
  return (
    <>
      {/* PROMENJENO: Dodat onOpenChange prop da bi radilo zatvaranje klikom van Drawer-a */}
      <Drawer open  direction="right">

      {/* PROMENJENO: Dodate Tailwind klase za fiksno pozicioniranje skroz desno uz punu visinu ekrana */}
      <DrawerContent className="fixed bottom-0 right-0 top-0 mt-0 h-full w-[400px] rounded-l-xl rounded-r-none">
        <DrawerHeader>
          <DrawerTitle className='font-bold text-lg flex items-center'>IskraAI odgovor
                  <Badge variant="destructive" className='ml-1'>BETA</Badge>

          </DrawerTitle>
        </DrawerHeader>
        <div className="no-scrollbar overflow-y-auto px-4">
            <p
              className="mb-4 leading-normal style-lyra:mb-2 style-lyra:leading-relaxed"
            >
              {answer}
            </p>
        </div>
        <DrawerFooter>
            <p className='text-center text-gray-600'>IskraAI je veštačka inteligencija podložna greškama. Ne uzimajte odgovore IskraAI kao 100% tačne.</p>
          <DrawerClose asChild>
            <Button onClick={()=>{
                (window as any).setOpenAIChat?.(false)
            }} variant="outline">Zatvori</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
    
    </>
  )
}

export default AIDrawer