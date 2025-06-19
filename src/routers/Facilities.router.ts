import { Router } from "express";
import auth from "../middelwares/auth.middelware";
import { upload } from "../middelwares/multer.middelware";
import { addFacility, getFacilities, deleteFacility } from "../controllers/facilities.controller";

const router = Router();

router.post("/:gymId", addFacility);
router.get("/:gymId", getFacilities);
router.delete("/:facilityId", deleteFacility);

export default router;




