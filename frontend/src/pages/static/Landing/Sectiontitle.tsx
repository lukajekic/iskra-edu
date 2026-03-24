import React from 'react'
interface props {
    text: string
}
const Sectiontitle = ({text}:props) => {
  return (
    <h1 className="text-4xl font-bold">{text}</h1>
  )
}

export default Sectiontitle