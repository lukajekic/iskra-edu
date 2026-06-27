import React, { useEffect, useRef, useState } from 'react'
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
import axios from 'axios'
import { toast } from 'sonner'
import Loader from '@/components/custom/Loader'

const Onboarding = () => {
const [btnLoading, setBtnLoading] = useState(false)
const usernameField = useRef<HTMLInputElement>(null)
const passwordField = useRef<HTMLInputElement>(null)
const nameField = useRef<HTMLInputElement>(null)
const codeField = useRef<HTMLInputElement>(null)
  const handleOnboarding = async()=>{
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND}/user/me/redirect`)
      if (response.data) {
        if (response.data.redirect !== '/auth/onboarding') {
          location.href = response.data.redirect
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  //onready

  useEffect(()=>{
handleOnboarding()
  }, [])


  const handleCredentialLogin = async()=>{
    try {
      if (!usernameField || !passwordField || !usernameField.current || !passwordField.current || !usernameField.current.value || !passwordField.current.value) {
        toast.error("Unesite korisnicko ime i lozinku.");
        return;
      }
      setBtnLoading(true)
      const response = await axios.post(`${import.meta.env.VITE_BACKEND}/user/login`, {
        username: usernameField.current.value,
        password: passwordField.current.value
      });

      if (response.status === 200) {
        const redirectresponse = await axios.get(`${import.meta.env.VITE_BACKEND}/user/me/redirect`);
        if (redirectresponse.data.redirect) {
          if (redirectresponse.data.redirect === '/app/teacher') {
            sessionStorage.setItem('teacher_id', redirectresponse.data.userID)
          }
          location.href = redirectresponse.data.redirect;
          setBtnLoading(false)
        }
      }
    } catch (error) {
      console.error(error);
      setBtnLoading(false)
    }
  }

  const handleCodeLogin = async()=>{
    try {
      if (!nameField || !nameField.current || !nameField.current.value || !accesscode || accesscode.length < 8) {
        toast.error("Unesite ime i pristupni kod.");
        return;
      }
      setBtnLoading(true)

      const response = await axios.post(`${import.meta.env.VITE_BACKEND}/user/create`, {
        name: nameField.current.value,
        type: "student_temp",
        username: "temp_temp",
        password: "temp_temp",
        code: accesscode.toUpperCase()
      })

      if (response.status === 200) {
        setBtnLoading(false)
        location.href = '/app/student/home'
      }
    } catch (error) {
      console.error(error)
      setBtnLoading(false)
    }
  }

    const [accesscode, setaccesscode] = useState<string>("")
  return (
    <div className="min-h-screen w-full bg-white relative">
      {/* Amber Glow Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(125% 125% at 50% 10%, #ffffff 40%, #dc7702 100%)
          `,
          backgroundSize: "100% 100%",
        }}
      />
      
      {/* Glavni kontejner postavljen na relative i z-10 kako bi bio iznad pozadine */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Središnji deo koji gura footer na dno pomoću flex-1 */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="flex flex-col gap-2 max-w-4xl w-full text-center md:text-left">
            
            {/* Naslov koji je nedostajao / bio pomeren */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Prijava na Iskra platformu</h1>
            
            <div className="flex items-stretch gap-5 mt-5 md:flex-row flex-col justify-center">
                <Card className="relative w-full max-w-md pt-0 bg-white/80 backdrop-blur-sm">
                  <img
                    src="/undraw_lecture_hul3.svg"
                    alt="Event cover"
                    className="object-contain size-50 self-center mx-auto mt-4"
                  />
                  <CardHeader>
                    <CardTitle>Pristupni kod</CardTitle>
                    <CardDescription>
                      Unesite kod za prijavu na platformu, važi 45 minuta od momenta generisanja od strane predmetnog profesora.
                      <br />
                      <br />
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Dialog 
                      onOpenChange={(e) => {
                        console.log(e);
                        if (!e) {
                          setaccesscode("");
                        }
                      }}
                    >
                      <form className='w-full' onSubmit={(e)=>{e.preventDefault()}}>
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
                            <Field>
                              <FieldLabel htmlFor="name">Tvoje ime i prezime</FieldLabel>
                              <Input
                                ref={nameField}
                                id="name"
                                type="text"
                                placeholder="Unesi svoje ime"
                              />
                            </Field>

                            <Field>
                              <FieldLabel htmlFor="otp">Pristupni kod</FieldLabel>
                              <InputOTP inputMode='text' pattern='.*' id='otp' value={accesscode} maxLength={8} onChange={(e)=>{console.log(e), setaccesscode(e)}}>
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
                            </Field>
                          </FieldGroup>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline" onClick={()=>{setaccesscode("")}}>Odustani</Button>
                            </DialogClose>
                            <Button disabled={btnLoading} onClick={()=>{handleCodeLogin()}} type="submit">{btnLoading ? (
                              <Loader small></Loader>
                            ) : ("Prijavi se")}</Button>
                          </DialogFooter>
                        </DialogContent>
                      </form>
                    </Dialog>
                  </CardFooter>
                </Card>

                <Card className="relative w-full max-w-md pt-0 bg-white/80 backdrop-blur-sm">
                  <img
                    src="/undraw_mention_t7iw.svg"
                    alt="Event cover"
                    className="object-contain size-50 self-center mx-auto mt-4"
                  />
                  <CardHeader>
                    <CardTitle>Korisničko ime i lozinka</CardTitle>
                    <CardDescription>
                      Unesite kredencijale za prijavu i pristupite stalno dostupnim zadacima sa časova.
                      <br /><br />
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Dialog 
                      onOpenChange={(e) => {
                        console.log(e);
                        if (!e) {
                          setaccesscode("");
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
                              <FieldLabel htmlFor="username">Korisničko ime</FieldLabel>
                              <Input
                                ref={usernameField}
                                id="username"
                                type="text"
                                placeholder="Unesi korisničko ime"
                              />
                            </Field>
                            <Field>
                              <FieldLabel htmlFor="password">Lozinka</FieldLabel>
                              <Input
                                ref={passwordField}
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
                            <Button disabled={btnLoading} onClick={()=>{handleCredentialLogin()}} type="submit">{btnLoading ? (
                              <Loader small></Loader>
                            ) : ("Prijavi se")}</Button>
                          </DialogFooter>
                        </DialogContent>
                      </form>
                    </Dialog>
                  </CardFooter>
                </Card>
            </div>
          </div>
        </div> 

        {/* Footer je sada pravilno smešten na dno stranice */}
        <Footer />
      </div>
    </div>
  )
}

export default Onboarding