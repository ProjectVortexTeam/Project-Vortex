import { useBackendData } from "@/hooks/useBackendData";
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

  // Fetch backend test data
  const { data: backendData, isLoading: backendLoading, error: backendError } = useQuery(["backendData"], async () => {
    const res = await fetch("https://project-vortex.vercel.app/data"); // <- your backend
    if (!res.ok) throw new Error("Network error");
    return res.json();
  });

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

        {/* BACKEND DATA SECTION */}
        <Card className="glass-effect border-border mb-8">
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Backend Test Data</h2>
            {backendLoading && <p>Loading backend data...</p>}
            {backendError && <p>Error fetching backend data</p>}
            {backendData && <p>{backendData.message}</p>}
          </CardContent>
        </Card>

        {/* The rest of your original homepage content */}
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
        {/* ...existing announcement Card section remains exactly the same... */}

        {/* Proxy Links Management */}
        {/* ...existing proxy links Card section remains exactly the same... */}

        {/* Recent Feedback */}
        {/* ...existing feedback Card section remains exactly the same... */}

      </main>
    </div>
  );
}
