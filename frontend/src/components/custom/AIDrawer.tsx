import React, { useEffect, useState } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'


import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Badge } from '../ui/badge'
import { Sparkles } from 'lucide-react'

const markdownComponents: Components = {
  h1: ({ children }) => <h1 className="mb-3 text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{children}</h1>,
  h2: ({ children }) => <h2 className="mb-2 mt-5 text-lg font-semibold text-slate-900 dark:text-slate-100">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-2 mt-4 text-base font-semibold text-slate-900 dark:text-slate-100">{children}</h3>,
  p: ({ children }) => <p className="mb-3 leading-7 text-slate-700 dark:text-slate-300">{children}</p>,
  ul: ({ children }) => <ul className="mb-4 list-disc space-y-1 pl-5 text-slate-700 dark:text-slate-300">{children}</ul>,
  ol: ({ children }) => <ol className="mb-4 list-decimal space-y-1 pl-5 text-slate-700 dark:text-slate-300">{children}</ol>,
  li: ({ children }) => <li className="pl-1 leading-6">{children}</li>,
  blockquote: ({ children }) => <blockquote className="my-4 border-l-4 border-primary/40 pl-4 text-slate-600 dark:text-slate-400">{children}</blockquote>,
  code: ({ children, className, ...props }) => <code className={`rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.9em] text-slate-900 dark:bg-slate-800 dark:text-slate-100 ${className ?? ''}`} {...props}>{children}</code>,
  pre: ({ children }) => <pre className="my-4 overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm leading-6 text-slate-100">{children}</pre>,
  a: ({ children, href }) => <a className="text-primary underline underline-offset-2" href={href} target="_blank" rel="noreferrer">{children}</a>,
  hr: () => <hr className="my-4 border-slate-200 dark:border-slate-700" />,
}

interface Props  {
    answer: string
}

const AIDrawer = ({answer}:Props) => {
  const [visibleAnswer, setVisibleAnswer] = useState('')

  useEffect(() => {
    const words = answer.match(/\S+\s*/g) ?? []
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion || words.length === 0) {
      setVisibleAnswer(answer)
      return
    }

    setVisibleAnswer('')
    let visibleWordCount = 0
    const intervalId = window.setInterval(() => {
      visibleWordCount += 1
      setVisibleAnswer(words.slice(0, visibleWordCount).join(''))

      if (visibleWordCount >= words.length) {
        window.clearInterval(intervalId)
      }
    }, 24)

    return () => window.clearInterval(intervalId)
  }, [answer])

  return (
    <>
      {/* PROMENJENO: Dodat onOpenChange prop da bi radilo zatvaranje klikom van Drawer-a */}
      <Drawer open dismissible={false} direction="right">

      {/* PROMENJENO: Dodate Tailwind klase za fiksno pozicioniranje skroz desno uz punu visinu ekrana */}
      <DrawerContent className="fixed bottom-0 right-0 top-0 mt-0 h-full w-[min(92vw,520px)] rounded-l-xl rounded-r-none">
       <DrawerHeader className='w-full'>
  <DrawerTitle className='w-full text-center bg-gradient-to-r from-[#dc7702] to-[#9a5301] bg-clip-text text-transparent font-bold text-lg flex items-center justify-center'>
    IskraAI odgovor
  </DrawerTitle>
</DrawerHeader>

<div className="w-full flex justify-center"><div className=" flex items-center justify-center w-[75px] h-[75px] rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm text-gray-700 dark:text-gray-300">
  <Sparkles className="w-[30px] h-[30px] shrink-0" />
</div>
</div>


        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-5">
          <article className="break-words animate-in fade-in duration-500">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {visibleAnswer}
            </ReactMarkdown>
          </article>
        </div>
        <DrawerFooter>
            <p className='text-center text-gray-600'>IskraAI je veštačka inteligencija podložna greškama. Ne uzimajte odgovore IskraAI kao 100% tačne.</p>
          <DrawerClose asChild>
            <Button onClick={()=>{
                (window as any).setOpenAIChat?.(false)
            }} variant="outline">Zatvori</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
    
    </>
  )
}

export default AIDrawer
