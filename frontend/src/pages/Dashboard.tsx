import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Search,
  Plus,
  Copy,
  Check,
  Bot,
  User,
  Sparkles,
  ChevronDown,
  Trash2,
  Paperclip,
  MoreHorizontal,
  Zap,
  Code2,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

interface CodeBlock {
  language: string;
  code: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  codeBlocks?: CodeBlock[];
  timestamp: string;
  streaming?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  preview: string;
  timestamp: string;
  pinned?: boolean;
}

interface AIModel {
  id: string;
  name: string;
  description: string;
  badge?: string;
  contextWindow: string;
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                         */
/* ------------------------------------------------------------------ */

const MODELS: AIModel[] = [
  { id: "nexus-4-turbo", name: "Nexus 4 Turbo", description: "Most capable · best for complex reasoning", badge: "Pro", contextWindow: "256K context" },
  { id: "nexus-4-mini", name: "Nexus 4 Mini", description: "Fast & efficient · great for everyday tasks", contextWindow: "128K context" },
  { id: "nexus-3-opus", name: "Nexus 3 Opus", description: "Deep analysis · long-form generation", contextWindow: "200K context" },
  { id: "codeforge-v2", name: "CodeForge v2", description: "Specialized for code generation", badge: "Beta", contextWindow: "100K context" },
];

const CONVERSATIONS: Conversation[] = [
  { id: "c1", title: "React Server Components", preview: "How do RSCs handle data fetching differently...", timestamp: "2m ago", pinned: true },
  { id: "c2", title: "Rust ownership model explained", preview: "Can you walk me through borrow checker rules...", timestamp: "1h ago" },
  { id: "c3", title: "Postgres query optimization", preview: "I have a slow JOIN query that scans 2M rows...", timestamp: "3h ago" },
  { id: "c4", title: "Kubernetes deployment strategy", preview: "Blue-green vs canary — which fits our scale?", timestamp: "Yesterday" },
  { id: "c5", title: "Design system tokens", preview: "How to structure spacing tokens for a multi-brand...", timestamp: "2d ago" },
  { id: "c6", title: "WebAssembly performance tips", preview: "My WASM module is slower than expected on Safari...", timestamp: "3d ago" },
  { id: "c7", title: "GraphQL schema federation", preview: "Merging schemas across 4 microservices...", timestamp: "5d ago" },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "m1",
    role: "user",
    content: "Can you show me how to debounce a function in TypeScript with a cancel method?",
    timestamp: "10:24 AM",
  },
  {
    id: "m2",
    role: "assistant",
    content:
      "Absolutely! Here's a robust debounce implementation in TypeScript that includes a `cancel` method and proper type inference for arbitrary functions:",
    codeBlocks: [
      {
        language: "typescript",
        code: `export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): { (...args: Parameters<T>): void; cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };

  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return debounced;
}`,
      },
    ],
    timestamp: "10:24 AM",
  },
];

/* ------------------------------------------------------------------ */
/*  Code block component with copy                                    */
/* ------------------------------------------------------------------ */

