import { Router } from "express";
import auth from "../middelwares/auth.middelware";
import { createBooking, verifyPayment } from "../controllers/booking.controller";

const router = Router();

router.post("/placeOrder", auth, createBooking);
router.post("/verifyPayment", auth, verifyPayment);

export default router;




