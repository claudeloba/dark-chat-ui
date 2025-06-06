
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { participantsTable } from '../db/schema';
import { getParticipants } from '../handlers/get_participants';
import { type CreateParticipantInput } from '../schema';

describe('getParticipants', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no participants exist', async () => {
    const result = await getParticipants();
    
    expect(result).toEqual([]);
  });

  it('should return all participants', async () => {
    // Create test participants
    const participant1: CreateParticipantInput = {
      name: 'Alice',
      description: 'AI Assistant',
      avatar_url: 'https://example.com/alice.jpg'
    };

    const participant2: CreateParticipantInput = {
      name: 'Bob',
      description: null,
      avatar_url: null
    };

    await db.insert(participantsTable)
      .values([participant1, participant2])
      .execute();

    const result = await getParticipants();

    expect(result).toHaveLength(2);
    
    // Check first participant
    const alice = result.find(p => p.name === 'Alice');
    expect(alice).toBeDefined();
    expect(alice!.name).toEqual('Alice');
    expect(alice!.description).toEqual('AI Assistant');
    expect(alice!.avatar_url).toEqual('https://example.com/alice.jpg');
    expect(alice!.id).toBeDefined();
    expect(alice!.created_at).toBeInstanceOf(Date);

    // Check second participant
    const bob = result.find(p => p.name === 'Bob');
    expect(bob).toBeDefined();
    expect(bob!.name).toEqual('Bob');
    expect(bob!.description).toBeNull();
    expect(bob!.avatar_url).toBeNull();
    expect(bob!.id).toBeDefined();
    expect(bob!.created_at).toBeInstanceOf(Date);
  });

  it('should return participants in creation order', async () => {
    // Create participants with slight delay to ensure different timestamps
    await db.insert(participantsTable)
      .values({ name: 'First', description: null, avatar_url: null })
      .execute();

    await db.insert(participantsTable)
      .values({ name: 'Second', description: null, avatar_url: null })
      .execute();

    const result = await getParticipants();

    expect(result).toHaveLength(2);
    expect(result[0].name).toEqual('First');
    expect(result[1].name).toEqual('Second');
    expect(result[0].created_at <= result[1].created_at).toBe(true);
  });
});
