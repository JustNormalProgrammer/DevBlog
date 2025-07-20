import { eq } from "drizzle-orm";
import { CreateRevokedToken } from "../../types";
import { db } from "../index";
import { revokedTokens } from "../schema";
export async function createRevokedToken(revokedTokenData: CreateRevokedToken) {
    await db.insert(revokedTokens).values(revokedTokenData);
    return;
}
export async function getRevokedToken(revokedToken: string){
    const [result] = await db.select().from(revokedTokens).where(eq(revokedTokens.revokedToken, revokedToken));
    return result;
}