import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import { useChat } from '../hooks/useChat.js';
import remarkGfm from 'remark-gfm'
import { useAuth } from '../../auth/hooks/useAuth.js';
import ThemeToggle from '../../../components/ThemeToggle';

const NexoraIcon = ({ className = 'h-5 w-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M12 2L4 7v10l8 5 8-5V7L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M12 8v8M8.5 10.5L12 8l3.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Dashboard = () => {
  const chat = useChat();
  const auth = useAuth();
  const [chatInput, setChatInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const user = useSelector((state) => state.auth.user);
  console.log("Redux User:", user);
  const chats = useSelector((state) => state.chat.chats);
  const currentChatId = useSelector((state) => state.chat.currentChatId);
  const [selectedChat, setSelectedChat] = useState(chats[0]?.title || "Select a chat");

  const currentMessages = chats[currentChatId]?.messages ?? [];
  const currentTitle = chats[currentChatId]?.title || 'New conversation';

  useEffect(() => {
    chat.initSocketConnection();
    chat.handleGetChats();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages.length, currentChatId]);

  const handleSubmitMessage = (e) => {
    e.preventDefault();
    const trimmedMessage = chatInput.trim();
    if (!trimmedMessage) return;

    chat.handleSendMesage({ message: trimmedMessage, chatId: currentChatId });
    setChatInput("");
  };

  const openChat = (chatId) => {
    chat.handleOpenChat(chatId);
    setSidebarOpen(false);
  };

  const markdownComponents = {
    p: ({ children }) => <p className="whitespace-pre-wrap">{children}</p>,
    ul: ({ children }) => <ul className="list-disc">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal">{children}</ol>,
    li: ({ children }) => <li>{children}</li>,
    a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>,
    code: ({ children, className }) => {
      const isBlock = className?.includes('language-');
      if (isBlock) return <code className={className}>{children}</code>;
      return <code>{children}</code>;
    },
    pre: ({ children }) => <pre>{children}</pre>,
    blockquote: ({ children }) => <blockquote>{children}</blockquote>,
    h1: ({ children }) => <h1>{children}</h1>,
    h2: ({ children }) => <h2>{children}</h2>,
    h3: ({ children }) => <h3>{children}</h3>,
  };

  return (
    <div className="chat-shell flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`chat-sidebar fixed inset-y-0 left-0 z-50 flex w-[260px] shrink-0 flex-col border-r transition-transform duration-200 md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar header */}
        <div className="flex items-center gap-2 px-3 pt-3 pb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--chat-accent)] text-white">
            <NexoraIcon className="h-4 w-4" />
          </div>
          <span className="text-[15px] font-semibold tracking-tight">Nexora</span>
        </div>

        {/* New chat */}
        <div className="px-2 pb-2">
          <button
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium chat-text-secondary transition-colors chat-hover"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New chat
          </button>
        </div>

        {/* Chat history */}
        <div className="chat-scroll flex-1 overflow-y-auto px-2">
          <p className="px-3 py-2 text-[11px] font-medium uppercase tracking-wider chat-text-muted">Recent</p>
          <div className="space-y-0.5">
            {Object.values(chats).map((chatItem) => {
              const isActive = chatItem.id === currentChatId;
              return (
                <button
                  key={chatItem.id}
                  onClick={() => openChat(chatItem.id)}
                  className={`group flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13px] transition-colors ${
                    isActive ? 'chat-item-active font-medium' : 'chat-text-secondary chat-hover'
                  }`}
                >
                  <svg className="h-4 w-4 shrink-0 opacity-50" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="line-clamp-1 flex-1">{chatItem.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar footer */}
        <div className="border-t chat-border p-2">
          <div className="flex items-center gap-2 rounded-lg px-2 py-2 chat-hover">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--chat-accent)] text-xs font-bold text-white">
              {(user?.username || 'G')[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium">{user?.username || 'Guest'}</p>
              <p className="truncate text-[11px] chat-text-muted">{user?.email}</p>
            </div>
            <ThemeToggle compact />
          </div>
        </div>
      </aside>

      {/* ── Main chat area ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-[52px] shrink-0 items-center gap-3 border-b chat-border px-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg chat-text-secondary transition-colors chat-hover md:hidden"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex min-w-0 flex-1 items-center justify-center md:justify-start">
            <h1 className="truncate text-[15px] font-medium">{currentTitle}</h1>
          </div>

          <div className="hidden md:block">
            <ThemeToggle compact />
          </div>
        </header>

        {/* Messages */}
        <div className="chat-scroll flex-1 overflow-y-auto">
          {currentMessages.length === 0 ? (
            /* Empty state */
            <div className="flex h-full flex-col items-center justify-center px-4 pb-32">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--chat-accent)] text-white shadow-lg shadow-[rgba(16,163,127,0.25)]">
                <NexoraIcon className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight">How can I help you today?</h2>
              <p className="mt-2 max-w-md text-center text-[15px] chat-text-secondary">
                Ask anything — from brainstorming ideas to debugging code.
              </p>
              <div className="mt-8 grid w-full max-w-lg grid-cols-1 gap-2 sm:grid-cols-2">
                {['Explain a complex topic', 'Help me write code', 'Summarize a document', 'Plan a project'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setChatInput(suggestion)}
                    className="rounded-xl border chat-border px-4 py-3 text-left text-[13px] chat-text-secondary transition-colors chat-hover"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl px-4 py-6 md:px-8">
              {currentMessages.map((message, index) => (
                message.role === 'user' ? (
                  /* User message */
                  <div key={index} className="mb-6 flex justify-end">
                    <div className="chat-user-bubble max-w-[85%] rounded-[20px] px-4 py-3 text-[15px] leading-relaxed sm:max-w-[75%]">
                      <p className="whitespace-pre-wrap">{String(message.content ?? '')}</p>
                    </div>
                  </div>
                ) : (
                  /* Assistant message */
                  <div key={index} className="mb-8 flex gap-3 md:gap-4">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--chat-accent)] text-white">
                      <NexoraIcon className="h-3.5 w-3.5" />
                    </div>
                    <div className="chat-prose min-w-0 flex-1 pt-0.5">
                      <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
                        {String(message.content ?? '')}
                      </ReactMarkdown>
                    </div>
                  </div>
                )
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Composer — fixed bottom like ChatGPT */}
        <div className="shrink-0 border-t chat-border px-4 pb-4 pt-3 md:px-6 md:pb-6">
          <form onSubmit={handleSubmitMessage} className="mx-auto max-w-3xl">
            <div className="chat-composer flex items-end gap-2 rounded-[26px] px-4 py-2.5">
              <textarea
                rows={1}
                value={chatInput}
                onChange={(e) => {
                  setChatInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitMessage(e);
                  }
                }}
                placeholder="Message Nexora..."
                className="max-h-[200px] min-h-[24px] flex-1 resize-none bg-transparent py-1 text-[15px] leading-relaxed outline-none placeholder:chat-text-muted"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--chat-accent)] text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </button>
            </div>
            <p className="mt-2 text-center text-[11px] chat-text-muted">
              Nexora can make mistakes. Consider checking important information.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
