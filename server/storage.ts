import { 
  users, 
  categories, 
  threads, 
  posts, 
  votes,
  type User, 
  type InsertUser,
  type Category,
  type InsertCategory,
  type Thread,
  type InsertThread,
  type Post,
  type InsertPost,
  type Vote,
  type InsertVote,
} from "@shared/schema";
import { db } from "./db";
import { pool } from "./db";
import { eq, desc, and, sql, isNull } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: session.SessionStore;
  
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  getThreads(categoryId?: string): Promise<Thread[]>;
  getThread(id: string): Promise<Thread | undefined>;
  createThread(thread: InsertThread, authorId: string): Promise<Thread>;
  updateThread(id: string, data: Partial<Thread>): Promise<Thread | undefined>;
  incrementThreadViews(id: string): Promise<void>;
  
  getPosts(threadId: string): Promise<Post[]>;
  getPost(id: string): Promise<Post | undefined>;
  createPost(post: InsertPost, authorId: string): Promise<Post>;
  
  getVote(userId: string, postId: string): Promise<Vote | undefined>;
  createOrUpdateVote(vote: InsertVote): Promise<Vote>;
  
  getUserThreads(userId: string): Promise<Thread[]>;
  getUserPosts(userId: string): Promise<Post[]>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ pool, createTableIfMissing: true });
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.order);
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values(category)
      .returning();
    return newCategory;
  }

  async getThreads(categoryId?: string): Promise<Thread[]> {
    if (categoryId) {
      return await db
        .select()
        .from(threads)
        .where(eq(threads.categoryId, categoryId))
        .orderBy(desc(threads.isPinned), desc(threads.lastActivityAt));
    }
    return await db
      .select()
      .from(threads)
      .orderBy(desc(threads.lastActivityAt))
      .limit(10);
  }

  async getThread(id: string): Promise<Thread | undefined> {
    const [thread] = await db.select().from(threads).where(eq(threads.id, id));
    return thread || undefined;
  }

  async createThread(thread: InsertThread, authorId: string): Promise<Thread> {
    const [newThread] = await db
      .insert(threads)
      .values({
        ...thread,
        authorId,
      })
      .returning();

    await db
      .update(users)
      .set({
        threadCount: sql`${users.threadCount} + 1`,
      })
      .where(eq(users.id, authorId));

    return newThread;
  }

  async updateThread(id: string, data: Partial<Thread>): Promise<Thread | undefined> {
    const [thread] = await db
      .update(threads)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(threads.id, id))
      .returning();
    return thread || undefined;
  }

  async incrementThreadViews(id: string): Promise<void> {
    await db
      .update(threads)
      .set({
        viewCount: sql`${threads.viewCount} + 1`,
      })
      .where(eq(threads.id, id));
  }

  async getPosts(threadId: string): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.threadId, threadId))
      .orderBy(posts.createdAt);
  }

  async getPost(id: string): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post || undefined;
  }

  async createPost(post: InsertPost, authorId: string): Promise<Post> {
    const [newPost] = await db
      .insert(posts)
      .values({
        ...post,
        authorId,
      })
      .returning();

    await db
      .update(threads)
      .set({
        replyCount: sql`${threads.replyCount} + 1`,
        lastActivityAt: new Date(),
      })
      .where(eq(threads.id, post.threadId));

    await db
      .update(users)
      .set({
        postCount: sql`${users.postCount} + 1`,
      })
      .where(eq(users.id, authorId));

    return newPost;
  }

  async getVote(userId: string, postId: string): Promise<Vote | undefined> {
    const [vote] = await db
      .select()
      .from(votes)
      .where(and(eq(votes.userId, userId), eq(votes.postId, postId)));
    return vote || undefined;
  }

  async createOrUpdateVote(vote: InsertVote): Promise<Vote> {
    const existing = await this.getVote(vote.userId, vote.postId);
    
    if (existing) {
      const oldValue = existing.value;
      const [updated] = await db
        .update(votes)
        .set({ value: vote.value })
        .where(eq(votes.id, existing.id))
        .returning();

      const post = await this.getPost(vote.postId);
      if (post) {
        if (oldValue === 1 && vote.value === -1) {
          await db
            .update(posts)
            .set({
              upvotes: sql`${posts.upvotes} - 1`,
              downvotes: sql`${posts.downvotes} + 1`,
            })
            .where(eq(posts.id, vote.postId));
        } else if (oldValue === -1 && vote.value === 1) {
          await db
            .update(posts)
            .set({
              upvotes: sql`${posts.upvotes} + 1`,
              downvotes: sql`${posts.downvotes} - 1`,
            })
            .where(eq(posts.id, vote.postId));
        }

        const postAuthor = await this.getUser(post.authorId);
        if (postAuthor) {
          const repChange = vote.value - oldValue;
          await db
            .update(users)
            .set({
              reputation: sql`${users.reputation} + ${repChange}`,
            })
            .where(eq(users.id, post.authorId));
        }
      }

      return updated;
    } else {
      const [newVote] = await db
        .insert(votes)
        .values(vote)
        .returning();

      const post = await this.getPost(vote.postId);
      if (post) {
        if (vote.value === 1) {
          await db
            .update(posts)
            .set({
              upvotes: sql`${posts.upvotes} + 1`,
            })
            .where(eq(posts.id, vote.postId));
        } else if (vote.value === -1) {
          await db
            .update(posts)
            .set({
              downvotes: sql`${posts.downvotes} + 1`,
            })
            .where(eq(posts.id, vote.postId));
        }

        await db
          .update(users)
          .set({
            reputation: sql`${users.reputation} + ${vote.value}`,
          })
          .where(eq(users.id, post.authorId));
      }

      return newVote;
    }
  }

  async getUserThreads(userId: string): Promise<Thread[]> {
    return await db
      .select()
      .from(threads)
      .where(eq(threads.authorId, userId))
      .orderBy(desc(threads.createdAt))
      .limit(20);
  }

  async getUserPosts(userId: string): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.authorId, userId))
      .orderBy(desc(posts.createdAt))
      .limit(20);
  }
}

export const storage = new DatabaseStorage();
