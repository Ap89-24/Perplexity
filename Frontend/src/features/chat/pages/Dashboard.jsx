import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import { useChat } from '../hooks/useChat.js';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../../auth/hooks/useAuth.js';
import ThemeToggle from '../../../components/ThemeToggle';
import SourceCard from '../components/SourceCard.jsx';
import DocumentUploadModal from '../components/DocumentUploadModal.jsx';

const NexoraIcon = ({ className = 'h-5 w-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M12 2L4 7v10l8 5 8-5V7L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M12 8v8M8.5 10.5L12 8l3.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CodeBlock = ({ children, className }) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const codeText = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative my-3 overflow-hidden rounded-xl border chat-border bg-[var(--chat-code-bg)]">
      <div className="flex items-center justify-between border-b chat-border bg-black/10 px-4 py-1.5 text-[11px] font-mono chat-text-muted">
        <span className="uppercase tracking-wider font-semibold">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded px-2 py-0.5 transition-colors hover:bg-white/10 hover:text-white"
        >
          {copied ? (
            <>
              <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5 opacity-70" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-xs leading-relaxed font-mono">
        <code>{codeText}</code>
      </pre>
    </div>
  );
};

const MessageCopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 text-[11px] chat-text-muted hover:text-white transition-colors py-0.5 px-2 rounded hover:bg-white/5"
      title="Copy response"
    >
      {copied ? (
        <>
          <svg className="h-3 w-3 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-emerald-400 font-medium">Copied</span>
        </>
      ) : (
        <>
          <svg className="h-3 w-3 opacity-60" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>Copy</span>
        </>
      )}
    </button>
  );
};

