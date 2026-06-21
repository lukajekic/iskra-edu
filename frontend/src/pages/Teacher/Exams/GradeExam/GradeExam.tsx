import PageTitle from '@/components/custom/PageTitle'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import axios from 'axios'
import { Check, X, Info } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

export interface StudentRef {
  _id: string;
  name: string;
}

export interface Solution {
  _id: string;
  student_ref: StudentRef;
  total_points_awarded: number;
  total_points_possible: number;
  grade_value: number | null;
  started_at: string; 
}

export interface GradeScale {
  one: number;
  two: number;
  three: number;
  four: number;
  five: number;
}

export interface TestSolutionsResponse {
  solutions: Solution[];
  test_title: string;
  scale: GradeScale;
}

export interface TaskDetails {
  _id: string;
  title: string;
  richText?: string;
  correct_answer?: string;
  description?: string;
}

export interface CandidateAnswer {
  _id: string;
  taskType: 'Task' | 'TheoryTask' | string;
  questionID: string;
  points_max: number;
  status: 'correct' | 'incorrect' | string;
  student_answer: string;
  taskDetails: TaskDetails;
  feedback: string;
  points_awarded: number;
}

export interface SingleCandidateDataType {
  grade: number;
  total_points: number;
  max_points: number;
  answers: CandidateAnswer[];
}

