import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Building, Plus, Users, LogOut, Copy, Check } from 'lucide-react';

interface Workspace {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isOwner: boolean;
  inviteCode: string;
}

interface WorkspaceSelectionProps {
  user: any;
  onSelectWorkspace: (workspace: Workspace) => void;
  onLogout: () => void;
}

export const WorkspaceSelection: React.FC<WorkspaceSelectionProps> = ({ user, onSelectWorkspace, onLogout }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [newWorkspace, setNewWorkspace] = useState({ name: '', description: '' });
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [workspaces, setWorkspaces] = useState<Workspace[]>([
    { id: 'ws1', name: 'Tech Team Alpha', description: 'Frontend development team', memberCount: 12, isOwner: true, inviteCode: 'TECH-ALPHA-2024' },
    { id: 'ws2', name: 'Marketing Squad', description: 'Creative marketing campaigns', memberCount: 8, isOwner: false, inviteCode: 'MARKET-SQUAD-2024' }
  ]);

  const handleCreateWorkspace = () => {
    const workspace: Workspace = {
      id: `ws${Date.now()}`,
      name: newWorkspace.name,
      description: newWorkspace.description,
      memberCount: 1,
      isOwner: true,
      inviteCode: `${newWorkspace.name.toUpperCase().replace(/\s+/g, '-')}-${Date.now().toString().slice(-4)}`
    };
    setWorkspaces(prev => [...prev, workspace]);
    setNewWorkspace({ name: '', description: '' });
    setShowCreateForm(false);
  };

  const handleJoinWorkspace = () => {
    const workspace: Workspace = {
      id: `ws${Date.now()}`,
      name: 'Joined Workspace',
      description: 'Workspace joined via invite code',
      memberCount: 15,
      isOwner: false,
      inviteCode: inviteCode
    };
    setWorkspaces(prev => [...prev, workspace]);
    setInviteCode('');
    setShowJoinForm(false);
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Building className="text-purple-600" size={32} />
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Select Workspace</h1>
            <p className="text-gray-600">Welcome back, {user.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline">ID: {user.employeeId}</Badge>
          <Button variant="outline" onClick={onLogout}><LogOut size={16} className="mr-2" />Logout</Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="flex gap-4 mb-6">
          <Button onClick={() => setShowCreateForm(true)} className="bg-gradient-to-r from-purple-500 to-blue-500"><Plus size={16} className="mr-2" />Create Workspace</Button>
          <Button variant="outline" onClick={() => setShowJoinForm(true)}><Users size={16} className="mr-2" />Join Workspace</Button>
        </div>

        {showCreateForm && (
          <Card className="mb-6">
            <CardHeader><CardTitle>Create New Workspace</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workspace-name">Workspace Name</Label>
                <Input id="workspace-name" placeholder="Enter workspace name" value={newWorkspace.name} onChange={(e) => setNewWorkspace(prev => ({ ...prev, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workspace-desc">Description</Label>
                <Input id="workspace-desc" placeholder="Brief description of the workspace" value={newWorkspace.description} onChange={(e) => setNewWorkspace(prev => ({ ...prev, description: e.target.value }))} />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateWorkspace} disabled={!newWorkspace.name}>Create Workspace</Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {showJoinForm && (
          <Card className="mb-6">
            <CardHeader><CardTitle>Join Workspace</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invite-code">Invite Code</Label>
                <Input id="invite-code" placeholder="Enter workspace invite code" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleJoinWorkspace} disabled={!inviteCode}>Join Workspace</Button>
                <Button variant="outline" onClick={() => setShowJoinForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((workspace) => (
            <Card key={workspace.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{workspace.name}</CardTitle>
                    <p className="text-gray-600 text-sm mt-1">{workspace.description}</p>
                  </div>
                  {workspace.isOwner && <Badge variant="secondary">Owner</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600"><Users size={16} /><span>{workspace.memberCount} members</span></div>
                  {workspace.isOwner && (
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1">{workspace.inviteCode}</code>
                      <Button size="sm" variant="outline" onClick={() => copyInviteCode(workspace.inviteCode)}>
                        {copiedCode === workspace.inviteCode ? <Check size={12} /> : <Copy size={12} />}
                      </Button>
                    </div>
                  )}
                  <Button className="w-full" onClick={() => onSelectWorkspace(workspace)}>Enter Workspace</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
