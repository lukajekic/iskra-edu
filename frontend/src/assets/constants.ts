import { BookOpen, LayoutGrid } from "lucide-react";

export const Grades = [
    'Peti razred osnovne škole',
    'Šesti razred osnovne škole',
    'Sedmi razred osnovne škole',
    'Osmi razred osnovne škole',
    'Prvi razred srednje škole',
    'Drugi razred srednje škole',
    'Treći razred srednje škole',
    'Četvrti razred srednje škole',
    'Zadaci za obuke'
]

export const SupportedLanguages = [
    {
        label: "Python",
        value: "python",
        icon: '/python.svg'
    },
    {
        label: "Ruby",
        value: "ruby",
        icon: "/ruby.png"
    }
]

export const IskraApps = [
    { id: "lms", name: "Iskra LMS", url: "/app/teacher", icon: BookOpen },
    { id: "planner", name: "Iskra Planner", url: "/app/planner", icon: LayoutGrid },
  ];