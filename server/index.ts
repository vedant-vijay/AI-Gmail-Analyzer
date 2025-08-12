import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  authenticatedGetEmails,
  authenticatedGetImportantEmails,
  authenticatedSearchEmails,
  authenticatedGetAccounts,
  authenticatedSyncEmails,
  authenticatedGetEmailInsights
} from "./routes/emails";
import {
  handleGoogleAuth,
  handleGoogleCallback,
  handleVerifyToken,
  handleLogout
} from "./routes/auth";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Authentication routes
  app.get("/api/auth/google", handleGoogleAuth);
  app.get("/api/auth/google/callback", handleGoogleCallback);
  app.post("/api/auth/verify", handleVerifyToken);
  app.post("/api/auth/logout", handleLogout);

  // Protected Email Assistant API routes
  app.get("/api/emails", authenticatedGetEmails);
  app.get("/api/emails/important", authenticatedGetImportantEmails);
  app.get("/api/emails/search", authenticatedSearchEmails);
  app.get("/api/emails/insights", authenticatedGetEmailInsights);
  app.get("/api/accounts", authenticatedGetAccounts);
  app.post("/api/emails/sync", authenticatedSyncEmails);

  return app;
}
