import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Zap, Target, Crown, Flame, Award, Clock } from 'lucide-react';

interface UserBadge {
  id: string; name: string; description: string; icon: React.ComponentType<any>; color: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary'; earnedAt?: Date; progress?: number; requirement?: string;
}

interface UserTitle {
  id: string; name: string; description: string; requirement: string; isActive: boolean; isUnlocked: boolean; prestigeLevel?: number;
}

export const BadgesAndTitles: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'badges' | 'titles'>('badges');

  const availableBadges: UserBadge[] = [
    { id: '1', name: 'Task Master', description: 'Completed 50 tasks', icon: Target, color: 'text-blue-500', rarity: 'common', earnedAt: new Date(), progress: 100 },
    { id: '2', name: 'Speed Demon', description: 'Completed 10 tasks in one day', icon: Zap, color: 'text-yellow-500', rarity: 'rare', earnedAt: new Date(Date.now() - 86400000), progress: 100 },
    { id: '3', name: 'Team Player', description: 'Helped 20 team members', icon: Star, color: 'text-purple-500', rarity: 'epic', progress: 85, requirement: '17/20 helped' },
    { id: '4', name: 'Code Warrior', description: 'Wrote 10,000 lines of code', icon: Crown, color: 'text-orange-500', rarity: 'legendary', progress: 75, requirement: '7,500/10,000 lines' },
    { id: '5', name: 'Streak Master', description: '30-day work streak', icon: Flame, color: 'text-red-500', rarity: 'epic', earnedAt: new Date(Date.now() - 172800000), progress: 100 },
    { id: '6', name: 'Early Bird', description: 'Start work before 8 AM for 5 days', icon: Clock, color: 'text-green-500', rarity: 'common', progress: 60, requirement: '3/5 early starts' }
  ];

  const availableTitles: UserTitle[] = [
    { id: '1', name: 'Senior Developer', description: 'Recognized technical expertise', requirement: 'Complete 100 tasks and mentor 5 team members', isActive: true, isUnlocked: true, prestigeLevel: 2 },
    { id: '2', name: 'Team Lead', description: 'Leadership and coordination skills', requirement: 'Lead 3 projects and achieve 90% team satisfaction', isActive: false, isUnlocked: true },
    { id: '3', name: 'Code Ninja', description: 'Elite programming skills', requirement: 'Write 50,000 lines of code with 95% quality score', isActive: false, isUnlocked: false },
    { id: '4', name: 'Innovation Champion', description: 'Pioneer of new ideas', requirement: 'Propose and implement 10 successful features', isActive: false, isUnlocked: false },
    { id: '5', name: 'Productivity Guru', description: 'Master of efficiency', requirement: 'Maintain 95% task completion rate for 3 months', isActive: false, isUnlocked: true }
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
          <CardTitle className="flex items-center gap-2"><Trophy className="text-yellow-500" size={24} />Achievements & Recognition</CardTitle>
          <div className="flex gap-2">
            <button onClick={() => setActiveTab('badges')} className={`px-4 py-2 rounded ${activeTab === 'badges' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-600'}`}>Badges</button>
            <button onClick={() => setActiveTab('titles')} className={`px-4 py-2 rounded ${activeTab === 'titles' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-600'}`}>Titles</button>
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === 'badges' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableBadges.map(badge => {
                const Icon = badge.icon;
                const isEarned = badge.earnedAt !== undefined;
                return (
                  <div key={badge.id} className={`p-4 rounded-lg border-2 transition-all hover:shadow-lg ${isEarned ? getRarityColor(badge.rarity) : 'border-gray-200 bg-gray-100 opacity-60'}`}>
                    <div className="flex items-center justify-between mb-2"><Icon size={24} className={isEarned ? badge.color : 'text-gray-400'} /><Badge className={getRarityBadgeColor(badge.rarity)}>{badge.rarity}</Badge></div>
                    <h4 className={`font-semibold mb-1 ${isEarned ? 'text-gray-800' : 'text-gray-500'}`}>{badge.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
                    {isEarned ? (<div className="flex items-center gap-2 text-xs text-green-600"><Award size={12} />Earned {badge.earnedAt?.toLocaleDateString()}</div>) : (
                      <div className="space-y-2">
                        {badge.progress !== undefined && (<div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-purple-500 h-2 rounded-full transition-all" style={{ width: `${badge.progress}%` }} /></div>)}
                        {badge.requirement && <p className="text-xs text-gray-500">{badge.requirement}</p>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {activeTab === 'titles' && (
            <div className="space-y-4">
              {availableTitles.map(title => (
                <div key={title.id} className={`p-4 rounded-lg border-2 transition-all ${title.isUnlocked ? title.isActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300 bg-white hover:bg-gray-50' : 'border-gray-200 bg-gray-100 opacity-60'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-semibold ${title.isUnlocked ? 'text-gray-800' : 'text-gray-500'}`}>{title.name}</h4>
                        {title.prestigeLevel && <Badge variant="outline" className="text-xs">★{title.prestigeLevel}</Badge>}
                        {title.isActive && <Badge className="bg-purple-500 text-white">Active</Badge>}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{title.description}</p>
                      <p className="text-xs text-gray-500">Requirement: {title.requirement}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {title.isUnlocked && !title.isActive && <button className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600">Activate</button>}
                      {!title.isUnlocked && <Badge variant="outline" className="text-xs">Locked</Badge>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
