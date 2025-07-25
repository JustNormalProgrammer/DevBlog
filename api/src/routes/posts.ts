import { Router } from "express";
import { verifyJWT } from "../middleware/verifyJWT";
import { requiredAuth } from "../middleware/requiredAuth";
import * as postController from "../controllers/posts";
import { body } from "express-validator";
import { isAdmin } from "../middleware/isAdmin";

const validatePostCreation = [
  body("title")
    .trim()
    .isLength({ min: 1, max: 256 })
    .withMessage("Title cannot be empty")
    .escape(),
  body("content")
    .trim()
    .isLength({ min: 1, max: 10_000 })
    .withMessage("Content cannot be empty or exceed 10000 characters")
    .escape(),
  body("isPublic").isBoolean().withMessage("isPublic must be a boolean value"),
];
const validatePostUpdate = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 1, max: 256 })
    .withMessage("Title cannot be empty")
    .escape(),
  body("content")
    .optional()
    .trim()
    .isLength({ min: 1, max: 10_000 })
    .withMessage("Content cannot be empty or exceed 10000 characters")
    .escape(),
  body("isPublic")
    .optional()
    .isBoolean()
    .withMessage("isPublic must be a boolean value"),
];
const validateCommentCreation = [
  body("content")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Content cannot be empty or exceed 1000 characters")
    .escape(),
  body("anonymousAuthorName")
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage("Username cannot be empty or exceed 30 characters")
    .escape(),
];

const router = Router();

router.get("/", verifyJWT, postController.getPosts);
router.get("/pages", verifyJWT, postController.getPostsPages); // For now
router.get("/:postId", postController.getPostById);
router.post(
  "/",
  requiredAuth,
  validatePostCreation,
  isAdmin,
  postController.createPost
);
router.put(
  "/:postId",
  requiredAuth,
  validatePostUpdate,
  isAdmin,
  postController.updatePost
);
router.post(
  "/:postId/comments",
  verifyJWT,
  validateCommentCreation,
  postController.createComment
);
router.get("/:postId/comments", postController.getPostComments);

export default router;
