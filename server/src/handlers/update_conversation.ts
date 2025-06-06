
import { db } from '../db';
import { conversationsTable } from '../db/schema';
import { type UpdateConversationInput, type Conversation } from '../schema';
import { eq } from 'drizzle-orm';

export const updateConversation = async (input: UpdateConversationInput): Promise<Conversation> => {
  try {
    // Build update object dynamically based on provided fields
    const updateData: any = {};
    
    if (input.title !== undefined) {
      updateData.title = input.title;
    }
    
    // Always update the updated_at timestamp
    updateData.updated_at = new Date();

    // Update conversation record
    const result = await db.update(conversationsTable)
      .set(updateData)
      .where(eq(conversationsTable.id, input.id))
      .returning()
      .execute();

    // Check if conversation was found and updated
    if (result.length === 0) {
      throw new Error(`Conversation with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Conversation update failed:', error);
    throw error;
  }
};
