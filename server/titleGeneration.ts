import { invokeLLM } from "./_core/llm";

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Generate a concise, meaningful title for a conversation using AI.
 * 
 * The title should be:
 * - 3-6 words maximum
 * - No filler words or full sentences
 * - Capture the primary intent/outcome
 * - Clear, meaningful, and searchable
 * - Differentiate similar conversations
 * 
 * @param messages - Array of conversation messages
 * @returns Generated title string
 */
export async function generateConversationTitle(messages: ConversationMessage[]): Promise<string> {
  // If no messages or very short conversation, return a default
  if (!messages || messages.length === 0) {
    return "New Conversation";
  }

  // Build conversation context (limit to first 10 messages to avoid token limits)
  const contextMessages = messages.slice(0, 10);
  const conversationText = contextMessages
    .map(m => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n\n');

  const systemPrompt = `You are a title generator for conversation histories. Your task is to create short, descriptive titles that capture the essence of conversations.

RULES:
1. Title MUST be 3-6 words only
2. NO filler words (like "Discussion about", "Conversation on", "Help with")
3. NO full sentences or punctuation at the end
4. Capture the PRIMARY intent or outcome
5. Make it SEARCHABLE - use specific keywords
6. Differentiate from similar topics

EXAMPLES:
- Good: "Calendar Interaction Bugs"
- Good: "Stripe Payment Flow"
- Good: "AI Policy Compliance Check"
- Good: "GDPR Data Retention Rules"
- Good: "Model Training Guidelines"
- Bad: "Discussion about calendar issues" (too long, has filler)
- Bad: "Help" (too vague)
- Bad: "A conversation about AI policies and regulations" (too long, sentence format)

Output ONLY the title, nothing else.`;

  const userPrompt = `Generate a title for this conversation:

${conversationText}`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 50, // Short output expected
    });

    const generatedTitle = response.choices[0]?.message?.content;
    
    if (typeof generatedTitle === 'string' && generatedTitle.trim()) {
      // Clean up the title - remove quotes, extra whitespace, trailing punctuation
      let cleanTitle = generatedTitle
        .trim()
        .replace(/^["']|["']$/g, '') // Remove surrounding quotes
        .replace(/[.!?]$/, '') // Remove trailing punctuation
        .trim();
      
      // Ensure title isn't too long (max 60 chars as safety)
      if (cleanTitle.length > 60) {
        cleanTitle = cleanTitle.substring(0, 57) + '...';
      }
      
      return cleanTitle || "New Conversation";
    }

    return "New Conversation";
  } catch (error) {
    console.error('[TitleGeneration] Error generating title:', error);
    // Fallback to first message truncation
    const firstUserMessage = messages.find(m => m.role === 'user');
    if (firstUserMessage) {
      const fallback = firstUserMessage.content.slice(0, 50);
      return fallback + (firstUserMessage.content.length > 50 ? '...' : '');
    }
    return "New Conversation";
  }
}

/**
 * Check if a conversation has enough context to generate a meaningful title.
 * We want at least one user message and one assistant response.
 */
export function hasEnoughContextForTitle(messages: ConversationMessage[]): boolean {
  if (!messages || messages.length < 2) return false;
  
  const hasUserMessage = messages.some(m => m.role === 'user');
  const hasAssistantMessage = messages.some(m => m.role === 'assistant');
  
  return hasUserMessage && hasAssistantMessage;
}
