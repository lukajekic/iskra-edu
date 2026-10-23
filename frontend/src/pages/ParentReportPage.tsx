import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import axios from "axios";
import { toast } from "sonner";
import { ChevronLeft, Download, Loader2, TrendingUp, CheckCircle2, ClipboardList, BookOpen, CalendarDays, AlertTriangle, Target, Award } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import "./ParentReportPage.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ButtonGroup } from "@/components/ui/button-group";

type Step = "loading" | "consent" | "form" | "submitting" | "report" | "error";

interface ActivityReportTask {
  taskId: string | null;
  taskTitle: string;
  language: string | null;
  status: string | null;
  code: string | null;
  stderr: string | null;
  expectedOutput: string | null;
  actualOutput: string | null;
  gradingDate: string | null;
  flags: string[];
}

interface ActivityReportTestAnswer {
  questionId: string;
  taskType: string;
  studentAnswer: unknown;
  pointsAwarded: number;
  maxPoints: number | null;
  feedback: string;
  status: string;
}

interface ActivityReportTest {
  testId: string | null;
  testTitle: string;
  grade: string | null;
  submissionStatus: string;
  totalPointsAwarded: number;
  totalPointsPossible: number;
  gradeValue: number | null;
  startedAt: string;
  submittedAt: string | null;
  answers: ActivityReportTestAnswer[];
}

interface ActivityReport {
  generatedAt: string;
  requestedBy: { parentName: string; consentVersion: string };
  student: {
    id: string;
    name: string;
    username: string;
    institution: string | null;
    teacher: { name: string; institution: string | null } | null;
    accountCreatedAt: string;
  };
  tasks: ActivityReportTask[];
  tests: ActivityReportTest[];
  summary: {
    tasksTotal: number;
    tasksAccepted: number;
    tasksInRevision: number;
    testsTotal: number;
    testsGraded: number;
    averageTestScorePercent: number | null;
  };
}

const fmt = (value?: string | null) => (value ? new Date(value).toLocaleString("sr-RS") : "—");
const pct = (value: number, total: number) => total ? Math.round(value / total * 100) : 0;
const shortDate = (value?: string | null) => value ? new Date(value).toLocaleDateString("sr-RS", { day: "2-digit", month: "short" }) : "—";
const taskStatusLabel = (status?: string | null) => ({ accepted: "Prihvaćen", revise: "Potrebna dorada", grading: "Ocenjivanje u toku", none: "Nije predat" }[status ?? ""] ?? (status ? "U obradi" : "Nije ocenjeno"));
const testStatusLabel = (status?: string | null) => ({ assigned: "Dodeljen", submitted: "Predat na ocenjivanje", graded: "Ocenjen", in_progress: "U toku" }[status ?? ""] ?? (status ? "Zabeležen" : "Status nije dostupan"));
const answerStatusLabel = (status?: string | null) => ({ correct: "Tačno", incorrect: "Netačno", none: "Nije ocenjeno", grading: "Ocenjivanje u toku", grading_error: "Potrebna provera" }[status ?? ""] ?? (status ? "Pregledano" : "Bez statusa"));
const taskTypeLabel = (type: string) => ({ Task: "Programerski zadatak", TheoryTask: "Teorijsko pitanje" }[type] ?? "Pitanje");


