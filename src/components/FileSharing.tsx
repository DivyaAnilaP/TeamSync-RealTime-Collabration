import React, { useState, useEffect } from 'react';
import { Upload, Download, File, Image, FileText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FileSharingProps { user: any; workspace: any; }

export const FileSharing: React.FC<FileSharingProps> = ({ user, workspace }) => {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchFiles(); }, [workspace.id]);

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('shared_files')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally { setLoading(false); }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image')) return <Image size={24} className="text-green-500" />;
    if (type.includes('pdf') || type.includes('doc')) return <FileText size={24} className="text-blue-500" />;
    return <File size={24} className="text-gray-500" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    for (const file of Array.from(selectedFiles)) {
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('shared-files').upload(filePath, file);
      if (uploadError) { toast({ title: "Upload Error", description: uploadError.message, variant: "destructive" }); continue; }

      const { data, error } = await supabase.from('shared_files').insert({
        workspace_id: workspace.id,
        name: file.name,
        file_type: file.type || 'document',
        size_bytes: file.size,
        storage_path: filePath,
        uploaded_by: user.id,
      }).select().single();

      if (!error && data) setFiles(prev => [data, ...prev]);
    }
    toast({ title: "Files Uploaded! 📁", description: `${selectedFiles.length} file(s) shared with your team` });
    event.target.value = '';
  };

  const handleDownload = async (file: any) => {
    const { data } = await supabase.storage.from('shared-files').createSignedUrl(file.storage_path, 300);
    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank');
      await supabase.from('shared_files').update({ download_count: (file.download_count || 0) + 1 }).eq('id', file.id);
      setFiles(prev => prev.map(f => f.id === file.id ? { ...f, download_count: (f.download_count || 0) + 1 } : f));
    }
  };

  const handleDelete = async (file: any) => {
    await supabase.storage.from('shared-files').remove([file.storage_path]);
    const { error } = await supabase.from('shared_files').delete().eq('id', file.id);
    if (!error) {
      setFiles(prev => prev.filter(f => f.id !== file.id));
      toast({ title: "File Deleted", description: "File removed from shared storage" });
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading files...</div>;

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-800">File Sharing - {workspace.name}</h2>
        <div>
          <input type="file" multiple onChange={handleFileUpload} className="hidden" id="file-upload" />
          <label htmlFor="file-upload"><Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600" asChild><span><Upload size={20} className="mr-2" />Upload Files</span></Button></label>
        </div>
      </div>
      {files.length === 0 ? (
        <Card className="mb-6 border-dashed border-2 border-purple-300">
          <CardContent className="p-8 text-center"><Upload size={48} className="mx-auto text-purple-400 mb-4" /><h3 className="text-lg font-semibold text-gray-700 mb-2">No files shared yet</h3><p className="text-gray-500">Upload files to share with your team</p></CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => (
            <Card key={file.id} className="hover:shadow-lg transition-shadow border-purple-100">
              <CardHeader className="pb-3"><div className="flex items-center gap-3">{getFileIcon(file.file_type)}<div className="flex-1 min-w-0"><h4 className="font-semibold text-gray-800 truncate">{file.name}</h4><p className="text-sm text-gray-500">{formatSize(file.size_bytes)}</p></div></div></CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 text-sm text-gray-600">
                  <div><span className="font-medium">Date:</span> {new Date(file.created_at).toLocaleDateString()}</div>
                  <div><span className="font-medium">Downloads:</span> {file.download_count}</div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" onClick={() => handleDownload(file)} className="flex-1"><Download size={16} className="mr-1" />Download</Button>
                  {file.uploaded_by === user.id && <Button size="sm" variant="outline" onClick={() => handleDelete(file)}><Trash2 size={16} /></Button>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
