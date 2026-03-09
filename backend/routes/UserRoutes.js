import express from 'express'
import { createAccount, Documentation, getMessages, Login, Logout, MyProfile, readMessage, RedirectMe } from '../controllers/UserController.js'
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
export default router