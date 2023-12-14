import { StatusCodes } from "http-status-codes";
import { verify } from "jsonwebtoken";
import { env } from "../config/environment.js";
import { enums } from "../enums/enums.js";
import ErrorPost from "../messageError/errorPost.js";
import { postService } from "../services/postService.js";
import ApiError from "../utils/ApiError.js";
import { token } from "../utils/token.js";
import { notifyService } from "../services/notifyService.js";
import { userService } from "../services/userService.js";
import { centerService } from "../services/centerService.js";

const addComment = async (req, res, next) => {
  try {
    const comment = req.body;
    const postId = req.params.postId;
    const post = await postService.findPostById(postId);
    if (!post || (post && post.status != enums.statusPost.ACTIVE)) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorPost.postNotFound);
    }

    const getToken = await token.getTokenHeader(req);
    const decodeToken = verify(getToken, env.JWT_SECRET);
    var infoCmt;
    if (decodeToken.role == "USER") {
      infoCmt = await userService.findUserById(decodeToken.userId);
    } else {
      infoCmt = await centerService.findCenterById(decodeToken.centerId);
    }

    const newPost = await postService.createComment({
      comment: comment,
      postId: postId,
      userId: decodeToken.userId,
      centerId: decodeToken.centerId
    });

    if (
      newPost &&
      !(
        post.centerId == decodeToken.centerId ||
        post.userId == decodeToken.userId
      )
    ) {
      await notifyService.createNotify({
        title: "Comment",
        receiver: [
          {
            userId: post.userId,
            centerId: post.centerId
          }
        ],
        name: decodeToken.role == "USER" ? infoCmt.lastName : infoCmt.name,
        avatar: infoCmt.avatar,
        content: `${
          decodeToken.role == "USER" ? infoCmt.lastName : infoCmt.name
        } commented on your post.`,
        idDestinate: postId,
        allowView: true
      });
    }
    if (newPost) {
      res.status(StatusCodes.CREATED).json({
        success: true,
        message: "Comment posted successfully!",
        _id: newPost._id
      });
    } else {
      throw new ApiError(StatusCodes.UNAUTHORIZED, ErrorPost.postCommentFail);
    }
  } catch (error) {
    const customError = new ApiError(StatusCodes.UNAUTHORIZED, error.message);
    next(customError);
  }
};

const updateComment = async (req, res, next) => {
  try {
    const comment = req.body;
    const postId = req.params.postId;
    const commentId = req.params.commentId;
    const post = await postService.findPostById(postId);
    if (!post || (post && post.status != enums.statusPost.ACTIVE)) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorPost.postNotFound);
    }
    const newPost = await postService.updateCommentByCommentId({
      comment: comment,
      commentId: commentId,
      postId: postId
    });
    if (newPost) {
      res.status(StatusCodes.CREATED).json({
        success: true,
        message: "Comment updated successfully!"
      });
    } else {
      throw new ApiError(StatusCodes.UNAUTHORIZED, ErrorPost.postCommentFail);
    }
  } catch (Error) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, Error.message));
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const { postId, commentId } = req.params;
    const post = await postService.findPostById(postId);
    if (!post || (post && post.status != enums.statusPost.ACTIVE)) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorPost.postNotFound);
    }
    const deleteCommentResult = await postService.deleteComment({
      post: post,
      commentId: commentId
    });
    res.status(StatusCodes.OK).json({
      success: true,
      message: `Comment ${commentId} has been successfully deleted!`
    });
  } catch (error) {
    const customError = new ApiError(StatusCodes.BAD_REQUEST, error.message);
    next(customError);
  }
};

const getComment = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const post = await postService.getPost(postId);
    if (!post || (post && post.status != enums.statusPost.ACTIVE)) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Not found post!");
    }

    res.status(StatusCodes.OK).json({
      success: true,
      status: StatusCodes.OK,
      data: post.comments
    });
  } catch (error) {
    const customError = new ApiError(StatusCodes.BAD_REQUEST, error.message);
    next(customError);
  }
};
export const commentController = {
  addComment,
  updateComment,
  getComment,
  deleteComment
};
