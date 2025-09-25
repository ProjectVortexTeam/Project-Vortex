import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "../server/routes"; // re-use your existing routes

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Log API requests (same as before)
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const path = req.path;
  let capturedJson: any;

  const originalJson = res.json;
  res.json = function (body, ...args) {
    capturedJson = body;
    return originalJson.apply(res, [body, ...args]);
  };

  res.on("finish", () => {
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${Date.now() - start}ms`;
      if (capturedJson) logLine += ` :: ${JSON.stringify(capturedJson)}`;
      console.log(logLine.length > 80 ? logLine.slice(0, 79) + "…" : logLine);
    }
  });

  next();
});

// Error handler (keep same behavior)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
  throw err;
});

// Register your routes
(async () => {
  await registerRoutes(app);
})();

// ✅ Export Express app as Vercel handler
export default app;
