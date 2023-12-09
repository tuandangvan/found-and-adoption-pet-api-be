import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/ApiError";
import { notifyService } from "../services/notifyService";
import { token } from "../utils/token";
import { verify } from "jsonwebtoken";
import { env } from "../config/environment";

const createNotify = async (req, res, next) => {
  try {
  } catch (error) {
    const customError = new ApiError(StatusCodes.UNAUTHORIZED, error.message);
    next(customError);
  }
};

const find20Notify = async (req, res, next) => {
  try {
    const getToken = await token.getTokenHeader(req);
    const decodeToken = verify(getToken, env.JWT_SECRET);
    const notifies = await notifyService.find20Notify(
      decodeToken.userId,
      decodeToken.centerId
    );

    res.status(StatusCodes.OK).json({
      success: true,
      data: notifies
    });
  } catch (error) {
    const customError = new ApiError(StatusCodes.UNAUTHORIZED, error.message);
    next(customError);
  }
};
export const notifyController = {
  createNotify,
  find20Notify
};
