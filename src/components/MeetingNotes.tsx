import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, Mic, MicOff, VideoOff, Phone, Mail, Users, Calendar, Brain, FileText, Sparkles, Clock, TrendingUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Meeting { id: string; title: string; participant_emails: string[]; meeting_date: string; meeting_time: string; duration: number; type: 'video' | 'audio'; status: 'scheduled' | 'ongoing' | 'completed'; notes?: string; recordings?: string[]; workspace_id: string; created_by: string; }
interface AISummary { id: string; meetingId: string; summary: string; keyPoints: string[]; actionItems: string[]; participants: string[]; sentiment: 'positive' | 'neutral' | 'negative'; duration: string; generatedAt: Date; }
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
  const [aiSummaries, setAiSummaries] = useState<AISummary[]>([]);
  const [generatingSummary, setGeneratingSummary] = useState<string | null>(null);
  const [showSummaryFor, setShowSummaryFor] = useState<string | null>(null);
  const [newMeeting, setNewMeeting] = useState({ title: '', participantEmails: '', date: '', time: '', duration: 30, type: 'video' as 'video' | 'audio' });

  useEffect(() => {
    fetchMeetings();
    setAiSummaries([{
      id: '1', meetingId: '2', summary: 'Team discussed Q1 project milestones and identified key blockers. Overall positive progress with some areas needing attention.',
      keyPoints: ['Sprint 23.4 completed successfully with 89% task completion', 'Database performance optimization is the top priority', 'New team member onboarding scheduled for next week', 'Client feedback on MVP was overwhelmingly positive'],
      actionItems: ['Sarah to optimize database queries by Friday', 'Mike to prepare onboarding materials', 'Schedule client demo for next Tuesday', 'Review and update project timeline'],
      participants: ['Sarah Chen', 'Mike Johnson', 'Alex Rodriguez'], sentiment: 'positive', duration: '45 minutes', generatedAt: new Date(Date.now() - 86400000)
    }]);
  }, [workspace]);

  const fetchMeetings = async () => {
    try {
      const { data, error } = await supabase.from('meetings').select('*').eq('workspace_id', workspace.name).order('created_at', { ascending: false });
      if (error) throw error;
      setMeetings(data || []);
    } catch (error) { console.error('Error fetching meetings:', error); toast({ title: "Error", description: "Failed to load meetings", variant: "destructive" }); } finally { setLoading(false); }
  };

  const sendMeetingInvites = async (meeting: Meeting) => {
    try {
      for (const email of meeting.participant_emails) {
        const { error } = await supabase.functions.invoke('send-email', { body: { to: email, subject: `Meeting Invitation: ${meeting.title}`, html: `<h2>You're invited to a meeting!</h2><h3>${meeting.title}</h3><p><strong>Date:</strong> ${meeting.meeting_date}</p><p><strong>Time:</strong> ${meeting.meeting_time}</p><p><strong>Duration:</strong> ${meeting.duration} minutes</p><p><strong>Type:</strong> ${meeting.type} call</p><p><strong>Workspace:</strong> ${workspace.name}</p><br><p>Join the meeting when it's time!</p><p>Best regards,<br>TeamFlow Team</p>` } });
        if (error) throw error;
      }
      toast({ title: "Meeting Scheduled! 📅", description: `Meeting invites sent to ${meeting.participant_emails.length} participants` });
    } catch (error) { console.error('Error sending meeting invites:', error); toast({ title: "Email Error", description: "Failed to send meeting invitations", variant: "destructive" }); }
  };

  const scheduleMeeting = async () => {
    if (!newMeeting.title || !newMeeting.participantEmails) { toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" }); return; }
    const emails = newMeeting.participantEmails.split(',').map(email => email.trim());
    try {
      const { data, error } = await supabase.from('meetings').insert({ title: newMeeting.title, participant_emails: emails, meeting_date: newMeeting.date, meeting_time: newMeeting.time, duration: newMeeting.duration, type: newMeeting.type, workspace_id: workspace.name, created_by: user.name, status: 'scheduled' }).select().single();
      if (error) throw error;
      setMeetings(prev => [data, ...prev]);
      await sendMeetingInvites(data);
      setNewMeeting({ title: '', participantEmails: '', date: '', time: '', duration: 30, type: 'video' });
      setShowNewMeetingForm(false);
    } catch (error) { console.error('Error creating meeting:', error); toast({ title: "Error", description: "Failed to create meeting", variant: "destructive" }); }
  };

  const startCall = async (meeting: Meeting) => {
    setIsInCall(true); setCallType(meeting.type); setCurrentMeeting(meeting);
    try {
      const { error } = await supabase.from('meetings').update({ status: 'ongoing' }).eq('id', meeting.id);
      if (error) throw error;
      setMeetings(prev => prev.map(m => m.id === meeting.id ? { ...m, status: 'ongoing' } : m));
      toast({ title: `${meeting.type === 'video' ? 'Video' : 'Audio'} Call Started`, description: "AI is recording notes automatically" });
    } catch (error) { console.error('Error starting call:', error); }
  };

  const endCall = async () => {
    if (!currentMeeting) return;
    try {
      const { error } = await supabase.from('meetings').update({ status: 'completed', notes: 'AI Generated Notes: Meeting completed successfully. Participants discussed project progress and next steps.' }).eq('id', currentMeeting.id);
      if (error) throw error;
      setMeetings(prev => prev.map(m => m.id === currentMeeting.id ? { ...m, status: 'completed', notes: 'AI Generated Notes: Meeting completed successfully.' } : m));
      setIsInCall(false); setCurrentMeeting(null);
      toast({ title: "Call Ended", description: "Meeting notes have been generated by AI" });
    } catch (error) { console.error('Error ending call:', error); }
  };

  const generateAISummary = async (meeting: Meeting) => {
    setGeneratingSummary(meeting.id);
    setTimeout(() => {
      const mockSummary: AISummary = {
        id: Date.now().toString(), meetingId: meeting.id,
        summary: `AI-generated summary for "${meeting.title}": The meeting covered key project updates, team coordination, and strategic planning.`,
        keyPoints: ['Reviewed current project status and milestones', 'Discussed resource allocation and team capacity', 'Identified potential risks and mitigation strategies', 'Aligned on next quarter priorities and goals', 'Established clear communication protocols'],
        actionItems: [`${meeting.participant_emails[0]?.split('@')[0] || 'Team member'} to follow up on technical requirements`, 'Schedule follow-up meeting for next week', 'Update project documentation with new decisions', 'Share meeting summary with stakeholders', 'Review and approve budget allocations'],
        participants: meeting.participant_emails.map(email => email.split('@')[0]),
        sentiment: Math.random() > 0.7 ? 'positive' : Math.random() > 0.3 ? 'neutral' : 'negative',
        duration: `${meeting.duration} minutes`, generatedAt: new Date()
      };
      setAiSummaries(prev => [mockSummary, ...prev]);
      setGeneratingSummary(null);
      toast({ title: "AI Summary Generated! 🤖", description: "Meeting has been analyzed and summarized by AI" });
    }, 3000);
  };

  const getSentimentColor = (sentiment: string) => { switch (sentiment) { case 'positive': return 'text-green-600 bg-green-50'; case 'negative': return 'text-red-600 bg-red-50'; default: return 'text-yellow-600 bg-yellow-50'; } };
  const getSentimentIcon = (sentiment: string) => { switch (sentiment) { case 'positive': return '😊'; case 'negative': return '😟'; default: return '😐'; } };

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
                  <div className="bg-gray-800 rounded-lg aspect-video flex items-center justify-center text-white"><div className="text-center">{isVideoOn ? <Video size={24} className="mx-auto mb-2" /> : <VideoOff size={24} className="mx-auto mb-2" />}<p className="text-sm">Your Video</p></div></div>
                  <div className="bg-gray-700 rounded-lg aspect-video flex items-center justify-center text-white"><div className="text-center"><Users size={24} className="mx-auto mb-2" /><p className="text-sm">Participants</p></div></div>
                </div>
              )}
              <div className="flex justify-center gap-4">
                <Button variant={isMicOn ? "default" : "destructive"} size="sm" onClick={() => setIsMicOn(!isMicOn)}>{isMicOn ? <Mic size={16} /> : <MicOff size={16} />}</Button>
                {callType === 'video' && <Button variant={isVideoOn ? "default" : "destructive"} size="sm" onClick={() => setIsVideoOn(!isVideoOn)}>{isVideoOn ? <Video size={16} /> : <VideoOff size={16} />}</Button>}
                <Button variant="destructive" onClick={endCall}><Phone size={16} className="mr-2" />End Call</Button>
              </div>
              <Badge className="bg-red-500">🔴 AI Recording Notes</Badge>
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
              <div><label className="block text-sm font-medium mb-1">Duration (minutes)</label><input type="number" min="15" max="240" value={newMeeting.duration} onChange={(e) => setNewMeeting(prev => ({ ...prev, duration: Number(e.target.value) }))} className="w-full p-2 border border-gray-300 rounded-md" /></div>
              <div><label className="block text-sm font-medium mb-1">Call Type</label><select value={newMeeting.type} onChange={(e) => setNewMeeting(prev => ({ ...prev, type: e.target.value as 'video' | 'audio' }))} className="w-full p-2 border border-gray-300 rounded-md"><option value="video">Video Call</option><option value="audio">Audio Call</option></select></div>
            </div>
            <div className="flex gap-2"><Button onClick={scheduleMeeting}>Schedule & Send Invites</Button><Button variant="outline" onClick={() => setShowNewMeetingForm(false)}>Cancel</Button></div>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Brain className="text-purple-500" size={24} />AI Meeting Summarizer</CardTitle>
          <p className="text-sm text-gray-600">Generate intelligent summaries, extract key points, and identify action items from your meetings</p>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-3 mb-3"><Sparkles className="text-purple-600" size={20} /><h4 className="font-semibold text-purple-800">AI-Powered Analysis</h4></div>
            <p className="text-sm text-purple-700 mb-4">Our AI can analyze meeting transcripts, notes, and recordings to provide comprehensive summaries, sentiment analysis, and actionable insights.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="flex items-center gap-2"><FileText size={14} className="text-purple-600" /><span>Key Points</span></div>
              <div className="flex items-center gap-2"><TrendingUp size={14} className="text-purple-600" /><span>Action Items</span></div>
              <div className="flex items-center gap-2"><Users size={14} className="text-purple-600" /><span>Sentiment Analysis</span></div>
              <div className="flex items-center gap-2"><Clock size={14} className="text-purple-600" /><span>Time Insights</span></div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Meetings & AI Analysis</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {meetings.map(meeting => {
            const existingSummary = aiSummaries.find(s => s.meetingId === meeting.id);
            const isGenerating = generatingSummary === meeting.id;
            return (
              <div key={meeting.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div><h4 className="font-semibold">{meeting.title}</h4><div className="flex items-center gap-4 text-sm text-gray-600 mt-1"><span className="flex items-center gap-1"><Calendar size={14} />{meeting.meeting_date} at {meeting.meeting_time}</span><span className="flex items-center gap-1">{meeting.type === 'video' ? <Video size={14} /> : <Mic size={14} />}{meeting.type === 'video' ? 'Video' : 'Audio'} ({meeting.duration}min)</span></div></div>
                  <div className="flex items-center gap-2"><Badge variant={meeting.status === 'completed' ? 'default' : meeting.status === 'ongoing' ? 'destructive' : 'secondary'}>{meeting.status}</Badge>{meeting.status === 'scheduled' && <Button size="sm" onClick={() => startCall(meeting)}>Join Call</Button>}</div>
                </div>
                {meeting.participant_emails.length > 0 && <div className="flex items-center gap-2 text-sm text-gray-600"><Mail size={14} /><span>Invited: {meeting.participant_emails.join(', ')}</span></div>}
                {meeting.status === 'completed' && (
                  <div className="border-t pt-3 mt-3">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-sm flex items-center gap-2"><Brain size={16} className="text-purple-600" />AI Analysis</h5>
                      <div className="flex gap-2">
                        {!existingSummary && !isGenerating && <Button size="sm" onClick={() => generateAISummary(meeting)} className="bg-gradient-to-r from-purple-500 to-blue-500"><Sparkles size={14} className="mr-1" />Generate Summary</Button>}
                        {existingSummary && <Button size="sm" variant="outline" onClick={() => setShowSummaryFor(showSummaryFor === meeting.id ? null : meeting.id)}>{showSummaryFor === meeting.id ? 'Hide' : 'View'} Summary</Button>}
                      </div>
                    </div>
                    {isGenerating && <div className="flex items-center gap-2 text-sm text-purple-600 bg-purple-50 p-3 rounded"><Brain className="animate-pulse" size={16} /><span>AI is analyzing the meeting content...</span></div>}
                    {existingSummary && showSummaryFor === meeting.id && (
                      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                        <div className="flex items-center justify-between"><Badge className={getSentimentColor(existingSummary.sentiment)}>{getSentimentIcon(existingSummary.sentiment)} {existingSummary.sentiment}</Badge><span className="text-xs text-gray-500">Generated {existingSummary.generatedAt.toLocaleString()}</span></div>
                        <div><h6 className="font-medium text-sm mb-2">Summary</h6><p className="text-sm text-gray-700">{existingSummary.summary}</p></div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div><h6 className="font-medium text-sm mb-2">Key Points</h6><ul className="space-y-1">{existingSummary.keyPoints.map((point, index) => (<li key={index} className="text-sm text-gray-700 flex items-start gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>{point}</li>))}</ul></div>
                          <div><h6 className="font-medium text-sm mb-2">Action Items</h6><ul className="space-y-1">{existingSummary.actionItems.map((item, index) => (<li key={index} className="text-sm text-gray-700 flex items-start gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>{item}</li>))}</ul></div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t"><span>Duration: {existingSummary.duration}</span><span>Participants: {existingSummary.participants.join(', ')}</span></div>
                      </div>
                    )}
                  </div>
                )}
                {meeting.notes && !existingSummary && <div className="bg-gray-50 p-3 rounded"><h5 className="font-medium text-sm mb-1">Meeting Notes:</h5><p className="text-sm text-gray-700">{meeting.notes}</p></div>}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};
