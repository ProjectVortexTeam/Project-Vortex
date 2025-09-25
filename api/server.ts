import express from "express";
import cors from "cors";
import registerRoutes from "./routes.js"; // use .js for ES module

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: any;
  const originalResJson = res.json.bind(res);

  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson(bodyJson, ...args);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      console.log(logLine.length > 80 ? logLine.slice(0, 79) + "…" : logLine);
    }
  });

  next();
});

// Add a simple test route
app.get("/data", (_req, res) => {
  res.json({ message: "Hello from Project Vortex backend!", timestamp: new Date() });
});

await registerRoutes(app);

// Export the Express app as the default Vercel serverless handler
export default app;
