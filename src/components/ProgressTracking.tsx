import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Shield, Users, TrendingUp, Clock, Target, Calendar, BarChart3 } from 'lucide-react';

interface TeamMember { id: string; name: string; role: string; avatar: string; tasksCompleted: number; hoursWorked: number; productivity: number; currentTask: string; lastActive: Date; weeklyGoal: number; achievements: string[]; }
interface ProgressTrackingProps { userRole?: 'manager' | 'team-lead' | 'member'; user: any; workspace: any; }

export const ProgressTracking: React.FC<ProgressTrackingProps> = ({ userRole = 'member', user, workspace }) => {
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');

  const [teamMembers] = useState<TeamMember[]>([
    { id: '1', name: 'Sarah Chen', role: 'Senior Developer', avatar: 'SC', tasksCompleted: 23, hoursWorked: 38, productivity: 92, currentTask: 'Implementing user authentication', lastActive: new Date(Date.now() - 300000), weeklyGoal: 25, achievements: ['Code Quality Champion', 'Team Player'] },
    { id: '2', name: 'Mike Johnson', role: 'Full Stack Developer', avatar: 'MJ', tasksCompleted: 19, hoursWorked: 35, productivity: 87, currentTask: 'Database optimization', lastActive: new Date(Date.now() - 600000), weeklyGoal: 20, achievements: ['Performance Optimizer'] },
    { id: '3', name: 'Alex Rodriguez', role: 'Frontend Developer', avatar: 'AR', tasksCompleted: 21, hoursWorked: 40, productivity: 89, currentTask: 'UI component refactoring', lastActive: new Date(Date.now() - 180000), weeklyGoal: 22, achievements: ['UI/UX Excellence', 'Innovation Award'] },
    { id: '4', name: 'Emma Wilson', role: 'Backend Developer', avatar: 'EW', tasksCompleted: 17, hoursWorked: 32, productivity: 85, currentTask: 'API documentation', lastActive: new Date(Date.now() - 900000), weeklyGoal: 18, achievements: ['Documentation Master'] }
  ]);

  const canViewProgress = userRole === 'manager' || userRole === 'team-lead';
  const getProductivityColor = (score: number) => { if (score >= 90) return 'text-green-600 bg-green-50'; if (score >= 80) return 'text-yellow-600 bg-yellow-50'; return 'text-red-600 bg-red-50'; };
  const getLastActiveText = (lastActive: Date) => { const diff = Date.now() - lastActive.getTime(); const minutes = Math.floor(diff / 60000); if (minutes < 1) return 'Just now'; if (minutes < 60) return `${minutes}m ago`; return `${Math.floor(minutes / 60)}h ago`; };
  const getGoalProgress = (completed: number, goal: number) => Math.min((completed / goal) * 100, 100);

  if (!canViewProgress) {
    return (<Card><CardContent className="p-8 text-center"><Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-semibold text-gray-700 mb-2">Access Restricted</h3><p className="text-gray-500">Only managers and team leads can view team progress tracking.</p><p className="text-sm text-gray-400 mt-2">Current role: {userRole} in {workspace.name}</p></CardContent></Card>);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2"><BarChart3 className="text-blue-500" size={24} />Team Progress Tracking - {workspace.name}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-600"><Shield size={12} className="mr-1" />{userRole} access</Badge>
              <div className="flex gap-1">
                <button onClick={() => setViewMode('overview')} className={`px-3 py-1 rounded text-sm ${viewMode === 'overview' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-600'}`}>Overview</button>
                <button onClick={() => setViewMode('detailed')} className={`px-3 py-1 rounded text-sm ${viewMode === 'detailed' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-600'}`}>Detailed</button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Users className="text-green-500" size={20} />Team Performance Overview</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center"><Target className="w-6 h-6 text-blue-600 mx-auto mb-2" /><p className="text-2xl font-bold text-blue-600">{teamMembers.reduce((sum, m) => sum + m.tasksCompleted, 0)}</p><p className="text-sm text-blue-600">Total Tasks Completed</p></div>
            <div className="bg-green-50 p-4 rounded-lg text-center"><Clock className="w-6 h-6 text-green-600 mx-auto mb-2" /><p className="text-2xl font-bold text-green-600">{teamMembers.reduce((sum, m) => sum + m.hoursWorked, 0)}h</p><p className="text-sm text-green-600">Total Hours Worked</p></div>
            <div className="bg-purple-50 p-4 rounded-lg text-center"><TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-2" /><p className="text-2xl font-bold text-purple-600">{Math.round(teamMembers.reduce((sum, m) => sum + m.productivity, 0) / teamMembers.length)}%</p><p className="text-sm text-purple-600">Avg Productivity</p></div>
            <div className="bg-orange-50 p-4 rounded-lg text-center"><Users className="w-6 h-6 text-orange-600 mx-auto mb-2" /><p className="text-2xl font-bold text-orange-600">{teamMembers.filter(m => Date.now() - m.lastActive.getTime() < 600000).length}</p><p className="text-sm text-orange-600">Active Now</p></div>
          </div>
          <div className="space-y-4">
            {teamMembers.map(member => (
              <div key={member.id} className={`border rounded-lg p-4 transition-all hover:shadow-md cursor-pointer ${selectedMember === member.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`} onClick={() => setSelectedMember(selectedMember === member.id ? null : member.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">{member.avatar}</div><div><h4 className="font-semibold">{member.name}</h4><p className="text-sm text-gray-600">{member.role}</p></div></div>
                  <div className="flex items-center gap-4"><div className="text-center"><p className="text-sm font-medium">{member.tasksCompleted}/{member.weeklyGoal}</p><p className="text-xs text-gray-500">Tasks</p></div><div className="text-center"><p className="text-sm font-medium">{member.hoursWorked}h</p><p className="text-xs text-gray-500">Worked</p></div><div className="text-center"><Badge className={getProductivityColor(member.productivity)}>{member.productivity}%</Badge></div><div className="text-center"><p className="text-xs text-gray-500">{getLastActiveText(member.lastActive)}</p></div></div>
                </div>
                <div className="mt-3"><div className="flex justify-between text-xs mb-1"><span>Weekly Goal Progress</span><span>{Math.round(getGoalProgress(member.tasksCompleted, member.weeklyGoal))}%</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all" style={{ width: `${getGoalProgress(member.tasksCompleted, member.weeklyGoal)}%` }} /></div></div>
                {selectedMember === member.id && viewMode === 'detailed' && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                    <div><h5 className="font-medium text-sm mb-1">Current Task</h5><p className="text-sm text-gray-600">{member.currentTask}</p></div>
                    <div><h5 className="font-medium text-sm mb-2">Achievements</h5><div className="flex gap-2">{member.achievements.map((a, i) => (<Badge key={i} variant="outline" className="text-xs">{a}</Badge>))}</div></div>
                    <div className="flex gap-2"><Button size="sm" variant="outline"><Eye size={12} className="mr-1" />View Details</Button><Button size="sm" variant="outline"><Calendar size={12} className="mr-1" />Schedule 1:1</Button></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
