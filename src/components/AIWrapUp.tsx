import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, Calendar, Users, CheckCircle, Clock, Lightbulb, FileText } from 'lucide-react';

interface DailyWrapData {
  date: string;
  tasksCompleted: number;
  hoursWorked: number;
  meetingsAttended: number;
  codeCommits: number;
  teamCollaboration: number;
  productivity: 'high' | 'medium' | 'low';
  highlights: string[];
  challenges: string[];
  recommendations: string[];
}

interface TeamInsight {
  metric: string;
  value: string;
  trend: 'up' | 'down' | 'stable';
  insight: string;
}

export const AIWrapUp: React.FC = () => {
  const [currentWrap, setCurrentWrap] = useState<DailyWrapData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [teamInsights] = useState<TeamInsight[]>([
    { metric: 'Team Productivity', value: '87%', trend: 'up', insight: 'Team performance increased by 12% compared to last week' },
    { metric: 'Code Quality', value: '94%', trend: 'stable', insight: 'Consistent high-quality code delivery maintained' },
    { metric: 'Collaboration Score', value: '91%', trend: 'up', insight: 'Increased cross-team communication and knowledge sharing' },
    { metric: 'Sprint Progress', value: '76%', trend: 'up', insight: 'On track to complete sprint goals ahead of schedule' }
  ]);

  const generateDailyWrap = async () => {
    setLoading(true);
    setTimeout(() => {
      const mockData: DailyWrapData = {
        date: selectedDate,
        tasksCompleted: Math.floor(Math.random() * 8) + 2,
        hoursWorked: Math.floor(Math.random() * 4) + 6,
        meetingsAttended: Math.floor(Math.random() * 3) + 1,
        codeCommits: Math.floor(Math.random() * 10) + 3,
        teamCollaboration: Math.floor(Math.random() * 20) + 60,
        productivity: Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low',
        highlights: ['Successfully completed the user authentication module', 'Mentored junior developer on React best practices', 'Led productive team standup meeting', 'Resolved critical bug in payment system'].slice(0, Math.floor(Math.random() * 3) + 2),
        challenges: ['Database performance optimization took longer than expected', 'Meeting conflicts reduced focused coding time', 'Waiting for design approval delayed feature implementation'].slice(0, Math.floor(Math.random() * 2) + 1),
        recommendations: ['Consider scheduling focused coding blocks in the morning', 'Set up automated testing for the new features', 'Schedule one-on-one with team lead to discuss career growth', 'Review and update project documentation'].slice(0, Math.floor(Math.random() * 3) + 2)
      };
      setCurrentWrap(mockData);
      setLoading(false);
    }, 2000);
  };

  useEffect(() => { generateDailyWrap(); }, [selectedDate]);

  const getProductivityColor = (level: string) => {
    switch (level) { case 'high': return 'bg-green-100 text-green-600'; case 'medium': return 'bg-yellow-100 text-yellow-600'; case 'low': return 'bg-red-100 text-red-600'; default: return 'bg-gray-100 text-gray-600'; }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) { case 'up': return '📈'; case 'down': return '📉'; case 'stable': return '➡️'; default: return '➡️'; }
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
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center"><Brain className="animate-pulse text-purple-500 mx-auto mb-4" size={48} /><p className="text-gray-600">AI is analyzing your work patterns...</p></div>
            </div>
          ) : currentWrap ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg text-center"><CheckCircle className="w-6 h-6 text-blue-600 mx-auto mb-1" /><p className="text-2xl font-bold text-blue-600">{currentWrap.tasksCompleted}</p><p className="text-xs text-blue-600">Tasks Done</p></div>
                <div className="bg-green-50 p-3 rounded-lg text-center"><Clock className="w-6 h-6 text-green-600 mx-auto mb-1" /><p className="text-2xl font-bold text-green-600">{currentWrap.hoursWorked}h</p><p className="text-xs text-green-600">Hours Worked</p></div>
                <div className="bg-purple-50 p-3 rounded-lg text-center"><Users className="w-6 h-6 text-purple-600 mx-auto mb-1" /><p className="text-2xl font-bold text-purple-600">{currentWrap.meetingsAttended}</p><p className="text-xs text-purple-600">Meetings</p></div>
                <div className="bg-orange-50 p-3 rounded-lg text-center"><FileText className="w-6 h-6 text-orange-600 mx-auto mb-1" /><p className="text-2xl font-bold text-orange-600">{currentWrap.codeCommits}</p><p className="text-xs text-orange-600">Commits</p></div>
                <div className="bg-yellow-50 p-3 rounded-lg text-center"><TrendingUp className="w-6 h-6 text-yellow-600 mx-auto mb-1" /><Badge className={getProductivityColor(currentWrap.productivity)}>{currentWrap.productivity} productivity</Badge></div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div><h4 className="font-semibold mb-3 flex items-center gap-2">🌟 Today's Highlights</h4><ul className="space-y-2">{currentWrap.highlights.map((highlight, index) => (<li key={index} className="flex items-start gap-2 text-sm"><div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>{highlight}</li>))}</ul></div>
                <div><h4 className="font-semibold mb-3 flex items-center gap-2">🚧 Challenges Faced</h4><ul className="space-y-2">{currentWrap.challenges.map((challenge, index) => (<li key={index} className="flex items-start gap-2 text-sm"><div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>{challenge}</li>))}</ul></div>
              </div>
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2"><Lightbulb className="text-yellow-500" size={16} />AI Recommendations for Tomorrow</h4>
                <div className="grid md:grid-cols-2 gap-3">{currentWrap.recommendations.map((rec, index) => (<div key={index} className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500"><p className="text-sm">{rec}</p></div>))}</div>
              </div>
            </div>
          ) : (<div className="text-center py-8"><p className="text-gray-500">Select a date to generate your AI work summary</p></div>)}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="text-blue-500" size={24} />Team Performance Insights</CardTitle></CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {teamInsights.map((insight, index) => (
              <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center justify-between mb-2"><h4 className="font-medium">{insight.metric}</h4><div className="flex items-center gap-2"><span className="text-2xl font-bold text-purple-600">{insight.value}</span><span className="text-lg">{getTrendIcon(insight.trend)}</span></div></div>
                <p className="text-sm text-gray-600">{insight.insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
