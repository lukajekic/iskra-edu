import React, { useState } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import Footer from '@/components/custom/Footer'
const Onboarding = () => {

    const [accesscode, setaccesscode] = useState<string>("")
  return (
    <div className='flex flex-col h-[100vh]'>
        <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col gap-2">
            <h1 className='text-4xl font-bold'>Prijava na Iskra platformu</h1>
            <div className="flex items-start gap-5 mt-5">
                <Card className="relative mx-auto w-full max-w-md w-sm pt-0">
                  <img
                    src="/undraw_lecture_hul3.svg"
                    alt="Event cover"
                    className="object-contain size-50 self-center"
                  />
                  <CardHeader>
                    
                    <CardTitle>Pristupni kod</CardTitle>
                    <CardDescription>
                      Unesite kod za prijavu na platformu, važi 45 od minuta generisanja od strane predmetnog profesora.
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
<Dialog 
  onOpenChange={(e) => {
    console.log(e);
    if (!e) {
      setaccesscode("");
    } else {
      // Ovde ide kod ako je e true, ili ostavi prazno
    }
  }}
>
          <form className='w-full'>
        <DialogTrigger className='w-full' asChild>
          <Button className="w-full">Prijava kodom</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Prijava kodom</DialogTitle>
            <DialogDescription>
              Unesi pristupni kod <strong>za učenike</strong>.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <InputOTP id='otp' value={accesscode} maxLength={8} onChange={(e)=>{console.log(e), setaccesscode(e)}}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
        </InputOTPGroup>
        <InputOTPSeparator></InputOTPSeparator>
        <InputOTPGroup>
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
        <InputOTPSlot index={6} />
        <InputOTPSlot index={7} />
      </InputOTPGroup>
    </InputOTP>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={()=>{setaccesscode("")}}>Odustani</Button>
            </DialogClose>
            <Button type="submit">Prijavi se</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
                    
                  </CardFooter>
                </Card>



                <Card className="relative mx-auto w-full max-w-md w-sm pt-0 ">
                  <img
                    src="/undraw_mention_t7iw.svg"
                    alt="Event cover"
                    className="object-contain size-50 self-center"
                  />
                  <CardHeader>
                    
                    <CardTitle>Korisničko ime i lozinka</CardTitle>
                    <CardDescription>
                      Unesite kredencijale za prijavu i pristupite stalno dostupnim zadacima sa časova.
                      <br></br>
                      .
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Dialog 
  onOpenChange={(e) => {
    console.log(e);
    if (!e) {
      setaccesscode("");
    } else {
      // Ovde ide kod ako je e true, ili ostavi prazno
    }
  }}
>
          <form className='w-full'>
        <DialogTrigger className='w-full' asChild>
          <Button className="w-full">Prijava korisničkim imenom i lozinkom</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Prijava kredencijalima</DialogTitle>
            <DialogDescription>
              Unesi svoje podatke za prijavu na <strong>portal za učenike i profesore</strong>.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
           <Field>
      <FieldLabel htmlFor="input-field-username">Korisničko ime</FieldLabel>
      <Input
        id="username"
        type="text"
        placeholder="Unesi korisničko ime"
      />

    </Field>


     <Field>
      <FieldLabel htmlFor="input-field-username">Lozinka</FieldLabel>
      <Input
        id="password"
        type="password"
        placeholder="Unesi lozinku"
      />

    </Field>


          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={()=>{setaccesscode("")}}>Odustani</Button>
            </DialogClose>
            <Button type="submit">Prijavi se</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
                  </CardFooter>
                </Card>
            </div>


{/* <Card className="relative py-5 mt-5  mx-auto w-full pt-0 bg-gray-100 flex flex-row items-center">
               
                  <CardHeader className=' flex-1 mt-5'>
                    
                    <CardTitle className='w-fit'>Prijava na portal za profesore</CardTitle>
                   
                  </CardHeader>
                  <CardFooter>
                   <Button variant={'default'} className='w-fit mt-5'>Prijava</Button>
                  </CardFooter>
                </Card> */}



        </div>





        {/* code */}
        

    </div> 
    <Footer></Footer>
 
    </div>
    

  )
}

export default Onboarding