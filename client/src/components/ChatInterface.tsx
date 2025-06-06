
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Users } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { ConversationWithMessages, CreateMessageInput } from '../../../server/src/schema';

interface ChatInterfaceProps {
  conversation: ConversationWithMessages;
  onToggleRightSidebar: () => void;
  isRightSidebarOpen: boolean;
}

export function ChatInterface({ 
  conversation, 
  onToggleRightSidebar, 
  isRightSidebarOpen 
}: ChatInterfaceProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const input: CreateMessageInput = {
        conversation_id: conversation.id,
        role: 'user',
        content: message.trim(),
        participant_id: null,
      };
      
      await trpc.createMessage.mutate(input);
      setMessage('');
      // In a real app, you'd want to refresh the conversation or use real-time updates
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getParticipantInfo = (participantId: number | null) => {
    if (!participantId) return null;
    return conversation.participants.find(p => p.id === participantId);
  };

  const getModeTitle = (mode: string) => {
    switch (mode) {
      case 'smart_answer':
        return '🧠 Smart Answer';
      case 'group_chat':
        return '👥 Group Chat';
      case 'autopilot':
        return '🚀 AutoPilot';
      default:
        return mode;
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800/50">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-white">
            {getModeTitle(conversation.mode)}
          </h1>
          <span className="text-sm text-gray-400">•</span>
          <span className="text-sm text-gray-400 truncate max-w-xs">
            {conversation.title}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {conversation.mode === 'group_chat' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleRightSidebar}
              className={`text-gray-400 hover:text-white ${
                isRightSidebarOpen ? 'bg-gray-700' : ''
              }`}
            >
              <Users size={18} />
              <span className="ml-2 hidden sm:inline">
                Participants ({conversation.participants.length})
              </span>
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          {conversation.messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">
                {conversation.mode === 'smart_answer' && '🧠'}
                {conversation.mode === 'group_chat' && '👥'}
                {conversation.mode === 'autopilot' && '🚀'}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {getModeTitle(conversation.mode)}
              </h3>
              <p className="text-gray-400">
                Start a conversation by typing a message below
              </p>
            </div>
          ) : (
            conversation.messages.map((msg) => {
              const participant = getParticipantInfo(msg.participant_id);
              const isUser = msg.role === 'user';
              
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <Avatar className="w-8 h-8 mt-1">
                      <AvatarImage src={participant?.avatar_url || undefined} />
                      <AvatarFallback className="bg-blue-600 text-white text-sm">
                        {participant ? participant.name.charAt(0).toUpperCase() : 'AI'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={`max-w-md ${isUser ? 'order-1' : ''}`}>
                    {!isUser && participant && (
                      <div className="text-xs text-gray-400 mb-1 ml-1">
                        {participant.name}
                      </div>
                    )}
                    <div
                      className={`px-4 py-3 rounded-2xl ${
                        isUser
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-white'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                      <div className={`text-xs mt-2 ${
                        isUser ? 'text-blue-200' : 'text-gray-400'
                      }`}>
                        {msg.created_at.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                  
                  {isUser && (
                    <Avatar className="w-8 h-8 mt-1">
                      <AvatarFallback className="bg-gray-600 text-white text-sm">
                        You
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-700 bg-gray-800/50">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <Input
              value={message}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400 rounded-xl focus:border-blue-500"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={!message.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4"
            >
              <Send size={18} />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
