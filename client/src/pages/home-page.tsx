import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Eye, Users, FileText, FolderOpen } from "lucide-react";
import type { Category, Thread, User } from "@shared/schema";

interface CategoryWithStats extends Category {
  threadCount: number;
  postCount: number;
  lastThread?: Thread & { author: User };
}

export default function HomePage() {
  const { data: categories, isLoading: categoriesLoading } = useQuery<CategoryWithStats[]>({
    queryKey: ["/api/categories"],
  });

  const { data: stats } = useQuery<{
    totalThreads: number;
    totalPosts: number;
    totalUsers: number;
    onlineUsers: number;
  }>({
    queryKey: ["/api/stats"],
  });

  const { data: recentThreads } = useQuery<(Thread & { author: User; category: Category })[]>({
    queryKey: ["/api/threads/recent"],
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Threads</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono" data-testid="stat-threads">
              {stats?.totalThreads ?? 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono" data-testid="stat-posts">
              {stats?.totalPosts ?? 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono" data-testid="stat-users">
              {stats?.totalUsers ?? 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Now</CardTitle>
            <Eye className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-primary" data-testid="stat-online">
              {stats?.onlineUsers ?? 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4 font-mono">Categories</h2>
        <div className="space-y-3">
          {categoriesLoading ? (
            <>
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </>
          ) : categories && categories.length > 0 ? (
            categories.map((category) => (
              <Link key={category.id} href={`/category/${category.id}`}>
                <Card className="hover-elevate active-elevate-2 cursor-pointer transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-4 flex-1 min-w-0">
                        <div className="bg-primary/10 p-3 rounded-md shrink-0">
                          <FolderOpen className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg mb-1" data-testid={`category-name-${category.id}`}>
                            {category.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {category.threadCount} threads
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {category.postCount} posts
                            </span>
                          </div>
                        </div>
                      </div>
                      {category.lastThread && (
                        <div className="hidden lg:block text-xs text-muted-foreground text-right shrink-0 w-48">
                          <div className="font-medium text-foreground truncate">
                            {category.lastThread.title}
                          </div>
                          <div className="mt-1">
                            by {category.lastThread.author.username}
                          </div>
                          <div className="mt-1">
                            {new Date(category.lastThread.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No categories yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {recentThreads && recentThreads.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 font-mono">Recent Activity</h2>
          <div className="space-y-2">
            {recentThreads.slice(0, 5).map((thread) => (
              <Link key={thread.id} href={`/thread/${thread.id}`}>
                <Card className="hover-elevate active-elevate-2 cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate" data-testid={`recent-thread-${thread.id}`}>
                          {thread.title}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          in <span className="text-primary">{thread.category.name}</span> by{" "}
                          {thread.author.username}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground shrink-0">
                        {new Date(thread.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