export default function ParentReportPage() {
  const printableContentRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState<Step>("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const [consentMarkdown, setConsentMarkdown] = useState("");
  const [consentVersion, setConsentVersion] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);

  const [parentName, setParentName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [report, setReport] = useState<ActivityReport | null>(null);

  useEffect(() => {
    const fetchConsent = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND}/parent-report/consent-notice`);
        setConsentMarkdown(response.data.markdown);
        setConsentVersion(response.data.version);
        setStep("consent");
      } catch {
        setErrorMessage("Nije moguće učitati tekst saglasnosti. Osvežite stranicu i pokušajte ponovo.");
        setStep("error");
      }
    };
    fetchConsent();
  }, []);

  const handleConsentContinue = () => {
    if (!consentChecked) return;
    setStep("form");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentName.trim() || !username.trim() || !password) {
      toast.error("Popunite sva polja.");
      return;
    }

    setStep("submitting");
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND}/parent-report`, {
        username: username.trim(),
        password,
        parentName: parentName.trim(),
        consent: true,
        consentVersion,
      });

      const data: ActivityReport = response.data;
      setReport(data);
      setStep("report");
    } catch (requestError: unknown) {
      const message = axios.isAxiosError(requestError)
        ? requestError.response?.data?.toast_message || "Prijava nije uspela. Proverite podatke i pokušajte ponovo."
        : "Prijava nije uspela. Proverite podatke i pokušajte ponovo.";
      toast.error(message);
      // Ne brišemo lozinku iz forme automatski - roditelj je verovatno samo
      // slovkao pogrešno, vraćanje na "form" umesto "consent" mu štedi ponovni klik.
      setStep("form");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const taskStatusData = report ? [
    { name: "Prihvaćeno", value: report.summary.tasksAccepted, color: "#2563eb" },
    { name: "Potrebna dorada", value: report.summary.tasksInRevision, color: "#60a5fa" },
    { name: "Ostalo", value: Math.max(0, report.summary.tasksTotal - report.summary.tasksAccepted - report.summary.tasksInRevision), color: "#cbd5e1" },
  ].filter((item) => item.value > 0) : [];
  const testChartData = report?.tests.slice().reverse().map((test, index) => ({
    name: `Test ${index + 1}`,
    datum: shortDate(test.submittedAt ?? test.startedAt),
    rezultat: test.totalPointsPossible > 0 ? Math.round(test.totalPointsAwarded / test.totalPointsPossible * 100) : 0,
  })) ?? [];
  const gradedTests = report?.tests.filter((test) => test.gradeValue !== null).length ?? 0;
  const overallTaskRate = report ? pct(report.summary.tasksAccepted, report.summary.tasksTotal) : 0;
  const answerTotals = report?.tests.flatMap((test) => test.answers).reduce((totals, answer) => ({
    earned: totals.earned + (Number(answer.pointsAwarded) || 0),
    possible: totals.possible + (Number(answer.maxPoints) || 0),
    count: totals.count + 1,
  }), { earned: 0, possible: 0, count: 0 }) ?? { earned: 0, possible: 0, count: 0 };
  const testPoints = report?.tests.reduce((totals, test) => ({ earned: totals.earned + (Number(test.totalPointsAwarded) || 0), possible: totals.possible + (Number(test.totalPointsPossible) || 0) }), { earned: 0, possible: 0 }) ?? { earned: 0, possible: 0 };
  const flaggedTaskCount = report?.tasks.filter((task) => task.flags.length > 0).length ?? 0;
  const recentActivity = report ? [...report.tasks.map((task) => ({ date: task.gradingDate, title: task.taskTitle, type: "Zadatak", status: taskStatusLabel(task.status) })), ...report.tests.map((test) => ({ date: test.submittedAt ?? test.startedAt, title: test.testTitle, type: "Test", status: test.gradeValue !== null ? `${Math.round(test.totalPointsPossible ? test.totalPointsAwarded / test.totalPointsPossible * 100 : 0)}%` : testStatusLabel(test.submissionStatus) }))].sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime()) : [];
  const recentActivityCount = recentActivity.filter((item) => item.date && Date.now() - new Date(item.date).getTime() <= 30 * 24 * 60 * 60 * 1000).length;

  if (step === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center sa-admin-theme">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 sa-admin-theme">
        <p className="text-slate-600 text-center max-w-md">{errorMessage}</p>
      </div>
    );
  }

  if (step === "consent") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center px-4 py-10 sa-admin-theme">
        <div className="max-w-2xl w-full bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-10">
          <div className="flex items-center gap-2 mb-6 text-primary">
            <span className="text-sm font-medium">Pročitajte saglasnost ispod za nastavak procesa.</span>
          </div>

          <div className="md-preview max-h-[50vh] overflow-y-auto border border-slate-100 rounded-xl p-4 mb-6">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{consentMarkdown}</ReactMarkdown>
          </div>

          <div className="flex items-start gap-2 mb-6">
            <Checkbox id="consent" checked={consentChecked} onCheckedChange={(v) => setConsentChecked(v === true)} />
            <Label htmlFor="consent" className="text-sm text-slate-600 leading-relaxed cursor-pointer">
              Pročitao/la sam gorenavedeni tekst i prihvatam obradu podataka u opisanu svrhu.
            </Label>
          </div>

          <ButtonGroup className="w-full">
            <Button variant={'secondary'} onClick={()=>{location.href = "/"}}  className="">
            Odustani
          </Button>
            <Button onClick={handleConsentContinue} disabled={!consentChecked} className="">
            Nastavi
          </Button>
          </ButtonGroup>
        </div>
      </div>
    );
  }

  if (step === "form" || step === "submitting") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center px-4 py-10 sa-admin-theme">
        <form onSubmit={handleSubmit} className="max-w-md w-full bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-10">
          <button
            type="button"
            onClick={() => setStep("consent")}
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-6"
          >
            <ChevronLeft className="w-4 h-4" /> Nazad na saglasnost
          </button>

          <h1 className="text-xl font-semibold text-slate-900 mb-1">Izveštaj o aktivnostima učenika</h1>
          <p className="text-sm text-slate-500 mb-6">
            Unesite podatke za prijavu na učenički nalog i vaše ime i prezime.
          </p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="parentName">Ime i prezime roditelja/staratelja</Label>
              <Input id="parentName" value={parentName} onChange={(e) => setParentName(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="username">Korisničko ime učenika</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1.5" autoComplete="off" />
            </div>
            <div>
              <Label htmlFor="password">Lozinka učenika</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5"
                autoComplete="off"
              />
            </div>
          </div>

          <Button type="submit" disabled={step === "submitting"} className="w-full mt-6 gap-2">
            {step === "submitting" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Generišem izveštaj...
              </>
            ) : (
              "Prikaži izveštaj"
            )}
          </Button>

          <p className="text-xs text-slate-400 mt-4 text-center">
            Isti podaci koje učenik koristi za prijavu na platformu.
          </p>
        </form>
      </div>
    );
  }

  // step === "report"
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16 print:bg-white sa-admin-theme">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-20 px-4 py-3 print:hidden">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <Button variant="ghost" size="sm" onClick={() => setStep("form")} className="gap-1.5 text-slate-600 text-sm font-medium">
            <ChevronLeft className="w-4 h-4" />
            <span>Nova pretraga</span>
          </Button>

          <Button onClick={handlePrint} size="sm" className="gap-1.5 text-xs md:text-sm font-medium">
            <Download className="w-4 h-4" />
            <span>Preuzmi PDF</span>
          </Button>
        </div>
      </header>

      <main className="parent-report-page flex-1 max-w-6xl w-full mx-auto px-4 py-8 md:py-10">
        <div
          ref={printableContentRef}
          className="planner-print-area mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm p-5 md:p-8 print:border-0 print:shadow-none print:p-0"
        >
          {report && <div className="space-y-7 print:space-y-3">
            <section className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b border-slate-200 pb-5 print:pb-2">
              <div><p className="text-xs font-semibold uppercase tracking-[.16em] text-blue-700 print:text-slate-600">Izveštaj za roditelje</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 print:text-xl">{report.student.name}</h1><p className="mt-1 text-sm text-slate-500">Korisničko ime: {report.student.username} · Generisano {fmt(report.generatedAt)}</p></div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm md:text-right print:grid-cols-2"><span className="text-slate-500">Ustanova</span><strong>{report.student.institution ?? "—"}</strong><span className="text-slate-500">Nastavnik</span><strong>{report.student.teacher?.name ?? "—"}</strong><span className="text-slate-500">Nalog od</span><strong>{shortDate(report.student.accountCreatedAt)}</strong></div>
            </section>

            <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 print:grid-cols-4 print:gap-2">
              {[
                { label: "Zadaci ukupno", value: report.summary.tasksTotal, detail: `${report.summary.tasksAccepted} prihvaćeno`, icon: ClipboardList, color: "text-blue-700 bg-blue-50" },
                { label: "Uspešnost zadataka", value: `${overallTaskRate}%`, detail: `${report.summary.tasksInRevision} potrebna dorada`, icon: CheckCircle2, color: "text-blue-600 bg-blue-50" },
                { label: "Testovi", value: report.summary.testsTotal, detail: `${gradedTests} ocenjenih`, icon: BookOpen, color: "text-blue-600 bg-blue-50" },
                { label: "Prosek testova", value: report.summary.averageTestScorePercent === null ? "—" : `${Math.round(report.summary.averageTestScorePercent)}%`, detail: `${testPoints.earned} od ${testPoints.possible} poena ukupno`, icon: TrendingUp, color: "text-blue-700 bg-blue-50" },
              ].map((metric) => <div key={metric.label} className="rounded-xl border border-slate-200 p-4 print:rounded-md print:p-2"><div className="flex items-center justify-between gap-2"><span className="text-xs font-medium text-slate-500">{metric.label}</span><metric.icon className={`h-4 w-4 ${metric.color.split(" ")[0]} print:hidden`} /></div><div className="mt-2 text-2xl font-bold text-slate-900 print:mt-0.5 print:text-lg">{metric.value}</div><div className="mt-1 text-xs text-slate-500">{metric.detail}</div></div>)}
            </section>

            <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 print:grid-cols-4 print:gap-2">
              {[
                { label: "Pitanja u testovima", value: answerTotals.count, detail: `${answerTotals.earned} / ${answerTotals.possible} poena`, icon: Target },
                { label: "Uspešnost po poenima", value: answerTotals.possible ? `${pct(answerTotals.earned, answerTotals.possible)}%` : "—", detail: "ukupno kroz sva pitanja", icon: Award },
                { label: "Aktivnost u 30 dana", value: recentActivityCount, detail: "zadataka i testova", icon: CalendarDays },
                { label: "Bezbednosna obaveštenja", value: flaggedTaskCount, detail: "zadataka sa zabeleženim upozorenjem", icon: AlertTriangle },
              ].map((metric) => <div key={metric.label} className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 print:rounded-md print:p-2"><div className="flex items-center justify-between gap-2"><span className="text-xs font-medium text-slate-500">{metric.label}</span><metric.icon className="h-4 w-4 text-blue-600 print:hidden" /></div><div className="mt-2 text-2xl font-bold text-slate-900 print:mt-0.5 print:text-lg">{metric.value}</div><div className="mt-1 text-xs text-slate-500">{metric.detail}</div></div>)}
            </section>

            {flaggedTaskCount > 0 && <section className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-950 print:rounded-md print:px-3 print:py-2"><div className="flex items-start gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-blue-700 print:hidden" /><p><strong>Zabeležena je aktivnost za proveru.</strong> Kod {flaggedTaskCount === 1 ? "jednog zadatka" : `${flaggedTaskCount} zadataka`} detektovano je potencijalno napuštanje platfome ili kopiranje rada sa eksternih izvora. Predmetni profesor ima uvid u zadatke obeležene ovim upozorenjem i finalnu odluku o legitimnosti zadatka determinira profesor.</p></div></section>}

            <section className="grid gap-4 md:grid-cols-2 print:grid-cols-2 print:gap-2">
              <div className="rounded-xl border border-blue-100 p-4 print:rounded-md print:p-2"><h2 className="font-semibold text-slate-900">Status zadataka</h2><p className="text-xs text-slate-500">Raspodela prema trenutnom ishodu</p><div className="h-48 print:hidden">{taskStatusData.length ? <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={taskStatusData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72} paddingAngle={3}>{taskStatusData.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip formatter={(value) => [`${value} zadataka`, "Broj"]} /></PieChart></ResponsiveContainer> : <div className="flex h-full items-center justify-center text-sm text-slate-400">Još nema zadataka</div>}</div><div className="hidden print:grid grid-cols-3 gap-2 pt-2 text-xs">{taskStatusData.map((item) => <div key={item.name} className="rounded bg-slate-50 p-2">{item.name}: <b>{item.value}</b></div>)}</div></div>
              <div className="rounded-xl border border-blue-100 p-4 print:rounded-md print:p-2"><h2 className="font-semibold text-slate-900">Rezultati testova</h2><p className="text-xs text-slate-500">Ostvareni poeni po testu</p><div className="h-48 print:hidden">{testChartData.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={testChartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="datum" tick={{ fontSize: 11 }} /><YAxis domain={[0, 100]} tick={{ fontSize: 11 }} /><Tooltip formatter={(value) => [`${value}%`, "Rezultat"]} /><Bar dataKey="rezultat" name="Rezultat" fill="#2563eb" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer> : <div className="flex h-full items-center justify-center text-sm text-slate-400">Još nema rezultata testova</div>}</div><div className="hidden print:block pt-2 text-xs">{testChartData.length ? testChartData.map((item) => <span key={`${item.name}-${item.datum}`} className="mr-3">{item.datum}: <b>{item.rezultat}%</b></span>) : "Nema rezultata testova."}</div></div>
            </section>

            <section className="rounded-xl border border-slate-200 p-4 print:rounded-md print:p-2"><h2 className="flex items-center gap-2 font-semibold text-slate-900"><CalendarDays className="h-4 w-4 text-slate-400 print:hidden" />Nedavna aktivnost</h2>{recentActivity.length ? <div className="mt-3 divide-y divide-slate-100 print:grid print:grid-cols-2 print:gap-x-5">{recentActivity.slice(0, 8).map((item, i) => <div key={`${item.type}-${item.title}-${i}`} className="flex items-center justify-between gap-3 py-2 text-sm print:py-1"><div className="min-w-0"><span className="mr-2 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-600">{item.type}</span><span className="font-medium text-slate-800">{item.title}</span></div><span className="shrink-0 text-xs text-slate-500">{shortDate(item.date)} · {item.status}</span></div>)}</div> : <p className="mt-2 text-sm text-slate-500">Još nema zabeležene aktivnosti.</p>}</section>

            <section className="print:break-before-page"><h2 className="mb-3 text-lg font-bold text-slate-900 print:text-base">Pregled zadataka ({report.tasks.length})</h2>{report.tasks.length ? <div className="space-y-3 print:space-y-1.5">{report.tasks.map((task, i) => <article key={`${task.taskId}-${i}`} className="rounded-xl border border-slate-200 p-4 print:break-inside-avoid print:rounded-md print:p-2"><div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="font-semibold text-slate-900">{i + 1}. {task.taskTitle}</h3><p className="mt-1 text-xs text-slate-500">{task.language ?? "Jezik nije naveden"} · Ocenjeno: {fmt(task.gradingDate)}</p></div><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{taskStatusLabel(task.status)}</span></div>{task.flags.length > 0 && <div className="mt-3 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs leading-relaxed text-blue-950 print:rounded-md print:px-2 print:py-1"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-blue-700 print:hidden" /><p><strong>Obaveštenje:</strong> Zabeležena je neuobičajena aktivnost koja može ukazivati na prepisivanje ili napuštanje platforme tokom rada. Ovaj signal je dostupan profesoru i predstavlja isključivo preporuku za dalje konsultacije.</p></div>}{(task.expectedOutput || task.actualOutput) && <div className="mt-2 grid gap-2 sm:grid-cols-2 print:grid-cols-2"><p className="text-xs"><b>Očekivani izlaz:</b> <code className="break-all">{task.expectedOutput ?? "—"}</code></p><p className="text-xs"><b>Dobijeni izlaz:</b> <code className="break-all">{task.actualOutput ?? "—"}</code></p></div>}{task.stderr && <pre className="mt-2 overflow-x-auto rounded bg-slate-50 p-2 text-xs print:whitespace-pre-wrap">{task.stderr}</pre>}{task.code && <details className="mt-2 print:block" open><summary className="cursor-pointer text-xs font-medium text-slate-600">Predati kôd</summary><pre className="mt-1 overflow-x-auto rounded bg-slate-50 p-2 text-[10px] leading-tight print:whitespace-pre-wrap">{task.code}</pre></details>}</article>)}</div> : <p className="text-sm text-slate-500">Učenik još nije radio zadatke.</p>}</section>

            <section className="print:break-before-page"><h2 className="mb-3 text-lg font-bold text-slate-900 print:text-base">Pregled testova ({report.tests.length})</h2>{report.tests.length ? <div className="space-y-3 print:space-y-1.5">{report.tests.map((test, i) => <article key={`${test.testId}-${i}`} className="rounded-xl border border-slate-200 p-4 print:break-inside-avoid print:rounded-md print:p-2"><div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="font-semibold text-slate-900">{i + 1}. {test.testTitle}</h3><p className="mt-1 text-xs text-slate-500">Početak: {fmt(test.startedAt)} · Predaja: {fmt(test.submittedAt)}</p></div><div className="text-right"><div className="font-bold text-slate-900">{test.totalPointsAwarded} / {test.totalPointsPossible} poena</div><div className="text-xs text-slate-500">{test.gradeValue !== null ? `Ocena ${test.gradeValue}` : testStatusLabel(test.submissionStatus)}</div></div></div>{test.answers.length > 0 && <div className="mt-3 divide-y divide-slate-100 border-t border-slate-100 print:mt-1">{test.answers.map((answer, qi) => <div key={answer.questionId} className="grid gap-1 py-2 text-xs sm:grid-cols-[1fr_auto_auto] sm:items-center print:grid-cols-[1fr_auto_auto] print:py-1"><span className="font-medium">Pitanje {qi + 1} · {taskTypeLabel(answer.taskType)}</span><span>{answer.pointsAwarded} / {answer.maxPoints ?? "—"} poena · {answerStatusLabel(answer.status)}</span>{answer.feedback && <span className="text-slate-500 sm:col-span-3 print:col-span-3">Povratna informacija: {answer.feedback}</span>}</div>)}</div>}</article>)}</div> : <p className="text-sm text-slate-500">Učenik još nije radio testove.</p>}</section>
          </div>}
        </div>

        {report && (
          <p className="max-w-3xl mx-auto text-xs text-slate-400 mt-4 px-1 print:hidden sa-admin-theme">
            Prijavljeno kao: {report.requestedBy.parentName}, generisano: {fmt(report.generatedAt)}
          </p>
        )}
      </main>
    </div>
  );
}
