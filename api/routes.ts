import { createServer } from "http";
import { insertProxyLinkSchema, insertAnnouncementSchema, insertFeedbackSchema } from "../shared/schema.js";
import { setupAuth } from "./auth.js";
import { storage } from "./storage.js";

function requireAdmin(req, res, next) {
  if (!req.isAuthenticated() || req.user?.username !== "Titanmaster") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

export async function registerRoutes(app) {
  setupAuth(app);

  app.get("/api/proxy-links", async (req, res) => {
    try {
      const proxyLinks = await storage.getProxyLinks();
      res.json(proxyLinks);
    } catch {
      res.status(500).json({ message: "Failed to fetch proxy links" });
    }
  });

  app.get("/api/proxy-links/active", async (req, res) => {
    try {
      const proxyLinks = await storage.getActiveProxyLinks();
      res.json(proxyLinks);
    } catch {
      res.status(500).json({ message: "Failed to fetch active proxy links" });
    }
  });

  app.post("/api/proxy-links", requireAdmin, async (req, res) => {
    try {
      const result = insertProxyLinkSchema.safeParse(req.body);
      if (!result.success) return res.status(400).json({ message: "Invalid proxy link data" });
      const proxyLink = await storage.createProxyLink(result.data);
      res.status(201).json(proxyLink);
    } catch {
      res.status(500).json({ message: "Failed to create proxy link" });
    }
  });

  app.patch("/api/proxy-links/:id", requireAdmin, async (req, res) => {
    try {
      const proxyLink = await storage.updateProxyLink(req.params.id, req.body);
      if (!proxyLink) return res.status(404).json({ message: "Proxy link not found" });
      res.json(proxyLink);
    } catch {
      res.status(500).json({ message: "Failed to update proxy link" });
    }
  });

  app.delete("/api/proxy-links/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteProxyLink(req.params.id);
      if (!success) return res.status(404).json({ message: "Proxy link not found" });
      res.sendStatus(204);
    } catch {
      res.status(500).json({ message: "Failed to delete proxy link" });
    }
  });

  app.get("/api/announcements", async (req, res) => {
    try {
      const type = req.query.type;
      const announcements = type ? await storage.getAnnouncementsByType(type) : await storage.getAnnouncements();
      res.json(announcements);
    } catch {
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  app.post("/api/announcements", requireAdmin, async (req, res) => {
    try {
      const result = insertAnnouncementSchema.safeParse(req.body);
      if (!result.success) return res.status(400).json({ message: "Invalid announcement data" });
      const announcement = await storage.createAnnouncement(result.data);
      res.status(201).json(announcement);
    } catch {
      res.status(500).json({ message: "Failed to create announcement" });
    }
  });

  app.delete("/api/announcements/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteAnnouncement(req.params.id);
      if (!success) return res.status(404).json({ message: "Announcement not found" });
      res.sendStatus(204);
    } catch {
      res.status(500).json({ message: "Failed to delete announcement" });
    }
  });

  app.get("/api/feedback", requireAdmin, async (req, res) => {
    try {
      const feedback = await storage.getFeedback();
      res.json(feedback);
    } catch {
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });

  app.post("/api/feedback", async (req, res) => {
    try {
      const result = insertFeedbackSchema.safeParse(req.body);
      if (!result.success) return res.status(400).json({ message: "Invalid feedback data" });
      const feedback = await storage.createFeedback(result.data);
      res.status(201).json(feedback);
    } catch {
      res.status(500).json({ message: "Failed to submit feedback" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
