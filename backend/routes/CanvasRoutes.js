import express from "express";
import { deleteCanvasMap, generateCanvasMap, getCanvasBalance, getCanvasMap, listCanvasMaps, renameCanvasMap } from "../controllers/CanvasController.js";
import { checkCanvasTokens } from "../middleware/checkCanvasTokens.js";
import { protect } from "../middleware/protect.js";

const CanvasRouter = express.Router();

CanvasRouter.use(protect);
CanvasRouter.get("/balance", getCanvasBalance);
CanvasRouter.get("/maps", listCanvasMaps);
CanvasRouter.get("/maps/:id", getCanvasMap);
CanvasRouter.patch("/maps/:id", renameCanvasMap);
CanvasRouter.delete("/maps/:id", deleteCanvasMap);
CanvasRouter.post("/generate", checkCanvasTokens, generateCanvasMap);

export default CanvasRouter;
