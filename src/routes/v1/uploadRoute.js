import express from "express";
import { uploadController } from "../../controllers/uploadController.js";
import authencation from "../../middlewares/authencationHandingMiddleware.js";
import { authorizationMiddelware } from "../../middlewares/authorizationHandlingMiddelware.js";
import fileImage from "../../upload/uploadCloudinary.js"
import PermissionRoles from "../../utils/rolePermission.js";


const router = express.Router();
router.post("/single", authencation, authorizationMiddelware.permission(PermissionRoles.All), fileImage.single('file') , uploadController.uploadSingle);
router.post("/multi-image", fileImage.array('file', 5) , uploadController.uploadMulti);

export const uploadRoute = router;
