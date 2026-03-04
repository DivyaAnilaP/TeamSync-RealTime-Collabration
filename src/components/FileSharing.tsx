import React, { useState } from 'react';
import { Upload, Download, File, Image, FileText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface SharedFile { id: string; name: string; type: string; size: string; uploadedBy: string; uploadDate: Date; downloadCount: number; }
interface FileSharingProps { user: any; workspace: any; }

export const FileSharing: React.FC<FileSharingProps> = ({ user, workspace }) => {
  const [files, setFiles] = useState<SharedFile[]>([
    { id: '1', name: 'project-wireframes.figma', type: 'design', size: '2.4 MB', uploadedBy: 'Sarah Chen', uploadDate: new Date(Date.now() - 86400000), downloadCount: 5 },
    { id: '2', name: 'api-documentation.pdf', type: 'document', size: '1.8 MB', uploadedBy: 'Alex Rodriguez', uploadDate: new Date(Date.now() - 172800000), downloadCount: 8 },
    { id: '3', name: 'user-flow-diagram.png', type: 'image', size: '856 KB', uploadedBy: 'Mike Johnson', uploadDate: new Date(Date.now() - 259200000), downloadCount: 3 }
  ]);

  const getFileIcon = (type: string) => {
    switch (type) { case 'image': return <Image size={24} className="text-green-500" />; case 'document': return <FileText size={24} className="text-blue-500" />; default: return <File size={24} className="text-gray-500" />; }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;
    Array.from(selectedFiles).forEach(file => {
      const newFile: SharedFile = { id: Date.now().toString() + Math.random(), name: file.name, type: file.type.startsWith('image/') ? 'image' : 'document', size: (file.size / 1024 / 1024).toFixed(1) + ' MB', uploadedBy: user.name, uploadDate: new Date(), downloadCount: 0 };
      setFiles(prev => [newFile, ...prev]);
    });
    toast({ title: "Files Uploaded! 📁", description: `${selectedFiles.length} file(s) shared with your team` });
  };

  const handleDownload = (fileId: string) => {
    setFiles(prev => prev.map(file => file.id === fileId ? { ...file, downloadCount: file.downloadCount + 1 } : file));
    toast({ title: "Download Started", description: "File download has been initiated" });
  };

  const handleDelete = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
    toast({ title: "File Deleted", description: "File has been removed from shared storage" });
  };

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-800">File Sharing - {workspace.name}</h2>
        <div>
          <input type="file" multiple onChange={handleFileUpload} className="hidden" id="file-upload" />
          <label htmlFor="file-upload"><Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600" asChild><span><Upload size={20} className="mr-2" />Upload Files</span></Button></label>
        </div>
      </div>
      <Card className="mb-6 border-dashed border-2 border-purple-300">
        <CardContent className="p-8 text-center"><Upload size={48} className="mx-auto text-purple-400 mb-4" /><h3 className="text-lg font-semibold text-gray-700 mb-2">Drag and drop files here, or click to browse</h3><p className="text-gray-500">Share documents, images, and other files with your team</p></CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file) => (
          <Card key={file.id} className="hover:shadow-lg transition-shadow border-purple-100">
            <CardHeader className="pb-3"><div className="flex items-center gap-3">{getFileIcon(file.type)}<div className="flex-1 min-w-0"><h4 className="font-semibold text-gray-800 truncate">{file.name}</h4><p className="text-sm text-gray-500">{file.size}</p></div></div></CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 text-sm text-gray-600"><div><span className="font-medium">Uploaded by:</span> {file.uploadedBy}</div><div><span className="font-medium">Date:</span> {file.uploadDate.toLocaleDateString()}</div><div><span className="font-medium">Downloads:</span> {file.downloadCount}</div></div>
              <div className="flex gap-2 mt-4"><Button size="sm" onClick={() => handleDownload(file.id)} className="flex-1"><Download size={16} className="mr-1" />Download</Button><Button size="sm" variant="outline" onClick={() => handleDelete(file.id)}><Trash2 size={16} /></Button></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
