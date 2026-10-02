import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Center,
  Collapse,
  Group,
  Loader,
  Modal,
  Paper,
  PasswordInput,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { ArrowLeft, ChevronDown, ChevronRight, KeyRound, LockKeyhole, Pencil, Plus, Printer, RefreshCw, ShieldOff, UsersRound, UserCheck, UserX } from 'lucide-react';
import ActionButtonsBlock from './core_components/ActionButtonsBlock';

type PortalRole = 'super_admin' | 'district' | 'school_main' | 'school_tenant';
type PortalUser = {
  id: string;
  name: string;
  username: string;
  type: 'portal' | 'teacher';
  role?: PortalRole;
  active: boolean;
  canManage: boolean;
  canOpenSchool?: boolean;
  createdAt: string;
  updatedAt?: string;
  institution?: string | null;
  schoolRef?: string | null;
  schoolName?: string | null;
  managedBy?: string | null;
  managerName?: string | null;
  twoFactorEnabled?: boolean;
};
type Credentials = { name: string; username: string; password?: string; type: 'portal' | 'teacher'; role?: PortalRole };
type EditorKind = 'create' | 'username' | 'password';
type Props = { role: PortalRole; userId: string };

const roleLabels: Record<PortalRole, string> = {
  super_admin: 'Super administrator',
  district: 'Okrug',
  school_main: 'Samostalna škola',
  school_tenant: 'Školski nalog',
};
const backend = import.meta.env.VITE_BACKEND;
const canCreateRoles = (role: PortalRole): PortalRole[] => {
  if (role === 'super_admin') return ['super_admin', 'district', 'school_main'];
  if (role === 'district' || role === 'school_main') return ['school_tenant'];
  return [];
};
const getApiError = (error: unknown) => axios.isAxiosError(error)
  ? error.response?.data?.toast_message || error.response?.data?.message || 'Zahtev nije uspeo. Pokušajte ponovo.'
  : 'Zahtev nije uspeo. Pokušajte ponovo.';

