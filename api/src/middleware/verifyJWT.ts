import jwt from "jsonwebtoken";
import "dotenv/config";
import { NextFunction, Request, Response } from "express";
import { MyToken } from "../types";

export const verifyJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers?.authorization;
  console.log("verfiy JWT: ", authHeader);
  try {
    const accessToken = authHeader?.split(' ')[1];
    if (!authHeader || !accessToken) {
      throw new Error("No access token"); // defaulting to a normal user
    }
    const decoded = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET!
    ) as MyToken;
    req.username = decoded.username;
    req.userId = decoded.id;
    req.isAdmin = decoded.isAdmin;
    next();
  } catch (e) {
    req.username = null;
    req.userId = null;
    req.isAdmin = false;
    return next();
  }
};
