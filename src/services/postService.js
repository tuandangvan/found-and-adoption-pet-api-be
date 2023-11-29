import mongoose from "mongoose";
import { enums } from "../enums/enums.js";
import Post from "../models/postModel.js";

const createPost = async function ({ data, userId, centerId }) {
  const post = new Post({
    _id: new mongoose.Types.ObjectId(),
    userId: userId,
    centerId: centerId,
    ...data
  });
  return post.save();
};

const updatePost = async function ({ postId, data }) {
  const updatePost = await Post.updateOne(
    { _id: postId },
    { $set: { ...data } }
  );
  return updatePost;
};

const updateStatusPost = async function ({ post, newStatus }) {
  const postNew = await Post.updateOne({ _id: post.id }, {$set: { status: newStatus }});
  return postNew;
};

const deletePostDB = async function (postId) {
  const postDel = await Post.deleteOne({ _id: postId });
  return postDel;
};

const findPostById = async function (postId) {
  const post = await Post.findOne({ _id: postId }).populate("reaction.userId").populate("reaction.centerId");
  return post;
};

const findPostInfoById = async function (postId) {
  const post = await Post.findOne({ _id: postId })
    .populate("userId")
    .populate("centerId")
    .populate("userId.accountId")
    .populate("centerId.accountId")
    .populate("reaction.userId")
    .populate("reaction.centerId")
    .populate("comments.userId")
    .populate("comments.centerId");
  return post;
};

const findPostInfoAll= async function () {
  const post = await Post.find({status: enums.statusPost.ACTIVE})
    .populate("userId")
    .populate("centerId")
    .populate("userId.accountId")
    .populate("centerId.accountId")
    .populate("reaction.userId")
    .populate("reaction.centerId")
    .populate("comments.userId")
    .populate("comments.centerId");
  return post;
};

const createComment = async function ({ comment, postId, userId, centerId }) {
  const newComment = {
    _id: new mongoose.Types.ObjectId(),
    commentId: comment.commentId,
    content: comment.content,
    userId: userId,
    centerId: centerId,
    createdAt: Date.now()
  };
  const commentOut = await Post.updateOne(
    { _id: postId },
    { $push: { comments: newComment } }
  );
  return newComment;
};

const updateCommentByCommentId = async function ({
  comment,
  commentId,
  postId
}) {
  const commentOut = await Post.updateOne(
    { _id: postId, "comments._id": commentId },
    { $set: { "comments.$.content": comment.content } }
  );
  return commentOut;
};

const deleteComment = async function ({ post, commentId }) {
  const index = post.comments.findIndex((element) => element._id == commentId);
  if (index >= 0) {
    // const commentNeedDel = post.comments[index];
    const postDelete = await Post.updateOne(
      { _id: post.id },
      { $pull: { comments: { _id: commentId } } }
    );
    //hoặc
    // const postDelete = await Post.updateOne(
    //   { _id: post.id },
    //   { $pull: { comments: commentNeedDel } }
    // );
    return postDelete;
  }
  return null;
};

const reaction = async function ({ post, userId, centerId }) {
  let reaction;
  //count reaction
  let count = post.reaction.length;
  let index = null;

  if (userId != null) {
    if (post.reaction.length > 0)
      index = post.reaction.findIndex((element) => element.userId == userId);
    if (index != null && index != -1) {
      if (post.reaction[index].userId == userId) {
        //xóa nếu tồn tại
        reaction = await Post.updateOne(
          { _id: post.id },
          { $pull: { reaction: { _id: post.reaction[index]._id } } }
        );
        count -= 1;
      }
    } else {
      const newReaction = {
        _id: new mongoose.Types.ObjectId(),
        userId: userId,
        centerId: centerId
      };
      //thêm nếu chưa tồn tại
      reaction = await Post.updateOne(
        { _id: post.id },
        { $push: { reaction: newReaction } }
      );
      count += 1;
    }
  }
  else{
    if (post.reaction.length > 0)
      index = post.reaction.findIndex((element) => element.centerId == centerId);
    if (index != null && index != -1) {
      if (post.reaction[index].centerId == centerId) {
        //xóa nếu tồn tại
        reaction = await Post.updateOne(
          { _id: post.id },
          { $pull: { reaction: { _id: post.reaction[index]._id } } }
        );
        count -= 1;
      }
    } else {
      const newReaction = {
        _id: new mongoose.Types.ObjectId(),
        userId: userId,
        centerId: centerId
      };
      //thêm nếu chưa tồn tại
      reaction = await Post.updateOne(
        { _id: post.id },
        { $push: { reaction: newReaction } }
      );
      count += 1;
    }
  }
  //   console.log(count);
  return reaction;
};

export const postService = {
  createPost,
  updatePost,
  deletePostDB,
  updateStatusPost,
  findPostById,
  findPostInfoById,
  createComment,
  updateCommentByCommentId,
  reaction,
  deleteComment,
  findPostInfoAll
};
