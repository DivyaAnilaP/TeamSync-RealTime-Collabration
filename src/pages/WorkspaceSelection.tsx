import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Building, Plus, Users, LogOut, Copy, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Workspace {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  owner_id: string;
  memberCount?: number;
  isOwner: boolean;
  role: string;
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
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      // Get workspaces where user is a member
      const { data: memberData, error: memberError } = await supabase
        .from('workspace_members')
        .select('workspace_id, role')
        .eq('user_id', user.id);

      if (memberError) throw memberError;
      if (!memberData || memberData.length === 0) {
        setWorkspaces([]);
        setLoading(false);
        return;
      }

      const workspaceIds = memberData.map(m => m.workspace_id);
      const { data: wsData, error: wsError } = await supabase
        .from('workspaces')
        .select('*')
        .in('id', workspaceIds);

      if (wsError) throw wsError;

      // Get member counts without HEAD requests so the preview/network layer does not abort them
      const workspacesWithDetails: Workspace[] = await Promise.all(
        (wsData || []).map(async (ws) => {
          const { data: members } = await supabase
            .from('workspace_members')
            .select('id')
            .eq('workspace_id', ws.id);

          const memberRole = memberData.find(m => m.workspace_id === ws.id)?.role || 'member';
          return {
            ...ws,
            memberCount: members?.length || 1,
            isOwner: ws.owner_id === user.id,
            role: memberRole,
          };
        })
      );

      setWorkspaces(workspacesWithDetails);
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      toast({ title: "Error", description: "Failed to load workspaces", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkspace = async () => {
    if (!newWorkspace.name.trim()) return;
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .insert({
          name: newWorkspace.name,
          description: newWorkspace.description || null,
          owner_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as owner member
      const { error: memberError } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: data.id,
          user_id: user.id,
          role: 'owner',
        });

      if (memberError) throw memberError;

      toast({ title: "Workspace Created!", description: `"${data.name}" is ready to go.` });
      setNewWorkspace({ name: '', description: '' });
      setShowCreateForm(false);
      fetchWorkspaces();
    } catch (error: any) {
      console.error('Error creating workspace:', error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleJoinWorkspace = async () => {
    if (!inviteCode.trim()) return;
    try {
      // Find workspace by invite code
      const { data: ws, error: wsError } = await supabase
        .from('workspaces')
        .select('*')
        .eq('invite_code', inviteCode.trim().toUpperCase())
        .maybeSingle();

      if (wsError) throw wsError;
      if (!ws) {
        toast({ title: "Not Found", description: "No workspace found with that invite code.", variant: "destructive" });
        return;
      }

      // Check if already a member
      const { data: existing } = await supabase
        .from('workspace_members')
        .select('id')
        .eq('workspace_id', ws.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        toast({ title: "Already a member", description: "You're already in this workspace." });
        setInviteCode('');
        setShowJoinForm(false);
        return;
      }

      const { error: joinError } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: ws.id,
          user_id: user.id,
          role: 'member',
        });

      if (joinError) throw joinError;

      toast({ title: "Joined!", description: `You've joined "${ws.name}".` });
      setInviteCode('');
      setShowJoinForm(false);
      fetchWorkspaces();
    } catch (error: any) {
      console.error('Error joining workspace:', error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <p className="text-gray-600">Loading workspaces...</p>
      </div>
    );
  }

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

        {workspaces.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Workspaces Yet</h3>
              <p className="text-gray-500">Create a new workspace or join one using an invite code.</p>
            </CardContent>
          </Card>
        ) : (
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
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1">{workspace.invite_code}</code>
                        <Button size="sm" variant="outline" onClick={() => copyInviteCode(workspace.invite_code)}>
                          {copiedCode === workspace.invite_code ? <Check size={12} /> : <Copy size={12} />}
                        </Button>
                      </div>
                    )}
                    <Button className="w-full" onClick={() => onSelectWorkspace(workspace)}>Enter Workspace</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
