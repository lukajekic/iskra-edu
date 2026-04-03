import React from 'react'
import { Dialog, DialogContent } from '../ui/dialog'
import { AlertCircle, Check, X } from 'lucide-react'
import { Alert } from '../ui/alert'
interface props {
    response: string,
    onClose: ()=> void
}
const TerminalResponse = ({response, onClose}:props) => {
  return (
    <Dialog open={true} onOpenChange={(val) => {
        if (!val) {
            onClose()
        }
    }}>
        {/* Dodali smo [&>button]:z-50 i [&>button]:text-white da bi 'X' dugme iskočilo iznad crne pozadine */}
        <DialogContent className='max-w-screen min-w-screen w-screen h-screen rounded-none flex flex-row items-stretch p-0 [&>button]:z-50 [&>button]:text-white gap-0'>
            
            {/* Leva strana */}
            <div id="info" className='overflow-y-auto basis-1/2'>
            <div className={`p-4 className="w-full  ${response.stdout ? "bg-green-600" : response.stderr ? "bg-red-700" : ""}`}>
                <p className="text-lg text-white">Server je vratio status:</p>
                {response.stdout && (
                    <p className="text-2xl inline-flex items-center text-white mt-3 gap-3">
                        <Check></Check>
                        <span>Uspešno</span>
                    </p>
                )}

                {response.stderr && (
                    <p className="text-2xl inline-flex items-center text-white mt-3 gap-3">
                        <X></X>
                        <span>Greška</span>
                    </p>
                )}
            </div>

            {(response.stderr && response.policyBreaking) && (
                <Alert variant={'destructive'} className='w-[90%] m-auto mt-2'>
                    <AlertCircle></AlertCircle>
                    {response.policyBreaking}
                </Alert>
            )}
                
            </div>
            
            {/* Desna strana (Crna) */}
            <div id="terminal" className='overflow-y-auto bg-black text-white basis-1/2 p-4 whitespace-pre-line'>
                {/* Sadržaj terminala */}
                <p>Izlaz programa</p>
                <br />
                {response.stdout && (
                    <p className="text-green-600 text-lg">{response.stdout}</p>
                )}

                 {response.stderr && (
                    <p className="text-red-600 text-lg">{response.stderr}</p>
                )}

                    <p className="text-gray-400 text-lg">--Kraj izvršavanja programa--</p>
                
            </div>

        </DialogContent>
    </Dialog>
  )
}

export default TerminalResponse