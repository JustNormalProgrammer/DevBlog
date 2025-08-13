import { Router } from "express";
import { verifyJWT } from "../middleware/verifyJWT";
import { requiredAuth } from "../middleware/requiredAuth";
import * as postController from "../controllers/posts";
import { body, param } from "express-validator";
import { isAdmin } from "../middleware/isAdmin";
import { getPostByTitle } from "../db/queries/posts";

const validatePostCreation = [
  body("title")
    .trim()
    .isLength({ min: 1, max: 256 })
    .withMessage("Title cannot be empty"),
  body("content")
    .trim()
    .isLength({ min: 1, max: 1_000_000 })
    .withMessage("Content cannot be empty or exceed 1 000 000 characters"),
  body("isPublic").isBoolean().withMessage("isPublic must be a boolean value"),
];
const validatePostUpdate = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 1, max: 256 })
    .withMessage("Title cannot be empty"),
  body("content")
    .optional()
    .trim()
    .isLength({ min: 1, max: 1_000_000 })
    .withMessage("Content cannot be empty or exceed 1 000 000 characters"),
  body("isPublic")
    .optional()
    .isBoolean()
    .withMessage("isPublic must be a boolean value"),
];
const validateCommentCreation = [
  body("content")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Content cannot be empty or exceed 1000 characters"),
  body("anonymousAuthorName")
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage("Username cannot be empty or exceed 30 characters"),
];
const validateGetPostParamId = [
  param('postId').isUUID()
]

const router = Router();

router.get("/", postController.getPosts);
router.get("/hidden", requiredAuth, isAdmin, postController.getHiddenPosts);
router.get("/pages", postController.getPostsPages);
router.get(
  "/pages/hidden",
  requiredAuth,
  isAdmin,
  postController.getHiddenPostsPages
);
router.get("/:postId", validateGetPostParamId, postController.getPostById);
router.get("/:postId/hidden", requiredAuth, validateGetPostParamId, postController.getHiddenPostById);
router.post(
  "/",
  requiredAuth,
  validatePostCreation,
  body("title").custom(async (value) => {
      const duplicate = await getPostByTitle(value);
      if (duplicate) throw new Error("Post with that title already exists");
    }),
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
router.delete('/:postId/comments/:commentId', requiredAuth, postController.deleteComment)
router.delete('/:postId', requiredAuth, postController.deletePost)

export default router;
