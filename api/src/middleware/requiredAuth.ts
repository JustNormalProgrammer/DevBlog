import jwt from "jsonwebtoken";
import "dotenv/config";
import { NextFunction, Request, Response } from "express";
import { getUserById } from "../db/queries/user";

export const requiredAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(req);
  const accessToken = req.cookies?.accessToken;
  if (!accessToken) {
    return res.sendStatus(401);
  }
  jwt.verify(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET!,
    async (err, payload) => {
      if (err) {
        console.log(err);
        return res.sendStatus(403);
      }
      const user = await getUserById(payload.id);
      if (!user) return res.status(404);
      req.username = user.username;
      req.userId = user.id;
      req.isAdmin = user.isAdmin;
      next();
    }
  );
};
