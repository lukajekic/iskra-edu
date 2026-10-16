import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Alert, Badge, Button, Card, Group, Loader, Modal, SegmentedControl, Select, Stack, Table, Text, TextInput, Textarea, Title } from '@mantine/core';
import { Check, ClipboardCheck, Play, RefreshCw, ShieldCheck, Trash2, X } from 'lucide-react';

const backend = import.meta.env.VITE_BACKEND;
type Rating = 'satisfactory' | 'unsatisfactory';
type Result = { testId: string; module: string; category: string; title: string; prompt: string; expectedBehavior: string; actualResult: string; rating: Rating | null; reviewerNote: string; durationMs: number; model: string };
type Report = { _id: string; suiteVersion: string; startedByName: string; startedAt: string; completedAt?: string; status: string; summary: { total: number; satisfactory?: number; unsatisfactory?: number; pending?: number }; results?: Result[] };
const ratingLabel: Record<Rating, string> = { satisfactory: 'Zadovoljava', unsatisfactory: 'Nezadovoljava' };
const categoryLabel: Record<string, string> = { 'valid-school': 'Validan školski upit', 'prompt-injection': 'Prompt injection', 'off-topic': 'Van obrazovnog konteksta', 'abusive-content': 'Uvredljiv sadržaj', 'sexual-content': 'Seksualni sadržaj' };
const moduleLabel: Record<string, string> = { planner: 'Planner', mentor: 'AI Mentor', canvas: 'Canvas' };
const dateLabel = (value: string) => new Date(value).toLocaleString('sr-RS');
const getError = (error: unknown) => axios.isAxiosError(error) ? error.response?.data?.message || error.response?.data?.toast_message || 'Zahtev nije uspeo.' : 'Zahtev nije uspeo.';

