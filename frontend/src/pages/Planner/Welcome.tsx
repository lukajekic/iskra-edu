import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Check, FileText, Send, Sparkles, Wand2, X } from 'lucide-react';
import React, { useEffect, useState, useContext } from 'react'; // DODATO: useContext
import axios from 'axios';
import { toast } from 'sonner';
import { PlannerDataContext, UserContext } from './PlannerWrapper';
import { useNavigate } from 'react-router-dom';

type ClassType =
  | "Obrada novog gradiva"
  | "Utvrđivanje"
  | "Provera znanja / test"
  | "Ponavljanje"
  | "Vežbanje / praktičan rad";

const GRADES = [
  { group: "Osnovna škola", options: ["5. razred", "6. razred", "7. razred", "8. razred"] },
  { group: "Srednja škola", options: ["I razred", "II razred", "III razred", "IV razred"] },
];

const CLASS_TYPES: ClassType[] = [
  "Obrada novog gradiva",
  "Utvrđivanje",
  "Provera znanja / test",
  "Ponavljanje",
  "Vežbanje / praktičan rad",
];

const getGradeContext = (selectedGrade: string) => {
  const numericGrade = selectedGrade.match(/\d+/)?.[0]
    ?? ({ "I razred": "1", "II razred": "2", "III razred": "3", "IV razred": "4" }[selectedGrade] || selectedGrade);
  const gradeNumber = Number(numericGrade);

  return {
    grade: numericGrade,
    schoolType: gradeNumber >= 5 && gradeNumber <= 8 ? "osnovna škola" : "srednja škola",
  };
};

type WelcomeProps = {
  onSend?: (finalPrompt: string) => void;
};

