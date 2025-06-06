
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Users } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { Participant, AddParticipantToConversationInput } from '../../../server/src/schema';

interface ParticipantsSidebarProps {
  participants: Participant[];
  allParticipants: Participant[];
  conversationId: number;
  isOpen: boolean;
  onToggle: () => void;
}

export function ParticipantsSidebar({ 
  participants, 
  allParticipants,
  conversationId,
  isOpen, 
  onToggle 
}: ParticipantsSidebarProps) {
  const [selectedParticipantId, setSelectedParticipantId] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);

  const availableParticipants = allParticipants.filter(
    p => !participants.some(cp => cp.id === p.id)
  );

  const handleAddParticipant = async () => {
    if (!selectedParticipantId) return;

    setIsAdding(true);
    try {
      const input: AddParticipantToConversationInput = {
        conversation_id: conversationId,
        participant_id: parseInt(selectedParticipantId),
      };
      
      await trpc.addParticipantToConversation.mutate(input);
      setSelectedParticipantId('');
      // In a real app, you'd refresh the conversation data
    } catch (error) {
      console.error('Failed to add participant:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div
      className={`fixed right-0 top-0 h-full w-80 bg-gray-800 border-l border-gray-700 transform transition-transform duration-300 z-40 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={20} className="text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Participants</h2>
          <span className="text-sm text-gray-400">({participants.length})</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="text-gray-400 hover:text-white"
        >
          <X size={18} />
        </Button>
      </div>

      {/* Add Participant */}
      {availableParticipants.length > 0 && (
        <div className="p-4 border-b border-gray-700">
          <div className="space-y-3">
            <Select value={selectedParticipantId} onValueChange={setSelectedParticipantId}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Add participant..." />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {availableParticipants.map((participant: Participant) => (
                  <SelectItem 
                    key={participant.id} 
                    value={participant.id.toString()}
                    className="text-white hover:bg-gray-600"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={participant.avatar_url || undefined} />
                        <AvatarFallback className="bg-blue-600 text-white text-xs">
                          {participant.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {participant.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleAddParticipant}
              disabled={!selectedParticipantId || isAdding}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
              size="sm"
            >
              <Plus size={16} className="mr-2" />
              {isAdding ? 'Adding...' : 'Add Participant'}
            </Button>
          </div>
        </div>
      )}

      {/* Participants List */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {participants.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users size={48} className="mx-auto mb-4 opacity-30" />
              <p>No participants yet</p>
              <p className="text-sm mt-1">Add some above to start collaborating</p>
            </div>
          ) : (
            <div className="space-y-3">
              {participants.map((participant: Participant) => (
                <div
                  key={participant.id}
                  className="p-3 bg-gray-700/50 rounded-xl border border-gray-600/50 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={participant.avatar_url || undefined} />
                      <AvatarFallback className="bg-blue-600 text-white">
                        {participant.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white text-sm truncate">
                        {participant.name}
                      </h3>
                      {participant.description && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                          {participant.description}
                        </p>
                      )}
                      <div className="text-xs text-gray-500 mt-2">
                        Joined {participant.created_at.toLocaleDateString()}
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
