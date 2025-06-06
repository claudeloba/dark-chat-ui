
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { conversationsTable, messagesTable, participantsTable, conversationParticipantsTable } from '../db/schema';
import { getConversation } from '../handlers/get_conversation';

describe('getConversation', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should get a conversation with messages and participants', async () => {
    // Create a conversation
    const conversationResult = await db.insert(conversationsTable)
      .values({
        title: 'Test Conversation',
        mode: 'smart_answer',
      })
      .returning()
      .execute();

    const conversationId = conversationResult[0].id;

    // Create a participant
    const participantResult = await db.insert(participantsTable)
      .values({
        name: 'Test Participant',
        description: 'A test participant',
        avatar_url: 'https://example.com/avatar.jpg',
      })
      .returning()
      .execute();

    const participantId = participantResult[0].id;

    // Add participant to conversation
    await db.insert(conversationParticipantsTable)
      .values({
        conversation_id: conversationId,
        participant_id: participantId,
      })
      .execute();

    // Create messages
    await db.insert(messagesTable)
      .values([
        {
          conversation_id: conversationId,
          role: 'user',
          content: 'Hello, world!',
          participant_id: null,
        },
        {
          conversation_id: conversationId,
          role: 'assistant',
          content: 'Hi there!',
          participant_id: participantId,
        },
      ])
      .execute();

    const result = await getConversation(conversationId);

    // Verify conversation details
    expect(result.id).toEqual(conversationId);
    expect(result.title).toEqual('Test Conversation');
    expect(result.mode).toEqual('smart_answer');
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);

    // Verify messages
    expect(result.messages).toHaveLength(2);
    expect(result.messages[0].role).toEqual('user');
    expect(result.messages[0].content).toEqual('Hello, world!');
    expect(result.messages[0].participant_id).toBeNull();
    expect(result.messages[1].role).toEqual('assistant');
    expect(result.messages[1].content).toEqual('Hi there!');
    expect(result.messages[1].participant_id).toEqual(participantId);

    // Verify participants
    expect(result.participants).toHaveLength(1);
    expect(result.participants[0].id).toEqual(participantId);
    expect(result.participants[0].name).toEqual('Test Participant');
    expect(result.participants[0].description).toEqual('A test participant');
    expect(result.participants[0].avatar_url).toEqual('https://example.com/avatar.jpg');
    expect(result.participants[0].created_at).toBeInstanceOf(Date);
  });

  it('should get conversation with no messages or participants', async () => {
    // Create a conversation without messages or participants
    const conversationResult = await db.insert(conversationsTable)
      .values({
        title: 'Empty Conversation',
        mode: 'group_chat',
      })
      .returning()
      .execute();

    const conversationId = conversationResult[0].id;

    const result = await getConversation(conversationId);

    expect(result.id).toEqual(conversationId);
    expect(result.title).toEqual('Empty Conversation');
    expect(result.mode).toEqual('group_chat');
    expect(result.messages).toHaveLength(0);
    expect(result.participants).toHaveLength(0);
  });

  it('should throw error for non-existent conversation', async () => {
    expect(getConversation(999)).rejects.toThrow(/not found/i);
  });

  it('should handle multiple participants correctly', async () => {
    // Create a conversation
    const conversationResult = await db.insert(conversationsTable)
      .values({
        title: 'Multi-Participant Chat',
        mode: 'group_chat',
      })
      .returning()
      .execute();

    const conversationId = conversationResult[0].id;

    // Create multiple participants
    const participantResults = await db.insert(participantsTable)
      .values([
        {
          name: 'Alice',
          description: 'First participant',
          avatar_url: null,
        },
        {
          name: 'Bob',
          description: null,
          avatar_url: 'https://example.com/bob.jpg',
        },
      ])
      .returning()
      .execute();

    // Add both participants to conversation
    await db.insert(conversationParticipantsTable)
      .values([
        {
          conversation_id: conversationId,
          participant_id: participantResults[0].id,
        },
        {
          conversation_id: conversationId,
          participant_id: participantResults[1].id,
        },
      ])
      .execute();

    const result = await getConversation(conversationId);

    expect(result.participants).toHaveLength(2);
    expect(result.participants.find(p => p.name === 'Alice')).toBeDefined();
    expect(result.participants.find(p => p.name === 'Bob')).toBeDefined();
  });
});
