
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
    header: "Programski jezik"
  },
  {
    accessorKey: "outputType",
    header: "Vrsta izlaza",

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