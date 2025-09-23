import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Loader2, Edit, Trash2, ExternalLink, MessageSquare, Users, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ProxyLink, Announcement, Feedback } from "@shared/schema";
import Navigation from "@/components/ui/navigation";

export default function HomePage() {
  const { toast } = useToast();
  const [proxyFormOpen, setProxyFormOpen] = useState(false);
  const [announcementFormOpen, setAnnouncementFormOpen] = useState(false);
  const [editingProxy, setEditingProxy] = useState<ProxyLink | null>(null);

  // Fetch data
  const { data: proxyLinks, isLoading: proxyLoading } = useQuery<ProxyLink[]>({
    queryKey: ["/api/proxy-links"],
  });

  const { data: importantAnnouncements } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements", "important"],
    queryFn: () => fetch("/api/announcements?type=important").then(res => res.json()),
  });

  const { data: feedback } = useQuery<Feedback[]>({
    queryKey: ["/api/feedback"],
  });

  // Mutations
  const createProxyMutation = useMutation({
    mutationFn: async (data: { name: string; url: string; description: string }) => {
      const response = await apiRequest("POST", "/api/proxy-links", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proxy-links"] });
      setProxyFormOpen(false);
      setEditingProxy(null);
      toast({ title: "Success", description: "Proxy link created successfully" });
    },
  });

  const updateProxyMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name?: string; url?: string; description?: string; active?: boolean }) => {
      const response = await apiRequest("PATCH", `/api/proxy-links/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proxy-links"] });
      toast({ title: "Success", description: "Proxy link updated successfully" });
    },
  });

  const deleteProxyMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/proxy-links/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proxy-links"] });
      toast({ title: "Success", description: "Proxy link deleted successfully" });
    },
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: async (data: { text: string; type: string }) => {
      const response = await apiRequest("POST", "/api/announcements", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      setAnnouncementFormOpen(false);
      toast({ title: "Success", description: "Announcement created successfully" });
    },
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/announcements/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      toast({ title: "Success", description: "Announcement deleted successfully" });
    },
  });

  const handleProxySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      url: formData.get("url") as string,
      description: formData.get("description") as string,
    };

    if (editingProxy) {
      updateProxyMutation.mutate({ id: editingProxy.id, ...data });
    } else {
      createProxyMutation.mutate(data);
    }
  };

  const handleAnnouncementSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      text: formData.get("text") as string,
      type: "important",
    };
    createAnnouncementMutation.mutate(data);
  };

  const toggleProxyStatus = (proxy: ProxyLink) => {
    updateProxyMutation.mutate({ id: proxy.id, active: !proxy.active });
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-slide-up">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" data-testid="text-dashboard-title">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage proxy links and announcements</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass-effect border-border">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Proxies</p>
                  <p className="text-2xl font-bold">{proxyLinks?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-border">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-accent/20 rounded-lg">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Proxies</p>
                  <p className="text-2xl font-bold">{proxyLinks?.filter(p => p.active).length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-border">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-destructive/20 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Feedback Items</p>
                  <p className="text-2xl font-bold">{feedback?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Important Announcements Section */}
        <Card className="glass-effect border-border mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold flex items-center">
                <span className="w-2 h-2 bg-accent rounded-full mr-3 animate-pulse-slow"></span>
                Important Announcements
              </h2>
              <Dialog open={announcementFormOpen} onOpenChange={setAnnouncementFormOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-add-announcement">
                    Add Announcement
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-effect border-border">
                  <DialogHeader>
                    <DialogTitle>Add Important Announcement</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="announcement-text">Announcement Text</Label>
                      <Textarea
                        id="announcement-text"
                        name="text"
                        placeholder="Enter announcement text..."
                        required
                        className="bg-input border-border"
                        data-testid="textarea-announcement"
                      />
                    </div>
                    <Button type="submit" disabled={createAnnouncementMutation.isPending} data-testid="button-submit-announcement">
                      {createAnnouncementMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Announcement
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-4">
              {importantAnnouncements?.map((announcement) => (
                <div key={announcement.id} className="bg-secondary/50 rounded-lg p-4 border border-border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-foreground">{announcement.text}</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAnnouncementMutation.mutate(announcement.id)}
                      className="text-destructive hover:text-destructive/80"
                      data-testid={`button-delete-announcement-${announcement.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {!importantAnnouncements?.length && (
                <p className="text-muted-foreground text-center py-8">No important announcements yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Proxy Links Management */}
        <Card className="glass-effect border-border mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Proxy Links Management</h2>
              <Dialog open={proxyFormOpen} onOpenChange={setProxyFormOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => setEditingProxy(null)}
                    data-testid="button-add-proxy"
                  >
                    Add Proxy
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-effect border-border">
                  <DialogHeader>
                    <DialogTitle>{editingProxy ? "Edit Proxy Link" : "Add Proxy Link"}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleProxySubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="proxy-name">Name</Label>
                      <Input
                        id="proxy-name"
                        name="name"
                        defaultValue={editingProxy?.name || ""}
                        placeholder="Proxy name..."
                        required
                        className="bg-input border-border"
                        data-testid="input-proxy-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="proxy-url">URL</Label>
                      <Input
                        id="proxy-url"
                        name="url"
                        type="url"
                        defaultValue={editingProxy?.url || ""}
                        placeholder="https://..."
                        required
                        className="bg-input border-border"
                        data-testid="input-proxy-url"
                      />
                    </div>
                    <div>
                      <Label htmlFor="proxy-description">Description</Label>
                      <Textarea
                        id="proxy-description"
                        name="description"
                        defaultValue={editingProxy?.description || ""}
                        placeholder="Proxy description..."
                        required
                        className="bg-input border-border"
                        data-testid="textarea-proxy-description"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={createProxyMutation.isPending || updateProxyMutation.isPending}
                      data-testid="button-submit-proxy"
                    >
                      {(createProxyMutation.isPending || updateProxyMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {editingProxy ? "Update Proxy" : "Create Proxy"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-4">
              {proxyLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                proxyLinks?.map((proxy) => (
                  <div key={proxy.id} className="bg-secondary/50 rounded-lg p-4 border border-border" data-testid={`card-proxy-${proxy.id}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{proxy.name}</h3>
                        <p className="text-sm text-muted-foreground">{proxy.description}</p>
                        <a 
                          href={proxy.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-accent hover:text-accent/80 text-sm inline-flex items-center mt-1"
                        >
                          {proxy.url}
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={proxy.active}
                            onCheckedChange={() => toggleProxyStatus(proxy)}
                            data-testid={`switch-proxy-${proxy.id}`}
                          />
                          <Badge variant={proxy.active ? "default" : "secondary"}>
                            {proxy.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingProxy(proxy);
                            setProxyFormOpen(true);
                          }}
                          className="text-primary hover:text-primary/80"
                          data-testid={`button-edit-proxy-${proxy.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteProxyMutation.mutate(proxy.id)}
                          className="text-destructive hover:text-destructive/80"
                          data-testid={`button-delete-proxy-${proxy.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {!proxyLinks?.length && !proxyLoading && (
                <p className="text-muted-foreground text-center py-8">No proxy links yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Feedback */}
        <Card className="glass-effect border-border">
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-6">Recent Feedback</h2>
            <div className="space-y-4">
              {feedback?.slice(0, 5).map((item) => (
                <div key={item.id} className="bg-secondary/50 rounded-lg p-4 border border-border" data-testid={`card-feedback-${item.id}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-foreground">{item.name || "Anonymous"}</span>
                      <Badge variant="outline">{item.type}</Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{item.message}</p>
                  {item.email && (
                    <p className="text-sm text-accent mt-2">{item.email}</p>
                  )}
                </div>
              ))}
              {!feedback?.length && (
                <p className="text-muted-foreground text-center py-8">No feedback submitted yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
