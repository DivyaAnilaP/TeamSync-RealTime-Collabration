-- Drop all RESTRICTIVE policies and recreate as PERMISSIVE

-- workspaces
DROP POLICY IF EXISTS "Authenticated users can create workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Members can view their workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Owners can delete their workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Owners can update their workspaces" ON public.workspaces;

CREATE POLICY "Authenticated users can create workspaces" ON public.workspaces FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Members can view their workspaces" ON public.workspaces FOR SELECT TO authenticated USING (is_workspace_member(auth.uid(), id));
CREATE POLICY "Owners can delete their workspaces" ON public.workspaces FOR DELETE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Owners can update their workspaces" ON public.workspaces FOR UPDATE TO authenticated USING (auth.uid() = owner_id);

-- workspace_members
DROP POLICY IF EXISTS "Members can insert themselves" ON public.workspace_members;
DROP POLICY IF EXISTS "Members can leave workspaces" ON public.workspace_members;
DROP POLICY IF EXISTS "Members can view workspace members" ON public.workspace_members;

CREATE POLICY "Members can insert themselves" ON public.workspace_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Members can leave workspaces" ON public.workspace_members FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Members can view workspace members" ON public.workspace_members FOR SELECT TO authenticated USING (is_workspace_member(auth.uid(), workspace_id));

-- tasks
DROP POLICY IF EXISTS "Task creators can delete tasks" ON public.tasks;
DROP POLICY IF EXISTS "Workspace members can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Workspace members can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Workspace members can view tasks" ON public.tasks;

CREATE POLICY "Task creators can delete tasks" ON public.tasks FOR DELETE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "Workspace members can create tasks" ON public.tasks FOR INSERT TO authenticated WITH CHECK (is_workspace_member(auth.uid(), workspace_id) AND auth.uid() = created_by);
CREATE POLICY "Workspace members can update tasks" ON public.tasks FOR UPDATE TO authenticated USING (is_workspace_member(auth.uid(), workspace_id));
CREATE POLICY "Workspace members can view tasks" ON public.tasks FOR SELECT TO authenticated USING (is_workspace_member(auth.uid(), workspace_id));

-- meetings
DROP POLICY IF EXISTS "Meeting creators can delete meetings" ON public.meetings;
DROP POLICY IF EXISTS "Workspace members can create meetings" ON public.meetings;
DROP POLICY IF EXISTS "Workspace members can update meetings" ON public.meetings;
DROP POLICY IF EXISTS "Workspace members can view meetings" ON public.meetings;

CREATE POLICY "Meeting creators can delete meetings" ON public.meetings FOR DELETE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "Workspace members can create meetings" ON public.meetings FOR INSERT TO authenticated WITH CHECK (is_workspace_member(auth.uid(), workspace_id) AND auth.uid() = created_by);
CREATE POLICY "Workspace members can update meetings" ON public.meetings FOR UPDATE TO authenticated USING (is_workspace_member(auth.uid(), workspace_id));
CREATE POLICY "Workspace members can view meetings" ON public.meetings FOR SELECT TO authenticated USING (is_workspace_member(auth.uid(), workspace_id));

-- chat_messages
DROP POLICY IF EXISTS "Workspace members can send messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Workspace members can view messages" ON public.chat_messages;

CREATE POLICY "Workspace members can send messages" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (is_workspace_member(auth.uid(), workspace_id) AND auth.uid() = sender_id);
CREATE POLICY "Workspace members can view messages" ON public.chat_messages FOR SELECT TO authenticated USING (is_workspace_member(auth.uid(), workspace_id));

-- mood_checks
DROP POLICY IF EXISTS "Users can create own mood checks" ON public.mood_checks;
DROP POLICY IF EXISTS "Users can view own mood checks" ON public.mood_checks;

CREATE POLICY "Users can create own mood checks" ON public.mood_checks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own mood checks" ON public.mood_checks FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- profiles
DROP POLICY IF EXISTS "Profiles viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Profiles viewable by authenticated users" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
