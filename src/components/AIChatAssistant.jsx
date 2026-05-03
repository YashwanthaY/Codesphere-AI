import { useState, useRef, useEffect } from "react";
import {
  MessageCircle, X, Send, Bot, User,
  Sparkles, RotateCcw, ChevronDown
} from "lucide-react";

const QUICK_QUESTIONS = [
  "Explain BFS vs DFS",
  "What is time complexity of Quick Sort?",
  "How does a Hash Map work?",
  "What is Dynamic Programming?",
  "Explain Binary Search Tree",
  "Difference between Stack and Queue",
];

const WELCOME_MESSAGE = {
  id: 0,
  role: "assistant",
  text: "Hi! I'm your AI DSA Assistant 🤖\n\nAsk me anything about:\n→ Data Structures & Algorithms\n→ Time & Space Complexity\n→ Code explanations\n→ Interview preparation\n\nWhat would you like to learn?",
  time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
};

export default function AIChatAssistant() {
  const [isOpen, setIsOpen]       = useState(false);
  const [messages, setMessages]   = useState([WELCOME_MESSAGE]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [unread, setUnread]       = useState(0);
  const messagesEndRef             = useRef(null);
  const inputRef                   = useRef(null);

  // Auto scroll to bottom on new message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setUnread(0);
    }
  }, [isOpen]);

  async function sendMessage(text) {
    const question = text || input.trim();
    if (!question || loading) return;

    setInput("");
    const userMsg = {
      id:   Date.now(),
      role: "user",
      text: question,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ message: question }),
      });

      if (!response.ok) throw new Error("Backend error");

      const data = await response.json();
      const aiMsg = {
        id:   Date.now() + 1,
        role: "assistant",
        text: data.reply || "Sorry, I couldn't process that. Please try again.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages(prev => [...prev, aiMsg]);

      // If chat is closed, show unread count
      if (!isOpen) setUnread(prev => prev + 1);

    } catch (err) {
      setMessages(prev => [...prev, {
        id:   Date.now() + 1,
        role: "assistant",
        text: "⚠ Cannot connect to backend. Make sure Flask is running on port 5000.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isError: true,
      }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function clearChat() {
    setMessages([WELCOME_MESSAGE]);
    setUnread(0);
  }

  return (
    <>
      {/* ── CHAT PANEL ── */}
      <div className={
        "fixed bottom-20 right-4 z-50 w-80 sm:w-96 flex flex-col " +
        "bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl " +
        "transition-all duration-300 ease-in-out origin-bottom-right " +
        (isOpen
          ? "opacity-100 scale-100 pointer-events-auto"
          : "opacity-0 scale-95 pointer-events-none")
      } style={{ height: "520px" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 rounded-t-2xl bg-gradient-to-r from-blue-600/20 to-violet-600/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <Bot size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">DSA Assistant</p>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-[10px] text-slateald-400 text-slate-400">Powered by Groq AI</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearChat}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all"
              title="Clear chat"
            >
              <RotateCcw size={13} />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all"
            >
              <ChevronDown size={16} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scrollbar-thin">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={"flex gap-2 " + (msg.role === "user" ? "flex-row-reverse" : "flex-row")}
            >
              {/* Avatar */}
              <div className={"w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs mt-1 " +
                (msg.role === "user"
                  ? "bg-blue-600"
                  : msg.isError ? "bg-red-600" : "bg-violet-600")}>
                {msg.role === "user" ? <User size={12} /> : <Bot size={12} />}
              </div>

              {/* Bubble */}
              <div className={"max-w-[78%] " + (msg.role === "user" ? "items-end" : "items-start") + " flex flex-col gap-0.5"}>
                <div className={"px-3 py-2 rounded-xl text-xs leading-relaxed whitespace-pre-wrap " +
                  (msg.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : msg.isError
                      ? "bg-red-500/10 border border-red-500/20 text-red-400 rounded-tl-none"
                      : "bg-slate-800 text-slate-200 rounded-tl-none")}>
                  {msg.text}
                </div>
                <span className="text-[9px] text-slate-600 px-1">{msg.time}</span>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot size={12} />
              </div>
              <div className="bg-slate-800 rounded-xl rounded-tl-none px-3 py-2">
                <div className="flex gap-1 items-center h-4">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick questions */}
        {messages.length <= 1 && (
          <div className="px-3 pb-2">
            <p className="text-[10px] text-slate-500 mb-1.5">Quick questions:</p>
            <div className="flex flex-wrap gap-1">
              {QUICK_QUESTIONS.slice(0, 4).map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-[10px] px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all border border-slate-700 hover:border-slate-500"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="px-3 pb-3 pt-2 border-t border-slate-700">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Ask anything about DSA..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none resize-none placeholder-slate-500 focus:border-blue-500 transition-colors leading-relaxed"
              style={{ maxHeight: "80px" }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all flex-shrink-0"
            >
              <Send size={13} className="text-white" />
            </button>
          </div>
          <p className="text-[9px] text-slate-600 mt-1 text-center">Press Enter to send · Shift+Enter for new line</p>
        </div>
      </div>

      {/* ── FLOATING BUTTON ── */}
      <button
        onClick={() => { setIsOpen(p => !p); setUnread(0); }}
        className={
          "fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full shadow-lg " +
          "flex items-center justify-center transition-all duration-300 " +
          (isOpen
            ? "bg-slate-700 hover:bg-slate-600 rotate-0"
            : "bg-blue-600 hover:bg-blue-500 hover:scale-110")
        }
      >
        {isOpen
          ? <X size={20} className="text-white" />
          : <MessageCircle size={20} className="text-white" />}

        {/* Unread badge */}
        {unread > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
            {unread}
          </span>
        )}
      </button>
    </>
  );
}