const Dashboard = () => {
  const chat = useChat();
  const auth = useAuth();
  const [chatInput, setChatInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // RAG States
  const [searchMode, setSearchMode] = useState("hybrid"); // "hybrid" | "web" | "document"
  const [selectedDocIds, setSelectedDocIds] = useState([]);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const user = useSelector((state) => state.auth.user);
  const chats = useSelector((state) => state.chat.chats);
  const currentChatId = useSelector((state) => state.chat.currentChatId);
  const isLoading = useSelector((state) => state.chat.isLoading);

  const currentMessages = chats[currentChatId]?.messages ?? [];
  const currentTitle = chats[currentChatId]?.title || 'New conversation';

  useEffect(() => {
    chat.initSocketConnection();
    chat.handleGetChats();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages.length, currentChatId, currentMessages[currentMessages.length - 1]?.content]);

  const handleSubmitMessage = (e) => {
    e.preventDefault();
    const trimmedMessage = chatInput.trim();
    if (!trimmedMessage) return;

    chat.handleSendMesage({
      message: trimmedMessage,
      chatId: currentChatId,
      searchMode,
      selectedDocIds,
    });
    setChatInput("");
  };

  const handleNewChat = () => {
    chat.handleNewChat();
    setSidebarOpen(false);
  };

  const openChat = (chatId) => {
    chat.handleOpenChat(chatId);
    setSidebarOpen(false);
  };

  const markdownComponents = {
    p: ({ children }) => <p className="whitespace-pre-wrap leading-relaxed">{children}</p>,
    ul: ({ children }) => <ul className="list-disc leading-relaxed pl-5 my-2">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal leading-relaxed pl-5 my-2">{children}</ol>,
    li: ({ children }) => <li className="my-1">{children}</li>,
    a: ({ href, children }) => (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">
        {children}
      </a>
    ),
    code: ({ children, className }) => {
      const isBlock = className?.includes('language-');
      if (isBlock) return <CodeBlock className={className}>{children}</CodeBlock>;
      return <code className="rounded bg-[var(--chat-code-bg)] px-1.5 py-0.5 text-xs font-mono border chat-border text-emerald-300">{children}</code>;
    },
    pre: ({ children }) => <>{children}</>,
    blockquote: ({ children }) => <blockquote className="border-l-2 border-emerald-500/50 pl-3 italic text-gray-400 my-2">{children}</blockquote>,
    h1: ({ children }) => <h1 className="text-lg font-bold text-white mt-3 mb-1">{children}</h1>,
    h2: ({ children }) => <h2 className="text-base font-bold text-white mt-3 mb-1">{children}</h2>,
    h3: ({ children }) => <h3 className="text-sm font-semibold text-white mt-2 mb-1">{children}</h3>,
  };

  const suggestions = [
    { label: 'What are the latest AI breakthroughs today?', icon: '🌐' },
    { label: 'Search uploaded knowledge base documents', icon: '📄' },
    { label: 'Explain Quantum Computing with citations', icon: '⚛️' },
    { label: 'Compare MongoDB Atlas Vector Search vs Pinecone', icon: '🍃' },
  ];

  return (
    <div className="chat-shell flex h-screen overflow-hidden">
      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        selectedDocIds={selectedDocIds}
        setSelectedDocIds={setSelectedDocIds}
      />

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
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-black shadow-sm font-bold">
            <NexoraIcon className="h-4 w-4" />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-white">Perplexity RAG</span>
        </div>

        {/* New chat */}
        <div className="px-2 pb-2">
          <button
            onClick={handleNewChat}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border border-emerald-500/30 text-emerald-200 transition-all hover:border-emerald-500/60 hover:text-white shadow-sm"
          >
            <svg className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New search
          </button>
        </div>

        {/* Chat history */}
        <div className="chat-scroll flex-1 overflow-y-auto px-2">
          <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider chat-text-muted">Recent Searches</p>
          <div className="space-y-1">
            {Object.values(chats).map((chatItem) => {
              const isActive = chatItem.id === currentChatId;
              return (
                <div
                  key={chatItem.id}
                  onClick={() => openChat(chatItem.id)}
                  className={`group flex cursor-pointer w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13px] transition-all ${
                    isActive ? 'bg-emerald-500/15 text-white font-medium border-l-2 border-emerald-500' : 'chat-text-secondary chat-hover'
                  }`}
                >
                  <svg className={`h-4 w-4 shrink-0 ${isActive ? 'text-emerald-400 opacity-100' : 'opacity-50'}`} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="line-clamp-1 flex-1">{chatItem.title}</span>
                  <button
                    onClick={(e) => chat.handleDeleteChat(chatItem.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-400 transition-opacity"
                    title="Delete chat"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar footer */}
        <div className="border-t chat-border p-2">
          <div className="flex items-center gap-2 rounded-lg px-2 py-2 chat-hover">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 text-xs font-bold text-black shadow-sm">
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

      {/* ── Main search area ── */}
      <div className="relative flex min-w-0 flex-1 flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/10 via-transparent to-transparent">
        {/* Top bar */}
        <header className="glass-header flex h-[52px] shrink-0 items-center gap-3 border-b chat-border px-4 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg chat-text-secondary transition-colors chat-hover md:hidden"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex min-w-0 flex-1 items-center justify-between">
            <h1 className="truncate text-[14px] font-semibold tracking-tight">{currentTitle}</h1>
            
            {isLoading ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300 border border-emerald-500/30 animate-pulse shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                RAG Vector Search & Synthesis...
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                MongoDB Atlas Vector RAG
              </span>
            )}
          </div>

          <div className="hidden md:block ml-2">
            <ThemeToggle compact />
          </div>
        </header>

        {/* Messages */}
        <div className="chat-scroll flex-1 overflow-y-auto">
          {currentMessages.length === 0 ? (
            /* Minimal Empty State */
            <div className="flex h-full flex-col items-center justify-center px-4 pb-32 animate-fade-in-up">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 text-black font-bold shadow-xl shadow-emerald-500/20 ring-4 ring-emerald-500/10">
                <NexoraIcon className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-center">Where knowledge begins</h2>
              <p className="mt-2 max-w-md text-center text-[14px] chat-text-secondary">
                Search real-time web sources and user uploaded documents powered by MongoDB Atlas Vector RAG.
              </p>
              <div className="mt-8 grid w-full max-w-lg grid-cols-1 gap-2.5 sm:grid-cols-2">
                {suggestions.map((sug) => (
                  <button
                    key={sug.label}
                    onClick={() => setChatInput(sug.label)}
                    className="suggestion-card flex items-center gap-3 rounded-xl border chat-border px-4 py-3.5 text-left text-[13px] font-medium chat-text-secondary shadow-sm hover:border-emerald-500/40"
                  >
                    <span className="text-lg p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">{sug.icon}</span>
                    <span>{sug.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl px-4 py-6 md:px-8">
              {currentMessages.map((message, index) => (
                message.role === 'user' ? (
                  /* User message */
                  <div key={index} className="mb-6 flex justify-end animate-fade-in-up">
                    <div className="chat-user-bubble max-w-[85%] rounded-[22px] rounded-tr-xs px-4.5 py-3 text-[15px] leading-relaxed sm:max-w-[75%] bg-emerald-600/30 text-white border border-emerald-500/30">
                      <p className="whitespace-pre-wrap font-normal">{String(message.content ?? '')}</p>
                    </div>
                  </div>
                ) : (
                  /* Assistant message */
                  <div key={index} className="group mb-10 flex gap-3.5 md:gap-4 animate-fade-in-up">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 text-black font-bold shadow-md shadow-emerald-500/20 ring-2 ring-emerald-500/20">
                      <NexoraIcon className="h-4 w-4" />
                    </div>
                    <div className="chat-prose min-w-0 flex-1 pt-0.5 space-y-4">
                      {/* RAG Sources Cards Header */}
                      {message.sources && message.sources.length > 0 && (
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                              <span>🌐</span> Sources & Citation References ({message.sources.length})
                            </span>
                          </div>
                          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
                            {message.sources.map((src) => (
                              <SourceCard key={src.id} source={src} />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Markdown Text Response */}
                      <div>
                        <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
                          {String(message.content ?? '')}
                        </ReactMarkdown>
                      </div>

                      <div className="mt-2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <MessageCopyButton text={String(message.content ?? '')} />
                      </div>
                    </div>
                  </div>
                )
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Composer with RAG controls */}
        <div className="shrink-0 border-t chat-border px-4 pb-4 pt-3 md:px-6 md:pb-6">
          <div className="mx-auto max-w-3xl space-y-2">
            {/* RAG Controls Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
              {/* Search Mode Selector */}
              <div className="flex items-center gap-1 rounded-xl bg-white/5 p-1 border border-white/10">
                <button
                  onClick={() => setSearchMode('hybrid')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors text-[11px] font-medium ${
                    searchMode === 'hybrid' ? 'bg-emerald-500 text-black shadow-sm font-semibold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  🌐 Hybrid RAG
                </button>
                <button
                  onClick={() => setSearchMode('web')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors text-[11px] font-medium ${
                    searchMode === 'web' ? 'bg-emerald-500 text-black shadow-sm font-semibold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  🔍 Web Only
                </button>
                <button
                  onClick={() => setSearchMode('document')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors text-[11px] font-medium ${
                    searchMode === 'document' ? 'bg-emerald-500 text-black shadow-sm font-semibold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  📄 Doc RAG
                </button>
              </div>

              {/* Upload & Select Knowledge Base Documents */}
              <button
                onClick={() => setIsDocModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-emerald-300 hover:bg-white/10 hover:border-emerald-500/50 transition-all"
              >
                <span>📚 Index / Attach Docs</span>
                {selectedDocIds.length > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-black">
                    {selectedDocIds.length}
                  </span>
                )}
              </button>
            </div>

            {/* Input Composer */}
            <form onSubmit={handleSubmitMessage}>
              {/* Active Document Indicator Banner */}
              {selectedDocIds.length > 0 && (
                <div className="mb-2 flex items-center justify-between rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 text-xs text-emerald-300">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">📄 Searching Active Document ({selectedDocIds.length})</span>
                    <span className="text-[11px] text-gray-400">Mode: {searchMode.toUpperCase()} RAG</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDocModalOpen(true)}
                    className="text-[11px] underline hover:text-white transition-colors"
                  >
                    Manage Attached Docs
                  </button>
                </div>
              )}

              <div className="chat-composer flex items-end gap-2 rounded-[26px] px-4 py-2.5 border border-white/15 focus-within:border-emerald-500/60">
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
                  placeholder={
                    selectedDocIds.length > 0
                      ? "Ask a question about your attached document..."
                      : "Ask anything or search your RAG knowledge base..."
                  }
                  className="max-h-[200px] min-h-[24px] flex-1 resize-none bg-transparent py-1 text-[15px] leading-relaxed outline-none placeholder:chat-text-muted"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                </button>
              </div>
              <p className="mt-1.5 text-center text-[11px] chat-text-muted">
                Perplexity Hybrid RAG searches MongoDB Atlas Vector embeddings & real-time web pages.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
