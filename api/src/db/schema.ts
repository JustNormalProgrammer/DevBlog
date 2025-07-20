import { primaryKey } from "drizzle-orm/pg-core";
import { text } from "drizzle-orm/pg-core";
import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid().defaultRandom().primaryKey(),
  username: varchar({ length: 30 }).notNull().unique(),
  password: varchar({ length: 256 }).notNull(),
  isAdmin: boolean().notNull().default(false),
});
export const comments = pgTable("comments", {
  id: uuid().defaultRandom().primaryKey(),
  userId: uuid().references(() => users.id),
  anonymousAuthorName: varchar({ length: 256 }),
  postId: uuid()
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
  content: text().notNull(),
});
export const posts = pgTable("posts", {
  id: uuid().defaultRandom().primaryKey(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
  userId: uuid()
    .notNull()
    .references(() => users.id),
  title: varchar({ length: 256 }).notNull(),
  content: text().notNull(),
  isPublic: boolean().notNull(),
});
export const refreshTokens = pgTable("refresh_tokens", {
  userId: uuid()
    .references(() => users.id)
    .primaryKey(),
  refreshToken: varchar({ length: 256 }).notNull(),
});
export const revokedTokens = pgTable("revoked_tokens", {
  userId: uuid()
    .references(() => users.id).notNull(),
  revokedToken: varchar({ length: 256 }).notNull(),
  exp: varchar({length: 256}).notNull()
}, (table) => [
  primaryKey({columns: [table.userId, table.revokedToken]})
]);
