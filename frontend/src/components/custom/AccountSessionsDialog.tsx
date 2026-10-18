import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Loader2, MonitorSmartphone, ShieldAlert, X } from 'lucide-react'

type Session = { id: string; device: string; createdAt: string; expiresAt: string; current: boolean }
type Props = { open: boolean; onOpenChange: (open: boolean) => void; portal?: boolean; studentId?: string; studentName?: string }
const backend = import.meta.env.VITE_BACKEND

export default function AccountSessionsDialog({ open, onOpenChange, portal = false, studentId, studentName }: Props) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [confirmAll, setConfirmAll] = useState(false)
  const targetPath = studentId ? `/user/students/${studentId}/sessions` : portal ? '/user/portal/me/sessions' : '/user/me/sessions'
  const self = !studentId

  const loadSessions = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await axios.get(`${backend}${targetPath}`)
      setSessions(data.sessions || [])
    } catch (error) {
      const message = axios.isAxiosError(error) ? error.response?.data?.toast_message || error.response?.data?.message : null
      toast.error(typeof message === 'string' ? message : 'Nije moguće učitati prijavljene uređaje.')
    } finally {
      setLoading(false)
    }
  }, [targetPath])

  useEffect(() => { if (open) void loadSessions() }, [open, loadSessions])

  const revokeSession = async (session: Session) => {
    setBusy(true)
    try {
      const path = studentId
        ? `/user/students/${studentId}/sessions/${session.id}`
        : portal ? `/user/portal/me/sessions/${session.id}` : `/user/me/sessions/${session.id}`
      await axios.delete(`${backend}${path}`)
      toast.success('Uređaj je odjavljen.')
      if (session.current) window.location.replace(portal ? '/portal/login' : '/login')
      else await loadSessions()
    } catch (error) {
      const message = axios.isAxiosError(error) ? error.response?.data?.toast_message || error.response?.data?.message : null
      toast.error(typeof message === 'string' ? message : 'Nije moguće odjaviti uređaj.')
    } finally { setBusy(false) }
  }

  const revokeAll = async () => {
    setBusy(true)
    try {
      const path = studentId
        ? `/user/students/${studentId}/sessions/revoke-all`
        : portal ? '/user/portal/me/sessions/revoke-all' : '/user/me/sessions/revoke-all'
      await axios.post(`${backend}${path}`)
      toast.success(studentId ? 'Učenik je odjavljen sa svih uređaja.' : 'Sve sesije su odjavljene.')
      setConfirmAll(false)
      if (self) window.location.replace(portal ? '/portal/login' : '/login')
      else setSessions([])
    } catch (error) {
      const message = axios.isAxiosError(error) ? error.response?.data?.toast_message || error.response?.data?.message : null
      toast.error(typeof message === 'string' ? message : 'Nije moguće odjaviti uređaje.')
    } finally { setBusy(false) }
  }

  return <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Prijavljeni uređaji{studentName ? ` — ${studentName}` : ''}</DialogTitle>
          <DialogDescription>Pregled sesija i vreme prijave. Odjava uređaja odmah mu ukida pristup Iskri.</DialogDescription>
        </DialogHeader>
        <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" />
          <p>„Odjavi sve uređaje“ prekida sve aktivne prijave. Korisnik će morati ponovo da se prijavi na uređajima koje želi da nastavi da koristi.</p>
        </div>
        {loading ? <div className="flex justify-center py-10"><Loader2 className="size-6 animate-spin" /></div> : sessions.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">Nema aktivnih prijavljenih uređaja.</div>
        ) : <div className="space-y-3">
          {sessions.map((session) => <div key={session.id} className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <MonitorSmartphone className="mt-1 size-5 shrink-0 text-primary" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 font-medium">{session.current ? 'Ovaj uređaj' : 'Prijavljeni uređaj'}{session.current && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">trenutna sesija</span>}</div>
                <p className="mt-1 break-all text-xs text-muted-foreground">{session.device}</p>
                <p className="mt-1 text-xs text-muted-foreground">Prijava: {new Date(session.createdAt).toLocaleString('sr-RS')}</p>
              </div>
            </div>
            {self && <Button size="sm" variant="outline" disabled={busy} onClick={() => void revokeSession(session)}><X className="mr-2 size-4" />Odjavi uređaj</Button>}
          </div>)}
        </div>}
        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Zatvori</Button>
          <Button variant="destructive" disabled={busy || sessions.length === 0} onClick={() => setConfirmAll(true)}>{busy && <Loader2 className="mr-2 size-4 animate-spin" />}Odjavi sve uređaje</Button>
        </div>
      </DialogContent>
    </Dialog>
    <AlertDialog open={confirmAll} onOpenChange={setConfirmAll}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Odjaviti sve uređaje?</AlertDialogTitle>
          <AlertDialogDescription>{studentName ? `Sve aktivne sesije učenika ${studentName} biće prekinute.` : 'Biće prekinute sve aktivne sesije ovog naloga, uključujući i ovu.'} Za nastavak rada biće potrebna nova prijava.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Otkaži</AlertDialogCancel>
          <AlertDialogAction disabled={busy} onClick={(event) => { event.preventDefault(); void revokeAll() }}>Odjavi sve</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
}
