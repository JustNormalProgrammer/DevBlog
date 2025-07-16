import jwt, { JwtPayload } from "jsonwebtoken";
import "dotenv/config";
import { NextFunction, Request, Response } from "express";

export const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
  console.log(req.cookies);
  const accessToken = req.cookies?.accessToken;
  if (!accessToken) {
    return res.sendStatus(401);
  }
  console.log(process.env.ACCESS_TOKEN_SECRET)
  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!, (err, payload) => {
    if (err) {
      console.log(err);
      return res.sendStatus(403)
    };
    req.username = (payload as JwtPayload).username;
    req.userId = (payload as JwtPayload).id;
    req.isAdmin = (payload as JwtPayload).isAdmin;
    next();
  });
};
