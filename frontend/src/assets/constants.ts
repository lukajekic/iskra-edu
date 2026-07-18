import { BookOpen, LayoutGrid, Waypoints } from "lucide-react";

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
    { id: "lms", name: "Iskra LMS", url: "/app/teacher", icon: BookOpen, students: false, teachers: true },
    { id: "lms_student", name: "Iskra za ucenike", url: "/app/student/home", icon: BookOpen, students: true, teachers: false },
    { id: "planner", name: "Iskra Planner", url: "/app/planner", icon: LayoutGrid, students: false, teachers: true },
    { id: "canvas", name: "Iskra Canvas", url: "/app/canvas", icon: Waypoints, students: true, teachers: true },
  ];
