import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronRight, MessageSquare, Eye, ArrowUp, ArrowDown, Reply, Pin, Lock, User } from "lucide-react";
import { UserBadge } from "@/components/user-badge";
import { ReputationDisplay } from "@/components/reputation-display";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Thread, Post, User as UserType, Category } from "@shared/schema";

interface ThreadWithDetails extends Thread {
  author: UserType;
  category: Category;
}

interface PostWithDetails extends Post {
  author: UserType;
  replies?: PostWithDetails[];
  userVote?: number;
}

function PostCard({ post, threadId, level = 0 }: { post: PostWithDetails; threadId: string; level?: number }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [replyContent, setReplyContent] = useState("");
  const [showReplyForm, setShowReplyForm] = useState(false);

  const replyMutation = useMutation({
    mutationFn: async (data: { content: string; parentPostId: string }) => {
      const res = await apiRequest("POST", "/api/posts", {
        threadId,
        content: data.content,
        parentPostId: data.parentPostId,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/threads", threadId, "posts"] });
      setReplyContent("");
      setShowReplyForm(false);
      toast({ title: "Reply posted successfully" });
    },
  });

  const voteMutation = useMutation({
    mutationFn: async (data: { postId: string; value: number }) => {
      const res = await apiRequest("POST", "/api/votes", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/threads", threadId, "posts"] });
    },
  });

  const handleReply = () => {
    if (!replyContent.trim()) return;
    replyMutation.mutate({ content: replyContent, parentPostId: post.id });
  };

  const handleVote = (value: number) => {
    if (!user) return;
    voteMutation.mutate({ postId: post.id, value });
  };

  const netVotes = post.upvotes - post.downvotes;

  return (
    <div className={level > 0 ? "ml-8 mt-3" : ""} data-testid={`post-${post.id}`}>
      <Card className={level === 0 ? "border-primary/30" : ""}>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex flex-col items-center gap-2 shrink-0">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {post.author.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-center gap-1 text-xs">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  data-testid={`button-upvote-${post.id}`}
                  onClick={() => handleVote(1)}
                  disabled={!user || post.userVote === 1}
                >
                  <ArrowUp className={`h-4 w-4 ${post.userVote === 1 ? "text-primary" : ""}`} />
                </Button>
                <span className={`font-mono font-semibold ${netVotes > 0 ? "text-primary" : netVotes < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                  {netVotes}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  data-testid={`button-downvote-${post.id}`}
                  onClick={() => handleVote(-1)}
                  disabled={!user || post.userVote === -1}
                >
                  <ArrowDown className={`h-4 w-4 ${post.userVote === -1 ? "text-destructive" : ""}`} />
                </Button>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Link href={`/user/${post.author.id}`}>
                  <span className="font-semibold hover:text-primary cursor-pointer" data-testid={`post-author-${post.id}`}>
                    {post.author.username}
                  </span>
                </Link>
                <UserBadge rank={post.author.rank} />
                <ReputationDisplay reputation={post.author.reputation} />
                <span className="text-xs text-muted-foreground">
                  {new Date(post.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="prose prose-sm dark:prose-invert max-w-none mb-4">
                <div className="text-sm whitespace-pre-wrap break-words" data-testid={`post-content-${post.id}`}>
                  {post.content}
                </div>
              </div>

              <div className="flex gap-2">
                {user && (
                  <Button
                    variant="ghost"
                    size="sm"
                    data-testid={`button-reply-${post.id}`}
                    onClick={() => setShowReplyForm(!showReplyForm)}
                  >
                    <Reply className="h-3 w-3 mr-1" />
                    Reply
                  </Button>
                )}
              </div>

              {showReplyForm && (
                <div className="mt-4 space-y-3">
                  <Textarea
                    data-testid={`textarea-reply-${post.id}`}
                    placeholder="Write your reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    rows={4}
                    className="text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      data-testid={`button-submit-reply-${post.id}`}
                      onClick={handleReply}
                      disabled={replyMutation.isPending || !replyContent.trim()}
                    >
                      {replyMutation.isPending ? "Posting..." : "Post Reply"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowReplyForm(false);
                        setReplyContent("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {post.replies && post.replies.length > 0 && (
        <div className="space-y-3 mt-3">
          {post.replies.map((reply) => (
            <PostCard key={reply.id} post={reply} threadId={threadId} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ThreadPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [replyContent, setReplyContent] = useState("");

  const { data: thread, isLoading: threadLoading } = useQuery<ThreadWithDetails>({
    queryKey: ["/api/threads", id],
  });

  const { data: posts, isLoading: postsLoading } = useQuery<PostWithDetails[]>({
    queryKey: ["/api/threads", id, "posts"],
  });

  const replyMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/posts", {
        threadId: id,
        content,
        parentPostId: null,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/threads", id, "posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/threads", id] });
      setReplyContent("");
      toast({ title: "Reply posted successfully" });
    },
  });

  const handleReply = () => {
    if (!replyContent.trim()) return;
    replyMutation.mutate(replyContent);
  };

  if (threadLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!thread) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">Thread not found</p>
        </CardContent>
      </Card>
    );
  }

  const topLevelPosts = posts?.filter((p) => !p.parentPostId) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Link href="/">
            <span className="hover:text-foreground cursor-pointer">Home</span>
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href={`/category/${thread.category.id}`}>
            <span className="hover:text-foreground cursor-pointer">{thread.category.name}</span>
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground truncate">{thread.title}</span>
        </div>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {thread.isPinned && (
                <Badge variant="default" className="text-xs gap-1">
                  <Pin className="h-3 w-3" />
                  Pinned
                </Badge>
              )}
              {thread.isLocked && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <Lock className="h-3 w-3" />
                  Locked
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold font-mono mb-2" data-testid="thread-title">
              {thread.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1">
                by{" "}
                <Link href={`/user/${thread.author.id}`}>
                  <span className="text-foreground font-medium hover:text-primary cursor-pointer">
                    {thread.author.username}
                  </span>
                </Link>
                <UserBadge rank={thread.author.rank} />
              </div>
              <span>•</span>
              <span>{new Date(thread.createdAt).toLocaleString()}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span className="font-mono">{thread.replyCount} replies</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span className="font-mono">{thread.viewCount} views</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Card className="border-primary/30">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex flex-col items-center gap-3 shrink-0">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xl">
                  {thread.author.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <Link href={`/user/${thread.author.id}`}>
                  <div className="font-semibold text-sm hover:text-primary cursor-pointer">
                    {thread.author.username}
                  </div>
                </Link>
                <UserBadge rank={thread.author.rank} />
                <ReputationDisplay reputation={thread.author.reputation} className="mt-1 justify-center" />
                <div className="text-xs text-muted-foreground mt-2">
                  {thread.author.postCount} posts
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="text-sm whitespace-pre-wrap break-words" data-testid="thread-content">
                  {thread.content}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {postsLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : (
        <div className="space-y-4">
          {topLevelPosts.map((post) => (
            <PostCard key={post.id} post={post} threadId={id!} />
          ))}
        </div>
      )}

      {user && !thread.isLocked && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Post a Reply</h3>
            <div className="space-y-4">
              <Textarea
                data-testid="textarea-new-reply"
                placeholder="Write your reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={6}
                className="font-mono text-sm"
              />
              <Button
                data-testid="button-submit-new-reply"
                onClick={handleReply}
                disabled={replyMutation.isPending || !replyContent.trim()}
              >
                {replyMutation.isPending ? "Posting..." : "Post Reply"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!user && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">You must be logged in to reply</p>
            <Link href="/auth">
              <Button>Login to Reply</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
