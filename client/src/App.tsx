
import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/utils/trpc';
import type { Conversation, ConversationWithMessages, ChatMode, CreateConversationInput, Participant } from '../../server/src/schema';
import { StartScreen } from '@/components/StartScreen';
import { ChatInterface } from '@/components/ChatInterface';
import { Sidebar } from '@/components/Sidebar';
import { ParticipantsSidebar } from '@/components/ParticipantsSidebar';

function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<ConversationWithMessages | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const loadConversations = useCallback(async () => {
    try {
      const result = await trpc.getConversations.query();
      setConversations(result);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  }, []);

  const loadParticipants = useCallback(async () => {
    try {
      const result = await trpc.getParticipants.query();
      setParticipants(result);
    } catch (error) {
      console.error('Failed to load participants:', error);
    }
  }, []);

  useEffect(() => {
    loadConversations();
    loadParticipants();
  }, [loadConversations, loadParticipants]);

  const handleCreateConversation = async (mode: ChatMode) => {
    setIsLoading(true);
    try {
      const input: CreateConversationInput = {
        title: `New ${mode.replace('_', ' ')} conversation`,
        mode,
      };
      const newConversation = await trpc.createConversation.mutate(input);
      
      // Fetch the full conversation with messages
      const fullConversation = await trpc.getConversation.query(newConversation.id);
      setActiveConversation(fullConversation);
      
      // Refresh conversations list
      await loadConversations();
    } catch (error) {
      console.error('Failed to create conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectConversation = async (conversationId: number) => {
    try {
      const conversation = await trpc.getConversation.query(conversationId);
      setActiveConversation(conversation);
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const handleBackToStart = () => {
    setActiveConversation(null);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Left Sidebar */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversation?.id || null}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleBackToStart}
      />

      {/* Main Content */}
      <div className="flex-1 flex">
        <div className={`flex-1 transition-all duration-300 ${
          activeConversation?.mode === 'group_chat' && isRightSidebarOpen 
            ? 'mr-80' 
            : ''
        }`}>
          {!activeConversation ? (
            <StartScreen
              onSelectMode={handleCreateConversation}
              isLoading={isLoading}
            />
          ) : (
            <ChatInterface
              conversation={activeConversation}
              onToggleRightSidebar={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
              isRightSidebarOpen={isRightSidebarOpen}
            />
          )}
        </div>

        {/* Right Sidebar for Group Chat */}
        {activeConversation?.mode === 'group_chat' && (
          <ParticipantsSidebar
            participants={activeConversation.participants}
            allParticipants={participants}
            conversationId={activeConversation.id}
            isOpen={isRightSidebarOpen}
            onToggle={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
