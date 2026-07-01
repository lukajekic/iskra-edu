import express from 'express'
import { CheckSuperAdminRole, createAccount, createWorkhourGroup, Documentation, endWorkhour, ForbidWork, getAllTeachers, getMessages, getSingleStudentProgress, getSingleTeacher, Login, Logout, MyProfile, MyWorkhourGroup, NewMessage, NewMessageToUser, readMessage, RedirectMe, ReGrade, UpdateUserBanStatus, WorkhourPorgress, WorkhourTimer } from '../controllers/UserController.js'
import { protect } from '../middleware/protect.js'
import { inject_req_data } from '../middleware/inject_req_data.js'
let router = express.Router()


router.post("/create", inject_req_data, createAccount)
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
router.post('/me/workhour/forbid', protect, ForbidWork)

router.get('/inspect/student/:id', protect, getSingleStudentProgress)
router.put('/inspect/student/regrade', protect, ReGrade)

router.get('/me/superadmin', protect, CheckSuperAdminRole)
router.post('/me/messages', protect, NewMessage)
router.post('/me/messages-specific', protect, NewMessageToUser)

router.get("/me/teachers/all", protect, getAllTeachers)
router.get("/me/teachers/:id", protect, getSingleTeacher)
router.put('/me/teachers/ban/:id', protect, UpdateUserBanStatus)

export default router