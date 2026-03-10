import express from 'express'
import { createAccount, createWorkhourGroup, Documentation, endWorkhour, getMessages, Login, Logout, MyProfile, MyWorkhourGroup, readMessage, RedirectMe, WorkhourPorgress, WorkhourTimer } from '../controllers/UserController.js'
import { protect } from '../middleware/protect.js'
let router = express.Router()


router.post("/create", createAccount)
router.post('/login', Login)
router.post('/logout', Logout)
router.get("/me/redirect", RedirectMe)
router.get('/me', protect, MyProfile)
router.get("/me/documents", protect, Documentation)
router.get("/me/messages", protect, getMessages)
router.post('/me/messages/read', protect, readMessage)
router.get('/me/workhour', protect, MyWorkhourGroup)
router.post('/me/workhour/create', protect, createWorkhourGroup)
router.get('/me/workhour/timer', protect, WorkhourTimer)
router.delete('/me/workhour/end', protect, endWorkhour)
router.get('/me/workhour/progress', protect, WorkhourPorgress)
export default router