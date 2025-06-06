
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { messagesTable, conversationsTable, participantsTable } from '../db/schema';
import { type CreateMessageInput } from '../schema';
import { createMessage } from '../handlers/create_message';
import { eq } from 'drizzle-orm';

describe('createMessage', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a message without participant', async () => {
    // Create prerequisite conversation
    const conversationResult = await db.insert(conversationsTable)
      .values({
        title: 'Test Conversation',
        mode: 'smart_answer'
      })
      .returning()
      .execute();
    const conversationId = conversationResult[0].id;

    const testInput: CreateMessageInput = {
      conversation_id: conversationId,
      role: 'user',
      content: 'Hello, this is a test message',
      participant_id: null
    };

    const result = await createMessage(testInput);

    // Basic field validation
    expect(result.conversation_id).toEqual(conversationId);
    expect(result.role).toEqual('user');
    expect(result.content).toEqual('Hello, this is a test message');
    expect(result.participant_id).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should create a message with participant', async () => {
    // Create prerequisite conversation
    const conversationResult = await db.insert(conversationsTable)
      .values({
        title: 'Test Conversation',
        mode: 'group_chat'
      })
      .returning()
      .execute();
    const conversationId = conversationResult[0].id;

    // Create prerequisite participant
    const participantResult = await db.insert(participantsTable)
      .values({
        name: 'Test Assistant',
        description: 'AI Assistant for testing',
        avatar_url: 'https://example.com/avatar.png'
      })
      .returning()
      .execute();
    const participantId = participantResult[0].id;

    const testInput: CreateMessageInput = {
      conversation_id: conversationId,
      role: 'assistant',
      content: 'This is a response from the assistant',
      participant_id: participantId
    };

    const result = await createMessage(testInput);

    // Basic field validation
    expect(result.conversation_id).toEqual(conversationId);
    expect(result.role).toEqual('assistant');
    expect(result.content).toEqual('This is a response from the assistant');
    expect(result.participant_id).toEqual(participantId);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save message to database', async () => {
    // Create prerequisite conversation
    const conversationResult = await db.insert(conversationsTable)
      .values({
        title: 'Test Conversation',
        mode: 'autopilot'
      })
      .returning()
      .execute();
    const conversationId = conversationResult[0].id;

    const testInput: CreateMessageInput = {
      conversation_id: conversationId,
      role: 'system',
      content: 'System initialization message',
      participant_id: null
    };

    const result = await createMessage(testInput);

    // Query using proper drizzle syntax
    const messages = await db.select()
      .from(messagesTable)
      .where(eq(messagesTable.id, result.id))
      .execute();

    expect(messages).toHaveLength(1);
    expect(messages[0].conversation_id).toEqual(conversationId);
    expect(messages[0].role).toEqual('system');
    expect(messages[0].content).toEqual('System initialization message');
    expect(messages[0].participant_id).toBeNull();
    expect(messages[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle foreign key constraint violations', async () => {
    const testInput: CreateMessageInput = {
      conversation_id: 99999, // Non-existent conversation
      role: 'user',
      content: 'This should fail',
      participant_id: null
    };

    await expect(createMessage(testInput)).rejects.toThrow(/violates foreign key constraint/i);
  });
});
