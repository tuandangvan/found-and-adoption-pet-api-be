import express from "express";
import { notifyController } from "../../controllers/notifyController.js";


const router = express.Router();
router.post("/", notifyController.createNotify);
// router.put("/:adoptId/status", authencation, authorizationMiddelware.permission(PermissionRoles.User_Center), adoptController.adoptionStatusAdopt);
// router.get("/center", authencation, authorizationMiddelware.permission(PermissionRoles.onlyCenter), adoptController.getAdoptCenter);

// router.get("/user", authencation, authorizationMiddelware.permission(PermissionRoles.onlyUser), adoptController.getAdoptUser);

export const adoptRoute = router;