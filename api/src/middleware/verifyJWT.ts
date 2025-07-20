import jwt from "jsonwebtoken";
import "dotenv/config";
import { NextFunction, Request, Response } from "express";

export const verifyJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies?.accessToken;
  jwt.verify(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET!,
    async (err, payload) => {
      if (err) { // If the token is not provided or is invalid default to a normal user 
        req.username = null;
        req.userId = null;
        req.isAdmin = false;
        return next();
      }
      req.username = payload.username;
      req.userId = payload.id;
      req.isAdmin = payload.isAdmin;
      next();
    }
  );
};
