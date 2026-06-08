import express from 'express'
import { protect } from '../middleware/protect.js'
import { Limiter15 } from '../utilities/limiter10.js'
import { getExams, InitializeSolution } from '../controllers/StudentsExamsController.js'
const StudentExamsRouter = express.Router()

StudentExamsRouter.get('/', protect, getExams)
StudentExamsRouter.post('/initialize', protect, InitializeSolution)

export default StudentExamsRouter