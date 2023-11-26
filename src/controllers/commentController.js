import { StatusCodes } from "http-status-codes";
import { verify } from "jsonwebtoken";
import { env } from "../config/environment.js";
import { enums } from "../enums/enums.js";
import ErrorPost from "../messageError/errorPost.js";
import { postService } from "../services/postService.js";
import ApiError from "../utils/ApiError.js";
import { token } from "../utils/token.js";

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

    const newPost = await postService.createComment({
      comment: comment,
      postId: postId,
      userId: decodeToken.userId,
      centerId: decodeToken.centerId
    });
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
    const customError = new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message
    );
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
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, Error.message));
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
      message: `Comment ${commentId} has been successfully deleted!`,
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
      comments: post.comments
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
