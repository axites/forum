import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, FileText, Calendar, TrendingUp } from "lucide-react";
import { UserBadge } from "@/components/user-badge";
import { ReputationDisplay } from "@/components/reputation-display";
import type { User, Thread, Post, Category } from "@shared/schema";

interface UserWithActivity extends User {
  threads?: (Thread & { category: Category })[];
  posts?: (Post & { thread: Thread })[];
}

export default function UserProfilePage() {
  const { id } = useParams();

  const { data: user, isLoading } = useQuery<UserWithActivity>({
    queryKey: ["/api/users", id],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">User not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-8">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-3xl">
                {user.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <h1 className="text-3xl font-bold font-mono" data-testid="user-username">
                  {user.username}
                </h1>
                <UserBadge rank={user.rank} />
                <ReputationDisplay reputation={user.reputation} />
              </div>

              {user.bio && (
                <p className="text-muted-foreground mb-4" data-testid="user-bio">
                  {user.bio}
                </p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">Joined</div>
                    <div className="font-semibold text-sm" data-testid="user-joined">
                      {new Date(user.joinedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">Threads</div>
                    <div className="font-semibold text-sm font-mono" data-testid="user-thread-count">
                      {user.threadCount}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">Posts</div>
                    <div className="font-semibold text-sm font-mono" data-testid="user-post-count">
                      {user.postCount}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">Reputation</div>
                    <div className="font-semibold text-sm font-mono" data-testid="user-reputation">
                      {user.reputation}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="threads" className="w-full">
        <TabsList>
          <TabsTrigger value="threads" data-testid="tab-threads">Threads</TabsTrigger>
          <TabsTrigger value="posts" data-testid="tab-posts">Posts</TabsTrigger>
        </TabsList>

        <TabsContent value="threads" className="space-y-3">
          {user.threads && user.threads.length > 0 ? (
            user.threads.map((thread) => (
              <Link key={thread.id} href={`/thread/${thread.id}`}>
                <Card className="hover-elevate active-elevate-2 cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold mb-1 truncate" data-testid={`user-thread-${thread.id}`}>
                          {thread.title}
                        </h3>
                        <div className="text-xs text-muted-foreground">
                          in <span className="text-primary">{thread.category.name}</span> •{" "}
                          {new Date(thread.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {thread.replyCount}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No threads yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="posts" className="space-y-3">
          {user.posts && user.posts.length > 0 ? (
            user.posts.map((post) => (
              <Link key={post.id} href={`/thread/${post.thread.id}`}>
                <Card className="hover-elevate active-elevate-2 cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-muted-foreground mb-2">
                        Replied in <span className="text-primary font-medium">{post.thread.title}</span>
                      </div>
                      <div className="text-sm line-clamp-2" data-testid={`user-post-${post.id}`}>
                        {post.content}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        {new Date(post.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No posts yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
