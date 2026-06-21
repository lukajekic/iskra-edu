import express from 'express'
import { protect } from '../middleware/protect.js'
import { addAnswer, createTheoryTask, DeleteAnswer, editInstructions, getTheoryTasks, GetTHTask, updateCorrectAnswer } from '../controllers/TheroyTasksController.js'

const TheoryTaskRouter = express.Router()

TheoryTaskRouter.get('/', protect, getTheoryTasks)
TheoryTaskRouter.post('/', protect, createTheoryTask)
TheoryTaskRouter.put('/update-answer', protect, updateCorrectAnswer)
TheoryTaskRouter.put('/delete-answer', protect, DeleteAnswer)
TheoryTaskRouter.post('/add-answer', protect, addAnswer)
TheoryTaskRouter.get('/:id', protect, GetTHTask)
TheoryTaskRouter.put('/edit', protect, editInstructions)

export default TheoryTaskRouter