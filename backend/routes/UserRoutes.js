import express from 'express'
import { createAccount, Login, Logout, MyProfile, RedirectMe } from '../controllers/UserController.js'
import { protect } from '../middleware/protect.js'
let router = express.Router()


router.post("/create", createAccount)
router.post('/login', Login)
router.post('/logout', Logout)
router.get("/me/redirect", RedirectMe)
router.get('/me', protect, MyProfile)


export default router