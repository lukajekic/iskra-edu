import { useState } from 'react'
import axios from 'axios'
import { QRCodeCanvas } from 'qrcode.react'
import { AlertTriangle, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const actions = {
  delete_class_students: 'Trajno obriši sve učenike odeljenja',
  reset_class_progress: 'Resetuj napredak svih učenika',
  delete_test_solutions: 'Obriši sva rešenja mojih testova',
}

const MassActionQrRequest = () => {
  const [open, setOpen] = useState(false)
  const [action, setAction] = useState<keyof typeof actions>('reset_class_progress')
  const [request, setRequest] = useState<{ token: string; label: string; expiresAt: string } | null>(null)
  const [creating, setCreating] = useState(false)

  const createRequest = async () => {
    try {
      setCreating(true)
      const response = await axios.post(`${import.meta.env.VITE_BACKEND}/my/students/mass-action-requests`, { action }, { withCredentials: true })
      setRequest(response.data)
    } catch (error) {
      toast.error(axios.isAxiosError(error) ? error.response?.data?.error || 'Zahtev nije kreiran.' : 'Zahtev nije kreiran.')
    } finally {
      setCreating(false)
    }
  }

  const close = (value: boolean) => {
    setOpen(value)
    if (!value) setRequest(null)
  }

  return (
    <>
      <Button className="ml-2" variant="destructive" onClick={() => setOpen(true)}><ShieldCheck />Zatraži admin odobrenje</Button>
      <Dialog open={open} onOpenChange={close}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          {!request ? <>
            <DialogHeader>
              <DialogTitle>Masovna radnja uz QR odobrenje</DialogTitle>
              <DialogDescription>Radnja se neće izvršiti dok super-admin ne skenira jednokratni QR kod u administrativnom panelu.</DialogDescription>
            </DialogHeader>
            <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-muted-foreground"><span className="flex gap-2 font-semibold text-destructive"><AlertTriangle className="size-4" />Oprez</span><p className="mt-1">Izabrana radnja je nepovratna nakon odobrenja.</p></div>
            <div className="space-y-2"><Label>Radnja</Label><Select value={action} onValueChange={(value: keyof typeof actions) => setAction(value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(actions).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div>
            <DialogFooter><Button variant="outline" onClick={() => close(false)}>Odustani</Button><Button variant="destructive" disabled={creating} onClick={createRequest}>{creating ? 'Kreiranje…' : 'Generiši QR zahtev'}</Button></DialogFooter>
          </> : <>
            <DialogHeader><DialogTitle>Čeka se super-admin odobrenje</DialogTitle><DialogDescription>{request.label}</DialogDescription></DialogHeader>
            <div className="mx-auto rounded-lg bg-white p-3"><QRCodeCanvas value={request.token} size={230} level="M" includeMargin /></div>
            <div className="rounded-md border bg-muted/40 p-3 text-center">
              <p className="text-xs font-medium text-muted-foreground">Ručni kod za odobrenje</p>
              <code className="mt-1 block text-base font-semibold tracking-wider select-all">{request.token}</code>
            </div>
            <p className="text-center text-sm text-muted-foreground">QR kod važi do {new Date(request.expiresAt).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })}. Super-admin ga skenira u SAADMIN panelu.</p>
            <DialogFooter><Button onClick={() => close(false)}>Zatvori</Button></DialogFooter>
          </>}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default MassActionQrRequest
