import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { 
  ChevronRight, 
  Phone, 
  User, 
  ChevronsUpDown,
  LogOut,
  Folder,
  FileText,
  Pencil,
  Trash2,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

import { Separator } from "./separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PlannerDataContext, UserContext } from "@/pages/Planner/PlannerWrapper";

export function PlannerSidebar() {
  const user = useContext(UserContext);
  const plannerData = useContext(PlannerDataContext);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [modal, setModal] = useState<"create" | "rename" | "delete" | "profile" | "support" | null>(null);
  const [folderName, setFolderName] = useState("");
  const [activeFolder, setActiveFolder] = useState<{ id: string; name: string; planCount: number } | null>(null);

  const { isMobile } = useSidebar();

  if (!user) {
    return (
      <Sidebar variant='inset' className="top-[0px]">
        <SidebarContent>
          <SidebarGroup>
            <SidebarHeader>
              <div className="flex gap-3 items-center">
                <img src="/iskra_planner_logo.png" className="w-10" alt="" />
                <h1 className="font-bold text-2xl">Iskra Planner</h1>
              </div>
            </SidebarHeader>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    );
  }

  const userAvatar = "";
  const plansByFolder = (folderId: string) => plannerData?.plans.filter((plan) => plan.folderRef === folderId) || [];

  const saveFolder = async () => {
    const name = folderName.trim();
    if (!name || creatingFolder) return;
    setCreatingFolder(true);
    try {
      if (modal === "create") {
        await axios.post(`${import.meta.env.VITE_BACKEND}/planner/folders`, { name }, { withCredentials: true });
        toast.success("Folder je kreiran.");
      } else if (modal === "rename" && activeFolder) {
        await axios.patch(`${import.meta.env.VITE_BACKEND}/planner/folders/${activeFolder.id}`, { name }, { withCredentials: true });
        toast.success("Folder je preimenovan.");
      }
      await plannerData?.refreshPlannerData();
      setModal(null);
      setFolderName("");
    } catch (error: unknown) {
      toast.error(axios.isAxiosError(error) ? error.response?.data?.error || "Folder nije moguće sačuvati." : "Folder nije moguće sačuvati.");
    } finally {
      setCreatingFolder(false);
    }
  };

  const deleteFolder = async () => {
    if (!activeFolder) return;
    setCreatingFolder(true);
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND}/planner/folders/${activeFolder.id}`, { withCredentials: true });
      await plannerData?.refreshPlannerData();
      toast.success(activeFolder.planCount ? "Folder i njegovi planovi su obrisani." : "Folder je obrisan.");
      setModal(null);
    } catch (error: unknown) {
      toast.error(axios.isAxiosError(error) ? error.response?.data?.error || "Folder nije moguće obrisati." : "Folder nije moguće obrisati.");
    } finally {
      setCreatingFolder(false);
    }
  };

  const Logout = async() =>{
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND}/user/logout`)
      if (response.status === 200) {
        location.href = "/auth/onboarding"
      }
    } catch (error) {
      toast.error("Odjava neuspesna!")
    }
  }

  return (
    <Sidebar variant='inset' className="top-[0px]">
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="mt-0">
            <SidebarHeader className="">
              <div className="flex gap-3 items-center">
                <img src="/iskra_planner_logo.png" className="w-10" alt="" />
                <h1 className="font-bold text-2xl">Iskra Planner</h1>
              </div>
            </SidebarHeader>

            <Separator className="my-2" />

            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => { setFolderName(""); setActiveFolder(null); setModal("create"); }} disabled={creatingFolder} tooltip="Novi folder" className="text-primary font-semibold">
                <Folder />
                <span>{creatingFolder ? "Kreiranje…" : "Novi folder"}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {plannerData?.folders.map((folder) => (
              <Collapsible asChild key={folder._id} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={folder.name} className="font-semibold">
                      <Folder />
                      <span className="truncate">{folder.name}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{folder.planCount}</span>
                      <ChevronRight className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {plansByFolder(folder._id).map((plan) => (
                        <SidebarMenuSubItem key={plan._id}>
                          <SidebarMenuSubButton asChild>
                            <Link to={`/app/planner/plan/${plan._id}?animate=false`}><FileText /><span className="truncate">{plan.title}</span></Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                      <div className="mx-2 mt-2 border-t border-sidebar-border pt-2">
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Upravljanje folderom</p>
                        <div className="flex gap-1">
                          <button type="button" onClick={() => { setActiveFolder({ id: folder._id, name: folder.name, planCount: folder.planCount }); setFolderName(folder.name); setModal("rename"); }} className="inline-flex items-center gap-1 rounded px-1.5 py-1 text-xs text-muted-foreground hover:bg-sidebar-accent hover:text-foreground" title="Preimenuj folder"><Pencil className="size-3.5" />Preimenuj</button>
                          <button type="button" onClick={() => { setActiveFolder({ id: folder._id, name: folder.name, planCount: folder.planCount }); setModal("delete"); }} className="inline-flex items-center gap-1 rounded px-1.5 py-1 text-xs text-destructive hover:bg-destructive/10" title="Obriši folder i sve planove"><Trash2 className="size-3.5" />Obriši sve</button>
                        </div>
                      </div>
                      {!plansByFolder(folder._id).length && <p className="px-2 py-1 text-xs text-muted-foreground">Nema planova</p>}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ))}

            {(plannerData?.plans.filter((plan) => !plan.folderRef).length || 0) > 0 && (
              <Collapsible asChild className="group/collapsible" defaultOpen>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Nesvrstani planovi" className="font-semibold"><FileText /><span>Nesvrstani planovi</span><ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" /></SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent><SidebarMenuSub>{plannerData?.plans.filter((plan) => !plan.folderRef).map((plan) => <SidebarMenuSubItem key={plan._id}><SidebarMenuSubButton asChild><Link to={`/app/planner/plan/${plan._id}?animate=false`}><FileText /><span className="truncate">{plan.title}</span></Link></SidebarMenuSubButton></SidebarMenuSubItem>)}</SidebarMenuSub></CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={userAvatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg">
                      {user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user.username}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={userAvatar} alt={user.name} />
                      <AvatarFallback className="rounded-lg">
                        {user.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{user.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user.username}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onSelect={() => setModal("profile")}>
                    <User />
                    Nalog
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setModal("support")}>
                    <Phone />
                    Tehnička podrška
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={()=>{Logout()}} variant="destructive">
                  <LogOut />
                  Odjavi se
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      
      {/* DIJALOZI */}
      <Dialog open={modal === "create" || modal === "rename"} onOpenChange={(open) => !open && setModal(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{modal === "create" ? "Novi Planner folder" : "Preimenuj folder"}</DialogTitle><DialogDescription>Unesite jasan naziv pod kojim ćete organizovati planove.</DialogDescription></DialogHeader>
          <input autoFocus value={folderName} onChange={(event) => setFolderName(event.target.value)} onKeyDown={(event) => event.key === "Enter" && saveFolder()} placeholder="Naziv foldera" className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
          <DialogFooter><Button variant="outline" onClick={() => setModal(null)}>Odustani</Button><Button onClick={saveFolder} disabled={!folderName.trim() || creatingFolder}>{creatingFolder ? "Čuvanje…" : "Sačuvaj"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={modal === "delete"} onOpenChange={(open) => !open && setModal(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Obrisati folder?</DialogTitle><DialogDescription>{activeFolder?.planCount ? `Folder „${activeFolder.name}” i svih ${activeFolder.planCount} plan(a) biće nepovratno obrisani.` : `Folder „${activeFolder?.name}” biće obrisan.`}</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setModal(null)}>Odustani</Button><Button variant="destructive" onClick={deleteFolder} disabled={creatingFolder}>{creatingFolder ? "Brisanje…" : "Obriši trajno"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={modal === "support"} onOpenChange={(open) => !open && setModal(null)}>
        <DialogContent><DialogHeader><DialogTitle>Tehnička podrška</DialogTitle><DialogDescription>Pošaljite opis problema, korake do greške i po mogućnosti snimak ekrana na adresu ispod. Zahtev će biti evidentiran u sistemu podrške.</DialogDescription></DialogHeader><a className="rounded-lg bg-primary/10 px-4 py-3 text-center text-base font-semibold text-primary" href="mailto:podrska@iskraedu.zohodesk.eu">podrska@iskraedu.zohodesk.eu</a><DialogFooter><Button onClick={() => setModal(null)}>U redu</Button></DialogFooter></DialogContent>
      </Dialog>
      
      {/* PROMENJENO: Lepo formatiran profil */}
      <Dialog open={modal === "profile"} onOpenChange={(open) => !open && setModal(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Korisnički nalog</DialogTitle>
            <DialogDescription>Pregled osnovnih informacija o vašem profilu.</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4 rounded-lg border p-4 text-sm">
              <div className="font-semibold text-muted-foreground">Ime i prezime:</div>
              <div className="text-right">{user.name}</div>
              <div className="font-semibold text-muted-foreground">Korisničko ime:</div>
              <div className="text-right">{user.username}</div>
              <div className="font-semibold text-muted-foreground">Institucija:</div>
              <div className="text-right">{user.institution}</div>
              <div className="font-semibold text-muted-foreground">Tip naloga:</div>
              <div className="text-right capitalize">{user.type}</div>
              <div className="font-semibold text-muted-foreground">Krediti (trenutno):</div>
              <div className="text-right font-bold text-primary">{user?.plannerTokenBalance}</div>
            </div>

            <div className="rounded-lg bg-muted p-4 text-xs">
              <p className="mb-2 font-semibold text-muted-foreground uppercase tracking-wider">Tehnički podaci</p>
              <div className="flex justify-between py-1 border-b border-muted-foreground/10">
                <span>ID:</span>
                <span className="font-mono">{user._id}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Poslednja izmena:</span>
                <span>{new Date(user.updatedAt).toLocaleString('sr-RS')}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setModal(null)}>Zatvori</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}