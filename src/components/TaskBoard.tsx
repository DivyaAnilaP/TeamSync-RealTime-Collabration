import React, { useState, useEffect } from 'react';
import { Plus, Calendar, User, CheckCircle, Clock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Task { id: string; title: string; description: string; assignee: string; assignee_email: string; due_date: string; due_time: string; status: 'todo' | 'inprogress' | 'done'; points: number; workspace_id: string; created_by: string; }
interface TaskBoardProps { onPointsEarned: (points: number) => void; user: any; workspace: any; }

export const TaskBoard: React.FC<TaskBoardProps> = ({ onPointsEarned, user, workspace }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({ title: '', description: '', assignee: '', assignee_email: '', due_date: '', due_time: '', points: 25 });

  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-red-100 border-red-200' },
    { id: 'inprogress', title: 'In Progress', color: 'bg-yellow-100 border-yellow-200' },
    { id: 'done', title: 'Done', color: 'bg-green-100 border-green-200' }
  ];

  useEffect(() => { fetchTasks(); }, [workspace]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase.from('tasks').select('*').eq('workspace_id', workspace.name).order('created_at', { ascending: false });
      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({ title: "Error", description: "Failed to load tasks", variant: "destructive" });
    } finally { setLoading(false); }
  };

  const sendTaskEmail = async (task: Task) => {
    try {
      const { error } = await supabase.functions.invoke('send-email', { body: { to: task.assignee_email, subject: `New Task Assigned: ${task.title}`, html: `<h2>You have been assigned a new task!</h2><h3>${task.title}</h3><p><strong>Description:</strong> ${task.description}</p><p><strong>Due Date:</strong> ${task.due_date} at ${task.due_time}</p><p><strong>Points:</strong> ${task.points}</p><p><strong>Workspace:</strong> ${workspace.name}</p><br><p>Best regards,<br>TeamFlow Team</p>` } });
      if (error) throw error;
      toast({ title: "Email Sent! 📧", description: `Task notification sent to ${task.assignee_email}` });
    } catch (error) { console.error('Error sending email:', error); toast({ title: "Email Error", description: "Failed to send task notification email", variant: "destructive" }); }
  };

  const moveTask = async (taskId: string, newStatus: 'todo' | 'inprogress' | 'done') => {
    try {
      const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
      if (error) throw error;
      setTasks(prev => prev.map(task => {
        if (task.id === taskId) {
          const updatedTask = { ...task, status: newStatus };
          if (newStatus === 'done' && task.status !== 'done') { onPointsEarned(task.points); toast({ title: "Task Completed! 🎉", description: `You earned ${task.points} points for completing "${task.title}"` }); }
          return updatedTask;
        }
        return task;
      }));
    } catch (error) { console.error('Error updating task:', error); toast({ title: "Error", description: "Failed to update task status", variant: "destructive" }); }
  };

  const addTask = async () => {
    if (!newTask.title.trim()) { toast({ title: "Error", description: "Task title is required", variant: "destructive" }); return; }
    try {
      const { data, error } = await supabase.from('tasks').insert({ title: newTask.title, description: newTask.description, assignee: newTask.assignee, assignee_email: newTask.assignee_email, due_date: newTask.due_date, due_time: newTask.due_time, points: newTask.points, workspace_id: workspace.name, created_by: user.name, status: 'todo' }).select().single();
      if (error) throw error;
      setTasks(prev => [data, ...prev]);
      if (newTask.assignee_email && data) await sendTaskEmail(data);
      setNewTask({ title: '', description: '', assignee: '', assignee_email: '', due_date: '', due_time: '', points: 25 });
      setShowNewTaskForm(false);
      toast({ title: "Task Created!", description: "New task has been added to the board" });
    } catch (error) { console.error('Error creating task:', error); toast({ title: "Error", description: "Failed to create task", variant: "destructive" }); }
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading tasks...</div>;

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Task Board</h2>
        <Button onClick={() => setShowNewTaskForm(true)} className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"><Plus size={20} className="mr-2" />Add Task</Button>
      </div>
      {showNewTaskForm && (
        <Card className="mb-6 border-purple-200">
          <CardHeader><CardTitle>Create New Task</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <input type="text" placeholder="Task title *" value={newTask.title} onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))} className="w-full p-2 border border-gray-300 rounded-md" />
            <textarea placeholder="Task description" value={newTask.description} onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))} className="w-full p-2 border border-gray-300 rounded-md h-20" />
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Assignee name" value={newTask.assignee} onChange={(e) => setNewTask(prev => ({ ...prev, assignee: e.target.value }))} className="p-2 border border-gray-300 rounded-md" />
              <input type="email" placeholder="Assignee email (for notifications)" value={newTask.assignee_email} onChange={(e) => setNewTask(prev => ({ ...prev, assignee_email: e.target.value }))} className="p-2 border border-gray-300 rounded-md" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input type="date" value={newTask.due_date} onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))} className="p-2 border border-gray-300 rounded-md" />
              <input type="time" value={newTask.due_time} onChange={(e) => setNewTask(prev => ({ ...prev, due_time: e.target.value }))} className="p-2 border border-gray-300 rounded-md" />
            </div>
            <div><label className="block text-sm font-medium mb-1">Points: {newTask.points}</label><input type="range" min="5" max="100" step="5" value={newTask.points} onChange={(e) => setNewTask(prev => ({ ...prev, points: Number(e.target.value) }))} className="w-full" /></div>
            <div className="flex gap-2"><Button onClick={addTask}>Create Task</Button><Button variant="outline" onClick={() => setShowNewTaskForm(false)}>Cancel</Button></div>
          </CardContent>
        </Card>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
        {columns.map(column => (
          <div key={column.id} className="space-y-4">
            <div className={`rounded-lg p-4 ${column.color}`}><h3 className="font-semibold text-gray-800">{column.title}</h3><span className="text-sm text-gray-600">{tasks.filter(task => task.status === column.id).length} tasks</span></div>
            <div className="space-y-3">
              {tasks.filter(task => task.status === column.id).map(task => (
                <Card key={task.id} className="border-l-4 border-l-purple-400 hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">{task.title}</h4>
                    <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-500"><User size={14} />{task.assignee}</div>
                      {task.assignee_email && <div className="flex items-center gap-2 text-sm text-gray-500"><Mail size={14} />{task.assignee_email}</div>}
                      <div className="flex items-center gap-2 text-sm text-gray-500"><Calendar size={14} />{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}</div>
                      {task.due_time && <div className="flex items-center gap-2 text-sm text-gray-500"><Clock size={14} />{task.due_time}</div>}
                      <Badge variant="secondary">{task.points} points</Badge>
                    </div>
                    <div className="flex gap-2 mt-4">
                      {task.status !== 'todo' && <button onClick={() => moveTask(task.id, 'todo')} className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200">To Do</button>}
                      {task.status !== 'inprogress' && <button onClick={() => moveTask(task.id, 'inprogress')} className="text-xs px-2 py-1 bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200">In Progress</button>}
                      {task.status !== 'done' && <button onClick={() => moveTask(task.id, 'done')} className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded flex items-center gap-1 hover:bg-green-200"><CheckCircle size={12} />Done</button>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
