import { Router } from "express";
import adminAuth from "../middelwares/admin.middelware";
import { upload } from "../middelwares/multer.middelware";
import { addGym, getAllgyms, getGymById, addImage, deleteImageById, getAllImagesByGymId } from "../controllers/gym.controller";

const router = Router();


router.post("/addgym", adminAuth, addGym);
router.get("/:gymId", getGymById);
router.post("/:gymId/addimage", upload, adminAuth, addImage);
router.delete("/deleteimage/:imageId", adminAuth, deleteImageById);
router.get("/:gymId/images", getAllImagesByGymId);
router.get("/", getAllgyms);
export default router;




