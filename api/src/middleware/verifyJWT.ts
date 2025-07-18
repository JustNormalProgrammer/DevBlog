import jwt from "jsonwebtoken";
import "dotenv/config";
import { NextFunction, Request, Response } from "express";
import { getUserById } from "../db/queries/user";
export const verifyJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies?.accessToken;
  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!, async (err, payload) => {
    if (err) {
      req.username = null;
      req.userId = null;
      req.isAdmin = false;
      return next();
    }
    const user = await getUserById(payload.id);
    if(!user) return res.status(404);
    req.username = user.username;
    req.userId = user.id;
    req.isAdmin = user.isAdmin;
    next();
  });
};
