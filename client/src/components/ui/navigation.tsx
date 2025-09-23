import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export default function Navigation() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const navItems = user ? [
    { href: "/", label: "Dashboard", adminOnly: true },
    { href: "/proxies", label: "Proxy Access", adminOnly: false },
    { href: "/feedback", label: "Feedback", adminOnly: false },
    { href: "/announcements", label: "Announcements", adminOnly: false },
  ] : [
    { href: "/proxies", label: "Proxy Access", adminOnly: false },
    { href: "/feedback", label: "Feedback", adminOnly: false },
    { href: "/announcements", label: "Announcements", adminOnly: false },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <nav className="glass-effect sticky top-0 z-50 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link href={user ? "/" : "/proxies"}>
              <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent cursor-pointer" data-testid="link-brand">
                Vortex Proxies
              </div>
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <button
                      className={cn(
                        "px-3 py-2 text-sm font-medium transition-colors duration-200",
                        location === item.href
                          ? "text-primary"
                          : "text-muted-foreground hover:text-primary"
                      )}
                      data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                    >
                      {item.label}
                    </button>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground" data-testid="text-user-status">
              {user ? "Admin" : "Guest"}
            </div>
            {user ? (
              <Button
                onClick={handleLogout}
                variant="destructive"
                size="sm"
                disabled={logoutMutation.isPending}
                data-testid="button-logout"
              >
                Logout
              </Button>
            ) : (
              <Link href="/auth">
                <Button size="sm" data-testid="button-login">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
