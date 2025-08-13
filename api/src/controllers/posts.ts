import { Request, Response } from "express";
import * as postsDB from "../db/queries/posts";
import { CreateComment, CreatePost, UpdatePost } from "../types";
import { matchedData, validationResult } from "express-validator";

interface Query {
  query?: string;
  page?: number;
}

const ITEMS_ON_PAGE = 10;
// show only public posts
export async function getPosts(req: Request<{}, {}, {}, Query>, res: Response) {
  const query = req.query?.query || "";
  const currentPage = Number(req.query.page) || 1;
  try {
    const posts = await postsDB.getPosts(query, currentPage, ITEMS_ON_PAGE);
    return res.json(posts);
  } catch (e) {
    res.sendStatus(500);
  }
}
export async function getHiddenPosts(
  req: Request<{}, {}, {}, Query>,
  res: Response
) {
  const query = req.query?.query || "";
  const currentPage = Number(req.query.page) || 1;
  try {
    const posts = await postsDB.getPosts(
      query,
      currentPage,
      ITEMS_ON_PAGE,
      false
    );
    return res.json(posts);
  } catch (e) {
    res.sendStatus(500);
  }
}
export async function getPostsPages(
  req: Request<{}, {}, {}, Query>,
  res: Response
) {
  const query = req.query?.query || "";
  try {
    const pages = await postsDB.getPostsPages(query, ITEMS_ON_PAGE);
    return res.json({ pages });
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
}
export async function getHiddenPostsPages(
  req: Request<{}, {}, {}, Query>,
  res: Response
) {
  const query = req.query?.query || "";
  try {
    const pages = await postsDB.getPostsPages(query, ITEMS_ON_PAGE, false);
    return res.json({ pages });
  } catch (e) {
    res.sendStatus(500);
  }
}
export async function getPostComments(
  req: Request<{ postId: string }>,
  res: Response
) {
  const { postId } = req.params;
  if (!postId) return res.sendStatus(400);
  try {
    const post = await postsDB.getPostById(postId);
    if (!post) return res.sendStatus(404);
    const comments = await postsDB.getPostComments(postId);
    res.json(comments);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
}
export async function createPost(
  req: Request<{}, {}, Omit<CreatePost, "userId">>,
  res: Response
) {
  const userId = req.userId!;
  const valResult = validationResult(req);
  if (!valResult.isEmpty()) {
    return res
      .status(400)
      .json({ error: valResult.array({ onlyFirstError: true }) });
  }
  try {
    const { title, content, isPublic } = matchedData(req);
    const result = await postsDB.createPost({
      title,
      content,
      isPublic,
      userId,
    });
    res.json(result);
  } catch (e) {
    res.sendStatus(500);
  }
}
// no idea if undefined will work in drizzle
export async function createComment(
  req: Request<{ postId: string }, {}, Omit<CreateComment, "userId">>,
  res: Response
) {
  const { anonymousAuthorName } = req.body;
  const { postId } = req.params;
  const userId = req.userId;
  if (!postId || !(userId || anonymousAuthorName)) return res.sendStatus(400);
  const valResult = validationResult(req);
  if (!valResult.isEmpty()) {
    return res
      .status(400)
      .json({ error: valResult.array({ onlyFirstError: true }) });
  }
  try {
    const { content, anonymousAuthorName } = matchedData(req);
    const result = await postsDB.createComment({
      userId,
      postId,
      content,
      ...{ anonymousAuthorName: userId ? null : anonymousAuthorName },
    });
    return res.json(result);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
}

export async function updatePost(
  req: Request<{ postId: string }, {}, UpdatePost>,
  res: Response
) {
  const { postId } = req.params;
  if (!postId) return res.sendStatus(400);
  const valResult = validationResult(req);
  if (!valResult.isEmpty()) {
    return res
      .status(400)
      .json({ error: valResult.array({ onlyFirstError: true }) });
  }
  try {
    const { title, content, isPublic } = matchedData(req);
    const foundPost = await postsDB.getPostById(postId);
    if (!foundPost) return res.sendStatus(404);
    if (foundPost.userId !== req.userId) return res.sendStatus(403);
    const result = await postsDB.updatePostById(postId, {
      title,
      content,
      isPublic,
    });
    return res.json(result);
  } catch (e) {
    res.sendStatus(500);
  }
}
export async function getPostById(
  req: Request<{ postId: string }>,
  res: Response
) {
  const { postId } = req.params;
  if (!postId) return res.sendStatus(400);
  const valResult = validationResult(req);
  if (!valResult.isEmpty()) {
    return res
      .status(404)
      .json({ error: valResult.array({ onlyFirstError: true }) });
  }
  try {
    const foundPost = await postsDB.getPostById(postId);
    if (!foundPost) return res.sendStatus(404);
    return res.json(foundPost);
  } catch (e) {
    res.sendStatus(500);
  }
}
export async function getHiddenPostById(
  req: Request<{ postId: string }>,
  res: Response
) {
  const { postId } = req.params;
  if (!postId) return res.sendStatus(400);
  const valResult = validationResult(req);
  if (!valResult.isEmpty()) {
    return res
      .status(404)
      .json({ error: valResult.array({ onlyFirstError: true }) });
  }
  try {
    const foundPost = await postsDB.getHiddenPostById(postId);
    if (!foundPost) return res.sendStatus(404);
    return res.json(foundPost);
  } catch (e) {
    res.sendStatus(500);
  }
}
export async function deleteComment(
  req: Request<{ commentId: string }>,
  res: Response
) {
  const { commentId } = req.params;
  if (!commentId) return res.sendStatus(400);
  try {
    postsDB.deleteComment(commentId);
    return res.sendStatus(200);
  } catch (e) {
    res.sendStatus(500);
  }
}
export async function deletePost(
  req: Request<{ postId: string }>,
  res: Response
) {
  const { postId } = req.params;
  if (!postId) return res.sendStatus(400);
  try {
    postsDB.deletePost(postId);
    return res.sendStatus(200);
  } catch (e) {
    res.sendStatus(500);
  }
}

