import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, TrendingUp, Clock, Target, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProgressTrackingProps { userRole?: 'manager' | 'team-lead' | 'member'; user: any; workspace: any; }

export const ProgressTracking: React.FC<ProgressTrackingProps> = ({ userRole = 'member', user, workspace }) => {
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const canViewProgress = userRole === 'manager' || userRole === 'team-lead';

  useEffect(() => {
    if (!canViewProgress) { setLoading(false); return; }
    const fetchTeamData = async () => {
      try {
        const { data: members } = await supabase.from('workspace_members').select('user_id').eq('workspace_id', workspace.id);
        if (!members) return;

        const userIds = members.map(m => m.user_id);
        const { data: profiles } = await supabase.from('profiles').select('user_id, display_name, email').in('user_id', userIds);
        const { data: tasks } = await supabase.from('tasks').select('created_by, status, points').eq('workspace_id', workspace.id);

        const memberStats = (profiles || []).map(p => {
          const userTasks = (tasks || []).filter(t => t.created_by === p.user_id);
          const completed = userTasks.filter(t => t.status === 'done').length;
          const inProgress = userTasks.filter(t => t.status === 'inprogress').length;
          const total = userTasks.length;
          const totalPoints = userTasks.filter(t => t.status === 'done').reduce((s, t) => s + (t.points || 25), 0);

          return {
            user_id: p.user_id,
            display_name: p.display_name || p.email?.split('@')[0] || 'User',
            avatar: (p.display_name || p.email || 'U').substring(0, 2).toUpperCase(),
            tasksCompleted: completed,
            tasksInProgress: inProgress,
            totalTasks: total,
            totalPoints,
            productivity: total > 0 ? Math.round((completed / total) * 100) : 0,
          };
        });
        setTeamMembers(memberStats);
      } catch (error) {
        console.error('Error fetching team data:', error);
      } finally { setLoading(false); }
    };
    fetchTeamData();
  }, [workspace.id, canViewProgress]);

  if (!canViewProgress) {
    return (<Card><CardContent className="p-8 text-center"><Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-semibold text-gray-700 mb-2">Access Restricted</h3><p className="text-gray-500">Only managers and team leads can view team progress tracking.</p></CardContent></Card>);
  }

  if (loading) return <div className="flex justify-center items-center h-64">Loading team data...</div>;

  const getProductivityColor = (score: number) => {
    if (score >= 75) return 'text-green-600 bg-green-50';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const totalCompleted = teamMembers.reduce((s, m) => s + m.tasksCompleted, 0);
  const totalInProgress = teamMembers.reduce((s, m) => s + m.tasksInProgress, 0);
  const avgProductivity = teamMembers.length > 0 ? Math.round(teamMembers.reduce((s, m) => s + m.productivity, 0) / teamMembers.length) : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2"><BarChart3 className="text-blue-500" size={24} />Team Progress - {workspace.name}</CardTitle>
            <Badge variant="outline" className="bg-blue-50 text-blue-600"><Shield size={12} className="mr-1" />{userRole}</Badge>
          </div>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Users className="text-green-500" size={20} />Team Overview</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center"><Target className="w-6 h-6 text-blue-600 mx-auto mb-2" /><p className="text-2xl font-bold text-blue-600">{totalCompleted}</p><p className="text-sm text-blue-600">Completed</p></div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center"><Clock className="w-6 h-6 text-yellow-600 mx-auto mb-2" /><p className="text-2xl font-bold text-yellow-600">{totalInProgress}</p><p className="text-sm text-yellow-600">In Progress</p></div>
            <div className="bg-purple-50 p-4 rounded-lg text-center"><TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-2" /><p className="text-2xl font-bold text-purple-600">{avgProductivity}%</p><p className="text-sm text-purple-600">Avg Completion</p></div>
            <div className="bg-orange-50 p-4 rounded-lg text-center"><Users className="w-6 h-6 text-orange-600 mx-auto mb-2" /><p className="text-2xl font-bold text-orange-600">{teamMembers.length}</p><p className="text-sm text-orange-600">Members</p></div>
          </div>
          {teamMembers.length === 0 && <p className="text-center text-gray-500 py-4">No team members found</p>}
          <div className="space-y-4">
            {teamMembers.map(member => (
              <div key={member.user_id} className={`border rounded-lg p-4 transition-all hover:shadow-md cursor-pointer ${selectedMember === member.user_id ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`} onClick={() => setSelectedMember(selectedMember === member.user_id ? null : member.user_id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">{member.avatar}</div>
                    <div><h4 className="font-semibold">{member.display_name}</h4>{member.user_id === user.id && <span className="text-xs text-purple-600">(You)</span>}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center"><p className="text-sm font-medium">{member.tasksCompleted}</p><p className="text-xs text-gray-500">Done</p></div>
                    <div className="text-center"><p className="text-sm font-medium">{member.tasksInProgress}</p><p className="text-xs text-gray-500">Active</p></div>
                    <Badge className={getProductivityColor(member.productivity)}>{member.productivity}%</Badge>
                  </div>
                </div>
                {member.totalTasks > 0 && (
                  <div className="mt-3"><div className="flex justify-between text-xs mb-1"><span>Completion</span><span>{member.tasksCompleted}/{member.totalTasks}</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all" style={{ width: `${member.productivity}%` }} /></div></div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
