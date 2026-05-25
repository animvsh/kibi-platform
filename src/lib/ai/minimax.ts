/**
 * MiniMax API Integration
 * Handles chat completions with streaming support and retry logic
 */

const MINIMAX_API_URL = "https://api.minimax.chat/v1/text/chatcompletion_pro";
const MINIMAX_GROUP_ID = process.env.MINIMAX_GROUP_ID || "";

export interface MiniMaxMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionOptions {
  model?: string;
  messages: MiniMaxMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  signal?: AbortSignal;
}

export interface ChatCompletionChunk {
  choices: Array<{
    delta: {
      content: string;
    };
    finish_reason?: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface MiniMaxStreamResponse {
  choices: Array<{
    delta: {
      content: string;
    };
    finish_reason?: string;
    messages?: Array<{
      text?: string;
      content?: string;
    }>;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class MiniMaxError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public isRateLimit = false
  ) {
    super(message);
    this.name = "MiniMaxError";
  }
}

/**
 * Parse SSE stream data from MiniMax API
 */
function parseSSEStream(data: string): MiniMaxStreamResponse | null {
  // Skipping the "data: " prefix and empty lines
  if (!data || data === "[DONE]") {
    return null;
  }

  const jsonStr = data.replace(/^data: /, "").trim();
  if (!jsonStr || jsonStr === "[DONE]") {
    return null;
  }

  try {
    return JSON.parse(jsonStr) as MiniMaxStreamResponse;
  } catch {
    return null;
  }
}

/**
 * Create retry delay with exponential backoff
 */
function getRetryDelay(attempt: number): number {
  return Math.min(1000 * Math.pow(2, attempt), 30000);
}

/**
 * Chat completion without streaming
 */
export async function chatCompletion(
  options: ChatCompletionOptions
): Promise<string> {
  const {
    model = "MiniMax-Text-01",
    messages,
    temperature = 0.7,
    max_tokens = 4096,
  } = options;

  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) {
    throw new MiniMaxError("MINIMAX_API_KEY is not configured");
  }

  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(MINIMAX_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens,
          stream: false,
          role_setting: {
            role: "assistant",
            role_name: "Kibi AI Tutor",
            content: messages.find((m) => m.role === "system")?.content || "",
          },
        }),
        signal: options.signal,
      });

      if (response.status === 429) {
        lastError = new MiniMaxError(
          "Rate limit exceeded",
          response.status,
          true
        );
        if (attempt < maxRetries - 1) {
          await sleep(getRetryDelay(attempt));
          continue;
        }
        throw lastError;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new MiniMaxError(
          errorData.error?.message || `API error: ${response.status}`,
          response.status
        );
      }

      const data = await response.json();

      // Extract content from MiniMax response format
      const content =
        data.choices?.[0]?.messages?.[0]?.text ||
        data.choices?.[0]?.messages?.[0]?.content ||
        data.choices?.[0]?.delta?.content ||
        "";

      return content;
    } catch (error) {
      if (error instanceof MiniMaxError && error.isRateLimit) {
        throw error;
      }
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        await sleep(getRetryDelay(attempt));
      }
    }
  }

  throw lastError || new MiniMaxError("Failed after retries");
}

/**
 * Chat completion with streaming using SSE
 */
export async function* chatCompletionStream(
  options: ChatCompletionOptions
): AsyncGenerator<string, void, unknown> {
  const {
    model = "MiniMax-Text-01",
    messages,
    temperature = 0.7,
    max_tokens = 4096,
  } = options;

  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) {
    throw new MiniMaxError("MINIMAX_API_KEY is not configured");
  }

  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(MINIMAX_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens,
          stream: true,
          role_setting: {
            role: "assistant",
            role_name: "Kibi AI Tutor",
            content: messages.find((m) => m.role === "system")?.content || "",
          },
        }),
        signal: options.signal,
      });

      if (response.status === 429) {
        lastError = new MiniMaxError("Rate limit exceeded", response.status, true);
        if (attempt < maxRetries - 1) {
          await sleep(getRetryDelay(attempt));
          continue;
        }
        throw lastError;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new MiniMaxError(
          errorData.error?.message || `API error: ${response.status}`,
          response.status
        );
      }

      if (!response.body) {
        throw new MiniMaxError("Response body is null");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const parsed = parseSSEStream(line);
            if (parsed) {
              const content =
                parsed.choices?.[0]?.delta?.content ||
                parsed.choices?.[0]?.messages?.[0]?.text ||
                "";
              if (content) {
                yield content;
              }
            }
          }
        }

        // Process remaining buffer
        if (buffer.trim() && buffer.trim() !== "[DONE]") {
          const parsed = parseSSEStream(buffer);
          if (parsed) {
            const content =
              parsed.choices?.[0]?.delta?.content ||
              parsed.choices?.[0]?.messages?.[0]?.text ||
              "";
            if (content) {
              yield content;
            }
          }
        }

        return;
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      if (error instanceof MiniMaxError && error.isRateLimit) {
        throw error;
      }
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        await sleep(getRetryDelay(attempt));
      }
    }
  }

  throw lastError || new MiniMaxError("Failed after retries");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export { MiniMaxError };
