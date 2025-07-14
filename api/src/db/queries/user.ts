import { and, eq } from "drizzle-orm";
import { db } from "../index";
import { users } from "../schema";

export async function getUserByUsername(username: string){
    const [result] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result;
}
export async function getUserByUsernameAndPassword(username: string, passwordHash: string){
    const [result] = await db.select().from(users).where(and(eq(users.username, username), eq(users.password, passwordHash))).limit(1);
    return result;
}
export async function createUser(username: string, passwordHash: string, isAdmin: boolean = false){
    const [{id}] = await db.insert(users).values({username, password: passwordHash, isAdmin}).returning({ id: users.id });
    return id;
}