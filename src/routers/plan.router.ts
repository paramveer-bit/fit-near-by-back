import { Router } from "express";
import auth from "../middelwares/auth.middelware";
import { upload } from "../middelwares/multer.middelware";
import { addPlan, getPlans, disablePlan, enablePlan } from "../controllers/plans.controller";

const router = Router();

router.post("/:gymId", addPlan);
router.get("/:gymId", getPlans);
router.delete("/:planId", disablePlan);
router.put("/:planId", enablePlan);

export default router;




