import React, { useEffect, useState, useRef } from 'react'
import { Dialog, DialogContent } from '../ui/dialog'
import { Editor } from '@monaco-editor/react'
import { Alert } from '../ui/alert'
import { toast } from 'sonner'
import axios from 'axios'
import LoaderModal from './LoaderModal'

interface Props {
    codeOrigin: string,
    count: number,
    onClose: (data: any) => void
}

const TerminalRunner = ({codeOrigin, count, onClose }: Props) => {
    const [policyBreaking, setPolicyBreaking] = useState("")
    const [loading, setloading]= useState(false)
    const determinePolicyBreaking = ()=>{
        if (codeOrigin.includes("for")) {
            setPolicyBreaking('Tvoj kod potencijalno sadrži petlju for, ukoliko si dobio neočikvan rezultat, greška ne mora biti nužno u tvom programu, pošalji na pregled za detaljne preglede.')
        }

        if (codeOrigin.includes("while")) {
            setPolicyBreaking('Tvoj kod potencijalno sadrži petlju while, ukoliko si dobio neočikvan rezultat, greška ne mora biti nužno u tvom programu, pošalji na pregled za detaljne preglede.')

        }

        if (codeOrigin.includes("matplotlib")) {
            setPolicyBreaking("Tvoj kod potencijalno sadrži uvoz biblioteke matplotlib, ukoliko si dobio neočekivan rezultat, greška ne mora biti u tvom kodu, pošalji zadatak na pregled za detaljnu analizu.")
        }
    }
    const [code, setCode] = useState("")
    const [input, setInput] = useState<string[]>([])
    const [innerCount, setInnerCount] = useState(0)
    
    // Koristimo refove da async funkcije uvek vide najsvežije stanje
    const codeRef = useRef(code)
    codeRef.current = code

    const innerCountRef = useRef(innerCount)
    innerCountRef.current = innerCount

    const inputRef = useRef(input)
    inputRef.current = input

    const runCodeServer = async () => {
        try {
            setloading(true)
            const response = await axios.post(`${import.meta.env.VITE_BACKEND}/app/student/run`, {
                "code": codeOrigin,
                "input_data": inputRef.current.join("\n"), // Vučemo direktno iz refa
                "timeout": 5
            })
            if (response.status === 200) {
                console.log(response)
                setloading(false)
                onClose({...response.data, policyBreaking })
            }
        } catch (error) {
            toast.error("Greska.")
            setloading(false)
            onClose("ERROR: Desila se greska.")
        }
    }

    const handleEnterPressed = () => {
        // Provera da li smo već dostigli limit
        if (innerCountRef.current >= count) {
            runCodeServer()
            return
        }

        const linijaZaUnos = codeRef.current
        
        // Odmah ažuriramo ref da bi runCodeServer video promenu u istom ciklusu
        const novoStanje = [...inputRef.current, linijaZaUnos]
        inputRef.current = novoStanje
        setInput(novoStanje)

        setCode("") // Brišemo editor za sledeći unos
        
        const noviInnerCount = innerCountRef.current + 1
        setInnerCount(noviInnerCount)

        // Ako smo ovim unosom stigli do limita, odmah okidamo slanje
        if (noviInnerCount === count) {
            runCodeServer()
        }
    }

    // Okidanje odmah ako je count 0
    useEffect(() => {
        determinePolicyBreaking()
        if (count === 0) {
            runCodeServer()
        }
    }, [count])

    return (
        <div>
            <LoaderModal open={loading}></LoaderModal>
            <Dialog open={true}>
                <DialogContent 
                    showCloseButton={false} 
                    className='min-w-screen min-h-screen h-screen rounded-none p-0'
                >
                    <div className="flex flex-col w-full h-full gap-0">
                        <div id="terminal-header" className="p-3 bg-white text-2xl border-b">
                            Terminal
                            <br />
                            <Alert className='mt-2'>
                                Ovde unosiš svaku liniju input funkcije i odvajas ih dugmetom Enter.
                            </Alert>
                        </div>

                        {/* KLJUČNA PROMENA: Hvatanje Entera u "capture" fazi na divu. 
                          Ovo presreće Enter pre nego što ga Monaco obradi i unese novi red!
                        */}
                        <div 
                            className="flex-1 w-full"
                            onKeyDownCapture={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault() // Sprečava novi red u editoru
                                    e.stopPropagation() // Ne dozvoljava Monacu da reaguje
                                    handleEnterPressed()
                                }
                            }}
                        >
                            <Editor
                                options={{
                                    selectOnLineNumbers: true,
                                    renderWhitespace: "all",
                                    quickSuggestions: {
                                        other: true, comments: true, strings: true
                                    },
                                    suggestOnTriggerCharacters: true,
                                    wordBasedSuggestions: "allDocuments",
                                    links: true,
                                    colorDecorators: true,
                                    fontSize: 16,
                                    minimap: { enabled: false }
                                }}
                                height="100%"
                                theme='vs-dark'
                                defaultLanguage='python'
                                onChange={(e) => setCode(e || "")}
                                value={code}
                            />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default TerminalRunner