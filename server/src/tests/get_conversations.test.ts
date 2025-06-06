
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { conversationsTable } from '../db/schema';
import { type CreateConversationInput } from '../schema';
import { getConversations } from '../handlers/get_conversations';

// Test data
const testConversation1: CreateConversationInput = {
  title: 'First Conversation',
  mode: 'smart_answer'
};

const testConversation2: CreateConversationInput = {
  title: 'Second Conversation',
  mode: 'group_chat'
};

describe('getConversations', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no conversations exist', async () => {
    const result = await getConversations();
    
    expect(result).toEqual([]);
  });

  it('should return all conversations', async () => {
    // Create test conversations
    await db.insert(conversationsTable)
      .values([testConversation1, testConversation2])
      .execute();

    const result = await getConversations();

    expect(result).toHaveLength(2);
    
    // Find conversations by title since order might vary with same timestamp
    const firstConv = result.find(c => c.title === 'First Conversation');
    const secondConv = result.find(c => c.title === 'Second Conversation');
    
    expect(firstConv).toBeDefined();
    expect(firstConv!.mode).toEqual('smart_answer');
    expect(firstConv!.id).toBeDefined();
    expect(firstConv!.created_at).toBeInstanceOf(Date);
    expect(firstConv!.updated_at).toBeInstanceOf(Date);

    expect(secondConv).toBeDefined();
    expect(secondConv!.mode).toEqual('group_chat');
    expect(secondConv!.id).toBeDefined();
    expect(secondConv!.created_at).toBeInstanceOf(Date);
    expect(secondConv!.updated_at).toBeInstanceOf(Date);
  });

  it('should return conversations ordered by updated_at descending', async () => {
    // Create first conversation
    const first = await db.insert(conversationsTable)
      .values(testConversation1)
      .returning()
      .execute();

    // Wait a bit to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    // Create second conversation
    const second = await db.insert(conversationsTable)
      .values(testConversation2)
      .returning()
      .execute();

    const result = await getConversations();

    expect(result).toHaveLength(2);
    // Most recently updated should be first
    expect(result[0].id).toEqual(second[0].id);
    expect(result[1].id).toEqual(first[0].id);
    expect(result[0].updated_at >= result[1].updated_at).toBe(true);
  });

  it('should handle all chat modes correctly', async () => {
    // Create conversations with all supported modes
    await db.insert(conversationsTable)
      .values([
        { title: 'Smart Answer Chat', mode: 'smart_answer' },
        { title: 'Group Chat', mode: 'group_chat' },
        { title: 'Autopilot Chat', mode: 'autopilot' }
      ])
      .execute();

    const result = await getConversations();

    expect(result).toHaveLength(3);
    
    const modes = result.map(conv => conv.mode);
    expect(modes).toContain('smart_answer');
    expect(modes).toContain('group_chat');
    expect(modes).toContain('autopilot');
  });
});