function CodeBlockView({ block }: { block: CodeBlock }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard?.writeText(block.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [block.code]);

  const lines = block.code.split("\n");

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-white/10 bg-[#0d0d18] shadow-lg">
      <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] px-4 py-2">
        <div className="flex items-center gap-2">
          <Code2 className="h-3.5 w-3.5 text-purple-400" />
          <span className="text-xs font-medium text-zinc-400">{block.language}</span>
        </div>
        <button
          onClick={handleCopy}
          aria-label="Copy code"
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
        <code className="font-mono">
          {lines.map((line, i) => (
            <div key={i} className="flex">
              <span className="mr-4 inline-block w-8 shrink-0 select-none text-right text-zinc-600">{i + 1}</span>
              <span
                className="text-zinc-200"
                dangerouslySetInnerHTML={{
                  __html: highlightLine(line),
                }}
              />
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}

/* Minimal syntax highlighter — keywords, strings, comments, types */
function highlightLine(line: string): string {
  let result = line
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Comments
  result = result.replace(/(\/\/.*$)/g, '<span style="color:#6b7280">$1</span>');
  // Strings
  result = result.replace(/(['"`])(.*?)\1/g, '<span style="color:#86efac">$1$2$1</span>');
  // Keywords
  const keywords = ["export", "function", "const", "let", "var", "return", "if", "else", "typeof", "void", "extends", "import", "from", "new", "class", "interface", "type", "async", "await", "null", "true", "false"];
  keywords.forEach((kw) => {
    const re = new RegExp(`\\b${kw}\\b`, "g");
    result = result.replace(re, `<span style="color:#c084fc">${kw}</span>`);
  });
  // Types (Capitalized words)
  result = result.replace(/\b([A-Z][a-zA-Z0-9_]*)\b/g, '<span style="color:#7dd3fc">$1</span>');
  // Numbers
  result = result.replace(/\b(\d+)\b/g, '<span style="color:#fbbf24">$1</span>');

  return result;
}

/* ------------------------------------------------------------------ */
/*  Typing indicator                                                  */
/* ------------------------------------------------------------------ */

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1" aria-label="Assistant is typing">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 animate-bounce rounded-full bg-purple-400"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.8s" }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Message bubble                                                    */
/* ------------------------------------------------------------------ */

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";

  return (
    <div className={cn("flex gap-3 md:gap-4", isUser && "flex-row-reverse")}>
      {/* Avatar */}
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-lg",
          isUser
            ? "bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-cyan-500/20"
            : "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-purple-500/30"
        )}
      >
        {isUser ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-white" />}
      </div>

      {/* Content */}
      <div className={cn("flex max-w-[78%] flex-col gap-1", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "rounded-tr-sm bg-gradient-to-br from-indigo-600/80 to-purple-600/80 text-white"
              : "rounded-tl-sm border border-white/5 bg-white/[0.03] text-zinc-200"
          )}
        >
          {msg.streaming ? (
            <TypingDots />
          ) : (
            <>
              <p>{msg.content}</p>
              {msg.codeBlocks?.map((cb, idx) => (
                <CodeBlockView key={idx} block={cb} />
              ))}
            </>
          )}
        </div>
        <span className="px-1 text-[10px] text-zinc-600">{msg.timestamp}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Dashboard component                                          */
/* ------------------------------------------------------------------ */

export default function Dashboard() {
  const [conversations, setConversations] = useState<Conversation[]>(CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState<string>("c1");
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedModel, setSelectedModel] = useState<AIModel>(MODELS[0]);
  const [modelOpen, setModelOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const filteredConvs = conversations.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.preview.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    };

    const assistantId = `a-${Date.now()}`;
    const placeholder: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      streaming: true,
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg, placeholder]);
    setInput("");
    setIsStreaming(true);

    // Simulate streaming response
    const fullResponse =
      "Great question! Let me break this down step by step.\n\nThe key insight is that this pattern separates concerns cleanly. Here's a minimal example that demonstrates the core idea:";

    const simulatedCode: CodeBlock = {
      language: "typescript",
      code: `interface Result<T> {
  data: T;
  error: null;
}

interface ApiError {
  data: null;
  error: string;
}

type ApiResponse<T> = Result<T> | ApiError;

async function fetchSafe<T>(url: string): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
    const data = (await res.json()) as T;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: String(err) };
  }
}`,
    };

    setTimeout(() => {
      let charIdx = 0;
      const interval = setInterval(() => {
        charIdx += 3;
        const partial = fullResponse.slice(0, charIdx);

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: partial + "▌", streaming: charIdx < fullResponse.length }
              : m
          )
        );

        if (charIdx >= fullResponse.length) {
          clearInterval(interval);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: fullResponse, streaming: false, codeBlocks: [simulatedCode] }
                : m
            )
          );
          setIsStreaming(false);
        }
      }, 25);
    }, 800);
  }, [input, isStreaming]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const newConversation = () => {
    const id = `c-${Date.now()}`;
    const conv: Conversation = {
      id,
      title: "New conversation",
      preview: "Start chatting...",
      timestamp: "Now",
    };
    setConversations((prev) => [conv, ...prev]);
    setActiveConvId(id);
    setMessages([]);
    inputRef.current?.focus();
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#070710]">
      {/* ==================== Conversation Sidebar ==================== */}
      <div className="hidden w-72 shrink-0 flex-col border-r border-white/5 bg-[#0a0a14] lg:flex">
        {/* New chat */}
        <div className="p-3">
          <button
            onClick={newConversation}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-purple-600/20 transition-all duration-300 hover:shadow-purple-500/40 hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </button>
        </div>

        {/* Search */}
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              aria-label="Search conversations"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-white/5 bg-white/[0.02] py-2 pl-9 pr-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto px-2 pb-3">
          {filteredConvs.length === 0 ? (
            <p className="px-3 py-8 text-center text-xs text-zinc-600">No conversations found</p>
          ) : (
            filteredConvs.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className={cn(
                  "group mb-1 flex w-full flex-col gap-0.5 rounded-lg px-3 py-2.5 text-left transition-all duration-200",
                  activeConvId === conv.id
                    ? "bg-white/[0.06] shadow-[0_0_15px_-5px_rgba(139,92,246,0.4)]"
                    : "hover:bg-white/[0.03]"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium text-zinc-200">{conv.title}</span>
                  {conv.pinned && <Zap className="h-3 w-3 shrink-0 text-amber-400" />}
                </div>
                <span className="truncate text-xs text-zinc-500">{conv.preview}</span>
                <span className="text-[10px] text-zinc-600">{conv.timestamp}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ==================== Chat Area ==================== */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Chat header */}
        <header className="flex items-center justify-between border-b border-white/5 px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-purple-500/30">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#070710] bg-emerald-400" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white">React Server Components</h1>
              <p className="text-[10px] text-zinc-500">Online · {messages.length} messages</p>
            </div>
          </div>

          {/* Model selector */}
          <div className="relative">
            <button
              onClick={() => setModelOpen((v) => !v)}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-zinc-200 transition-all hover:border-purple-500/40 hover:bg-white/[0.05]"
            >
              <span className="h-2 w-2 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 shadow-sm shadow-purple-400/50" />
              <span className="hidden sm:inline">{selectedModel.name}</span>
              <span className="sm:hidden">{selectedModel.name.split(" ").slice(-1)}</span>
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", modelOpen && "rotate-180")} />
            </button>

            {modelOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setModelOpen(false)} />
                <div className="absolute right-0 top-full z-20 mt-2 w-72 overflow-hidden rounded-xl border border-white/10 bg-[#0d0d18] shadow-2xl shadow-black/50">
                  {MODELS.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model);
                        setModelOpen(false);
                      }}
                      className={cn(
                        "flex w-full flex-col gap-0.5 border-b border-white/5 px-4 py-3 text-left transition-colors last:border-0 hover:bg-white/[0.04]",
                        selectedModel.id === model.id && "bg-white/[0.03]"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-zinc-100">{model.name}</span>
                        {model.badge && (
                          <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-purple-300">
                            {model.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-zinc-500">{model.description}</span>
                      <span className="text-[10px] text-zinc-600">{model.contextWindow}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
          <div className="mx-auto flex max-w-3xl flex-col gap-6">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="border-t border-white/5 bg-[#0a0a14]/80 px-4 py-4 backdrop-blur-xl md:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="relative flex items-end gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-2 transition-all duration-300 focus-within:border-purple-500/40 focus-within:shadow-[0_0_30px_-10px_rgba(139,92,246,0.4)]">
              <button
                aria-label="Attach file"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-300"
              >
                <Paperclip className="h-4 w-4" />
              </button>
              <textarea
                ref={inputRef}
                aria-label="Chat message input"
                placeholder="Message NexusAI..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                className="max-h-32 flex-1 resize-none bg-transparent py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
                style={{ minHeight: "24px" }}
              />
              <button
                aria-label="More options"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-300"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isStreaming}
                aria-label="Send message"
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-300",
                  input.trim() && !isStreaming
                    ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-purple-500/30 hover:scale-105 hover:shadow-purple-400/50"
                    : "cursor-not-allowed bg-white/5 text-zinc-600"
                )}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-zinc-600">
              NexusAI can make mistakes. Verify important information. Press Enter to send, Shift+Enter for new line.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
