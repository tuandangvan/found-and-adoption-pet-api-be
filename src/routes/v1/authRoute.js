import express, { json } from "express";
import { authController } from "../../controllers/authController.js";
import authencation from "../../middlewares/authencationHandingMiddleware.js";
import { authorizationMiddelware } from "../../middlewares/authorizationHandlingMiddelware.js";
import PermissionRoles from "../../utils/rolePermission.js";

const router = express.Router();
router.post("/sign-up", authController.signUp);
router.post("/sign-in", authController.signIn);
router.post("/refresh-token", authencation, authController.refreshToken);
router.post("/send-code", authController.reSendEmailAuthencation);
router.post("/verify-code", authController.verifyOTP);
router.post("/forgot-password", authController.forgotPassword);
router.put("/change-password", authencation, authorizationMiddelware.permission(PermissionRoles.User_Center), authController.changePassword);
router.post("/token", authController.checkExpireToken);
router.post("/sign-out", authController.signOut);
router.put("/status", authController.changeStatusAcc);
export const authRoute = router;
