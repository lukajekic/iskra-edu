import express from 'express'
const router = express.Router()
import { protect } from '../middleware/protect.js'
import { CreateTask, DeleteTask, EditTask, MyTasks } from '../controllers/MyTasksController.js'


router.get('/', protect, MyTasks)
router.post('/initialize', protect, CreateTask)
router.put('/edit', protect, EditTask)
router.delete('/delete', protect, DeleteTask)

const MyTasksRouter = router
export default MyTasksRouter