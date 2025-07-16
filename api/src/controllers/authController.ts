import "dotenv/config";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { getUserByUsername, createUser } from "../db/queries/user";
import jwt from "jsonwebtoken";
export const handleLogin = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  try {
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
        { expiresIn: "15m" }
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
  const { username, password, adminVerificationPwd } = req.body;
  if (!username || !password)
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  const passwordHash = bcrypt.hashSync(password);
  try {
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
    return res.status(201).json(result);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
};
