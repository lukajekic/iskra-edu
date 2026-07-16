import React from 'react'
interface props {
    text: string
}
const Sectiontitle = ({text}:props) => {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-4xl font-bold">{text}</h1>
      <span className="block h-1 w-16 rounded-full bg-primary"></span>
    </div>
  )
}

export default Sectiontitle
