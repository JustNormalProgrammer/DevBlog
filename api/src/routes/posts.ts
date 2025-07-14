import { Router } from "express";

const router = Router();

router.get('/posts', (req, res) => {
    return res.send("hello")
});

export default router;