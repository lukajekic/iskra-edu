import express from 'express'
import { protect } from '../middleware/protect.js'
import { deleteStudent, editStudent, getStudents, StudentsProgress } from '../controllers/MyStudentsController.js'
const router = express.Router()

router.get('/', protect, getStudents)
router.put('/edit', protect, editStudent)
router.put('/delete', protect, deleteStudent)
router.get('/progress', protect, StudentsProgress)

const MyStudentsRoutes = router
export default MyStudentsRoutes