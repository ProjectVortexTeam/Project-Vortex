import express from "express";
import cors from "cors";
import { createServer } from "http";
import { registerRoutes } from "./routes.js"; // Note the .js extension

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse;
  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      if (logLine.length > 80) logLine = logLine.slice(0, 79) + "…";
      console.log(logLine);
    }
  });
  next();
});

async function startServer() {
  const server = await registerRoutes(app);

  app.get("/data", (_req, res) => {
    res.json({
      message: "Hello from Project Vortex backend!",
      timestamp: new Date(),
    });
  });

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({ port, host: "0.0.0.0", reusePort: true }, () => {
    console.log(`Serving on port ${port}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
