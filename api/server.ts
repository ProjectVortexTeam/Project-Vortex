import express from "express";
import cors from "cors";
import registerRoutes from "../server/routes"; // your old routes
import { VercelRequest, VercelResponse } from "@vercel/node";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
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

const handler = async (req: VercelRequest, res: VercelResponse) => {
  const server = await registerRoutes(app);
  app(req as any, res as any);
};

export default handler;
