import React from 'react'
import { Dialog, DialogContent } from '../ui/dialog'
import { LoaderIcon } from 'lucide-react'


interface props {
    open: boolean
}
const LoaderModal = ({open}:props) => {
  return (
    <Dialog open={open} >
        <DialogContent  showCloseButton={false} className='min-w-fit w-fit max-w-fit min-h-fit'>
            <LoaderIcon
      role="status"
      aria-label="Loading"
      className={"size-7 animate-spin text-amber-600"}
    />
        </DialogContent>
    </Dialog>
  )
}

export default LoaderModal