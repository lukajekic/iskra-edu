import React from 'react'
import { Separator } from '../ui/separator'
import LoaderModal from './LoaderModal'
import Loader from './Loader'
import { toast } from 'sonner'
import { Button } from '../ui/button'
interface props {
    title: string,
    subtitle?: string
}
const PageTitle = ({title, subtitle}:props) => {
 
  return (
    <div className="flex flex-col gap-2 w-full">
        <h1 className="text-3xl font-bold">{title}</h1>
        <Separator className='w-full'></Separator>
        <p>{subtitle}</p>
    </div>
  )
}

export default PageTitle