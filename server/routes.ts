import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { db } from "./db";
import { 
  users, 
  categories, 
  threads, 
  posts,
  insertThreadSchema,
  insertPostSchema,
  insertVoteSchema 
} from "@shared/schema";
import { eq, sql, desc } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.get("/api/stats", async (req, res) => {
    try {
      const [statsResult] = await db.select({
        totalThreads: sql<number>`count(distinct ${threads.id})::int`,
        totalPosts: sql<number>`count(distinct ${posts.id})::int`,
        totalUsers: sql<number>`count(distinct ${users.id})::int`,
      }).from(users)
        .leftJoin(threads, eq(threads.authorId, users.id))
        .leftJoin(posts, eq(posts.authorId, users.id));

      res.json({
        ...statsResult,
        onlineUsers: 1,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.get("/api/categories", async (req, res) => {
    try {
      const allCategories = await storage.getCategories();
      
      const categoriesWithStats = await Promise.all(
        allCategories.map(async (category) => {
          const categoryThreads = await storage.getThreads(category.id);
          
          const [stats] = await db
            .select({
              threadCount: sql<number>`count(distinct ${threads.id})::int`,
              postCount: sql<number>`count(distinct ${posts.id})::int`,
            })
            .from(threads)
            .leftJoin(posts, eq(posts.threadId, threads.id))
            .where(eq(threads.categoryId, category.id));

          const lastThread = categoryThreads.length > 0 
            ? await db.query.threads.findFirst({
                where: eq(threads.categoryId, category.id),
                orderBy: [desc(threads.createdAt)],
                with: {
                  author: true,
                },
              })
            : undefined;

          return {
            ...category,
            threadCount: stats.threadCount || 0,
            postCount: stats.postCount || 0,
            lastThread,
          };
        })
      );

      res.json(categoriesWithStats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:id", async (req, res) => {
    try {
      const category = await storage.getCategory(req.params.id);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch category" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { insertCategorySchema } = await import("@shared/schema");
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create category" });
    }
  });

  app.get("/api/categories/:id/threads", async (req, res) => {
    try {
      const threadsList = await db.query.threads.findMany({
        where: eq(threads.categoryId, req.params.id),
        orderBy: [desc(threads.isPinned), desc(threads.lastActivityAt)],
        with: {
          author: true,
        },
      });

      res.json(threadsList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch threads" });
    }
  });

  app.get("/api/threads/recent", async (req, res) => {
    try {
      const recentThreads = await db.query.threads.findMany({
        orderBy: [desc(threads.createdAt)],
        limit: 10,
        with: {
          author: true,
          category: true,
        },
      });

      res.json(recentThreads);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent threads" });
    }
  });

  app.get("/api/threads/:id", async (req, res) => {
    try {
      const thread = await db.query.threads.findFirst({
        where: eq(threads.id, req.params.id),
        with: {
          author: true,
          category: true,
        },
      });

      if (!thread) {
        return res.status(404).json({ error: "Thread not found" });
      }

      await storage.incrementThreadViews(req.params.id);

      res.json(thread);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch thread" });
    }
  });

  app.post("/api/threads", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const validatedData = insertThreadSchema.parse(req.body);
      const thread = await storage.createThread(validatedData, req.user!.id);
      res.status(201).json(thread);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create thread" });
    }
  });

  app.get("/api/threads/:id/posts", async (req, res) => {
    try {
      const allPosts = await db.query.posts.findMany({
        where: eq(posts.threadId, req.params.id),
        with: {
          author: true,
        },
        orderBy: [posts.createdAt],
      });

      const userId = req.user?.id;
      const postsWithVotes = await Promise.all(
        allPosts.map(async (post) => {
          let userVote: number | undefined = undefined;
          if (userId) {
            const vote = await storage.getVote(userId, post.id);
            userVote = vote?.value;
          }
          return {
            ...post,
            userVote,
          };
        })
      );

      const buildTree = (parentId: string | null = null): any[] => {
        return postsWithVotes
          .filter((p) => p.parentPostId === parentId)
          .map((p) => ({
            ...p,
            replies: buildTree(p.id),
          }));
      };

      const tree = buildTree(null);
      res.json(tree);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  app.post("/api/posts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const validatedData = insertPostSchema.parse(req.body);
      const post = await storage.createPost(validatedData, req.user!.id);
      res.status(201).json(post);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create post" });
    }
  });

  app.post("/api/votes", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const validatedData = insertVoteSchema.parse({
        userId: req.user!.id,
        postId: req.body.postId,
        value: req.body.value,
      });
      const vote = await storage.createOrUpdateVote(validatedData);
      res.status(201).json(vote);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create vote" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const userThreads = await db.query.threads.findMany({
        where: eq(threads.authorId, req.params.id),
        with: {
          category: true,
        },
        orderBy: [desc(threads.createdAt)],
        limit: 20,
      });

      const userPosts = await db.query.posts.findMany({
        where: eq(posts.authorId, req.params.id),
        with: {
          thread: true,
        },
        orderBy: [desc(posts.createdAt)],
        limit: 20,
      });

      res.json({
        ...user,
        threads: userThreads,
        posts: userPosts,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
