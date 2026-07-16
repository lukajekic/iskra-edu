import React from 'react'
import Sectiontitle from './Sectiontitle'
import Reveal from './Reveal'
import { ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GitHubLogoIcon, LinkedInLogoIcon } from '@radix-ui/react-icons'
import { ButtonGroup } from '@/components/ui/button-group'

const Signup = () => {
  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-start py-12 px-6 md:p-20 box-border">
        <div id="info" className="flex flex-col h-full justify-between">
            <Reveal>
                <div>
                    <Sectiontitle text='Zainteresovani ste?'></Sectiontitle>
                    <p className="text-lg md:text-xl w-full lg:w-3/4 mt-6 md:mt-10 leading-relaxed">
                        Za detaljnu prezentaciju platforme, pitanja u vezi primene platforme i zahteva za ponudu, molimo Vas kontaktirajte nas.
                        <br />
                        <br />
                        Tu smo da odgovorimo u najkraćem roku.
                    </p>
                </div>
            </Reveal>

            <Reveal delay={100}>
                <ButtonGroup className='mt-8'>
                    <Button onClick={()=>{location.href='https://www.linkedin.com/in/luka-jeki%C4%87-5bab8a278/?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3BiGJpahEzQYaKx9KlE%2F85JQ%3D%3D'}} variant={'outline'}>
                        <LinkedInLogoIcon className="mr-2" />LinkedIn
                    </Button>
                    <Button onClick={()=>{location.href = 'https://github.com/lukajekic/iskra-edu'}} variant={'outline'}>
                        <GitHubLogoIcon className="mr-2" />GitHub
                    </Button>
                </ButtonGroup>
            </Reveal>
        </div>

        <Reveal delay={150} className="w-full h-auto lg:h-full">
            <a target='_blank' href='https://forms.gle/a9kKbTemVmbyJSii8' className='block w-full h-auto lg:h-full aspect-square lg:aspect-auto min-h-[300px]' id="contactbtn">
                <div className="transition-all w-full h-full border-2 border-primary rounded-3xl lg:rounded-4xl flex flex-col p-6 md:p-10 justify-between text-primary hover:bg-primary hover:text-white hover:scale-[1.01] box-border">
                    <div className="flex-1 flex items-start justify-end lg:justify-start">
                        <ArrowUpRight className='h-16 w-16 md:h-24 md:w-24 lg:h-full lg:w-auto'></ArrowUpRight>
                    </div>
                    <div className="flex-1 flex items-end">
                        <h1 className='uppercase w-full text-4xl md:text-6xl lg:text-8xl font-bold leading-none tracking-tight break-words'>
                            Kontaktirajte <br />nas
                        </h1>
                    </div>
                </div>
            </a>
        </Reveal>
    </div>
  )
}

export default Signup
