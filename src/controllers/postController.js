import { StatusCodes } from "http-status-codes";
import { verify } from "jsonwebtoken";
import { env } from "../config/environment.js";
import { enums } from "../enums/enums.js";
import ErrorPost from "../messageError/errorPost.js";
import { postService } from "../services/postService.js";
import ApiError from "../utils/ApiError.js";
import { setEnum } from "../utils/setEnum.js";
import { token } from "../utils/token.js";
import postModel from "../models/postModel.js";
import { accountService } from "../services/accountService.js";

const addPost = async (req, res, next) => {
  try {
    const post = req.body;
    const getToken = await token.getTokenHeader(req);
    const decodeToken = verify(getToken, env.JWT_SECRET);
    const newPost = await postService.createPost({
      data: post,
      userId: decodeToken.userId,
      centerId: decodeToken.centerId
    });
    if (newPost) {
      res.status(StatusCodes.CREATED).json({
        success: true,
        message: "Posted successfully!",
        postId: newPost.id
      });
    } else {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
        success: false,
        message: "Posting failed!"
      });
    }
  } catch (error) {
    const customError = new ApiError(StatusCodes.UNAUTHORIZED, error.message);
    next(customError);
  }
};

const updatePost = async (req, res, next) => {
  try {
    const newPost = req.body;
    const postId = req.params.postId;
    const oldPost = await postService.findPostById(postId);
    if (!oldPost) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorPost.postNotFound);
    }
    await postService.updatePost({ postId: oldPost.id, data: newPost });
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Post updated successfully!"
    });
  } catch (Error) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, Error.message));
  }
};

const deletePost = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const oldPost = await postService.findPostById(postId);
    if (!oldPost) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorPost.postNotFound);
    }
    await postService.deletePostDB(postId);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Post deleted successfully!"
    });
  } catch (Error) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, Error.message));
  }
};

const reactionPost = async (req, res, next) => {
  try {
    const getToken = await token.getTokenHeader(req);
    const decodeToken = verify(getToken, env.JWT_SECRET);
    const postId = req.params.postId;
    const post = await postService.findPostById(postId);
    if (!post || (post && post.status != enums.statusPost.ACTIVE)) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorPost.postNotFound);
    }
    const userId = decodeToken.userId;
    const centerId = decodeToken.centerId;
    const reaction = await postService.reaction({
      post: post,
      userId: userId,
      centerId: centerId
    });
    if (!reaction) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Error");
    }
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Post reaction success!",
      data: reaction
    });
  } catch (error) {
    const customError = new ApiError(StatusCodes.BAD_REQUEST, error.message);
    next(customError);
  }
};

const changeStatusPost = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const post = await postService.findPostById(postId);
    if (!post) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorPost.postNotFound);
    }
    const status = req.body.status;
    const statusNew = await setEnum.setStatusPost(status);

    const changeStatus = await postService.updateStatusPost({
      post: post,
      newStatus: statusNew
    });
    res.status(StatusCodes.OK).json({
      success: true,
      data: `Change status to ${statusNew}`
    });
  } catch (error) {
    const customError = new ApiError(StatusCodes.BAD_REQUEST, error.message);
    next(customError);
  }
};

const getPost = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const getToken = await token.getTokenHeader(req);
    const decodeToken = verify(getToken, env.JWT_SECRET);
    const post = await postService.findPostInfoById(postId);
    if (!post) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorPost.postNotFound);
    }
    let check = false;
    if (post.status == enums.statusPost.ACTIVE) {
      if (post.centerId) {
        if (
          post.centerId.id == decodeToken.centerId &&
          decodeToken.userId == null
        )
          check = true;
        else {
          if (post.centerId.status == enums.statusAccount.ACTIVE) check = true;
        }
      }
      if (post.userId) {
        if (
          post.userId.id == decodeToken.userId &&
          decodeToken.centerId == null
        )
          check = true;
        else {
          if (post.userId.status == enums.statusAccount.ACTIVE) check = true;
        }
      }
    }
    check = true;
    if (post.status == enums.statusPost.HIDDEN) {
      if (post.centerId) {
        if (
          post.centerId.id == decodeToken.centerId &&
          decodeToken.userId == null
        )
          check = true;
      }
      if (post.userId) {
        if (
          post.userId.id == decodeToken.userId &&
          decodeToken.centerId == null
        )
          check = true;
      }
    }
    if (check) {
      res.status(StatusCodes.OK).json({
        success: true,
        data: post
      });
    } else {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorPost.postNotFound);
    }
  } catch (error) {
    const customError = new ApiError(StatusCodes.BAD_REQUEST, error.message);
    next(customError);
  }
};

