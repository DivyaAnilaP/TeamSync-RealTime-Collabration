import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Zap, Target, Flame, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface BadgesAndTitlesProps { user?: any; }

export const BadgesAndTitles: React.FC<BadgesAndTitlesProps> = ({ user }) => {
  const [stats, setStats] = useState({ tasksCompleted: 0, totalPoints: 0, streak: 0, messagesCount: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const userId = user?.id || (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return;

      const { data: tasks } = await supabase.from('tasks').select('status, points, updated_at').eq('created_by', userId);
      const completed = (tasks || []).filter(t => t.status === 'done');
      const totalPts = completed.reduce((s, t) => s + (t.points || 25), 0);

      // Calculate streak (consecutive days with completed tasks)
      const completedDates = [...new Set(completed.map(t => new Date(t.updated_at).toISOString().split('T')[0]))].sort().reverse();
      let streak = 0;
      const today = new Date().toISOString().split('T')[0];
      for (let i = 0; i < completedDates.length; i++) {
        const expected = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
        if (completedDates[i] === expected || (i === 0 && completedDates[0] === new Date(Date.now() - 86400000).toISOString().split('T')[0])) {
          streak++;
        } else break;
      }

      const { count } = await supabase.from('chat_messages').select('*', { count: 'exact', head: true }).eq('sender_id', userId);

      setStats({ tasksCompleted: completed.length, totalPoints: totalPts, streak, messagesCount: count || 0 });
    };
    fetchStats();
  }, [user?.id]);

  const badges = [
    { id: '1', name: 'First Task', description: 'Complete your first task', icon: Target, color: 'text-blue-500', rarity: 'common' as const, threshold: 1, current: stats.tasksCompleted, type: 'tasks' },
    { id: '2', name: 'Speed Demon', description: 'Complete 10 tasks', icon: Zap, color: 'text-yellow-500', rarity: 'rare' as const, threshold: 10, current: stats.tasksCompleted, type: 'tasks' },
    { id: '3', name: 'Task Master', description: 'Complete 50 tasks', icon: Trophy, color: 'text-purple-500', rarity: 'epic' as const, threshold: 50, current: stats.tasksCompleted, type: 'tasks' },
    { id: '4', name: 'Streak Master', description: '7-day work streak', icon: Flame, color: 'text-red-500', rarity: 'epic' as const, threshold: 7, current: stats.streak, type: 'streak' },
    { id: '5', name: 'Communicator', description: 'Send 50 messages', icon: Star, color: 'text-green-500', rarity: 'rare' as const, threshold: 50, current: stats.messagesCount, type: 'messages' },
    { id: '6', name: 'Point Collector', description: 'Earn 1000 points', icon: Award, color: 'text-orange-500', rarity: 'legendary' as const, threshold: 1000, current: stats.totalPoints, type: 'points' },
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) { case 'common': return 'border-gray-300 bg-gray-50'; case 'rare': return 'border-blue-300 bg-blue-50'; case 'epic': return 'border-purple-300 bg-purple-50'; case 'legendary': return 'border-yellow-300 bg-yellow-50'; default: return 'border-gray-300 bg-gray-50'; }
  };
  const getRarityBadgeColor = (rarity: string) => {
    switch (rarity) { case 'common': return 'bg-gray-100 text-gray-600'; case 'rare': return 'bg-blue-100 text-blue-600'; case 'epic': return 'bg-purple-100 text-purple-600'; case 'legendary': return 'bg-yellow-100 text-yellow-600'; default: return 'bg-gray-100 text-gray-600'; }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Trophy className="text-yellow-500" size={24} />Achievements & Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map(badge => {
              const Icon = badge.icon;
              const isEarned = badge.current >= badge.threshold;
              const progress = Math.min((badge.current / badge.threshold) * 100, 100);
              return (
                <div key={badge.id} className={`p-4 rounded-lg border-2 transition-all hover:shadow-lg ${isEarned ? getRarityColor(badge.rarity) : 'border-gray-200 bg-gray-100 opacity-60'}`}>
                  <div className="flex items-center justify-between mb-2"><Icon size={24} className={isEarned ? badge.color : 'text-gray-400'} /><Badge className={getRarityBadgeColor(badge.rarity)}>{badge.rarity}</Badge></div>
                  <h4 className={`font-semibold mb-1 ${isEarned ? 'text-gray-800' : 'text-gray-500'}`}>{badge.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
                  {isEarned ? (
                    <div className="flex items-center gap-2 text-xs text-green-600"><Award size={12} />Earned!</div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-purple-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} /></div>
                      <p className="text-xs text-gray-500">{badge.current}/{badge.threshold}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
