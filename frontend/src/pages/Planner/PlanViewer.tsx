import { useState, useEffect, useContext, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { 
  ChevronLeft, 
  Download, 
  Copy, 
  Sparkles, 
  Check, 
  FileText,
  Send,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import "./markdown-preview.css";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { PlannerDataContext } from "./PlannerWrapper";
// Mock-up generisanog plana rada koji se prikazuje
const GENERATED_PLAN_MARKDOWN = `
# Priprema za čas: Uvod u petlje (Python)

**Razred:** I razred srednje škole  
**Predmet:** Računarstvo i informatika  
**Tip časa:** Obrada novog gradiva  

---

## 🎯 Ishodi časa
Nakon ovog časa, učenici će biti sposobni da:
* Razumeju koncept automatizacije ponavljanja koda
* Prepoznaju i ispravno zapišu \`for\` i \`while\` petlje u Pythonu
* Identifikuju i izbegnu beskonačne petlje (*infinite loops*)

---

## ⏳ Struktura časa

| Deo časa | Aktivnost | Trajanje |
| :--- | :--- | :--- |
| **Uvodni deo** | Motivacija kroz realni primer (brojanje učenika) | 5 min |
| **Glavni deo** | Demonstracija \`for\` i \`while\` sintakse kroz kôd | 25 min |
| **Završni deo** | Kviz znanja i rešavanje kratkog zadatka | 15 min |

---

## 💻 Primer koda za demonstraciju
Evo jednostavnog koda koji ispisuje brojeve od 1 do 5 koristeći \`for\` petlju:

\`\`\`python
# Primer for petlje u Pythonu
for i in range(1, 6):
    print(f"Ovo je krug broj: {i}")
\`\`\`

> **Napomena za nastavnika:** Obratiti pažnju učenika na uvlačenje koda (*indentation*) unutar tela petlje, jer je to najčešća sintaksna greška kod početnika.
`;

export default function IskraPlannerViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const plannerData = useContext(PlannerDataContext);
  const printableContentRef = useRef<HTMLDivElement>(null);
  
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markdownText, setMarkdownText] = useState("");
  const [copied, setCopied] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [revisionPrompt, setRevisionPrompt] = useState("");
  const [isRevising, setIsRevising] = useState(false);

  // Učitaj plan iz API-ja
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`${import.meta.env.VITE_BACKEND}/planner/plan/${id}`, { withCredentials: true });
        
        if (response.data && response.data.plan) {
          setPlan(response.data.plan);
        } else if (response.data) {
          setPlan(response.data);
        }
      } catch (err: any) {
        console.error("Greška pri učitavanju plana:", err);
        setError(err.response?.data?.error || "Greška pri učitavanju plana.");
        toast.error("Nije moguće učitati plan.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPlan();
    }
  }, [id]);

  // Animiraj plan kada se učita
  useEffect(() => {
    if (!plan || !plan.content) return;

    const params = new URLSearchParams(window.location.search);
    const animParam = params.get("animate") ?? params.get("animated");
    const animEnabled = animParam !== "false"; // Default je true
    if (animEnabled) {
      setIsAnimating(true);
      // Reč-po-reč lagani fade-in streaming efekat
      const words = plan.content.split(" ");
      let currentWordIndex = 0;
      let currentText = "";

      const interval = setInterval(() => {
        if (currentWordIndex < words.length) {
          currentText += (currentWordIndex === 0 ? "" : " ") + words[currentWordIndex];
          setMarkdownText(currentText);
          currentWordIndex++;
        } else {
          clearInterval(interval);
          setIsAnimating(false);
        }
      }, 25); // Brzina ispisivanja reči

      return () => clearInterval(interval);
    } else {
      // Ako je animated=false, odmah baci ceo tekst
      setMarkdownText(plan.content);
    }
  }, [plan]);

  // Funkcija za kopiranje u clipboard
  const handleCopy = async () => {
    try {
      const content = printableContentRef.current;
      if (!content) return;

      // U clipboard ide renderovani HTML, ne Markdown sintaksa. Paste u Docs/Word zadržava naslove, liste i tabele.
      if (navigator.clipboard.write && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": new Blob([content.innerHTML], { type: "text/html" }),
            "text/plain": new Blob([content.innerText], { type: "text/plain" }),
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(content.innerText);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Greška pri kopiranju: ", err);
    }
  };

  // Funkcija za preuzimanje / štampanje u PDF (izvorna pretraživačeva štampa skockana za print)
  const handlePrint = () => {
    window.print();
  };

  const updatePlan = async (updates: Record<string, string | null>) => {
    const response = await axios.patch(`${import.meta.env.VITE_BACKEND}/planner/plan/${id}`, updates, { withCredentials: true });
    setPlan(response.data.plan);
    await plannerData?.refreshPlannerData();
  };

  const handleRename = async () => {
    const title = window.prompt("Novi naziv plana:", plan?.title)?.trim();
    if (!title || title === plan?.title) return;
    try {
      await updatePlan({ title });
      toast.success("Plan je preimenovan.");
    } catch (requestError: unknown) {
      toast.error(axios.isAxiosError(requestError) ? requestError.response?.data?.error || "Plan nije moguće preimenovati." : "Plan nije moguće preimenovati.");
    }
  };

  const handleMove = async (folderId: string) => {
    try {
      await updatePlan({ folderId: folderId || null });
      toast.success(folderId ? "Plan je prebačen u folder." : "Plan je prebačen u nesvrstane planove.");
    } catch (requestError: unknown) {
      toast.error(axios.isAxiosError(requestError) ? requestError.response?.data?.error || "Plan nije moguće premestiti." : "Plan nije moguće premestiti.");
    }
  };

  const handleDeletePlan = async () => {
    if (!window.confirm(`Obrisati plan „${plan?.title || "bez naziva"}”? Ova radnja je nepovratna.`)) return;
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND}/planner/plan/${id}`, { withCredentials: true });
      await plannerData?.refreshPlannerData();
      toast.success("Plan je obrisan.");
      navigate("/app/planner");
    } catch (requestError: unknown) {
      toast.error(axios.isAxiosError(requestError) ? requestError.response?.data?.error || "Plan nije moguće obrisati." : "Plan nije moguće obrisati.");
    }
  };

  // Funkcija za slanje zahteva za izmenu dokumenta (prompt box ispod dokumenta)
  const handleRevisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = revisionPrompt.trim();
    if (!trimmed || isRevising || isAnimating) return;

    setIsRevising(true);
    axios.post(`${import.meta.env.VITE_BACKEND}/planner/plan/${id}/revise`, { instruction: trimmed }, { withCredentials: true })
      .then((response) => {
        toast.success("Plan je uspešno izmenjen.");
        plannerData?.refreshPlannerData();
        // Kada je plan otvoren bez animacije, AI izmena namerno ponovo otvara svež sadržaj sa animacijom.
        window.location.assign(`/app/planner/plan/${response.data.plan._id}?animate=true`);
      })
      .catch((requestError: any) => {
        toast.error(requestError.response?.data?.error || "Izmena plana nije uspela.");
      })
      .finally(() => {
      setIsRevising(false);
      setRevisionPrompt("");
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-slate-600 dark:text-slate-400">Učitavanje plana...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center max-w-md">
          <FileText className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
          <Button onClick={() => navigate('/app/planner')}>← Nazad na planner</Button>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center max-w-md">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 mb-4">Plan nije pronađen.</p>
          <Button onClick={() => navigate('/app/planner')}>← Nazad na planner</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col pb-16 print:bg-white">
      
      {/* HEADER / ACTIONS TOOLBAR - Sakriva se prilikom štampe (print:hidden) */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-20 px-4 py-3 print:hidden">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          
          {/* Nazad dugme */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/app/planner')}
            className="gap-1.5 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-900"
          >
            <ChevronLeft className="w-4 h-4" /> 
            <span>Povratak</span>
          </Button>

          {/* Akcije sa dokumentom */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRename} className="hidden md:inline-flex gap-1.5 text-xs md:text-sm"><FileText className="w-4 h-4" />Preimenuj</Button>
            <select value={plan?.folderRef || ""} onChange={(event) => handleMove(event.target.value)} className="hidden md:block h-8 max-w-40 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200" aria-label="Premesti plan u folder">
              <option value="">Nesvrstani</option>
              {plannerData?.folders.map((folder) => <option key={folder._id} value={folder._id}>{folder.name}</option>)}
            </select>
            <Button variant="outline" size="sm" onClick={handleDeletePlan} className="inline-flex gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/60"><Trash2 className="w-4 h-4" /><span className="hidden lg:inline">Obriši</span></Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCopy}
              className="gap-1.5 text-xs md:text-sm font-medium border-slate-200 dark:border-slate-800"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-500">Kopirano!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Kopiraj</span>
                </>
              )}
            </Button>

            <Button 
              onClick={handlePrint}
              size="sm" 
              className="gap-1.5 text-xs md:text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Preuzmi PDF</span>
            </Button>
          </div>

        </div>
      </header>

      {/* GLAVNI SADRŽAJ (Prikaz dokumenta) */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 md:py-12">
        
        {/* Status bar iznad dokumenta - Sakriva se prilikom štampe */}
        <div className="max-w-3xl mx-auto flex items-center justify-between mb-4 text-xs text-slate-400 dark:text-slate-500 font-medium px-1 print:hidden">
          <div className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-primary" />
            <span>Iskra AI Dokument</span>
          </div>
          {isAnimating && (
            <div className="flex items-center gap-1.5 text-primary animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Iskra generiše plan...</span>
            </div>
          )}
        </div>

        {/* LIST PAPIRA / DOKUMENT */}
        <div ref={printableContentRef} className="planner-print-area max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 md:p-12 transition-all duration-300 print:border-0 print:shadow-none print:p-0">
          
          {/* Plan title */}
          {plan?.title && (
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-8 pb-4 border-b border-slate-200 dark:border-slate-700">
              {plan.title}
            </h1>
          )}
          
          {/* Markdown renderer sa čistim, profesionalnim stilom */}
          <article className="md-preview">
  <ReactMarkdown remarkPlugins={[remarkGfm]}>
    {markdownText}
  </ReactMarkdown>
</article>

        </div>

        {/* PROMPT BOX ZA PREPRAVKE - traženje izmena od Iskre nad generisanim planom */}
        <form
          onSubmit={handleRevisionSubmit}
          className="max-w-3xl mx-auto mt-4 print:hidden"
        >
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm px-3 py-2 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/40 transition-all">
            <div className="flex items-center justify-center w-8 h-8 shrink-0 rounded-full bg-primary/10 text-primary">
              <Sparkles className="w-4 h-4" />
            </div>

            <input
              type="text"
              value={revisionPrompt}
              onChange={(e) => setRevisionPrompt(e.target.value)}
              disabled={isAnimating || isRevising}
              placeholder="Zatraži izmenu, npr. 'Skrati uvodni deo na 3 minuta'..."
              className="flex-1 bg-transparent border-0 outline-none text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 disabled:opacity-50"
            />

            <Button
              type="submit"
              size="sm"
              disabled={!revisionPrompt.trim() || isAnimating || isRevising}
              className="gap-1.5 text-xs md:text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0 disabled:opacity-40"
            >
              {isRevising ? (
                <>
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span>Menjam...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Pošalji</span>
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 px-1">
            Iskra će ažurirati plan na osnovu tvog zahteva, bez brisanja ostatka sadržaja.
          </p>
        </form>

      </main>

    </div>
  );
}
