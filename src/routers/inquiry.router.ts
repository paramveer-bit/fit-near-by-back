import { Router } from "express";
import { sendEmail } from "../controllers/Inquiry.controller";
import adminAuth from "../middelwares/admin.middelware";

const router = Router();

router.post("/send", sendEmail);


export default router;




