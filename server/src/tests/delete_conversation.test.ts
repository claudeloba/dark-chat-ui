
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { conversationsTable, messagesTable, conversationParticipantsTable, participantsTable } from '../db/schema';
import { deleteConversation } from '../handlers/delete_conversation';
import { eq } from 'drizzle-orm';

describe('deleteConversation', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete a conversation successfully', async () => {
    // Create test conversation
    const testConversation = await db.insert(conversationsTable)
      .values({
        title: 'Test Conversation',
        mode: 'smart_answer'
      })
      .returning()
      .execute();

    const conversationId = testConversation[0].id;

    // Delete the conversation
    const result = await deleteConversation(conversationId);

    expect(result.success).toBe(true);

    // Verify conversation is deleted
    const conversations = await db.select()
      .from(conversationsTable)
      .where(eq(conversationsTable.id, conversationId))
      .execute();

    expect(conversations).toHaveLength(0);
  });

  it('should delete related messages and conversation participants', async () => {
    // Create test conversation
    const testConversation = await db.insert(conversationsTable)
      .values({
        title: 'Test Conversation with Messages',
        mode: 'group_chat'
      })
      .returning()
      .execute();

    const conversationId = testConversation[0].id;

    // Create test participant first
    const testParticipant = await db.insert(participantsTable)
      .values({
        name: 'Test Participant',
        description: null,
        avatar_url: null
      })
      .returning()
      .execute();

    const participantId = testParticipant[0].id;

    // Create test message
    await db.insert(messagesTable)
      .values({
        conversation_id: conversationId,
        role: 'user',
        content: 'Test message',
        participant_id: null
      })
      .execute();

    // Create test conversation participant relationship
    await db.insert(conversationParticipantsTable)
      .values({
        conversation_id: conversationId,
        participant_id: participantId
      })
      .execute();

    // Delete the conversation
    const result = await deleteConversation(conversationId);

    expect(result.success).toBe(true);

    // Verify conversation is deleted
    const conversations = await db.select()
      .from(conversationsTable)
      .where(eq(conversationsTable.id, conversationId))
      .execute();

    expect(conversations).toHaveLength(0);

    // Verify related messages are deleted
    const messages = await db.select()
      .from(messagesTable)
      .where(eq(messagesTable.conversation_id, conversationId))
      .execute();

    expect(messages).toHaveLength(0);

    // Verify conversation participant relationships are deleted
    const conversationParticipants = await db.select()
      .from(conversationParticipantsTable)
      .where(eq(conversationParticipantsTable.conversation_id, conversationId))
      .execute();

    expect(conversationParticipants).toHaveLength(0);

    // Verify participant itself still exists (should not be deleted)
    const participants = await db.select()
      .from(participantsTable)
      .where(eq(participantsTable.id, participantId))
      .execute();

    expect(participants).toHaveLength(1);
  });

  it('should return success even when conversation does not exist', async () => {
    const nonExistentId = 99999;

    const result = await deleteConversation(nonExistentId);

    expect(result.success).toBe(true);
  });
});
