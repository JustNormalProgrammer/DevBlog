import { count, eq, ilike, and, desc, getTableColumns, sql } from "drizzle-orm";
import { db } from "../index";
import { comments, posts, users } from "../schema";
import { CreatePost, UpdatePost } from "../types";

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
    .where(and(isShowingAll, ilike(posts.title, `%${query}%`)))
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
export async function createPost(userId: string, postData: CreatePost) {
  const [{ id }] = await db
    .insert(posts)
    .values(postData)
    .returning({ id: posts.id });
  return id;
}
export async function updatePostById(postId: string, {title, content, isPublic}: UpdatePost) {
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
  const [result] = await db.update(posts).set(updates).where(eq(posts.id, postId)).returning();
  return result;
}
async function main() {
  const count = await getPosts("post", 1, true);
  const test = await getPostById("a8d335c8-241a-45c4-8191-138b98fdcac1");
  console.log(test);
  console.log("===============================");
  const updated = await updatePostById("a8d335c8-241a-45c4-8191-138b98fdcac1", {title: "Updated2 title", isPublic: true})
  console.log(updated);
}
main();
