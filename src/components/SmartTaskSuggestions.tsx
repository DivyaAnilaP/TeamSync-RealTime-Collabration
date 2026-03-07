import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Clock, TrendingUp, Users, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface TaskSuggestion { id: string; title: string; description: string; priority: 'high' | 'medium' | 'low'; estimatedTime: string; reason: string; category: 'optimization' | 'follow-up' | 'proactive' | 'collaboration'; }
interface SmartTaskSuggestionsProps { onAcceptSuggestion: (suggestion: TaskSuggestion) => void; workspace?: any; }

export const SmartTaskSuggestions: React.FC<SmartTaskSuggestionsProps> = ({ onAcceptSuggestion, workspace }) => {
  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      // Fetch current tasks for context
      const wId = workspace?.id;
      let tasks: any[] = [];
      if (wId) {
        const { data } = await supabase.from('tasks').select('title, status').eq('workspace_id', wId).limit(20);
        tasks = data || [];
      }

      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { type: 'task-suggestions', context: { tasks, workspaceName: workspace?.name || 'Workspace' } },
      });
      if (error) throw error;

      const rawSuggestions = Array.isArray(data) ? data : data?.suggestions || [];
      setSuggestions(rawSuggestions.map((s: any, i: number) => ({ ...s, id: String(i) })));
    } catch (error) {
      console.error('AI suggestions error:', error);
      toast({ title: "Error", description: "Failed to generate suggestions", variant: "destructive" });
    } finally { setLoading(false); }
  };

  const getPriorityColor = (priority: string) => { switch (priority) { case 'high': return 'bg-red-100 text-red-600'; case 'medium': return 'bg-yellow-100 text-yellow-600'; case 'low': return 'bg-green-100 text-green-600'; default: return 'bg-gray-100 text-gray-600'; } };
  const getCategoryIcon = (category: string) => { switch (category) { case 'optimization': return TrendingUp; case 'follow-up': return CheckCircle; case 'collaboration': return Users; case 'proactive': return Clock; default: return Lightbulb; } };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Lightbulb className="text-yellow-500" size={24} />Smart Task Suggestions</CardTitle>
          <Button onClick={generateSuggestions} disabled={loading} size="sm">{loading ? 'Generating...' : 'Get AI Suggestions'}</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suggestions.map(suggestion => {
            const CategoryIcon = getCategoryIcon(suggestion.category);
            return (
              <div key={suggestion.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2"><CategoryIcon size={16} className="text-purple-600" /><h4 className="font-medium">{suggestion.title}</h4></div>
                  <div className="flex gap-2">{suggestion.priority && <Badge className={getPriorityColor(suggestion.priority)}>{suggestion.priority}</Badge>}{suggestion.estimatedTime && <Badge variant="outline"><Clock size={12} className="mr-1" />{suggestion.estimatedTime}</Badge>}</div>
                </div>
                <p className="text-gray-600 text-sm mb-2">{suggestion.description}</p>
                {suggestion.reason && <p className="text-xs text-gray-500 mb-3 italic">💡 {suggestion.reason}</p>}
                <div className="flex gap-2"><Button size="sm" onClick={() => onAcceptSuggestion(suggestion)} className="bg-gradient-to-r from-purple-500 to-blue-500">Add to Tasks</Button><Button size="sm" variant="outline" onClick={() => setSuggestions(prev => prev.filter(s => s.id !== suggestion.id))}>Dismiss</Button></div>
              </div>
            );
          })}
          {suggestions.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500"><Lightbulb size={48} className="mx-auto mb-4 opacity-50" /><p>Click "Get AI Suggestions" to receive personalized task recommendations.</p></div>
          )}
          {loading && (
            <div className="text-center py-8 text-gray-500"><Lightbulb size={48} className="mx-auto mb-4 animate-pulse text-yellow-500" /><p>AI is analyzing your workspace...</p></div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