export default function AISafetyPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [selected, setSelected] = useState<Report | null>(null);
  const [module, setModule] = useState('all');
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeResult, setActiveResult] = useState<Result | null>(null);
  const [rating, setRating] = useState<Rating | null>(null);
  const [reviewerNote, setReviewerNote] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteOtp, setDeleteOtp] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const refresh = useCallback(async (reportId?: string, preferCurrent = true) => {
    setLoading(true); setError('');
    try {
      const { data } = await axios.get<{ reports: Report[] }>(`${backend}/user/portal/ai-safety/reports`, { withCredentials: true });
      setReports(data.reports);
      const target = reportId || (preferCurrent ? selected?._id : undefined);
      const id = target || data.reports[0]?._id;
      if (id) {
        const { data: detail } = await axios.get<{ report: Report }>(`${backend}/user/portal/ai-safety/reports/${id}`, { withCredentials: true });
        setSelected(detail.report);
      } else setSelected(null);
    } catch (requestError) { setError(getError(requestError)); }
    finally { setLoading(false); }
  }, [selected?._id]);

  useEffect(() => { void refresh(); }, [refresh]);

  const run = async () => {
    setRunning(true); setError('');
    try {
      const { data } = await axios.post<{ report: Report }>(`${backend}/user/portal/ai-safety/runs`, { module }, { withCredentials: true, timeout: 300000 });
      await refresh(data.report._id);
    } catch (requestError) { setError(getError(requestError)); }
    finally { setRunning(false); }
  };

  const openEvaluation = (result: Result) => {
    setActiveResult(result);
    setRating(result.rating);
    setReviewerNote(result.reviewerNote || '');
  };

  const saveEvaluation = async () => {
    if (!selected || !activeResult || !rating) return;
    setSaving(true); setError('');
    try {
      const { data } = await axios.patch<{ report: Report }>(`${backend}/user/portal/ai-safety/reports/${selected._id}/evaluation`, { testId: activeResult.testId, rating, reviewerNote }, { withCredentials: true });
      setSelected(data.report);
      setReports((current) => current.map((item) => item._id === data.report._id ? { ...item, summary: data.report.summary } : item));
      setActiveResult(null);
    } catch (requestError) { setError(getError(requestError)); }
    finally { setSaving(false); }
  };

  const deleteReport = async () => {
    if (!selected || !/^\d{6}$/.test(deleteOtp)) return;
    setDeleting(true); setDeleteError(''); setError('');
    try {
      await axios.delete(`${backend}/user/portal/ai-safety/reports/${selected._id}`, { data: { otp: deleteOtp }, withCredentials: true });
      setDeleteOpen(false);
      setDeleteOtp('');
      setSelected(null);
      await refresh(undefined, false);
    } catch (requestError) { setDeleteError(getError(requestError)); }
    finally { setDeleting(false); }
  };

  const results = selected?.results || [];
  const pending = selected?.summary.pending ?? results.filter((item) => !item.rating).length;
  const satisfactory = selected?.summary.satisfactory ?? results.filter((item) => item.rating === 'satisfactory').length;
  const unsatisfactory = selected?.summary.unsatisfactory ?? results.filter((item) => item.rating === 'unsatisfactory').length;

  return <Stack p="md" maw={1400} mx="auto" gap="lg">
    <Group justify="space-between" align="flex-start">
      <div><Group gap="xs"><ShieldCheck size={23} /><Title order={2}>AI bezbednost</Title></Group><Text c="dimmed" mt={5}>Pregledajte svaki odgovor i ručno ocenite da li zadovoljava očekivano ponašanje.</Text></div>
      <Group><Select aria-label="Izbor modula" value={module} onChange={(value) => setModule(value || 'all')} data={[{ value: 'all', label: 'Sva tri modula' }, { value: 'planner', label: 'Planner' }, { value: 'mentor', label: 'AI Mentor' }, { value: 'canvas', label: 'Canvas' }]} w={180} /><Button leftSection={running ? <Loader size={15} /> : <Play size={16} />} onClick={() => void run()} disabled={running}>{running ? 'Testiranje…' : 'Pokreni testove'}</Button></Group>
    </Group>
    {error && <Alert color="red" title="Došlo je do greške">{error}</Alert>}
    {running && <Alert color="blue" title="Testovi su u toku">Svaki test šalje zahtev ka AI servisu. Pokretanje može trajati nekoliko minuta.</Alert>}
    <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
      <Card withBorder radius="md" padding="md"><Group justify="space-between" mb="sm"><Title order={4}>Izveštaji</Title><Button variant="subtle" size="xs" leftSection={<RefreshCw size={14} />} onClick={() => void refresh()} aria-label="Osveži izveštaje" /></Group>
        {loading ? <Loader size="sm" /> : reports.length ? <Stack gap="xs">{reports.map((report) => <Button key={report._id} variant={selected?._id === report._id ? 'light' : 'subtle'} color="gray" h="auto" py="sm" onClick={() => void refresh(report._id)} styles={{ inner: { justifyContent: 'flex-start' }, label: { whiteSpace: 'normal', textAlign: 'left', width: '100%' } }}><Stack gap={3} w="100%"><Text size="sm" fw={600}>{dateLabel(report.startedAt)}</Text><Text size="xs" c="dimmed">{report.startedByName} · {report.summary.total} testova</Text><Text size="xs">✓ {report.summary.satisfactory ?? 0} · ✕ {report.summary.unsatisfactory ?? 0} · Čeka ocenu {report.summary.pending ?? report.summary.total}</Text></Stack></Button>)}</Stack> : <Text c="dimmed" size="sm">Još nema izveštaja.</Text>}
      </Card>
      <Card withBorder radius="md" padding="md">
        {!selected ? <Text c="dimmed">Pokrenite testove da biste napravili prvi izveštaj.</Text> : <Stack gap="md"><Group justify="space-between"><div><Title order={4}>Izveštaj · {dateLabel(selected.startedAt)}</Title><Text size="sm" c="dimmed">Skup {selected.suiteVersion} · pokrenuo {selected.startedByName}</Text></div><Group><Badge size="lg" color="blue">{results.length} testova</Badge><Button color="red" variant="light" leftSection={<Trash2 size={15} />} onClick={() => { setDeleteOtp(''); setDeleteOpen(true); }}>Obriši izveštaj</Button></Group></Group>
          <Group gap="xs"><Badge color="green" leftSection={<Check size={12} />}>Zadovoljava: {satisfactory}</Badge><Badge color="red" leftSection={<X size={12} />}>Nezadovoljava: {unsatisfactory}</Badge><Badge color="gray">Čeka ocenu: {pending}</Badge></Group>
          <div className="overflow-x-auto"><Table striped highlightOnHover verticalSpacing="sm" miw={690}><Table.Thead><Table.Tr><Table.Th>Modul</Table.Th><Table.Th>Kategorija</Table.Th><Table.Th>Test</Table.Th><Table.Th>Ocena</Table.Th><Table.Th ta="right">Akcija</Table.Th></Table.Tr></Table.Thead><Table.Tbody>{results.map((result) => <Table.Tr key={result.testId}><Table.Td><Text size="sm" fw={600}>{moduleLabel[result.module] || result.module}</Text></Table.Td><Table.Td><Text size="sm">{categoryLabel[result.category] || result.category}</Text></Table.Td><Table.Td><Text size="sm">{result.title}</Text></Table.Td><Table.Td>{result.rating ? <Badge color={result.rating === 'satisfactory' ? 'green' : 'red'}>{ratingLabel[result.rating]}</Badge> : <Badge color="gray">Nije ocenjeno</Badge>}</Table.Td><Table.Td ta="right"><Button size="xs" variant="light" leftSection={<ClipboardCheck size={14} />} onClick={() => openEvaluation(result)}>{result.rating ? 'Izmeni ocenu' : 'Oceni'}</Button></Table.Td></Table.Tr>)}</Table.Tbody></Table></div>
        </Stack>}
      </Card>
    </div>
    <Modal opened={Boolean(activeResult)} onClose={() => !saving && setActiveResult(null)} title={<Text fw={700}>Ocena testa</Text>} size="lg" centered>
      {activeResult && <Stack gap="md"><Group gap="xs"><Badge>{moduleLabel[activeResult.module]}</Badge><Badge variant="light">{categoryLabel[activeResult.category]}</Badge></Group><Title order={4}>{activeResult.title}</Title><div><Text size="sm" fw={600} mb={4}>Testni zahtev</Text><Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{activeResult.prompt}</Text></div><div><Text size="sm" fw={600} mb={4}>Očekivano ponašanje</Text><Text size="sm">{activeResult.expectedBehavior}</Text></div><div><Text size="sm" fw={600} mb={4}>Odgovor AI-ja</Text><Card withBorder padding="sm" radius="sm" mah={260} style={{ overflowY: 'auto' }}><Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{activeResult.actualResult || 'AI nije vratio odgovor.'}</Text><Text size="xs" c="dimmed" mt="sm">{activeResult.model} · {(activeResult.durationMs / 1000).toFixed(1)} s</Text></Card></div><div><Text size="sm" fw={600} mb={6}>Ocena</Text><SegmentedControl fullWidth value={rating || ''} onChange={(value) => setRating(value as Rating)} data={[{ value: 'satisfactory', label: <Group gap={6} justify="center"><Check size={15} />Zadovoljava</Group> }, { value: 'unsatisfactory', label: <Group gap={6} justify="center"><X size={15} />Nezadovoljava</Group> }]} /></div><Textarea label="Beleška" placeholder="Unesite razlog za ocenu ili dodatno zapažanje…" value={reviewerNote} onChange={(event) => setReviewerNote(event.currentTarget.value)} maxLength={2000} autosize minRows={3} maxRows={7} required /><Group justify="flex-end"><Button variant="default" onClick={() => setActiveResult(null)} disabled={saving}>Otkaži</Button><Button leftSection={<Check size={15} />} onClick={() => void saveEvaluation()} loading={saving} disabled={!rating || !reviewerNote.trim()}>Sačuvaj ocenu</Button></Group></Stack>}
    </Modal>
    <Modal opened={deleteOpen} onClose={() => !deleting && setDeleteOpen(false)} title="Potvrda brisanja izveštaja" centered>
      <Stack gap="md"><Text size="sm">Brisanje izveštaja <b>{selected ? dateLabel(selected.startedAt) : ''}</b> je trajno. Unesite trenutni šestocifreni OTP kod iz autentifikatora ovog super administratorskog naloga.</Text>{deleteError && <Alert color="red" title="Brisanje nije uspelo">{deleteError}</Alert>}<TextInput label="OTP kod" placeholder="000000" value={deleteOtp} onChange={(event) => { setDeleteOtp(event.currentTarget.value.replace(/\D/g, '').slice(0, 6)); setDeleteError(''); }} inputMode="numeric" autoComplete="one-time-code" maxLength={6} required /><Group justify="flex-end"><Button variant="default" onClick={() => setDeleteOpen(false)} disabled={deleting}>Otkaži</Button><Button color="red" leftSection={<Trash2 size={15} />} onClick={() => void deleteReport()} loading={deleting} disabled={deleteOtp.length !== 6}>Trajno obriši</Button></Group></Stack>
    </Modal>
  </Stack>;
}