export default function PortalUsersPage({ role, userId }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const schoolId = searchParams.get('schoolId');
  const [users, setUsers] = useState<PortalUser[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<PortalUser | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [twoFactorFilter, setTwoFactorFilter] = useState<string | null>(null);
  const [schoolFilter, setSchoolFilter] = useState<string | null>(null);
  const [createdAfter, setCreatedAfter] = useState('');
  const [createdBefore, setCreatedBefore] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editor, setEditor] = useState<EditorKind | null>(null);
  const [selectedUser, setSelectedUser] = useState<PortalUser | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newRole, setNewRole] = useState<PortalRole | null>(canCreateRoles(role)[0] ?? null);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [credentialsVisible, setCredentialsVisible] = useState(true);

  const refreshUsers = useCallback(async (selectedSchoolId = schoolId) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get<{ users: PortalUser[]; school?: PortalUser }>(`${backend}/user/portal/users`, {
        params: selectedSchoolId ? { schoolId: selectedSchoolId } : undefined,
        withCredentials: true,
      });
      setUsers(data.users);
      setSelectedSchool(data.school ?? null);
    } catch (requestError) {
      setError(getApiError(requestError));
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    void refreshUsers();
  }, [refreshUsers]);

  useEffect(() => {
    const value = username.trim().toLowerCase();
    if (!editor || value.length < 3 || (editor === 'username' && value === selectedUser?.username.toLowerCase())) {
      setUsernameAvailable(editor === 'username' && value === selectedUser?.username.toLowerCase() ? true : null);
      setCheckingUsername(false);
      return;
    }

    let active = true;
    const timeout = window.setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const { data } = await axios.get<{ available: boolean }>(`${backend}/user/portal/users/username-availability`, {
          params: { username: value },
          withCredentials: true,
        });
        if (active) setUsernameAvailable(data.available);
      } catch {
        if (active) setUsernameAvailable(null);
      } finally {
        if (active) setCheckingUsername(false);
      }
    }, 300);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [username, editor, selectedUser]);

  useEffect(() => {
    if (!credentials) return;
    const timer = window.setTimeout(() => window.print(), 350);
    return () => window.clearTimeout(timer);
  }, [credentials]);

  const roleOptions = useMemo(() => canCreateRoles(role).map((value) => ({ value, label: roleLabels[value] })), [role]);
  const creatingTeacher = Boolean(schoolId) || role === 'school_main';
  const canCreateAccount = creatingTeacher
    ? role === 'super_admin' || role === 'district' || role === 'school_main'
    : role === 'super_admin' || role === 'district';
  const schoolOptions = useMemo(() => {
    const schools = users.filter((user) => user.canOpenSchool).map((user) => ({ value: user.id, label: user.name }));
    return selectedSchool && !schools.some((school) => school.value === selectedSchool.id)
      ? [{ value: selectedSchool.id, label: selectedSchool.name }, ...schools]
      : schools;
  }, [users, selectedSchool]);
  const filteredUsers = useMemo(() => {
    const query = searchFilter.trim().toLocaleLowerCase();
    return users.filter((user) => {
      const searchable = [user.name, user.username, user.schoolName, user.institution, user.id].filter(Boolean).join(' ').toLocaleLowerCase();
      if (query && !searchable.includes(query)) return false;
      if (typeFilter && user.type !== typeFilter) return false;
      if (roleFilter && (roleFilter === 'teacher' ? user.type !== 'teacher' : user.role !== roleFilter)) return false;
      if (statusFilter && (statusFilter === 'active') !== user.active) return false;
      if (twoFactorFilter && (twoFactorFilter === 'enabled') !== Boolean(user.twoFactorEnabled)) return false;
      if (schoolFilter && user.id !== schoolFilter && user.schoolRef !== schoolFilter) return false;
      const createdAt = new Date(user.createdAt).getTime();
      if (createdAfter && createdAt < new Date(`${createdAfter}T00:00:00`).getTime()) return false;
      if (createdBefore && createdAt > new Date(`${createdBefore}T23:59:59`).getTime()) return false;
      return true;
    });
  }, [users, searchFilter, typeFilter, roleFilter, statusFilter, twoFactorFilter, schoolFilter, createdAfter, createdBefore]);
  const closeEditor = () => {
    setEditor(null);
    setSelectedUser(null);
    setDisplayName('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setUsernameAvailable(null);
    setError(null);
  };

  const openCreate = () => {
    setNewRole(canCreateRoles(role)[0] ?? null);
    setEditor('create');
    setError(null);
  };

  const openUserEditor = (kind: 'username' | 'password', user: PortalUser) => {
    setSelectedUser(user);
    setUsername(kind === 'username' ? user.username : '');
    setPassword('');
    setConfirmPassword('');
    setEditor(kind);
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    setError(null);
    if (editor === 'create' && !creatingTeacher && (!newRole || !roleOptions.some((option) => option.value === newRole))) {
      setError('Izaberite dozvoljenu ulogu.');
      return;
    }
    if (editor === 'create' && !displayName.trim()) {
      setError('Unesite ime osobe ili naziv naloga.');
      return;
    }
    if (editor !== 'username' && password.length < 1) {
      setError('Unesite lozinku.');
      return;
    }
    if (editor !== 'username' && password !== confirmPassword) {
      setError('Lozinke se ne podudaraju.');
      return;
    }
    if (usernameAvailable === false) {
      setError('Korisničko ime je zauzeto. Izaberite drugo.');
      return;
    }

    setSaving(true);
    try {
      if (editor === 'create') {
        const { data } = await axios.post<{ user: PortalUser; credentials: Credentials }>(`${backend}/user/portal/users`, {
          name: displayName.trim(),
          username: username.trim(),
          password,
          accountType: creatingTeacher ? 'teacher' : newRole,
          ...(creatingTeacher && schoolId ? { schoolId } : {}),
        }, { withCredentials: true });
        setCredentials({ ...data.credentials, name: data.user.name, type: data.user.type, role: data.user.role });
        setCredentialsVisible(true);
      } else if (selectedUser && editor === 'username') {
        await axios.patch(`${backend}/user/portal/users/${selectedUser.id}/username`, { username: username.trim() }, { withCredentials: true });
      } else if (selectedUser && editor === 'password') {
        const { data } = await axios.patch<{ user: PortalUser; credentials: Credentials }>(`${backend}/user/portal/users/${selectedUser.id}/password`, { password }, { withCredentials: true });
        setCredentials({ ...data.credentials, name: data.user.name, type: data.user.type, role: data.user.role });
        setCredentialsVisible(true);
      }
      closeEditor();
      await refreshUsers();
    } catch (requestError) {
      setError(getApiError(requestError));
    } finally {
      setSaving(false);
    }
  };

  const revokeTwoFactor = async (user: PortalUser) => {
    if (!window.confirm(`Opozvati 2FA za nalog ${user.username}? Korisnik će morati ponovo da podesi autentifikator.`)) return;
    setError(null);
    try {
      await axios.post(`${backend}/user/portal/users/${user.id}/revoke-2fa`, {}, { withCredentials: true });
      await refreshUsers();
    } catch (requestError) {
      setError(getApiError(requestError));
    }
  };

  const setAccountAccess = async (user: PortalUser) => {
    const active = !user.active;
    const action = active ? 'vratiti' : 'opozvati';
    if (!window.confirm(`Da li želite da ${action} portal pristup nalogu ${user.username}?`)) return;
    setError(null);
    try {
      await axios.patch(`${backend}/user/portal/users/${user.id}/access`, { active }, { withCredentials: true });
      await refreshUsers();
    } catch (requestError) {
      setError(getApiError(requestError));
    }
  };

  const openSchool = (user: PortalUser) => setSearchParams({ schoolId: user.id });
  const closeSchool = () => setSearchParams({});

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end" wrap="wrap">
        <div>
          <Group gap="xs" mb={4}>
            {schoolId && <Button variant="default" size="xs" leftSection={<ArrowLeft size={15} />} onClick={closeSchool}>Nazad</Button>}
            <UsersRound size={22} color="var(--mantine-color-blue-6)" />
            <Title order={2}>{schoolId ? `Korisnici škole: ${selectedSchool?.name ?? 'Učitavanje…'}` : role === 'school_main' ? 'Korisnici škole' : role === 'school_tenant' ? 'Moji korisnici' : 'Nalozi i škole'}</Title>
          </Group>
          <Text c="dimmed" size="sm">
            {schoolId
              ? 'Pregledajte, dodajte i upravljajte nastavničkim nalozima ove škole.'
              : role === 'super_admin' || role === 'district'
                ? 'Izaberite školu da biste otvorili njene korisnike i upravljali njihovim nalozima.'
                : role === 'school_main'
                  ? 'Dodajte nastavnike; nalozi su vezani za ovu školu i nemaju portal pristup ni 2FA.'
                  : 'Pregledajte i upravljajte korisnicima koji pripadaju ovoj školi.'}
          </Text>
        </div>
        <ActionButtonsBlock title="Akcije">
          <Button variant="default" leftSection={<RefreshCw size={16} />} onClick={() => void refreshUsers()} loading={loading}>Osveži</Button>
          {canCreateAccount && <Button leftSection={<Plus size={16} />} onClick={openCreate}>{creatingTeacher ? 'Novi profesor' : 'Novi nalog'}</Button>}
          {credentials && !credentialsVisible && <Button variant="light" leftSection={<Printer size={16} />} onClick={() => window.print()}>Ponovo štampaj poslednje kredencijale</Button>}
        </ActionButtonsBlock>
      </Group>

      {error && <Alert color="red" title="Greška" withCloseButton onClose={() => setError(null)}>{error}</Alert>}

      {role === 'school_tenant' && (
          <Alert color="blue" title="Školski nalog" icon={<LockKeyhole size={18} />}>
          Možete upravljati samo korisnicima ove škole. Kreiranje novih nastavničkih naloga nije dostupno ovom nalogu.
        </Alert>
      )}

      <Paper withBorder radius={0} shadow="xs" p="md">
        <Stack gap="md">
        <Group grow align="flex-end" wrap="wrap">
          <TextInput label="Pretraga" placeholder="Ime, username, škola ili ID" value={searchFilter} onChange={(event) => setSearchFilter(event.currentTarget.value)} />
          <Select label="Tip naloga" placeholder="Svi tipovi" clearable data={[{ value: 'portal', label: 'Portal nalog' }, { value: 'teacher', label: 'Nastavnik' }]} value={typeFilter} onChange={setTypeFilter} />
          <Select label="Uloga" placeholder="Sve uloge" clearable data={[...Object.entries(roleLabels).map(([value, label]) => ({ value, label })), { value: 'teacher', label: 'Nastavnik' }]} value={roleFilter} onChange={setRoleFilter} />
          <Select label="Status" placeholder="Svi statusi" clearable data={[{ value: 'active', label: 'Aktivan' }, { value: 'inactive', label: 'Blokiran' }]} value={statusFilter} onChange={setStatusFilter} />
          <Select label="2FA" placeholder="Sve" clearable data={[{ value: 'enabled', label: 'Podešena' }, { value: 'disabled', label: 'Nije podešena' }]} value={twoFactorFilter} onChange={setTwoFactorFilter} />
          <Select label="Škola" placeholder="Sve škole" clearable searchable data={schoolOptions} value={schoolFilter} onChange={setSchoolFilter} />
          <TextInput type="date" label="Kreiran od" value={createdAfter} onChange={(event) => setCreatedAfter(event.currentTarget.value)} />
          <TextInput type="date" label="Kreiran do" value={createdBefore} onChange={(event) => setCreatedBefore(event.currentTarget.value)} />
          <Button variant="default" onClick={() => { setSearchFilter(''); setTypeFilter(null); setRoleFilter(null); setStatusFilter(null); setTwoFactorFilter(null); setSchoolFilter(null); setCreatedAfter(''); setCreatedBefore(''); }}>Očisti filtere</Button>
        </Group>
        <Text size="sm" c="dimmed">Prikazano {filteredUsers.length} od {users.length} naloga. Kliknite red za detalje.</Text>
        {loading ? <Center py="xl"><Loader /></Center> : users.length === 0 ? (
          <Center py="xl"><Stack align="center" gap="xs"><UsersRound size={32} color="var(--mantine-color-gray-5)" /><Text c="dimmed">Još nema korisnika u ovoj nadležnosti.</Text></Stack></Center>
        ) : filteredUsers.length === 0 ? (
          <Center py="xl"><Text c="dimmed">Nema naloga koji odgovaraju izabranim filterima.</Text></Center>
        ) : (
          <ScrollArea>
            <Table highlightOnHover verticalSpacing="sm" miw={700}>
              <Table.Thead>
                <Table.Tr><Table.Th>Nalog</Table.Th><Table.Th>Korisničko ime</Table.Th><Table.Th>Tip naloga</Table.Th><Table.Th>Status</Table.Th><Table.Th ta="right">Radnje</Table.Th></Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredUsers.map((user) => (
                  <Fragment key={user.id}>
                  <Table.Tr key={user.id} onClick={() => setExpandedUserId((current) => current === user.id ? null : user.id)} style={{ cursor: 'pointer' }}>
                    <Table.Td><Text fw={600}>{user.name}</Text><Text size="xs" c="dimmed">Kreiran {new Date(user.createdAt).toLocaleDateString('sr-RS')}</Text></Table.Td>
                    <Table.Td><Text ff="monospace">{user.username}</Text></Table.Td>
                    <Table.Td><Badge variant="light" color={user.type === 'teacher' ? 'gray' : user.role === 'super_admin' ? 'violet' : user.role === 'district' ? 'blue' : 'teal'}>{user.type === 'teacher' ? 'Nastavnik' : user.role ? roleLabels[user.role] : 'Portal nalog'}</Badge>{user.schoolName && <Text size="xs" c="dimmed" mt={3}>{user.schoolName}</Text>}</Table.Td>
                    <Table.Td><Badge color={user.active ? 'green' : 'red'} variant="dot">{user.active ? 'Aktivan' : 'Blokiran'}</Badge></Table.Td>
                    <Table.Td>
                      <Group justify="flex-end" gap="xs" wrap="nowrap" onClick={(event) => event.stopPropagation()}>
                      {user.canOpenSchool && <Button size="xs" variant="light" onClick={() => openSchool(user)}>Korisnici škole</Button>}
                      {user.canManage && user.id !== userId ? (
                        <Group gap={4} wrap="nowrap">
                          <Tooltip label="Promeni korisničko ime"><ActionIcon variant="subtle" aria-label={`Promeni ime naloga ${user.username}`} onClick={() => openUserEditor('username', user)}><Pencil size={17} /></ActionIcon></Tooltip>
                          <Tooltip label="Resetuj lozinku i odštampaj kredencijale"><ActionIcon variant="subtle" color="blue" aria-label={`Resetuj lozinku za ${user.username}`} onClick={() => openUserEditor('password', user)}><KeyRound size={17} /></ActionIcon></Tooltip>
                          {user.type === 'portal' && <Tooltip label="Opozovi 2FA"><ActionIcon variant="subtle" color="orange" aria-label={`Opozovi 2FA za ${user.username}`} onClick={() => void revokeTwoFactor(user)}><ShieldOff size={17} /></ActionIcon></Tooltip>}
                          <Tooltip label={user.active ? 'Opozovi pristup nalogu' : 'Vrati pristup nalogu'}><ActionIcon variant="subtle" color={user.active ? 'red' : 'green'} aria-label={`${user.active ? 'Opozovi' : 'Vrati'} pristup za ${user.username}`} onClick={() => void setAccountAccess(user)}>{user.active ? <UserX size={17} /> : <UserCheck size={17} />}</ActionIcon></Tooltip>
                        </Group>
                      ) : <Text size="xs" c="dimmed" ta="right">{user.id === userId ? 'Vaš nalog' : 'Zaštićen nalog'}</Text>}
                      {expandedUserId === user.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td colSpan={5} p={0}>
                      <Collapse expanded={expandedUserId === user.id}>
                        <Paper p="md" radius={0} bg="var(--mantine-color-gray-0)">
                          <Group align="flex-start" gap="xl" wrap="wrap">
                            <Stack gap={4}><Text size="xs" c="dimmed">Interni ID</Text><Text size="sm" ff="monospace" style={{ userSelect: 'all' }}>{user.id}</Text></Stack>
                            <Stack gap={4}><Text size="xs" c="dimmed">Tip / uloga</Text><Text size="sm">{user.type === 'teacher' ? 'Nastavnik (teacher)' : `Portal · ${user.role ? roleLabels[user.role] : 'bez uloge'}`}</Text></Stack>
                            {(user.schoolName || user.schoolRef) && <Stack gap={4}><Text size="xs" c="dimmed">Matična škola</Text><Text size="sm">{user.schoolName || user.institution || 'Škola'}{user.schoolRef ? ` · ${user.schoolRef}` : ''}</Text></Stack>}
                            {user.institution && <Stack gap={4}><Text size="xs" c="dimmed">Ustanova</Text><Text size="sm">{user.institution}</Text></Stack>}
                            {user.managedBy && <Stack gap={4}><Text size="xs" c="dimmed">Kreirao / nadležni administrator</Text><Text size="sm">{user.managerName || user.managedBy}</Text></Stack>}
                            {user.type === 'portal' && <Stack gap={4}><Text size="xs" c="dimmed">Dvofaktorska prijava</Text><Text size="sm">{user.twoFactorEnabled ? 'Podešena' : 'Nije podešena'}</Text></Stack>}
                            <Stack gap={4}><Text size="xs" c="dimmed">Kreiran</Text><Text size="sm">{new Date(user.createdAt).toLocaleString('sr-RS')}</Text></Stack>
                            {user.updatedAt && <Stack gap={4}><Text size="xs" c="dimmed">Poslednja izmena</Text><Text size="sm">{new Date(user.updatedAt).toLocaleString('sr-RS')}</Text></Stack>}
                          </Group>
                        </Paper>
                      </Collapse>
                    </Table.Td>
                  </Table.Tr>
                  </Fragment>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        )}
        </Stack>
      </Paper>

      <Modal opened={editor !== null} onClose={closeEditor} title={editor === 'create' ? creatingTeacher ? 'Novi profesor' : 'Novi portal nalog' : editor === 'username' ? 'Promena korisničkog imena' : 'Reset lozinke'} centered radius={0}>
        <form onSubmit={handleSubmit}>
          <Stack>
            {editor === 'create' && <>
              <TextInput label={creatingTeacher ? 'Ime i prezime profesora' : 'Ime osobe ili naziv naloga'} placeholder="npr. Ana Petrović" value={displayName} onChange={(event) => setDisplayName(event.currentTarget.value)} maxLength={100} required />
              {creatingTeacher
                ? <Alert color="blue" icon={<LockKeyhole size={18} />}>Kreira se običan nastavnički nalog bez portal pristupa i bez 2FA. Školska veza se upisuje automatski.</Alert>
                : <Select label="Portal uloga" data={roleOptions} value={newRole} onChange={(value) => setNewRole(value as PortalRole | null)} required />}
            </>}
            {editor !== 'password' && <TextInput
              label="Korisničko ime"
              description="3–32 znaka: mala slova, brojevi, tačka, crtica ili donja crta."
              value={username}
              onChange={(event) => setUsername(event.currentTarget.value.toLowerCase())}
              minLength={3}
              maxLength={32}
              autoComplete="off"
              required
              rightSection={checkingUsername ? <Loader size={14} /> : usernameAvailable === null ? null : <Text size="xs" c={usernameAvailable ? 'green' : 'red'}>{usernameAvailable ? 'Slobodno' : 'Zauzeto'}</Text>}
              rightSectionWidth={72}
            />}
            {editor !== 'username' && <>
              <PasswordInput label={editor === 'create' ? 'Početna lozinka' : 'Nova lozinka'} description="Lozinka je obavezna i može imati do 128 znakova. Čuva se kao hash." value={password} onChange={(event) => setPassword(event.currentTarget.value)} maxLength={128} autoComplete="new-password" required />
              <PasswordInput label="Potvrdite lozinku" value={confirmPassword} onChange={(event) => setConfirmPassword(event.currentTarget.value)} maxLength={128} autoComplete="new-password" required />
            </>}
            {editor === 'username' && <Alert color="yellow" icon={<LockKeyhole size={18} />}>Promena korisničkog imena odjavljuje postojeće sesije. Lozinka ostaje nepromenjena; za ponovno štampanje kompletnih kredencijala izaberite reset lozinke.</Alert>}
            {error && <Alert color="red">{error}</Alert>}
            <Group justify="flex-end" mt="xs"><Button variant="default" onClick={closeEditor}>Otkaži</Button><Button type="submit" loading={saving} disabled={editor !== 'password' && usernameAvailable === false}>{editor === 'create' ? creatingTeacher ? 'Kreiraj profesora i štampaj' : 'Kreiraj i štampaj' : editor === 'username' ? 'Sačuvaj ime' : 'Resetuj i štampaj'}</Button></Group>
          </Stack>
        </form>
      </Modal>

      {credentials && <>
        {credentialsVisible && <Group justify="flex-end" className="portal-no-print">
          <Button leftSection={<Printer size={16} />} onClick={() => window.print()}>Ponovo štampaj kredencijale</Button>
          <Button variant="default" onClick={() => setCredentialsVisible(false)}>Zatvori prikaz</Button>
        </Group>}
        <Paper id="portal-credential-print" p="xl" maw={720} mx="auto" withBorder radius={0}>
          <Stack gap="md">
            <Group justify="space-between"><Group><img src="/favicon.png" alt="Iskra" width="36" height="36" /><div><Text fw={800} size="lg">Iskra · {credentials.type === 'teacher' ? 'školski nalog' : 'pristup portalu'}</Text><Text size="sm" c="dimmed">Podaci za prijavu</Text></div></Group><Badge variant="light">{credentials.type === 'teacher' ? 'Nastavnik' : credentials.role ? roleLabels[credentials.role] : 'Portal nalog'}</Badge></Group>
            <Text>{credentials.type === 'teacher' ? 'Ovo je standardni nastavni nalog za aplikaciju Iskra. Ne koristi portal i ne zahteva 2FA.' : 'Sačuvajte ovaj dokument na sigurnom mestu. Prilikom prvog prijavljivanja biće potrebno povezati aplikaciju za autentifikaciju.'}</Text>
            <Paper withBorder p="md" radius={0}><Stack gap="xs"><Text size="sm" c="dimmed">Korisničko ime</Text><Text fw={700} size="lg" ff="monospace">{credentials.username}</Text>{credentials.password && <><Text size="sm" c="dimmed" mt="sm">Početna lozinka</Text><Text fw={700} size="lg" ff="monospace" style={{ overflowWrap: 'anywhere' }}>{credentials.password}</Text></>}</Stack></Paper>
            <Title order={4}>Uputstvo za prvo prijavljivanje</Title>
            {credentials.type === 'teacher' ? (
              <ol><li>Otvorite <strong>{window.location.origin}/auth/onboarding</strong>.</li><li>Izaberite karticu „Korisničko ime i lozinka” i unesite podatke sa ovog dokumenta.</li><li>Nakon prijave aplikacija otvara nastavni deo na adresi <strong>{window.location.origin}/app/teacher</strong>.</li><li>Ovaj nalog koristi samo korisničko ime i lozinku; nema portal pristup ni 2FA.</li></ol>
            ) : (
              <ol><li>Otvorite <strong>{window.location.origin}/portal/login</strong>.</li><li>Unesite korisničko ime i početnu lozinku navedene iznad.</li><li>Skenirajte QR kod stranice aplikacijom za autentifikaciju (npr. Google Authenticator ili Microsoft Authenticator).</li><li>Unesite šestocifreni kod iz aplikacije da biste završili podešavanje.</li><li>Čuvajte lozinku i pristup autentifikatoru privatno. Administrator može resetovati lozinku ili opozvati 2FA.</li></ol>
            )}
            <Text size="xs" c="dimmed">Iz bezbednosnih razloga sistem ne čuva lozinke u čitljivom obliku. Za naknadno izdavanje kompletnog primerka, administrator mora resetovati lozinku i odštampati nove kredencijale.</Text>
          </Stack>
        </Paper>
        <style>{`@media screen { #portal-credential-print { display: none; } } @media print { @page { margin: 16mm; } body * { visibility: hidden !important; } #portal-credential-print, #portal-credential-print * { visibility: visible !important; } #portal-credential-print { display: block !important; position: absolute !important; inset: 0 auto auto 0 !important; width: 100% !important; max-width: none !important; border: 0 !important; box-shadow: none !important; } .portal-no-print { display: none !important; } }`}</style>
      </>}
    </Stack>
  );
}
