import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Activity, Clock, Target } from 'lucide-react';

interface HeatmapData { date: string; tasksCompleted: number; hoursWorked: number; linesOfCode: number; meetings: number; }
interface WorkHeatmapProps { user: any; }

export const WorkHeatmap: React.FC<WorkHeatmapProps> = ({ user }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');

  const generateHeatmapData = (period: 'week' | 'month' | 'quarter'): HeatmapData[] => {
    const data: HeatmapData[] = [];
    const today = new Date();
    let daysToGenerate = period === 'week' ? 7 : period === 'quarter' ? 90 : 30;
    for (let i = daysToGenerate; i >= 0; i--) {
      const date = new Date(today); date.setDate(date.getDate() - i);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      let baseActivity = isWeekend ? 0.2 : 1;
      if (period === 'week') baseActivity *= 1.5;
      else if (period === 'quarter') baseActivity *= 0.7;
      data.push({ date: date.toISOString().split('T')[0], tasksCompleted: Math.floor(Math.random() * 10 * baseActivity), hoursWorked: Math.floor(Math.random() * 9 * baseActivity), linesOfCode: Math.floor(Math.random() * 600 * baseActivity), meetings: Math.floor(Math.random() * 5 * baseActivity) });
    }
    return data;
  };

  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>(generateHeatmapData('month'));
  const handlePeriodChange = (period: 'week' | 'month' | 'quarter') => { setSelectedPeriod(period); setHeatmapData(generateHeatmapData(period)); };

  const getIntensityColor = (value: number, max: number) => {
    const intensity = value / max;
    if (intensity === 0) return 'bg-gray-100'; if (intensity < 0.25) return 'bg-green-200'; if (intensity < 0.5) return 'bg-green-300'; if (intensity < 0.75) return 'bg-green-400'; return 'bg-green-500';
  };

  const maxTasks = Math.max(...heatmapData.map(d => d.tasksCompleted));
  const totalStats = {
    tasksCompleted: heatmapData.reduce((sum, day) => sum + day.tasksCompleted, 0),
    hoursWorked: heatmapData.reduce((sum, day) => sum + day.hoursWorked, 0),
    linesOfCode: heatmapData.reduce((sum, day) => sum + day.linesOfCode, 0),
    meetings: heatmapData.reduce((sum, day) => sum + day.meetings, 0),
    activeDays: heatmapData.filter(day => day.tasksCompleted > 0).length
  };

  const getGridCols = () => { if (selectedPeriod === 'week') return 'grid-cols-7'; if (selectedPeriod === 'month') return 'grid-cols-7'; return 'grid-cols-13'; };
  const getDisplayData = () => { if (selectedPeriod === 'week') return heatmapData.slice(-7); if (selectedPeriod === 'month') return heatmapData.slice(-28); return heatmapData.slice(-91); };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Activity className="text-green-500" size={24} />{user?.name || 'Your'} Work Activity - {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} View</CardTitle>
            <div className="flex gap-2">
              {(['week', 'month', 'quarter'] as const).map(period => (
                <button key={period} onClick={() => handlePeriodChange(period)} className={`px-3 py-1 rounded text-sm transition-colors ${selectedPeriod === period ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>{period.charAt(0).toUpperCase() + period.slice(1)}</button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h4 className="font-medium mb-3 flex items-center gap-2"><Target size={16} />Task Completion Heatmap ({selectedPeriod})</h4>
            {selectedPeriod !== 'quarter' && (<div className="grid grid-cols-7 gap-1 mb-4">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (<div key={day} className="text-xs text-gray-500 text-center p-1">{day}</div>))}</div>)}
            <div className={`${getGridCols()} gap-1 grid`}>
              {getDisplayData().map((day) => (<div key={day.date} className={`w-8 h-8 rounded ${getIntensityColor(day.tasksCompleted, maxTasks)} border border-gray-200 flex items-center justify-center text-xs font-medium hover:scale-110 transition-transform cursor-pointer`} title={`${day.date}: ${day.tasksCompleted} tasks, ${day.hoursWorked}h worked`}>{day.tasksCompleted > 0 ? day.tasksCompleted : ''}</div>))}
            </div>
            <div className="flex items-center gap-2 mt-3 text-xs text-gray-500"><span>Less</span><div className="flex gap-1"><div className="w-3 h-3 bg-gray-100 rounded"></div><div className="w-3 h-3 bg-green-200 rounded"></div><div className="w-3 h-3 bg-green-300 rounded"></div><div className="w-3 h-3 bg-green-400 rounded"></div><div className="w-3 h-3 bg-green-500 rounded"></div></div><span>More</span></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg text-center"><Target className="w-6 h-6 text-blue-600 mx-auto mb-1" /><p className="text-2xl font-bold text-blue-600">{totalStats.tasksCompleted}</p><p className="text-xs text-blue-600">Tasks Done</p></div>
            <div className="bg-green-50 p-3 rounded-lg text-center"><Clock className="w-6 h-6 text-green-600 mx-auto mb-1" /><p className="text-2xl font-bold text-green-600">{totalStats.hoursWorked}</p><p className="text-xs text-green-600">Hours Worked</p></div>
            <div className="bg-purple-50 p-3 rounded-lg text-center"><Activity className="w-6 h-6 text-purple-600 mx-auto mb-1" /><p className="text-2xl font-bold text-purple-600">{totalStats.linesOfCode}</p><p className="text-xs text-purple-600">Lines of Code</p></div>
            <div className="bg-orange-50 p-3 rounded-lg text-center"><Calendar className="w-6 h-6 text-orange-600 mx-auto mb-1" /><p className="text-2xl font-bold text-orange-600">{totalStats.meetings}</p><p className="text-xs text-orange-600">Meetings</p></div>
            <div className="bg-indigo-50 p-3 rounded-lg text-center"><Activity className="w-6 h-6 text-indigo-600 mx-auto mb-1" /><p className="text-2xl font-bold text-indigo-600">{totalStats.activeDays}</p><p className="text-xs text-indigo-600">Active Days</p></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
