import "dotenv/config";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { getUserByUsername, createUser } from "../db/queries/user";
import jwt from "jsonwebtoken";
import { matchedData, validationResult } from "express-validator";
import type { StringValue } from "ms";
import {
  getUserRefreshToken,
  RemoveRefreshToken,
  upsertRefreshToken,
} from "../db/queries/refreshTokens";
import { createRevokedToken } from "../db/queries/revokedTokens";

export const handleLogin = async (req: Request, res: Response) => {
  const valResult = validationResult(req);
  if (!valResult.isEmpty()) {
    return res
      .status(400)
      .json({ error: valResult.array({ onlyFirstError: true }) });
  }
  try {
    const { username, password } = matchedData(req);
    const foundUser = await getUserByUsername(username);
    if (!foundUser) return res.sendStatus(401);
    const match = await bcrypt.compare(password, foundUser.password);
    if (match) {
      const accessToken = jwt.sign(
        {
          id: foundUser.id,
          username: foundUser.username,
          isAdmin: foundUser.isAdmin,
        },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION! as StringValue }
      );
      const refreshToken = jwt.sign(
        {
          id: foundUser.id,
          username: foundUser.username,
          isAdmin: foundUser.isAdmin,
        },
        process.env.REFRESH_TOKEN_SECRET!,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION! as StringValue }
      );
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        maxAge: 60 * 60 * 1000,
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "strict",
      });
      await upsertRefreshToken(foundUser.id, refreshToken);
      return res.json({
        id: foundUser.id,
        username: foundUser.username,
        isAdmin: foundUser.isAdmin,
        token: accessToken,
        refreshToken,
      });
    } else {
      return res.sendStatus(401);
    }
  } catch (e) {
    console.log(e);
    return res.sendStatus(500);
  }
};
export const handleRegister = async (req: Request, res: Response) => {
  const valResult = validationResult(req);
  if (!valResult.isEmpty()) {
    return res
      .status(400)
      .json({ error: valResult.array({ onlyFirstError: true }) });
  }
  try {
    const { username, password, adminVerificationPwd } = matchedData(req);
    const passwordHash = bcrypt.hashSync(password);
    const duplicate = await getUserByUsername(username);
    if (duplicate)
      return res.status(400).json({ error: "Username is already in use" });
    let isAdmin = false;
    if (adminVerificationPwd) {
      isAdmin = adminVerificationPwd === process.env.ADMIN_PASSWORD;
      if (!isAdmin)
        return res
          .status(400)
          .json({ error: "Admin verification password is not valid" });
    }
    const result = await createUser(username, passwordHash, isAdmin);
    return res.status(201).json({
      id: result.id,
      username: result.username,
      isAdmin: result.isAdmin,
    });
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
};
export const handleRefreshToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) return res.sendStatus(401);
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET!,
    async (err, payload) => {
      console.log(err);
      if (err) return res.sendStatus(401);
      const user = await getUserRefreshToken(payload.id, refreshToken);
      if (!user) return res.sendStatus(401);

      const accessToken = jwt.sign(
        {
          id: payload.id,
          username: payload.username,
          isAdmin: payload.isAdmin,
        },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION! as StringValue }
      );
      const newRefreshToken = jwt.sign(
        {
          id: payload.id,
          username: payload.username,
          isAdmin: payload.isAdmin,
        },
        process.env.REFRESH_TOKEN_SECRET!,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION! as StringValue }
      );
      await upsertRefreshToken(payload.id, newRefreshToken);
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        maxAge: 60 * 60 * 1000,
      });
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "strict",
      });
      return res.json({ accessToken, refreshToken: newRefreshToken });
    }
  );
};
export const handleLogout = async (req: Request, res: Response) => {
  try{
    await RemoveRefreshToken(req.userId!);
    await createRevokedToken({
      revokedToken: req.accessToken.value, 
      userId: req.userId!, 
      exp: req.accessToken.exp,
    })
    return res.sendStatus(204);
  } catch(e){
    return res.sendStatus(500);
  }
}
