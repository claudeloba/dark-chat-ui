
import { serial, text, pgTable, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const chatModeEnum = pgEnum('chat_mode', ['smart_answer', 'group_chat', 'autopilot']);
export const messageRoleEnum = pgEnum('message_role', ['user', 'assistant', 'system']);

// Conversations table
export const conversationsTable = pgTable('conversations', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  mode: chatModeEnum('mode').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Participants table
export const participantsTable = pgTable('participants', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  avatar_url: text('avatar_url'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Messages table
export const messagesTable = pgTable('messages', {
  id: serial('id').primaryKey(),
  conversation_id: integer('conversation_id').references(() => conversationsTable.id).notNull(),
  role: messageRoleEnum('role').notNull(),
  content: text('content').notNull(),
  participant_id: integer('participant_id').references(() => participantsTable.id),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Conversation participants junction table
export const conversationParticipantsTable = pgTable('conversation_participants', {
  id: serial('id').primaryKey(),
  conversation_id: integer('conversation_id').references(() => conversationsTable.id).notNull(),
  participant_id: integer('participant_id').references(() => participantsTable.id).notNull(),
  joined_at: timestamp('joined_at').defaultNow().notNull(),
});

// Relations
export const conversationsRelations = relations(conversationsTable, ({ many }) => ({
  messages: many(messagesTable),
  conversationParticipants: many(conversationParticipantsTable),
}));

export const messagesRelations = relations(messagesTable, ({ one }) => ({
  conversation: one(conversationsTable, {
    fields: [messagesTable.conversation_id],
    references: [conversationsTable.id],
  }),
  participant: one(participantsTable, {
    fields: [messagesTable.participant_id],
    references: [participantsTable.id],
  }),
}));

export const participantsRelations = relations(participantsTable, ({ many }) => ({
  messages: many(messagesTable),
  conversationParticipants: many(conversationParticipantsTable),
}));

export const conversationParticipantsRelations = relations(conversationParticipantsTable, ({ one }) => ({
  conversation: one(conversationsTable, {
    fields: [conversationParticipantsTable.conversation_id],
    references: [conversationsTable.id],
  }),
  participant: one(participantsTable, {
    fields: [conversationParticipantsTable.participant_id],
    references: [participantsTable.id],
  }),
}));

// Export all tables
export const tables = {
  conversations: conversationsTable,
  messages: messagesTable,
  participants: participantsTable,
  conversationParticipants: conversationParticipantsTable,
};
