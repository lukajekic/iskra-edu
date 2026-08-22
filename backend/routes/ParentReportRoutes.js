import express from "express";
import rateLimit from "express-rate-limit";
import { getConsentNotice, getStudentActivityReport } from "../controllers/ParentReportController.js";
import { BuildValidationReturn } from "../utilities/ReturnValidationError.js";

const router = express.Router();
const parentReportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    ...BuildValidationReturn("rate limit", "error", "Previše pokušaja. Sačekajte 15 minuta pre ponovnog pokušaja."),
  },
});

router.get("/consent-notice", getConsentNotice);
router.post("/", parentReportLimiter, getStudentActivityReport);

const ParentReportRoutes = router;
export default ParentReportRoutes;
