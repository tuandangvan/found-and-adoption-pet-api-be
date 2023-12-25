import express from "express";
import { petController } from "../../../controllers/center/petController.js";
import authencation from "../../../middlewares/authencationHandingMiddleware.js";
import { authorizationMiddelware } from "../../../middlewares/authorizationHandlingMiddelware.js";
import PermissionRoles from "../../../utils/rolePermission.js";


const router = express.Router();
router.post("/", authencation, authorizationMiddelware.permission(PermissionRoles.onlyCenter), petController.createPet);
router.put("/:petId",authencation, authorizationMiddelware.permission(PermissionRoles.onlyCenter), petController.updatePet);
router.delete("/:petId",authencation, authorizationMiddelware.permission(PermissionRoles.onlyCenter), petController.deletePet);
router.get("/", authencation, authorizationMiddelware.permission(PermissionRoles.onlyCenter), petController.getAllPetOfCenter);
router.get("/:centerId", authencation, authorizationMiddelware.permission(PermissionRoles.All), petController.getAllPetOfCenterPermission);
router.get("/all/pets", authencation, authorizationMiddelware.permission(PermissionRoles.All), petController.getAllPet);
router.get("/search/find", authencation, authorizationMiddelware.permission(PermissionRoles.All), petController.filter);

export const petRoute = router;
