import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import CategoryPage from "@/pages/category-page";
import CreateThreadPage from "@/pages/create-thread-page";
import ThreadPage from "@/pages/thread-page";
import UserProfilePage from "@/pages/user-profile-page";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/category/:id" component={CategoryPage} />
      <ProtectedRoute path="/category/:id/new" component={CreateThreadPage} />
      <ProtectedRoute path="/thread/:id" component={ThreadPage} />
      <ProtectedRoute path="/user/:id" component={UserProfilePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full">
              <AppSidebar />
              <div className="flex flex-col flex-1 overflow-hidden">
                <header className="flex items-center justify-between p-4 border-b bg-background shrink-0">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Secure Underground Community
                    </span>
                  </div>
                </header>
                <main className="flex-1 overflow-auto">
                  <div className="container max-w-7xl mx-auto p-6">
                    <Router />
                  </div>
                </main>
              </div>
            </div>
          </SidebarProvider>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
