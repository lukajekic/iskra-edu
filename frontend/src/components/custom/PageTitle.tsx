import React from 'react'
import { Separator } from '../ui/separator'
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