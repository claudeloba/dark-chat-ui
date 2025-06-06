
import { db } from '../db';
import { conversationParticipantsTable } from '../db/schema';
import { type AddParticipantToConversationInput, type ConversationParticipant } from '../schema';

export const addParticipantToConversation = async (input: AddParticipantToConversationInput): Promise<ConversationParticipant> => {
  try {
    // Insert conversation participant relationship
    const result = await db.insert(conversationParticipantsTable)
      .values({
        conversation_id: input.conversation_id,
        participant_id: input.participant_id
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Adding participant to conversation failed:', error);
    throw error;
  }
};
