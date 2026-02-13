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
  const assetsPath = path.resolve(distPath, "assets");

  // Some shared-host proxies rewrite paths in ways that break express.static
  // matching for module assets. This direct resolver guarantees JS/CSS files
  // under /assets are served with the correct MIME type.
  app.use((req, res, next) => {
    let assetRelativePath: string | null = null;
    if (req.path.startsWith(`${appBasePath}/assets/`)) {
      assetRelativePath = req.path.slice(`${appBasePath}/assets/`.length);
    } else if (req.path.startsWith("/assets/")) {
      assetRelativePath = req.path.slice("/assets/".length);
    }

    if (!assetRelativePath) return next();

    const resolved = path.resolve(assetsPath, assetRelativePath);
    if (!resolved.startsWith(assetsPath)) {
      return res.status(400).end();
    }
    if (!fs.existsSync(resolved)) {
      return res.status(404).end();
    }
    return res.sendFile(resolved);
  });

  // Serve static assets for both root and sub-path deployments.
  app.use(express.static(distPath));
  app.use(appBasePath, express.static(distPath));
  app.use("/assets", express.static(assetsPath));
  app.use(`${appBasePath}/assets`, express.static(assetsPath));

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
