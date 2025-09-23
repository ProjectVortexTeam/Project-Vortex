import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isLogin) {
        await loginMutation.mutateAsync({ username, password });
      } else {
        await registerMutation.mutateAsync({ username, password });
      }
    } catch (error) {
      // Error handling is done in the mutation itself
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Auth Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0 animate-slide-up">
          <Card className="glass-effect shadow-2xl border-border">
            <CardContent className="pt-8 p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                  {isLogin ? "Admin Login" : "Create Account"}
                </h1>
                <p className="text-muted-foreground">
                  {isLogin ? "Access the control panel" : "Register as an admin"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="username" className="block text-sm font-medium text-foreground mb-2">
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full bg-input border-border focus:ring-ring focus:border-transparent"
                    data-testid="input-username"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-input border-border focus:ring-ring focus:border-transparent"
                    data-testid="input-password"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transform hover:scale-[1.02] transition-all duration-200"
                  disabled={loginMutation.isPending || registerMutation.isPending}
                  data-testid="button-submit"
                >
                  {(loginMutation.isPending || registerMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isLogin ? "Sign In" : "Register"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-muted-foreground text-sm">
                  Admin access only
                </p>
              </div>

              <div className="mt-8 text-center">
                <Link href="/proxies" className="text-accent hover:text-accent/80 transition-colors duration-200 font-medium">
                  Continue as Guest →
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right side - Hero Section */}
        <div className="hidden lg:block animate-fade-in">
          <div className="glass-effect rounded-xl p-8 border-border">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
                Vortex Proxies
              </h2>
              <p className="text-xl text-muted-foreground mb-6">
                Secure and anonymous browsing solutions
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 animate-pulse-slow"></div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Anonymous Browsing</h3>
                  <p className="text-muted-foreground">Access the web securely and privately through our curated proxy network.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 animate-pulse-slow"></div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Admin Controls</h3>
                  <p className="text-muted-foreground">Manage proxy links, announcements, and user feedback from a centralized dashboard.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 animate-pulse-slow"></div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Community Feedback</h3>
                  <p className="text-muted-foreground">Users can suggest new proxy links and report issues to improve the service.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
