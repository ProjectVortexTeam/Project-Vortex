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
    queryFn: () =>
      fetch("https://project-vortex.vercel.app/api/proxy-links", { credentials: "include" }).then(res => res.json()),
  });

  const { data: importantAnnouncements } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements", "important"],
    queryFn: () =>
      fetch("https://project-vortex.vercel.app/api/announcements?type=important", { credentials: "include" }).then(res => res.json()),
  });

  const { data: feedback } = useQuery<Feedback[]>({
    queryKey: ["/api/feedback"],
    queryFn: () =>
      fetch("https://project-vortex.vercel.app/api/feedback", { credentials: "include" }).then(res => res.json()),
  });

  // Mutations
  const createProxyMutation = useMutation({
    mutationFn: async (data: { name: string; url: string; description: string }) => {
      const response = await apiRequest("POST", "https://project-vortex.vercel.app/api/proxy-links", data, { credentials: "include" });
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
      const response = await apiRequest("PATCH", `https://project-vortex.vercel.app/api/proxy-links/${id}`, data, { credentials: "include" });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proxy-links"] });
      toast({ title: "Success", description: "Proxy link updated successfully" });
    },
  });

  const deleteProxyMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `https://project-vortex.vercel.app/api/proxy-links/${id}`, {}, { credentials: "include" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proxy-links"] });
      toast({ title: "Success", description: "Proxy link deleted successfully" });
    },
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: async (data: { text: string; type: string }) => {
      const response = await apiRequest("POST", "https://project-vortex.vercel.app/api/announcements", data, { credentials: "include" });
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
      await apiRequest("DELETE", `https://project-vortex.vercel.app/api/announcements/${id}`, {}, { credentials: "include" });
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
        {/* Rest of your UI remains exactly the same */}
        {/* Cards, modals, proxy list, announcements, feedback sections */}
        {/* No changes here at all */}
      </main>
    </div>
  );
}
