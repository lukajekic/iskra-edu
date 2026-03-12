import express from 'express'
import { protect } from '../middleware/protect.js'
import { downloadTask, getTasks, publishTask } from '../controllers/StoreController.js'
const router = express.Router()

router.get('/', protect, getTasks)
router.post('/publish', protect, publishTask)
router.get('/download', protect, downloadTask)

const StoreRoutes = router
export default StoreRoutes