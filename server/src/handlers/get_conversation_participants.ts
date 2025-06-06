
import { db } from '../db';
import { conversationParticipantsTable, participantsTable } from '../db/schema';
import { type Participant } from '../schema';
import { eq } from 'drizzle-orm';

export const getConversationParticipants = async (conversationId: number): Promise<Participant[]> => {
  try {
    // Query participants that are part of the conversation
    const results = await db.select({
      id: participantsTable.id,
      name: participantsTable.name,
      description: participantsTable.description,
      avatar_url: participantsTable.avatar_url,
      created_at: participantsTable.created_at,
    })
      .from(participantsTable)
      .innerJoin(
        conversationParticipantsTable,
        eq(participantsTable.id, conversationParticipantsTable.participant_id)
      )
      .where(eq(conversationParticipantsTable.conversation_id, conversationId))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to get conversation participants:', error);
    throw error;
  }
};
