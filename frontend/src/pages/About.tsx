import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Zap, 
  Code2, 
  Cpu, 
  Globe2, 
  Layout, 
  Rocket, 
  ShieldCheck, 
  Terminal,
  ArrowRight,
  Sparkles
} from "lucide-react"

export default function AboutUsModular() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary/30">
      
      {/* 1. HERO: Brutalist Style */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24">
        {/* Pozadinski efekat (samo CSS) */}
        <div className="absolute top-0 left-1/2 -z-10 h-[600px] w-full -translate-x-1/2 [background:radial-gradient(100%_50%_at_50%_0%,rgba(0,120,255,0.08)_0,rgba(0,120,255,0)_50%,rgba(0,120,255,0)_100%)]" />
        
        <div className="container px-4 text-center space-y-8">
          <Badge variant="outline" className="px-6 py-1.5 border-primary/40 text-primary bg-primary/5 rounded-full animate-pulse">
            <Sparkles className="mr-2 h-4 w-4" /> Iskra v2.0
          </Badge>
          
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter bg-gradient-to-b from-foreground to-foreground/50 bg-clip-text text-transparent">
            MODERNA EDUKACIJA <br /> U REALNOM VREMENU
          </h1>
          
          <p className="mx-auto max-w-[700px] text-lg md:text-xl text-muted-foreground font-medium">
            Iskra je ekosistem za "Svetozar Marković" gimnaziju koji spaja MERN stack moć sa intuitivnim dashboardima za profesore i učenike.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button size="lg" className="h-12 px-8 rounded-xl font-bold gap-2">
              Pokreni Iskra Panel <Rocket className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 rounded-xl font-bold border-2">
              GitHub Repozitorijum
            </Button>
          </div>
        </div>
      </section>

      {/* 2. BENTO GRID: Tehnološki DNK */}
      <section className="container px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-2 gap-4 h-auto md:h-[600px]">
          
          {/* Main Card */}
          <Card className="md:col-span-8 md:row-span-2 relative overflow-hidden bg-primary text-primary-foreground border-none group transition-all duration-300">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <Terminal className="h-64 w-64" />
            </div>
            <CardHeader className="h-full justify-end p-8 md:p-12">
              <Badge variant="secondary" className="w-fit mb-4">Core Architecture</Badge>
              <CardTitle className="text-4xl md:text-6xl font-bold leading-none mb-4 italic">
                Snažan Backend. <br /> Elegantan Frontend.
              </CardTitle>
              <p className="text-lg opacity-80 max-w-md">
                Arhitektura bazirana na Node.js i Socket.io omogućava trenutnu sinhronizaciju testova i rezultata.
              </p>
            </CardHeader>
          </Card>

          {/* Sub Card 1 */}
          <Card className="md:col-span-4 bg-card border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <Cpu className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Optimizovan Kod</CardTitle>
              <p className="text-sm text-muted-foreground">Pisano u TypeScript-u za maksimalnu sigurnost i brzinu izvršavanja.</p>
            </CardHeader>
          </Card>

          {/* Sub Card 2 */}
          <Card className="md:col-span-4 bg-muted/50 border-none flex flex-col justify-center text-center p-6">
             <div className="space-y-2">
                <p className="text-5xl font-black tracking-tighter">100%</p>
                <p className="text-sm uppercase tracking-widest font-bold opacity-60 text-primary">Open Source</p>
             </div>
          </Card>

        </div>
      </section>

      {/* 3. TEAM SECTION: The Visionary */}
      <section className="container px-4 py-24">
        <div className="flex flex-col md:flex-row items-center gap-16 p-12 bg-secondary/20 rounded-[40px] border border-border">
          <div className="relative">
            <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-full" />
            <Avatar className="h-48 w-48 md:h-64 md:w-64 border-4 border-background shadow-2xl">
              <AvatarImage src="https://api.dicebear.com/8.x/avataaars/svg?seed=luka" />
              <AvatarFallback>LJ</AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 space-y-6 text-center md:text-left">
            <div className="space-y-2">
              <h3 className="text-4xl font-black">Luka Jekić</h3>
              <p className="text-primary font-mono tracking-tighter">PREDSEDNIK ODELJENJA & LEAD DEVELOPER</p>
            </div>
            <p className="text-xl text-muted-foreground italic">
              "Iskra je nastala iz potrebe da digitalizujemo naše školovanje u 'Svetozar Marković' gimnaziji. Cilj je bio da napravimo nešto naše, domaće, a svetsko."
            </p>
            <div className="flex justify-center md:justify-start gap-4">
              <Badge variant="outline" className="rounded-none px-4 py-1 skew-x-[-12deg]">MERN Expert</Badge>
              <Badge variant="outline" className="rounded-none px-4 py-1 skew-x-[-12deg]">.NET Core</Badge>
              <Badge variant="outline" className="rounded-none px-4 py-1 skew-x-[-12deg]">TypeScript</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FINAL CTA: Grid-Style */}
      <section className="container px-4 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-foreground text-background rounded-[40px] p-8 md:p-16 overflow-hidden relative">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-6xl font-black leading-[0.9]">
              SPREMNI ZA <br /> SLEDEĆI ČAS?
            </h2>
            <Button size="lg" variant="secondary" className="group rounded-full px-8 h-14 text-lg font-bold">
              Uloguj se na Iskra <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 opacity-20">
             <div className="h-32 border border-background/50 rounded-2xl flex items-center justify-center"><Code2 className="h-12 w-12" /></div>
             <div className="h-32 border border-background/50 rounded-2xl flex items-center justify-center"><ShieldCheck className="h-12 w-12" /></div>
             <div className="h-32 border border-background/50 rounded-2xl flex items-center justify-center"><Globe2 className="h-12 w-12" /></div>
             <div className="h-32 border border-background/50 rounded-2xl flex items-center justify-center"><Layout className="h-12 w-12" /></div>
          </div>
        </div>
      </section>

    </div>
  )
}