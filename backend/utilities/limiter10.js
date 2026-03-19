import rateLimit from 'express-rate-limit'
import { BuildValidationReturn } from './ReturnValidationError.js'

export const Limiter15 = rateLimit({
    windowMs: 15 * 1000,
    max: 1,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        message: BuildValidationReturn("rate limit.", "error", "Sacekajte 15 sekundi pre ponovnog pokusaja.")
    },

    keyGenerator: (req, res)=>{
        console.log(req.user._id.toString())
        return req.user._id.toString()
        
    }
})