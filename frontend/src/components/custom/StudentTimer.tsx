import React, { useEffect, useState } from 'react'
import Countdown, { zeroPad } from 'react-countdown';
import { Dialog, DialogContent } from '../ui/dialog';
interface props {
    date: string
}
interface renderer {
    hours: number,
    minutes: number,
    seconds: number,
    completed: boolean
}
const renderer = ({ hours, minutes, seconds, completed }: renderer) => {
  if (completed) {
    return <span>Vreme je isteklo!</span>;
  } else {
    return (
      <span>
        Jednokratna prijava: {zeroPad(minutes)}:{zeroPad(seconds)}
      </span>
    );
  }
};



const StudentTimer = ({date}:props) => {
    const [openAlert, setOpenAlert] = useState(false)
    const alertUser = ()=>{
    const redirecttimer = setTimeout(() => {
        location.href = '/auth/onboarding'
    }, 15000)

    setOpenAlert(true)
}

  return (
    <>
    <Countdown date={new Date(date)} renderer={renderer} onComplete={alertUser}>

    </Countdown>


    <Dialog open={openAlert} >
        <DialogContent showCloseButton={false}>
          <div className="flex flex-col gap-2 items-center">
            <img src="/timeout.png" className='size-[100px]' alt="" />
            <p className="text-xl text-center font-bold">Vreme za rad je isteklo, konsultuj se sa profesorom za dodatno vreme za rad.</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default StudentTimer