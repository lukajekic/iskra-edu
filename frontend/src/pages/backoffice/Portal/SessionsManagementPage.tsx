import { useState } from 'react';
import axios from 'axios';
import { Alert, Badge, Button, Card, Group, Loader, Stack, Text, TextInput, Title } from '@mantine/core';
import { toast } from 'sonner';
import { MonitorSmartphone, Search, ShieldAlert, X } from 'lucide-react';
import ActionButtonsBlock from './core_components/ActionButtonsBlock';

type DeviceSession = { id: string; device: string; createdAt: string; expiresAt: string; current: boolean };
type UserSessions = { user: { id: string; username: string; name: string; type: string }; sessions: DeviceSession[] };
const backend = import.meta.env.VITE_BACKEND;
const roleNames: Record<string, string> = { portal: 'Portal', teacher: 'Nastavnik', student: 'Učenik', student_permanent: 'Učenik', admin: 'Administrator', user: 'Korisnik' };

export default function SessionsManagementPage({ currentUserId }: { currentUserId: string }) {
  const [username, setUsername] = useState('');
  const [results, setResults] = useState<UserSessions[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const search = async () => {
    if (username.trim().length < 2) return toast.error('Unesite najmanje dva znaka korisničkog imena.');
    setLoading(true);
    try {
      const { data } = await axios.get(`${backend}/user/portal/sessions`, { params: { username: username.trim() }, withCredentials: true });
      setResults(data.results || []);
      if (!data.results?.length) toast.info('Nijedan korisnik nije pronađen.');
    } catch (error) {
      const message = axios.isAxiosError(error) ? error.response?.data?.toast_message || error.response?.data?.message : null;
      toast.error(typeof message === 'string' ? message : 'Pretraga sesija nije uspela.');
    } finally { setLoading(false); }
  };

  const revokeSession = async (userId: string, session: DeviceSession) => {
    const key = `${userId}:${session.id}`;
    setBusyId(key);
    try {
      await axios.delete(`${backend}/user/portal/sessions/${session.id}`, { withCredentials: true });
      toast.success('Sesija je odjavljena.');
      if (session.current) window.location.replace('/portal/login');
      else setResults((current) => current.map((entry) => entry.user.id === userId ? { ...entry, sessions: entry.sessions.filter((item) => item.id !== session.id) } : entry));
    } catch (error) {
      const message = axios.isAxiosError(error) ? error.response?.data?.toast_message || error.response?.data?.message : null;
      toast.error(typeof message === 'string' ? message : 'Nije moguće odjaviti sesiju.');
    } finally { setBusyId(null); }
  };

  const revokeAll = async (user: UserSessions['user']) => {
    if (!window.confirm(`Odjaviti ${user.name} sa svih uređaja? Njima će biti potrebna nova prijava.`)) return;
    setBusyId(user.id);
    try {
      await axios.post(`${backend}/user/portal/sessions/${user.id}/revoke-all`, {}, { withCredentials: true });
      toast.success(`Sve sesije naloga ${user.username} su odjavljene.`);
      if (user.id === currentUserId) window.location.replace('/portal/login');
      setResults((current) => current.map((entry) => entry.user.id === user.id ? { ...entry, sessions: [] } : entry));
    } catch (error) {
      const message = axios.isAxiosError(error) ? error.response?.data?.toast_message || error.response?.data?.message : null;
      toast.error(typeof message === 'string' ? message : 'Nije moguće odjaviti sve sesije.');
    } finally { setBusyId(null); }
  };

  return <Stack>
    <div>
      <Title order={2}>Prijavljeni uređaji</Title>
      <Text c="dimmed" mt={4}>Pretražite korisničko ime, pregledajte aktivne sesije i opozovite pojedinačnu sesiju ili sve uređaje naloga.</Text>
    </div>
    <Alert color="blue" icon={<ShieldAlert size={18} />}>Opoziv sesije odmah prekida pristup tom uređaju. Opoziv svih uređaja tražiće od korisnika da se ponovo prijavi.</Alert>
    <ActionButtonsBlock className='!w-full' title='Odabir korisnika'>
      <Group className='w-full' align="end">
      <TextInput label="Korisničko ime" placeholder="npr. ime.prezime" value={username} onChange={(event) => setUsername(event.currentTarget.value)} onKeyDown={(event) => event.key === 'Enter' && void search()} style={{ flex: 1 }} />
      <Button leftSection={<Search size={16} />} onClick={() => void search()} loading={loading}>Pretraži</Button>
    </Group>
    </ActionButtonsBlock>
    {loading && <Loader size="sm" />}
    {results.map(({ user, sessions }) => <Card key={user.id} withBorder radius="md" padding="md">
      <Group justify="space-between" align="flex-start">
        <div><Group gap="xs"><Text fw={700}>{user.name}</Text><Badge variant="light">{roleNames[user.type] || user.type}</Badge></Group><Text size="sm" c="dimmed">@{user.username}</Text></div>
        <Button color="red" variant="light" size="xs" disabled={!sessions.length || Boolean(busyId)} loading={busyId === user.id} onClick={() => void revokeAll(user)}>Odjavi sve uređaje</Button>
      </Group>
      <Stack gap="xs" mt="md">
        {sessions.length === 0 ? <Text size="sm" c="dimmed">Nema aktivnih sesija.</Text> : sessions.map((session) => <Group key={session.id} justify="space-between" wrap="nowrap" className="rounded-md border p-3">
          <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}><MonitorSmartphone size={18} /><div style={{ minWidth: 0 }}><Text size="sm" fw={500}>{session.device}</Text><Text size="xs" c="dimmed">Prijava: {new Date(session.createdAt).toLocaleString('sr-RS')}</Text></div></Group>
          <Button size="xs" variant="outline" color="red" leftSection={<X size={14} />} loading={busyId === `${user.id}:${session.id}`} disabled={Boolean(busyId)} onClick={() => void revokeSession(user.id, session)}>Odjavi</Button>
        </Group>)}
      </Stack>
    </Card>)}
  </Stack>;
}
