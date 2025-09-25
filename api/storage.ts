import { type User, type InsertUser, type ProxyLink, type InsertProxyLink, type Announcement, type InsertAnnouncement, type Feedback, type InsertFeedback } from "../shared/schema";
import { randomUUID } from "crypto";
import session from "express-session";
import createMemoryStore from "memorystore";
import { scryptSync, randomBytes } from "crypto";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getProxyLinks(): Promise<ProxyLink[]>;
  getActiveProxyLinks(): Promise<ProxyLink[]>;
  createProxyLink(proxyLink: InsertProxyLink): Promise<ProxyLink>;
  updateProxyLink(id: string, updates: Partial<InsertProxyLink>): Promise<ProxyLink | undefined>;
  deleteProxyLink(id: string): Promise<boolean>;
  
  getAnnouncements(): Promise<Announcement[]>;
  getAnnouncementsByType(type: string): Promise<Announcement[]>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  deleteAnnouncement(id: string): Promise<boolean>;
  
  getFeedback(): Promise<Feedback[]>;
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private proxyLinks: Map<string, ProxyLink>;
  private announcements: Map<string, Announcement>;
  private feedback: Map<string, Feedback>;
  public sessionStore: session.Store;
  constructor() {
    this.users = new Map();
    this.proxyLinks = new Map();
    this.announcements = new Map();
    this.feedback = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    
    // Initialize with sample data
    this.initializeData();
  }

  private hashPasswordSync(password: string) {
    const salt = randomBytes(16).toString("hex");
    const buf = scryptSync(password, salt, 64) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
  }

  private initializeData() {
    // Add admin user with hardcoded credentials
    const adminUser: User = {
      id: "admin-user-1",
      username: "Titanmaster",
      password: this.hashPasswordSync("Rygoobie2012!"),
    };
    this.users.set(adminUser.id, adminUser);

    // Add some sample proxy links
    const sampleProxies: ProxyLink[] = [
      {
        id: randomUUID(),
        name: "ProxyMesh",
        url: "https://proxymesh.com",
        description: "High-performance proxy network",
        active: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "HideMyAss",
        url: "https://hidemyass-freeproxy.com",
        description: "Free web proxy service",
        active: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "ProxySite",
        url: "https://proxysite.com",
        description: "Anonymous proxy browser",
        active: true,
        createdAt: new Date(),
      },
    ];
    
    sampleProxies.forEach(proxy => this.proxyLinks.set(proxy.id, proxy));
    
    // Add sample announcements
    const sampleAnnouncements: Announcement[] = [
      {
        id: randomUUID(),
        text: "Welcome to Vortex Proxies! New proxy links added weekly.",
        type: "important",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        text: "Regular maintenance scheduled for weekends. Service may be temporarily unavailable.",
        type: "general",
        createdAt: new Date(),
      },
    ];
    
    sampleAnnouncements.forEach(announcement => this.announcements.set(announcement.id, announcement));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getProxyLinks(): Promise<ProxyLink[]> {
    return Array.from(this.proxyLinks.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getActiveProxyLinks(): Promise<ProxyLink[]> {
    return Array.from(this.proxyLinks.values())
      .filter(proxy => proxy.active)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createProxyLink(insertProxyLink: InsertProxyLink): Promise<ProxyLink> {
    const id = randomUUID();
    const proxyLink: ProxyLink = { 
      ...insertProxyLink, 
      id, 
      active: insertProxyLink.active ?? true,
      createdAt: new Date() 
    };
    this.proxyLinks.set(id, proxyLink);
    return proxyLink;
  }

  async updateProxyLink(id: string, updates: Partial<InsertProxyLink>): Promise<ProxyLink | undefined> {
    const proxyLink = this.proxyLinks.get(id);
    if (!proxyLink) return undefined;
    
    const updatedProxyLink = { ...proxyLink, ...updates };
    this.proxyLinks.set(id, updatedProxyLink);
    return updatedProxyLink;
  }

  async deleteProxyLink(id: string): Promise<boolean> {
    return this.proxyLinks.delete(id);
  }

  async getAnnouncements(): Promise<Announcement[]> {
    return Array.from(this.announcements.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getAnnouncementsByType(type: string): Promise<Announcement[]> {
    return Array.from(this.announcements.values())
      .filter(announcement => announcement.type === type)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createAnnouncement(insertAnnouncement: InsertAnnouncement): Promise<Announcement> {
    const id = randomUUID();
    const announcement: Announcement = { 
      ...insertAnnouncement, 
      id, 
      createdAt: new Date() 
    };
    this.announcements.set(id, announcement);
    return announcement;
  }

  async deleteAnnouncement(id: string): Promise<boolean> {
    return this.announcements.delete(id);
  }

  async getFeedback(): Promise<Feedback[]> {
    return Array.from(this.feedback.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const id = randomUUID();
    const feedback: Feedback = { 
      ...insertFeedback, 
      id, 
      name: insertFeedback.name || null,
      email: insertFeedback.email || null,
      createdAt: new Date() 
    };
    this.feedback.set(id, feedback);
    return feedback;
  }
}

export const storage = new MemStorage();
