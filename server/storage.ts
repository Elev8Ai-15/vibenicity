import { db } from "./db";
import { 
  buildSessions, 
  generatedFiles, 
  buildLogs,
  fileVersions,
  rateLimits,
  type InsertBuildSession,
  type InsertGeneratedFile,
  type InsertBuildLog,
  type InsertFileVersion,
  type BuildSession,
  type GeneratedFile,
  type BuildLog,
  type FileVersion,
  type RateLimit
} from "@shared/schema";
import { eq, desc, and, max, sql } from "drizzle-orm";

export interface IStorage {
  // Build sessions
  createBuildSession(session: InsertBuildSession): Promise<BuildSession>;
  getBuildSession(id: number): Promise<BuildSession | undefined>;
  updateBuildSessionStatus(id: number, status: string, completedAt?: Date): Promise<void>;
  getRecentBuildSessions(userId: string, limit: number): Promise<BuildSession[]>;
  
  // Generated files
  createGeneratedFile(file: InsertGeneratedFile): Promise<GeneratedFile>;
  getFilesBySession(sessionId: number): Promise<GeneratedFile[]>;
  
  // Build logs
  createBuildLog(log: InsertBuildLog): Promise<BuildLog>;
  getLogsBySession(sessionId: number): Promise<BuildLog[]>;
  
  // File versions
  createFileVersion(version: InsertFileVersion): Promise<FileVersion>;
  getFileVersions(fileId: number): Promise<FileVersion[]>;
  getFileVersion(fileId: number, version: number): Promise<FileVersion | undefined>;
  updateFileContent(fileId: number, content: string): Promise<GeneratedFile>;
  getFileOwner(fileId: number): Promise<string | null>;
  
  // Rate limiting
  checkAndIncrementRateLimit(userId: string, limit: number, windowMs: number): Promise<{ allowed: boolean; remaining: number }>;
  
  // Analytics
  getUserBuildStats(userId: string): Promise<{ 
    totalBuilds: number; 
    successfulBuilds: number; 
    failedBuilds: number; 
    recentBuilds: BuildSession[];
    providerUsage: Record<string, number>;
  }>;
}

class DatabaseStorage implements IStorage {
  async createBuildSession(session: InsertBuildSession): Promise<BuildSession> {
    const [result] = await db.insert(buildSessions).values(session).returning();
    return result;
  }

  async getBuildSession(id: number): Promise<BuildSession | undefined> {
    const [result] = await db.select().from(buildSessions).where(eq(buildSessions.id, id));
    return result;
  }

  async updateBuildSessionStatus(id: number, status: string, completedAt?: Date): Promise<void> {
    await db.update(buildSessions)
      .set({ status, completedAt })
      .where(eq(buildSessions.id, id));
  }

  async getRecentBuildSessions(userId: string, limit: number): Promise<BuildSession[]> {
    return db.select().from(buildSessions)
      .where(eq(buildSessions.userId, userId))
      .orderBy(desc(buildSessions.createdAt))
      .limit(limit);
  }

  async createGeneratedFile(file: InsertGeneratedFile): Promise<GeneratedFile> {
    const [result] = await db.insert(generatedFiles).values(file).returning();
    await db.insert(fileVersions).values({
      fileId: result.id,
      content: file.content,
      version: 0
    });
    return result;
  }

  async getFilesBySession(sessionId: number): Promise<GeneratedFile[]> {
    return db.select().from(generatedFiles).where(eq(generatedFiles.sessionId, sessionId));
  }

  async createBuildLog(log: InsertBuildLog): Promise<BuildLog> {
    const [result] = await db.insert(buildLogs).values(log).returning();
    return result;
  }

  async getLogsBySession(sessionId: number): Promise<BuildLog[]> {
    return db.select().from(buildLogs)
      .where(eq(buildLogs.sessionId, sessionId))
      .orderBy(buildLogs.createdAt);
  }

  async createFileVersion(version: InsertFileVersion): Promise<FileVersion> {
    const [result] = await db.insert(fileVersions).values(version).returning();
    return result;
  }

  async getFileVersions(fileId: number): Promise<FileVersion[]> {
    return db.select().from(fileVersions)
      .where(eq(fileVersions.fileId, fileId))
      .orderBy(desc(fileVersions.version));
  }

  async getFileVersion(fileId: number, version: number): Promise<FileVersion | undefined> {
    const [result] = await db.select().from(fileVersions)
      .where(and(eq(fileVersions.fileId, fileId), eq(fileVersions.version, version)));
    return result;
  }

  async updateFileContent(fileId: number, content: string): Promise<GeneratedFile> {
    const [file] = await db.select().from(generatedFiles).where(eq(generatedFiles.id, fileId));
    if (!file) throw new Error('File not found');
    
    const versions = await this.getFileVersions(fileId);
    const nextVersion = versions.length > 0 ? versions[0].version + 1 : 1;
    
    await this.createFileVersion({ fileId, content: file.content, version: nextVersion });
    
    const [updated] = await db.update(generatedFiles)
      .set({ content })
      .where(eq(generatedFiles.id, fileId))
      .returning();
    return updated;
  }

  async getFileOwner(fileId: number): Promise<string | null> {
    const result = await db
      .select({ userId: buildSessions.userId })
      .from(generatedFiles)
      .innerJoin(buildSessions, eq(generatedFiles.sessionId, buildSessions.id))
      .where(eq(generatedFiles.id, fileId));
    return result[0]?.userId || null;
  }

  async checkAndIncrementRateLimit(userId: string, limit: number, windowMs: number): Promise<{ allowed: boolean; remaining: number }> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - windowMs);
    
    const [existing] = await db.select().from(rateLimits).where(eq(rateLimits.userId, userId));
    
    if (!existing) {
      await db.insert(rateLimits).values({ userId, requestCount: 1, windowStart: now });
      return { allowed: true, remaining: limit - 1 };
    }
    
    if (existing.windowStart < windowStart) {
      await db.update(rateLimits)
        .set({ requestCount: 1, windowStart: now })
        .where(eq(rateLimits.userId, userId));
      return { allowed: true, remaining: limit - 1 };
    }
    
    if (existing.requestCount >= limit) {
      return { allowed: false, remaining: 0 };
    }
    
    await db.update(rateLimits)
      .set({ requestCount: existing.requestCount + 1 })
      .where(eq(rateLimits.userId, userId));
    return { allowed: true, remaining: limit - existing.requestCount - 1 };
  }

  async getUserBuildStats(userId: string): Promise<{ 
    totalBuilds: number; 
    successfulBuilds: number; 
    failedBuilds: number; 
    recentBuilds: BuildSession[];
    providerUsage: Record<string, number>;
  }> {
    const allBuilds = await db.select()
      .from(buildSessions)
      .where(eq(buildSessions.userId, userId))
      .orderBy(desc(buildSessions.createdAt));
    
    const totalBuilds = allBuilds.length;
    const successfulBuilds = allBuilds.filter(b => b.status === 'complete').length;
    const failedBuilds = allBuilds.filter(b => b.status === 'error').length;
    const recentBuilds = allBuilds.slice(0, 10);
    
    const providerUsage: Record<string, number> = {};
    allBuilds.forEach(b => {
      providerUsage[b.provider] = (providerUsage[b.provider] || 0) + 1;
    });
    
    return { totalBuilds, successfulBuilds, failedBuilds, recentBuilds, providerUsage };
  }
}

export const storage = new DatabaseStorage();
