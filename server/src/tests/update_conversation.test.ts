
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { conversationsTable } from '../db/schema';
import { type CreateConversationInput, type UpdateConversationInput } from '../schema';
import { updateConversation } from '../handlers/update_conversation';
import { eq } from 'drizzle-orm';

// Helper to create a test conversation
const createTestConversation = async (input: CreateConversationInput) => {
  const result = await db.insert(conversationsTable)
    .values({
      title: input.title,
      mode: input.mode,
    })
    .returning()
    .execute();
  return result[0];
};

describe('updateConversation', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update conversation title', async () => {
    // Create test conversation
    const testConversation = await createTestConversation({
      title: 'Original Title',
      mode: 'smart_answer'
    });

    const updateInput: UpdateConversationInput = {
      id: testConversation.id,
      title: 'Updated Title'
    };

    const result = await updateConversation(updateInput);

    // Verify updated fields
    expect(result.id).toEqual(testConversation.id);
    expect(result.title).toEqual('Updated Title');
    expect(result.mode).toEqual('smart_answer');
    expect(result.created_at).toEqual(testConversation.created_at);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(testConversation.updated_at.getTime());
  });

  it('should update conversation in database', async () => {
    // Create test conversation
    const testConversation = await createTestConversation({
      title: 'Original Title',
      mode: 'group_chat'
    });

    const updateInput: UpdateConversationInput = {
      id: testConversation.id,
      title: 'Database Updated Title'
    };

    await updateConversation(updateInput);

    // Verify database was updated
    const conversations = await db.select()
      .from(conversationsTable)
      .where(eq(conversationsTable.id, testConversation.id))
      .execute();

    expect(conversations).toHaveLength(1);
    expect(conversations[0].title).toEqual('Database Updated Title');
    expect(conversations[0].mode).toEqual('group_chat');
    expect(conversations[0].updated_at).toBeInstanceOf(Date);
    expect(conversations[0].updated_at.getTime()).toBeGreaterThan(testConversation.updated_at.getTime());
  });

  it('should update only updated_at when no title provided', async () => {
    // Create test conversation
    const testConversation = await createTestConversation({
      title: 'Unchanged Title',
      mode: 'autopilot'
    });

    const updateInput: UpdateConversationInput = {
      id: testConversation.id
    };

    const result = await updateConversation(updateInput);

    // Verify only updated_at changed
    expect(result.id).toEqual(testConversation.id);
    expect(result.title).toEqual('Unchanged Title');
    expect(result.mode).toEqual('autopilot');
    expect(result.created_at).toEqual(testConversation.created_at);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(testConversation.updated_at.getTime());
  });

  it('should throw error for non-existent conversation', async () => {
    const updateInput: UpdateConversationInput = {
      id: 999999,
      title: 'Non-existent Conversation'
    };

    await expect(updateConversation(updateInput)).rejects.toThrow(/conversation with id 999999 not found/i);
  });

  it('should handle empty title update', async () => {
    // Create test conversation
    const testConversation = await createTestConversation({
      title: 'Original Title',
      mode: 'smart_answer'
    });

    const updateInput: UpdateConversationInput = {
      id: testConversation.id,
      title: ''
    };

    const result = await updateConversation(updateInput);

    expect(result.title).toEqual('');
    expect(result.id).toEqual(testConversation.id);
    expect(result.mode).toEqual('smart_answer');
  });
});
