import React from 'react'

const Maintenance = () => {
  return (
   <>
   <div className="h-screen w-full flex gap-2 justify-between items-center fixed top-0 left-0 p-10">
    <div className='basis-1/2'>
    <img src="/undraw_fixing-bugs_1ytu.svg" alt="" /></div>

    <div className="basis-1/2 flex flex-col gap-2 items-center">
   <h1 className="text-5xl font-bold text-amber-600 text-center">Održavanje portala u toku.</h1>
   <p className="color-gray-700 text-xl mt-5 px-2 text-center">Iskra trenutno nije dostupna. Trudimo se da u najkraćem roku implemeniramo nove i poboljšamo postojeće funkcije.

    <br></br>
    <br></br>
    <strong>Hvala na razumevanju.</strong>
   </p>
   </div>


   </div>

   
   </>
  )
}

export default Maintenance