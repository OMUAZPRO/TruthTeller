import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { verifyStatementHandler, getStatementsHandler, getStatementHandler } from "./handlers/verifyStatement";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for fact-checking application
  const apiRouter = app.route('/api');
  
  // Verify statement endpoint
  app.post('/api/verify', verifyStatementHandler);
  
  // Get all statements
  app.get('/api/statements', getStatementsHandler);
  
  // Get statement by ID
  app.get('/api/statements/:id', getStatementHandler);
  
  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
