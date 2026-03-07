import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, CheckCircle, Clock, Lightbulb } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AIWrapUpProps { user?: any; workspace?: any; }

export const AIWrapUp: React.FC<AIWrapUpProps> = ({ user, workspace }) => {
  const [currentWrap, setCurrentWrap] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [stats, setStats] = useState({ tasksCompleted: 0, tasksInProgress: 0, totalTasks: 0, meetingsCount: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const wId = workspace?.id;
      if (!wId) return;

      const { data: tasks } = await supabase.from('tasks').select('status').eq('workspace_id', wId);
      const { data: meetings } = await supabase.from('meetings').select('id').eq('workspace_id', wId).eq('meeting_date', selectedDate);

      const t = tasks || [];
      setStats({
        tasksCompleted: t.filter(x => x.status === 'done').length,
        tasksInProgress: t.filter(x => x.status === 'inprogress').length,
        totalTasks: t.length,
        meetingsCount: (meetings || []).length,
      });
    };
    fetchStats();
  }, [workspace?.id, selectedDate]);

  const generateDailyWrap = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          type: 'daily-wrap',
          context: { ...stats, date: selectedDate, workspaceName: workspace?.name || 'Workspace' },
        },
      });
      if (error) throw error;
      setCurrentWrap(data);
    } catch (error) {
      console.error('AI wrap error:', error);
      toast({ title: "Error", description: "Failed to generate AI summary", variant: "destructive" });
    } finally { setLoading(false); }
  };

  const getProductivityColor = (level: string) => {
    switch (level) { case 'high': return 'bg-green-100 text-green-600'; case 'medium': return 'bg-yellow-100 text-yellow-600'; case 'low': return 'bg-red-100 text-red-600'; default: return 'bg-gray-100 text-gray-600'; }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Brain className="text-purple-500" size={24} />AI Daily Work Summary</CardTitle>
            <div className="flex items-center gap-2">
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="p-2 border rounded" />
              <Button onClick={generateDailyWrap} disabled={loading} size="sm">{loading ? 'Generating...' : 'Generate Wrap'}</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Live stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-3 rounded-lg text-center"><CheckCircle className="w-6 h-6 text-blue-600 mx-auto mb-1" /><p className="text-2xl font-bold text-blue-600">{stats.tasksCompleted}</p><p className="text-xs text-blue-600">Tasks Done</p></div>
            <div className="bg-yellow-50 p-3 rounded-lg text-center"><Clock className="w-6 h-6 text-yellow-600 mx-auto mb-1" /><p className="text-2xl font-bold text-yellow-600">{stats.tasksInProgress}</p><p className="text-xs text-yellow-600">In Progress</p></div>
            <div className="bg-purple-50 p-3 rounded-lg text-center"><TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-1" /><p className="text-2xl font-bold text-purple-600">{stats.totalTasks}</p><p className="text-xs text-purple-600">Total Tasks</p></div>
            <div className="bg-green-50 p-3 rounded-lg text-center"><Brain className="w-6 h-6 text-green-600 mx-auto mb-1" /><p className="text-2xl font-bold text-green-600">{stats.meetingsCount}</p><p className="text-xs text-green-600">Meetings</p></div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center"><Brain className="animate-pulse text-purple-500 mx-auto mb-4" size={48} /><p className="text-gray-600">AI is analyzing your work data...</p></div>
            </div>
          ) : currentWrap ? (
            <div className="space-y-6">
              {currentWrap.productivity && <div className="flex justify-center"><Badge className={getProductivityColor(currentWrap.productivity)}>{currentWrap.productivity} productivity</Badge></div>}
              <div className="grid md:grid-cols-2 gap-6">
                {currentWrap.highlights?.length > 0 && (
                  <div><h4 className="font-semibold mb-3">🌟 Highlights</h4><ul className="space-y-2">{currentWrap.highlights.map((h: string, i: number) => (<li key={i} className="flex items-start gap-2 text-sm"><div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>{h}</li>))}</ul></div>
                )}
                {currentWrap.challenges?.length > 0 && (
                  <div><h4 className="font-semibold mb-3">🚧 Challenges</h4><ul className="space-y-2">{currentWrap.challenges.map((c: string, i: number) => (<li key={i} className="flex items-start gap-2 text-sm"><div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>{c}</li>))}</ul></div>
                )}
              </div>
              {currentWrap.recommendations?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2"><Lightbulb className="text-yellow-500" size={16} />AI Recommendations</h4>
                  <div className="grid md:grid-cols-2 gap-3">{currentWrap.recommendations.map((rec: string, i: number) => (<div key={i} className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500"><p className="text-sm">{rec}</p></div>))}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8"><p className="text-gray-500">Click "Generate Wrap" to get your AI-powered work summary</p></div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
