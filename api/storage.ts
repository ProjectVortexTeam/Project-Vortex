// api/storage.js
import { randomUUID, scryptSync, randomBytes } from "crypto";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export class MemStorage {
  constructor() {
    this.users = new Map();
    this.proxyLinks = new Map();
    this.announcements = new Map();
    this.feedback = new Map();
    this.sessionStore = new MemoryStore({ checkPeriod: 864e5 });
    this.initializeData();
  }

  hashPasswordSync(password) {
    const salt = randomBytes(16).toString("hex");
    const buf = scryptSync(password, salt, 64);
    return `${buf.toString("hex")}.${salt}`;
  }

  initializeData() {
    const adminUser = {
      id: "admin-user-1",
      username: "Titanmaster",
      password: this.hashPasswordSync("Rygoobie2012!")
    };
    this.users.set(adminUser.id, adminUser);

    const sampleProxies = [
      { id: randomUUID(), name: "ProxyMesh", url: "https://proxymesh.com", description: "High-performance proxy network", active: true, createdAt: new Date() },
      { id: randomUUID(), name: "HideMyAss", url: "https://hidemyass-freeproxy.com", description: "Free web proxy service", active: true, createdAt: new Date() },
      { id: randomUUID(), name: "ProxySite", url: "https://proxysite.com", description: "Anonymous proxy browser", active: true, createdAt: new Date() }
    ];
    sampleProxies.forEach(proxy => this.proxyLinks.set(proxy.id, proxy));

    const sampleAnnouncements = [
      { id: randomUUID(), text: "Welcome to Vortex Proxies! New proxy links added weekly.", type: "important", createdAt: new Date() },
      { id: randomUUID(), text: "Regular maintenance scheduled for weekends. Service may be temporarily unavailable.", type: "general", createdAt: new Date() }
    ];
    sampleAnnouncements.forEach(a => this.announcements.set(a.id, a));
  }

  async getUser(id) { return this.users.get(id); }
  async getUserByUsername(username) { return Array.from(this.users.values()).find(u => u.username === username); }
  async createUser(insertUser) { const id = randomUUID(); const user = { ...insertUser, id }; this.users.set(id, user); return user; }
  async getProxyLinks() { return Array.from(this.proxyLinks.values()).sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt)); }
  async getActiveProxyLinks() { return Array.from(this.proxyLinks.values()).filter(p=>p.active).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)); }
  async createProxyLink(insertProxyLink) { const id = randomUUID(); const proxyLink = { ...insertProxyLink, id, active: insertProxyLink.active ?? true, createdAt: new Date() }; this.proxyLinks.set(id, proxyLink); return proxyLink; }
  async updateProxyLink(id, updates) { const proxyLink = this.proxyLinks.get(id); if(!proxyLink) return; const updated = {...proxyLink,...updates}; this.proxyLinks.set(id, updated); return updated; }
  async deleteProxyLink(id) { return this.proxyLinks.delete(id); }
  async getAnnouncements() { return Array.from(this.announcements.values()).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)); }
  async getAnnouncementsByType(type) { return Array.from(this.announcements.values()).filter(a=>a.type===type).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)); }
  async createAnnouncement(insertAnnouncement) { const id = randomUUID(); const announcement = { ...insertAnnouncement, id, createdAt: new Date() }; this.announcements.set(id, announcement); return announcement; }
  async deleteAnnouncement(id) { return this.announcements.delete(id); }
  async getFeedback() { return Array.from(this.feedback.values()).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)); }
  async createFeedback(insertFeedback) { const id = randomUUID(); const feedback = { ...insertFeedback, id, name: insertFeedback.name || null, email: insertFeedback.email || null, createdAt: new Date() }; this.feedback.set(id, feedback); return feedback; }
}

export const storage = new MemStorage();
