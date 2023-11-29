import express from "express";
import { commentController } from "../../controllers/commentController.js";
import { postController } from "../../controllers/postController.js";
import authencation from "../../middlewares/authencationHandingMiddleware.js";
import { authorizationMiddelware } from "../../middlewares/authorizationHandlingMiddelware.js";
import PermissionRoles from "../../utils/rolePermission.js";


const router = express.Router();
router.post("/", authencation, authorizationMiddelware.permission(PermissionRoles.User_Center), postController.addPost);
router.put("/:postId", authencation, authorizationMiddelware.permission(PermissionRoles.User_Center), postController.updatePost);
router.delete("/:postId", authencation, authorizationMiddelware.permission(PermissionRoles.User_Center), postController.deletePost);
router.put("/:postId/status", authencation, authorizationMiddelware.permission(PermissionRoles.User_Center), postController.changeStatusPost);
router.get("/:postId", authencation, authorizationMiddelware.permission(PermissionRoles.All), postController.getPost);
router.get("/", authencation, authorizationMiddelware.permission(PermissionRoles.All), postController.getAllPost);

//comment
router.post("/:postId/comment/", authencation, authorizationMiddelware.permission(PermissionRoles.All), commentController.addComment);
router.put("/:postId/comment/:commentId", authencation, authorizationMiddelware.permission(PermissionRoles.User_Center), commentController.updateComment);
router.delete("/:postId/comment/:commentId", authencation, authorizationMiddelware.permission(PermissionRoles.User_Center), commentController.deleteComment);
router.get("/:postId/comment", authencation, authorizationMiddelware.permission(PermissionRoles.All), postController.getComment);

//reaction
router.put("/:postId/reaction", authencation, authorizationMiddelware.permission(PermissionRoles.All), postController.reactionPost);
router.get("/:postId/reaction", authencation, authorizationMiddelware.permission(PermissionRoles.All), postController.getReaction);


export const postRoute = router;
