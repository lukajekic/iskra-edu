import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import axios from "axios";
import { toast } from "sonner";
import { ChevronLeft, Download, Loader2, ShieldCheck } from "lucide-react";
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


function buildMarkdownFromReport(report: ActivityReport): string {
  const { student, tasks, tests, summary, generatedAt } = report;

  let md = `# Izveštaj o aktivnostima učenika\n\n`;
  md += `**Učenik:** ${student.name} (${student.username})  \n`;
  md += `**Ustanova:** ${student.institution ?? "—"}  \n`;
  md += `**Nastavnik:** ${student.teacher?.name ?? "—"}  \n`;
  md += `**Nalog kreiran:** ${fmt(student.accountCreatedAt)}  \n`;
  md += `**Izveštaj generisan:** ${fmt(generatedAt)}\n\n---\n\n`;

  md += `## Pregled\n\n`;
  md += `| Metrika | Vrednost |\n| :--- | :--- |\n`;
  md += `| Ukupno zadataka | ${summary.tasksTotal} |\n`;
  md += `| Prihvaćeno | ${summary.tasksAccepted} |\n`;
  md += `| Na doradi | ${summary.tasksInRevision} |\n`;
  md += `| Ukupno testova | ${summary.testsTotal} |\n`;
  md += `| Ocenjeno testova | ${summary.testsGraded} |\n`;
  md += `| Prosečan rezultat na testovima | ${summary.averageTestScorePercent !== null ? summary.averageTestScorePercent + "%" : "—"} |\n\n`;

  md += `---\n\n## Zadaci (${tasks.length})\n\n`;
  if (tasks.length === 0) {
    md += `_Učenik još nije radio nijedan zadatak._\n\n`;
  }
  tasks.forEach((t, i) => {
    md += `### ${i + 1}. ${t.taskTitle}\n\n`;
    md += `- **Jezik:** ${t.language ?? "—"}\n`;
    md += `- **Status:** ${t.status ?? "—"}\n`;
    md += `- **Datum ocenjivanja:** ${fmt(t.gradingDate)}\n\n`;
    if (t.code) {
      md += `**Predati kôd:**\n\n\`\`\`${t.language ?? ""}\n${t.code}\n\`\`\`\n\n`;
    }
    if (t.stderr) {
      md += `**Greška pri izvršavanju:**\n\n\`\`\`\n${t.stderr}\n\`\`\`\n\n`;
    }
  });

  md += `---\n\n## Testovi (${tests.length})\n\n`;
  if (tests.length === 0) {
    md += `_Učenik još nije radio nijedan test._\n\n`;
  }
  tests.forEach((t, i) => {
    md += `### ${i + 1}. ${t.testTitle}\n\n`;
    md += `- **Status predaje:** ${t.submissionStatus}\n`;
    md += `- **Poeni:** ${t.totalPointsAwarded} / ${t.totalPointsPossible}\n`;
    md += `- **Ocena:** ${t.gradeValue ?? "—"}\n`;
    md += `- **Počeo:** ${fmt(t.startedAt)}  \n`;
    md += `- **Predao:** ${fmt(t.submittedAt)}\n\n`;
    if (t.answers.length > 0) {
      md += `| Pitanje | Poeni | Status | Povratna informacija |\n| :--- | :--- | :--- | :--- |\n`;
      t.answers.forEach((a, qi) => {
        const feedback = (a.feedback || "—").replace(/\|/g, "\\|").replace(/\n/g, " ");
        md += `| Pitanje ${qi + 1} | ${a.pointsAwarded} / ${a.maxPoints ?? "—"} | ${a.status} | ${feedback} |\n`;
      });
      md += `\n`;
    }
  });

  return md;
}

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
  const [reportMarkdown, setReportMarkdown] = useState("");

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
      setReportMarkdown(buildMarkdownFromReport(data));
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

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 md:py-12">
        <div
          ref={printableContentRef}
          className="planner-print-area max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-12 print:border-0 print:shadow-none print:p-0"
        >
          <article className="md-preview">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{reportMarkdown}</ReactMarkdown>
          </article>
        </div>

        {report && (
          <p className="max-w-3xl mx-auto text-xs text-slate-400 mt-4 px-1 print:hidden sa-admin-theme">
            Prijavljeno kao: {report.requestedBy.parentName} · Generisano: {fmt(report.generatedAt)}
          </p>
        )}
      </main>
    </div>
  );
}
