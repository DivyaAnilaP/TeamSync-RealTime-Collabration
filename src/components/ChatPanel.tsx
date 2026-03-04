import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'file';
  avatar: string;
}

interface ChatPanelProps {
  onPointsEarned: (points: number) => void;
  user: any;
  workspace: any;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ onPointsEarned, user, workspace }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'Sarah Chen', content: 'Hey everyone! Just finished the wireframes for the new dashboard. Ready for review!', timestamp: new Date(Date.now() - 3600000), type: 'text', avatar: 'SC' },
    { id: '2', sender: 'Mike Johnson', content: "Great work Sarah! I'll take a look and give feedback by EOD.", timestamp: new Date(Date.now() - 3300000), type: 'text', avatar: 'MJ' },
    { id: '3', sender: 'Alex Rodriguez', content: 'The API documentation is now complete. All endpoints are documented with examples.', timestamp: new Date(Date.now() - 1800000), type: 'text', avatar: 'AR' }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };
  useEffect(() => { scrollToBottom(); }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const message: Message = { id: Date.now().toString(), sender: 'You', content: newMessage, timestamp: new Date(), type: 'text', avatar: 'YU' };
    setMessages(prev => [...prev, message]);
    setNewMessage('');
    onPointsEarned(5);
    toast({ title: "Message Sent! 📨", description: "You earned 5 points for team communication" });

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const responses = ["Thanks for the update!", "Looks good to me 👍", "I'll check this out shortly", "Great progress everyone!", "Let me know if you need any help"];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: 'Team Bot', content: randomResponse, timestamp: new Date(), type: 'text', avatar: 'TB' }]);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Team Chat</h2>
        <div className="flex items-center gap-2 text-sm text-gray-500"><div className="w-2 h-2 bg-green-400 rounded-full"></div><span>3 members online</span></div>
      </div>
      <Card className="flex-1 flex flex-col border-purple-200">
        <CardContent className="flex-1 flex flex-col p-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.sender === 'You' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${message.sender === 'You' ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-gradient-to-r from-green-500 to-teal-500'}`}>{message.avatar}</div>
                <div className={`max-w-xs lg:max-w-md ${message.sender === 'You' ? 'text-right' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-700">{message.sender}</span>
                    <span className="text-xs text-gray-500">{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className={`rounded-lg p-3 ${message.sender === 'You' ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}>{message.content}</div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold">TB</div>
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-2">
              <Button variant="outline" size="sm"><Paperclip size={16} /></Button>
              <Button variant="outline" size="sm"><Smile size={16} /></Button>
              <div className="flex-1 flex gap-2">
                <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={handleKeyPress} placeholder="Type your message..." className="flex-1 p-2 border border-gray-300 rounded-md resize-none" rows={1} />
                <Button onClick={sendMessage} className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"><Send size={16} /></Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
