import { StatusCodes } from "http-status-codes";
import ApiError from "~/utils/ApiError";

const uploadSingle = async (req, res, next) => {
  try {
    if (req.file) {
      res.status(StatusCodes.OK).json({
        message: "Image loaded successfully!",
        url: req.file.path
      });
    } else {
      res.status(StatusCodes.REQUEST_TIMEOUT).json({
        error: "Can not upload photos!"
      });
    }
  } catch (error) {
    next(new ApiError(StatusCodes.REQUEST_TIMEOUT, error.message));
  }
};

const uploadMulti = async (req, res, next) => {
    try {
        console.log(req.files)
      if (req.files) {
        const images = req.files.map(item => ({url: item.path}))

        res.status(StatusCodes.OK).json({
          message: "Images loaded successfully!",
          images: images
        });
      } else {
        res.status(StatusCodes.REQUEST_TIMEOUT).json({
          error: "Can not upload photos!"
        });
      }
    } catch (error) {
      next(new ApiError(StatusCodes.REQUEST_TIMEOUT, error.message));
    }
  };
export const uploadController = {
  uploadSingle,
  uploadMulti
};