import { Router } from "express";
import auth from "../middelwares/auth.middelware";
import { signup, signIn, verifyUser, resendOtp, signOut, isSignedIn } from "../controllers/user/auth.controller";

const router = Router();


router.post("/auth/signup", signup);
router.post("/auth/signIn", signIn);
router.post("/auth/verifyUser", verifyUser);
router.post("/auth/resendOtp", resendOtp);
router.get("/auth/isSignedIn", auth, isSignedIn);
router.get("/auth/signout", auth, signOut);

export default router;




