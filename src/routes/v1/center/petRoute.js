import express from "express";
import { petController } from "~/controllers/center/petController";
import authencation from "~/middlewares/authencationHandingMiddleware";
import { authorizationMiddelware } from "~/middlewares/authorizationHandlingMiddelware";
import PermissionRoles from "~/utils/rolePermission";


const router = express.Router();
router.post("/", authencation, authorizationMiddelware.permission(PermissionRoles.onlyCenter), petController.createPet);
router.put("/:petId",authencation, authorizationMiddelware.permission(PermissionRoles.onlyCenter), petController.updatePet);
router.delete("/:petId",authencation, authorizationMiddelware.permission(PermissionRoles.onlyCenter), petController.deletePet);
router.get("/", petController.getAllPets);

export const petRoute = router;
