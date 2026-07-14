import { Badge } from '@/components/ui/badge';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGlobalTasksData } from './ExamForm';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { CircleCheckIcon } from 'lucide-react';
const TaskDetailsViewer = () => {
    const [searchParams] = useSearchParams();
    const { tasksData } = useGlobalTasksData();
    const [activeTask, setActiveTask] = useState(null);
    
    // Čitamo 'task' iz URL-a (pošto njega koristiš za pretragu ID-ja zadatka)
    const currentTaskId = searchParams.get('task');

    useEffect(() => {
        // Ako nema ID-ja u URL-u ili podaci još nisu učitani, resetuj i prekini
        if (!currentTaskId || !tasksData) {
            setActiveTask(null);
            return;
        }

        let foundTask = null;

        // 1. Provera u practicalTasks
        if (tasksData.practicalTasks && Array.isArray(tasksData.practicalTasks)) {
            foundTask = tasksData.practicalTasks.find(task => 
                task.taskDetails && task.taskDetails._id === currentTaskId
            );
        }

        // 2. Provera u theoryTasks (ako već nije nađen u praktičnim)
        if (!foundTask && tasksData.theoryTasks && Array.isArray(tasksData.theoryTasks)) {
            foundTask = tasksData.theoryTasks.find(task => 
                task.taskDetails && task.taskDetails._id === currentTaskId
            );
        }

        // Postavljamo state samo jednom na kraju (ili nađeni zadatak ili null)
        setActiveTask(foundTask || null);

    }, [currentTaskId, tasksData]); // Efekat reaguje na promenu ID-ja i na promenu samih podataka

    // Poseban useEffect samo za praćenje promene state-a u konzoli (opciono)
    useEffect(() => {
        console.log("Ažuriran activeTask:", activeTask);
    }, [activeTask]);
    
    return (
        <>
            {activeTask ? (
                <div className='w-full p-5'>
                    <p className="text-2xl font-bold border-b-1 pb-2 mb-2">
                        {activeTask?.taskDetails?.title}
                    </p>
                    <Badge className='text-sm px-3 py-2'>
                        {searchParams.get('type') === 'Task' ? "Praktičan zadatak" : "Teorijski zadatak"}
                    </Badge>
                    <Badge className='text-sm px-3 py-2' variant={'secondary'}>Maksimalan broj bodova: {activeTask?.points_max}</Badge>

{activeTask?.taskType === "Task" && (
    <div className="border-2 border-dashed p-4 rounded-lg mt-4 w-fit">
  Programski jezik: {activeTask?.taskDetails?.language?.charAt(0).toUpperCase() + activeTask?.taskDetails?.language?.slice(1)}
</div>
)}
    <div
  className="iskra-rich-text max-w-full mt-3 whitespace-pre-wrap [word-break:break-word] [hyphens:auto]"
  dangerouslySetInnerHTML={{ 
    __html: activeTask?.taskDetails?.richText || activeTask?.taskDetails?.description || "" 
  }}  
/>
                    
                </div>
            ) : (
                <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CircleCheckIcon />
        </EmptyMedia>
        <EmptyTitle>Odaberi zadatak</EmptyTitle>
        <EmptyDescription>
          Kada odabereš zadatak, detalji zadatka će se prikazati ovde.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
            )}
        </>
    );
};

export default TaskDetailsViewer;