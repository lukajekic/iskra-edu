import React, { act, useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom';
import { useGlobalTasksData } from './ExamForm';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AlertTriangleIcon, Check, SendIcon, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Editor } from '@monaco-editor/react';
import axios from 'axios';
import { toast } from 'sonner';
import posthog from '@/lib/posthog';
import RateLimitDialog, { getRetryAfterSeconds } from '@/components/custom/RateLimitDialog';

const SolutionForm = () => {

    const [searchParams] = useSearchParams();
    const { tasksData, setTasksData } = useGlobalTasksData();
    const [activeTask, setActiveTask] = useState(null);
    const [draft, setDraft] = useState(false)
    const [value, setValue] = useState(null)
    const [rateLimitRetryAt, setRateLimitRetryAt] = useState<number | null>(null);
    const {id} = useParams()
    const currentTaskId = searchParams.get('task');

    const showRateLimitNotice = (error: any, fallbackSeconds = 15) => {
        if (error?.response?.status !== 429) return false;
        setRateLimitRetryAt(Date.now() + getRetryAfterSeconds(error, fallbackSeconds) * 1000);
        return true;
    };

    useEffect(()=>{
        console.log(value)
    }, [value])
    useEffect(() => {
        if (!currentTaskId || !tasksData) {
            setActiveTask(null);
            return;
        }

        let foundTask = null;

        if (tasksData.practicalTasks && Array.isArray(tasksData.practicalTasks)) {
            foundTask = tasksData.practicalTasks.find(task => 
                task.taskDetails && task.taskDetails._id === currentTaskId
            );
        }

        if (!foundTask && tasksData.theoryTasks && Array.isArray(tasksData.theoryTasks)) {
            foundTask = tasksData.theoryTasks.find(task => 
                task.taskDetails && task.taskDetails._id === currentTaskId
            );
        }

        setActiveTask(foundTask || null);
        setValue(foundTask?.student_answer)
        setDraft(false)

    }, [currentTaskId, tasksData]);

    useEffect(() => {
        console.log("Ažuriran activeTask:", activeTask);
    }, [activeTask]);

    const sendAnswerTheory = async()=>{
        const previousTask = activeTask;
        try {
            if (!value) {
                toast.warning("Odaberi odgovor.")
                return
            }

            setTasksData((prev) => {
                    if (!prev) return prev
                    return {
                        ...prev,
                        theoryTasks: prev.theoryTasks.map((task) => {
                            if (task.taskDetails?._id === currentTaskId) {
                                return {
                                    ...task,
                                    student_answer: value,
                                    status: 'grading'
                                }
                            }
                            return task
                        })
                    }
                })
            const response = await axios.post(`${import.meta.env.VITE_BACKEND}/studentexams/theory-solution-check`, {
                test_id: id,
                mutation_id: activeTask?.questionID,
                answer: value
            })

            if (response.status === 200) {
                posthog.capture('student_answer_submitted', {
                    task_type: 'theory',
                })
                setDraft(false)
                setTasksData((prev) => {
                    if (!prev) return prev
                    return {
                        ...prev,
                        theoryTasks: prev.theoryTasks.map((task) => {
                            if (task.taskDetails?._id === currentTaskId) {
                                return {
                                    ...task,
                                    student_answer: value,
                                    status: 'done'
                                }
                            }
                            return task
                        })
                    }
                })
            }
        } catch (error) {
            setTasksData((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    theoryTasks: prev.theoryTasks.map((task) => task.taskDetails?._id === currentTaskId ? {
                        ...task,
                        status: previousTask?.status || 'none',
                        student_answer: value ?? previousTask?.student_answer ?? null,
                    } : task),
                };
            });
            if (!showRateLimitNotice(error)) toast.error("Greska");
        }
    }


    const sendAnswerPractical = async()=>{
        const previousTask = activeTask;
        try {
            if (!value) {
                toast.warning("Unesi kod.")
                return
            }

            setTasksData((prev) => {
                if (!prev) return prev
                return {
                    ...prev,
                    practicalTasks: prev.practicalTasks.map((task) => {
                        if (task.taskDetails?._id === currentTaskId) {
                            return {
                                ...task,
                                student_answer: value,
                                status: 'grading'
                            }
                        }
                        return task
                    })
                }
            })

            const response = await axios.post(`${import.meta.env.VITE_BACKEND}/studentexams/practical-solution-check`, {
                test_id: id,
                mutation_id: activeTask?.questionID,
                answer: value
            })

            if (response.status === 202 && response.data?.jobId) {
                posthog.capture('student_answer_submitted', {
                    task_type: 'practical',
                    evaluation_result: 'queued',
                })
                setDraft(false)
                setTasksData((prev) => {
                    if (!prev) return prev
                    return {
                        ...prev,
                        practicalTasks: prev.practicalTasks.map((task) => {
                            if (task.taskDetails?._id === currentTaskId) {
                                if (task.status === 'correct' || task.status === 'incorrect' || task.status === 'grading_error') return task;
                                return {
                                    ...task,
                                    student_answer: value,
                                    status: 'grading',
                                    grading_job_id: response.data.jobId,
                                    points_awarded: 0
                                }
                            }
                            return task
                        })
                    }
                })
            }
        } catch (error) {
            setTasksData((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    practicalTasks: prev.practicalTasks.map((task) => {
                        if (task.taskDetails?._id !== currentTaskId) return task;
                        if (task.grading_job_id || task.status === 'correct' || task.status === 'incorrect' || task.status === 'grading_error') return task;
                        return {
                        ...task,
                        status: previousTask?.status || 'none',
                        student_answer: value ?? previousTask?.student_answer ?? null,
                            grading_job_id: previousTask?.grading_job_id ?? null,
                        };
                    }),
                };
            });
            if (!showRateLimitNotice(error)) toast.error("Greska")
        }
    }

  return (
    <div className="w-full p-5">
        <RateLimitDialog retryAt={rateLimitRetryAt} onOpenChange={(open) => { if (!open) setRateLimitRetryAt(null) }} />
        <p className="text-2xl font-bold border-b-1 pb-2 mb-2">
                        Rešenje zadatka
                    </p>

        {activeTask?.taskType === 'TheoryTask' ? (
            
            <>
            <p className="italic text-gray-500">
                Rešenje će biti poslato kad klikneš na "Pošalji".
                <br />
                Odabir rešenja možeš menjati.
                <br />
                Tačan odgovor prikazuje se kad se kontrolni zadatak oceni.
            </p>

            {draft && (
                <Alert className="my-2 border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
      <AlertTriangleIcon />
      <AlertTitle>Rešenje nije poslato.</AlertTitle>
      <AlertDescription>
        Da bi tvoje rešenje bilo pregledano i sačuvano, moraš ga poslati klikom na dugme ispod.
      </AlertDescription>
    </Alert>
            )}
            <RadioGroup value={value} onValueChange={(val)=>{console.log("promena resenja u", val), setDraft(true), setValue(val)}} defaultValue="comfortable" className="w-fit mt-5">
    {activeTask?.taskDetails?.answers?.map((item, index) => (
  <div className={`flex items-center gap-3`} key={`radio-wrapper-${index}`}> 
    <RadioGroupItem className='h-5 w-5' value={item} id={`radio${index.toString()}`} />
    <Label className='text-lg' htmlFor={`radio${index.toString()}`}>{item}</Label>
  </div>
))}
      </RadioGroup>
      <Button onClick={()=>{sendAnswerTheory()}} className='mt-5'><SendIcon></SendIcon>Pošalji na pregled</Button>

      {activeTask?.status === 'grading' && (
   <div className="absolute inset-y-0 right-0 bg-white/60 dark:bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-lg w-1/3">
    <div className="text-xl font-bold animate-pulse text-gray-800 dark:text-gray-200">
        Pregled u toku...
    </div>
</div>
)}
      </>
        ) : activeTask?.taskType === 'Task' ? (<>
{activeTask.status !== 'grading' && (
    <div onClick={()=>[sendAnswerPractical()]} className="flex justify-end mb-2"><Button className='mt-5'><SendIcon></SendIcon>Pošalji na pregled</Button></div>
)}
        {activeTask?.status === "incorrect" && (
            <div className="p-3 bg-red-600 flex items-center justify-between rounded-t-lg">
            <div id="left">
                <span className="text-white text-lg inline-flex items-center mt-1 gap-2">
                    <X></X>
                    Odbijeno
                </span>
            </div>

            <div id="right" className='text-white text-xl font-semibold'>{activeTask?.points_awarded || 0}/{activeTask?.points_max}</div>
        </div>
        )}

        {activeTask?.status === "grading_error" && (
            <Alert className="mb-3 border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
                <AlertTriangleIcon />
                <AlertTitle>Provera nije završena</AlertTitle>
                <AlertDescription>{activeTask?.feedback || 'Ocenjivanje trenutno nije dostupno. Možeš ponovo poslati rešenje.'}</AlertDescription>
            </Alert>
        )}


        {activeTask.status === 'correct' && (
            <div className="p-3 bg-green-600 flex items-center justify-between rounded-t-lg">
            <div id="left">
                <span className="text-white text-lg items-center inline-flex mt-1 gap-2">
                    <Check></Check>
                    Prihvaćeno
                </span>
            </div>

            <div id="right" className='text-white text-xl font-semibold'>{activeTask?.points_awarded || 0}/{activeTask?.points_max}</div>
        </div>
        )}
<div className="h-5 bg-[#1e1e1e]"></div>
              <Editor
options={{
  
    selectOnLineNumbers: true,
    renderWhitespace: "all",
    quickSuggestions: {
      other: true,
      comments: true,
      strings: true
    },
    suggestOnTriggerCharacters: true,
    wordBasedSuggestions: "allDocuments",
    links: true,
    colorDecorators: true,
  }}
className='rounded-2xl'
height={500}
theme='vs-dark'
defaultLanguage='python'
onChange={(e)=>{setValue(e)}}
value={value || ""}
></Editor>

<div className="h-5 w-full rounded-b-lg bg-[#1e1e1e]"></div>

{activeTask?.status === 'grading' && (
   <div className="absolute inset-y-0 right-0 bg-white/60 dark:bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-lg w-1/3">
    <div className="text-xl font-bold animate-pulse text-gray-800 dark:text-gray-200">
        Pregled u toku...
    </div>
</div>
)}
        </>) : (<></>)}
    </div>
  )
}

export default SolutionForm
