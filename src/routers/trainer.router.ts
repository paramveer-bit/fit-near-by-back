import { Router } from "express";
import auth from "../middelwares/auth.middelware";
import { upload } from "../middelwares/multer.middelware";
import {
    addTrainer,
    deleteTrainer,
    getAllTrainers
} from "../controllers/trainer.controller";

const router = Router();

router.post("/:gymId", addTrainer);
router.delete("/:trainerId", auth, deleteTrainer);
router.get("/:gymId", getAllTrainers);

export default router;




