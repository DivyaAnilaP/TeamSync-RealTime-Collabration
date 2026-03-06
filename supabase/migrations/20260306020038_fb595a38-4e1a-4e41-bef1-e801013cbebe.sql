-- Allow workspace owners to also view their workspaces (needed during creation before member row exists)
DROP POLICY IF EXISTS "Members can view their workspaces" ON public.workspaces;
CREATE POLICY "Members or owners can view workspaces" ON public.workspaces FOR SELECT TO authenticated USING (auth.uid() = owner_id OR is_workspace_member(auth.uid(), id));

-- Also allow workspace lookup by invite_code for joining
CREATE POLICY "Anyone can find workspace by invite code" ON public.workspaces FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Members or owners can view workspaces" ON public.workspaces;
