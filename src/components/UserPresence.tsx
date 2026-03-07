import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserPresenceProps {
  currentUser: any;
  workspace: any;
}

export const UserPresence: React.FC<UserPresenceProps> = ({ currentUser, workspace }) => {
  const [members, setMembers] = useState<{ user_id: string; display_name: string; avatar: string }[]>([]);

  useEffect(() => {
    const fetchMembers = async () => {
      const { data } = await supabase
        .from('workspace_members')
        .select('user_id')
        .eq('workspace_id', workspace.id);
      if (!data) return;

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, email')
        .in('user_id', data.map(m => m.user_id));

      if (profiles) {
        setMembers(profiles.map(p => ({
          user_id: p.user_id,
          display_name: p.display_name || p.email?.split('@')[0] || 'User',
          avatar: (p.display_name || p.email || 'U').substring(0, 2).toUpperCase()
        })));
      }
    };
    fetchMembers();
  }, [workspace.id]);

  return (
    <div className="flex items-center gap-4">
      <div className="text-sm text-gray-600">
        <span className="font-medium">{members.length}</span> member{members.length !== 1 ? 's' : ''}
      </div>
      <div className="flex -space-x-2">
        {members.map((member) => (
          <div key={member.user_id} className="relative group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white">
              {member.avatar}
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white bg-green-400" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {member.display_name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
