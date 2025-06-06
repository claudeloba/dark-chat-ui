
import { db } from '../db';
import { conversationsTable, messagesTable, conversationParticipantsTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export const deleteConversation = async (id: number): Promise<{ success: boolean }> => {
  try {
    // Delete related records first to avoid foreign key constraint violations
    
    // Delete conversation participants
    await db.delete(conversationParticipantsTable)
      .where(eq(conversationParticipantsTable.conversation_id, id))
      .execute();

    // Delete messages
    await db.delete(messagesTable)
      .where(eq(messagesTable.conversation_id, id))
      .execute();

    // Finally delete the conversation
    await db.delete(conversationsTable)
      .where(eq(conversationsTable.id, id))
      .execute();

    return { success: true };
  } catch (error) {
    console.error('Conversation deletion failed:', error);
    throw error;
  }
};
