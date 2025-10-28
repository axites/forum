import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Category } from "@shared/schema";

export default function CreateThreadPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const { data: category } = useQuery<Category>({
    queryKey: ["/api/categories", id],
  });

  const createThreadMutation = useMutation({
    mutationFn: async (data: { title: string; content: string; categoryId: string }) => {
      const res = await apiRequest("POST", "/api/threads", data);
      return await res.json();
    },
    onSuccess: (thread) => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories", id, "threads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/threads/recent"] });
      toast({
        title: "Thread created",
        description: "Your thread has been posted successfully",
      });
      setLocation(`/thread/${thread.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create thread",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    createThreadMutation.mutate({
      title,
      content,
      categoryId: id,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Button
          variant="ghost"
          data-testid="button-back"
          onClick={() => setLocation(`/category/${id}`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to {category?.name}
        </Button>
        <h1 className="text-3xl font-bold font-mono">Create New Thread</h1>
        <p className="text-muted-foreground mt-2">Start a new discussion in {category?.name}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thread Details</CardTitle>
          <CardDescription>Fill in the details for your new thread</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Thread Title</Label>
              <Input
                id="title"
                data-testid="input-thread-title"
                type="text"
                placeholder="Enter a descriptive title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                data-testid="textarea-thread-content"
                placeholder="Write your thread content here... Markdown is supported."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                required
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                You can use markdown formatting for code blocks, links, and emphasis
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                data-testid="button-submit-thread"
                disabled={createThreadMutation.isPending || !title.trim() || !content.trim()}
              >
                {createThreadMutation.isPending ? "Creating..." : "Create Thread"}
              </Button>
              <Button
                type="button"
                variant="outline"
                data-testid="button-cancel"
                onClick={() => setLocation(`/category/${id}`)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
