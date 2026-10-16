import { authPost } from "@/lib/auth";

export async function askLearnHubAi(messages) {
  return authPost("/api/ai/chat", { messages });
}
