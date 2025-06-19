import { Router } from "express";
import auth from "../middelwares/auth.middelware";
import { upload } from "../middelwares/multer.middelware";
import { addGym, getGymById, addImage, deleteImageById, getAllImagesByGymId } from "../controllers/gym.controller";

const router = Router();


router.post("/addgym", addGym);
router.get("/:gymId", getGymById);
router.post("/:gymId/addimage", upload, addImage);
router.delete("/deleteimage/:imageId", deleteImageById);
router.get("/:gymId/images", getAllImagesByGymId);
export default router;




