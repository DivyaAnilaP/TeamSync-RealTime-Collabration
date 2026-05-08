import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  sender: string;
  sender_id: string;
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };
  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    fetchMessages();

    // Subscribe to real-time messages
    const channel = supabase
      .channel(`chat-${workspace.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `workspace_id=eq.${workspace.id}`,
      }, async (payload) => {
        const newMsg = payload.new as any;
        if (newMsg.sender_id === user.id) return; // already added optimistically
        // Fetch sender profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', newMsg.sender_id)
          .maybeSingle();
        
        const senderName = profile?.display_name || 'Unknown';
        setMessages(prev => [...prev, {
          id: newMsg.id,
          sender: senderName,
          sender_id: newMsg.sender_id,
          content: newMsg.content,
          timestamp: new Date(newMsg.created_at),
          type: newMsg.type,
          avatar: senderName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
        }]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [workspace.id]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;

      const senderIds = [...new Set((data || []).map((msg: any) => msg.sender_id))];
      const { data: profiles } = senderIds.length > 0
        ? await supabase.from('profiles').select('user_id, display_name').in('user_id', senderIds)
        : { data: [] as any[] };

      const profileByUserId = new Map((profiles || []).map((profile: any) => [profile.user_id, profile.display_name]));

      setMessages((data || []).map((msg: any) => {
        const senderName = msg.sender_id === user.id ? user.name : (profileByUserId.get(msg.sender_id) || 'Team member');

        return {
          id: msg.id,
          sender: senderName,
          sender_id: msg.sender_id,
          content: msg.content,
          timestamp: new Date(msg.created_at),
          type: msg.type,
          avatar: msg.sender_id === user.id ? user.avatar : senderName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
        };
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally { setLoading(false); }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    // Optimistically add message
    const tempMsg: Message = {
      id: Date.now().toString(),
      sender: user.name,
      sender_id: user.id,
      content: newMessage,
      timestamp: new Date(),
      type: 'text',
      avatar: user.avatar,
    };
    setMessages(prev => [...prev, tempMsg]);
    setNewMessage('');
    onPointsEarned(5);

    try {
      const { error } = await supabase.from('chat_messages').insert({
        content: newMessage,
        sender_id: user.id,
        workspace_id: workspace.id,
        type: 'text',
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Team Chat</h2>
        <div className="flex items-center gap-2 text-sm text-gray-500"><div className="w-2 h-2 bg-green-400 rounded-full"></div><span>Live</span></div>
      </div>
      <Card className="flex-1 flex flex-col border-purple-200">
        <CardContent className="flex-1 flex flex-col p-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading && <p className="text-center text-gray-500">Loading messages...</p>}
            {!loading && messages.length === 0 && <p className="text-center text-gray-500 py-8">No messages yet. Start the conversation!</p>}
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.sender_id === user.id ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${message.sender_id === user.id ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-gradient-to-r from-green-500 to-teal-500'}`}>{message.avatar}</div>
                <div className={`max-w-xs lg:max-w-md ${message.sender_id === user.id ? 'text-right' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-700">{message.sender}</span>
                    <span className="text-xs text-gray-500">{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className={`rounded-lg p-3 ${message.sender_id === user.id ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}>{message.content}</div>
                </div>
              </div>
            ))}
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
