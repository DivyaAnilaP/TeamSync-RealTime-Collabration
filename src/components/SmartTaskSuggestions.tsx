import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Clock, TrendingUp, Users, CheckCircle } from 'lucide-react';

interface TaskSuggestion { id: string; title: string; description: string; priority: 'high' | 'medium' | 'low'; estimatedTime: string; reason: string; category: 'optimization' | 'follow-up' | 'proactive' | 'collaboration'; }
interface SmartTaskSuggestionsProps { onAcceptSuggestion: (suggestion: TaskSuggestion) => void; }

export const SmartTaskSuggestions: React.FC<SmartTaskSuggestionsProps> = ({ onAcceptSuggestion }) => {
  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const generateSuggestions = () => {
    setLoading(true);
    setTimeout(() => {
      setSuggestions([
        { id: '1', title: 'Code Review: Authentication Module', description: 'Review the authentication code that was completed yesterday', priority: 'high', estimatedTime: '45 mins', reason: 'High-priority code needs peer review before deployment', category: 'follow-up' },
        { id: '2', title: 'Optimize Database Queries', description: 'Improve performance of user dashboard queries based on recent monitoring', priority: 'medium', estimatedTime: '2 hours', reason: 'Performance metrics show room for improvement', category: 'optimization' },
        { id: '3', title: 'Team Sync: Project Roadmap', description: 'Schedule discussion about next sprint priorities', priority: 'medium', estimatedTime: '30 mins', reason: 'Sprint planning deadline approaching', category: 'collaboration' },
        { id: '4', title: 'Update Documentation', description: 'Document the new features added this week', priority: 'low', estimatedTime: '1 hour', reason: 'Documentation is 3 days behind current features', category: 'proactive' }
      ]);
      setLoading(false);
    }, 1500);
  };

  useEffect(() => { generateSuggestions(); }, []);

  const getPriorityColor = (priority: string) => { switch (priority) { case 'high': return 'bg-red-100 text-red-600'; case 'medium': return 'bg-yellow-100 text-yellow-600'; case 'low': return 'bg-green-100 text-green-600'; default: return 'bg-gray-100 text-gray-600'; } };
  const getCategoryIcon = (category: string) => { switch (category) { case 'optimization': return TrendingUp; case 'follow-up': return CheckCircle; case 'collaboration': return Users; case 'proactive': return Clock; default: return Lightbulb; } };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Lightbulb className="text-yellow-500" size={24} />Smart Task Suggestions</CardTitle>
        <Button onClick={generateSuggestions} disabled={loading} size="sm">{loading ? 'Generating...' : 'Refresh Suggestions'}</Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suggestions.map(suggestion => {
            const CategoryIcon = getCategoryIcon(suggestion.category);
            return (
              <div key={suggestion.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2"><CategoryIcon size={16} className="text-purple-600" /><h4 className="font-medium">{suggestion.title}</h4></div>
                  <div className="flex gap-2"><Badge className={getPriorityColor(suggestion.priority)}>{suggestion.priority}</Badge><Badge variant="outline"><Clock size={12} className="mr-1" />{suggestion.estimatedTime}</Badge></div>
                </div>
                <p className="text-gray-600 text-sm mb-2">{suggestion.description}</p>
                <p className="text-xs text-gray-500 mb-3 italic">💡 {suggestion.reason}</p>
                <div className="flex gap-2"><Button size="sm" onClick={() => onAcceptSuggestion(suggestion)} className="bg-gradient-to-r from-purple-500 to-blue-500">Add to Tasks</Button><Button size="sm" variant="outline">Dismiss</Button></div>
              </div>
            );
          })}
          {suggestions.length === 0 && !loading && (<div className="text-center py-8 text-gray-500"><Lightbulb size={48} className="mx-auto mb-4 opacity-50" /><p>No suggestions available right now.</p><p className="text-sm">Check back later for AI-powered task recommendations!</p></div>)}
        </div>
      </CardContent>
    </Card>
  );
};
