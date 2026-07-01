import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { useChat } from '../hooks/useChat.js';

const chats = [
  'Personal assistant',
  'Project planner',
  'Daily reminders',
  'Research notes',
  'Code review',
  'Ask anything',
];

const messages = [
  {
    role: 'assistant',
    text: 'Hello! I’m your AI assistant. What can I help you with today?',
  },
  {
    role: 'user',
    text: 'Show me a quick summary of the latest design system updates.',
  },
  {
    role: 'assistant',
    text: 'Sure! The latest update includes improved dark mode support, faster component loading, and a new responsive grid layout.',
  },
];

const Dashboard = () => {
  const chat = useChat();
  const { user } = useSelector((state) => state.auth);
  const [selectedChat, setSelectedChat] = useState(chats[0]);

  useEffect(() => {
    chat.initSocketConnection();
  }, [chat]);

  return (
    <main className="min-h-screen w-full bg-[#0F0A1F]
bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)]
bg-[size:50px_50px] text-white">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-6 px-4 py-6 sm:px-6">
        <aside className="flex w-full max-w-[320px] flex-col gap-5 rounded-[32px] border border-white/10 bg-[#120F28]/85 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Perplexity</p>
              <h1 className="mt-3 text-2xl font-semibold text-white">Chats</h1>
            </div>
            <button className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-100 transition hover:border-white/25 hover:bg-white/10">
              + New
            </button>
          </div>

          <div className="flex flex-col gap-3 overflow-hidden rounded-[28px] bg-[#110A24]/80 p-3">
            {chats.map((title) => (
              <button
                key={title}
                onClick={() => setSelectedChat(title)}
                className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${selectedChat === title
                  ? 'border-white/20 bg-white/10 text-white'
                  : 'border-white/10 bg-white/5 text-slate-200 hover:border-white/20 hover:bg-white/10'
                  }`}
              >
                {title}
              </button>
            ))}
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            <p className="font-medium text-slate-100">Logged in as</p>
            <p className="mt-2 truncate text-base text-white">{user?.name ?? 'Guest user'}</p>
          </div>
        </aside>

        <section className="flex flex-1 flex-col gap-6">
          <div className="rounded-[32px] border border-white/10 bg-slate-950/70 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Conversation</p>
                <h2 className="mt-2 text-3xl font-semibold text-white">{selectedChat}</h2>
              </div>
              <div className="rounded-full border border-white/10 bg-slate-900/80 px-4 py-2 text-sm text-slate-200">
                {user?.name ? `Signed in as ${user.name}` : 'Not signed in'}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/80 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="flex h-full flex-col p-6">
              <div className="flex-1 space-y-4 overflow-y-auto pr-2 pb-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-3xl px-5 py-4 text-sm leading-6 shadow-[0_10px_30px_rgba(0,0,0,0.2)] ${message.role === 'user'
                        ? 'bg-white/15 text-white'
                        : 'bg-white/5 text-slate-100'
                        }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-[28px] border border-white/10 bg-slate-900/80 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    type="text"
                    placeholder="Type a prompt..."
                    className="flex-1 rounded-3xl border border-white/10 bg-[#110A24]/80 px-4 py-4 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-white/20 focus:ring-2 focus:ring-white/10"
                  />
                  <button className="inline-flex shrink-0 items-center justify-center rounded-3xl bg-white/10 px-6 py-4 text-sm font-semibold text-white transition hover:bg-white/15">
                    Send
                  </button>
                </div>
                <p className="mt-2 text-xs text-slate-500">Tip: Ask anything from planning to code review.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default Dashboard
