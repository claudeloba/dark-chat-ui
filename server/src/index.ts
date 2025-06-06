
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

import {
  createConversationInputSchema,
  updateConversationInputSchema,
  createMessageInputSchema,
  createParticipantInputSchema,
  addParticipantToConversationInputSchema,
} from './schema';

import { createConversation } from './handlers/create_conversation';
import { getConversations } from './handlers/get_conversations';
import { getConversation } from './handlers/get_conversation';
import { updateConversation } from './handlers/update_conversation';
import { deleteConversation } from './handlers/delete_conversation';
import { createMessage } from './handlers/create_message';
import { getMessages } from './handlers/get_messages';
import { createParticipant } from './handlers/create_participant';
import { getParticipants } from './handlers/get_participants';
import { addParticipantToConversation } from './handlers/add_participant_to_conversation';
import { getConversationParticipants } from './handlers/get_conversation_participants';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Conversation routes
  createConversation: publicProcedure
    .input(createConversationInputSchema)
    .mutation(({ input }) => createConversation(input)),
  
  getConversations: publicProcedure
    .query(() => getConversations()),
  
  getConversation: publicProcedure
    .input(z.number())
    .query(({ input }) => getConversation(input)),
  
  updateConversation: publicProcedure
    .input(updateConversationInputSchema)
    .mutation(({ input }) => updateConversation(input)),
  
  deleteConversation: publicProcedure
    .input(z.number())
    .mutation(({ input }) => deleteConversation(input)),
  
  // Message routes
  createMessage: publicProcedure
    .input(createMessageInputSchema)
    .mutation(({ input }) => createMessage(input)),
  
  getMessages: publicProcedure
    .input(z.number())
    .query(({ input }) => getMessages(input)),
  
  // Participant routes
  createParticipant: publicProcedure
    .input(createParticipantInputSchema)
    .mutation(({ input }) => createParticipant(input)),
  
  getParticipants: publicProcedure
    .query(() => getParticipants()),
  
  addParticipantToConversation: publicProcedure
    .input(addParticipantToConversationInputSchema)
    .mutation(({ input }) => addParticipantToConversation(input)),
  
  getConversationParticipants: publicProcedure
    .input(z.number())
    .query(({ input }) => getConversationParticipants(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
