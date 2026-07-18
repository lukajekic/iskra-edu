import 'react-router-dom'
import { BrowserRouter, Routes, Route, createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import Onboarding from "./pages/Auth/Onboarding";
import Terms from './pages/Legal/Terms';
import TeacherDshboardWrapper from './pages/Teacher/TeacherDshboardWrapper';
import Students from './pages/Teacher/Students/Students';
import { Toaster } from './components/ui/sonner';
import Progress from './pages/Teacher/Progress/Progress';
import Tasks from './pages/Teacher/Tasks/Tasks';
import Store from './pages/Teacher/Store/Store';
import Group from './pages/Teacher/Group/Group';
import StudentHome from './pages/Student/Home/StudentHome';
import NotFound from './pages/NotFound/NotFound';
import { TooltipProvider } from './components/ui/tooltip';
import Empty from './pages/Teacher/Empty';
import StudentDashboardWrapper from './pages/Teacher/StudentDashboardWrapper';
import Editor from './pages/Teacher/Editor/Editor';
import Maintenance from './pages/Maintenance';
import MaintenanceGuard from './components/logic/MaintenanceGuard';
import { UserProvider } from './context/UserContext';
import AboutUsModular from './pages/About';
import Privacy from './pages/Legal/Privacy';
import LandingPage from './pages/static/Landing/LandingPage';
import SAHome from './pages/SAAdmin/SAHome';
import ErrorElement from './pages/ErrorElement/ErrorElement';
import TheoryTasks from './pages/Teacher/TheoryTasks/TheoryTasks';
import TheoryEditor from './pages/Teacher/Theory-Editor/TheoryEditor';
import Exams from './pages/Teacher/Exams/Exams';
import StudentExams from './pages/Student/Exams/StudentExams';
import ExamForm from './pages/Student/ExamForm/ExamForm';
import ExamEditor from './pages/Teacher/ExamEditor/ExamEditor';
import ExamResults from './pages/Student/Exams/ExamResults';
import GradeExam from './pages/Teacher/Exams/GradeExam/GradeExam';
import ExamReports from './pages/Teacher/Exams/ExamReports/ExamReports';
import  DesktopOnlyGuard from './components/logic/DesktopOnlyGuard';
import MobileNotAvailable from './components/custom/MobileNotAvailable';
import PlannerWrapper from './pages/Planner/PlannerWrapper';
import Welcome from './pages/Planner/Welcome';
import IskraPlannerViewPage from './pages/Planner/PlanViewer';
import CanvasWrapper from './pages/Canvas/CanvasWrapper';
import CanvasPage from './pages/Canvas/CanvasPage';
export function App() {

  const router = createBrowserRouter([
   {
    element: <MaintenanceGuard></MaintenanceGuard>,
    errorElement: <ErrorElement></ErrorElement>,
    children: [
       {
path: "*",
element: <NotFound></NotFound>
    },
    {
      path: "/",
      element: <LandingPage></LandingPage> //<Navigate to={"/auth/onboarding"} replace></Navigate>
    },
    {
      path: "/error",
      element: <ErrorElement></ErrorElement>
    },
    {
      path: "/about",
      element: <AboutUsModular></AboutUsModular>
    },
    {
      path: "/maintenance",
      element: <Maintenance></Maintenance>
    },
    {
      path: "/auth",
      children: [
        {
          path: "onboarding",
          element: <Onboarding></Onboarding>
        }
      ]
    },

    {
      path: "/legal",
      children: [
        {
          path: "terms",
          element: <Terms></Terms>
        },
        {
          path: "privacy",
          element: <Privacy></Privacy>
        }
      ]
    },
    {
      path: "/not-available-on-mobile",
      element: <MobileNotAvailable></MobileNotAvailable>
    },

    {
      path: "/app",
      children: [
        {
          path: "teacher",
          element: <TeacherDshboardWrapper></TeacherDshboardWrapper>,
          children: [
            {
              index: true,
              element: <Empty></Empty>
            },
            {
              path: "students",
              element: <Students></Students>
            },

            {
              path: "progress",
              element: <Progress></Progress>
            },
            {
              path: "tasks",
              element: <Tasks></Tasks>
            },
            {
              path: "theory-tasks",
              element: <TheoryTasks></TheoryTasks>
            },
            {
              path: "store",
              element: <Store></Store>
            },
            {
              path: "exams",
              children: [
                {
                  path: "all",
                  element: <Exams></Exams>
                },
                {
                  path: "edit/:id",
                  element: <ExamEditor></ExamEditor>
                },

                {
                  path: "grade/:id",
                  element: <GradeExam></GradeExam>
                },
                {
                  path: "reports/:id",
                  element: <ExamReports></ExamReports>
                }
              ]
            },

            {
              path: "group",
              element: <Group></Group>
            },
            {
              path: "editor/:id",
              element: <Editor></Editor>
            },

            {
              path: 'theory-editor/:id',
              element: <TheoryEditor></TheoryEditor>
            },

            {

            }
          ]
        },

        {
          path: "student",
          element: <StudentDashboardWrapper></StudentDashboardWrapper>,
          children: [
            {
              path: "home",
              element: <StudentHome></StudentHome>
            }
          ]
        },

        {
          path: "student-exams",
          element: <StudentExams></StudentExams>,
          
        },

        {
          path: "exam/:id",
          element: <ExamForm></ExamForm>
        },

        {
          path: "exam-results/:id",
          element: <ExamResults></ExamResults>
        },

        {
          path: "planner",
          element: <PlannerWrapper></PlannerWrapper>,
          children: [
            {
              index: true,
              element: <Welcome></Welcome>
            },

            {
              path: "plan/:id",
              element: <IskraPlannerViewPage></IskraPlannerViewPage>
            }
          ]
        },
        {
          path: "canvas",
          element: <CanvasWrapper></CanvasWrapper>,
          children: [{ index: true, element: <CanvasPage></CanvasPage> }]
        }
      ],


    },

    {path: "admin",
      children: [
        {
          index: true,
          element: <SAHome></SAHome>
        }
      ]
    }
    ]
   }
  ])
return (
 <>
 <TooltipProvider>
  <Toaster position='top-center'></Toaster>
<UserProvider>
   <RouterProvider router={router}>
  
 </RouterProvider>
</UserProvider>
 </TooltipProvider>
 </>
)
}

export default App;
