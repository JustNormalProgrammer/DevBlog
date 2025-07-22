import {
  count,
  eq,
  ilike,
  and,
  desc,
  getTableColumns,
  sql,
  or,
} from "drizzle-orm";
import { db } from "../index";
import { comments, posts, users } from "../schema";
import { CreateComment, CreatePost, UpdatePost } from "../../types";

const ITEMS_ON_PAGE = 10;

export async function getPostsPages(query: string, showAll?: boolean) {
  const isShowingAll = showAll ? undefined : eq(posts.isPublic, true);
  const [result] = await db
    .select({ count: count() })
    .from(posts)
    .where(and(isShowingAll, ilike(posts.title, `%${query}%`)));
  const nOfPages = Math.ceil(result?.count / ITEMS_ON_PAGE);
  return nOfPages;
}
export async function getPosts(
  query: string,
  currentPage: number,
  showAll?: boolean
) {
  const offset = (currentPage - 1) * ITEMS_ON_PAGE;
  const isShowingAll = showAll ? undefined : eq(posts.isPublic, true);
  const result = await db
    .select({
      ...getTableColumns(posts),
      username: users.username,
    })
    .from(posts)
    .innerJoin(users, eq(users.id, posts.userId))
    .where(
      and(
        isShowingAll,
        or(
          ilike(posts.title, `%${query}%`),
          ilike(users.username, `%${query}%`)
        )
      )
    )
    .orderBy(desc(posts.createdAt))
    .limit(ITEMS_ON_PAGE)
    .offset(offset);
  return result;
}
export async function getPostById(id: string) {
  const [result] = await db
    .select({
      ...getTableColumns(posts),
      username: users.username,
    })
    .from(posts)
    .innerJoin(users, eq(users.id, posts.userId))
    .where(eq(posts.id, id))
    .limit(1);
  return result;
}
export async function getPostByTitle(title: string) {
  const [result] = await db
    .select()
    .from(posts)
    .where(eq(posts.title, title))
    .limit(1);
  return result;
}
export async function getPostComments(postId: string) {
  const { anonymousAuthorName, ...rest } = getTableColumns(comments);
  const result = await db
    .select({
      ...rest,
      authorName: sql`coalesce(${users.username}, ${comments.anonymousAuthorName})`,
    })
    .from(comments)
    .leftJoin(users, eq(users.id, comments.userId))
    .where(eq(comments.postId, postId))
    .orderBy(comments.createdAt);
  return result;
}
export async function createPost(postData: CreatePost) {
  const [result] = await db.insert(posts).values(postData).returning();
  return result;
}
export async function createComment(commentData: CreateComment) {
  const [result] = await db.insert(comments).values(commentData).returning();
  return result;
}
export async function updatePostById(
  postId: string,
  { title, content, isPublic }: UpdatePost
) {
  const updates: UpdatePost = {};
  if (title !== undefined) {
    updates.title = title;
  }
  if (content !== undefined) {
    updates.content = content;
  }
  if (isPublic !== undefined) {
    updates.isPublic = isPublic;
  }
  const [result] = await db
    .update(posts)
    .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
    .where(eq(posts.id, postId))
    .returning();
  return result;
}
export async function deleteComment(commentId: string) {
  const [result] = await db
    .delete(comments)
    .where(eq(comments.id, commentId))
    .returning();
  return result;
}
export async function deletePost(postId: string) {
  const [result] = await db
    .delete(posts)
    .where(eq(posts.id, postId))
    .returning();
  return result;
}