const GradeExam = () => {
    const sveOcene = ["1", "2", "3", "4", "5"];
    const navigate = useNavigate()
    const { id } = useParams()
    const [InitialData, setInitialData] = useState<TestSolutionsResponse | null>(null)
    
    const [filter, setFilter] = useState<string>("")
    const [sortBy, setSortBy] = useState<string>("points_desc") 
    const [searchQuery, setSearchQuery] = useState<string>("")

    const [selectedGrade, setSelectedGrade] = useState<string>("1")
    const [suggestedGrade, setSuggestedGrade] = useState<string>("1")
    
    const [selectedSolutionID, setSelectedSolutionID] = useState<string | null>(null)
    const [isSaving, setIsSaving] = useState<boolean>(false)

    const getCandidates = async () => {
        try {
            const response = await axios.get<TestSolutionsResponse>(`${import.meta.env.VITE_BACKEND}/studentexams/grading-candidates?test=${id}`)
            if (response.status === 200) {
                setInitialData(response.data)
            }
        } catch (error) {
            toast.error("Desila se greska.")
            navigate('/app/teacher/exams')
        }
    }

    useEffect(() => {
        getCandidates()
    }, [])

    const getFilteredAndSortedSolutions = () => {
        if (!InitialData) return []

        let result = [...InitialData.solutions]

        if (searchQuery.trim() !== "") {
            result = result.filter(item => 
                item.student_ref.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        if (filter === "unassigned") {
            result = result.filter(item => item.grade_value === null || item.grade_value === undefined)
        } else if (filter === "assigned") {
            result = result.filter(item => item.grade_value !== null && item.grade_value !== undefined)
        }

        result.sort((a, b) => {
            if (sortBy === "points_desc") {
                return b.total_points_awarded - a.total_points_awarded
            }
            if (sortBy === "points_asc") {
                return a.total_points_awarded - b.total_points_awarded
            }
            if (sortBy === "date_oldest") {
                return new Date(a.started_at).getTime() - new Date(b.started_at).getTime()
            }
            if (sortBy === "date_newest") {
                return new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
            }
            return 0
        })

        return result
    }
    
    const [singleCandidateData, setSingleCandidateData] = useState<SingleCandidateDataType|null>(null)
    const getSingleCandidate = async(solutionID:string)=>{
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND}/studentexams/candidate-data?solution=${solutionID}`)
            if (response.status === 200) {
                setSelectedSolutionID(solutionID)
                setSingleCandidateData(response.data.data)
                console.log(response.data)
            }
        } catch (error) {
            toast.error("Desila se greska!")
        }
    }

    const handleAnswerChange = (index: number, field: 'points_awarded' | 'feedback', value: any) => {
        if (!singleCandidateData) return;
        const updatedAnswers = [...singleCandidateData.answers];
        updatedAnswers[index] = {
            ...updatedAnswers[index],
            [field]: field === 'points_awarded' ? Number(value) : value
        };
        
        const newTotalPoints = updatedAnswers.reduce((sum, ans) => sum + (ans.points_awarded || 0), 0);

        setSingleCandidateData({
            ...singleCandidateData,
            total_points: newTotalPoints,
            answers: updatedAnswers
        });
    };

    useEffect(() => {
        if (!singleCandidateData || !InitialData?.scale) return;

        const currentPoints = singleCandidateData.total_points;
        const scale = InitialData.scale;

        let autoGrade = "1";

        if (currentPoints >= scale.five) {
            autoGrade = "5";
        } else if (currentPoints >= scale.four) {
            autoGrade = "4";
        } else if (currentPoints >= scale.three) {
            autoGrade = "3";
        } else if (currentPoints >= scale.two) {
            autoGrade = "2";
        } else {
            autoGrade = "1";
        }

        setSuggestedGrade(autoGrade);
        setSelectedGrade(autoGrade);
        console.log("Izračunata ocena na osnovu skale:", autoGrade, "Trenutni bodovi:", currentPoints);
    }, [singleCandidateData, InitialData]);

    const saveGrading = async () => {
        if (!selectedSolutionID || !singleCandidateData || !InitialData) {
            toast.error("Nema odabranog kandidata za čuvanje.")
            return
        }

        setIsSaving(true)
        try {
            const payload = {
                solutionID: selectedSolutionID,
                grade_value: Number(selectedGrade),
                answers: singleCandidateData.answers
            }

            const response = await axios.post(`${import.meta.env.VITE_BACKEND}/studentexams/grade-candidate`, payload)

            if (response.status === 200) {
                toast.success("Uspešno sačuvane ocene!")

                const updatedSolutions = InitialData.solutions.map((sol) => {
                    if (sol._id === selectedSolutionID) {
                        return {
                            ...sol,
                            total_points_awarded: singleCandidateData.total_points,
                            grade_value: Number(selectedGrade)
                        }
                    }
                    return sol
                })

                const newInitialData = {
                    ...InitialData,
                    solutions: updatedSolutions
                }
                setInitialData(newInitialData)

                const nextUnassigned = updatedSolutions.find(
                    (sol) => sol.grade_value === null || sol.grade_value === undefined
                )

                if (nextUnassigned) {
                    getSingleCandidate(nextUnassigned._id)
                } else {
                    setSingleCandidateData(null)
                    setSelectedSolutionID(null)
                    toast.info("Svi učenici su uspešno ocenjeni!")
                }
            }
        } catch (error) {
            console.error(error)
            toast.error("Greška prilikom čuvanja podataka.")
        } finally {
            setIsSaving(false)
        }
    }

    const displayedSolutions = getFilteredAndSortedSolutions()
    
    const selectedStudentName = InitialData?.solutions.find(sol => sol._id === selectedSolutionID)?.student_ref.name

    return (
        <main>
            <PageTitle title='Oceni kontrolni zadatak' subtitle={InitialData?.test_title}></PageTitle>

            <div className="flex w-full items-start mt-3">
                <div className="w-1/3 border-r-1 p-2">
                    <div className="flex justify-between mb-4">
                        <div className="w-1/2 border-r-1">
                            <p className="text-lg font-bold">Filteri</p>
                            <RadioGroup value={filter} onValueChange={setFilter} className="mt-2">
                                <div className="flex items-center gap-3">
                                    <RadioGroupItem value="" id="filter-all" />
                                    <Label htmlFor="filter-all">Svi</Label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <RadioGroupItem value="unassigned" id="filter-unassigned" />
                                    <Label htmlFor="filter-unassigned">Neocenjeni</Label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <RadioGroupItem value="assigned" id="filter-assigned" />
                                    <Label htmlFor="filter-assigned">Ocenjeni</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="w-1/2 pl-2">
                            <p className="text-lg font-bold">Sortiraj</p>
                            <RadioGroup value={sortBy} onValueChange={setSortBy} className="mt-2">
                                <div className="flex items-center gap-3">
                                    <RadioGroupItem value="points_desc" id="sort-points-desc" />
                                    <Label htmlFor="sort-points-desc">Bodovi - opadajuće</Label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <RadioGroupItem value="points_asc" id="sort-points-asc" />
                                    <Label htmlFor="sort-points-asc">Bodovi - rastuće</Label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <RadioGroupItem value="date_oldest" id="sort-date-oldest" />
                                    <Label htmlFor="sort-date-oldest">Najstariji</Label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <RadioGroupItem value="date_newest" id="sort-date-newest" />
                                    <Label htmlFor="sort-date-newest">Najnoviji</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>

                    <p className="text-lg font-bold">Kontrolni zadaci</p>
                    <Input 
                        placeholder='Pretraga (ime učenika)' 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="h-5"></div>
                    
                    {displayedSolutions.map((item, index) => (
                        <div onClick={()=>{getSingleCandidate(item._id)}} key={item._id || index} className={`flex justify-between p-2 border-b-1 items-center ${item.grade_value !== null && item.grade_value !== undefined ? "" : "bg-amber-100"} hover:cursor-pointer`}>
                            <p className={`${item.grade_value ? "" : "font-bold"}`}>{item.student_ref.name}</p>
                            <div className="flex items-center gap-2">
                                <p>{item.total_points_awarded}/{item.total_points_possible} bodova</p>
                            </div>
                        </div>
                    ))}
                    
                    {displayedSolutions.length === 0 && InitialData && (
                        <p className="text-sm text-muted-foreground text-center mt-4">Nema rezultata za izabrane kriterijume.</p>
                    )}
                </div>
                
                {singleCandidateData && (
                    <>
                        <div className="w-1/3 p-4">
                            <p className="text-lg font-bold text-primary mb-1">{selectedStudentName}</p>
                            <p className=" text-md">
                                <span className='font-bold text-xl'>
                                    {`${singleCandidateData.total_points}/${singleCandidateData.max_points}`}
                                </span> bodova
                            </p>
                            <p className="text-md">Predlog ocene: <span className='text-xl font-bold'>{suggestedGrade}</span></p>
                            <Separator className='my-2'></Separator>
                            
                            <Label className='italic'>Odaberite ocenu:</Label>
                            <ToggleGroup 
                                variant="outline" 
                                type="single" 
                                value={selectedGrade} 
                                onValueChange={(val) => { if(val) setSelectedGrade(val) }} 
                                size="lg" 
                                className='mt-3'
                            >
                                <ToggleGroupItem value="1" aria-label="1" className='text-xl font-bold data-[state=on]:ring-2 data-[state=on]:ring-primary data-[state=on]:ring-offset-2'>1</ToggleGroupItem>
                                <ToggleGroupItem value="2" aria-label="2" className='text-xl font-bold data-[state=on]:ring-2 data-[state=on]:ring-primary data-[state=on]:ring-offset-2'>2</ToggleGroupItem>
                                <ToggleGroupItem value="3" aria-label="3" className='text-xl font-bold data-[state=on]:ring-2 data-[state=on]:ring-primary data-[state=on]:ring-offset-2'>3</ToggleGroupItem>
                                <ToggleGroupItem value="4" aria-label="4" className='text-xl font-bold data-[state=on]:ring-2 data-[state=on]:ring-primary data-[state=on]:ring-offset-2'>4</ToggleGroupItem>
                                <ToggleGroupItem value="5" aria-label="5" className='text-xl font-bold data-[state=on]:ring-2 data-[state=on]:ring-primary data-[state=on]:ring-offset-2'>5</ToggleGroupItem>
                            </ToggleGroup>

                            <Button onClick={saveGrading} disabled={isSaving || !selectedSolutionID} className='mt-3 w-full'>
                                {isSaving ? "Čuvanje..." : "Sačuvaj"}
                            </Button>
                        </div>

                        <div className="w-1/3 border-x-1 p-4">
                            {singleCandidateData.answers.map((item, index) => {
                                return (
                                    <div key={item._id || index} className="flex flex-col gap-2 mt-5 border-b-1 pb-4">
                                        
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 rounded-full w-[35px] h-[35px] flex justify-center items-center text-sm font-bold bg-secondary">
                                                    {index + 1}.
                                                </div>

                                                {item.points_awarded > 0 ? (
                                                    <Check className='text-green-600' size={20} strokeWidth={3} />
                                                ) : (
                                                    <X className='text-red-600' size={20} strokeWidth={3} />
                                                )}
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <Input 
                                                    type="number" 
                                                    className="w-14 h-8 text-center p-1"
                                                    value={item.points_awarded} 
                                                    onChange={(e) => handleAnswerChange(index, 'points_awarded', e.target.value)}
                                                />
                                                <span className="text-sm font-medium text-gray-500">/{item.points_max}</span>

                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 ml-1">
                                                            <Info className="h-4 w-4 text-blue-500" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                                        <DialogHeader>
                                                            <DialogTitle>Zadatak {index + 1}: Detalji</DialogTitle>
                                                        </DialogHeader>
                                                        <div className="space-y-4 mt-2">
                                                            <div>
                                                                <h4 className="font-bold text-sm text-gray-500 uppercase">Tekst zadatka:</h4>
                                                                <div
                                                                    className="iskra-rich-text mt-1 whitespace-pre-wrap [word-break:break-word] [hyphens:auto]"
                                                                    dangerouslySetInnerHTML={{ 
                                                                        __html: item.taskDetails.richText || item.taskDetails.description || "" 
                                                                    }}  
                                                                />
                                                            </div>
                                                            <Separator />
                                                            <div>
                                                                <h4 className="font-bold text-sm text-gray-500 uppercase">Odgovor studenta:</h4>
                                                                {item.taskType === 'Task' ? (
                                                                    <pre className="w-full mt-1 rounded-md bg-slate-900 p-3 text-white overflow-x-auto text-xs">
                                                                        <code>{item.student_answer || ""}</code>
                                                                    </pre>
                                                                ) : (
                                                                    <p className="mt-1 font-medium">{item.student_answer || "/"}</p>
                                                                )}
                                                            </div>
                                                            {item.taskDetails.correct_answer && (
                                                                <div>
                                                                    <h4 className="font-bold text-sm text-gray-500 uppercase">Tačan odgovor:</h4>
                                                                    <p className="mt-1 text-green-600 font-medium">{item.taskDetails.correct_answer}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </div>

                                        <div className="mt-1">
                                            <Label className="text-xs text-gray-500">Beleška / Feedback nastavnika:</Label>
                                            <Input 
                                                placeholder="Unesite feedback za ovaj zadatak..."
                                                className="text-xs mt-1 h-8"
                                                value={item.feedback || ""}
                                                onChange={(e) => handleAnswerChange(index, 'feedback', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </>
                )}
            </div>
        </main>
    )
}

export default GradeExam