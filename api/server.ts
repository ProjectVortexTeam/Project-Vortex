import express from "express";
import cors from "cors";
import { registerRoutes } from "./routes.js"; // ES module import
import { createServer } from "http";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: any;

  const originalResJson = res.json.bind(res);
  res.json = function (body: any, ...args: any) {
    capturedJsonResponse = body;
    return originalResJson(body, ...args);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      if (logLine.length > 80) logLine = logLine.slice(0, 79) + "\u2026";
      console.log(logLine);
    }
  });

  next();
});

// Async IIFE to setup routes and start server
(async () => {
  const server = await registerRoutes(app);

  app.get("/data", (_req, res) => {
    res.json({
      message: "Hello from Project Vortex backend!",
      timestamp: new Date(),
    });
  });

  // Error handler
  app.use((err: any, _req: any, res: any, _next: any) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({ port, host: "0.0.0.0", reusePort: true }, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
})();
