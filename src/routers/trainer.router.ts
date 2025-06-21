import { Router } from "express";
import auth from "../middelwares/auth.middelware";
import { upload } from "../middelwares/multer.middelware";
import {
    addTrainer,
    deleteTrainer,
    getAllTrainers,
    uploadTrainerImage
} from "../controllers/trainer.controller";
import adminAuth from "../middelwares/admin.middelware";

const router = Router();

router.post("/add/:gymId", adminAuth, addTrainer);
router.delete("/delete/:trainerId", adminAuth, deleteTrainer);
router.get("/:gymId", getAllTrainers);
router.post("/upload", upload, adminAuth, uploadTrainerImage);

export default router;




