import { Undo } from 'lucide-react'
import React from 'react'

const EmptyStudents = () => {
  return (
    <div className="w-full flex flex-col items-left">
        <Undo className='rotate-20 size-[150px] text-amber-600 -scale-y-100 md:scale-y-100' strokeWidth={1}></Undo>
        <div className="flex flex-col items-center gap-2">
            <p className="text-5xl font-bold text-amber-600">
                Izaberi folder
            </p>

            <p className="text-xl text-gray-500 text-center">
                Kada izabereš folder sa zadacima, otvoriće ti se prikaz zadataka u tom folderu, kada izabereš zadatak, videćeš instrukcije zadatka i prozor za programiranje.
            </p>
        </div>
    </div>
  )
}

export default EmptyStudents