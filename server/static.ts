import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  const appBasePath = (process.env.APP_BASE_PATH || "/app").replace(/\/+$/, "");

  // Serve static assets for both root and sub-path deployments.
  app.use(express.static(distPath));
  app.use(appBasePath, express.static(distPath));

  const serveIndex = (req: express.Request, res: express.Response) => {
    // Never return HTML for asset-like requests (prevents JS MIME errors).
    if (/\.[a-z0-9]+$/i.test(req.path)) {
      return res.status(404).end();
    }
    res.sendFile(path.resolve(distPath, "index.html"));
  };

  // fall through to index.html if the file doesn't exist
  app.use(`${appBasePath}/{*path}`, serveIndex);
  app.use("/{*path}", serveIndex);
}
