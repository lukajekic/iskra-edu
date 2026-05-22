"use client"; // Dodata tačka-zapeta na kraju direktive

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { type ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, CircleCheckBig,  } from "lucide-react"
import { useState } from "react"
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
        
      const progress = row.getValue("progress") as {
        none: number;
        revise: number;
        accepted: number;
      }

      const stats = [
        { value: progress.none, color: "bg-gray-400" },
        { value: progress.revise, color: "bg-red-600" },
        { value: progress.accepted, color: "bg-green-600" },
      ];

      return (
        <div className="flex gap-0 flex-wrap justify-end -mx-2 -my-4 h-[36px]">
          <Button 
            className="text-sm rounded-none h-full min-h-[38px]" 
            onClick={() => {
              // Primer kako menjaš state kada klikneš na dugme
              (window as any).setStudentIspectorID?.(row.original.id);
              console.log(row.original.id)
            }}
          >
            <CircleCheckBig></CircleCheckBig>Pregled rešenja
          </Button>

          {stats.map((stat, index) => (
            <div 
              key={index} 
              className={`text-md w-[50px] h-full text-white ${stat.color} hover:${stat.color}/80 flex justify-center items-center font-semibold`}
            >
              {stat.value}
            </div>
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
          >
            Napredak
          </Button>
        </div>
      )
    },
  },
]