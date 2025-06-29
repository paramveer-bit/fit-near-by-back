import { Router } from "express";
import adminAuth from "../middelwares/admin.middelware";
import { addPlan, getPlans, togglePlan, userEligiblePlans } from "../controllers/plans.controller";
import auth from "../middelwares/auth.middelware";
const router = Router();

router.post("/:gymId", adminAuth, addPlan);
router.get("/:gymId", getPlans);
router.get("/toggle/:planId", adminAuth, togglePlan);
router.get("/eligible/:gymId", auth, userEligiblePlans);

export default router;




