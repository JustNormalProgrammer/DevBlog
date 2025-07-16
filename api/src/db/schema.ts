import { text } from "drizzle-orm/pg-core";
import { pgTable, uuid, varchar,timestamp, boolean} from "drizzle-orm/pg-core";

export const users = pgTable('users', {
    id: uuid().defaultRandom().primaryKey(),
    username: varchar({length: 256}).notNull().unique(),
    password: varchar({length: 256}).notNull(),
    isAdmin: boolean().notNull().default(false)
})
export const comments = pgTable('comments', {
    id: uuid().defaultRandom().primaryKey(),
    userId: uuid().references(() => users.id),
    anonymousAuthorName: varchar({length: 256}),
    postId: uuid().notNull().references(() => posts.id, { onDelete: 'cascade' }),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
    content: text().notNull(),
});
export const posts = pgTable('posts', {
    id: uuid().defaultRandom().primaryKey(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
    userId: uuid().notNull().references(() => users.id),
    title: varchar({length: 256}).notNull(),
    content: text().notNull(),
    isPublic: boolean().notNull()
})