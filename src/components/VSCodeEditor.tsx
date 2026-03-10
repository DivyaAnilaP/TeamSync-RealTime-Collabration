import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Video, VideoOff, Mic, MicOff, Share, Code, Play, Save, Folder, FileText,
  Plus, X, Terminal as TerminalIcon, ChevronRight, ChevronDown, Search,
  Undo, Redo, Download, Upload, Settings, Maximize2, Minimize2, Trash2,
  FolderPlus, FilePlus, Copy, Clipboard, AlertCircle, CheckCircle2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface VSCodeEditorProps { user: any; workspace: any; }

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  content?: string;
  language?: string;
}

const DEFAULT_FILES: FileNode[] = [
  {
    name: 'src', path: 'src', type: 'folder', children: [
      {
        name: 'index.ts', path: 'src/index.ts', type: 'file', language: 'typescript',
        content: `// Main entry point\nimport { greet } from './utils';\nimport { TaskManager } from './taskManager';\n\nconst manager = new TaskManager();\nmanager.addTask('Build feature', 'high');\nmanager.addTask('Write tests', 'medium');\nmanager.addTask('Deploy app', 'low');\n\nconsole.log(greet('TeamSync'));\nconsole.log('\\nAll Tasks:');\nmanager.listTasks();\n\nconsole.log('\\nCompleting first task...');\nmanager.completeTask(0);\nconsole.log('\\nUpdated Tasks:');\nmanager.listTasks();\n`
      },
      {
        name: 'utils.ts', path: 'src/utils.ts', type: 'file', language: 'typescript',
        content: `// Utility functions\nexport function greet(name: string): string {\n  return \`Hello from \${name}! 🚀\`;\n}\n\nexport function formatDate(date: Date): string {\n  return date.toLocaleDateString('en-US', {\n    weekday: 'long', year: 'numeric',\n    month: 'long', day: 'numeric'\n  });\n}\n\nexport function generateId(): string {\n  return Math.random().toString(36).substring(2, 9);\n}\n\nconsole.log(greet('Developer'));\nconsole.log('Today is:', formatDate(new Date()));\nconsole.log('Generated ID:', generateId());\n`
      },
      {
        name: 'taskManager.ts', path: 'src/taskManager.ts', type: 'file', language: 'typescript',
        content: `// Task Manager Module\ninterface Task {\n  title: string;\n  priority: 'high' | 'medium' | 'low';\n  completed: boolean;\n  createdAt: Date;\n}\n\nexport class TaskManager {\n  private tasks: Task[] = [];\n\n  addTask(title: string, priority: Task['priority']): void {\n    this.tasks.push({ title, priority, completed: false, createdAt: new Date() });\n    console.log(\`✅ Added task: "\${title}" [\${priority}]\`);\n  }\n\n  completeTask(index: number): void {\n    if (this.tasks[index]) {\n      this.tasks[index].completed = true;\n      console.log(\`🎉 Completed: "\${this.tasks[index].title}"\`);\n    }\n  }\n\n  listTasks(): void {\n    this.tasks.forEach((t, i) => {\n      const status = t.completed ? '✅' : '⬜';\n      const pri = { high: '🔴', medium: '🟡', low: '🟢' }[t.priority];\n      console.log(\`  \${status} \${pri} [\${i}] \${t.title}\`);\n    });\n  }\n\n  getStats(): { total: number; completed: number; pending: number } {\n    const completed = this.tasks.filter(t => t.completed).length;\n    return { total: this.tasks.length, completed, pending: this.tasks.length - completed };\n  }\n}\n\n// Quick test\nconst mgr = new TaskManager();\nmgr.addTask('Test task', 'high');\nmgr.listTasks();\nconst stats = mgr.getStats();\nconsole.log('Stats:', JSON.stringify(stats));\n`
      },
    ]
  },
  {
    name: 'styles.css', path: 'styles.css', type: 'file', language: 'css',
    content: `/* Global Styles */\n:root {\n  --primary: #6366f1;\n  --bg: #1e1e1e;\n  --text: #d4d4d4;\n}\n\nbody {\n  font-family: 'Segoe UI', sans-serif;\n  background: var(--bg);\n  color: var(--text);\n  margin: 0;\n  padding: 20px;\n}\n\n.container {\n  max-width: 1200px;\n  margin: 0 auto;\n}\n\n.card {\n  background: #2d2d2d;\n  border-radius: 8px;\n  padding: 16px;\n  margin-bottom: 12px;\n  border: 1px solid #404040;\n}\n`
  },
  {
    name: 'README.md', path: 'README.md', type: 'file', language: 'markdown',
    content: `# TeamSync Project\n\nA collaborative workspace for teams.\n\n## Features\n- Real-time collaboration\n- Task management\n- Sprint planning\n- Code sharing\n\n## Getting Started\n\n\`\`\`bash\nnpm install\nnpm start\n\`\`\`\n\n## Team\nBuilt with ❤️ by the TeamSync team.\n`
  },
  {
    name: 'package.json', path: 'package.json', type: 'file', language: 'json',
    content: `{\n  "name": "teamsync-project",\n  "version": "1.0.0",\n  "description": "TeamSync collaborative workspace",\n  "main": "src/index.ts",\n  "scripts": {\n    "start": "ts-node src/index.ts",\n    "build": "tsc",\n    "test": "jest"\n  },\n  "dependencies": {\n    "typescript": "^5.0.0"\n  }\n}\n`
  }
];

