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
export type TaskStatus = 'none' | 'grading' | 'done';

export interface BaseTask {
  _id: string;
  questionID: string;
  points_max: number;
  status: TaskStatus;
  points_awarded?: number;
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

  const updateTaskStatus = (tasktype:"Task"|"TheoryTask", status:"done"|"correct"|"incorrect"|"grading", id:string)=>{
      setTasksData((prevTasks) => {
          if (!prevTasks) return null;

          const tasks_data_local = { ...prevTasks };

          if (tasktype === 'Task') {
            tasks_data_local.practicalTasks = tasks_data_local.practicalTasks.map(item => {
              if (item.questionID === id || item._id === id) {
                return { ...item, status: status as any }
              }
              return item
            });
          } else if (tasktype === 'TheoryTask') {
            tasks_data_local.theoryTasks = tasks_data_local.theoryTasks.map(item => {
              if (item.questionID === id || item._id === id) {
                return { ...item, status: status as any }
              }
              return item
            })
          }

          return tasks_data_local;
      });
  }

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND}/api/exams/${id}`);
        setTasksData(response.data); 
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
      updateTaskStatus(data.tasktype, data.status, data.id)
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