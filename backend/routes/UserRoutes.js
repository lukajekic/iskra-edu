import express from 'express'
import rateLimit from 'express-rate-limit'
import { CheckSuperAdminRole, createAccount, createWorkhourGroup, DeleteUserForGdpr, Documentation, endWorkhour, ForbidWork, getAllTeachers, GetUsersForGdprDeletion, getMessages, getSingleStudentProgress, getSingleTeacher, Login, Logout, MyProfile, MyWorkhourGroup, NewMessage, NewMessageToUser, readMessage, RedirectMe, ReGrade, UpdateUserBanStatus, WorkhourPorgress, WorkhourTimer, PortalLogin, PortalSession, SetupPortalOtp, PortalLogout } from '../controllers/UserController.js'
import { protect } from '../middleware/protect.js'
import { protectPortal } from '../middleware/protectPortal.js'
import { inject_req_data } from '../middleware/inject_req_data.js'
import { CheckPortalUsernameAvailability, CreatePortalUser, ListPortalUsers, ResetPortalPassword, RevokePortalTwoFactor, SetPortalUserAccess, UpdatePortalUsername } from '../controllers/PortalUserController.js'
let router = express.Router()
const portalAuthLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 10,
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		message: "Portal login rate limit.",
		toast: "error",
		toast_message: "Previše pokušaja prijave. Pokušajte ponovo za 15 minuta."
	}
})
const portalManagementLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 30,
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		message: "Portal account management rate limit.",
		toast: "error",
		toast_message: "Previše promena naloga. Pokušajte ponovo kasnije."
	}
})


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
router.get('/me/gdpr/users', protect, GetUsersForGdprDeletion)
router.delete('/me/gdpr/users/:id', protect, DeleteUserForGdpr)
//dodato na /portal-login middleware: portalAuthLimiter
router.post('/portal-login', PortalLogin)
router.post('/portal-otp/setup', portalAuthLimiter, SetupPortalOtp)
router.post('/portal-logout', PortalLogout)
router.get('/portal-session', protectPortal, PortalSession)
router.get('/portal/users/username-availability', protectPortal, CheckPortalUsernameAvailability)
router.get('/portal/users', protectPortal, ListPortalUsers)
router.post('/portal/users', protectPortal, portalManagementLimiter, CreatePortalUser)
router.patch('/portal/users/:id/username', protectPortal, portalManagementLimiter, UpdatePortalUsername)
router.patch('/portal/users/:id/password', protectPortal, portalManagementLimiter, ResetPortalPassword)
router.post('/portal/users/:id/revoke-2fa', protectPortal, portalManagementLimiter, RevokePortalTwoFactor)
router.patch('/portal/users/:id/access', protectPortal, portalManagementLimiter, SetPortalUserAccess)

export default router
