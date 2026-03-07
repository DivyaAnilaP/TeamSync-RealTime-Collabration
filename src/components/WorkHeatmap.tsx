import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Clock, Target, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface WorkHeatmapProps { user: any; }

export const WorkHeatmap: React.FC<WorkHeatmapProps> = ({ user }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [heatmapData, setHeatmapData] = useState<Record<string, number>>({});
  const [totalStats, setTotalStats] = useState({ tasksCompleted: 0, activeDays: 0 });

  useEffect(() => {
    const fetchData = async () => {
      const daysBack = selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 90;
      const sinceDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();

      const { data: tasks } = await supabase
        .from('tasks')
        .select('updated_at, status')
        .eq('created_by', user.id)
        .eq('status', 'done')
        .gte('updated_at', sinceDate);

      const dateMap: Record<string, number> = {};
      (tasks || []).forEach(t => {
        const day = new Date(t.updated_at).toISOString().split('T')[0];
        dateMap[day] = (dateMap[day] || 0) + 1;
      });
      setHeatmapData(dateMap);
      setTotalStats({
        tasksCompleted: (tasks || []).length,
        activeDays: Object.keys(dateMap).length,
      });
    };
    fetchData();
  }, [user.id, selectedPeriod]);

  const getDays = () => {
    const days: string[] = [];
    const daysBack = selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 28 : 91;
    for (let i = daysBack; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  };

  const days = getDays();
  const maxTasks = Math.max(1, ...Object.values(heatmapData));

  const getIntensityColor = (value: number) => {
    if (value === 0) return 'bg-gray-100';
    const intensity = value / maxTasks;
    if (intensity < 0.25) return 'bg-green-200';
    if (intensity < 0.5) return 'bg-green-300';
    if (intensity < 0.75) return 'bg-green-400';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Activity className="text-green-500" size={24} />Your Work Activity</CardTitle>
            <div className="flex gap-2">
              {(['week', 'month', 'quarter'] as const).map(period => (
                <button key={period} onClick={() => setSelectedPeriod(period)} className={`px-3 py-1 rounded text-sm transition-colors ${selectedPeriod === period ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>{period.charAt(0).toUpperCase() + period.slice(1)}</button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <h4 className="font-medium mb-3 flex items-center gap-2"><Target size={16} />Task Completion Heatmap</h4>
          {selectedPeriod !== 'quarter' && (
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-xs text-gray-500 text-center p-1">{day}</div>
              ))}
            </div>
          )}
          <div className={`grid ${selectedPeriod === 'quarter' ? 'grid-cols-13' : 'grid-cols-7'} gap-1`}>
            {days.map(day => (
              <div key={day} className={`w-8 h-8 rounded ${getIntensityColor(heatmapData[day] || 0)} border border-gray-200 flex items-center justify-center text-xs font-medium hover:scale-110 transition-transform cursor-pointer`} title={`${day}: ${heatmapData[day] || 0} tasks completed`}>
                {(heatmapData[day] || 0) > 0 ? heatmapData[day] : ''}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs text-gray-500"><span>Less</span><div className="flex gap-1"><div className="w-3 h-3 bg-gray-100 rounded"></div><div className="w-3 h-3 bg-green-200 rounded"></div><div className="w-3 h-3 bg-green-300 rounded"></div><div className="w-3 h-3 bg-green-400 rounded"></div><div className="w-3 h-3 bg-green-500 rounded"></div></div><span>More</span></div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-blue-50 p-3 rounded-lg text-center"><Target className="w-6 h-6 text-blue-600 mx-auto mb-1" /><p className="text-2xl font-bold text-blue-600">{totalStats.tasksCompleted}</p><p className="text-xs text-blue-600">Tasks Completed</p></div>
            <div className="bg-indigo-50 p-3 rounded-lg text-center"><Calendar className="w-6 h-6 text-indigo-600 mx-auto mb-1" /><p className="text-2xl font-bold text-indigo-600">{totalStats.activeDays}</p><p className="text-xs text-indigo-600">Active Days</p></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
