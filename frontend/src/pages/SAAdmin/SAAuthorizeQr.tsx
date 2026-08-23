// @ts-nocheck
import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { Camera, CheckCircle2, Keyboard, ScanLine } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const SAAuthorizeQr = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanTimerRef = useRef<number | null>(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [token, setToken] = useState('')
  const [authorizing, setAuthorizing] = useState(false)

  const stopCamera = () => {
    if (scanTimerRef.current) window.clearInterval(scanTimerRef.current)
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setCameraOpen(false)
  }

  useEffect(() => () => stopCamera(), [])

  const authorize = async (value = token) => {
    if (!value) return toast.error('Skenirajte ili unesite QR kod.')
    try {
      setAuthorizing(true)
      const response = await axios.post(`${import.meta.env.VITE_BACKEND}/admin/approvals/authorize`, { token: value }, { withCredentials: true })
      toast.success(`${response.data.label}. Radnja je izvršena.`)
      setToken('')
      stopCamera()
    } catch (error) {
      toast.error(axios.isAxiosError(error) ? error.response?.data?.error || 'Odobrenje nije uspelo.' : 'Odobrenje nije uspelo.')
    } finally {
      setAuthorizing(false)
    }
  }

  const startCamera = async () => {
    if (!('BarcodeDetector' in window)) return toast.error('Ovaj preglednik ne podržava QR skeniranje kamerom. Unesite kod ručno.')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      setCameraOpen(true)
      window.setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream }, 0)
      const detector = new window.BarcodeDetector({ formats: ['qr_code'] })
      scanTimerRef.current = window.setInterval(async () => {
        if (!videoRef.current || authorizing) return
        const codes = await detector.detect(videoRef.current)
        const value = codes[0]?.rawValue
        if (value) { setToken(value); stopCamera(); authorize(value) }
      }, 500)
    } catch {
      stopCamera()
      toast.error('Kamera nije dostupna ili pristup nije dozvoljen.')
    }
  }

  return <div className="flex flex-col gap-3">
    <p className="text-sm text-muted-foreground">Skeniranjem se odobrava tačno jedna, vremenski ograničena masovna radnja profesora.</p>
    {cameraOpen && <video ref={videoRef} autoPlay playsInline className="aspect-video w-full rounded-md bg-black object-cover" />}
    <div className="flex gap-2"><Button type="button" onClick={cameraOpen ? stopCamera : startCamera} variant="outline"><Camera />{cameraOpen ? 'Zaustavi kameru' : 'Skeniraj QR kod'}</Button></div>
    <div className="flex gap-2"><Input value={token} onChange={(event) => setToken(event.target.value)} placeholder="10-znakovni kod" /><Button type="button" disabled={authorizing} onClick={() => authorize()}><ScanLine />{authorizing ? 'Odobravam…' : 'Odobri'}</Button></div>
    <p className="flex items-center gap-1 text-xs text-muted-foreground"><Keyboard className="size-3" />Ručni unos je rezerva za preglednike bez podrške kamere.</p>
  </div>
}

export default SAAuthorizeQr