const filterPostAccountActive = async (posts) => {
  var postsRT = [];

  for (const post of posts) {
    if (post.userId) {
      const account = await accountService.findAccountById(post.userId.accountId);
      if (account && account.status === enums.statusAccount.ACTIVE) {
        postsRT.push(post);
      }
    }else{
      const account = await accountService.findAccountById(post.centerId.accountId);
      if (account && account.status === enums.statusAccount.ACTIVE) {
        postsRT.push(post);
      }
    }
  }
  return postsRT;
};

const getAllPost = async (req, res, next) => {
  try {
    //phân trang
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;

    const postsActive = await postService.findPostInfoAllActive();


    const postsActiveFilter = await filterPostAccountActive(postsActive);
    const post = await postService.findPostInfoAll(page, limit);
    const postFilter = await filterPostAccountActive(post);

    const totalPages = Math.ceil(postsActiveFilter.length / limit);
    if (!post) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorPost.postNotFound);
    }
    res.status(StatusCodes.OK).json({
      success: true,
      data: postFilter,
      totalPost: postFilter.length,
      page: `${page}/${totalPages}`
    });
  } catch (error) {
    const customError = new ApiError(StatusCodes.BAD_REQUEST, error.message);
    next(customError);
  }
};

const getAllPostPersonal = async (req, res, next) => {
  try {
    const id = req.params.id; //id user or center
    const getToken = await token.getTokenHeader(req);
    const decodeToken = verify(getToken, env.JWT_SECRET);

    const post = await postService.findAllPostPersonal(
      decodeToken?.userId ? decodeToken.userId : decodeToken.centerId,
      id
    );
    if (!post) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorPost.postNotFound);
    }
    res.status(StatusCodes.OK).json({
      success: true,
      data: post
    });
  } catch (error) {
    const customError = new ApiError(StatusCodes.BAD_REQUEST, error.message);
    next(customError);
  }
};

const getComment = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const getToken = await token.getTokenHeader(req);
    const decodeToken = verify(getToken, env.JWT_SECRET);
    const post = await postService.findPostInfoById(postId);
    if (!post) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorPost.postNotFound);
    }
    let check = false;
    if (post.status == enums.statusPost.ACTIVE) check = true;
    if (post.status == enums.statusPost.HIDDEN) {
      if (post.centerId) {
        if (
          post.centerId.id == decodeToken.centerId &&
          decodeToken.userId == null
        )
          check = true;
      }
      if (post.userId) {
        if (
          post.userId.id == decodeToken.userId &&
          decodeToken.centerId == null
        )
          check = true;
      }
    }
    if (check) {
      res.status(StatusCodes.OK).json({
        success: true,
        data: post.comments
      });
    } else {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorPost.postNotFound);
    }
  } catch (error) {
    const customError = new ApiError(StatusCodes.BAD_REQUEST, error.message);
    next(customError);
  }
};

const getReaction = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const post = await postService.findPostByIdReaction(postId);

    if (!post) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Not found post!");
    }
    res.status(StatusCodes.OK).json({
      success: true,
      status: StatusCodes.OK,
      data: post.reaction
    });
  } catch (error) {
    const customError = new ApiError(StatusCodes.BAD_REQUEST, error.message);
    next(customError);
  }
};

export const postController = {
  addPost,
  updatePost,
  deletePost,
  reactionPost,
  getPost,
  changeStatusPost,
  getAllPost,
  getComment,
  getReaction,
  getAllPostPersonal
};
