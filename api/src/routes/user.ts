import { Request, Response, Router } from "express";
import { getUserById } from "../db/queries/user";
import { verifyJWT } from "../middleware/verifyJWT";

const router = Router();

router.get("/me",verifyJWT,  async (req: Request, res: Response) => {
  try {
    if (!req.userId) return res.json({});
    const result = await getUserById(req.userId);
    return res.json(result);
  } catch (e) {
    return res.sendStatus(500);
  }
});

export default router;
