import { Router } from "express";
import adminAuth from "../middelwares/admin.middelware";
import { upload } from "../middelwares/multer.middelware";
import { addGym, getGymsAccordingToLocation, uploadGymLogo, getAllGymDetails, getGymById, addImage, deleteImageById, getAllImagesByGymId } from "../controllers/gym.controller";

const router = Router();


router.post("/addgym", adminAuth, addGym);
router.post("/:gymId/addimage", upload, adminAuth, addImage);
router.post("/add/logo", upload, adminAuth, uploadGymLogo);

router.get("/:gymId", getGymById);
router.delete("/deleteimage/:imageId", adminAuth, deleteImageById);
router.get("/:gymId/images", getAllImagesByGymId);
router.get("/", getAllGymDetails);
// router.get("/gymDetails", getAllGymDetails);
router.get("/location/getGyms", getGymsAccordingToLocation);
export default router;




