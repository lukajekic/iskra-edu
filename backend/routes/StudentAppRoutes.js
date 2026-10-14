import express from 'express'
import { checkIskraAIEligibility, getAIMentorHelp, getFolders, getPracticeGradingJob, getSolution, getTask, RunCode, RunRubyCode, sendSolution } from '../controllers/StudentAppController.js'
import { protect } from '../middleware/protect.js'
import { Limiter15, LimiterJudgeRuns } from '../utilities/limiter10.js'
const router = express.Router()

router.get('/folders', protect, getFolders)
router.get('/task/:id', protect, getTask)
router.get('/solution/:taskID', protect, getSolution)
router.get('/grading/:jobId', protect, getPracticeGradingJob)
router.post('/solution/create', protect, Limiter15, sendSolution)
router.get('/solution/mentor/:taskID/execute', protect, getAIMentorHelp)
router.get('/solution/mentor/:taskID/eligible', protect, checkIskraAIEligibility)

router.post('/run', protect, LimiterJudgeRuns, RunCode)
router.post('/run-ruby', protect, LimiterJudgeRuns, RunRubyCode)
const StudentAppRoutes = router
export default StudentAppRoutes
