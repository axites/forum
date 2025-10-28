import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Shield, Home, FolderOpen, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Category } from "@shared/schema";

export function AppSidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer hover-elevate active-elevate-2 p-2 rounded-md">
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <div className="font-bold font-mono text-lg">GRAY FORUM</div>
              <div className="text-xs text-muted-foreground">Underground Tech</div>
            </div>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location === "/"}>
                  <Link href="/" data-testid="sidebar-link-home">
                    <Home className="h-4 w-4" />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Categories</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {categories?.map((category) => (
                <SidebarMenuItem key={category.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === `/category/${category.id}`}
                  >
                    <Link href={`/category/${category.id}`} data-testid={`sidebar-link-category-${category.id}`}>
                      <FolderOpen className="h-4 w-4" />
                      <span>{category.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {user && (
        <SidebarFooter className="p-4">
          <div className="flex items-center gap-3 p-3 rounded-md bg-card">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {user.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{user.username}</div>
              <div className="text-xs text-muted-foreground">{user.rank}</div>
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              asChild
              data-testid="button-profile"
            >
              <Link href={`/user/${user.id}`}>
                <User className="h-3 w-3 mr-1" />
                Profile
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              data-testid="button-logout"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-3 w-3" />
            </Button>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
