
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { conversationsTable, messagesTable } from '../db/schema';
import { getMessages } from '../handlers/get_messages';

describe('getMessages', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return messages for a conversation ordered by created_at', async () => {
    // Create test conversation
    const [conversation] = await db.insert(conversationsTable)
      .values({
        title: 'Test Conversation',
        mode: 'smart_answer'
      })
      .returning()
      .execute();

    // Create test messages with different timestamps
    const now = new Date();
    const earlier = new Date(now.getTime() - 10000); // 10 seconds earlier
    const later = new Date(now.getTime() + 10000); // 10 seconds later

    await db.insert(messagesTable)
      .values([
        {
          conversation_id: conversation.id,
          role: 'user',
          content: 'Second message',
          participant_id: null,
          created_at: later
        },
        {
          conversation_id: conversation.id,
          role: 'assistant',
          content: 'First message',
          participant_id: null,
          created_at: earlier
        },
        {
          conversation_id: conversation.id,
          role: 'user',
          content: 'Third message',
          participant_id: null,
          created_at: now
        }
      ])
      .execute();

    const messages = await getMessages(conversation.id);

    expect(messages).toHaveLength(3);
    // Should be ordered by created_at ascending
    expect(messages[0].content).toEqual('First message');
    expect(messages[1].content).toEqual('Third message');
    expect(messages[2].content).toEqual('Second message');
    
    // Verify all messages belong to the conversation
    messages.forEach(message => {
      expect(message.conversation_id).toEqual(conversation.id);
      expect(message.id).toBeDefined();
      expect(message.created_at).toBeInstanceOf(Date);
    });
  });

  it('should return empty array for conversation with no messages', async () => {
    // Create test conversation
    const [conversation] = await db.insert(conversationsTable)
      .values({
        title: 'Empty Conversation',
        mode: 'group_chat'
      })
      .returning()
      .execute();

    const messages = await getMessages(conversation.id);

    expect(messages).toHaveLength(0);
    expect(messages).toEqual([]);
  });

  it('should return only messages for the specified conversation', async () => {
    // Create two test conversations
    const [conversation1] = await db.insert(conversationsTable)
      .values({
        title: 'Conversation 1',
        mode: 'smart_answer'
      })
      .returning()
      .execute();

    const [conversation2] = await db.insert(conversationsTable)
      .values({
        title: 'Conversation 2',
        mode: 'autopilot'
      })
      .returning()
      .execute();

    // Add messages to both conversations
    await db.insert(messagesTable)
      .values([
        {
          conversation_id: conversation1.id,
          role: 'user',
          content: 'Message in conversation 1',
          participant_id: null
        },
        {
          conversation_id: conversation2.id,
          role: 'assistant',
          content: 'Message in conversation 2',
          participant_id: null
        },
        {
          conversation_id: conversation1.id,
          role: 'system',
          content: 'Another message in conversation 1',
          participant_id: null
        }
      ])
      .execute();

    const messages = await getMessages(conversation1.id);

    expect(messages).toHaveLength(2);
    messages.forEach(message => {
      expect(message.conversation_id).toEqual(conversation1.id);
    });
  });
});
