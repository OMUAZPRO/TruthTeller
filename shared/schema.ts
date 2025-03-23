import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table (keeping this from original schema)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Statements table for fact-checked statements
export const statements = pgTable("statements", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  context: text("context"),
  explanation: text("explanation").notNull(),
  detailed_analysis: text("detailed_analysis"),
  truth_score: integer("truth_score").notNull(), // 0-10 scale
  verified_at: timestamp("verified_at").notNull().defaultNow(),
});

export const sources = pgTable("sources", {
  id: serial("id").primaryKey(),
  statement_id: integer("statement_id").notNull(),
  name: text("name").notNull(),
  year: text("year"),
  excerpt: text("excerpt").notNull(),
  url: text("url"),
});

// Schema for inserting a new statement
export const insertStatementSchema = createInsertSchema(statements).omit({
  id: true,
  verified_at: true,
});

// Schema for statement verification request
export const statementVerificationSchema = z.object({
  text: z.string().min(5, "Statement must be at least 5 characters long"),
  context: z.string().optional(),
});

// Schema for inserting a source
export const insertSourceSchema = createInsertSchema(sources).omit({
  id: true,
});

export type InsertStatement = z.infer<typeof insertStatementSchema>;
export type Statement = typeof statements.$inferSelect;
export type InsertSource = z.infer<typeof insertSourceSchema>;
export type Source = typeof sources.$inferSelect;
export type StatementVerificationRequest = z.infer<typeof statementVerificationSchema>;
