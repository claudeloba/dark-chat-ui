
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, MessageSquare } from 'lucide-react';
import type { Conversation } from '../../../server/src/schema';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: number | null;
  onSelectConversation: (id: number) => void;
  onNewChat: () => void;
}

export function Sidebar({ 
  conversations, 
  activeConversationId, 
  onSelectConversation, 
  onNewChat 
}: SidebarProps) {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'smart_answer':
        return '🧠';
      case 'group_chat':
        return '👥';
      case 'autopilot':
        return '🚀';
      default:
        return '💬';
    }
  };

  return (
    <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <Button
          onClick={onNewChat}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2 py-3"
        >
          <Plus size={20} />
          New Chat
        </Button>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-30" />
              <p>No conversations yet</p>
              <p className="text-sm mt-1">Create your first chat above</p>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conversation: Conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                  className={`p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                    activeConversationId === conversation.id
                      ? 'bg-blue-600/20 border border-blue-500/30'
                      : 'bg-gray-700/50 hover:bg-gray-700 border border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-xl mt-0.5">
                      {getModeIcon(conversation.mode)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate text-sm">
                        {conversation.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400 capitalize">
                          {conversation.mode.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">
                          {formatDate(conversation.updated_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
