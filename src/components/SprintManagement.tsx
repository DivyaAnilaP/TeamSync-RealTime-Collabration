import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Target, TrendingUp, Play, RotateCcw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SprintManagementProps { isManager?: boolean; user: any; workspace: any; }

export const SprintManagement: React.FC<SprintManagementProps> = ({ isManager = false, user, workspace }) => {
  const [sprints, setSprints] = useState<any[]>([]);
  const [taskCounts, setTaskCounts] = useState<Record<string, { total: number; completed: number; inProgress: number; todo: number }>>({});
  const [loading, setLoading] = useState(true);
  const [showNewSprintForm, setShowNewSprintForm] = useState(false);
  const [newSprint, setNewSprint] = useState({ name: '', duration: 14, goals: [''] });

  useEffect(() => { fetchSprints(); }, [workspace.id]);

  const fetchSprints = async () => {
    try {
      const { data, error } = await supabase
        .from('sprints')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setSprints(data || []);

      // Fetch task counts per sprint
      const { data: tasks } = await supabase
        .from('tasks')
        .select('sprint_id, status')
        .eq('workspace_id', workspace.id);
      
      const counts: Record<string, any> = {};
      (tasks || []).forEach(t => {
        const sid = t.sprint_id || 'unassigned';
        if (!counts[sid]) counts[sid] = { total: 0, completed: 0, inProgress: 0, todo: 0 };
        counts[sid].total++;
        if (t.status === 'done') counts[sid].completed++;
        else if (t.status === 'inprogress') counts[sid].inProgress++;
        else counts[sid].todo++;
      });
      setTaskCounts(counts);
    } catch (error) {
      console.error('Error fetching sprints:', error);
    } finally { setLoading(false); }
  };

  const createSprint = async () => {
    const filteredGoals = newSprint.goals.filter(g => g.trim());
    if (!newSprint.name.trim() || filteredGoals.length === 0) {
      toast({ title: "Error", description: "Sprint name and at least one goal required", variant: "destructive" });
      return;
    }
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + newSprint.duration * 24 * 60 * 60 * 1000);
    try {
      const { data, error } = await supabase.from('sprints').insert({
        workspace_id: workspace.id,
        name: newSprint.name,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        status: 'planning',
        goals: filteredGoals,
        created_by: user.id,
      }).select().single();
      if (error) throw error;
      setSprints(prev => [data, ...prev]);
      setShowNewSprintForm(false);
      setNewSprint({ name: '', duration: 14, goals: [''] });
      toast({ title: "Sprint Created!", description: `${newSprint.name} has been created` });
    } catch (error) {
      console.error('Error creating sprint:', error);
      toast({ title: "Error", description: "Failed to create sprint", variant: "destructive" });
    }
  };

  const updateSprintStatus = async (sprintId: string, status: string) => {
    try {
      const { error } = await supabase.from('sprints').update({ status }).eq('id', sprintId);
      if (error) throw error;
      setSprints(prev => prev.map(s => s.id === sprintId ? { ...s, status } : s));
      toast({ title: "Sprint Updated", description: `Sprint status changed to ${status}` });
    } catch (error) {
      console.error('Error updating sprint:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) { case 'planning': return 'bg-blue-100 text-blue-600'; case 'active': return 'bg-green-100 text-green-600'; case 'completed': return 'bg-gray-100 text-gray-600'; default: return 'bg-gray-100 text-gray-600'; }
  };
  const getDaysRemaining = (endDate: string) => Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const addGoal = () => setNewSprint(prev => ({ ...prev, goals: [...prev.goals, ''] }));
  const updateGoal = (index: number, value: string) => setNewSprint(prev => ({ ...prev, goals: prev.goals.map((g, i) => i === index ? value : g) }));

  if (loading) return <div className="flex justify-center items-center h-64">Loading sprints...</div>;

  const activeSprint = sprints.find(s => s.status === 'active');
  const otherSprints = sprints.filter(s => s.id !== activeSprint?.id);

  return (
    <div className="space-y-6">
      {activeSprint ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Target className="text-blue-500" size={24} />Current Sprint</CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(activeSprint.status)}>{activeSprint.status}</Badge>
                {isManager && <Button size="sm" variant="outline" onClick={() => updateSprintStatus(activeSprint.id, 'completed')}><RotateCcw size={16} className="mr-1" />End Sprint</Button>}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{activeSprint.name}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1"><Calendar size={14} />{activeSprint.start_date} - {activeSprint.end_date}</span>
                  <span className="flex items-center gap-1"><Clock size={14} />{getDaysRemaining(activeSprint.end_date)} days left</span>
                </div>
              </div>
              {taskCounts[activeSprint.id] && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg text-center"><p className="text-2xl font-bold text-blue-600">{taskCounts[activeSprint.id].total}</p><p className="text-sm text-blue-600">Total</p></div>
                  <div className="bg-green-50 p-3 rounded-lg text-center"><p className="text-2xl font-bold text-green-600">{taskCounts[activeSprint.id].completed}</p><p className="text-sm text-green-600">Done</p></div>
                  <div className="bg-yellow-50 p-3 rounded-lg text-center"><p className="text-2xl font-bold text-yellow-600">{taskCounts[activeSprint.id].inProgress}</p><p className="text-sm text-yellow-600">In Progress</p></div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center"><p className="text-2xl font-bold text-gray-600">{taskCounts[activeSprint.id].todo}</p><p className="text-sm text-gray-600">To Do</p></div>
                </div>
              )}
              {activeSprint.goals?.length > 0 && (
                <div><h4 className="font-medium mb-2">Sprint Goals</h4><ul className="space-y-1">{activeSprint.goals.map((goal: string, i: number) => (<li key={i} className="flex items-center gap-2 text-sm"><div className="w-2 h-2 bg-blue-500 rounded-full"></div>{goal}</li>))}</ul></div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Active Sprint</h3>
            <p className="text-gray-500">{isManager ? 'Create and start a new sprint below.' : 'Waiting for a sprint to be started.'}</p>
          </CardContent>
        </Card>
      )}

      {isManager && (
        <Card>
          <CardHeader><CardTitle>Sprint Management</CardTitle></CardHeader>
          <CardContent>
            <Button onClick={() => setShowNewSprintForm(true)} className="bg-gradient-to-r from-purple-500 to-blue-500 mb-4"><Play size={16} className="mr-1" />Plan New Sprint</Button>
            {showNewSprintForm && (
              <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
                <h4 className="font-medium">Create New Sprint</h4>
                <input type="text" placeholder="Sprint name" value={newSprint.name} onChange={(e) => setNewSprint(prev => ({ ...prev, name: e.target.value }))} className="w-full p-2 border rounded" />
                <div><label className="block text-sm font-medium mb-1">Duration</label><select value={newSprint.duration} onChange={(e) => setNewSprint(prev => ({ ...prev, duration: Number(e.target.value) }))} className="w-full p-2 border rounded"><option value={7}>1 Week</option><option value={14}>2 Weeks</option><option value={21}>3 Weeks</option><option value={28}>4 Weeks</option></select></div>
                <div><label className="block text-sm font-medium mb-1">Sprint Goals</label>{newSprint.goals.map((goal, i) => (<input key={i} type="text" placeholder={`Goal ${i + 1}`} value={goal} onChange={(e) => updateGoal(i, e.target.value)} className="w-full p-2 border rounded mb-2" />))}<Button size="sm" variant="outline" onClick={addGoal}>+ Add Goal</Button></div>
                <div className="flex gap-2"><Button onClick={createSprint}>Create Sprint</Button><Button variant="outline" onClick={() => setShowNewSprintForm(false)}>Cancel</Button></div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {otherSprints.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Sprint History</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {otherSprints.map(sprint => (
              <div key={sprint.id} className="border rounded-lg p-3 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div><h4 className="font-medium">{sprint.name}</h4><p className="text-sm text-gray-600">{sprint.start_date} - {sprint.end_date}</p></div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(sprint.status)}>{sprint.status}</Badge>
                    {isManager && sprint.status === 'planning' && <Button size="sm" onClick={() => updateSprintStatus(sprint.id, 'active')}>Start</Button>}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
