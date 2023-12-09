import express from "express";
import { notifyController } from "../../controllers/notifyController.js";
import authencation from "../../middlewares/authencationHandingMiddleware.js";
import { authorizationMiddelware } from "../../middlewares/authorizationHandlingMiddelware.js";
import PermissionRoles from "../../utils/rolePermission.js";


const router = express.Router();
// router.post("/", notifyController.createNotify);
// router.put("/:adoptId/status", authencation, authorizationMiddelware.permission(PermissionRoles.User_Center), adoptController.adoptionStatusAdopt);
// router.get("/center", authencation, authorizationMiddelware.permission(PermissionRoles.onlyCenter), adoptController.getAdoptCenter);

router.get("/", authencation, authorizationMiddelware.permission(PermissionRoles.All), notifyController.find20Notify);

export const notifyRoute = router;