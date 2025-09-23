import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/ui/navigation";

export default function FeedbackPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    type: "",
    message: "",
  });

  const submitFeedbackMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/feedback", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Thank you!",
        description: "Your feedback has been submitted successfully.",
      });
      setFormData({ name: "", email: "", type: "", message: "" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.message) {
      toast({
        title: "Error",
        description: "Please fill in the required fields.",
        variant: "destructive",
      });
      return;
    }

    submitFeedbackMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-slide-up">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2" data-testid="text-page-title">Submit Feedback</h1>
            <p className="text-muted-foreground">Help us improve by suggesting new proxy links or reporting issues</p>
          </div>

          <Card className="glass-effect border-border">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <Label htmlFor="feedback-name" className="block text-sm font-medium text-foreground mb-2">
                      Name (Optional)
                    </Label>
                    <Input
                      id="feedback-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="w-full bg-input border-border focus:ring-ring focus:border-transparent"
                      data-testid="input-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="feedback-email" className="block text-sm font-medium text-foreground mb-2">
                      Email (Optional)
                    </Label>
                    <Input
                      id="feedback-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="w-full bg-input border-border focus:ring-ring focus:border-transparent"
                      data-testid="input-email"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="feedback-type" className="block text-sm font-medium text-foreground mb-2">
                    Feedback Type *
                  </Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                    <SelectTrigger className="w-full bg-input border-border" data-testid="select-type">
                      <SelectValue placeholder="Select feedback type" />
                    </SelectTrigger>
                    <SelectContent className="glass-effect border-border">
                      <SelectItem value="suggestion">Proxy Suggestion</SelectItem>
                      <SelectItem value="broken-link">Report Broken Link</SelectItem>
                      <SelectItem value="general">General Feedback</SelectItem>
                      <SelectItem value="bug">Bug Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="feedback-message" className="block text-sm font-medium text-foreground mb-2">
                    Message *
                  </Label>
                  <Textarea
                    id="feedback-message"
                    value={formData.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                    rows={6}
                    placeholder="Please provide details about your feedback, proxy links, or any issues you've encountered..."
                    className="w-full bg-input border-border focus:ring-ring focus:border-transparent resize-none"
                    data-testid="textarea-message"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 transform hover:scale-[1.02] transition-all duration-200"
                  disabled={submitFeedbackMutation.isPending}
                  data-testid="button-submit"
                >
                  {submitFeedbackMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Submit Feedback
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
