import { useEffect, useState } from 'react'
import axios from 'axios'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type UserType = 'teacher' | 'student_permanent' | 'student_temp'
type UserOption = {
  _id: string
  name: string
  username: string
  type: UserType
  teacherRef?: { name: string; username: string }
}

const labels: Record<UserType, string> = {
  teacher: 'Profesor',
  student_permanent: 'Učenik (trajni nalog)',
  student_temp: 'Učenik (privremeni nalog)',
}

const SAGdprDeleteUser = () => {
  const [type, setType] = useState<UserType>('student_permanent')
  const [users, setUsers] = useState<UserOption[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmationOpen, setConfirmationOpen] = useState(false)

  const selectedUser = users.find((user) => user._id === selectedId)

  const loadUsers = async (accountType: UserType) => {
    try {
      setLoading(true)
      setSelectedId('')
      const response = await axios.get(`${import.meta.env.VITE_BACKEND}/user/me/gdpr/users`, {
        params: { type: accountType },
        withCredentials: true,
      })
      setUsers(response.data)
    } catch {
      setUsers([])
      toast.error('Lista korisnika nije dostupna.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers(type)
  }, [type])

  const deleteUser = async () => {
    if (!selectedUser) return
    try {
      setDeleting(true)
      const response = await axios.delete(`${import.meta.env.VITE_BACKEND}/user/me/gdpr/users/${selectedUser._id}`, {
        withCredentials: true,
      })
      toast.success(`${selectedUser.name} je trajno obrisan/a. Uklonjeno naloga: ${response.data.deletedUserCount}.`)
      setConfirmationOpen(false)
      await loadUsers(type)
    } catch (error) {
      toast.error(axios.isAxiosError(error) ? error.response?.data?.error || 'Brisanje nije uspelo.' : 'Brisanje nije uspelo.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
        <div className="flex gap-2 font-semibold text-destructive"><AlertTriangle className="size-4 shrink-0" />Nepovratno GDPR brisanje</div>
        <p className="mt-2 text-muted-foreground">Profesoru se brišu i svi njegovi učenici i povezani podaci. Ova radnja se ne može poništiti.</p>
      </div>

      <div className="space-y-2">
        <Label>Tip naloga</Label>
        <Select value={type} onValueChange={(value: UserType) => setType(value)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="student_permanent">Učenik — trajni nalog</SelectItem>
            <SelectItem value="student_temp">Učenik — privremeni nalog</SelectItem>
            <SelectItem value="teacher">Profesor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Korisnik</Label>
        <Select value={selectedId} onValueChange={setSelectedId} disabled={loading || users.length === 0}>
          <SelectTrigger><SelectValue placeholder={loading ? 'Učitavanje…' : users.length ? 'Odaberite korisnika…' : 'Nema dostupnih korisnika'} /></SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user._id} value={user._id}>
                {user.name} — {user.username}{user.teacherRef ? ` (profesor: ${user.teacherRef.name})` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button variant="destructive" disabled={!selectedUser || deleting} onClick={() => setConfirmationOpen(true)}>
        <Trash2 />Trajno obriši podatke
      </Button>

      <AlertDialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Potvrda trajnog brisanja</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser?.type === 'teacher'
                ? `Brišete profesora ${selectedUser.name}, sve njegove učenike i sve povezane podatke u aplikaciji.`
                : `Brišete učenika ${selectedUser?.name} i sva njegova/njena povezana rešenja, testove i evidencije.`}
              {' '}Ova radnja je nepovratna.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Odustani</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={deleting} onClick={(event) => { event.preventDefault(); deleteUser() }}>
              {deleting ? 'Brisanje…' : `Obriši ${selectedUser ? labels[selectedUser.type] : 'nalog'} trajno`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default SAGdprDeleteUser
