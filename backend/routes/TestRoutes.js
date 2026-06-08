import express from 'express'
import { protect } from '../middleware/protect.js'
import { editTest, getTests, InitializeTest } from '../controllers/TestController.js'

const TestRouter = express.Router()

TestRouter.get('/', protect, getTests)
TestRouter.post('/initialize', protect, InitializeTest)
TestRouter.put('/', protect, editTest)

export default TestRouter