import { IskraApps } from "@/assets/constants";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import axios from "axios";
import { Check, ChevronDown, Coins, Sparkles } from "lucide-react";
import React, { createContext, useCallback, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { toast } from "sonner"; // PROMENJENO: Uvezen toast za greške ako ga koristiš

// PROMENJENO: Dodati interfejsi za korisnika
interface ActiveGroup {
  expiry: string | null;
  code: string | null;
  _id: string;
}

export interface UserType {
  _id: string;
  name: string;
  type: string;
  username: string;
  activegroup: ActiveGroup | null;
  institution: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  super_admin: boolean;
  login_banned: boolean;
}

export type CanvasData = {
  balance: number;
  limit: number;
  cost: number;
  setBalance: (balance: number) => void;
  refreshBalance: () => Promise<void>;
  maps: CanvasMapSummary[];
  refreshMaps: () => Promise<void>;
};

export type CanvasMapSummary = { _id: string; title: string; topic: string; subject: string; grade: string; schoolType: string; updatedAt: string };

export const CanvasDataContext = createContext<CanvasData | null>(null);
// PROMENJENO: Dodat UserContext za Canvas ukoliko zatreba decijim komponentama
export const UserContext = createContext<UserType | null>(null);

const CanvasWrapper = () => {
  const [balance, setBalance] = useState(0);
  const [limit, setLimit] = useState(200);
  const [cost, setCost] = useState(10);
  const [maps, setMaps] = useState<CanvasMapSummary[]>([]);
  const [resetAt, setResetAt] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  
  // PROMENJENO: Dodato stanje za korisnika
  const [user, setUser] = useState<UserType | null>(null);

  const refreshBalance = useCallback(async () => {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND}/api/canvas/balance`, { withCredentials: true });
    setBalance(response.data.balance);
    setLimit(response.data.limit);
    setCost(response.data.cost);
    setResetAt(response.data.resetAt || null);
  }, []);

  const refreshMaps = useCallback(async () => {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND}/api/canvas/maps`, { withCredentials: true });
    setMaps(response.data.maps || []);
  }, []);

  // PROMENJENO: Dodata getUser funkcija za preuzimanje profila
  const getUser = useCallback(async () => {
    try {
      const response = await axios.get<UserType>(`${import.meta.env.VITE_BACKEND}/user/me`, { withCredentials: true });
      if (response.status === 200) {
        setUser(response.data);
      }
    } catch (error) {
      toast.error("Desila se greska pri ucitavanju korisnika!");
    }
  }, []);

  // PROMENJENO: useEffect sada povlači i korisnika na inicijalnom renderu
  useEffect(() => {
    Promise.all([getUser(), refreshBalance(), refreshMaps()]).catch(() => setBalance(0));
  }, [getUser, refreshBalance, refreshMaps]);

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const cycleExpired = Boolean(resetAt && new Date(resetAt).getTime() <= currentTime);
  const visibleBalance = cycleExpired ? limit : balance;
  const [currentApp] = useState("canvas");

  // PROMENJENO: Dinamičko filtriranje na osnovu učitanog user.type naloga
  const apps = user?.type === "teacher"
    ? IskraApps.filter(app => app.teachers === true)
    : IskraApps.filter(app => app.students === true);

  const activeApp = apps.find((a) => a.id === currentApp);
  const ActiveAppIcon = activeApp?.icon || Sparkles;

  return (
    <UserContext.Provider value={user}>
      <CanvasDataContext.Provider value={{ balance: visibleBalance, limit, cost, setBalance, refreshBalance, maps, refreshMaps }}>
        <main className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-slate-950 md:px-8">
          <header className="mx-auto flex max-w-7xl items-center justify-between border-b border-slate-200 pb-5 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <img src="/canvas_logo.png" className="w-20" alt="" />
              <div><h1 className="font-bold text-slate-900 dark:text-slate-50 text-2xl">Iskra Canvas</h1></div>
            </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800">
          <ActiveAppIcon className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">{activeApp?.name || "Učitavanje..."}</span>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-64 p-2">
          <div className="px-2 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
            Iskra aplikacije
          </div>
          {apps.map((app) => {
            const Icon = app.icon;
            const isActive = app.id === currentApp;
            
            return (
              <DropdownMenuItem
                key={app.id}
                className={`flex items-center justify-between p-2 cursor-pointer ${isActive ? "bg-slate-100 dark:bg-slate-800" : ""}`}
                onClick={() => window.location.href = app.url}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{app.name}</span>
                </div>
                {isActive && <Check className="w-4 h-4 text-emerald-600" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
            <div className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
              <Coins className="h-4 w-4" /> {visibleBalance.toLocaleString("sr-RS")} kredita
            </div>
              </div>
          </header>
          <Outlet />
        </main>
      </CanvasDataContext.Provider>
    </UserContext.Provider>
  );
};

export default CanvasWrapper;