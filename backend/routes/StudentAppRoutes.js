import express from 'express'
import { checkIskraAIEligibility, getAIMentorHelp, getFolders, getSolution, getTask, RunCode, sendSolution } from '../controllers/StudentAppController.js'
import { protect } from '../middleware/protect.js'
import { Limiter15 } from '../utilities/limiter10.js'
const router = express.Router()

router.get('/folders', protect, getFolders)
router.get('/task/:id', protect, getTask)
router.get('/solution/:taskID', protect, getSolution)
router.post('/solution/create', protect, Limiter15, sendSolution)
router.get('/solution/mentor/:taskID/execute', protect, getAIMentorHelp)
router.get('/solution/mentor/:taskID/eligible', protect, checkIskraAIEligibility)

router.post('/run', protect, RunCode)
const StudentAppRoutes = router
export default StudentAppRoutes