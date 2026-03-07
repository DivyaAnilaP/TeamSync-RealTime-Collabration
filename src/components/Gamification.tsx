import React, { useState, useEffect } from 'react';
import { Trophy, Star, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface GamificationProps { points: number; user: any; workspace: any; }

export const Gamification: React.FC<GamificationProps> = ({ points, user, workspace }) => {
  const [leaderboard, setLeaderboard] = useState<{ user_id: string; display_name: string; avatar: string; points: number }[]>([]);
  const [taskStats, setTaskStats] = useState({ completed: 0, total: 0 });

  useEffect(() => {
    const fetchLeaderboard = async () => {
      // Get workspace members
      const { data: members } = await supabase
        .from('workspace_members')
        .select('user_id')
        .eq('workspace_id', workspace.id);
      if (!members) return;

      const userIds = members.map(m => m.user_id);
      const { data: profiles } = await supabase.from('profiles').select('user_id, display_name, email').in('user_id', userIds);

      // Count completed tasks per user
      const { data: tasks } = await supabase
        .from('tasks')
        .select('created_by, status, points')
        .eq('workspace_id', workspace.id);

      const pointsMap: Record<string, number> = {};
      let myCompleted = 0, myTotal = 0;
      (tasks || []).forEach(t => {
        if (t.created_by === user.id) myTotal++;
        if (t.status === 'done') {
          pointsMap[t.created_by] = (pointsMap[t.created_by] || 0) + (t.points || 25);
          if (t.created_by === user.id) myCompleted++;
        }
      });
      setTaskStats({ completed: myCompleted, total: myTotal });

      const board = (profiles || []).map(p => ({
        user_id: p.user_id,
        display_name: p.display_name || p.email?.split('@')[0] || 'User',
        avatar: (p.display_name || p.email || 'U').substring(0, 2).toUpperCase(),
        points: pointsMap[p.user_id] || 0,
      })).sort((a, b) => b.points - a.points);

      setLeaderboard(board);
    };
    fetchLeaderboard();
  }, [workspace.id, points]);

  const getCurrentLevel = (pts: number) => {
    const level = Math.floor(pts / 500) + 1;
    const pointsInLevel = pts % 500;
    return { level, pointsInLevel, pointsToNext: 500 - pointsInLevel };
  };
  const { level, pointsInLevel, pointsToNext } = getCurrentLevel(points);

  const achievements = [
    { id: '1', title: 'First Task', description: 'Complete your first task', icon: <Target className="text-green-500" />, earned: taskStats.completed >= 1, progress: Math.min(taskStats.completed, 1), max: 1 },
    { id: '2', title: 'Task Master', description: 'Complete 10 tasks', icon: <Trophy className="text-yellow-500" />, earned: taskStats.completed >= 10, progress: Math.min(taskStats.completed, 10), max: 10 },
    { id: '3', title: 'Overachiever', description: 'Complete 50 tasks', icon: <Star className="text-purple-500" />, earned: taskStats.completed >= 50, progress: Math.min(taskStats.completed, 50), max: 50 },
    { id: '4', title: 'Point Collector', description: 'Earn 1000 points', icon: <TrendingUp className="text-blue-500" />, earned: points >= 1000, progress: Math.min(points, 1000), max: 1000 },
  ];

  return (
    <div className="h-full space-y-6">
      <div className="flex items-center justify-between"><h2 className="text-3xl font-bold text-gray-800">Leaderboard & Achievements</h2></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-purple-200">
          <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="text-yellow-500" />Your Progress</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center"><div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Level {level}</div><p className="text-gray-600">{points.toLocaleString()} total points</p></div>
            <div className="space-y-2"><div className="flex justify-between text-sm"><span>Progress to Level {level + 1}</span><span>{pointsInLevel}/500</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${(pointsInLevel / 500) * 100}%` }} /></div><p className="text-xs text-gray-500 text-center">{pointsToNext} points to next level</p></div>
          </CardContent>
        </Card>
        <Card className="border-purple-200">
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="text-green-500" />Team Rankings</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {leaderboard.length === 0 && <p className="text-center text-gray-500 py-4">No team members yet</p>}
            {leaderboard.map((entry, idx) => (
              <div key={entry.user_id} className={`flex items-center gap-3 p-3 rounded-lg ${entry.user_id === user.id ? 'bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200' : 'bg-gray-50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-amber-600' : 'bg-gray-500'}`}>{idx + 1}</div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${entry.user_id === user.id ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-gradient-to-r from-green-500 to-teal-500'}`}>{entry.avatar}</div>
                <div className="flex-1"><div className="flex items-center gap-2"><span className="font-semibold">{entry.display_name}</span>{entry.user_id === user.id && <Badge variant="secondary">You</Badge>}</div><p className="text-sm text-gray-600">{entry.points.toLocaleString()} points</p></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card className="border-purple-200">
        <CardHeader><CardTitle className="flex items-center gap-2"><Star className="text-purple-500" />Achievements</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map(a => (
              <div key={a.id} className={`p-4 rounded-lg border-2 ${a.earned ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center gap-3 mb-2">{a.icon}<div><h4 className="font-semibold">{a.title}</h4><p className="text-sm text-gray-600">{a.description}</p></div></div>
                {!a.earned && (
                  <div className="mt-3"><div className="flex justify-between text-xs mb-1"><span>Progress</span><span>{a.progress}/{a.max}</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full" style={{ width: `${(a.progress / a.max) * 100}%` }} /></div></div>
                )}
                {a.earned && <Badge className="mt-2 bg-green-500">Earned!</Badge>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
