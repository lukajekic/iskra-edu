import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageTitle from '@/components/custom/PageTitle'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertCircle, ArrowLeft, Award, CheckCircle2, Clock, Percent, TrendingUp, Users, XCircle } from 'lucide-react'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts'
import axios from 'axios'
import { toast } from 'sonner'

const chartConfig = {
  students: { label: "Učenika", color: "hsl(var(--primary))" },
  procenat: { label: "Uspešnost", color: "hsl(var(--chart-2))" },
  bodovi: { label: "Osvojeni bodovi", color: "hsl(var(--chart-3))" },
}

const ExamReports = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [reportData, setReportData] = useState<any>(null)
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_BACKEND}/studentexams/analytics?testID=${id}`)
                if (res.status === 200) {
                    setReportData(res.data.data)
                }
            } catch (error) {
                toast.error("Greška prilikom učitavanja izveštaja.")
            } finally {
                setLoading(false)
            }
        }
        fetchReport()
    }, [id])

    if (loading) return <p className="text-center mt-10 text-muted-foreground animate-pulse">Generisanje duboke analitike testa...</p>
    if (!reportData) return <p className="text-center mt-10">Podaci za ovaj test nisu dostupni.</p>

    const { general, grades, tasks, studentList, maxPointsPossible } = reportData

    const safeMaxPoints = typeof maxPointsPossible === 'number' && maxPointsPossible > 0 ? maxPointsPossible : 0

    const sanitizeTime = (minutes: any) => {
        const m = Number(minutes)
        if (isNaN(m) || m <= 0 || m > 300) return null
        return `${m} min`
    }

    const gradeChartData = ["1", "2", "3", "4", "5"].map(g => {
        const found = grades?.find((item: any) => item._id === Number(g))
        return { grade: `Ocena ${g}`, count: found ? found.count : 0 }
    })

    const pointsDistributionData = studentList?.map((s: any) => ({
        učenik: s.name,
        bodovi: Math.max(0, s.score || 0)
    })).sort((a: any, b: any) => a.bodovi - b.bodovi) || []

    const taskChartData = tasks?.map((t: any, index: number) => {
        const taskMax = t.maxPointsPossible ?? t.maxPoints ?? 0
        const taskAvg = Math.max(0, t.avgPointsAwarded || 0)
        const hasValidPoints = taskMax > 0

        return {
            name: `Zadatak ${index + 1}`,
            procenat: hasValidPoints ? Math.min(100, Math.max(0, Math.round((taskAvg / taskMax) * 100))) : 0,
            avgPoints: taskAvg.toFixed(1),
            maxPoints: hasValidPoints ? taskMax : "--"
        }
    }) || []

    const totalFail = grades?.find((item: any) => item._id === 1)?.count || 0
    const totalGraded = Math.max(0, general?.totalGraded || 0)
    const totalPass = Math.max(0, totalGraded - totalFail)
    
    const passRateData = [
        { name: "Položili", value: totalPass, color: "hsl(var(--chart-2))" },
        { name: "Pali", value: totalFail, color: "hsl(var(--destructive))" }
    ]
    const passRatePercentage = totalGraded > 0 ? Math.min(100, Math.max(0, Math.round((totalPass / totalGraded) * 100))) : 0

    const avgPoints = Math.max(0, general?.avgPoints || 0)
    const classEfficiency = safeMaxPoints > 0 ? Math.min(100, Math.max(0, Math.round((avgPoints / safeMaxPoints) * 100))) : 0

    return (
        <main className=" space-y-8 max-w-[1600px] mx-auto">
              
            <PageTitle title="Analitički izveštaj" subtitle={reportData.testTitle} />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Ocenjeno radova</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{totalGraded}</div>
                        <p className="text-xs text-muted-foreground mt-1">Ukupno predatih i pregledanih submisija</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Srednja ocena odeljenja</CardTitle>
                        <Award className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-600">
                            {general?.avgGrade && general.avgGrade >= 1 ? general.avgGrade.toFixed(2) : "0.00"}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <TrendingUp className="h-3 w-3 text-emerald-500" />
                            <span>Kolektivni uspeh generacije</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Prosek bodova</CardTitle>
                        <Percent className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-600">{avgPoints.toFixed(1)} b.</div>
                        <p className="text-xs text-muted-foreground mt-1" >Prosek bodova svih ucenika.</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Raspon bodova i vreme</CardTitle>
                        <Clock className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{general?.minPointsAwarded || 0} - {general?.maxPointsAwarded || 0} b.</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Raspon postignuca svih ucenika.
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <Card className="lg:col-span-2 shadow-sm">
                    <CardHeader>
                        <CardTitle>Raspodela ocena u odeljenju</CardTitle>
                        <CardDescription>Broj učenika svrstanih po ocenama</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                        <ChartContainer config={chartConfig} className="w-full h-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={gradeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="grade" tickLine={false} axisLine={false} />
                                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                    <Bar dataKey="count" fill="var(--color-students)" radius={[4, 4, 0, 0]} name="Učenika" />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card className="shadow-sm flex flex-col">
                    <CardHeader className="pb-0">
                        <CardTitle>Ukupna prolaznost</CardTitle>
                        <CardDescription>Odnos pozitivnih i negativnih ocena</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pb-0 h-64 flex items-center justify-center relative">
                        <ChartContainer config={chartConfig} className="w-full h-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={passRateData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={90} paddingAngle={4}>
                                        {passRateData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                        <div className="absolute flex flex-col items-center justify-center pointer-events-none pb-4">
                            <span className="text-3xl font-extrabold">{passRatePercentage}%</span>
                            <span className="text-xs text-muted-foreground uppercase tracking-wider">Prolaznost</span>
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col gap-2 text-sm pt-0">
                        <div className="flex w-full justify-between border-t pt-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[hsl(var(--chart-2))]" /> Položilo: {totalPass}</div>
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[hsl(var(--destructive))]" /> Palo (1): {totalFail}</div>
                        </div>
                    </CardFooter>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Procenat uspešnosti po zadacima</CardTitle>
                        <CardDescription>Identifikacija delova gradiva koji nisu savladani</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                        <ChartContainer config={chartConfig} className="w-full h-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={taskChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                                    <YAxis domain={[0, 100]} tickLine={false} axisLine={false} unit="%" />
                                    <ChartTooltip content={
                                        <ChartTooltipContent 
                                            hideLabel
                                            formatter={(value, name, props: any) => (
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="font-medium text-foreground">{props.payload.name}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        Uspešnost: <strong className="text-emerald-600">{value}%</strong>
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        Prosek: {props.payload.avgPoints} / {props.payload.maxPoints} b.
                                                    </span>
                                                </div>
                                            )} 
                                        />
                                    } />
                                    <Bar dataKey="procenat" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]}>
                                        {taskChartData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={entry.procenat < 45 ? 'hsl(var(--destructive))' : 'hsl(var(--chart-4))'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Spektar distribucije bodova</CardTitle>
                        <CardDescription>Vizuelni prikaz performansi od najslabijeg do najboljeg rezultata</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                        <ChartContainer config={chartConfig} className="w-full h-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={pointsDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="učenik" hide />
                                    <YAxis domain={[0, safeMaxPoints > 0 ? safeMaxPoints : 'auto']} tickLine={false} axisLine={false} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Area type="monotone" dataKey="bodovi" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.1} strokeWidth={2} name="Bodovi" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

           

            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>Pojedinačni rezultati učenika</CardTitle>
                    <CardDescription>Presek bodova, ocena i statusa za sve kandidate</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ime i prezime učenika</TableHead>
                                <TableHead className="text-center">Osvojeni bodovi</TableHead>
                                <TableHead className="text-right">Ocena</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {studentList?.map((student: any) => {
                                const currentScore = student.score || 0;
                                const studentPercent = safeMaxPoints > 0 ? Math.min(100, Math.max(0, Math.round((currentScore / safeMaxPoints) * 100))) : 0;
                                const cleanedTime = sanitizeTime(student.timeSpent);

                                return (
                                    <TableRow key={student.solutionID} className="hover:bg-muted/40 transition-colors">
                                        <TableCell className="font-medium">{student.name}</TableCell>
                                        <TableCell className="text-center">
                                            {/* ISPRAVLJENO: Nema više prikaza "35 / 0" */}
                                            {safeMaxPoints > 0 ? `${currentScore} / ${safeMaxPoints}` : `${currentScore} b.`}
                                        </TableCell>
                                    
                                        <TableCell className="text-right">
                                            <Badge className={`text-sm font-bold px-3 ${
                                                student.grade === 5 ? "bg-emerald-600" :
                                                student.grade === 1 ? "bg-destructive" : "bg-primary"
                                            }`}>
                                                {student.grade || "-"}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </main>
    )
}

export default ExamReports