// Simple syntax highlighter
const highlightCode = (code: string, language: string): React.ReactNode[] => {
  const lines = code.split('\n');
  return lines.map((line, i) => {
    let highlighted = line;
    if (language === 'typescript' || language === 'javascript') {
      // Order matters - do strings first, then keywords
      highlighted = highlighted
        .replace(/\/\/.*/g, m => `<span class="text-green-500">${m}</span>`)
        .replace(/('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)/g, m => `<span class="text-amber-300">${m}</span>`)
        .replace(/\b(import|export|from|const|let|var|function|return|if|else|for|while|class|interface|type|extends|implements|new|this|async|await|try|catch|throw|typeof|void|null|undefined|true|false)\b/g, m => `<span class="text-purple-400">${m}</span>`)
        .replace(/\b(string|number|boolean|Date|Promise|any)\b/g, m => `<span class="text-cyan-400">${m}</span>`)
        .replace(/\b(console)\b/g, m => `<span class="text-blue-300">${m}</span>`)
        .replace(/\b(\d+)\b/g, m => `<span class="text-orange-300">${m}</span>`);
    } else if (language === 'css') {
      highlighted = highlighted
        .replace(/\/\*.*/g, m => `<span class="text-green-500">${m}</span>`)
        .replace(/(--[\w-]+)/g, m => `<span class="text-cyan-400">${m}</span>`)
        .replace(/(#[a-fA-F0-9]+)/g, m => `<span class="text-amber-300">${m}</span>`)
        .replace(/\b(\d+)(px|rem|em|%|vh|vw)/g, (_, n, u) => `<span class="text-orange-300">${n}</span><span class="text-cyan-300">${u}</span>`)
        .replace(/([.#][\w-]+)/g, m => `<span class="text-amber-200">${m}</span>`);
    } else if (language === 'json') {
      highlighted = highlighted
        .replace(/("(?:[^"\\]|\\.)*")\s*:/g, (_, k) => `<span class="text-cyan-400">${k}</span>:`)
        .replace(/:\s*("(?:[^"\\]|\\.)*")/g, (_, v) => `: <span class="text-amber-300">${v}</span>`)
        .replace(/\b(true|false|null)\b/g, m => `<span class="text-purple-400">${m}</span>`)
        .replace(/\b(\d+)\b/g, m => `<span class="text-orange-300">${m}</span>`);
    } else if (language === 'markdown') {
      highlighted = highlighted
        .replace(/^(#{1,6}\s.*)$/gm, m => `<span class="text-cyan-400 font-bold">${m}</span>`)
        .replace(/\*\*(.*?)\*\*/g, (_, t) => `<span class="text-amber-300 font-bold">${t}</span>`)
        .replace(/^(\s*[-*]\s)/gm, m => `<span class="text-purple-400">${m}</span>`)
        .replace(/`([^`]+)`/g, (_, c) => `<span class="text-green-400 bg-gray-800 px-1 rounded">${c}</span>`);
    }
    return (
      <div key={i} className="h-6 leading-6 whitespace-pre" dangerouslySetInnerHTML={{ __html: highlighted || ' ' }} />
    );
  });
};

const flattenFiles = (nodes: FileNode[]): FileNode[] => {
  const result: FileNode[] = [];
  const recurse = (items: FileNode[]) => {
    items.forEach(item => {
      if (item.type === 'file') result.push(item);
      if (item.children) recurse(item.children);
    });
  };
  recurse(nodes);
  return result;
};

export const VSCodeEditor: React.FC<VSCodeEditorProps> = ({ user, workspace }) => {
  const [files, setFiles] = useState<FileNode[]>(DEFAULT_FILES);
  const [openTabs, setOpenTabs] = useState<string[]>(['src/index.ts']);
  const [activeFile, setActiveFile] = useState('src/index.ts');
  const [terminalOutput, setTerminalOutput] = useState<string[]>(['$ Welcome to TeamSync Terminal']);
  const [showTerminal, setShowTerminal] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeUsers, setActiveUsers] = useState<{ user_id: string; avatar: string; display_name: string }[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src']));
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<{ file: string; line: number; text: string }[]>([]);
  const [unsavedFiles, setUnsavedFiles] = useState<Set<string>>(new Set());
  const [savedSnapshots, setSavedSnapshots] = useState<Record<string, string>>({});
  const [undoStack, setUndoStack] = useState<Record<string, string[]>>({});
  const [redoStack, setRedoStack] = useState<Record<string, string[]>>({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [showNewFile, setShowNewFile] = useState<string | false>(false);
  const [terminalInput, setTerminalInput] = useState('');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, col: 1 });

  // Load workspace members
  useEffect(() => {
    const fetchMembers = async () => {
      const { data: members } = await supabase.from('workspace_members').select('user_id').eq('workspace_id', workspace.id);
      if (!members) return;
      const { data: profiles } = await supabase.from('profiles').select('user_id, display_name, email').in('user_id', members.map(m => m.user_id));
      setActiveUsers((profiles || []).map(p => ({
        user_id: p.user_id,
        display_name: p.display_name || p.email?.split('@')[0] || 'User',
        avatar: (p.display_name || p.email || 'U').substring(0, 2).toUpperCase(),
      })));
    };
    fetchMembers();
  }, [workspace.id]);

  // Load saved files from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`vscode-files-${workspace.id}`);
    if (saved) {
      try { setFiles(JSON.parse(saved)); } catch {}
    }
  }, [workspace.id]);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [terminalOutput]);

  const getFileContent = useCallback((path: string): string => {
    const allFiles = flattenFiles(files);
    return allFiles.find(f => f.path === path)?.content || '';
  }, [files]);

  const getFileLanguage = useCallback((path: string): string => {
    const allFiles = flattenFiles(files);
    return allFiles.find(f => f.path === path)?.language || 'text';
  }, [files]);

  const updateFileContent = useCallback((path: string, content: string) => {
    const update = (nodes: FileNode[]): FileNode[] =>
      nodes.map(n => {
        if (n.path === path) return { ...n, content };
        if (n.children) return { ...n, children: update(n.children) };
        return n;
      });
    setFiles(prev => update(prev));
    setUnsavedFiles(prev => {
      const next = new Set(prev);
      if (content !== (savedSnapshots[path] ?? getFileContent(path))) next.add(path);
      else next.delete(path);
      return next;
    });
  }, [savedSnapshots, getFileContent]);

  const openFile = useCallback((path: string) => {
    setActiveFile(path);
    if (!openTabs.includes(path)) setOpenTabs(prev => [...prev, path]);
  }, [openTabs]);

  const closeTab = useCallback((path: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setOpenTabs(prev => {
      const next = prev.filter(t => t !== path);
      if (activeFile === path) setActiveFile(next[next.length - 1] || '');
      return next;
    });
  }, [activeFile]);

  const handleCodeChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    // Push to undo stack
    setUndoStack(prev => ({
      ...prev,
      [activeFile]: [...(prev[activeFile] || []), getFileContent(activeFile)].slice(-50)
    }));
    setRedoStack(prev => ({ ...prev, [activeFile]: [] }));
    updateFileContent(activeFile, value);
    const pos = e.target.selectionStart;
    const lines = value.substring(0, pos).split('\n');
    setCursorPosition({ line: lines.length, col: lines[lines.length - 1].length + 1 });
  }, [activeFile, getFileContent, updateFileContent]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const ta = e.currentTarget;
    // Tab support
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const value = ta.value;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      updateFileContent(activeFile, newValue);
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + 2; }, 0);
    }
    // Ctrl+S save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
    // Ctrl+Z undo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      handleUndo();
    }
    // Ctrl+Shift+Z or Ctrl+Y redo
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault();
      handleRedo();
    }
    // Auto-close brackets
    const pairs: Record<string, string> = { '{': '}', '(': ')', '[': ']', "'": "'", '"': '"', '`': '`' };
    if (pairs[e.key]) {
      e.preventDefault();
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const selected = ta.value.substring(start, end);
      const newValue = ta.value.substring(0, start) + e.key + selected + pairs[e.key] + ta.value.substring(end);
      updateFileContent(activeFile, newValue);
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + 1; }, 0);
    }
    // Enter with auto-indent
    if (e.key === 'Enter') {
      e.preventDefault();
      const start = ta.selectionStart;
      const lineStart = ta.value.lastIndexOf('\n', start - 1) + 1;
      const currentLine = ta.value.substring(lineStart, start);
      const indent = currentLine.match(/^\s*/)?.[0] || '';
      const lastChar = ta.value[start - 1];
      const extraIndent = lastChar === '{' || lastChar === '(' || lastChar === '[' ? '  ' : '';
      const newValue = ta.value.substring(0, start) + '\n' + indent + extraIndent + ta.value.substring(start);
      updateFileContent(activeFile, newValue);
      const newPos = start + 1 + indent.length + extraIndent.length;
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = newPos; }, 0);
    }
  }, [activeFile, updateFileContent]);

  const handleSave = useCallback(() => {
    const content = getFileContent(activeFile);
    setSavedSnapshots(prev => ({ ...prev, [activeFile]: content }));
    setUnsavedFiles(prev => { const n = new Set(prev); n.delete(activeFile); return n; });
    // Persist all files to localStorage
    localStorage.setItem(`vscode-files-${workspace.id}`, JSON.stringify(files));
    toast.success(`Saved ${activeFile.split('/').pop()}`);
  }, [activeFile, files, workspace.id, getFileContent]);

  const handleSaveAll = useCallback(() => {
    const allFiles = flattenFiles(files);
    const snaps: Record<string, string> = {};
    allFiles.forEach(f => { snaps[f.path] = f.content || ''; });
    setSavedSnapshots(snaps);
    setUnsavedFiles(new Set());
    localStorage.setItem(`vscode-files-${workspace.id}`, JSON.stringify(files));
    toast.success('All files saved');
  }, [files, workspace.id]);

  const handleUndo = useCallback(() => {
    const stack = undoStack[activeFile] || [];
    if (stack.length === 0) return;
    const prev = stack[stack.length - 1];
    setUndoStack(p => ({ ...p, [activeFile]: stack.slice(0, -1) }));
    setRedoStack(p => ({ ...p, [activeFile]: [...(p[activeFile] || []), getFileContent(activeFile)] }));
    updateFileContent(activeFile, prev);
  }, [activeFile, undoStack, getFileContent, updateFileContent]);

  const handleRedo = useCallback(() => {
    const stack = redoStack[activeFile] || [];
    if (stack.length === 0) return;
    const next = stack[stack.length - 1];
    setRedoStack(p => ({ ...p, [activeFile]: stack.slice(0, -1) }));
    setUndoStack(p => ({ ...p, [activeFile]: [...(p[activeFile] || []), getFileContent(activeFile)] }));
    updateFileContent(activeFile, next);
  }, [activeFile, redoStack, getFileContent, updateFileContent]);

  // Execute code in a sandboxed way
  const handleRun = useCallback(() => {
    setShowTerminal(true);
    const content = getFileContent(activeFile);
    setTerminalOutput(prev => [...prev, `\n$ Running ${activeFile}...`, '─'.repeat(40)]);

    // Capture console.log output
    const outputs: string[] = [];
    const mockConsole = {
      log: (...args: any[]) => outputs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
      error: (...args: any[]) => outputs.push(`❌ Error: ${args.join(' ')}`),
      warn: (...args: any[]) => outputs.push(`⚠️ Warning: ${args.join(' ')}`),
    };

    try {
      // Strip TypeScript syntax for execution
      let jsCode = content
        .replace(/import\s+.*?from\s+['"].*?['"];?/g, '')
        .replace(/export\s+(default\s+)?/g, '')
        .replace(/:\s*(string|number|boolean|any|void|Date|Promise|Task|Record|Set)\b(\[\])?/g, '')
        .replace(/<[A-Z]\w*(\[\])?>/g, '')
        .replace(/interface\s+\w+\s*\{[^}]*\}/gs, '')
        .replace(/type\s+\w+\s*=\s*[^;]+;/g, '')
        .replace(/as\s+\w+(\[\])?/g, '')
        .replace(/\bTask\['priority'\]/g, 'string')
        .replace(/private\s+/g, '')
        .replace(/public\s+/g, '')
        .replace(/readonly\s+/g, '');

      // eslint-disable-next-line no-new-func
      const fn = new Function('console', jsCode);
      fn(mockConsole);

      if (outputs.length === 0) outputs.push('(no output)');
      setTerminalOutput(prev => [...prev, ...outputs, `\n✅ Process exited with code 0`]);
    } catch (err: any) {
      setTerminalOutput(prev => [...prev, ...outputs, `\n❌ Runtime Error: ${err.message}`, `\n⛔ Process exited with code 1`]);
    }
  }, [activeFile, getFileContent]);

  const handleTerminalCommand = useCallback((cmd: string) => {
    setTerminalOutput(prev => [...prev, `$ ${cmd}`]);
    const parts = cmd.trim().split(/\s+/);
    const command = parts[0];

    switch (command) {
      case 'clear':
        setTerminalOutput(['$ Terminal cleared']);
        break;
      case 'ls': {
        const allFiles = flattenFiles(files);
        setTerminalOutput(prev => [...prev, ...allFiles.map(f => `  ${f.path}`)]);
        break;
      }
      case 'cat': {
        const filePath = parts[1];
        const content = getFileContent(filePath);
        if (content) setTerminalOutput(prev => [...prev, content]);
        else setTerminalOutput(prev => [...prev, `cat: ${filePath}: No such file`]);
        break;
      }
      case 'echo':
        setTerminalOutput(prev => [...prev, parts.slice(1).join(' ')]);
        break;
      case 'date':
        setTerminalOutput(prev => [...prev, new Date().toString()]);
        break;
      case 'whoami':
        setTerminalOutput(prev => [...prev, user.email || 'developer']);
        break;
      case 'pwd':
        setTerminalOutput(prev => [...prev, `/${workspace.name}`]);
        break;
      case 'help':
        setTerminalOutput(prev => [...prev,
          'Available commands:',
          '  clear    - Clear terminal',
          '  ls       - List files',
          '  cat      - View file content',
          '  echo     - Print text',
          '  date     - Show date',
          '  whoami   - Show user',
          '  pwd      - Print working directory',
          '  run      - Run active file',
          '  help     - Show this help'
        ]);
        break;
      case 'run':
        handleRun();
        break;
      default:
        setTerminalOutput(prev => [...prev, `command not found: ${command}. Type 'help' for available commands.`]);
    }
  }, [files, getFileContent, handleRun, user.email, workspace.name]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (!query.trim()) { setSearchResults([]); return; }
    const results: { file: string; line: number; text: string }[] = [];
    flattenFiles(files).forEach(f => {
      (f.content || '').split('\n').forEach((line, i) => {
        if (line.toLowerCase().includes(query.toLowerCase())) {
          results.push({ file: f.path, line: i + 1, text: line.trim() });
        }
      });
    });
    setSearchResults(results);
  }, [files]);

  const createFile = useCallback((parentPath: string, name: string) => {
    if (!name.trim()) return;
    const ext = name.split('.').pop() || '';
    const langMap: Record<string, string> = { ts: 'typescript', tsx: 'typescript', js: 'javascript', css: 'css', json: 'json', md: 'markdown' };
    const fullPath = parentPath ? `${parentPath}/${name}` : name;
    const newFile: FileNode = { name, path: fullPath, type: 'file', content: `// ${name}\n`, language: langMap[ext] || 'text' };

    const addToTree = (nodes: FileNode[]): FileNode[] =>
      nodes.map(n => {
        if (n.path === parentPath && n.type === 'folder') {
          return { ...n, children: [...(n.children || []), newFile] };
        }
        if (n.children) return { ...n, children: addToTree(n.children) };
        return n;
      });

    if (parentPath) setFiles(prev => addToTree(prev));
    else setFiles(prev => [...prev, newFile]);
    setShowNewFile(false);
    setNewFileName('');
    openFile(fullPath);
    toast.success(`Created ${name}`);
  }, [openFile]);

  const deleteFile = useCallback((path: string) => {
    const removeFromTree = (nodes: FileNode[]): FileNode[] =>
      nodes.filter(n => n.path !== path).map(n =>
        n.children ? { ...n, children: removeFromTree(n.children) } : n
      );
    setFiles(prev => removeFromTree(prev));
    closeTab(path);
    toast.success(`Deleted ${path.split('/').pop()}`);
  }, [closeTab]);

  const downloadFile = useCallback(() => {
    const content = getFileContent(activeFile);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.split('/').pop() || 'file.txt';
    a.click();
    URL.revokeObjectURL(url);
  }, [activeFile, getFileContent]);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(getFileContent(activeFile));
    toast.success('Copied to clipboard');
  }, [activeFile, getFileContent]);

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      next.has(path) ? next.delete(path) : next.add(path);
      return next;
    });
  };

  const renderFileTree = (nodes: FileNode[], depth = 0): React.ReactNode => {
    return nodes.map(node => (
      <div key={node.path}>
        {node.type === 'folder' ? (
          <>
            <button
              onClick={() => toggleFolder(node.path)}
              className={`w-full flex items-center gap-1.5 py-1 px-2 text-left text-xs rounded hover:bg-[#2a2d2e] transition-colors group`}
              style={{ paddingLeft: `${depth * 12 + 8}px` }}
            >
              {expandedFolders.has(node.path) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              <Folder size={13} className="text-blue-400 shrink-0" />
              <span className="truncate flex-1">{node.name}</span>
              <button onClick={(e) => { e.stopPropagation(); setShowNewFile(node.path); }} className="opacity-0 group-hover:opacity-100">
                <FilePlus size={12} className="text-gray-400 hover:text-white" />
              </button>
            </button>
            {expandedFolders.has(node.path) && node.children && renderFileTree(node.children, depth + 1)}
            {showNewFile === node.path && (
              <div className="flex items-center gap-1 px-2 py-1" style={{ paddingLeft: `${(depth + 1) * 12 + 8}px` }}>
                <Input
                  value={newFileName}
                  onChange={e => setNewFileName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') createFile(node.path, newFileName); if (e.key === 'Escape') setShowNewFile(false); }}
                  className="h-5 text-xs bg-[#3c3c3c] border-blue-500 text-white px-1"
                  placeholder="filename.ts"
                  autoFocus
                />
              </div>
            )}
          </>
        ) : (
          <button
            onClick={() => openFile(node.path)}
            className={`w-full flex items-center gap-1.5 py-1 px-2 text-left text-xs rounded hover:bg-[#2a2d2e] transition-colors group ${activeFile === node.path ? 'bg-[#37373d] text-white' : 'text-gray-300'}`}
            style={{ paddingLeft: `${depth * 12 + 20}px` }}
          >
            <FileText size={13} className={`shrink-0 ${node.language === 'typescript' ? 'text-blue-400' : node.language === 'css' ? 'text-purple-400' : node.language === 'json' ? 'text-yellow-400' : 'text-gray-400'}`} />
            <span className="truncate flex-1">{node.name}</span>
            {unsavedFiles.has(node.path) && <div className="w-2 h-2 rounded-full bg-white shrink-0" />}
            <button onClick={(e) => { e.stopPropagation(); deleteFile(node.path); }} className="opacity-0 group-hover:opacity-100">
              <Trash2 size={11} className="text-gray-500 hover:text-red-400" />
            </button>
          </button>
        )}
      </div>
    ));
  };

  const currentContent = activeFile ? getFileContent(activeFile) : '';
  const currentLanguage = activeFile ? getFileLanguage(activeFile) : 'text';
  const lineCount = currentContent.split('\n').length;

  return (
    <div className={`flex flex-col bg-[#1e1e1e] ${isFullscreen ? 'fixed inset-0 z-50' : 'h-full'}`}>
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-2 py-1 bg-[#323233] text-white text-xs border-b border-[#252526]">
        <div className="flex items-center gap-1">
          <Code className="text-blue-400" size={14} />
          <span className="font-medium text-xs mr-2">TeamSync Editor</span>
          <Button size="sm" variant="ghost" onClick={handleSave} className="h-6 px-2 text-xs text-gray-300 hover:bg-[#505050] hover:text-white">
            <Save size={12} className="mr-1" />Save
          </Button>
          <Button size="sm" variant="ghost" onClick={handleSaveAll} className="h-6 px-2 text-xs text-gray-300 hover:bg-[#505050] hover:text-white">
            <Save size={12} className="mr-1" />Save All
          </Button>
          <Button size="sm" variant="ghost" onClick={handleUndo} className="h-6 px-2 text-xs text-gray-300 hover:bg-[#505050] hover:text-white">
            <Undo size={12} />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleRedo} className="h-6 px-2 text-xs text-gray-300 hover:bg-[#505050] hover:text-white">
            <Redo size={12} />
          </Button>
          <div className="w-px h-4 bg-[#505050] mx-1" />
          <Button size="sm" variant="ghost" onClick={handleRun} className="h-6 px-2 text-xs text-green-400 hover:bg-[#505050] hover:text-green-300">
            <Play size={12} className="mr-1" />Run
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowTerminal(t => !t)} className="h-6 px-2 text-xs text-gray-300 hover:bg-[#505050] hover:text-white">
            <TerminalIcon size={12} className="mr-1" />Terminal
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowSearch(s => !s)} className="h-6 px-2 text-xs text-gray-300 hover:bg-[#505050] hover:text-white">
            <Search size={12} className="mr-1" />Find
          </Button>
          <div className="w-px h-4 bg-[#505050] mx-1" />
          <Button size="sm" variant="ghost" onClick={copyToClipboard} className="h-6 px-2 text-xs text-gray-300 hover:bg-[#505050] hover:text-white">
            <Copy size={12} />
          </Button>
          <Button size="sm" variant="ghost" onClick={downloadFile} className="h-6 px-2 text-xs text-gray-300 hover:bg-[#505050] hover:text-white">
            <Download size={12} />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setIsVideoCall(!isVideoCall)} variant="ghost" className={`h-6 px-2 ${isVideoCall ? 'text-green-400 bg-green-900/30' : 'text-gray-300 hover:bg-[#505050]'}`}>
            {isVideoCall ? <Video size={12} /> : <VideoOff size={12} />}
          </Button>
          <Button size="sm" onClick={() => setIsMuted(!isMuted)} variant="ghost" className={`h-6 px-2 ${isMuted ? 'text-red-400 bg-red-900/30' : 'text-gray-300 hover:bg-[#505050]'}`}>
            {isMuted ? <MicOff size={12} /> : <Mic size={12} />}
          </Button>
          <Button size="sm" onClick={() => setIsScreenSharing(!isScreenSharing)} variant="ghost" className={`h-6 px-2 ${isScreenSharing ? 'text-blue-400 bg-blue-900/30' : 'text-gray-300 hover:bg-[#505050]'}`}>
            <Share size={12} />
          </Button>
          <div className="flex items-center gap-0.5 ml-1">
            {activeUsers.map(u => (
              <div key={u.user_id} className="relative group">
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-[9px] font-bold">{u.avatar}</div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#252526] text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-[#454545]">{u.display_name}</div>
              </div>
            ))}
          </div>
          <Button size="sm" variant="ghost" onClick={() => setIsFullscreen(f => !f)} className="h-6 px-1 text-gray-300 hover:bg-[#505050]">
            {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </Button>
        </div>
      </div>

      {/* Search bar */}
      {showSearch && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#252526] border-b border-[#3c3c3c]">
          <Search size={13} className="text-gray-400" />
          <Input
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            className="h-6 text-xs bg-[#3c3c3c] border-[#505050] text-white flex-1"
            placeholder="Search across files..."
            autoFocus
          />
          <span className="text-[10px] text-gray-500">{searchResults.length} results</span>
          <button onClick={() => setShowSearch(false)}><X size={12} className="text-gray-400" /></button>
        </div>
      )}
      {showSearch && searchResults.length > 0 && (
        <div className="max-h-32 overflow-y-auto bg-[#252526] border-b border-[#3c3c3c]">
          {searchResults.slice(0, 20).map((r, i) => (
            <button key={i} onClick={() => { openFile(r.file); setShowSearch(false); }}
              className="w-full flex items-center gap-2 px-4 py-1 text-xs hover:bg-[#2a2d2e] text-left">
              <span className="text-blue-400 shrink-0">{r.file}</span>
              <span className="text-gray-500">:{r.line}</span>
              <span className="text-gray-300 truncate">{r.text}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* File Explorer */}
        <div className="w-52 bg-[#252526] text-white flex flex-col border-r border-[#1e1e1e] shrink-0">
          <div className="flex items-center justify-between px-3 py-2 text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
            <span>Explorer</span>
            <div className="flex gap-1">
              <button onClick={() => setShowNewFile('')} className="hover:text-white"><FilePlus size={12} /></button>
            </div>
          </div>
          {showNewFile === '' && (
            <div className="flex items-center gap-1 px-2 py-1">
              <Input
                value={newFileName}
                onChange={e => setNewFileName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') createFile('', newFileName); if (e.key === 'Escape') setShowNewFile(false); }}
                className="h-5 text-xs bg-[#3c3c3c] border-blue-500 text-white px-1"
                placeholder="filename.ts"
                autoFocus
              />
            </div>
          )}
          <div className="flex-1 overflow-y-auto py-1">
            {renderFileTree(files)}
          </div>
        </div>

        {/* Editor area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Tabs */}
          <div className="flex items-center bg-[#252526] overflow-x-auto shrink-0">
            {openTabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveFile(tab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs border-r border-[#1e1e1e] shrink-0 ${activeFile === tab ? 'bg-[#1e1e1e] text-white border-t-2 border-t-blue-500' : 'bg-[#2d2d2d] text-gray-400 hover:bg-[#2a2d2e] border-t-2 border-t-transparent'}`}
              >
                <FileText size={12} className={getFileLanguage(tab) === 'typescript' ? 'text-blue-400' : 'text-gray-400'} />
                <span>{tab.split('/').pop()}</span>
                {unsavedFiles.has(tab) && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                <button onClick={(e) => closeTab(tab, e)} className="ml-1 hover:bg-[#505050] rounded p-0.5"><X size={10} /></button>
              </button>
            ))}
          </div>

          {activeFile ? (
            <>
              {/* Code area */}
              <div className="flex-1 relative overflow-hidden">
                <div className="absolute inset-0 flex">
                  {/* Line numbers */}
                  <div className="w-12 bg-[#1e1e1e] text-gray-500 text-xs font-mono select-none overflow-hidden shrink-0 border-r border-[#303030]">
                    {Array.from({ length: lineCount }, (_, i) => (
                      <div key={i} className={`h-[22px] flex items-center justify-end pr-3 ${cursorPosition.line === i + 1 ? 'text-gray-300' : ''}`}>
                        {i + 1}
                      </div>
                    ))}
                  </div>
                  {/* Highlighted code layer (visual only) */}
                  <div className="flex-1 relative">
                    <div className="absolute inset-0 font-mono text-xs p-3 pl-4 overflow-auto pointer-events-none" style={{ lineHeight: '22px' }}>
                      {highlightCode(currentContent, currentLanguage)}
                    </div>
                    {/* Textarea (invisible text, captures input) */}
                    <textarea
                      ref={textAreaRef}
                      value={currentContent}
                      onChange={handleCodeChange}
                      onKeyDown={handleKeyDown}
                      onClick={(e) => {
                        const ta = e.currentTarget;
                        const pos = ta.selectionStart;
                        const lines = ta.value.substring(0, pos).split('\n');
                        setCursorPosition({ line: lines.length, col: lines[lines.length - 1].length + 1 });
                      }}
                      className="absolute inset-0 w-full h-full font-mono text-xs p-3 pl-4 bg-transparent text-transparent caret-white resize-none border-none outline-none"
                      style={{ lineHeight: '22px', caretColor: '#fff' }}
                      spellCheck={false}
                    />
                  </div>
                </div>
              </div>

              {/* Terminal */}
              {showTerminal && (
                <div className="h-48 bg-[#1e1e1e] border-t border-[#3c3c3c] flex flex-col shrink-0">
                  <div className="flex items-center justify-between px-3 py-1 bg-[#252526] text-xs">
                    <div className="flex items-center gap-2">
                      <TerminalIcon size={12} className="text-gray-400" />
                      <span className="text-gray-300">Terminal</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setTerminalOutput(['$ Terminal cleared'])} className="text-gray-400 hover:text-white"><Trash2 size={11} /></button>
                      <button onClick={() => setShowTerminal(false)} className="text-gray-400 hover:text-white"><X size={12} /></button>
                    </div>
                  </div>
                  <div ref={terminalRef} className="flex-1 overflow-y-auto font-mono text-xs p-2 text-green-400">
                    {terminalOutput.map((line, i) => (
                      <div key={i} className={`leading-5 whitespace-pre-wrap ${line.startsWith('❌') || line.startsWith('⛔') ? 'text-red-400' : line.startsWith('⚠️') ? 'text-yellow-400' : line.startsWith('✅') || line.startsWith('🎉') ? 'text-green-400' : line.startsWith('$') ? 'text-blue-300' : 'text-gray-300'}`}>
                        {line}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 border-t border-[#3c3c3c]">
                    <span className="text-green-400 text-xs font-mono">$</span>
                    <input
                      value={terminalInput}
                      onChange={e => setTerminalInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && terminalInput.trim()) { handleTerminalCommand(terminalInput.trim()); setTerminalInput(''); } }}
                      className="flex-1 bg-transparent text-white text-xs font-mono outline-none"
                      placeholder="Type a command..."
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-[#1e1e1e] text-gray-500">
              <div className="text-center">
                <Code size={48} className="mx-auto mb-4 text-gray-600" />
                <p className="text-sm">Open a file to start editing</p>
                <p className="text-xs mt-1 text-gray-600">Select a file from the explorer</p>
              </div>
            </div>
          )}

          {/* Status Bar */}
          <div className="flex items-center justify-between px-3 py-0.5 bg-[#007acc] text-white text-[10px] shrink-0">
            <div className="flex items-center gap-3">
              {activeFile && (
                <>
                  <span>Ln {cursorPosition.line}, Col {cursorPosition.col}</span>
                  <span>Spaces: 2</span>
                  <span>UTF-8</span>
                  <span className="capitalize">{currentLanguage}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-3">
              {unsavedFiles.size > 0 && (
                <span className="flex items-center gap-1"><AlertCircle size={10} />{unsavedFiles.size} unsaved</span>
              )}
              <span className="flex items-center gap-1"><CheckCircle2 size={10} />{activeUsers.length} online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
