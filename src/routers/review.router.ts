import { Router } from "express";
import auth from "../middelwares/auth.middelware";
import { upload } from "../middelwares/multer.middelware";
import { addReview, getGymReviews, getUserReviews, deleteReview } from "../controllers/reviews.controller";

const router = Router();

router.post("/:gymId", auth, addReview);
router.get("/:gymId", getGymReviews);
router.get("/user", auth, getUserReviews);
router.delete("/:reviewId", auth, deleteReview);

export default router;




