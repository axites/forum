import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
  postCount: integer("post_count").notNull().default(0),
  threadCount: integer("thread_count").notNull().default(0),
  reputation: integer("reputation").notNull().default(0),
  rank: text("rank").notNull().default("Newbie"),
  bio: text("bio"),
});

export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull().default("folder"),
  order: integer("order").notNull().default(0),
});

export const threads = pgTable("threads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  categoryId: varchar("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
  authorId: varchar("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  viewCount: integer("view_count").notNull().default(0),
  replyCount: integer("reply_count").notNull().default(0),
  isPinned: boolean("is_pinned").notNull().default(false),
  isLocked: boolean("is_locked").notNull().default(false),
  lastActivityAt: timestamp("last_activity_at").notNull().defaultNow(),
});

export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  threadId: varchar("thread_id").notNull().references(() => threads.id, { onDelete: "cascade" }),
  authorId: varchar("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  parentPostId: varchar("parent_post_id").references(() => posts.id, { onDelete: "cascade" }),
  upvotes: integer("upvotes").notNull().default(0),
  downvotes: integer("downvotes").notNull().default(0),
});

export const votes = pgTable("votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  postId: varchar("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  value: integer("value").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  threads: many(threads),
  posts: many(posts),
  votes: many(votes),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  threads: many(threads),
}));

export const threadsRelations = relations(threads, ({ one, many }) => ({
  category: one(categories, {
    fields: [threads.categoryId],
    references: [categories.id],
  }),
  author: one(users, {
    fields: [threads.authorId],
    references: [users.id],
  }),
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  thread: one(threads, {
    fields: [posts.threadId],
    references: [threads.id],
  }),
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  parentPost: one(posts, {
    fields: [posts.parentPostId],
    references: [posts.id],
    relationName: "replies",
  }),
  replies: many(posts, {
    relationName: "replies",
  }),
  votes: many(votes),
}));

export const votesRelations = relations(votes, ({ one }) => ({
  user: one(users, {
    fields: [votes.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [votes.postId],
    references: [posts.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  joinedAt: true,
  postCount: true,
  threadCount: true,
  reputation: true,
  rank: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertThreadSchema = createInsertSchema(threads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  viewCount: true,
  replyCount: true,
  lastActivityAt: true,
}).extend({
  isPinned: z.boolean().optional(),
  isLocked: z.boolean().optional(),
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  upvotes: true,
  downvotes: true,
}).extend({
  parentPostId: z.string().nullable().optional(),
});

export const insertVoteSchema = createInsertSchema(votes).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Thread = typeof threads.$inferSelect;
export type InsertThread = z.infer<typeof insertThreadSchema>;

export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;

export type Vote = typeof votes.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;
