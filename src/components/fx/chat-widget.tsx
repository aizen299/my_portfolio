"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const GREETING: Message = {
  role: "assistant",
  content:
    "Hey — I'm Aditya. Ask me about my projects, experience, or anything else on your mind.",
};

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function send() {
    const text = input.trim();
    if (!text || streaming) return;

    const userMsg: Message = { role: "user", content: text };
    const history = [...messages, userMsg];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok || !res.body) {
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", content: "Signal lost. Try again in a moment." },
        ]);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          return [
            ...prev.slice(0, -1),
            { ...last, content: last.content + chunk },
          ];
        });
      }
    } catch {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "assistant",
          content: "Connection dropped. Check your signal.",
        },
      ]);
    } finally {
      setStreaming(false);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-[150] flex flex-col items-end gap-3">
      {/* Chat panel */}
      {open && (
        <div className="chat-widget-panel flex h-[min(480px,70dvh)] w-[min(24rem,calc(100vw-3rem))] flex-col overflow-hidden rounded-xl border border-silver/20 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-silver/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="size-2 animate-pulse rounded-full bg-signal" />
              <span className="label-mono text-xs text-ice">
                AIZEN://VOID · live
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="-mr-1.5 flex size-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Close chat"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages — min-h-0 lets flex shrink so overflow-y-auto actually fires;
              data-lenis-prevent stops Lenis hijacking wheel events inside the panel */}
          <div
            className="flex flex-1 flex-col gap-3 overflow-y-auto p-4 min-h-0 overscroll-contain"
            data-lenis-prevent
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[84%] rounded-lg px-3 py-2 font-mono text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "border border-ice/20 bg-ice/10 text-foreground"
                      : "border border-silver/10 bg-silver/5 text-foreground/90"
                  }`}
                >
                  {msg.content === "" ? (
                    <span className="inline-flex gap-0.5">
                      <span
                        className="animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      >
                        ▪
                      </span>
                      <span
                        className="animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      >
                        ▪
                      </span>
                      <span
                        className="animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      >
                        ▪
                      </span>
                    </span>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input row */}
          <div className="border-t border-silver/10 p-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="type a message..."
                rows={1}
                disabled={streaming}
                className="flex-1 resize-none bg-transparent font-mono text-xs leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:outline-none disabled:opacity-40"
              />
              <button
                onClick={() => void send()}
                disabled={!input.trim() || streaming}
                aria-label="Send"
                className="-m-1.5 flex size-8 shrink-0 items-center justify-center text-signal transition-opacity disabled:opacity-30"
              >
                {streaming ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle button — solid so it's impossible to miss */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Chat with Aditya"}
        className={`flex items-center gap-2 rounded-full px-5 py-3 font-mono text-xs font-semibold uppercase tracking-widest shadow-lg shadow-signal/40 transition-all hover:scale-105 hover:shadow-signal/60 ${
          open
            ? "bg-void border border-signal/40 text-signal"
            : "bg-signal text-void"
        }`}
      >
        {open ? (
          <>
            <X size={15} />
            <span>close</span>
          </>
        ) : (
          <>
            <MessageSquare size={15} />
            <span>chat with me</span>
          </>
        )}
      </button>
    </div>
  );
}
