import { Request, Response, Router } from "express";
import { getUserById } from "../db/queries/user";
import { requiredAuth } from "../middleware/requiredAuth";


const router = Router();

router.get("/me",requiredAuth,  async (req: Request, res: Response) => {
  try {
    if (!req.userId) return res.json({});
    const result = await getUserById(req.userId);
    return res.json({
      id: result.id, 
      username: result.username, 
      isAdmin: result.isAdmin
    });
  } catch (e) {
    return res.sendStatus(500);
  }
});

export default router;
