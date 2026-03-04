
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, VideoOff, Mic, MicOff, Share, Users, Eye, Edit, Code, Play, Save, Folder, FileText } from 'lucide-react';

interface CodeUser {
  id: string;
  name: string;
  avatar: string;
  isViewing: boolean;
  isEditing: boolean;
  cursorLine?: number;
  status: 'online' | 'away';
}

interface VSCodeEditorProps {
  user: any;
  workspace: any;
}

export const VSCodeEditor: React.FC<VSCodeEditorProps> = ({ user, workspace }) => {
  const [code, setCode] = useState(`// TeamSync Collaborative Code Editor
// Workspace: ${workspace.name}
// Developer: ${user.name} (${user.employeeId})

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';

const TeamProductivityTracker = () => {
  const [tasks, setTasks] = useState([]);
  const [metrics, setMetrics] = useState({
    completed: 0,
    inProgress: 0,
    pending: 0
  });

  useEffect(() => {
    // Fetch real-time team metrics
    fetchTeamMetrics();
  }, []);

  const fetchTeamMetrics = async () => {
    try {
      const response = await fetch('/api/team/metrics');
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };

  const calculateProductivity = (tasks, hours) => {
    const completedTasks = tasks.filter(task => task.status === 'completed');
    const productivity = completedTasks.length / hours;
    
    return {
      score: Math.round(productivity * 100),
      efficiency: productivity > 0.8 ? 'high' : 'medium',
      teamRating: productivity > 0.9 ? 'excellent' : 'good'
    };
  };

  return (
    <Card className="w-full">
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded">
            <h3 className="font-bold text-green-700">Completed</h3>
            <p className="text-2xl font-bold text-green-800">{metrics.completed}</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded">
            <h3 className="font-bold text-yellow-700">In Progress</h3>
            <p className="text-2xl font-bold text-yellow-800">{metrics.inProgress}</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded">
            <h3 className="font-bold text-blue-700">Pending</h3>
            <p className="text-2xl font-bold text-blue-800">{metrics.pending}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamProductivityTracker;

// TODO: Add real-time websocket connection
// TODO: Implement team notifications
// TODO: Add sprint planning integration`);

  const [activeFile, setActiveFile] = useState('TeamProductivityTracker.tsx');
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [language, setLanguage] = useState('typescript');

  const [activeUsers, setActiveUsers] = useState<CodeUser[]>([
    {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      isViewing: true,
      isEditing: false,
      status: 'online'
    },
    {
      id: '2',
      name: 'Sarah Chen',
      avatar: 'SC',
      isViewing: true,
      isEditing: true,
      cursorLine: 12,
      status: 'online'
    },
    {
      id: '3',
      name: 'Mike Johnson',
      avatar: 'MJ',
      isViewing: true,
      isEditing: false,
      cursorLine: 25,
      status: 'online'
    }
  ]);

  const files = [
    { name: 'TeamProductivityTracker.tsx', type: 'typescript', icon: FileText },
    { name: 'utils/teamMetrics.ts', type: 'typescript', icon: FileText },
    { name: 'components/Dashboard.tsx', type: 'typescript', icon: FileText },
    { name: 'styles/global.css', type: 'css', icon: FileText },
    { name: 'package.json', type: 'json', icon: FileText },
  ];

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState(0);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
    setCursorPosition(e.target.selectionStart);
    
    // Simulate real-time editing status
    setActiveUsers(prev => prev.map(user => 
      user.id === user.id 
        ? { ...user, isEditing: true, cursorLine: getCurrentLine(e.target.selectionStart) }
        : user
    ));
  };

  const getCurrentLine = (position: number): number => {
    const textBeforeCursor = code.substring(0, position);
    return textBeforeCursor.split('\n').length;
  };

  const toggleVideoCall = () => {
    setIsVideoCall(!isVideoCall);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
  };

  const runCode = () => {
    console.log('Running code...');
    // Simulate code execution
  };

  const saveFile = () => {
    console.log('Saving file...');
    // Simulate file saving
  };

  useEffect(() => {
    // Simulate real-time cursor updates
    const interval = setInterval(() => {
      setActiveUsers(prev => prev.map(user => {
        if (user.id !== user.id) {
          return {
            ...user,
            cursorLine: Math.floor(Math.random() * 50) + 1,
            isEditing: Math.random() > 0.7
          };
        }
        return user;
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between p-2 bg-gray-900 text-white text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Code className="text-blue-400" size={16} />
            <span className="font-medium">VS Code Collaboration</span>
          </div>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" onClick={saveFile} className="text-white hover:bg-gray-700">
              <Save size={14} className="mr-1" />
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={runCode} className="text-white hover:bg-gray-700">
              <Play size={14} className="mr-1" />
              Run
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Video Call Controls */}
          <Button size="sm" onClick={toggleVideoCall} variant={isVideoCall ? "default" : "ghost"} className={isVideoCall ? "bg-green-600 hover:bg-green-700" : "text-white hover:bg-gray-700"}>
            {isVideoCall ? <Video size={14} /> : <VideoOff size={14} />}
          </Button>
          
          <Button size="sm" onClick={toggleMute} variant={isMuted ? "destructive" : "ghost"} className={!isMuted ? "text-white hover:bg-gray-700" : ""}>
            {isMuted ? <MicOff size={14} /> : <Mic size={14} />}
          </Button>
          
          <Button size="sm" onClick={toggleScreenShare} variant={isScreenSharing ? "default" : "ghost"} className={isScreenSharing ? "bg-blue-600 hover:bg-blue-700" : "text-white hover:bg-gray-700"}>
            <Share size={14} />
          </Button>

          {/* Active Users */}
          <div className="flex items-center gap-1 ml-2">
            {activeUsers.map(user => (
              <div key={user.id} className="relative">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                  {user.avatar}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-2 h-2 rounded-full border border-gray-900 ${
                  user.status === 'online' ? 'bg-green-400' : 'bg-gray-400'
                }`} />
                {user.isEditing && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full border border-gray-900" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* File Explorer */}
        <div className="w-64 bg-gray-800 text-white p-2 overflow-y-auto">
          <div className="flex items-center gap-2 mb-4 text-sm font-medium">
            <Folder size={16} />
            <span>{workspace.name}</span>
          </div>
          <div className="space-y-1">
            {files.map((file) => {
              const Icon = file.icon;
              return (
                <button
                  key={file.name}
                  onClick={() => setActiveFile(file.name)}
                  className={`w-full flex items-center gap-2 p-2 text-left text-sm rounded hover:bg-gray-700 transition-colors ${
                    activeFile === file.name ? 'bg-gray-700 text-blue-400' : ''
                  }`}
                >
                  <Icon size={14} />
                  <span>{file.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Editor */}
        <div className="flex-1 flex flex-col">
          {/* File Tabs */}
          <div className="flex items-center bg-gray-700 text-white text-sm">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 border-r border-gray-600">
              <FileText size={14} />
              <span>{activeFile}</span>
              <Badge variant="outline" className="ml-2 text-xs">{language}</Badge>
            </div>
          </div>

          {/* Code Editor Area */}
          <div className="flex-1 relative">
            <div className="absolute inset-0 flex">
              {/* Line Numbers */}
              <div className="w-12 bg-gray-800 text-gray-400 text-sm font-mono p-2 overflow-hidden">
                {code.split('\n').map((_, index) => (
                  <div key={index} className="h-6 flex items-center justify-end pr-2">
                    {index + 1}
                  </div>
                ))}
              </div>

              {/* Code Content */}
              <div className="flex-1 relative">
                <textarea
                  ref={textAreaRef}
                  value={code}
                  onChange={handleCodeChange}
                  className="w-full h-full font-mono text-sm p-4 bg-gray-900 text-white resize-none border-none outline-none"
                  style={{ 
                    lineHeight: '1.5',
                    tabSize: 2,
                    fontSize: '14px'
                  }}
                  spellCheck={false}
                />
                
                {/* Live cursors indicator */}
                <div className="absolute top-2 right-2 space-y-1">
                  {activeUsers.filter(u => u.isEditing && u.id !== user.id).map(user => (
                    <div key={user.id} className="flex items-center gap-1 text-xs bg-gray-800 text-white rounded px-2 py-1 shadow">
                      <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                      <span>{user.name} editing line {user.cursorLine}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Status Bar */}
          <div className="flex items-center justify-between px-4 py-1 bg-blue-600 text-white text-xs">
            <div className="flex items-center gap-4">
              <span>Line {getCurrentLine(cursorPosition)}, Column {cursorPosition - code.lastIndexOf('\n', cursorPosition - 1)}</span>
              <span>UTF-8</span>
              <span>{language}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Connected: {activeUsers.filter(u => u.status === 'online').length} users</span>
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Call Participants (when video call is active) */}
      {isVideoCall && (
        <div className="absolute bottom-4 right-4 bg-gray-900 rounded-lg p-4 max-w-md">
          <div className="grid grid-cols-2 gap-2">
            {activeUsers.filter(u => u.status === 'online').slice(0, 4).map(user => (
              <div key={user.id} className="relative">
                <div className="aspect-video bg-gray-800 rounded flex items-center justify-center text-white text-lg font-bold w-24 h-18">
                  {user.avatar}
                </div>
                <div className="absolute bottom-1 left-1 bg-black bg-opacity-75 text-white px-1 py-0.5 rounded text-xs">
                  {user.name}
                </div>
                {user.name === user.name && isMuted && (
                  <div className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded">
                    <MicOff size={8} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
