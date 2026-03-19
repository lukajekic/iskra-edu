import React, { useEffect, useState } from 'react'
import Countdown, { zeroPad } from 'react-countdown';
import { toast } from 'sonner';
interface props {
    date: string
}
interface renderer {
    hours: number,
    minutes: number,
    seconds: number,
    completed: boolean
}

const rendered = ({hours, minutes, seconds, completed}:renderer)=>{
    if (completed) {
        return "Nije aktivna"
    } else{
        return (
        <span>
            {zeroPad(minutes)}:{zeroPad(seconds)}
        </span>
        )
    }

    return "Nije aktivna"
}
const BagdeTimer = ({date}: props) => {
    console.log("badge countdown date:", date)
    const [allowAlert, setAllowAlert] = useState(false)
    useEffect(()=>{
setTimeout(() => {
    setAllowAlert(true)
}, 5000);
    }, [])
    return (
        <Countdown
            date={date}
            renderer={rendered}
            onComplete={() => allowAlert ? toast.info("Vaš čas je završen.") : console.log(".")}
        />
    );
}

export default BagdeTimer