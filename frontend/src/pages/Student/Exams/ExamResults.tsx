import React, { useEffect, useState } from 'react'
import "./ExamResults.css"
import { Button } from '@/components/ui/button'
import { Check, ChevronLeft, X } from 'lucide-react'
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import prismjs from 'prismjs'
import 'prismjs/themes/prism.css';
import 'prismjs/components/prism-python';

export interface QuizData {
    answers: Answer[];
    grade: number;
    title: string;
    total_points: number;
    max_points: number;
}

export type Answer = CodingAnswer | TheoryAnswer;

export interface CodingAnswer {
    taskType: 'Task';
    questionID: string;
    points_max: number;
    _id: string;
    status: 'correct' | 'incorrect' | 'pending';
    student_answer: string;
    taskDetails: {
        _id: string;
        title: string;
        language: string;
        outputType: string;
        __v: number;
        richText: string;
    };
    feedback: string;
    points_awarded: number;
}

export interface TheoryAnswer {
    taskType: 'TheoryTask';
    questionID: string;
    points_max: number;
    _id: string;
    status: 'correct' | 'incorrect' | 'pending';
    student_answer: string;
    taskDetails: {
        _id: string;
        title: string;
        answers: string[];
        correct_answer: string;
        description: string;
    };
    feedback: string;
    points_awarded: number;
}

const ExamResults = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [data, setData] = useState<QuizData | null>(null)

    const boje: Record<number, { text: string; prefix: string }> = {
        5: { text: 'text-green-500', prefix: "odličan" },
        4: { text: 'text-teal-500', prefix: "vrlo dobar" },
        3: { text: 'text-yellow-500', prefix: "dobar" },
        2: { text: 'text-orange-500', prefix: "dovoljan" },
        1: { text: 'text-red-500', prefix: "nedovoljan" },
    }

    const getResults = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND}/studentexams/test-result?test=${id}`)
            if (response.status === 200) {
                setData(response.data.data)
            }
        } catch (error) {
            toast.error("Desila se greska!")
            navigate('/app/student-exams')
        }
    }

    useEffect(() => {
        getResults()
    }, [])

    const trenutnaOcena = data?.grade && boje[data.grade] ? boje[data.grade] : { text: 'text-gray-500', prefix: 'Nije ocenjeno' };

    useEffect(() => {
        if (data) {
            prismjs.highlightAll()
        }
    }, [data])

    return (
        <>
            <main className="w-full min-h-screen bg-[#e2e2e2] py-[40px]">
                <div className="mx-auto w-[75%] flex justify-left pb-[15px]"><Button onClick={() => { navigate('/app/student-exams') }} variant={'secondary'}><ChevronLeft></ChevronLeft>Povratak</Button></div>
                <div className="paper-div">
                    <div className="flex flex-col gap-2 w-full">
                        <div className="flex justify-between">
                            <div className="flex-1"><h1 className="text-3xl font-bold">{data?.title}</h1></div>
                            <h1 className={`text-3xl ${trenutnaOcena.text}`}>
                                {trenutnaOcena.prefix} {data?.grade ? `(${data.grade})` : ''}
                            </h1>
                        </div>
                        <Separator className='w-full'></Separator>
                        <p className='w-full text-right'>{data?.total_points}/{data?.max_points} bodova</p>
                    </div>


                    {/* resenja */}
                    {data?.answers.map((item, index) => {

                        return (
                            <div key={item._id || index} className="flex items-stretch gap-[20px] mt-5 border-b-1 pb-3">
                                
                                <div className="w-[50px] shrink-0 flex flex-col items-center" id="left-answer-panel">
                                    <div className="draft-box p-4 rounded-[50%] w-[50px] h-[50px] flex justify-center items-center text-lg font-bold">{index + 1}.</div>

                                    {item.status === 'correct' && (
                                        <div className="correct-draft-box mt-3 p-3 rounded-[50%] w-[50px] h-[50px] flex justify-center items-center text-lg font-bold">
                                            <Check className='text-[#a7cb9f]' size="100%" strokeWidth={3} />
                                        </div>)}

                                    {item.status === 'incorrect' && (
                                        <div className="incorrect-draft-box mt-3 p-3 rounded-[50%] w-[50px] h-[50px] flex justify-center items-center text-lg font-bold">
                                            <X className='text-[#cb9f9f]' size="100%" strokeWidth={3} />
                                        </div>)}

                                        <p className="mt-2 text-sm text-gray-700">
                                            {item.points_awarded}/{item.points_max}
                                        </p>
                                </div>
                                
                                <div id="" className="flex-1 flex items-start self-stretch gap-4">
                                        <div id="instructions-panel" className='w-1/2 border-r-1 h-full pr-4'>
                                             <div
                                                className="iskra-rich-text max-w-full mt-3 whitespace-pre-wrap [word-break:break-word] [hyphens:auto]"
                                                dangerouslySetInnerHTML={{ 
                                                    __html: item.taskDetails.richText || item.taskDetails.description || "" 
                                                }}  
                                            />
                                        </div>

                                        <div id="solution-panel" className="flex-1 w-1/2 h-full">
                                            {item.taskType === 'Task' && (
                                                <>
                                                <div className="code-container w-full max-w-full overflow-hidden mt-3">
                                                    <pre className="w-full !m-0 rounded-md overflow-x-auto">
                                                        <code className={`w-full block language-${item.taskDetails.language?.toLowerCase() || 'python'}`}>
                                                            {item.student_answer || ""}
                                                        </code>
                                                    </pre>
                                                </div>

                                                {item?.feedback && (
                                                            <>
                                                            <p className="mt-2 text-gray-600 text-lg font-bold">BELEŠKA:</p>
                                                        <p className="italic">{item?.feedback}</p>
                                                        </>
                                                        )}</>
                                            )}

                                            {item.taskType === 'TheoryTask' && (
                                                item.status === 'correct' ? (
                                                    <>
                                                        <p className="text-gray-600 text-lg">Tvoj odgovor:</p>
                                                        <div className="mt-2 inline-flex items-center gap-2 text-green-600 text-xl">
                                                            <Check />
                                                            <span>{item.student_answer}</span>
                                                        </div>

                                                        {item?.feedback && (
                                                            <>
                                                            <p className="mt-2 text-gray-600 text-lg font-bold">BELEŠKA:</p>
                                                        <p className="italic">{item?.feedback}</p>
                                                        </>
                                                        )}
                                                    </>
                                                ) : item.status === 'incorrect' ? (
                                                    <>
                                                        <p className="text-gray-600 text-lg">Tvoj odgovor:</p>
                                                        <div className="mt-2 inline-flex items-center gap-2 text-red-600 text-xl">
                                                            <X />
                                                            <span>{item.student_answer}</span>
                                                        </div>

                                                        <p className="text-gray-600 text-lg">Tacan odgovor:</p>
                                                        <div className="mt-2 inline-flex items-center gap-2 text-gray-600 text-xl">
                                                            <Check></Check>
                                                            <span>{item.taskDetails.correct_answer}</span>
                                                        </div>

                                                        {item?.feedback && (
                                                            <>
                                                            <p className="mt-2 text-gray-600 text-lg font-bold">BELEŠKA:</p>
                                                        <p className="italic">{item?.feedback}</p>
                                                        </>
                                                        )}
                                                    </>
                                                ) : null
                                            )}
                                        </div>
                                        
                                </div>
                                

                            </div>
                        )
                    })}

                </div>
            </main>
        </>
    )
}

export default ExamResults