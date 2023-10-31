import { StatusCodes } from "http-status-codes";
import { verify } from "jsonwebtoken";
import { env } from "~/config/environment";
import ErrorCenter from "~/messageError/errorCenter";
import ErrorPet from "~/messageError/errorPet";
import { centerService } from "~/services/centerService";
import { petService } from "~/services/petService";
import ApiError from "~/utils/ApiError";
import { token } from "~/utils/token";

const createPet = async (req, res, next) => {
  try {
    //validate
    const result = validate.petValidate(req.body);
    if(result.error){
      res.status(400).send({error: result.error.details[0].message});
      return;
    }
    const getToken = await token.getTokenHeader(req);
    const account = verify(getToken, env.JWT_SECRET);

    const newPet = await petService.createPet({data: req.body, centerId: account.centerId});
    const centerUpdate = await centerService.addPetForCenter({
      centerId: account.centerId,
      petId: newPet.id
    });
    if (newPet) {
      res.status(StatusCodes.CREATED).json({
        success: true,
        message: "Pet added successfully!",
        pet: newPet,
        center: centerUpdate
      });
    } else {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
        success: false,
        message: "Pets cannot be added!"
      });
    }
  } catch (error) {
    const customError = new ApiError(
      StatusCodes.UNPROCESSABLE_ENTITY,
      error.message
    );
    next(customError);
  }
};

const updatePet = async (req, res, next) => {
  try {
    const pet = await petService.findPetById(req.params.petId);
    if (!pet) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorPet.petNotFound);
    }
    const getToken = await token.getTokenHeader(req);
    const decodeToken = verify(getToken, env.JWT_SECRET);
    const center = await centerService.findCenterById(decodeToken.centerId);
    if (!center) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCenter.centerNotExist);
    }
    const pets = await petService.updatePet({
      data: req.body,
      petId: pet.id
    });
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Pets have been updated successfully!"
    });
  } catch (error) {
    const customError = new ApiError(StatusCodes.BAD_REQUEST, error.message);
    next(customError);
  }
};

const deletePet = async (req, res, next) => {
  try {
    const petId = req.params.petId;
    const pet = await petService.findPetById(petId);
    if (!pet) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorPet.petNotFound);
    }
    const getToken = await token.getTokenHeader(req);
    const decodeToken = verify(getToken, env.JWT_SECRET);
    const center = await centerService.findCenterById(decodeToken.centerId);
    if (!center) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCenter.centerNotExist);
    }
    await petService.deletePet(petId);
    await centerService.deletePetForCenter({centerId: decodeToken.centerId, petId: petId});

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Pets have been deleted successfully!"
    });
  } catch (error) {
    const customError = new ApiError(StatusCodes.BAD_REQUEST, error.message);
    next(customError);
  }
};

const getAllPetOfCenter = async (req, res, next) => {
  try {
    const getToken = await token.getTokenHeader(req);
    const decodeToken = verify(getToken, env.JWT_SECRET);
    const pets = await petService.findAllOfCenter(decodeToken.centerId);
    res.status(StatusCodes.OK).json({
      success: true,
      data: pets
    });
  } catch (error) {
    const customError = new ApiError(StatusCodes.BAD_REQUEST, error.message);
    next(customError);
  }
};

const getAllPetOfCenterPermission = async (req, res, next) => {
  try {
    const pets = await petService.findAllOfCenter(req.params.centerId);
    res.status(StatusCodes.OK).json({
      success: true,
      data: pets
    });
  } catch (error) {
    const customError = new ApiError(StatusCodes.BAD_REQUEST, error.message);
    next(customError);
  }
};

export const petController = {
  createPet,
  getAllPetOfCenter,
  updatePet,
  deletePet,
  getAllPetOfCenterPermission
};
