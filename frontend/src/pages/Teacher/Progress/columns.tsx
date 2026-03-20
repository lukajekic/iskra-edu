"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { type ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown,  } from "lucide-react"
import { toast } from "sonner"
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Payment = {
  id: string
  status: "pending" | "processing" | "success" | "failed"
  done: number[]
}

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "name",
    header: "Ime i prezime",
  },
  {
    accessorKey: "progress",
    cell({row}) {
        
       const progress = row.getValue("progress") as  {
        none: number;
        revise: number;
        accepted: number;
      }

      const stats = [
        { value: progress.accepted, color: "bg-green-600" },
        { value: progress.revise, color: "bg-red-600" },
        { value: progress.none, color: "bg-gray-400" },
      ];
       return (
       <div className="flex gap-1 flex-wrap justify-end">
  {stats.map((stat, index) => (
            <Badge 
              key={index} 
              className={`text-md px-3 py-3 text-white ${stat.color} hover:${stat.color}/80`}
            >
              {stat.value}
            </Badge>
          ))}
</div>
      )
    },
    header: ({ column }) => {
      return (
        <div className="w-full flex justify-end">
          <Button
          variant="ghost"
          className="self-end"
/*           onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
 */        >
          Napredak
{/*           <ArrowUpDown className="ml-2 h-4 w-4" />
 */}        </Button>
        </div>
      )
    },
  },
 
]