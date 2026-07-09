import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import { useChat } from '../hooks/useChat.js';
import remarkGfm from 'remark-gfm'
import { useAuth } from '../../auth/hooks/useAuth.js';




const Dashboard = () => {
  const chat = useChat();
  const auth = useAuth();
  const [chatInput, setChatInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const user = useSelector((state) => state.auth.user);
  console.log("Redux User:", user);
  const chats = useSelector((state) => state.chat.chats);
  const currentChatId = useSelector((state) => state.chat.currentChatId);
  const [selectedChat, setSelectedChat] = useState(chats[0]?.title || "Select a chat");

  // Theme configuration
  const theme = {
    dark: {
      bg: {
        primary: '#0F172A',
        secondary: '#0F172A',
        tertiary: '#0F172A',
        overlay: 'rgba(0, 0, 0, 0.5)',
      },
      text: {
        primary: '#F8FAFC',
        secondary: '#94A3B8',
        tertiary: '#475569',
      },
      components: {
        sidebar: 'bg-[#0F172A]/85 backdrop-blur-xl',
        chatArea: '',
        input: 'bg-[#0F172A]/80 border-[#2563EB]/20 focus:border-[#2563EB]/50 focus:ring-[#2563EB]/20',
        chatBubble: 'bg-[#2563EB]/20',
        chatBubbleAi: 'text-[#F8FAFC]',
        codeBlock: 'bg-[#0F172A]/60 text-[#10B981]',
        button: 'bg-[#2563EB] hover:bg-[#2563EB]/90 text-white',
        buttonSecondary: 'bg-[#2563EB]/20 hover:bg-[#2563EB]/30 text-[#F8FAFC]',
        overlay: 'bg-black/50 backdrop-blur-sm',
      },
    },
    light: {
      bg: {
        primary: '#F8FAFC',
        secondary: '#F8FAFC',
        tertiary: '#F8FAFC',
        overlay: 'rgba(0, 0, 0, 0.3)',
      },
      text: {
        primary: '#0F172A',
        secondary: '#64748B',
        tertiary: '#94A3B8',
      },
      components: {
        sidebar: 'bg-white/90 ',
        chatArea: '',
        input: 'bg-white border-slate-300 focus:border-[#2563EB] focus:ring-[#2563EB]/10',
        chatBubble: 'bg-[#2563EB]/10',
        chatBubbleAi: 'text-[#0F172A]',
        codeBlock: 'bg-slate-100 text-[#10B981]',
        button: 'bg-[#2563EB] hover:bg-[#2563EB]/90 text-white',
        buttonSecondary: 'bg-slate-200 hover:bg-slate-300 text-[#0F172A]',
        overlay: 'bg-black/30 backdrop-blur-sm',
      },
    },
  };

  const currentTheme = isDarkMode ? theme.dark : theme.light;


  useEffect(() => {
    chat.initSocketConnection();
    chat.handleGetChats();
  }, []);

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

  return (
    <main style={{ backgroundColor: currentTheme.bg.primary, color: currentTheme.text.primary }} className="min-h-screen w-full shadow-[0_30px_90px_rgba(0,0,0,0.35)] transition-colors duration-300">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className={`fixed inset-0 z-40 md:hidden transition-colors duration-300 ${isDarkMode ? 'bg-black/50 backdrop-blur-sm' : 'bg-black/30 backdrop-blur-sm'}`}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col md:flex-row gap-3 md:gap-6 px-3 py-4 sm:px-6 md:py-6">
        <aside className={`fixed md:relative left-0 top-0 h-screen md:h-auto w-full md:w-auto max-w-[320px] md:max-w-[320px] flex flex-col gap-5 rounded-[32px] md:rounded-[32px] ${currentTheme.components.sidebar} p-5 shadow-[0_30px_90px_rgba(0,0,0,0.45)] z-50 md:z-auto transform transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} md:flex`}>
          <div className="flex items-center justify-between gap-2 md:gap-4">
            <div>
              <p className={`text-xs uppercase tracking-[0.35em] ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Nexora</p>
              <h1 style={{ color: currentTheme.text.primary }} className="mt-2 md:mt-3 text-lg md:text-2xl font-semibold">Chats</h1>
            </div>
            <div className="flex items-center gap-2">
              <button className={`rounded-full ${currentTheme.components.buttonSecondary} px-3 md:px-4 py-2 text-xs font-semibold transition`}>
                + New
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className={`md:hidden rounded-full ${currentTheme.components.buttonSecondary} px-3 py-2 transition`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className={`flex flex-col gap-3 overflow-hidden rounded-[28px] ${isDarkMode ? 'bg-[#0F172A]/80' : 'bg-slate-100'} p-3 max-h-[calc(100vh-280px)] overflow-y-auto`}>
            {Object.values(chats).map((chat) => (
              <button
                key={chat.id}
                onClick={() => openChat(chat.id)}
                className={`w-full rounded-2xl px-4 py-3 text-left text-sm transition ${isDarkMode ? 'bg-[#2563EB]/10 text-[#F8FAFC] hover:bg-[#2563EB]/20' : 'bg-slate-200 hover:bg-slate-300 text-[#0F172A]'}`}
              >
                {chat.title}
              </button>
            ))}
          </div>

          <div className={`rounded-[28px] ${isDarkMode ? 'bg-[#10B981]/15' : 'bg-[#10B981]/10'} p-4 text-sm`}>
            <p style={{ color: currentTheme.text.primary }} className="font-medium">Logged in as</p>
            <p
              style={{ color: currentTheme.text.primary }}
              className="mt-2 text-base font-semibold"
            >
              {user?.username || "Guest User"}
            </p>

            <p
              style={{ color: currentTheme.text.secondary }}
              className="truncate text-xs"
            >
              {user?.email}
            </p>
          </div>
        </aside>

        <section className="flex flex-1 flex-col gap-4 md:gap-6 w-full relative">
          {/* Mobile Hamburger Button & Theme Toggle */}
          <div className="flex gap-2 items-center md:justify-end">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`md:hidden flex items-center justify-center gap-2 rounded-3xl ${currentTheme.components.button} px-4 py-2 text-sm font-semibold transition`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Menu
            </button>

            {/* Theme Toggle - Visible on all devices */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`flex items-center justify-center rounded-3xl ${currentTheme.components.button} px-3 md:px-4 py-2 md:py-2 text-sm font-semibold transition`}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 18a6 6 0 100-12 6 6 0 000 12zm0 2C6.477 20 2 15.523 2 10s4.477-10 10-10 10 4.477 10 10-4.477 10-10 10zm0-18a8 8 0 110 16 8 8 0 010-16zm6-2a1 1 0 011 1v2a1 1 0 11-2 0V1a1 1 0 011-1zm0 16a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
          </div>

          <div className={`flex-1 overflow-hidden rounded-[32px] ${currentTheme.components.chatArea} `}>
            <div className="flex h-full flex-col p-3 sm:p-4 md:p-6">
              <div className="flex-1 space-y-3 md:space-y-4 overflow-y-auto pr-2 pb-4">
                {chats[currentChatId]?.messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      style={{
                        backgroundColor: message.role === 'user' ? (isDarkMode ? 'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.1)') : 'transparent',
                        color: currentTheme.text.primary
                      }}
                      className={`max-w-[90%] sm:max-w-[80%] md:max-w-[70%] w-fit rounded-3xl px-4 py-3 sm:px-5 sm:py-4 text-xs sm:text-sm leading-5 sm:leading-6  transition-colors duration-300`}
                    >
                      <div className="max-w-none break-words text-inherit">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0 whitespace-pre-wrap">{children}</p>,
                            ul: ({ children }) => <ul className="mb-2 list-disc pl-5">{children}</ul>,
                            ol: ({ children }) => <ol className="mb-2 list-decimal pl-5">{children}</ol>,
                            code: ({ children }) => <code style={{ backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.6)' : 'rgba(226, 232, 240, 0.8)', color: '#10B981' }} className="rounded px-1 py-0.5 font-mono text-[0.9em]">{children}</code>,
                            pre: ({ children }) => <pre style={{ backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.6)' : 'rgba(226, 232, 240, 0.8)' }} className="my-2 overflow-x-auto rounded-xl p-3">{children}</pre>,
                          }}
                          remarkPlugins={[remarkGfm]}
                        >
                          {String(message.content ?? '')}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className={`mt-3 md:mt-4 rounded-[28px] ${isDarkMode ? 'bg-[#0F172A]/80' : 'bg-slate-100'} p-3 md:p-4`}>
                <form onSubmit={handleSubmitMessage} className="flex flex-col gap-2 md:gap-3 sm:flex-row sm:items-center">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type a prompt..."
                    style={{
                      color: currentTheme.text.primary,
                      borderColor: isDarkMode ? 'rgba(37, 99, 235, 0.2)' : 'rgb(226, 232, 240)',
                      backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.8)' : 'white',
                    }}
                    className={`flex-1 rounded-3xl border px-3 md:px-4 py-3 md:py-4 text-xs sm:text-sm outline-none transition focus:ring-2 focus:ring-[#2563EB]/20`}
                  />
                  <button
                    type='submit'
                    disabled={!chatInput.trim()}
                    className={`inline-flex shrink-0 items-center justify-center rounded-3xl ${currentTheme.components.button} px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold transition`}
                  >
                    Send
                  </button>
                </form>
                <p style={{ color: currentTheme.text.secondary }} className="mt-2 text-xs">Tip: Ask anything from planning to code review.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default Dashboard
