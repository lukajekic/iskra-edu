import { Undo } from 'lucide-react'
import React from 'react'

const Empty = () => {
  return (
    <div className="w-full flex flex-col items-left">
        <Undo className='size-[150px] text-amber-600' strokeWidth={1}></Undo>
        <div className="flex flex-col items-center gap-2">
            <p className="text-5xl font-bold text-amber-600">
                Izaberite prikaz
            </p>

            <p className="text-xl text-gray-500 text-center">
                Odabirom prikaza se menija na levoj strani, moći ćete upravljati svojim učenicima, nastavnim grupama, zadacima i napredku učenika.
            </p>
        </div>
    </div>
  )
}

export default Empty