import express from "express";
import { authorizeMassActionRequest, createMassActionRequest } from "../controllers/AdminApprovalController.js";
import { protect } from "../middleware/protect.js";

const router = express.Router();

router.post("/requests", protect, createMassActionRequest);
router.post("/authorize", protect, authorizeMassActionRequest);

export default router;
