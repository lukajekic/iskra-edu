import express from 'express'
import { protect } from '../middleware/protect.js'
import { deleteStudent, editStudent, getStudents, StudentsProgress } from '../controllers/MyStudentsController.js'
import { createMassActionRequest } from '../controllers/AdminApprovalController.js'
const router = express.Router()

router.get('/', protect, getStudents)
router.put('/edit', protect, editStudent)
router.put('/delete', protect, deleteStudent)
router.get('/progress', protect, StudentsProgress)
router.post('/mass-action-requests', protect, createMassActionRequest)

const MyStudentsRoutes = router
export default MyStudentsRoutes
