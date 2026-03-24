import express from 'express'
const router = express.Router()
import { protect } from '../middleware/protect.js'
import { CreateTask, DeleteTask, EditTask, MySingleTask, MyTasks } from '../controllers/MyTasksController.js'


router.get('/', protect, MyTasks)
router.post('/initialize', protect, CreateTask)
router.put('/edit', protect, EditTask)
router.delete('/delete', protect, DeleteTask)
router.post('/geteditortask', protect, MySingleTask)

const MyTasksRouter = router
export default MyTasksRouter