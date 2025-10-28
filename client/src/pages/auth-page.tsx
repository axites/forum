import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, MessageSquare, Users, Lock } from "lucide-react";

const loginSchema = insertUserSchema;
const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  if (user) {
    setLocation("/");
    return null;
  }

  const handleLogin = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(data);
  };

  const handleRegister = (data: z.infer<typeof registerSchema>) => {
    registerMutation.mutate({
      username: data.username,
      password: data.password,
    });
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight font-mono">GRAY FORUM</h1>
            </div>
            <p className="text-sm text-muted-foreground">Underground Tech Community</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
              <TabsTrigger value="register" data-testid="tab-register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Welcome Back</CardTitle>
                  <CardDescription>Login to access the forum</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input
                                data-testid="input-login-username"
                                type="text"
                                placeholder="Enter username"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input
                                data-testid="input-login-password"
                                type="password"
                                placeholder="Enter password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full"
                        data-testid="button-login"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? "Logging in..." : "Login"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Join the Community</CardTitle>
                  <CardDescription>Create an account to start posting</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input
                                data-testid="input-register-username"
                                type="text"
                                placeholder="Choose a username"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input
                                data-testid="input-register-password"
                                type="password"
                                placeholder="Choose a password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input
                                data-testid="input-register-confirm"
                                type="password"
                                placeholder="Confirm password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full"
                        data-testid="button-register"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? "Creating account..." : "Create Account"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-card p-12 flex-col justify-center">
        <div className="space-y-8 max-w-lg">
          <div>
            <h2 className="text-4xl font-bold mb-4">Secure Community</h2>
            <p className="text-muted-foreground text-lg">
              Join a trusted underground community of security researchers, developers, and tech enthusiasts.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="bg-primary/10 p-3 rounded-md">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Threaded Discussions</h3>
                <p className="text-sm text-muted-foreground">
                  Engage in deep technical discussions with nested replies and advanced formatting
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="bg-primary/10 p-3 rounded-md">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Reputation System</h3>
                <p className="text-sm text-muted-foreground">
                  Build credibility through quality contributions and community votes
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="bg-primary/10 p-3 rounded-md">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Privacy Focused</h3>
                <p className="text-sm text-muted-foreground">
                  Your data is secure with encrypted authentication and minimal tracking
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
