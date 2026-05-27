import express from 'express'
import { protect } from '../middleware/protect.js'
import { createFolder, editFolder, getFolders, getFoldersAndTasks } from '../controllers/MyFoldersController.js'
import { DeleteFolder } from '../controllers/MyTasksController.js'
const router = express.Router()

router.get("/", protect, getFolders)
router.get("/tasks", protect, getFoldersAndTasks)
router.post("/create", protect, createFolder)
router.put("/edit", protect, editFolder)
router.post('/delete', protect, DeleteFolder)

export default router