"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTrigger } from "@/components/ui/dialog"
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { type ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Pencil, Trash } from "lucide-react"
import { toast } from "sonner"

export type Student = {
    _id:      string;
    name:     string;
    username: string;
    __v:      number;
}
 
export const getColumns = ({onEdit, onDelete}): ColumnDef<Student>[] => [
  {
    accessorKey: "name",
    header: ({column}) =>{
      return (
        <Button variant={'ghost'} onClick={()=>column.toggleSorting(column.getIsSorted() === 'asc')}>
          Ime i prezime
          <ArrowUpDown></ArrowUpDown>
        </Button>
      )
    }
  },
  {
    accessorKey: "username",
    // cell({row}) {
        
    //     return (
    //         <span onClick={()=>{toast.success(row.getValue("email"))}} className="cell-link">{row.getValue("email")}</span>
    //     )
    // },
    header: "Korisnicko ime",
  },
  {
    accessorKey: "actions",
    header: "Opcije",
    cell({row}) {
      return (
        <div className="flex items-center gap-2">
          <Button onClick={()=>onEdit(row.original)} variant={'outline'}><Pencil></Pencil>Izmeni</Button>
          <Button onClick={()=>onDelete(row.original)} variant={'destructive'}><Trash></Trash>Obrisi</Button>
        </div>
      )
    },
    
  },
]