import React from 'react'
import Sectiontitle from './Sectiontitle'
import Reveal from './Reveal'
import { ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GitHubLogoIcon, LinkedInLogoIcon } from '@radix-ui/react-icons'
import { ButtonGroup } from '@/components/ui/button-group'

const Signup = () => {
  return (
    /* PROMENJENO: Uklonjen min-h-screen, dodatan max-w-6xl i svedeni padinzi */
    <section id="contact" className="w-full py-12 md:py-16 px-4 md:px-8 box-border max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-stretch">
      <div id="info" className="flex flex-col justify-between gap-6">
        <Reveal>
          <div>
            <Sectiontitle text='Zainteresovani ste?' />
            {/* PROMENJENO: Smanjena margina (mt-3 md:mt-4) i usklađen font (text-base md:text-lg) */}
            <p className="text-base md:text-lg max-w-xl mt-3 md:mt-4 leading-relaxed text-muted-foreground">
              Za detaljnu prezentaciju platforme, pitanja u vezi primene platforme i zahteva za ponudu, molimo Vas kontaktirajte nas.
              <br />
              <br />
              Tu smo da odgovorimo u najkraćem roku.
            </p>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <ButtonGroup className='mt-4 md:mt-6'>
            <Button 
              onClick={() => window.open('https://www.linkedin.com/in/luka-jeki%C4%87-5bab8a278/?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3BiGJpahEzQYaKx9KlE%2F85JQ%3D%3D', '_blank')} 
              variant={'outline'}
              className="gap-2"
            >
              <LinkedInLogoIcon className="size-4" />
              LinkedIn
            </Button>
            <Button 
              onClick={() => window.open('https://github.com/lukajekic/iskra-edu', '_blank')} 
              variant={'outline'}
              className="gap-2"
            >
              <GitHubLogoIcon className="size-4" />
              GitHub
            </Button>
          </ButtonGroup>
        </Reveal>
      </div>

      {/* PROMENJENO: Izbačeni aspect-square i min-h-[300px], prilagođena veličina teksta na 3xl/5xl i ikona na size-10/14 */}
      <Reveal delay={150} className="w-full">
        <a 
          target='_blank' 
          rel="noopener noreferrer" 
          href='https://forms.gle/a9kKbTemVmbyJSii8' 
          className='block w-full h-full min-h-[220px]' 
          id="contactbtn"
        >
          <div className="transition-all w-full h-full border-2 border-primary rounded-2xl md:rounded-3xl flex flex-col p-6 md:p-8 justify-between text-primary hover:bg-primary hover:text-primary-foreground hover:scale-[1.01] box-border group shadow-sm">
            <div className="flex items-start justify-end">
              <ArrowUpRight className='size-10 md:size-14 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1' />
            </div>
            <div className="mt-8">
              <h2 className='uppercase w-full text-3xl md:text-5xl font-extrabold leading-tight tracking-tight break-words'>
                Kontaktirajte <br />nas
              </h2>
            </div>
          </div>
        </a>
      </Reveal>
    </section>
  )
}

export default Signup