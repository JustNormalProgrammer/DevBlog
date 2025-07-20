import { and, eq } from "drizzle-orm";
import { db } from "../index";
import { users } from "../schema";

export async function getUserByUsername(username: string) {
  const [result] = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
  return result;
}
export async function getUserById(id: string) {
  const [result] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return result;
}
export async function getUserByUsernameAndPassword(
  username: string,
  passwordHash: string
) {
  const [result] = await db
    .select()
    .from(users)
    .where(and(eq(users.username, username), eq(users.password, passwordHash)))
    .limit(1);
  return result;
}
export async function createUser(
  username: string,
  passwordHash: string,
  isAdmin: boolean = false
) {
  const [result] = await db
    .insert(users)
    .values({ username, password: passwordHash, isAdmin })
    .returning();
  return result;
}
