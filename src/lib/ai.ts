import { supabase } from "@/integrations/supabase/client";

export type AiMessage = {
  role: "user" | "assistant";
  content: string;
  created_at?: string;
};

export type AskAIResponse = {
  answer: string;
  conversationId: string;
  messages: AiMessage[];
  usage?: { total_tokens?: number; model?: string };
};

export async function askAI(message: string, conversationId?: string): Promise<AskAIResponse> {
  const clean = message.trim();
  if (!clean) throw new Error("Escreve uma mensagem antes de enviar.");
  if (clean.length > 2000) throw new Error("A mensagem deve ter menos de 2000 caracteres.");

  const { data, error } = await supabase.functions.invoke("ai-assistant", {
    body: { message: clean, conversationId },
  });

  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data as AskAIResponse;
}
