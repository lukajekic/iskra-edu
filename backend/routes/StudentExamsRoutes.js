import express from 'express'
import { protect } from '../middleware/protect.js'
import { Limiter15 } from '../utilities/limiter10.js'
import { ApproveAntiCheat, checkPracticalSolution, CheckTheorySolution, finishTest, getExams, getResultData, getTasksData, InitializeSolution, ReportCheat } from '../controllers/StudentsExamsController.js'
const StudentExamsRouter = express.Router()

StudentExamsRouter.get('/', protect, getExams)
StudentExamsRouter.post('/initialize', protect, InitializeSolution)
StudentExamsRouter.get('/taskdata', protect, getTasksData)
StudentExamsRouter.post('/finish', protect, finishTest)
StudentExamsRouter.post('/validate-anticheat', protect, ApproveAntiCheat)
StudentExamsRouter.post('/report-cheating', protect, ReportCheat)
StudentExamsRouter.post('/theory-solution-check', protect, CheckTheorySolution)
StudentExamsRouter.post('/practical-solution-check', protect, checkPracticalSolution)
StudentExamsRouter.get('/test-result', protect, getResultData)
export default StudentExamsRouter