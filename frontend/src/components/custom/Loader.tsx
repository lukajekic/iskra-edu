import React from 'react'
import { Spinner } from '../ui/spinner'
interface props {
    small?: boolean
}
const Loader = ({small}:props) => {
  return (
    <Spinner className={`${small ? "size-5" : "size-8"}`} />

  )
}

export default Loader