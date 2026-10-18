import jwt from 'jsonwebtoken'
import { UserModel } from '../models/UserModel.js'
import mongoose from 'mongoose'
import { BuildValidationReturn } from '../utilities/ReturnValidationError.js'
import { logEvent } from '../utilities/eventLogger.js'
import { UserSessionModel } from '../models/UserSessionModel.js'
import { createUserSession } from '../utilities/userSessions.js'

export const protect = async(req, res, next) =>{
 try {
    const token = req.cookies.token

    if (!token) {
        return res.status(401).json(BuildValidationReturn("You are not authenticated to access this API, no Token found.", null, null))
    }

    const verify = jwt.verify(token, process.env.JWT_SECRET)

    if (verify) {
        if (verify.scope === 'portal') {
            return res.status(401).json(BuildValidationReturn("Portal session cannot access the standard application.", null, null))
        }

        const user = await UserModel.findById(verify.id)

        if (!user) {
        return res.status(401).json(BuildValidationReturn("User ID located through cookie token but no user found with that ID. If account is temporary, maybe teacher ended workhour.", null, null))
        }

        if (user.login_banned) {
            req.user = user
            logEvent({ category: 'auth', type: 'auth.session_blocked', severity: 'warning', outcome: 'blocked', details: { reason: 'account_banned' }, dedupe: true }, req)
            return res.status(403).json(BuildValidationReturn("Account access revoked.", "error", "Pristup ovom nalogu je opozvan."))
        }
        if ((verify.authVersion || 0) !== (user.auth_version || 0)) {
            req.user = user
            logEvent({ category: 'auth', type: 'auth.session_blocked', severity: 'warning', outcome: 'blocked', details: { reason: 'session_revoked' }, dedupe: true }, req)
            return res.status(401).json(BuildValidationReturn("Session revoked.", "error", "Sesija je opozvana. Prijavite se ponovo."))
        }

        if (verify.sessionId) {
            const session = await UserSessionModel.exists({
                _id: verify.sessionId,
                userRef: user._id,
                scope: 'standard',
                authVersion: user.auth_version || 0,
                revokedAt: null,
                expiresAt: { $gt: new Date() },
            })
            if (!session) {
                req.user = user
                logEvent({ category: 'auth', type: 'auth.session_blocked', severity: 'warning', outcome: 'blocked', details: { reason: 'device_session_revoked' }, dedupe: true }, req)
                return res.status(401).json(BuildValidationReturn("Session revoked.", "error", "Ova sesija je odjavljena. Prijavite se ponovo."))
            }
            req.sessionId = verify.sessionId
        } else if (user.type !== 'student_temp' && verify.exp) {
            // Upgrade still-valid JWTs from before device sessions were deployed.
            const remainingSeconds = Math.max(1, verify.exp - Math.floor(Date.now() / 1000))
            const session = await createUserSession({
                user,
                scope: 'standard',
                req,
                lifetimeSeconds: remainingSeconds,
                createdAt: verify.iat ? new Date(verify.iat * 1000) : new Date(),
                expiresAt: new Date(verify.exp * 1000),
            })
            req.sessionId = String(session._id)
            res.cookie('token', jwt.sign({ id: user._id.toString(), authVersion: user.auth_version || 0, sessionId: req.sessionId }, process.env.JWT_SECRET, { expiresIn: remainingSeconds }), {
                maxAge: remainingSeconds * 1000,
                secure: true,
                httpOnly: true,
                sameSite: 'none',
            })
        }

        req.user = user
        req.user.id = user._id.toString()
        req.user._id = user._id.toString()
        next()
    } else {
                return res.status(401).json(BuildValidationReturn("You are not authenticated to access this API, your token failed on jwt.verify.", null, null))
    }
 } catch (error) {
    logEvent({ category: 'auth', type: 'auth.token_invalid', severity: 'warning', outcome: 'blocked', details: { reason: 'token_verification_failed' }, dedupe: true }, req)
    return res.status(500).json(BuildValidationReturn("Server error on protect middleware", null, null))
 }   
}