const Welcome = ({ onSend }: WelcomeProps) => {
  const user = useContext(UserContext); // DODATO: Dobijanje korisnika iz konteksta
  const plannerData = useContext(PlannerDataContext);
  const navigate = useNavigate();
  const GREETINGS = [
    "Zdravo! Koji čas planiramo danas?",
    "Dobrodošli nazad! Hajde da spremimo sledeću lekciju.",
    "Spremni za novu pripremu? Recite mi šta predajete danas.",
    "Ćao! Hajde da kreiramo sjajan plan rada za vaše đake.",
    "Tu sam da pomognem. Koju nastavnu jedinicu danas obrađujemo?"
  ];
  
  const [inputValue, setInputValue] = useState("");
  const [currentGreetingIndex, setCurrentGreetingIndex] = useState(() => Math.floor(Math.random() * GREETINGS.length));
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [grade, setGrade] = useState<string | null>(null);
  const [classType, setClassType] = useState<ClassType | null>(null);
  const [wasCovered, setWasCovered] = useState<"da" | "ne" | null>(null);
  const [coveredHow, setCoveredHow] = useState("");
  const [folderId, setFolderId] = useState("");
  const [formError, setFormError] = useState("");
  const [isTypingActive, SetIsTypingActive] = useState(true);

  const typingSpeed = 25;
  const delayBetweenGreetings = 3000;

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const fullText = GREETINGS[currentGreetingIndex];

    if (!isDeleting) {
      if (displayedText.length < fullText.length) {
        timer = setTimeout(() => {
          setDisplayedText(fullText.slice(0, displayedText.length + 1));
        }, typingSpeed);
      } else {
        timer = setTimeout(() => setIsDeleting(true), delayBetweenGreetings);
        SetIsTypingActive(false);
      }
    }
    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, currentGreetingIndex]);

  const quickActions = [
    { label: "Priprema za čas", icon: FileText, text: "Napravi detaljnu pripremu za čas na temu: " },
    { label: "Godišnji plan", icon: Calendar, text: "Generiši predlog godišnjeg plana rada za predmet: " },
    { label: "Ideje za projekat", icon: Wand2, text: "Predloži 3 praktična i zanimljiva projekta za učenike na temu: " },
  ];

  const resetDetails = () => {
    setGrade(null);
    setClassType(null);
    setWasCovered(null);
    setCoveredHow("");
    setFormError("");
  };

  const handleOpenDetails = () => {
    if (!inputValue.trim()) return;
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setFormError("");
  };

  const handleConfirmDetails = async () => {
    if (!grade || !classType || !wasCovered) {
      setFormError("Popunite razred, tip časa i da li je tema ranije obrađivana.");
      return;
    }
    if (wasCovered === "da" && !coveredHow.trim()) {
      setFormError("Ukratko opišite kako je tema ranije obrađena.");
      return;
    }
    if (!user) {
      setFormError("Korisnik nije prijavljen.");
      return;
    }

    setIsLoading(true);

    try {
      const gradeContext = getGradeContext(grade);
      // Koristi /api/ai/generate-plan endpoint koji koristi Groq AI
      const response = await axios.post(`${import.meta.env.VITE_BACKEND}/api/ai/generate-plan`, {
        topic: inputValue.trim(),
        grade: gradeContext.grade,
        schoolType: gradeContext.schoolType,
        classType: classType.toLowerCase().replace(/\s+/g, "_"),
        language: "python",
        previouslyCovered: wasCovered === "da",
        coveredHow,
        folderId: folderId || undefined,
      }, { withCredentials: true });

      if (response.status === 201 && response.data.plan) {
        toast.success("Plan je uspešno generisan! Redirekcija...");
        
        await plannerData?.refreshPlannerData();
        // Plan viewer koristi stvarnu rutu u aplikaciji i animaciju nakon odgovora servera.
        setTimeout(() => {
          navigate(`/app/planner/plan/${response.data.plan._id}?animate=true`);
        }, 1000);
      } else {
        throw new Error("Neočekivani odgovor od servera.");
      }
    } catch (error: any) {
      console.error("Greška pri generisanju plana:", error);
      
      if (error.response?.status === 402) {
        toast.error(`Nemate dovoljno kredita. Potrebno: ${error.response.data.required}, dostupno: ${error.response.data.available}`);
      } else {
        toast.error(error.response?.data?.error || "Došlo je do greške prilikom generisanja plana.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between mt-2 rounded-xl relative">
      <div className="flex-1 flex flex-col items-center justify-center px-4 max-w-3xl mx-auto w-full py-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 animate-pulse mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          Iskra Planner AI
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-950 dark:text-slate-50 min-h-[140px] md:min-h-[160px] flex flex-col justify-center leading-tight text-center">
          <span className="text-primary relative inline-block">
            {displayedText}
            {isTypingActive && <span className="inline-block w-[3px] h-[32px] md:h-[45px] bg-primary ml-1.5 align-middle animate-[blink_1s_infinite]"></span>}
          </span>
        </h1>

        <p className="text-slate-500 dark:text-slate-400 max-w-md mt-4 text-sm md:text-base text-center">
          Unesite temu, lekciju ili razred, a Iskra AI će generisati kompletne materijale i planove u sekundi.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mt-10">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={() => setInputValue(action.text)}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-primary/50 dark:hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-200 text-left group"
              >
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Brza akcija</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{action.label}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 sticky bottom-0 z-10">
        <div className="max-w-3xl mx-auto relative flex items-end gap-2 border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-slate-50 dark:bg-slate-900 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Napišite šta vam je potrebno za sledeći čas..."
            className="flex-1 min-h-[44px] max-h-[200px] bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none py-2 px-3 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 text-sm"
            rows={1}
          />
          <Button
            size="icon"
            onClick={handleOpenDetails}
            className="h-9 w-9 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
            disabled={!inputValue.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-center text-[11px] text-slate-400 mt-2">
          Iskra Planner koristi napredne AI modele prilagođene nastavnom planu i programu.
        </p>
      </div>

      {showDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Pre nego što generišem</p>
                <p className="text-xs text-slate-400 mt-0.5">Predmet: Informatika</p>
              </div>
              <button onClick={handleCloseModal} className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-5 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2 block">Razred</label>
                <select value={grade ?? ""} onChange={(e) => setGrade(e.target.value || null)} className="w-full text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="">Izaberite razred...</option>
                  {GRADES.map((g) => (
                    <optgroup key={g.group} label={g.group}>
                      {g.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2 block">Tip časa</label>
                <div className="flex flex-wrap gap-2">
                  {CLASS_TYPES.map((type) => (
                    <button key={type} onClick={() => setClassType(type)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${classType === type ? "bg-primary text-primary-foreground border-primary" : "bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800"}`}>
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2 block">Planner folder <span className="font-normal text-slate-400">(opciono)</span></label>
                <select value={folderId} onChange={(e) => setFolderId(e.target.value)} className="w-full text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="">Nesvrstani plan</option>
                  {plannerData?.folders.map((folder) => <option key={folder._id} value={folder._id}>{folder.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2 block">Da li je ova tema ranije obrađivana?</label>
                <div className="flex gap-2">
                  <button onClick={() => setWasCovered("da")} className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${wasCovered === "da" ? "bg-primary text-primary-foreground" : "bg-slate-50 border-slate-200"}`}>Da</button>
                  <button onClick={() => { setWasCovered("ne"); setCoveredHow(""); }} className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${wasCovered === "ne" ? "bg-primary text-primary-foreground" : "bg-slate-50 border-slate-200"}`}>Ne</button>
                </div>
                {wasCovered === "da" && (
                  <Textarea value={coveredHow} onChange={(e) => setCoveredHow(e.target.value)} placeholder="Ukratko opišite..." className="mt-2 w-full text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 px-3 py-2 resize-none" rows={3} />
                )}
              </div>
              {formError && <p className="text-xs text-red-500 font-medium">{formError}</p>}
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
              <Button variant="ghost" onClick={handleCloseModal} className="text-slate-500">Otkaži</Button>
              <Button 
                onClick={handleConfirmDetails} 
                disabled={isLoading}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLoading ? "Generišem..." : "Generiši prompt"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Welcome;
