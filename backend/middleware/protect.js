import jwt from 'jsonwebtoken'
import { UserModel } from '../models/UserModel.js'
import mongoose from 'mongoose'
import { BuildValidationReturn } from '../utilities/ReturnValidationError.js'
import { logEvent } from '../utilities/eventLogger.js'

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
