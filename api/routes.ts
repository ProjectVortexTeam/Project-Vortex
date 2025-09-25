import { insertProxyLinkSchema, insertAnnouncementSchema, insertFeedbackSchema } from "@shared/schema.js"; // use .js
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import storage from "./storage.js"; // adjust path
import express from "express";
import session from "express-session";
import { promisify } from "util";
import { scrypt, timingSafeEqual } from "crypto";

const scryptAsync = promisify(scrypt);

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export default async function registerRoutes(app: express.Express) {
  // session & passport setup
  app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false, store: storage.sessionStore }));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy(async (username, password, done) => {
    const user = await storage.getUserByUsername(username);
    if (!user || !await comparePasswords(password, user.password)) return done(null, false);
    return done(null, user);
  }));

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });

  function requireAdmin(req: any, res: any, next: any) {
    if (!req.isAuthenticated() || req.user?.username !== "Titanmaster") return res.status(403).json({ message: "Admin access required" });
    next();
  }

  // API routes (proxy-links, announcements, feedback)
  app.get("/api/proxy-links", async (req, res) => {
    res.json(await storage.getProxyLinks());
  });
  app.get("/api/proxy-links/active", async (req, res) => {
    res.json(await storage.getActiveProxyLinks());
  });
  app.post("/api/proxy-links", requireAdmin, async (req, res) => {
    const result = insertProxyLinkSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ message: "Invalid proxy link data" });
    res.status(201).json(await storage.createProxyLink(result.data));
  });
  app.patch("/api/proxy-links/:id", requireAdmin, async (req, res) => {
    const updated = await storage.updateProxyLink(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: "Proxy link not found" });
    res.json(updated);
  });
  app.delete("/api/proxy-links/:id", requireAdmin, async (req, res) => {
    const success = await storage.deleteProxyLink(req.params.id);
    if (!success) return res.status(404).json({ message: "Proxy link not found" });
    res.sendStatus(204);
  });

  // Announcements
  app.get("/api/announcements", async (req, res) => {
    const type = req.query.type as string;
    const announcements = type ? await storage.getAnnouncementsByType(type) : await storage.getAnnouncements();
    res.json(announcements);
  });
  app.post("/api/announcements", requireAdmin, async (req, res) => {
    const result = insertAnnouncementSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ message: "Invalid announcement data" });
    res.status(201).json(await storage.createAnnouncement(result.data));
  });
  app.delete("/api/announcements/:id", requireAdmin, async (req, res) => {
    const success = await storage.deleteAnnouncement(req.params.id);
    if (!success) return res.status(404).json({ message: "Announcement not found" });
    res.sendStatus(204);
  });

  // Feedback
  app.get("/api/feedback", requireAdmin, async (req, res) => res.json(await storage.getFeedback()));
  app.post("/api/feedback", async (req, res) => {
    const result = insertFeedbackSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ message: "Invalid feedback data" });
    res.status(201).json(await storage.createFeedback(result.data));
  });
}
