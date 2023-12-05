import express from "express";
import { adoptController } from "../../controllers/adoptController.js";
import authencation from "../../middlewares/authencationHandingMiddleware.js";
import { authorizationMiddelware } from "../../middlewares/authorizationHandlingMiddelware.js";
import PermissionRoles from "../../utils/rolePermission.js";


const router = express.Router();
router.post("/", authencation, authorizationMiddelware.permission(PermissionRoles.onlyUser), adoptController.adoption);
router.put("/:adoptId/status", authencation, authorizationMiddelware.permission(PermissionRoles.User_Center), adoptController.adoptionStatusAdopt);
router.get("/center", authencation, authorizationMiddelware.permission(PermissionRoles.onlyCenter), adoptController.getAdoptCenter);

router.get("/user", authencation, authorizationMiddelware.permission(PermissionRoles.onlyUser), adoptController.getAdoptUser);

export const adoptRoute = router;