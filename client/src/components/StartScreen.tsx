
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { ChatMode } from '../../../server/src/schema';

interface StartScreenProps {
  onSelectMode: (mode: ChatMode) => void;
  isLoading: boolean;
}

export function StartScreen({ onSelectMode, isLoading }: StartScreenProps) {
  const modes = [
    {
      id: 'smart_answer' as ChatMode,
      title: 'Smart Answer',
      description: 'Get intelligent answers to your questions',
      preview: <SmartAnswerPreview />,
    },
    {
      id: 'group_chat' as ChatMode,
      title: 'Group Chat',
      description: 'Collaborate with AI participants',
      preview: <GroupChatPreview />,
    },
    {
      id: 'autopilot' as ChatMode,
      title: 'AutoPilot',
      description: 'Let AI take control and explore ideas',
      preview: <AutoPilotPreview />,
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-gray-900">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Welcome to ChatBot AI
          </h1>
          <p className="text-xl text-gray-400">
            Choose your preferred chat mode to get started
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {modes.map((mode) => (
            <Card
              key={mode.id}
              className="group relative overflow-hidden bg-gray-800/50 border-gray-700 hover:border-gray-600 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
              onClick={() => !isLoading && onSelectMode(mode.id)}
            >
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-2xl font-semibold mb-2 text-white group-hover:text-blue-400 transition-colors">
                    {mode.title}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {mode.description}
                  </p>
                </div>

                {/* Preview Section */}
                <div className="h-40 bg-gray-900/50 rounded-xl p-4 mb-6 overflow-hidden">
                  {mode.preview}
                </div>

                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : `Start ${mode.title}`}
                </Button>
              </div>

              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function SmartAnswerPreview() {
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <div className="bg-blue-600 text-white px-3 py-2 rounded-xl text-sm max-w-32">
          What is AI?
        </div>
      </div>
      <div className="flex justify-start">
        <div className="bg-gray-700 text-white px-3 py-2 rounded-xl text-sm max-w-36">
          AI is artificial intelligence that can think and learn...
        </div>
      </div>
    </div>
  );
}

function GroupChatPreview() {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs">A</div>
        <div className="bg-gray-700 text-white px-2 py-1 rounded-lg text-xs">Hello everyone!</div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs">B</div>
        <div className="bg-gray-700 text-white px-2 py-1 rounded-lg text-xs">Great to be here</div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs">C</div>
        <div className="bg-gray-700 text-white px-2 py-1 rounded-lg text-xs">Let's collaborate!</div>
      </div>
    </div>
  );
}

function AutoPilotPreview() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
      <div className="text-sm text-gray-400 animate-pulse">AI is thinking...</div>
      <div className="mt-3 space-y-1">
        <div className="h-2 bg-gray-700 rounded animate-pulse w-24"></div>
        <div className="h-2 bg-gray-700 rounded animate-pulse w-20"></div>
        <div className="h-2 bg-gray-700 rounded animate-pulse w-28"></div>
      </div>
    </div>
  );
}
