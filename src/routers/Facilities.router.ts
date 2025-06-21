import { Router } from "express";
import adminAuth from "../middelwares/admin.middelware";
import { addFacility, getFacilities, deleteFacility } from "../controllers/facilities.controller";

const router = Router();

router.post("/:gymId", adminAuth, addFacility);
router.get("/:gymId", getFacilities);
router.delete("/:facilityId", adminAuth, deleteFacility);

export default router;




