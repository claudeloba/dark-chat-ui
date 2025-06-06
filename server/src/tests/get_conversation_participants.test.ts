
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { conversationsTable, participantsTable, conversationParticipantsTable } from '../db/schema';
import { type CreateConversationInput, type CreateParticipantInput } from '../schema';
import { getConversationParticipants } from '../handlers/get_conversation_participants';

// Test data
const testConversation: CreateConversationInput = {
  title: 'Test Conversation',
  mode: 'group_chat'
};

const testParticipant1: CreateParticipantInput = {
  name: 'Alice',
  description: 'AI Assistant',
  avatar_url: 'https://example.com/alice.png'
};

const testParticipant2: CreateParticipantInput = {
  name: 'Bob',
  description: 'Human User',
  avatar_url: null
};

const testParticipant3: CreateParticipantInput = {
  name: 'Charlie',
  description: null,
  avatar_url: 'https://example.com/charlie.png'
};

describe('getConversationParticipants', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return participants for a conversation', async () => {
    // Create conversation
    const conversationResult = await db.insert(conversationsTable)
      .values(testConversation)
      .returning()
      .execute();
    const conversation = conversationResult[0];

    // Create participants
    const participant1Result = await db.insert(participantsTable)
      .values(testParticipant1)
      .returning()
      .execute();
    const participant1 = participant1Result[0];

    const participant2Result = await db.insert(participantsTable)
      .values(testParticipant2)
      .returning()
      .execute();
    const participant2 = participant2Result[0];

    // Add participants to conversation
    await db.insert(conversationParticipantsTable)
      .values([
        { conversation_id: conversation.id, participant_id: participant1.id },
        { conversation_id: conversation.id, participant_id: participant2.id }
      ])
      .execute();

    const result = await getConversationParticipants(conversation.id);

    expect(result).toHaveLength(2);
    
    // Check participant 1
    const alice = result.find(p => p.name === 'Alice');
    expect(alice).toBeDefined();
    expect(alice?.id).toEqual(participant1.id);
    expect(alice?.description).toEqual('AI Assistant');
    expect(alice?.avatar_url).toEqual('https://example.com/alice.png');
    expect(alice?.created_at).toBeInstanceOf(Date);

    // Check participant 2
    const bob = result.find(p => p.name === 'Bob');
    expect(bob).toBeDefined();
    expect(bob?.id).toEqual(participant2.id);
    expect(bob?.description).toEqual('Human User');
    expect(bob?.avatar_url).toBeNull();
    expect(bob?.created_at).toBeInstanceOf(Date);
  });

  it('should return empty array for conversation with no participants', async () => {
    // Create conversation without participants
    const conversationResult = await db.insert(conversationsTable)
      .values(testConversation)
      .returning()
      .execute();
    const conversation = conversationResult[0];

    const result = await getConversationParticipants(conversation.id);

    expect(result).toHaveLength(0);
  });

  it('should not return participants from other conversations', async () => {
    // Create two conversations
    const conversation1Result = await db.insert(conversationsTable)
      .values({ ...testConversation, title: 'Conversation 1' })
      .returning()
      .execute();
    const conversation1 = conversation1Result[0];

    const conversation2Result = await db.insert(conversationsTable)
      .values({ ...testConversation, title: 'Conversation 2' })
      .returning()
      .execute();
    const conversation2 = conversation2Result[0];

    // Create participants
    const participant1Result = await db.insert(participantsTable)
      .values(testParticipant1)
      .returning()
      .execute();
    const participant1 = participant1Result[0];

    const participant3Result = await db.insert(participantsTable)
      .values(testParticipant3)
      .returning()
      .execute();
    const participant3 = participant3Result[0];

    // Add participant1 to conversation1 and participant3 to conversation2
    await db.insert(conversationParticipantsTable)
      .values([
        { conversation_id: conversation1.id, participant_id: participant1.id },
        { conversation_id: conversation2.id, participant_id: participant3.id }
      ])
      .execute();

    // Get participants for conversation1
    const result = await getConversationParticipants(conversation1.id);

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Alice');
    expect(result[0].id).toEqual(participant1.id);
  });

  it('should handle non-existent conversation', async () => {
    const result = await getConversationParticipants(999);

    expect(result).toHaveLength(0);
  });
});
