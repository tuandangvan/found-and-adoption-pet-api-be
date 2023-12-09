import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/ApiError";

const createNotify = async (req, res, next) => {
  try {
    
  } catch (error) {
    const customError = new ApiError(StatusCodes.UNAUTHORIZED, error.message);
    next(customError);
  }
};

export const notifyController = {
  createNotify
};
