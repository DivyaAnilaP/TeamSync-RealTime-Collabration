
-- Sprints table
CREATE TABLE public.sprints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'planning',
  goals TEXT[] DEFAULT '{}',
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shared files table
CREATE TABLE public.shared_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'document',
  size_bytes BIGINT NOT NULL DEFAULT 0,
  storage_path TEXT,
  uploaded_by UUID NOT NULL,
  download_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User points table (track gamification per user per workspace)
CREATE TABLE public.user_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, workspace_id)
);

-- Add sprint_id to tasks (optional link)
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS sprint_id UUID REFERENCES public.sprints(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;

-- Sprints RLS
CREATE POLICY "Workspace members can view sprints" ON public.sprints FOR SELECT TO authenticated USING (is_workspace_member(auth.uid(), workspace_id));
CREATE POLICY "Workspace members can create sprints" ON public.sprints FOR INSERT TO authenticated WITH CHECK (is_workspace_member(auth.uid(), workspace_id) AND auth.uid() = created_by);
CREATE POLICY "Workspace members can update sprints" ON public.sprints FOR UPDATE TO authenticated USING (is_workspace_member(auth.uid(), workspace_id));
CREATE POLICY "Sprint creators can delete" ON public.sprints FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- Shared files RLS
CREATE POLICY "Workspace members can view files" ON public.shared_files FOR SELECT TO authenticated USING (is_workspace_member(auth.uid(), workspace_id));
CREATE POLICY "Workspace members can upload files" ON public.shared_files FOR INSERT TO authenticated WITH CHECK (is_workspace_member(auth.uid(), workspace_id) AND auth.uid() = uploaded_by);
CREATE POLICY "File uploaders can delete" ON public.shared_files FOR DELETE TO authenticated USING (auth.uid() = uploaded_by);
CREATE POLICY "Workspace members can update files" ON public.shared_files FOR UPDATE TO authenticated USING (is_workspace_member(auth.uid(), workspace_id));

-- User points RLS
CREATE POLICY "Workspace members can view points" ON public.user_points FOR SELECT TO authenticated USING (is_workspace_member(auth.uid(), workspace_id));
CREATE POLICY "Users can upsert own points" ON public.user_points FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND is_workspace_member(auth.uid(), workspace_id));
CREATE POLICY "Users can update own points" ON public.user_points FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Create storage bucket for shared files
INSERT INTO storage.buckets (id, name, public) VALUES ('shared-files', 'shared-files', false) ON CONFLICT DO NOTHING;

-- Storage policies
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'shared-files');
CREATE POLICY "Authenticated users can read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'shared-files');
CREATE POLICY "Users can delete own files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'shared-files' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Triggers for updated_at
CREATE TRIGGER update_sprints_updated_at BEFORE UPDATE ON public.sprints FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
