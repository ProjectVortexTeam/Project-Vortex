// api/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import { scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage.js";

const scryptAsync = promisify(scrypt);

export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: any) {
  const sessionSettings = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy(async (username, password, done) => {
    const user = await storage.getUserByUsername(username);
    if(!user || !(await comparePasswords(password, user.password))) return done(null,false);
    done(null,user);
  }));

  passport.serializeUser((user:any, done) => done(null,user.id));
  passport.deserializeUser(async (id:string, done:any) => { const user = await storage.getUser(id); done(null,user); });

  app.post("/api/register", async (_req,res)=>res.status(403).json({message:"Registration is disabled. Admin access only."}));
  app.post("/api/login", passport.authenticate("local"), (req,res)=>res.status(200).json(req.user));
  app.post("/api/logout", (req,res,next)=>req.logout(err=>err?next(err):res.sendStatus(200)));
  app.get("/api/user", (req,res)=>!req.isAuthenticated()?res.sendStatus(401):res.json(req.user));
}
