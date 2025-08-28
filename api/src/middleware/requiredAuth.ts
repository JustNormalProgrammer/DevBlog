import jwt from "jsonwebtoken";
import "dotenv/config";
import { NextFunction, Request, Response } from "express";
import { getRevokedToken } from "../db/queries/revokedTokens";
import { MyToken } from "../types";

export const requiredAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers?.authorization;
  if (!authHeader) {
    return res.sendStatus(401);
  }
  const accessToken = authHeader.split(" ")[1];
  try {
    if (await getRevokedToken(accessToken))
      return res.status(401).json({
        message: "Access token invalid",
        code: "AccessTokenInvalid",
      });

    const decodedAccessToken = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET!
    ) as MyToken;
    req.username = decodedAccessToken.username;
    req.userId = decodedAccessToken.id;
    req.isAdmin = decodedAccessToken.isAdmin;
    req.accessToken = { value: accessToken, exp: decodedAccessToken.exp };
    next();
  } catch (e) {
    if (e instanceof jwt.TokenExpiredError) {
      console.log(e);
      return res.status(401).json({
        message: "Access token expired",
        code: "AccessTokenExpired",
      });
    } else if (e instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        message: "Access token invalid",
        code: "AccessTokenInvalid",
      });
    }
    return res.sendStatus(500);
  }
};
