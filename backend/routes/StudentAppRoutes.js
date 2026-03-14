import express from 'express'
import { getFolders, getSolution, getTask, sendSolution } from '../controllers/StudentAppController.js'
import { protect } from '../middleware/protect.js'
const router = express.Router()

router.get('/folders', protect, getFolders)
router.get('/task', protect, getTask)
router.get('/solution', protect, getSolution)
router.post('/solution/create', protect, sendSolution)
const StudentAppRoutes = router
export default StudentAppRoutes