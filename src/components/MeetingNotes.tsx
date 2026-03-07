import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, Mic, MicOff, VideoOff, Phone, Mail, Users, Calendar, Brain, FileText, Sparkles, Clock, TrendingUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Meeting {
  id: string; title: string; participant_emails: string[] | null; meeting_date: string;
  meeting_time: string; duration: number | null; type: string | null; status: string | null;
  notes: string | null; recordings: string[] | null; workspace_id: string; created_by: string;
}

interface MeetingNotesProps { user: any; workspace: any; }

export const MeetingNotes: React.FC<MeetingNotesProps> = ({ user, workspace }) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [showNewMeetingForm, setShowNewMeetingForm] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [callType, setCallType] = useState<'video' | 'audio'>('video');
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [loading, setLoading] = useState(true);
  const [currentMeeting, setCurrentMeeting] = useState<Meeting | null>(null);
  const [aiSummaries, setAiSummaries] = useState<Record<string, any>>({});
  const [generatingSummary, setGeneratingSummary] = useState<string | null>(null);
  const [showSummaryFor, setShowSummaryFor] = useState<string | null>(null);
  const [newMeeting, setNewMeeting] = useState({ title: '', participantEmails: '', date: '', time: '', duration: 30, type: 'video' as 'video' | 'audio' });

  useEffect(() => { fetchMeetings(); }, [workspace]);

  const fetchMeetings = async () => {
    try {
      const { data, error } = await supabase.from('meetings').select('*').eq('workspace_id', workspace.id).order('created_at', { ascending: false });
      if (error) throw error;
      setMeetings((data as Meeting[]) || []);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      toast({ title: "Error", description: "Failed to load meetings", variant: "destructive" });
    } finally { setLoading(false); }
  };

  const scheduleMeeting = async () => {
    if (!newMeeting.title || !newMeeting.participantEmails) { toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" }); return; }
    const emails = newMeeting.participantEmails.split(',').map(e => e.trim());
    try {
      const { data, error } = await supabase.from('meetings').insert({
        title: newMeeting.title, participant_emails: emails, meeting_date: newMeeting.date,
        meeting_time: newMeeting.time, duration: newMeeting.duration, type: newMeeting.type,
        workspace_id: workspace.id, created_by: user.id, status: 'scheduled'
      }).select().single();
      if (error) throw error;
      setMeetings(prev => [data as Meeting, ...prev]);
      toast({ title: "Meeting Scheduled! 📅", description: `"${newMeeting.title}" created.` });
      setNewMeeting({ title: '', participantEmails: '', date: '', time: '', duration: 30, type: 'video' });
      setShowNewMeetingForm(false);
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast({ title: "Error", description: "Failed to create meeting", variant: "destructive" });
    }
  };

  const startCall = async (meeting: Meeting) => {
    setIsInCall(true); setCallType((meeting.type as 'video' | 'audio') || 'video'); setCurrentMeeting(meeting);
    await supabase.from('meetings').update({ status: 'ongoing' }).eq('id', meeting.id);
    setMeetings(prev => prev.map(m => m.id === meeting.id ? { ...m, status: 'ongoing' } : m));
    toast({ title: "Call Started", description: "Meeting in progress" });
  };

  const endCall = async () => {
    if (!currentMeeting) return;
    await supabase.from('meetings').update({ status: 'completed' }).eq('id', currentMeeting.id);
    setMeetings(prev => prev.map(m => m.id === currentMeeting.id ? { ...m, status: 'completed' } : m));
    setIsInCall(false); setCurrentMeeting(null);
    toast({ title: "Call Ended" });
  };

  const generateAISummary = async (meeting: Meeting) => {
    setGeneratingSummary(meeting.id);
    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          type: 'meeting-summary',
          context: { title: meeting.title, participants: meeting.participant_emails, duration: meeting.duration, notes: meeting.notes, date: meeting.meeting_date },
        },
      });
      if (error) throw error;
      setAiSummaries(prev => ({ ...prev, [meeting.id]: data }));
      setShowSummaryFor(meeting.id);
      toast({ title: "AI Summary Generated! 🤖" });
    } catch (error) {
      console.error('AI summary error:', error);
      toast({ title: "Error", description: "Failed to generate AI summary", variant: "destructive" });
    } finally { setGeneratingSummary(null); }
  };

  const getSentimentColor = (s: string) => { switch (s) { case 'positive': return 'text-green-600 bg-green-50'; case 'negative': return 'text-red-600 bg-red-50'; default: return 'text-yellow-600 bg-yellow-50'; } };
  const getSentimentIcon = (s: string) => { switch (s) { case 'positive': return '😊'; case 'negative': return '😟'; default: return '😐'; } };

  if (loading) return <div className="flex justify-center items-center h-64">Loading meetings...</div>;

  return (
    <div className="space-y-6">
      {isInCall && (
        <Card className="border-green-500 bg-green-50">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-bold text-green-800">{callType === 'video' ? 'Video' : 'Audio'} Call in Progress</h3>
              {callType === 'video' && (
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  <div className="bg-gray-800 rounded-lg aspect-video flex items-center justify-center text-white"><div className="text-center">{isVideoOn ? <Video size={24} className="mx-auto mb-2" /> : <VideoOff size={24} className="mx-auto mb-2" />}<p className="text-sm">You</p></div></div>
                  <div className="bg-gray-700 rounded-lg aspect-video flex items-center justify-center text-white"><div className="text-center"><Users size={24} className="mx-auto mb-2" /><p className="text-sm">Participants</p></div></div>
                </div>
              )}
              <div className="flex justify-center gap-4">
                <Button variant={isMicOn ? "default" : "destructive"} size="sm" onClick={() => setIsMicOn(!isMicOn)}>{isMicOn ? <Mic size={16} /> : <MicOff size={16} />}</Button>
                {callType === 'video' && <Button variant={isVideoOn ? "default" : "destructive"} size="sm" onClick={() => setIsVideoOn(!isVideoOn)}>{isVideoOn ? <Video size={16} /> : <VideoOff size={16} />}</Button>}
                <Button variant="destructive" onClick={endCall}><Phone size={16} className="mr-2" />End Call</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Calendar className="text-blue-500" size={24} />Meeting Scheduler</CardTitle>
            <Button onClick={() => setShowNewMeetingForm(true)} className="bg-gradient-to-r from-blue-500 to-purple-500">Schedule Meeting</Button>
          </div>
        </CardHeader>
        {showNewMeetingForm && (
          <CardContent className="space-y-4">
            <input type="text" placeholder="Meeting title *" value={newMeeting.title} onChange={(e) => setNewMeeting(prev => ({ ...prev, title: e.target.value }))} className="w-full p-2 border border-gray-300 rounded-md" />
            <textarea placeholder="Participant emails (comma separated) *" value={newMeeting.participantEmails} onChange={(e) => setNewMeeting(prev => ({ ...prev, participantEmails: e.target.value }))} className="w-full p-2 border border-gray-300 rounded-md" rows={2} />
            <div className="grid grid-cols-2 gap-4">
              <input type="date" value={newMeeting.date} onChange={(e) => setNewMeeting(prev => ({ ...prev, date: e.target.value }))} className="p-2 border border-gray-300 rounded-md" />
              <input type="time" value={newMeeting.time} onChange={(e) => setNewMeeting(prev => ({ ...prev, time: e.target.value }))} className="p-2 border border-gray-300 rounded-md" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">Duration (min)</label><input type="number" min="15" max="240" value={newMeeting.duration} onChange={(e) => setNewMeeting(prev => ({ ...prev, duration: Number(e.target.value) }))} className="w-full p-2 border border-gray-300 rounded-md" /></div>
              <div><label className="block text-sm font-medium mb-1">Type</label><select value={newMeeting.type} onChange={(e) => setNewMeeting(prev => ({ ...prev, type: e.target.value as 'video' | 'audio' }))} className="w-full p-2 border border-gray-300 rounded-md"><option value="video">Video</option><option value="audio">Audio</option></select></div>
            </div>
            <div className="flex gap-2"><Button onClick={scheduleMeeting}>Schedule</Button><Button variant="outline" onClick={() => setShowNewMeetingForm(false)}>Cancel</Button></div>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader><CardTitle>Meetings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {meetings.length === 0 && <p className="text-center text-gray-500 py-4">No meetings yet. Schedule one above!</p>}
          {meetings.map(meeting => {
            const summary = aiSummaries[meeting.id];
            const isGenerating = generatingSummary === meeting.id;
            return (
              <div key={meeting.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div><h4 className="font-semibold">{meeting.title}</h4><div className="flex items-center gap-4 text-sm text-gray-600 mt-1"><span className="flex items-center gap-1"><Calendar size={14} />{meeting.meeting_date} at {meeting.meeting_time}</span><span className="flex items-center gap-1">{meeting.type === 'video' ? <Video size={14} /> : <Mic size={14} />}{meeting.duration}min</span></div></div>
                  <div className="flex items-center gap-2"><Badge variant={meeting.status === 'completed' ? 'default' : meeting.status === 'ongoing' ? 'destructive' : 'secondary'}>{meeting.status}</Badge>{meeting.status === 'scheduled' && <Button size="sm" onClick={() => startCall(meeting)}>Join</Button>}</div>
                </div>
                {(meeting.participant_emails || []).length > 0 && <div className="flex items-center gap-2 text-sm text-gray-600"><Mail size={14} /><span>{(meeting.participant_emails || []).join(', ')}</span></div>}
                {meeting.status === 'completed' && (
                  <div className="border-t pt-3 mt-3">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-sm flex items-center gap-2"><Brain size={16} className="text-purple-600" />AI Analysis</h5>
                      <div className="flex gap-2">
                        {!summary && !isGenerating && <Button size="sm" onClick={() => generateAISummary(meeting)} className="bg-gradient-to-r from-purple-500 to-blue-500"><Sparkles size={14} className="mr-1" />Generate Summary</Button>}
                        {summary && <Button size="sm" variant="outline" onClick={() => setShowSummaryFor(showSummaryFor === meeting.id ? null : meeting.id)}>{showSummaryFor === meeting.id ? 'Hide' : 'View'} Summary</Button>}
                      </div>
                    </div>
                    {isGenerating && <div className="flex items-center gap-2 text-sm text-purple-600 bg-purple-50 p-3 rounded"><Brain className="animate-pulse" size={16} /><span>AI is analyzing...</span></div>}
                    {summary && showSummaryFor === meeting.id && (
                      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                        {summary.sentiment && <Badge className={getSentimentColor(summary.sentiment)}>{getSentimentIcon(summary.sentiment)} {summary.sentiment}</Badge>}
                        {summary.summary && <div><h6 className="font-medium text-sm mb-2">Summary</h6><p className="text-sm text-gray-700">{summary.summary}</p></div>}
                        <div className="grid md:grid-cols-2 gap-4">
                          {summary.keyPoints?.length > 0 && <div><h6 className="font-medium text-sm mb-2">Key Points</h6><ul className="space-y-1">{summary.keyPoints.map((p: string, i: number) => (<li key={i} className="text-sm text-gray-700 flex items-start gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>{p}</li>))}</ul></div>}
                          {summary.actionItems?.length > 0 && <div><h6 className="font-medium text-sm mb-2">Action Items</h6><ul className="space-y-1">{summary.actionItems.map((a: string, i: number) => (<li key={i} className="text-sm text-gray-700 flex items-start gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>{a}</li>))}</ul></div>}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};
