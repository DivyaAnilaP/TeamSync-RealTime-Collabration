import React from 'react';
import { Trophy, Star, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface GamificationProps { points: number; user: any; workspace: any; }
interface LeaderboardEntry { rank: number; name: string; points: number; avatar: string; achievements: string[]; }
interface Achievement { id: string; title: string; description: string; icon: React.ReactNode; earned: boolean; progress?: number; maxProgress?: number; }

export const Gamification: React.FC<GamificationProps> = ({ points, user, workspace }) => {
  const leaderboard: LeaderboardEntry[] = [
    { rank: 1, name: 'Sarah Chen', points: 2840, avatar: 'SC', achievements: ['Task Master', 'Team Player', 'Early Bird'] },
    { rank: 2, name: 'You', points: points, avatar: 'YU', achievements: ['Communicator', 'Problem Solver'] },
    { rank: 3, name: 'Alex Rodriguez', points: 1890, avatar: 'AR', achievements: ['Documentation Hero', 'Code Review Champion'] },
    { rank: 4, name: 'Mike Johnson', points: 1650, avatar: 'MJ', achievements: ['Bug Hunter', 'Feature Creator'] }
  ];

  const achievements: Achievement[] = [
    { id: '1', title: 'First Task', description: 'Complete your first task', icon: <Target className="text-green-500" />, earned: true },
    { id: '2', title: 'Communicator', description: 'Send 50 messages', icon: <Star className="text-blue-500" />, earned: true },
    { id: '3', title: 'Task Master', description: 'Complete 10 tasks', icon: <Trophy className="text-yellow-500" />, earned: false, progress: 7, maxProgress: 10 },
    { id: '4', title: 'Team Player', description: 'Help 5 team members', icon: <TrendingUp className="text-purple-500" />, earned: false, progress: 3, maxProgress: 5 }
  ];

  const getCurrentLevel = (points: number) => { const level = Math.floor(points / 500) + 1; const pointsInLevel = points % 500; const pointsToNext = 500 - pointsInLevel; return { level, pointsInLevel, pointsToNext }; };
  const { level, pointsInLevel, pointsToNext } = getCurrentLevel(points);

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
            {leaderboard.map((entry) => (
              <div key={entry.rank} className={`flex items-center gap-3 p-3 rounded-lg ${entry.name === 'You' ? 'bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200' : 'bg-gray-50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${entry.rank === 1 ? 'bg-yellow-500' : entry.rank === 2 ? 'bg-gray-400' : entry.rank === 3 ? 'bg-amber-600' : 'bg-gray-500'}`}>{entry.rank}</div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${entry.name === 'You' ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-gradient-to-r from-green-500 to-teal-500'}`}>{entry.avatar}</div>
                <div className="flex-1"><div className="flex items-center gap-2"><span className="font-semibold">{entry.name}</span>{entry.name === 'You' && <Badge variant="secondary">You</Badge>}</div><p className="text-sm text-gray-600">{entry.points.toLocaleString()} points</p></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card className="border-purple-200">
        <CardHeader><CardTitle className="flex items-center gap-2"><Star className="text-purple-500" />Achievements</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <div key={achievement.id} className={`p-4 rounded-lg border-2 ${achievement.earned ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center gap-3 mb-2">{achievement.icon}<div><h4 className="font-semibold">{achievement.title}</h4><p className="text-sm text-gray-600">{achievement.description}</p></div></div>
                {!achievement.earned && achievement.progress && achievement.maxProgress && (
                  <div className="mt-3"><div className="flex justify-between text-xs mb-1"><span>Progress</span><span>{achievement.progress}/{achievement.maxProgress}</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full" style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }} /></div></div>
                )}
                {achievement.earned && <Badge className="mt-2 bg-green-500">Earned!</Badge>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
