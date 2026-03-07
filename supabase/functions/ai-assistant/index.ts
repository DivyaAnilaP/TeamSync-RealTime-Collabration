import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { type, context } = await req.json();
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case "daily-wrap":
        systemPrompt = "You are a work analytics AI. Generate a concise daily work summary based on the provided task and meeting data. Return JSON with: tasksCompleted (number), highlights (string[]), challenges (string[]), recommendations (string[]), productivity ('high'|'medium'|'low').";
        userPrompt = `Analyze this workspace data for ${context.date}:\nTasks completed: ${context.tasksCompleted}\nTasks in progress: ${context.tasksInProgress}\nMeetings today: ${context.meetingsCount}\nTotal tasks: ${context.totalTasks}\nWorkspace: ${context.workspaceName}`;
        break;

      case "task-suggestions":
        systemPrompt = "You are a productivity AI. Based on the user's current tasks and workload, suggest 3-4 new tasks they should consider. Return JSON array with objects: {title, description, priority ('high'|'medium'|'low'), estimatedTime, reason, category ('optimization'|'follow-up'|'proactive'|'collaboration')}.";
        userPrompt = `Current tasks:\n${context.tasks?.map((t: any) => `- ${t.title} (${t.status})`).join('\n') || 'No tasks yet'}\nWorkspace: ${context.workspaceName}`;
        break;

      case "meeting-summary":
        systemPrompt = "You are a meeting analysis AI. Generate a meeting summary. Return JSON with: summary (string), keyPoints (string[]), actionItems (string[]), sentiment ('positive'|'neutral'|'negative').";
        userPrompt = `Meeting: ${context.title}\nParticipants: ${context.participants?.join(', ') || 'Unknown'}\nDuration: ${context.duration} minutes\nNotes: ${context.notes || 'No notes available'}\nDate: ${context.date}`;
        break;

      default:
        throw new Error("Unknown AI request type");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    let parsed;
    try { parsed = JSON.parse(content); } catch { parsed = { raw: content }; }

    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("AI Assistant error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
