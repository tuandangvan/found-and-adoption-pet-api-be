import { StatusCodes } from "http-status-codes";
import { postService } from "../services/postService";
import ErorrPost from "../messageError/errorPost";
import { token } from "../utils/token";
import { reportService } from "../services/reportService";
import ApiError from "../utils/ApiError";
import { verify } from "jsonwebtoken";
import { env } from "../config/environment";
import { notifyService } from "../services/notifyService";
import { userService } from "../services/userService";
import { accountService } from "../services/accountService";

const reportPost = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const reason = req.body.reason;
    const title = req.body.title;
    const commentId = req.body.commentId || null;

    const reportFind = await reportService.findReportByPostIdDestinate(
      postId,
      commentId
    );
    const getToken = await token.getTokenHeader(req);
    const decoded = verify(getToken, env.JWT_SECRET);
    var reporter;

    if (decoded.role == "USER") {
      reporter = { userId: decoded.userId, centerId: null, reason: reason };
    } else {
      reporter = { userId: null, centerId: decoded.centerId, reason: reason };
    }

    const post = await postService.findPostById(postId);
    if (!post) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: true,
        message: ErorrPost.postNotFound
      });
    }

    if (reportFind) {
      const addReport = await reportService.addReport(reportFind._id, reporter);
      if (!addReport) {
        res.status(StatusCodes.NOT_FOUND).json({
          success: true,
          message: ErorrPost.postNotFound
        });
      }
    } else {
      const report = await reportService.reportPost({
        reporter: reporter,
        title: title,
        idDestinate: postId,
        commentId: commentId
      });
    }

    const accAD = await accountService.findAD();
    var receivers = [];

    await Promise.all(
      accAD.map(async (acc) => {
        const user = await userService.findUserByAccountId(acc.id);
        receivers.push({
          userId: user.userId,
          centerId: null
        });
      })
    );

    var name;
    var avatar;
    if (decoded.role == "USER") {
      const user = await userService.findUserById(decoded.userId);
      name = user.lastName;
      avatar = user.avartar;
    } else {
      const center = await userService.findCenterById(decoded.centerId);
      name = center.name;
      avatar = center.avartar;
    }

    const notify = await notifyService.createNotify({
      title: "Report",
      receiver: receivers,
      name: name,
      avartar: avatar,
      content: "Report post",
      idDestinate: postId,
      allowView: true
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Report success!"
    });
  } catch (error) {
    const customError = new ApiError(StatusCodes.BAD_REQUEST, error.message);
    next(customError);
  }
};

export const reportController = {
  reportPost
};
