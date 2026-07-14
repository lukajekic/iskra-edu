
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"
import { toast } from "sonner"
import { type ColumnDef } from "@tanstack/react-table"
export type Task = {

_id:        string;
    title:      string;
    richText:   string;
    language:   string;
    outputType: string;
    author?:     Author;
    grade:      string;
    __v:        number;
    tests: []
}

export type Author = {
    _id:         string;
    name:        string;
    institution: string;
}

export const getColumns = ({onPreview}):ColumnDef<Task>[]=>[
  {
    accessorKey: "title",
    header: "Naziv zadatka",
  },
  {
    accessorKey: "language",
    header: "Programski jezik",
    cell({row}) {
      return (
        <span>{row.original.language === "python" ? "Python" : row.original.language === "ruby" ? "Ruby" : row.original.language}</span>
      )
    },
  },
  {
    accessorKey: "outputType",
    header: "Vrsta izlaza",
    cell({row}) {
      return (
        <span>{row.original.outputType === 'standard' ? "Standardni ispis" : row.original.outputType}</span>
      )
    },

  },

  {
    accessorKey: "options",
    header: ()=>(
      <div className="text-right">Opcije</div>
    ),
    cell({row}) {
      return (
        <div className="flex justify-end">
                  <Button onClick={()=>{onPreview(row.original)}}>Prikazi zadatak</Button>

        </div>
      )
    },
  }

  
]