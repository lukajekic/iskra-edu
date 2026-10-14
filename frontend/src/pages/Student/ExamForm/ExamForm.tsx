import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import TaskExplorer from './TaskExplorer'
import TaskDetailsViewer from './TaskDetailsViewer'
import SolutionForm from './SolutionForm';
import axios from 'axios';
import { useParams } from 'react-router-dom';

export interface TasksDataContextType {
  tasksData: CourseTasksResponse | null;
  setTasksData: React.Dispatch<React.SetStateAction<CourseTasksResponse | null>>;
}

export const TasksDataContext = createContext<TasksDataContextType | undefined>(undefined);

export type TaskType = 'Task' | 'TheoryTask';
export type TaskStatus = 'none' | 'grading' | 'done' | 'correct' | 'incorrect' | 'grading_error';

export interface BaseTask {
  _id: string;
  questionID: string;
  points_max: number;
  status: TaskStatus;
  points_awarded?: number;
  student_answer?: string | null;
  grading_job_id?: string | null;
  feedback?: string;
}

export interface PracticalTaskDetails {
  _id: string;
  title: string;
  language: string;
  outputType: string;
  richText: string;
  __v?: number; 
}

export interface PracticalTask extends BaseTask {
  taskType: 'Task';
  taskDetails: PracticalTaskDetails;
}

export interface TheoryTaskDetails {
  _id: string;
  title: string;
  description: string;
  answers: string[];
}

export interface TheoryTask extends BaseTask {
  taskType: 'TheoryTask';
  taskDetails: TheoryTaskDetails;
}

export interface CourseTasksResponse {
  practicalTasks: PracticalTask[];
  theoryTasks: TheoryTask[];
  solutionid: string
}

const ExamForm = () => {
  const socketRef = useRef<Socket | null>(null)
  const [tasksData, setTasksData] = useState<CourseTasksResponse|null>(null) 
  const { id } = useParams();

  const currentRoomId = tasksData?.solutionid;

  const updateExamPracticalStatus = (data: { tasktype?: string; status?: TaskStatus; id?: string; jobId?: string; points_awarded?: number; feedback?: string })=>{
      if (data.tasktype !== "Task" || !data.id || !data.status) return;
      setTasksData((prevTasks) => {
          if (!prevTasks) return null;
          return {
            ...prevTasks,
            practicalTasks: prevTasks.practicalTasks.map((task) => {
              if (task.questionID !== data.id && task._id !== data.id && task.taskDetails?._id !== data.id) return task;
              const terminal = data.status === "correct" || data.status === "incorrect" || data.status === "grading_error";
              const alreadyTerminal = task.status === "correct" || task.status === "incorrect" || task.status === "grading_error";
              if (data.status === "grading" && alreadyTerminal) return task;
              if (terminal && task.grading_job_id && data.jobId && task.grading_job_id !== data.jobId) return task;
              return {
                ...task,
                status: data.status,
                points_awarded: data.points_awarded ?? task.points_awarded,
                feedback: data.feedback ?? task.feedback,
                grading_job_id: terminal ? null : (data.jobId || task.grading_job_id),
              };
            }),
          };
      });
  }

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND}/studentexams/taskdata?test=${id}`);
        setTasksData(response.data.data); 
      } catch (error) {
        console.error("Greška pri povlačenju podataka:", error);
      }
    };

    if (id) {
      fetchExamData();
    }
  }, [id]);

  useEffect(() => {
    if (!currentRoomId) return;

    const socket = io(import.meta.env.VITE_BACKEND, {
      transports: ['websocket'], 
    });
    
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Socket povezan:", socket.id);
      socket.emit('join_exam_room', currentRoomId);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Greška konekcije:", err.message);
    });

    socket.onAny((eventName, ...args) => {
      console.log(`📨 Event "${eventName}":`, args);
    });

    socket.on("message", (data) => {
      console.log("Informativna poruka WS:", data);
    });

    socket.on("update_exam_solution_status", (data) => {
      console.log("update_exam_solution_status data:", data);
      updateExamPracticalStatus(data)
    });

    return () => {
      socket.offAny();
      socket.off("connect");
      socket.off("connect_error");
      socket.off("message");
      socket.off("update_exam_solution_status");
      socket.disconnect();
    };
  }, [currentRoomId]);

  const gradingJobsKey = (tasksData?.practicalTasks || [])
    .filter((task) => task.status === "grading" && task.grading_job_id)
    .map((task) => task.grading_job_id as string)
    .sort()
    .join(",");

  useEffect(() => {
    if (!gradingJobsKey) return;
    const jobIds = gradingJobsKey.split(",");
    let cancelled = false;
    let inFlight = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      if (cancelled || inFlight) return;
      inFlight = true;
      try {
        const outcomes = await Promise.all(jobIds.map(async (jobId) => {
          try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND}/studentexams/grading/${jobId}`, { timeout: 10_000 });
            return response.data;
          } catch (error: any) {
            if (error?.response?.status === 404) {
              return { jobId, status: "failed", result: { feedback: "Status ocenjivanja više nije dostupan." } };
            }
            console.error("Greška pri proveri statusa praktičnog zadatka:", error);
            return null;
          }
        }));

        if (cancelled) return;
        const resultsByJob = new Map<string, any>();
        outcomes.forEach((job: any) => {
          if (job?.jobId) resultsByJob.set(job.jobId, job);
        });
        setTasksData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            practicalTasks: prev.practicalTasks.map((task) => {
              const job = task.grading_job_id ? resultsByJob.get(task.grading_job_id) as any : null;
              if (!job || (job.status !== "completed" && job.status !== "failed")) return task;
              return {
                ...task,
                status: job.status === "failed" ? "grading_error" : (job.result?.correct ? "correct" : "incorrect"),
                points_awarded: job.result?.points_awarded ?? 0,
                feedback: job.result?.feedback || "",
                grading_job_id: null,
              };
            }),
          };
        });
      } finally {
        inFlight = false;
        if (!cancelled) timer = setTimeout(poll, document.visibilityState === "visible" ? 2_000 : 5_000);
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        if (timer) clearTimeout(timer);
        void poll();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    void poll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [gradingJobsKey]);

  return (
    <TasksDataContext.Provider value={{tasksData, setTasksData}}>
       <div className="h-screen min-h-screen md:max-h-screen w-full overflow-y-auto md:overflow-hidden">
        <div id="grid" className="h-full w-full flex flex-col md:flex-row gap-0 items-start">
             
            <div id="task-explorer-1" className="h-[33.33vh] md:h-full w-full md:w-1/3 overflow-y-auto border-b md:border-b-0 md:border-r border-[#cecece]">
              <TaskExplorer></TaskExplorer>
            </div>
            
            <div id="task-explorer-2" className="h-[33.33vh] md:h-full w-full md:w-1/3 overflow-y-auto border-b md:border-b-0 md:border-r border-[#cecece]">
              <TaskDetailsViewer></TaskDetailsViewer>
            </div>

            <div id="task-explorer-3" className="h-[33.33vh] md:h-full w-full md:w-1/3 overflow-y-auto">
              <SolutionForm></SolutionForm>
            </div>

        </div>
    </div>
    </TasksDataContext.Provider>
  )
}

export default ExamForm

export const useGlobalTasksData = () => {
  const context = useContext(TasksDataContext);
  if (!context) {
    throw new Error('useGlobalTasksData must be used within TasksDataContext.Provider');
  }
  return context;
}
