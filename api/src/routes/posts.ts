import { Router } from "express";
import { verifyJWT } from "../middleware/verifyJWT";
import * as postController from '../controllers/posts';

const router = Router();

router.get("/", verifyJWT, postController.getPosts);
router.post('/', postController.createPost);
router.get('/:postId/comments', postController.getPostComments);

export default router;
