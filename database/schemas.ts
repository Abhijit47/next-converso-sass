import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

const createdAt = timestamp('created_at', { mode: 'string' })
  .notNull()
  .defaultNow();
const updatedAt = timestamp('updated_at', { mode: 'string' })
  .notNull()
  .$onUpdate(() => new Date().toISOString());

export const companions = pgTable('companions', {
  id: uuid('id').unique().primaryKey().defaultRandom().notNull(),
  name: text('name').notNull(),
  subject: text('subject').notNull(),
  topic: text('topic').notNull(),
  style: text('style').notNull(),
  voice: text('voice').notNull(),
  duration: integer('duration').notNull(),
  author: varchar('author').notNull(),
  isBookmarked: boolean('is_bookmarked').default(false).notNull(),
  createdAt: createdAt,
  updatedAt: updatedAt,
});

export const companionRelations = relations(companions, ({ many }) => ({
  sessionHistory: many(sessionHistory),
  bookmarks: many(bookmarks),
}));

export const sessionHistory = pgTable('session_history', {
  id: uuid('id').unique().primaryKey().defaultRandom().notNull(),
  userId: varchar('user_id').notNull(),
  companionId: uuid('companion_id').notNull(),
  createdAt: createdAt,
  updatedAt: updatedAt,
});

export const sessionHistoryRelations = relations(sessionHistory, ({ one }) => ({
  companion: one(companions, {
    fields: [sessionHistory.companionId],
    references: [companions.id],
  }),
}));

export const bookmarks = pgTable('bookmarks', {
  id: uuid('id').unique().primaryKey().defaultRandom().notNull(),
  userId: varchar('user_id').notNull(),
  companionId: uuid('companion_id').notNull(),
  createdAt: createdAt,
  updatedAt: updatedAt,
});

export const bookmarkRelations = relations(bookmarks, ({ one }) => ({
  companion: one(companions, {
    fields: [bookmarks.companionId],
    references: [companions.id],
  }),
}));

export type InsertCompanion = typeof companions.$inferInsert;
export type SelectCompanion = typeof companions.$inferSelect;
export type InsertSessionHistory = typeof sessionHistory.$inferInsert;
export type SelectSessionHistory = typeof sessionHistory.$inferSelect;
export type InsertBookmark = typeof bookmarks.$inferInsert;
export type SelectBookmark = typeof bookmarks.$inferSelect;
