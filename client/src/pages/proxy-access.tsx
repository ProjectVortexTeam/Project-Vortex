import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { ProxyLink, Announcement } from "@shared/schema";
import Navigation from "@/components/ui/navigation";

export default function ProxyAccess() {
  const { data: proxyLinks, isLoading } = useQuery<ProxyLink[]>({
    queryKey: ["/api/proxy-links", "active"],
    queryFn: () => fetch("/api/proxy-links/active").then(res => res.json()),
  });

  const { data: importantAnnouncements } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements", "important"],
    queryFn: () => fetch("/api/announcements?type=important").then(res => res.json()),
  });

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-slide-up">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2" data-testid="text-page-title">Vortex Proxies</h1>
          <p className="text-muted-foreground">Secure and anonymous browsing solutions</p>
        </div>

        {/* Important Announcements (Public View) */}
        {importantAnnouncements && importantAnnouncements.length > 0 && (
          <Card className="glass-effect border-border mb-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <span className="w-2 h-2 bg-accent rounded-full mr-3 animate-pulse-slow"></span>
                Important Announcements
              </h2>
              <div className="space-y-3">
                {importantAnnouncements.map((announcement) => (
                  <div key={announcement.id} className="bg-secondary/30 rounded-lg p-3 border-l-4 border-accent" data-testid={`announcement-${announcement.id}`}>
                    <p className="text-foreground">{announcement.text}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Proxy Links */}
        <Card className="glass-effect border-border">
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-6">Available Proxies</h2>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {proxyLinks?.map((proxy) => (
                  <div
                    key={proxy.id}
                    className="bg-secondary/50 rounded-lg p-6 border border-border hover:border-primary/50 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
                    data-testid={`card-proxy-${proxy.id}`}
                  >
                    <h3 className="text-lg font-semibold text-foreground mb-2">{proxy.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{proxy.description}</p>
                    <a
                      href={proxy.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors duration-200"
                      data-testid={`link-proxy-${proxy.id}`}
                    >
                      Access Proxy
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </div>
                ))}
              </div>
            )}

            {!proxyLinks?.length && !isLoading && (
              <p className="text-muted-foreground text-center py-8">No proxy links available at the moment.</p>
            )}

            <div className="mt-8 text-center">
              <p className="text-muted-foreground mb-4">Found a broken link or have suggestions?</p>
              <Link href="/feedback">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 transform hover:scale-[1.02] transition-all duration-200" data-testid="button-feedback">
                  Submit Feedback
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
