import { integer, jsonb, pgTable, text, timestamp, varchar, serial, boolean, date, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================
// EXISTING TABLES (Users, Projects, Frames, Chats)
// ============================================

export const usersTable = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  credits: integer("credits").default(2),
});

export const projectTable = pgTable("projects", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  projectId: varchar("projectId").notNull().unique(),
  createdBy: varchar("createdBy").notNull(),
  createdOn: timestamp("createdOn").defaultNow(),
});

export const frameTable = pgTable("frames", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  frameId: varchar("frameId").notNull().unique(),
  designCode: text("designCode"),
  projectId: varchar("projectId").notNull(),
  createdOn: timestamp("createdOn").defaultNow(),
});

export const chatTable = pgTable("chats", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  chatMessage: jsonb("chatMessage").notNull(),
  frameId: varchar("frameId").notNull(),
  createdBy: varchar("createdBy").notNull(),
  createdOn: timestamp("createdOn").defaultNow(),
});

// ============================================
// KNESSET TABLES (New Political Tracking System)
// ============================================

export const knessetMembersTable = pgTable("knesset_members", {
  id: serial("id").primaryKey(),
  mkId: integer("mk_id").unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  party: varchar("party", { length: 255 }),
  faction: varchar("faction", { length: 255 }),
  imgUrl: text("img_url"),
  email: varchar("email", { length: 255 }),
  website: text("website"),
  phone: varchar("phone", { length: 50 }),
  startDate: date("start_date"),
  endDate: date("end_date"),
  isCurrent: boolean("is_current").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const weeklyReportsTable = pgTable("weekly_reports", {
  id: serial("id").primaryKey(),
  weekStart: date("week_start").notNull(),
  weekEnd: date("week_end").notNull(),
  reportData: jsonb("report_data").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const mkWeeklyStatsTable = pgTable("mk_weekly_stats", {
  id: serial("id").primaryKey(),
  mkId: integer("mk_id").notNull(),
  weekStart: date("week_start").notNull(),
  weekEnd: date("week_end").notNull(),
  speechCount: integer("speech_count").default(0),
  wordCount: integer("word_count").default(0),
  impactScore: decimal("impact_score", { precision: 10, scale: 2 }).default("0"),
  topics: jsonb("topics"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const speechesTable = pgTable("speeches", {
  id: serial("id").primaryKey(),
  mkId: integer("mk_id").notNull(),
  protocolId: integer("protocol_id"),
  speechDate: date("speech_date").notNull(),
  speechText: text("speech_text"),
  wordCount: integer("word_count"),
  topic: varchar("topic", { length: 500 }),
  committee: varchar("committee", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================
// RELATIONS
// ============================================

export const projectRelations = relations(projectTable, ({ many }) => ({
  frames: many(frameTable),
}));

export const frameRelations = relations(frameTable, ({ one, many }) => ({
  project: one(projectTable, {
    fields: [frameTable.projectId],
    references: [projectTable.projectId],
  }),
  chats: many(chatTable),
}));

export const chatRelations = relations(chatTable, ({ one }) => ({
  frame: one(frameTable, {
    fields: [chatTable.frameId],
    references: [frameTable.frameId],
  }),
}));

export const knessetMemberRelations = relations(knessetMembersTable, ({ many }) => ({
  weeklyStats: many(mkWeeklyStatsTable),
  speeches: many(speechesTable),
}));

export const mkWeeklyStatsRelations = relations(mkWeeklyStatsTable, ({ one }) => ({
  member: one(knessetMembersTable, {
    fields: [mkWeeklyStatsTable.mkId],
    references: [knessetMembersTable.mkId],
  }),
}));

export const speechesRelations = relations(speechesTable, ({ one }) => ({
  member: one(knessetMembersTable, {
    fields: [speechesTable.mkId],
    references: [knessetMembersTable.mkId],
  }),
}));
