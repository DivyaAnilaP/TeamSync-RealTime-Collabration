import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, VideoOff, Mic, MicOff, Share, Code, Play, Save, Folder, FileText } from 'lucide-react';

interface CodeUser { id: string; name: string; avatar: string; isViewing: boolean; isEditing: boolean; cursorLine?: number; status: 'online' | 'away'; }
interface VSCodeEditorProps { user: any; workspace: any; }

export const VSCodeEditor: React.FC<VSCodeEditorProps> = ({ user, workspace }) => {
  const [code, setCode] = useState(`// TeamSync Collaborative Code Editor
// Workspace: ${workspace.name}
// Developer: ${user.name} (${user.employeeId})

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';

const TeamProductivityTracker = () => {
  const [tasks, setTasks] = useState([]);
  const [metrics, setMetrics] = useState({ completed: 0, inProgress: 0, pending: 0 });

  useEffect(() => { fetchTeamMetrics(); }, []);

  const fetchTeamMetrics = async () => {
    try {
      const response = await fetch('/api/team/metrics');
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };

  return (
    <Card className="w-full">
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded">
            <h3 className="font-bold text-green-700">Completed</h3>
            <p className="text-2xl font-bold text-green-800">{metrics.completed}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamProductivityTracker;

// TODO: Add real-time websocket connection
// TODO: Implement team notifications`);

  const [activeFile, setActiveFile] = useState('TeamProductivityTracker.tsx');
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [language] = useState('typescript');
  const [activeUsers, setActiveUsers] = useState<CodeUser[]>([
    { id: user.id, name: user.name, avatar: user.avatar, isViewing: true, isEditing: false, status: 'online' },
    { id: '2', name: 'Sarah Chen', avatar: 'SC', isViewing: true, isEditing: true, cursorLine: 12, status: 'online' },
    { id: '3', name: 'Mike Johnson', avatar: 'MJ', isViewing: true, isEditing: false, cursorLine: 25, status: 'online' }
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
  };

  const getCurrentLine = (position: number): number => {
    return code.substring(0, position).split('\n').length;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers(prev => prev.map(u => {
        if (u.id !== user.id) {
          return { ...u, cursorLine: Math.floor(Math.random() * 50) + 1, isEditing: Math.random() > 0.7 };
        }
        return u;
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-2 bg-gray-900 text-white text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2"><Code className="text-blue-400" size={16} /><span className="font-medium">VS Code Collaboration</span></div>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" onClick={() => console.log('Saving...')} className="text-white hover:bg-gray-700"><Save size={14} className="mr-1" />Save</Button>
            <Button size="sm" variant="ghost" onClick={() => console.log('Running...')} className="text-white hover:bg-gray-700"><Play size={14} className="mr-1" />Run</Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setIsVideoCall(!isVideoCall)} variant={isVideoCall ? "default" : "ghost"} className={isVideoCall ? "bg-green-600 hover:bg-green-700" : "text-white hover:bg-gray-700"}>{isVideoCall ? <Video size={14} /> : <VideoOff size={14} />}</Button>
          <Button size="sm" onClick={() => setIsMuted(!isMuted)} variant={isMuted ? "destructive" : "ghost"} className={!isMuted ? "text-white hover:bg-gray-700" : ""}>{isMuted ? <MicOff size={14} /> : <Mic size={14} />}</Button>
          <Button size="sm" onClick={() => setIsScreenSharing(!isScreenSharing)} variant={isScreenSharing ? "default" : "ghost"} className={isScreenSharing ? "bg-blue-600 hover:bg-blue-700" : "text-white hover:bg-gray-700"}><Share size={14} /></Button>
          <div className="flex items-center gap-1 ml-2">
            {activeUsers.map(u => (
              <div key={u.id} className="relative">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">{u.avatar}</div>
                <div className={`absolute -bottom-1 -right-1 w-2 h-2 rounded-full border border-gray-900 ${u.status === 'online' ? 'bg-green-400' : 'bg-gray-400'}`} />
                {u.isEditing && <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full border border-gray-900" />}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 bg-gray-800 text-white p-2 overflow-y-auto">
          <div className="flex items-center gap-2 mb-4 text-sm font-medium"><Folder size={16} /><span>{workspace.name}</span></div>
          <div className="space-y-1">
            {files.map((file) => { const Icon = file.icon; return (
              <button key={file.name} onClick={() => setActiveFile(file.name)} className={`w-full flex items-center gap-2 p-2 text-left text-sm rounded hover:bg-gray-700 transition-colors ${activeFile === file.name ? 'bg-gray-700 text-blue-400' : ''}`}><Icon size={14} /><span>{file.name}</span></button>
            ); })}
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="flex items-center bg-gray-700 text-white text-sm"><div className="flex items-center gap-2 px-4 py-2 bg-gray-800 border-r border-gray-600"><FileText size={14} /><span>{activeFile}</span><Badge variant="outline" className="ml-2 text-xs">{language}</Badge></div></div>
          <div className="flex-1 relative">
            <div className="absolute inset-0 flex">
              <div className="w-12 bg-gray-800 text-gray-400 text-sm font-mono p-2 overflow-hidden">{code.split('\n').map((_, index) => (<div key={index} className="h-6 flex items-center justify-end pr-2">{index + 1}</div>))}</div>
              <div className="flex-1 relative">
                <textarea ref={textAreaRef} value={code} onChange={handleCodeChange} className="w-full h-full font-mono text-sm p-4 bg-gray-900 text-white resize-none border-none outline-none" style={{ lineHeight: '1.5', tabSize: 2, fontSize: '14px' }} spellCheck={false} />
                <div className="absolute top-2 right-2 space-y-1">
                  {activeUsers.filter(u => u.isEditing && u.id !== user.id).map(u => (<div key={u.id} className="flex items-center gap-1 text-xs bg-gray-800 text-white rounded px-2 py-1 shadow"><div className="w-2 h-2 rounded-full bg-yellow-400"></div><span>{u.name} editing line {u.cursorLine}</span></div>))}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between px-4 py-1 bg-blue-600 text-white text-xs">
            <div className="flex items-center gap-4"><span>Line {getCurrentLine(cursorPosition)}, Column {cursorPosition - code.lastIndexOf('\n', cursorPosition - 1)}</span><span>UTF-8</span><span>{language}</span></div>
            <div className="flex items-center gap-2"><span>Connected: {activeUsers.filter(u => u.status === 'online').length} users</span><div className="w-2 h-2 bg-green-400 rounded-full"></div></div>
          </div>
        </div>
      </div>
    </div>
  );
};
