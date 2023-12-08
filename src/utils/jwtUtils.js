import jwt from 'jsonwebtoken';
import { env } from "../config/environment.js";
const generateAuthToken = async function ({account, userId, centerId}) {
  const token = await jwt.sign(
    {
      id: account.id,
      email: account.email,
      role: account.role,
      status: account.status,
      userId: userId,
      centerId: centerId,
      access: true
    },
    env.JWT_SECRET,
    { expiresIn: "1d" }
  );
  return token;
};
const generateRefreshToken = async function ({account, userId, centerId}) {
  const token = await jwt.sign(
    {
      id: account.id,
      email: account.email,
      role: account.role,
      status: account.status,
      userId: userId,
      centerId: centerId,
      access: false
    },
    env.JWT_SECRET,
    { expiresIn: "7d" }
  );
  return token;
};
export const jwtUtils = {
  generateAuthToken,
  generateRefreshToken
};
