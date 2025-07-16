import { Request, Response } from "express";
import * as postsDB from "../db/queries/posts";
import { CreateComment, CreatePost } from "../db/types";

interface Query {
  query?: string;
  page?: number;
}
// show all posts if user isAdmin
export async function getPosts(req: Request<{}, {}, {}, Query>, res: Response) {
  const query = req.query?.query || "";
  const currentPage = Number(req.query.page) || 1;
  try {
    const posts = await postsDB.getPosts(query, currentPage, req.isAdmin);
    return res.json(posts);
  } catch (e) {
    res.sendStatus(500);
  }
}
export async function getPostComments(
  req: Request<
    { postId: string },
    {},
    { user: string; userId: string; isAdmin: boolean },
    Query
  >,
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
    res.sendStatus(500);
  }
}
export async function createPost(
  req: Request<{}, {}, CreatePost>,
  res: Response
) {
  const { title, content, isPublic, userId } = req.body;
  if (!title || !content || !isPublic || !userId) return res.sendStatus(400);
  try {
    const result = await postsDB.createPost({title, content, isPublic, userId});
    res.json(result);
  } catch (e) {
    res.sendStatus(500);
  }
}
// no idea if undefined will work in drizzle
export async function createComment(req: Request<{}, {}, CreateComment>, res: Response){
    const { userId, postId, content, anonymousAuthorName} = req.body;
    if(!postId || !content || !(userId || anonymousAuthorName)) return res.sendStatus(400);
    try{
        const result = await postsDB.createComment({userId, postId, content, anonymousAuthorName})
        return res.json(result);
    } catch(e){
        res.sendStatus(500);
    }
}
