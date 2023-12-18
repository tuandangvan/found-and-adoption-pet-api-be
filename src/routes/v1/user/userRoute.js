import express from "express";
import { userController } from "../../../controllers/user/userController.js";
import authencation from "../../../middlewares/authencationHandingMiddleware.js";
import { authorizationMiddelware } from "../../../middlewares/authorizationHandlingMiddelware.js";
import PermissionRoles from "../../../utils/rolePermission.js";


const router = express.Router();
router.get("/:userId", userController.findUser);
router.post("/:accountId", userController.createInformation);
router.put("/:userId", authencation, authorizationMiddelware.permission(PermissionRoles.onlyUser),
userController.changeInfomation); //find user by name or phone or email
router.put("/:userId/status", authencation, authorizationMiddelware.permission(PermissionRoles.onlyUser),
userController.changStatusAccount);

router.get("/get-users", userController.findUserByNamePhoneEmail); //find user by name or phone or email

router.put("/:userId", authencation, authorizationMiddelware.permission(PermissionRoles.onlyUser),
userController.changeInfomation); //find user by name or phone or email



export const userRoute = router;
