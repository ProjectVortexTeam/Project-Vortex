import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Announcement } from "@shared/schema";
import Navigation from "@/components/ui/navigation";

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [generalFormOpen, setGeneralFormOpen] = useState(false);

  const { data: importantAnnouncements } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements", "important"],
    queryFn: () => fetch("/api/announcements?type=important").then(res => res.json()),
  });

  const { data: generalAnnouncements } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements", "general"],
    queryFn: () => fetch("/api/announcements?type=general").then(res => res.json()),
  });

  const createGeneralAnnouncementMutation = useMutation({
    mutationFn: async (data: { text: string; type: string }) => {
      const response = await apiRequest("POST", "/api/announcements", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      setGeneralFormOpen(false);
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

  const handleGeneralAnnouncementSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      text: formData.get("text") as string,
      type: "general",
    };
    createGeneralAnnouncementMutation.mutate(data);
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-slide-up">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" data-testid="text-page-title">All Announcements</h1>
          <p className="text-muted-foreground">Stay updated with the latest news and updates</p>
        </div>

        <div className="space-y-6">
          {/* Important Announcements */}
          <Card className="glass-effect border-border">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <span className="w-2 h-2 bg-accent rounded-full mr-3 animate-pulse-slow"></span>
                Important Announcements
              </h2>
              <div className="space-y-4">
                {importantAnnouncements?.map((announcement) => (
                  <div key={announcement.id} className="bg-secondary/30 rounded-lg p-4 border-l-4 border-accent" data-testid={`important-announcement-${announcement.id}`}>
                    <p className="text-foreground">{announcement.text}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                {!importantAnnouncements?.length && (
                  <p className="text-muted-foreground text-center py-8">No important announcements yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* General Announcements */}
          <Card className="glass-effect border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">General Announcements</h2>
                {user && (
                  <Dialog open={generalFormOpen} onOpenChange={setGeneralFormOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-add-general-announcement">
                        Add Announcement
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-effect border-border">
                      <DialogHeader>
                        <DialogTitle>Add General Announcement</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleGeneralAnnouncementSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="general-announcement-text">Announcement Text</Label>
                          <Textarea
                            id="general-announcement-text"
                            name="text"
                            placeholder="Enter announcement text..."
                            required
                            className="bg-input border-border"
                            data-testid="textarea-general-announcement"
                          />
                        </div>
                        <Button type="submit" disabled={createGeneralAnnouncementMutation.isPending} data-testid="button-submit-general-announcement">
                          {createGeneralAnnouncementMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Create Announcement
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              <div className="space-y-4">
                {generalAnnouncements?.map((announcement) => (
                  <div key={announcement.id} className="bg-secondary/50 rounded-lg p-4 border border-border" data-testid={`general-announcement-${announcement.id}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-foreground">{announcement.text}</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {new Date(announcement.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {user && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteAnnouncementMutation.mutate(announcement.id)}
                          className="text-destructive hover:text-destructive/80"
                          data-testid={`button-delete-general-announcement-${announcement.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {!generalAnnouncements?.length && (
                  <p className="text-muted-foreground text-center py-8">No general announcements yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
