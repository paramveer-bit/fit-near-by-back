import { Router } from "express";
import adminAuth from "../middelwares/admin.middelware";
import { addPlan, getPlans, togglePlan, } from "../controllers/plans.controller";

const router = Router();

router.post("/:gymId", adminAuth, addPlan);
router.get("/:gymId", getPlans);
router.get("/toggle/:planId", adminAuth, togglePlan);

export default router;




