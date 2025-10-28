import { useQuery } from "@tanstack/react-query";
import { Link, useParams, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Eye, ChevronRight, Pin, Lock, PlusCircle } from "lucide-react";
import { UserBadge } from "@/components/user-badge";
import type { Category, Thread, User } from "@shared/schema";

interface ThreadWithAuthor extends Thread {
  author: User;
}

export default function CategoryPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  const { data: category, isLoading: categoryLoading } = useQuery<Category>({
    queryKey: ["/api/categories", id],
  });

  const { data: threads, isLoading: threadsLoading } = useQuery<ThreadWithAuthor[]>({
    queryKey: ["/api/categories", id, "threads"],
  });

  if (categoryLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!category) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">Category not found</p>
        </CardContent>
      </Card>
    );
  }

  const pinnedThreads = threads?.filter((t) => t.isPinned) ?? [];
  const normalThreads = threads?.filter((t) => !t.isPinned) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href="/">
              <span className="hover:text-foreground cursor-pointer">Home</span>
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{category.name}</span>
          </div>
          <h1 className="text-3xl font-bold font-mono" data-testid="category-title">
            {category.name}
          </h1>
          <p className="text-muted-foreground mt-2">{category.description}</p>
        </div>
        <Button data-testid="button-create-thread" onClick={() => setLocation(`/category/${id}/new`)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Thread
        </Button>
      </div>

      <div className="space-y-2">
        {threadsLoading ? (
          <>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </>
        ) : (
          <>
            {pinnedThreads.map((thread) => (
              <Link key={thread.id} href={`/thread/${thread.id}`}>
                <Card className="hover-elevate active-elevate-2 cursor-pointer border-primary/30">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge variant="default" className="text-xs gap-1">
                            <Pin className="h-3 w-3" />
                            Pinned
                          </Badge>
                          {thread.isLocked && (
                            <Badge variant="secondary" className="text-xs gap-1">
                              <Lock className="h-3 w-3" />
                              Locked
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-lg mb-2" data-testid={`thread-title-${thread.id}`}>
                          {thread.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          <div className="flex items-center gap-1">
                            by <span className="text-foreground font-medium">{thread.author.username}</span>
                            <UserBadge rank={thread.author.rank} />
                          </div>
                          <span>•</span>
                          <span>{new Date(thread.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground shrink-0">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          <span className="font-mono">{thread.replyCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span className="font-mono">{thread.viewCount}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}

            {normalThreads.map((thread) => (
              <Link key={thread.id} href={`/thread/${thread.id}`}>
                <Card className="hover-elevate active-elevate-2 cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        {thread.isLocked && (
                          <Badge variant="secondary" className="text-xs gap-1 mb-2">
                            <Lock className="h-3 w-3" />
                            Locked
                          </Badge>
                        )}
                        <h3 className="font-semibold text-lg mb-2" data-testid={`thread-title-${thread.id}`}>
                          {thread.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          <div className="flex items-center gap-1">
                            by <span className="text-foreground font-medium">{thread.author.username}</span>
                            <UserBadge rank={thread.author.rank} />
                          </div>
                          <span>•</span>
                          <span>{new Date(thread.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground shrink-0">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          <span className="font-mono">{thread.replyCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span className="font-mono">{thread.viewCount}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}

            {threads && threads.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mb-4">No threads yet in this category</p>
                  <Button data-testid="button-create-first-thread" onClick={() => setLocation(`/category/${id}/new`)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Start the first thread
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
