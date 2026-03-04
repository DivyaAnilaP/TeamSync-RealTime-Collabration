import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Target, TrendingUp, Play, Pause, RotateCcw } from 'lucide-react';

interface Sprint { id: string; name: string; startDate: Date; endDate: Date; status: 'planning' | 'active' | 'completed' | 'cancelled'; goals: string[]; tasks: { total: number; completed: number; inProgress: number; todo: number; }; teamMembers: string[]; burndownData: number[]; }
interface SprintManagementProps { isManager?: boolean; user: any; workspace: any; }

export const SprintManagement: React.FC<SprintManagementProps> = ({ isManager = false, user, workspace }) => {
  const [activeSprint, setActiveSprint] = useState<Sprint>({
    id: '1', name: 'Sprint 24.1 - Q1 Features', startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), status: 'active',
    goals: ['Implement user authentication system', 'Complete task management features', 'Add real-time notifications', 'Optimize database performance'],
    tasks: { total: 24, completed: 12, inProgress: 6, todo: 6 }, teamMembers: ['Sarah Chen', 'Mike Johnson', 'Alex Rodriguez', 'Emma Wilson'], burndownData: [24, 22, 20, 18, 15, 13, 12, 12]
  });

  const [previousSprints] = useState<Sprint[]>([{
    id: '2', name: 'Sprint 23.4 - Year End', startDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), status: 'completed',
    goals: ['Complete MVP features', 'User testing', 'Bug fixes'], tasks: { total: 18, completed: 16, inProgress: 0, todo: 2 }, teamMembers: ['Sarah Chen', 'Mike Johnson', 'Alex Rodriguez'], burndownData: [18, 16, 14, 12, 8, 6, 4, 2, 0]
  }]);

  const [showNewSprintForm, setShowNewSprintForm] = useState(false);
  const [newSprint, setNewSprint] = useState({ name: '', duration: 14, goals: [''] });

  const getStatusColor = (status: string) => { switch (status) { case 'planning': return 'bg-blue-100 text-blue-600'; case 'active': return 'bg-green-100 text-green-600'; case 'completed': return 'bg-gray-100 text-gray-600'; case 'cancelled': return 'bg-red-100 text-red-600'; default: return 'bg-gray-100 text-gray-600'; } };
  const calculateProgress = (sprint: Sprint) => Math.round((sprint.tasks.completed / sprint.tasks.total) * 100);
  const getDaysRemaining = (endDate: Date) => Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const addGoal = () => setNewSprint(prev => ({ ...prev, goals: [...prev.goals, ''] }));
  const updateGoal = (index: number, value: string) => setNewSprint(prev => ({ ...prev, goals: prev.goals.map((goal, i) => i === index ? value : goal) }));
  const createSprint = () => { const filteredGoals = newSprint.goals.filter(goal => goal.trim() !== ''); if (newSprint.name.trim() && filteredGoals.length > 0) { console.log('Creating sprint:', newSprint); setShowNewSprintForm(false); setNewSprint({ name: '', duration: 14, goals: [''] }); } };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Target className="text-blue-500" size={24} />Current Sprint - {workspace.name}</CardTitle>
            <div className="flex items-center gap-2"><Badge className={getStatusColor(activeSprint.status)}>{activeSprint.status}</Badge>{isManager && <Button size="sm" variant="outline"><RotateCcw size={16} className="mr-1" />End Sprint</Button>}</div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between"><h3 className="text-lg font-semibold">{activeSprint.name}</h3><div className="flex items-center gap-4 text-sm text-gray-600"><div className="flex items-center gap-1"><Calendar size={14} />{activeSprint.startDate.toLocaleDateString()} - {activeSprint.endDate.toLocaleDateString()}</div><div className="flex items-center gap-1"><Clock size={14} />{getDaysRemaining(activeSprint.endDate)} days left</div></div></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg text-center"><p className="text-2xl font-bold text-blue-600">{activeSprint.tasks.total}</p><p className="text-sm text-blue-600">Total Tasks</p></div>
              <div className="bg-green-50 p-3 rounded-lg text-center"><p className="text-2xl font-bold text-green-600">{activeSprint.tasks.completed}</p><p className="text-sm text-green-600">Completed</p></div>
              <div className="bg-yellow-50 p-3 rounded-lg text-center"><p className="text-2xl font-bold text-yellow-600">{activeSprint.tasks.inProgress}</p><p className="text-sm text-yellow-600">In Progress</p></div>
              <div className="bg-gray-50 p-3 rounded-lg text-center"><p className="text-2xl font-bold text-gray-600">{activeSprint.tasks.todo}</p><p className="text-sm text-gray-600">To Do</p></div>
            </div>
            <div className="space-y-2"><div className="flex justify-between text-sm"><span>Sprint Progress</span><span>{calculateProgress(activeSprint)}%</span></div><div className="w-full bg-gray-200 rounded-full h-3"><div className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all" style={{ width: `${calculateProgress(activeSprint)}%` }} /></div></div>
            <div><h4 className="font-medium mb-2">Sprint Goals</h4><ul className="space-y-1">{activeSprint.goals.map((goal, index) => (<li key={index} className="flex items-center gap-2 text-sm"><div className="w-2 h-2 bg-blue-500 rounded-full"></div>{goal}</li>))}</ul></div>
            <div><h4 className="font-medium mb-2">Team Members ({activeSprint.teamMembers.length})</h4><div className="flex gap-2">{activeSprint.teamMembers.map((member, index) => (<Badge key={index} variant="outline">{member}</Badge>))}</div></div>
          </div>
        </CardContent>
      </Card>
      {isManager && (
        <Card>
          <CardHeader><CardTitle>Sprint Management</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4"><Button onClick={() => setShowNewSprintForm(true)} className="bg-gradient-to-r from-purple-500 to-blue-500"><Play size={16} className="mr-1" />Plan New Sprint</Button><Button variant="outline"><TrendingUp size={16} className="mr-1" />Sprint Analytics</Button></div>
            {showNewSprintForm && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium mb-3">Create New Sprint</h4>
                <div className="space-y-3">
                  <input type="text" placeholder="Sprint name" value={newSprint.name} onChange={(e) => setNewSprint(prev => ({ ...prev, name: e.target.value }))} className="w-full p-2 border rounded" />
                  <div className="grid grid-cols-2 gap-3"><div><label className="block text-sm font-medium mb-1">Duration (days)</label><select value={newSprint.duration} onChange={(e) => setNewSprint(prev => ({ ...prev, duration: Number(e.target.value) }))} className="w-full p-2 border rounded"><option value={7}>1 Week</option><option value={14}>2 Weeks</option><option value={21}>3 Weeks</option><option value={28}>4 Weeks</option></select></div></div>
                  <div><label className="block text-sm font-medium mb-1">Sprint Goals</label>{newSprint.goals.map((goal, index) => (<input key={index} type="text" placeholder={`Goal ${index + 1}`} value={goal} onChange={(e) => updateGoal(index, e.target.value)} className="w-full p-2 border rounded mb-2" />))}<Button size="sm" variant="outline" onClick={addGoal}>+ Add Goal</Button></div>
                  <div className="flex gap-2"><Button onClick={createSprint}>Create Sprint</Button><Button variant="outline" onClick={() => setShowNewSprintForm(false)}>Cancel</Button></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader><CardTitle>Sprint History</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {previousSprints.map(sprint => (
              <div key={sprint.id} className="border rounded-lg p-3 hover:bg-gray-50">
                <div className="flex items-center justify-between"><div><h4 className="font-medium">{sprint.name}</h4><p className="text-sm text-gray-600">{sprint.startDate.toLocaleDateString()} - {sprint.endDate.toLocaleDateString()}</p></div><div className="flex items-center gap-2"><Badge className={getStatusColor(sprint.status)}>{sprint.status}</Badge><span className="text-sm text-gray-600">{calculateProgress(sprint)}% completed</span></div></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
