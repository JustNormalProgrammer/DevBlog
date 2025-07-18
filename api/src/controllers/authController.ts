import "dotenv/config";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { getUserByUsername, createUser } from "../db/queries/user";
import jwt from "jsonwebtoken";
import { matchedData, validationResult } from "express-validator";

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
    console.log(password, foundUser.password);
    const match = await bcrypt.compare(password, foundUser.password);
    if (match) {
      const accessToken = jwt.sign(
        {
          id: foundUser.id,
          username: foundUser.username,
          isAdmin: foundUser.isAdmin,
        },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: "10s" }
      );
      const refreshToken = jwt.sign(
        {
          id: foundUser.id,
          username: foundUser.username,
          isAdmin: foundUser.isAdmin,
        },
        process.env.REFRESH_TOKEN_SECRET!,
        { expiresIn: "1d" }
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
      return res.json({ token: accessToken });
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
      isAdmin: result.isAdmin
    });
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
};
export const handleRefreshToken = (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if(!refreshToken) return res.sendStatus(401);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!, (err, payload) => {
    if(err) return res.sendStatus(403);
    const accessToken = jwt.sign(
      {
        id: payload.id,
        username: payload.username,
        isAdmin: payload.isAdmin,
      },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "20s" }
    );
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
    });
    return res.json(accessToken);
  })
}