// api/routes.ts
import { createServer } from "http";
import { storage } from "./storage.js";
import { setupAuth } from "./auth.js";
import { insertProxyLinkSchema, insertAnnouncementSchema, insertFeedbackSchema } from "../shared/schema.js";

function requireAdmin(req:any,res:any,next:any){
  if(!req.isAuthenticated() || req.user?.username !== "Titanmaster") return res.status(403).json({message:"Admin access required"});
  next();
}

export async function registerRoutes(app:any){
  setupAuth(app);

  app.get("/api/proxy-links", async (req,res)=>{ try{ res.json(await storage.getProxyLinks()); }catch(e){ res.status(500).json({message:"Failed to fetch proxy links"}); }});
  app.get("/api/proxy-links/active", async (req,res)=>{ try{ res.json(await storage.getActiveProxyLinks()); }catch(e){ res.status(500).json({message:"Failed to fetch active proxy links"}); }});
  app.post("/api/proxy-links", requireAdmin, async (req,res)=>{ try{ const result=insertProxyLinkSchema.safeParse(req.body); if(!result.success) return res.status(400).json({message:"Invalid proxy link data"}); res.status(201).json(await storage.createProxyLink(result.data)); }catch(e){ res.status(500).json({message:"Failed to create proxy link"}); }});
  app.patch("/api/proxy-links/:id", requireAdmin, async (req,res)=>{ try{ const proxy = await storage.updateProxyLink(req.params.id, req.body); if(!proxy) return res.status(404).json({message:"Proxy link not found"}); res.json(proxy); }catch(e){ res.status(500).json({message:"Failed to update proxy link"}); }});
  app.delete("/api/proxy-links/:id", requireAdmin, async (req,res)=>{ try{ const success = await storage.deleteProxyLink(req.params.id); if(!success) return res.status(404).json({message:"Proxy link not found"}); res.sendStatus(204); }catch(e){ res.status(500).json({message:"Failed to delete proxy link"}); }});

  app.get("/api/announcements", async (req,res)=>{ try{ const type=req.query.type; const a = type? await storage.getAnnouncementsByType(type) : await storage.getAnnouncements(); res.json(a); }catch(e){ res.status(500).json({message:"Failed to fetch announcements"}); }});
  app.post("/api/announcements", requireAdmin, async (req,res)=>{ try{ const result=insertAnnouncementSchema.safeParse(req.body); if(!result.success) return res.status(400).json({message:"Invalid announcement data"}); res.status(201).json(await storage.createAnnouncement(result.data)); }catch(e){ res.status(500).json({message:"Failed to create announcement"}); }});
  app.delete("/api/announcements/:id", requireAdmin, async (req,res)=>{ try{ const success = await storage.deleteAnnouncement(req.params.id); if(!success) return res.status(404).json({message:"Announcement not found"}); res.sendStatus(204); }catch(e){ res.status(500).json({message:"Failed to delete announcement"}); }});

  app.get("/api/feedback", requireAdmin, async (req,res)=>{ try{ res.json(await storage.getFeedback()); }catch(e){ res.status(500).json({message:"Failed to fetch feedback"}); }});
  app.post("/api/feedback", async (req,res)=>{ try{ const result=insertFeedbackSchema.safeParse(req.body); if(!result.success) return res.status(400).json({message:"Invalid feedback data"}); res.status(201).json(await storage.createFeedback(result.data)); }catch(e){ res.status(500).json({message:"Failed to submit feedback"}); }});

  return createServer(app);
}
