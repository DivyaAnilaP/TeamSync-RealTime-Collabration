import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Smile, Meh, Frown, Heart, Coffee, Zap } from 'lucide-react';

interface MoodEntry { id: string; user: string; mood: string; energy: number; stress: number; timestamp: Date; note?: string; }
interface MoodCheckProps { user: any; }

export const MoodCheck: React.FC<MoodCheckProps> = ({ user }) => {
  const [currentMood, setCurrentMood] = useState<string>('');
  const [energy, setEnergy] = useState<number>(5);
  const [stress, setStress] = useState<number>(3);
  const [note, setNote] = useState<string>('');
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([
    { id: '1', user: 'You', mood: 'happy', energy: 8, stress: 2, timestamp: new Date(Date.now() - 3600000), note: 'Great progress on the project!' }
  ]);

  const moods = [
    { id: 'happy', icon: Smile, label: 'Happy', color: 'bg-green-100 text-green-600' },
    { id: 'neutral', icon: Meh, label: 'Neutral', color: 'bg-yellow-100 text-yellow-600' },
    { id: 'sad', icon: Frown, label: 'Stressed', color: 'bg-red-100 text-red-600' },
    { id: 'excited', icon: Zap, label: 'Excited', color: 'bg-purple-100 text-purple-600' },
    { id: 'tired', icon: Coffee, label: 'Tired', color: 'bg-blue-100 text-blue-600' },
    { id: 'motivated', icon: Heart, label: 'Motivated', color: 'bg-pink-100 text-pink-600' }
  ];

  const submitMood = () => {
    const newEntry: MoodEntry = { id: Date.now().toString(), user: 'You', mood: currentMood, energy, stress, timestamp: new Date(), note: note.trim() || undefined };
    setMoodHistory(prev => [newEntry, ...prev]);
    setCurrentMood('');
    setNote('');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Heart className="text-pink-500" size={24} />Daily Mood Check</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><h4 className="font-medium mb-3">How are you feeling today?</h4>
            <div className="grid grid-cols-3 gap-2">
              {moods.map(mood => { const Icon = mood.icon; return (
                <button key={mood.id} onClick={() => setCurrentMood(mood.id)} className={`p-3 rounded-lg border-2 transition-all ${currentMood === mood.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}>
                  <Icon size={20} className={`mx-auto mb-1 ${mood.color.split(' ')[1]}`} /><p className="text-xs font-medium">{mood.label}</p>
                </button>
              ); })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-2">Energy Level: {energy}/10</label><input type="range" min="1" max="10" value={energy} onChange={(e) => setEnergy(Number(e.target.value))} className="w-full" /></div>
            <div><label className="block text-sm font-medium mb-2">Stress Level: {stress}/10</label><input type="range" min="1" max="10" value={stress} onChange={(e) => setStress(Number(e.target.value))} className="w-full" /></div>
          </div>
          <textarea placeholder="Any notes about your day? (optional)" value={note} onChange={(e) => setNote(e.target.value)} className="w-full p-2 border rounded-md" rows={2} />
          <Button onClick={submitMood} disabled={!currentMood} className="w-full bg-gradient-to-r from-pink-500 to-purple-500">Submit Mood Check</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Team Mood Overview</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {moodHistory.slice(0, 5).map(entry => {
              const mood = moods.find(m => m.id === entry.mood);
              const Icon = mood?.icon || Smile;
              return (
                <div key={entry.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <Icon size={16} /><div className="flex-1"><span className="font-medium">{entry.user}</span><span className="text-sm text-gray-600 ml-2">{entry.timestamp.toLocaleTimeString()}</span></div>
                  <div className="flex gap-2"><Badge variant="secondary">Energy: {entry.energy}</Badge><Badge variant="outline">Stress: {entry.stress}</Badge></div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
