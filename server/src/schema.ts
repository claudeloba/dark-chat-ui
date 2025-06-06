
import { z } from 'zod';

// Chat mode enum
export const chatModeSchema = z.enum(['smart_answer', 'group_chat', 'autopilot']);
export type ChatMode = z.infer<typeof chatModeSchema>;

// Conversation schema
export const conversationSchema = z.object({
  id: z.number(),
  title: z.string(),
  mode: chatModeSchema,
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});
export type Conversation = z.infer<typeof conversationSchema>;

// Create conversation input
export const createConversationInputSchema = z.object({
  title: z.string(),
  mode: chatModeSchema,
});
export type CreateConversationInput = z.infer<typeof createConversationInputSchema>;

// Update conversation input
export const updateConversationInputSchema = z.object({
  id: z.number(),
  title: z.string().optional(),
});
export type UpdateConversationInput = z.infer<typeof updateConversationInputSchema>;

// Message role enum
export const messageRoleSchema = z.enum(['user', 'assistant', 'system']);
export type MessageRole = z.infer<typeof messageRoleSchema>;

// Message schema
export const messageSchema = z.object({
  id: z.number(),
  conversation_id: z.number(),
  role: messageRoleSchema,
  content: z.string(),
  participant_id: z.number().nullable(),
  created_at: z.coerce.date(),
});
export type Message = z.infer<typeof messageSchema>;

// Create message input
export const createMessageInputSchema = z.object({
  conversation_id: z.number(),
  role: messageRoleSchema,
  content: z.string(),
  participant_id: z.number().nullable(),
});
export type CreateMessageInput = z.infer<typeof createMessageInputSchema>;

// Participant schema
export const participantSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  avatar_url: z.string().nullable(),
  created_at: z.coerce.date(),
});
export type Participant = z.infer<typeof participantSchema>;

// Create participant input
export const createParticipantInputSchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
  avatar_url: z.string().nullable(),
});
export type CreateParticipantInput = z.infer<typeof createParticipantInputSchema>;

// Conversation participant relationship schema
export const conversationParticipantSchema = z.object({
  id: z.number(),
  conversation_id: z.number(),
  participant_id: z.number(),
  joined_at: z.coerce.date(),
});
export type ConversationParticipant = z.infer<typeof conversationParticipantSchema>;

// Add participant to conversation input
export const addParticipantToConversationInputSchema = z.object({
  conversation_id: z.number(),
  participant_id: z.number(),
});
export type AddParticipantToConversationInput = z.infer<typeof addParticipantToConversationInputSchema>;

// Get conversation with messages schema
export const conversationWithMessagesSchema = z.object({
  id: z.number(),
  title: z.string(),
  mode: chatModeSchema,
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  messages: z.array(messageSchema),
  participants: z.array(participantSchema),
});
export type ConversationWithMessages = z.infer<typeof conversationWithMessagesSchema>;
