import express from 'express'
import { protect } from '../middleware/protect.js'
import { createFolder, editFolder, getFolders, getFoldersAndTasks } from '../controllers/MyFoldersController.js'
const router = express.Router()

router.get("/", protect, getFolders)
router.get("/tasks", protect, getFoldersAndTasks)
router.post("/create", protect, createFolder)
router.put("/edit", protect, editFolder)
export default router