import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TaskBoard } from '@/components/TaskBoard';
import { ChatPanel } from '@/components/ChatPanel';
import { FileSharing } from '@/components/FileSharing';
import { Gamification } from '@/components/Gamification';
import { UserPresence } from '@/components/UserPresence';
import { MoodCheck } from '@/components/MoodCheck';
import { SmartTaskSuggestions } from '@/components/SmartTaskSuggestions';
import { WorkHeatmap } from '@/components/WorkHeatmap';
import { CodeCollaboration } from '@/components/CodeCollaboration';
import { BadgesAndTitles } from '@/components/BadgesAndTitles';
import { SprintManagement } from '@/components/SprintManagement';
import { AIWrapUp } from '@/components/AIWrapUp';
import { ProgressTracking } from '@/components/ProgressTracking';
import { MeetingNotes } from '@/components/MeetingNotes';

interface IndexProps {
  user: any;
  workspace: any;
  onLogout: () => void;
  onLeaveWorkspace: () => void;
}

const Index: React.FC<IndexProps> = ({ user, workspace, onLogout, onLeaveWorkspace }) => {
  const [activeTab, setActiveTab] = useState('tasks');
  const [points, setPoints] = useState(1250);
  const [userRole] = useState<'manager' | 'team-lead' | 'member'>(
    workspace.isOwner ? 'manager' : 'team-lead'
  );

  const addPoints = (amount: number) => {
    setPoints(prev => prev + amount);
  };

  const handleAcceptSuggestion = (suggestion: any) => {
    console.log('Adding suggested task:', suggestion);
    addPoints(10);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="flex h-screen">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          points={points}
          user={user}
          workspace={workspace}
          onLogout={onLogout}
          onLeaveWorkspace={onLeaveWorkspace}
        />

        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 p-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {workspace.name}
              </h1>
              <p className="text-gray-600 text-sm">{workspace.description}</p>
            </div>
            <UserPresence currentUser={user} workspace={workspace} />
          </header>

          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 p-6 overflow-y-auto">
              {activeTab === 'tasks' && (
                <div className="space-y-6">
                  <TaskBoard onPointsEarned={addPoints} user={user} workspace={workspace} />
                  <SmartTaskSuggestions onAcceptSuggestion={handleAcceptSuggestion} />
                </div>
              )}
              {activeTab === 'chat' && <ChatPanel onPointsEarned={addPoints} user={user} workspace={workspace} />}
              {activeTab === 'files' && <FileSharing user={user} workspace={workspace} />}
              {activeTab === 'gamification' && <Gamification points={points} user={user} workspace={workspace} />}
              {activeTab === 'mood' && <MoodCheck user={user} />}
              {activeTab === 'analytics' && <WorkHeatmap user={user} />}
              {activeTab === 'code' && <CodeCollaboration user={user} workspace={workspace} />}
              {activeTab === 'achievements' && <BadgesAndTitles />}
              {activeTab === 'sprints' && <SprintManagement isManager={userRole === 'manager'} user={user} workspace={workspace} />}
              {activeTab === 'ai-wrap' && <AIWrapUp />}
              {activeTab === 'progress' && <ProgressTracking userRole={userRole} user={user} workspace={workspace} />}
              {activeTab === 'meetings' && <MeetingNotes user={user} workspace={workspace} />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
