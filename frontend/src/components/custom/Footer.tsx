import React from 'react'
import { Button } from '../ui/button'

const Footer = () => {
  return (
    <div className='py-5 px-10 w-full border-t border-t-[#cecece]/20 flex justify-between'>
        <span>Edukativni materijali objavjeni su od strane profesora i njihov sadržaj nije kontrolisan. Prijava na portal podrazumeva slaganje sa <a target='_blank' href="/legal/privacy" className='link'>politikom privatnosti</a> i <a target='_blank' className='link' href="/legal/terms">uslovima upotrebe</a>.</span>
        {/* <Button variant={'outline'} className='border-amber-600 text-amber-600'>O portalu</Button> */}
    </div>
  )
}

export default Footer