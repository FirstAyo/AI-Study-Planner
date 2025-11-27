import { Router } from "express";
import { TaskController } from "../controllers/taskController.js";
const router = Router();
router.get("/all", TaskController.all);
router.post("/", TaskController.create);
router.post("/move", TaskController.move);
router.post("/complete", TaskController.complete);
export default router;
