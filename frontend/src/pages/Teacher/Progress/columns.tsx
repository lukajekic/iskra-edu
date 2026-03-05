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
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "done",
    cell({row}) {
        
       const items = row.getValue("done") as number []
       return (
       <div className="flex gap-1 flex-wrap justify-end">
  {items.map((item, index) => (
    <Badge 
      className={`p-4 ${index === 0 ? "bg-green-600" : index === 1 ? "bg-red-600" : "bg-gray-400"}`} 
      key={index}
    >
      {item}
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
          Progress
{/*           <ArrowUpDown className="ml-2 h-4 w-4" />
 */}        </Button>
        </div>
      )
    },
  },
 
]