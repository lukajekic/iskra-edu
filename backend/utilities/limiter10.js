import rateLimit from 'express-rate-limit'
import { BuildValidationReturn } from './ReturnValidationError.js'
import { createRateLimitHandler } from './eventLogger.js'

export const Limiter15 = rateLimit({
    windowMs: 15 * 1000,
    max: 1,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        message: BuildValidationReturn("rate limit.", "error", "Sacekajte 15 sekundi pre ponovnog pokusaja.")
    },
    handler: createRateLimitHandler({ type: 'rate_limit.grading_rejected', limit: 1, windowMs: 15_000 }),

    keyGenerator: (req)=>{
        return req.user._id.toString()
        
    }
})
