import express from "express";
import { protect } from "../middleware/protect.js";
import { createPlannerFolder, deletePlannerFolder, deletePlannerPlan, generatePlan, getPlannerBalance, getPlannerPlan, listPlannerFolders, listPlannerPlans, renamePlannerFolder, revisePlannerPlan, updatePlannerPlan } from "../controllers/PlannerController.js";

const router = express.Router();
router.use(protect);

router.get("/balance", getPlannerBalance);
router.get("/folders", listPlannerFolders);
router.post("/folders", createPlannerFolder);
router.patch("/folders/:id", renamePlannerFolder);
router.delete("/folders/:id", deletePlannerFolder);
router.get("/plans", listPlannerPlans);
router.get("/plan/:id", getPlannerPlan);
router.patch("/plan/:id", updatePlannerPlan);
router.delete("/plan/:id", deletePlannerPlan);
router.post("/plan/:id/revise", revisePlannerPlan);

export const aiRouter = express.Router();
aiRouter.use(protect);
aiRouter.post("/generate-plan", generatePlan);

export default router;
