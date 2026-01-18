import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Auth tables (users and sessions)
export * from "./models/auth";

// Build Sessions - tracks AI code generation requests
export const buildSessions = pgTable("build_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id"), // Owner of the build session
  userPrompt: text("user_prompt").notNull(),
  translatedPrompt: text("translated_prompt"),
  linguisticsData: jsonb("linguistics_data"), // Stores detected slang terms
  provider: text("provider").notNull(), // 'gemini', 'claude', 'openai'
  model: text("model").notNull(),
  status: text("status").notNull().default('pending'), // pending, analyzing, generating, complete, error
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  completedAt: timestamp("completed_at"),
});

// Generated Files - stores the code output
export const generatedFiles = pgTable("generated_files", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => buildSessions.id, { onDelete: "cascade" }),
  path: text("path").notNull(),
  content: text("content").notNull(),
  language: text("language").notNull(), // 'typescript', 'javascript', 'json', etc.
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Build Logs - terminal output simulation
export const buildLogs = pgTable("build_logs", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => buildSessions.id, { onDelete: "cascade" }),
  agent: text("agent"), // 'Architect', 'Frontend Agent', etc.
  message: text("message").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// File Versions - tracks version history for undo/redo
export const fileVersions = pgTable("file_versions", {
  id: serial("id").primaryKey(),
  fileId: integer("file_id").notNull().references(() => generatedFiles.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  version: integer("version").notNull().default(1),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Chat conversations for AI integrations
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Rate Limits - persistent rate limiting
export const rateLimits = pgTable("rate_limits", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique(),
  requestCount: integer("request_count").notNull().default(0),
  windowStart: timestamp("window_start").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Dynamic Slang Terms - self-learning linguistics database
export const dynamicSlang = pgTable("dynamic_slang", {
  id: serial("id").primaryKey(),
  term: text("term").notNull().unique(), // The slang term
  meaning: text("meaning").notNull(), // The translation/definition
  category: text("category").notNull(), // GEN_Z, AAVE, TECH, etc.
  source: text("source").notNull(), // 'genius', 'urbandictionary', 'gemini', 'user'
  sourceUrl: text("source_url"), // Link to song lyrics, UD page, etc.
  sourceMetadata: jsonb("source_metadata"), // Song name, artist, year, etc.
  confidence: integer("confidence").notNull().default(80), // 0-100
  usageCount: integer("usage_count").notNull().default(1), // How many times detected
  lastUsed: timestamp("last_used").default(sql`CURRENT_TIMESTAMP`).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Insert schemas
export const insertBuildSessionSchema = createInsertSchema(buildSessions).omit({ id: true, createdAt: true, completedAt: true });
export const insertGeneratedFileSchema = createInsertSchema(generatedFiles).omit({ id: true, createdAt: true });
export const insertBuildLogSchema = createInsertSchema(buildLogs).omit({ id: true, createdAt: true });
export const insertFileVersionSchema = createInsertSchema(fileVersions).omit({ id: true, createdAt: true });
export const insertRateLimitSchema = createInsertSchema(rateLimits).omit({ id: true });
export const insertConversationSchema = createInsertSchema(conversations).omit({ id: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export const insertDynamicSlangSchema = createInsertSchema(dynamicSlang).omit({ id: true, createdAt: true, lastUsed: true });

// Types
export type BuildSession = typeof buildSessions.$inferSelect;
export type InsertBuildSession = z.infer<typeof insertBuildSessionSchema>;
export type GeneratedFile = typeof generatedFiles.$inferSelect;
export type InsertGeneratedFile = z.infer<typeof insertGeneratedFileSchema>;
export type BuildLog = typeof buildLogs.$inferSelect;
export type InsertBuildLog = z.infer<typeof insertBuildLogSchema>;
export type FileVersion = typeof fileVersions.$inferSelect;
export type InsertFileVersion = z.infer<typeof insertFileVersionSchema>;
export type RateLimit = typeof rateLimits.$inferSelect;
export type InsertRateLimit = z.infer<typeof insertRateLimitSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type DynamicSlang = typeof dynamicSlang.$inferSelect;
export type InsertDynamicSlang = z.infer<typeof insertDynamicSlangSchema>;
