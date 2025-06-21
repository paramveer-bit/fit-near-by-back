import { Router } from "express";
import { modifyTime, getGymtiming } from "../controllers/gymTime.controller";
import adminAuth from "../middelwares/admin.middelware";

const router = Router();


router.post("/modify/:id", adminAuth, modifyTime);
router.get("/:id", getGymtiming)
export default router;




