import express from "express";
import { protect } from "../middleware/protect.js";
import { createPlannerFolder, deletePlannerFolder, deletePlannerPlan, generatePlan, getPlannerBalance, getPlannerPlan, listPlannerFolders, listPlannerPlans, renamePlannerFolder, revisePlannerPlan, updatePlannerPlan } from "../controllers/PlannerController.js";

const PlannerRouter = express.Router();
PlannerRouter.use(protect);

PlannerRouter.get("/balance", getPlannerBalance);
PlannerRouter.get("/folders", listPlannerFolders);
PlannerRouter.post("/folders", createPlannerFolder);
PlannerRouter.patch("/folders/:id", renamePlannerFolder);
PlannerRouter.delete("/folders/:id", deletePlannerFolder);
PlannerRouter.get("/plans", listPlannerPlans);
PlannerRouter.get("/plan/:id", getPlannerPlan);
PlannerRouter.patch("/plan/:id", updatePlannerPlan);
PlannerRouter.delete("/plan/:id", deletePlannerPlan);
PlannerRouter.post("/plan/:id/revise", revisePlannerPlan);

export const aiRouter = express.Router();
aiRouter.use(protect);
aiRouter.post("/generate-plan", generatePlan);

export default PlannerRouter;
