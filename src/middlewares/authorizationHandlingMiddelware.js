import { verify } from "jsonwebtoken";
import { env } from "../config/environment.js";
import { petService } from "../services/petService.js";
import { postService } from "../services/postService.js";
import PermissionRoles from "../utils/rolePermission.js";
import { _ } from "lodash";
import { adoptService } from "../services/adoptService.js";
import { enums } from "../enums/enums.js";
import ErrorAdopt from "../messageError/errorAdopt.js";

const permission = (permission) => {
  return async (req, res, next) => {
    const token = req.header("Authorization").replace("Bearer ", "");
    const data = verify(token, env.JWT_SECRET);

    const userId = req.params.userId;
    const centerId = req.params.centerId;
    const petId = req.params.petId;
    const postId = req.params.postId;
    const commentId = req.params.commentId;
    const adoptId = req.params.adoptId;

    if (_.isEqual(permission, PermissionRoles.All)) {
      next();
      return;
    }

    if (!permission.includes(data.role)) {
      return res.status(401).json({ error: "You don't permission!" });
    }

    if (centerId) {
      if (!centerId.includes(data.centerId)) {
        return res.status(401).json({ error: "You don't permission!" });
      }
    } else if (userId) {
      if (!userId.includes(data.userId)) {
        return res.status(401).json({ error: "You don't permission!" });
      }
    } else if (petId) {
      const pet = await petService.findPetById(petId);
      const centerIdTemp = pet.centerId.toString();
      if (!centerIdTemp.includes(data.centerId)) {
        return res.status(401).json({ error: "You don't permission!" });
      }
    } else if (postId) {
      const post = await postService.findPostById(postId);
      let centerIdTemp = null;
      let userIdTemp = null;
      if (post.centerId) centerIdTemp = post.centerId.toString();
      else userIdTemp = post.userId.toString();
      if (commentId == null) {
        if (centerIdTemp) {
          if (!centerIdTemp.includes(data.centerId)) {
            return res.status(401).json({ error: "You don't permission!" });
          }
        } else {
          if (!userIdTemp.includes(data.userId)) {
            return res.status(401).json({ error: "You don't permission!" });
          }
        }
      } else {
        const index = post.comments.findIndex(
          (element) => element.id == commentId
        );
        if (index != -1) {
          if (post.comments[index].userId != null) {
            if (!post.comments[index].userId.toString().includes(data.userId))
              return res.status(401).json({ error: "You don't permission!" });
          } else if (post.comments[index].centerId != null)
            if (
              !post.comments[index].centerId.toString().includes(data.centerId)
            )
              return res.status(401).json({ error: "You don't permission!" });
        }
      }
    } else if (adoptId) {
      const adopt = await adoptService.findAdoptById(adoptId);
      if(!adopt){
        return res.status(404).json({ message: ErrorAdopt.adoptNotFound });
      }
      await adopt.populate("petId");
      const centerId = adopt.petId.centerId.toString();
      const userId = adopt.userId.toString();
      if (
        (!centerId.includes(data.centerId) || data.userId) &&
        req.body.statusAdopt == enums.statusAdopt.ACCEPTED
      ) {
        return res.status(401).json({ error: "You don't permission!" });
      } else if (req.body.statusAdopt == enums.statusAdopt.CANCELLED) {
        if (data.userId) {
          if (!userId.includes(data.userId))
            return res.status(401).json({ error: "You don't permission!" });
        } else if (data.centerId) {
          if (!centerId.includes(data.centerId))
            return res.status(401).json({ error: "You don't permission!" });
        }
      }
    }
    next();
    return;
  };
};

export const authorizationMiddelware = {
  permission
};
