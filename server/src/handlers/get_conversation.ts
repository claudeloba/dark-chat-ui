
import { db } from '../db';
import { conversationsTable, messagesTable, participantsTable, conversationParticipantsTable } from '../db/schema';
import { type ConversationWithMessages } from '../schema';
import { eq } from 'drizzle-orm';

export const getConversation = async (id: number): Promise<ConversationWithMessages> => {
  try {
    // Get the conversation
    const conversations = await db.select()
      .from(conversationsTable)
      .where(eq(conversationsTable.id, id))
      .execute();

    if (conversations.length === 0) {
      throw new Error(`Conversation with id ${id} not found`);
    }

    const conversation = conversations[0];

    // Get messages for this conversation
    const messages = await db.select()
      .from(messagesTable)
      .where(eq(messagesTable.conversation_id, id))
      .execute();

    // Get participants for this conversation
    const participantResults = await db.select({
      id: participantsTable.id,
      name: participantsTable.name,
      description: participantsTable.description,
      avatar_url: participantsTable.avatar_url,
      created_at: participantsTable.created_at,
    })
      .from(conversationParticipantsTable)
      .innerJoin(participantsTable, eq(conversationParticipantsTable.participant_id, participantsTable.id))
      .where(eq(conversationParticipantsTable.conversation_id, id))
      .execute();

    return {
      id: conversation.id,
      title: conversation.title,
      mode: conversation.mode,
      created_at: conversation.created_at,
      updated_at: conversation.updated_at,
      messages: messages,
      participants: participantResults,
    };
  } catch (error) {
    console.error('Get conversation failed:', error);
    throw error;
  }
};
