
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { conversationsTable, participantsTable, conversationParticipantsTable } from '../db/schema';
import { type AddParticipantToConversationInput } from '../schema';
import { addParticipantToConversation } from '../handlers/add_participant_to_conversation';
import { eq } from 'drizzle-orm';

describe('addParticipantToConversation', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should add participant to conversation', async () => {
    // Create prerequisite conversation
    const conversationResult = await db.insert(conversationsTable)
      .values({
        title: 'Test Conversation',
        mode: 'group_chat'
      })
      .returning()
      .execute();
    const conversation = conversationResult[0];

    // Create prerequisite participant
    const participantResult = await db.insert(participantsTable)
      .values({
        name: 'Test Participant',
        description: 'A test participant',
        avatar_url: null
      })
      .returning()
      .execute();
    const participant = participantResult[0];

    const input: AddParticipantToConversationInput = {
      conversation_id: conversation.id,
      participant_id: participant.id
    };

    const result = await addParticipantToConversation(input);

    // Basic field validation
    expect(result.conversation_id).toEqual(conversation.id);
    expect(result.participant_id).toEqual(participant.id);
    expect(result.id).toBeDefined();
    expect(result.joined_at).toBeInstanceOf(Date);
  });

  it('should save conversation participant relationship to database', async () => {
    // Create prerequisite conversation
    const conversationResult = await db.insert(conversationsTable)
      .values({
        title: 'Test Conversation',
        mode: 'smart_answer'
      })
      .returning()
      .execute();
    const conversation = conversationResult[0];

    // Create prerequisite participant
    const participantResult = await db.insert(participantsTable)
      .values({
        name: 'Another Participant',
        description: null,
        avatar_url: 'https://example.com/avatar.jpg'
      })
      .returning()
      .execute();
    const participant = participantResult[0];

    const input: AddParticipantToConversationInput = {
      conversation_id: conversation.id,
      participant_id: participant.id
    };

    const result = await addParticipantToConversation(input);

    // Query using proper drizzle syntax
    const relationships = await db.select()
      .from(conversationParticipantsTable)
      .where(eq(conversationParticipantsTable.id, result.id))
      .execute();

    expect(relationships).toHaveLength(1);
    expect(relationships[0].conversation_id).toEqual(conversation.id);
    expect(relationships[0].participant_id).toEqual(participant.id);
    expect(relationships[0].joined_at).toBeInstanceOf(Date);
  });

  it('should throw error for non-existent conversation', async () => {
    // Create prerequisite participant
    const participantResult = await db.insert(participantsTable)
      .values({
        name: 'Test Participant',
        description: 'A test participant',
        avatar_url: null
      })
      .returning()
      .execute();
    const participant = participantResult[0];

    const input: AddParticipantToConversationInput = {
      conversation_id: 999999, // Non-existent conversation ID
      participant_id: participant.id
    };

    await expect(addParticipantToConversation(input)).rejects.toThrow(/violates foreign key constraint/i);
  });

  it('should throw error for non-existent participant', async () => {
    // Create prerequisite conversation
    const conversationResult = await db.insert(conversationsTable)
      .values({
        title: 'Test Conversation',
        mode: 'autopilot'
      })
      .returning()
      .execute();
    const conversation = conversationResult[0];

    const input: AddParticipantToConversationInput = {
      conversation_id: conversation.id,
      participant_id: 999999 // Non-existent participant ID
    };

    await expect(addParticipantToConversation(input)).rejects.toThrow(/violates foreign key constraint/i);
  });
});
