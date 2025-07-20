import jwt, { JwtPayload } from "jsonwebtoken";
import "dotenv/config";
import { NextFunction, Request, Response } from "express";
import { getRevokedToken } from "../db/queries/revokedTokens";

export const requiredAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies?.accessToken;
  if (!accessToken) {
    return res.sendStatus(401);
  }
  if (await getRevokedToken(accessToken))
    return res.status(401).json({
      message: "Access token invalid",
      code: "AccessTokenInvalid",
    });
  jwt.verify(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET!,
    async (err, payload) => {
      if (err instanceof jwt.TokenExpiredError) {
        console.log(err);
        return res.status(401).json({
          message: "Access token expired",
          code: "AccessTokenExpired",
        });
      } else if (err instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({
          message: "Access token invalid",
          code: "AccessTokenInvalid",
        });
      }
      req.username = payload.username;
      req.userId = payload.id;
      req.isAdmin = payload.isAdmin;
      req.accessToken = { value: accessToken, exp: payload.exp };
      next();
    }
  );
};
