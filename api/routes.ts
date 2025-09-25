import { storage } from "./storage.js";
import { setupAuth } from "./auth.js";
import { createServer } from "http";
import * as schema from "../shared/schema.js";

export function requireAdmin(req: any, res: any, next: any) {
  if (!req.isAuthenticated() || req.user?.username !== "Titanmaster") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

export async function registerRoutes(app: any) {
  setupAuth(app);

  app.get("/api/proxy-links", async (_req, res) => {
    try { res.json(await storage.getProxyLinks()); }
    catch { res.status(500).json({ message: "Failed to fetch proxy links" }); }
  });

  app.get("/api/proxy-links/active", async (_req, res) => {
    try { res.json(await storage.getActiveProxyLinks()); }
    catch { res.status(500).json({ message: "Failed to fetch active proxy links" }); }
  });

  app.post("/api/proxy-links", requireAdmin, async (req, res) => {
    const result = schema.insertProxyLinkSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ message: "Invalid proxy link data" });
    try { res.status(201).json(await storage.createProxyLink(result.data)); }
    catch { res.status(500).json({ message: "Failed to create proxy link" }); }
  });

  app.patch("/api/proxy-links/:id", requireAdmin, async (req, res) => {
    try {
      const proxyLink = await storage.updateProxyLink(req.params.id, req.body);
      if (!proxyLink) return res.status(404).json({ message: "Proxy link not found" });
      res.json(proxyLink);
    } catch { res.status(500).json({ message: "Failed to update proxy link" }); }
  });

  app.delete("/api/proxy-links/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteProxyLink(req.params.id);
      if (!success) return res.status(404).json({ message: "Proxy link not found" });
      res.sendStatus(204);
    } catch { res.status(500).json({ message: "Failed to delete proxy link" }); }
  });

  app.get("/api/announcements", async (req, res) => {
    try {
      const type = req.query.type;
      const announcements = type ? await storage.getAnnouncementsByType(type) : await storage.getAnnouncements();
      res.json(announcements);
    } catch { res.status(500).json({ message: "Failed to fetch announcements" }); }
  });

  app.post("/api/announcements", requireAdmin, async (req, res) => {
    const result = schema.insertAnnouncementSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ message: "Invalid announcement data" });
    try { res.status(201).json(await storage.createAnnouncement(result.data)); }
    catch { res.status(500).json({ message: "Failed to create announcement" }); }
  });

  app.delete("/api/announcements/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteAnnouncement(req.params.id);
      if (!success) return res.status(404).json({ message: "Announcement not found" });
      res.sendStatus(204);
    } catch { res.status(500).json({ message: "Failed to delete announcement" }); }
  });

  app.get("/api/feedback", requireAdmin, async (_req, res) => {
    try { res.json(await storage.getFeedback()); }
    catch { res.status(500).json({ message: "Failed to fetch feedback" }); }
  });

  app.post("/api/feedback", async (req, res) => {
    const result = schema.insertFeedbackSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ message: "Invalid feedback data" });
    try { res.status(201).json(await storage.createFeedback(result.data)); }
    catch { res.status(500).json({ message: "Failed to submit feedback" }); }
  });

  return createServer(app);
}
