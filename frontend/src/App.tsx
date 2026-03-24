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
export function App() {

  const router = createBrowserRouter([
   {
    element: <MaintenanceGuard></MaintenanceGuard>,
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
              path: "store",
              element: <Store></Store>
            },

            {
              path: "group",
              element: <Group></Group>
            },
            {
              path: "editor/:id",
              element: <Editor></Editor>
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