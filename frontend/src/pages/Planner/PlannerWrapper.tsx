import { IskraApps } from '@/assets/constants'
import { TokenBalanceIndicator } from '@/components/custom/Planner/CoinsBalanxe'
import { AppSidebar } from '@/components/ui/app-sidebar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { PlannerSidebar } from '@/components/ui/planner_sidebar'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import axios from 'axios'
import { BookOpen, Check, ChevronDown, LayoutGrid, Menu } from 'lucide-react'
import React, { createContext, useCallback, useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { toast } from 'sonner'

// PROMENJENO: Definisani TypeScript interfejsi na osnovu tvog response-a
interface ActiveGroup {
  expiry: string | null
  code: string | null
  _id: string
}

export interface UserType {
  _id: string
  name: string
  type: string
  username: string
  activegroup: ActiveGroup | null
  institution: string
  createdAt: string
  updatedAt: string
  __v: number
  super_admin: boolean
  login_banned: boolean
}

// PROMENJENO: Kreiran kontekst VAN komponente sa ispravnim tipom (UserType | null)
export const UserContext = createContext<UserType | null>(null)

export interface PlannerFolder {
  _id: string
  name: string
  planCount: number
}

export interface PlannerSummary {
  _id: string
  title: string
  topic: string
  folderRef: string | null
  updatedAt: string
}

interface PlannerData {
  balance: number
  dailyLimit: number
  resetAt: string | null
  folders: PlannerFolder[]
  plans: PlannerSummary[]
  refreshPlannerData: () => Promise<void>
}

export const PlannerDataContext = createContext<PlannerData | null>(null)

const PlannerWrapper = () => {
    const [currentApp] = useState("planner")

  const apps = IskraApps

  const activeApp = apps.find((a) => a.id === currentApp);
    const [user, setUser] = useState<UserType | null>(null)
    const [balance, setBalance] = useState(0)
    const [dailyLimit, setDailyLimit] = useState(20000)
    const [resetAt, setResetAt] = useState<string | null>(null)
    const [folders, setFolders] = useState<PlannerFolder[]>([])
    const [plans, setPlans] = useState<PlannerSummary[]>([])

    const getUser = async() =>{
        try {
            // PROMENJENO: Tipiziran axios get zahtev sa <UserType>
            const response = await axios.get<UserType>(`${import.meta.env.VITE_BACKEND}/user/me`, { withCredentials: true })
            if (response.status === 200) {
                setUser(response.data)
            }
        } catch (error) {
            toast.error("Desila se greska!")
        }
    }

    useEffect(()=>{
        getUser()
    }, [])

    const refreshPlannerData = useCallback(async () => {
      try {
        const [balanceResponse, foldersResponse, plansResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND}/planner/balance`, { withCredentials: true }),
          axios.get(`${import.meta.env.VITE_BACKEND}/planner/folders`, { withCredentials: true }),
          axios.get(`${import.meta.env.VITE_BACKEND}/planner/plans`, { withCredentials: true }),
        ])
        setBalance(balanceResponse.data.balance)
        setDailyLimit(balanceResponse.data.dailyLimit)
        setResetAt(balanceResponse.data.resetAt || null)
        setFolders(foldersResponse.data.folders || [])
        setPlans(plansResponse.data.plans || [])
      } catch (error) {
        // Profil može da postoji dok Planner API još nije dostupan; ne prekidamo ostatak aplikacije.
        console.error("Greška pri učitavanju Planner podataka:", error)
      }
    }, [])

    useEffect(() => {
      if (user) refreshPlannerData()
    }, [user, refreshPlannerData])

  return (
    <>
    {/* PROMENJENO: userContext promenjen u UserContext (veliko slovo i spoljna definicija) */}
    <UserContext.Provider value={user}>
    <PlannerDataContext.Provider value={{ balance, dailyLimit, resetAt, folders, plans, refreshPlannerData }}>
        <SidebarProvider >
        <SidebarTrigger className="z-50 h-10 w-10 border border-input bg-background hover:bg-accent rounded-md shadow-sm mt-2 ml-5 flex md:hidden fixed">
          <Menu className="h-5 w-5" />
          <span>Meni</span>
        </SidebarTrigger>
        <PlannerSidebar></PlannerSidebar>
        <SidebarInset>
          <main className='p-5 pt-16 w-full md:pt-5'>
            <div className="pb-2 border-b-1 flex justify-between">
                <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800">
        <activeApp.icon className="w-4 h-4 text-primary" />
        <span className="font-semibold text-sm">{activeApp?.name}</span>
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

    <TokenBalanceIndicator usedTokens={dailyLimit - balance} totalLimit={dailyLimit} resetAt={resetAt}></TokenBalanceIndicator>
            </div>
            <Outlet></Outlet>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </PlannerDataContext.Provider>
    </UserContext.Provider>
      </>
  )
}

export default PlannerWrapper
