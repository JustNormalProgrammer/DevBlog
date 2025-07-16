import { NextFunction, Request, Response } from "express";

export const isAdmin =  (req: Request, res: Response, next: NextFunction) => {
    if(!req.isAdmin) return res.sendStatus(403);
    next();
}