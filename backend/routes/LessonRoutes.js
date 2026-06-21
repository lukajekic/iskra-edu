import express from 'express'
import { protect } from '../middleware/protect.js'
import { createLesson, getLessons } from '../controllers/LessonController.js'

const LessonRouter = express.Router()

LessonRouter.get('/', protect, getLessons)
LessonRouter.post('/', protect, createLesson)

export default LessonRouter