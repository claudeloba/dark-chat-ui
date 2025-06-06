
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { participantsTable } from '../db/schema';
import { type CreateParticipantInput } from '../schema';
import { createParticipant } from '../handlers/create_participant';
import { eq } from 'drizzle-orm';

// Test inputs with different scenarios
const basicInput: CreateParticipantInput = {
  name: 'Alice Johnson',
  description: 'A helpful AI assistant',
  avatar_url: 'https://example.com/avatar.png'
};

const minimalInput: CreateParticipantInput = {
  name: 'Bob Smith',
  description: null,
  avatar_url: null
};

describe('createParticipant', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a participant with all fields', async () => {
    const result = await createParticipant(basicInput);

    // Basic field validation
    expect(result.name).toEqual('Alice Johnson');
    expect(result.description).toEqual('A helpful AI assistant');
    expect(result.avatar_url).toEqual('https://example.com/avatar.png');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should create a participant with nullable fields as null', async () => {
    const result = await createParticipant(minimalInput);

    // Basic field validation
    expect(result.name).toEqual('Bob Smith');
    expect(result.description).toBeNull();
    expect(result.avatar_url).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save participant to database', async () => {
    const result = await createParticipant(basicInput);

    // Query using proper drizzle syntax
    const participants = await db.select()
      .from(participantsTable)
      .where(eq(participantsTable.id, result.id))
      .execute();

    expect(participants).toHaveLength(1);
    expect(participants[0].name).toEqual('Alice Johnson');
    expect(participants[0].description).toEqual('A helpful AI assistant');
    expect(participants[0].avatar_url).toEqual('https://example.com/avatar.png');
    expect(participants[0].created_at).toBeInstanceOf(Date);
  });

  it('should save participant with null fields to database', async () => {
    const result = await createParticipant(minimalInput);

    // Query using proper drizzle syntax
    const participants = await db.select()
      .from(participantsTable)
      .where(eq(participantsTable.id, result.id))
      .execute();

    expect(participants).toHaveLength(1);
    expect(participants[0].name).toEqual('Bob Smith');
    expect(participants[0].description).toBeNull();
    expect(participants[0].avatar_url).toBeNull();
    expect(participants[0].created_at).toBeInstanceOf(Date);
  });

  it('should create multiple participants with unique IDs', async () => {
    const result1 = await createParticipant(basicInput);
    const result2 = await createParticipant(minimalInput);

    expect(result1.id).not.toEqual(result2.id);
    expect(result1.name).toEqual('Alice Johnson');
    expect(result2.name).toEqual('Bob Smith');

    // Verify both exist in database
    const allParticipants = await db.select()
      .from(participantsTable)
      .execute();

    expect(allParticipants).toHaveLength(2);
  });
});
