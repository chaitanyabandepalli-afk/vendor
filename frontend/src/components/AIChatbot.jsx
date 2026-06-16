import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Sparkles, ChevronDown } from 'lucide-react';

// ─────────────────────────────────────────────
//  Knowledge base: static Q&A + context for the
//  SLV Events Vendor Performance system.
// ─────────────────────────────────────────────
const KB = [
  {
    keywords: ['hello', 'hi', 'hey', 'help', 'start'],
    answer: "👋 Hello! I'm **VendorBot**, your AI assistant for the SLV Events Vendor Performance System. I can help you with:\n\n• 📊 **Ratings** – How scoring works\n• 🚫 **Blacklist** – How vendors get blacklisted\n• 🏆 **Recommendations** – Finding top vendors\n• 📁 **Reports** – Analytics & exports\n• ⚙️ **Settings** – Scoring weight configuration\n• 💾 **Data Storage** – Where your data lives\n\nJust ask me anything!",
  },
  {
    keywords: ['score', 'scoring', 'calculate', 'rating', 'how is score', 'how score'],
    answer: "📊 **How Vendor Scores Are Calculated**\n\nEach vendor rating evaluates 5 criteria (1–10 scale):\n\n| Criterion | Default Weight |\n|-----------|---------------|\n| Punctuality | 20% |\n| Quality | 30% |\n| Professionalism | 20% |\n| Cost Behavior | 15% |\n| Communication | 15% |\n\nThe **weighted average** is computed → then converted to a **percentage score** (0–100%).\n\nVendor status is automatically updated:\n- ✅ **≥ 70%** → Active (Good standing)\n- ⚠️ **50–69%** → Warning (Needs improvement)\n- 🚫 **< 50%** → Blacklisted (Auto-flagged)\n\nWeights can be customized in **Settings → Scoring Rules**.",
  },
  {
    keywords: ['blacklist', 'black list', 'banned', 'block', 'blocked'],
    answer: "🚫 **Blacklist System**\n\nA vendor can be blacklisted in two ways:\n\n**1. Automatic Blacklisting**\n- Score falls below **50%** threshold\n- **3 or more** 'No Rebook' ratings\n- **2 or more** severe issue flags\n\n**2. Manual Override** (Admin only)\n- Admin can override any vendor's status\n- A reason must be provided\n- All status changes are tracked in **Status History**\n\nBlacklisted vendors still appear in the system but are flagged and excluded from recommendations.",
  },
  {
    keywords: ['recommend', 'recommendation', 'best vendor', 'top vendor', 'suggest'],
    answer: "🏆 **Vendor Recommendations**\n\nThe recommendations engine filters vendors by:\n\n1. **Category** – e.g., Catering, Decoration, Photography\n2. **Minimum Score** – Only Active vendors with score ≥ threshold\n3. **Sorted by** – Average score (highest first)\n\nBlacklisted & Warning vendors are **excluded** by default from recommendations to protect event quality.",
  },
  {
    keywords: ['database', 'data', 'store', 'storage', 'postgresql', 'neon', 'where is data'],
    answer: "💾 **Data Storage**\n\nThis system uses **PostgreSQL** hosted on **Neon.tech** (serverless cloud database).\n\n**ORM:** Prisma (connects backend to database)\n\n**Data Models:**\n- 🏪 `Vendor` – Profile, contact, scores, status\n- ⭐ `Rating` – Each event review (5 criteria + metadata)\n- 📋 `StatusHistory` – Every status change log\n- ⚙️ `Setting` – Configurable scoring weights\n\n**Connection:** Backend `.env` holds the `DATABASE_URL` securely. Frontend never directly accesses the database — it always goes through the REST API.",
  },
  {
    keywords: ['authentication', 'auth', 'login', 'jwt', 'token', 'session', 'how login'],
    answer: "🔐 **Authentication Flow**\n\nThis demo uses **client-side role selection** (no server auth required for demo):\n\n1. User selects role + enters demo credentials\n2. User object `{ email, role }` is saved to **localStorage**\n3. React Router guards check `localStorage` on every page load\n4. If no user found → redirected to `/login`\n\n**For Production** you would add:\n- JWT tokens from the backend\n- bcrypt password hashing\n- Token stored in httpOnly cookies\n- Protected API routes with auth middleware\n\nThe current system is a **role-based demo** — no real password verification occurs.",
  },
  {
    keywords: ['api', 'endpoint', 'rest', 'fetch', 'request', 'http'],
    answer: "🔗 **API & Data Flow**\n\n```\nFrontend (React)\n    ↓  axios requests\nBackend (Express.js :5000)\n    ↓  Prisma queries\nDatabase (PostgreSQL on Neon)\n```\n\n**Key Endpoints:**\n- `GET /api/vendors` – Fetch all vendors\n- `POST /api/ratings` – Submit a new rating\n- `PUT /api/vendors/:id/status` – Override status\n- `GET /api/dashboard/summary` – Dashboard stats\n- `GET /api/recommendations` – Filtered top vendors\n- `GET /api/reports/vendor-summary` – Analytics\n\nAll requests use **axios** from `src/services/api.js`. Base URL: `http://localhost:5000/api`",
  },
  {
    keywords: ['report', 'analytics', 'export', 'chart', 'graph'],
    answer: "📈 **Reports & Analytics**\n\nThe Reports page provides three views:\n\n1. **Vendor Summary** – Score distribution across all vendors\n2. **Category Performance** – Which vendor categories perform best/worst\n3. **Event Ratings** – Timeline of all submitted ratings\n\nCharts are rendered using **Recharts** library. Data is fetched from `/api/reports/*` endpoints, which aggregate data directly from the PostgreSQL database.",
  },
  {
    keywords: ['setting', 'weight', 'configure', 'config', 'threshold'],
    answer: "⚙️ **Scoring Settings**\n\nAdmins can configure:\n\n- **Individual weights** for each of the 5 rating criteria\n- **Blacklist threshold** (default: 50%)\n- **Warning threshold** (default: 70%)\n- **No-rebook count** trigger for auto-blacklist\n\nChanges are saved to the `Setting` table in the database and take effect **immediately**. You can also trigger a **recalculate all scores** to re-evaluate all vendors with new weights.",
  },
  {
    keywords: ['localhost', 'local', 'run', 'start', 'setup', 'install', 'how to run'],
    answer: "🚀 **Running Locally**\n\n**Step 1 – Backend:**\n```\ncd backend\nnpm install\nnpm run dev\n```\nRuns at: `http://localhost:5000`\n\n**Step 2 – Frontend:**\n```\ncd frontend\nnpm install\nnpm run dev\n```\nRuns at: `http://localhost:5173`\n\n**Requirements:**\n- Node.js 18+\n- `.env` file in `/backend` with DATABASE_URL\n- Neon PostgreSQL database (already configured)\n\nSee the full setup guide for details!",
  },
  {
    keywords: ['vendor', 'add vendor', 'create vendor', 'onboard'],
    answer: "🏪 **Managing Vendors**\n\n**Adding a Vendor:**\n1. Go to **Vendors → Add New Vendor**\n2. Fill in: Name, Category, Contact, Phone, Email, Location\n3. Save → Vendor gets UUID, starts with 0.0 score\n\n**Editing:** Click vendor → Edit button\n**Deleting:** Admin only — permanently removes vendor + all ratings\n\nVendor status updates automatically after each new rating submission.",
  },
];

function findAnswer(query) {
  const q = query.toLowerCase();
  for (const entry of KB) {
    if (entry.keywords.some(k => q.includes(k))) {
      return entry.answer;
    }
  }
  return "🤔 I'm not sure about that specific question. Try asking about:\n\n• **Scoring** – How vendor scores are calculated\n• **Blacklist** – Auto & manual blacklisting rules\n• **Authentication** – Login & session handling\n• **Database** – Where and how data is stored\n• **API** – How frontend fetches data\n• **Setup** – How to run locally\n\nOr describe what you're looking for and I'll do my best!";
}

// Simple markdown-like renderer
function renderMessage(text) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    // Bold
    line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Code inline
    line = line.replace(/`(.*?)`/g, '<code style="background:rgba(192,132,252,0.15);padding:1px 5px;border-radius:3px;font-family:monospace;font-size:11px">$1</code>');

    if (line.startsWith('```')) return null; // skip code block markers
    if (line.startsWith('|')) {
      // Table row
      const cells = line.split('|').filter(c => c.trim() !== '');
      return (
        <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '11px', marginBottom: '2px' }}>
          {cells.map((c, j) => (
            <span key={j} style={{ flex: 1, color: c.includes('---') ? 'transparent' : undefined }}
              dangerouslySetInnerHTML={{ __html: c.trim() }}
            />
          ))}
        </div>
      );
    }
    if (line.trim() === '') return <div key={i} style={{ height: '4px' }} />;

    return (
      <div key={i} dangerouslySetInnerHTML={{ __html: line }} style={{ lineHeight: 1.6 }} />
    );
  }).filter(Boolean);
}

const SUGGESTIONS = [
  'How is vendor score calculated?',
  'How does blacklisting work?',
  'Where is the data stored?',
  'How to run locally?',
];

export default function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'bot',
      text: "👋 Hi! I'm **VendorBot**, your AI assistant. Ask me anything about the SLV Events Vendor system — scoring, blacklists, data storage, API, or how to run it locally!",
      time: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');

    const userMsg = { id: Date.now(), role: 'user', text: msg, time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);

    // Simulate thinking delay
    await new Promise(r => setTimeout(r, 600 + Math.random() * 600));

    const answer = findAnswer(msg);
    setTyping(false);
    const botMsg = { id: Date.now() + 1, role: 'bot', text: answer, time: new Date() };
    setMessages(prev => [...prev, botMsg]);

    if (!open) setUnread(u => u + 1);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating chat window */}
      {open && (
        <div className="chatbot-window glass-modal" style={{ bottom: '90px' }}>
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10"
            style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(219,39,119,0.15))' }}>
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center shadow-lg">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0e0f18]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">VendorBot</p>
              <p className="text-[10px] text-emerald-400 font-medium">Online · AI Assistant</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center transition-colors"
            >
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>

          {/* Messages */}
          <div className="chat-messages" style={{ background: 'rgba(9,10,16,0.8)', maxHeight: '360px' }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={msg.role === 'user' ? 'chat-message-user animate-fade-in' : 'chat-message-bot animate-fade-in'}
              >
                {msg.role === 'bot' && (
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">VendorBot</span>
                  </div>
                )}
                <div style={{ fontSize: '12.5px', lineHeight: '1.6' }}>
                  {renderMessage(msg.text)}
                </div>
                <p style={{ fontSize: '10px', color: 'rgba(156,163,175,0.5)', marginTop: '4px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                  {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="chat-message-bot animate-fade-in">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgb(192,132,252)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>VendorBot</span>
                </div>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '2px 0' }}>
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick suggestions */}
          <div style={{ padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(9,10,16,0.9)' }}>
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  style={{
                    flexShrink: 0,
                    padding: '4px 10px',
                    fontSize: '10px',
                    fontWeight: 600,
                    borderRadius: '20px',
                    border: '1px solid rgba(192,132,252,0.25)',
                    background: 'rgba(192,132,252,0.08)',
                    color: 'rgba(192,132,252,0.9)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => e.target.style.background = 'rgba(192,132,252,0.2)'}
                  onMouseLeave={e => e.target.style.background = 'rgba(192,132,252,0.08)'}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Input area */}
          <div style={{
            display: 'flex',
            gap: '8px',
            padding: '12px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(9,10,16,0.95)',
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about vendors, scoring, data..."
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '8px 12px',
                fontSize: '12.5px',
                color: '#fff',
                outline: 'none',
                transition: 'border-color 0.2s',
                fontFamily: 'Inter, sans-serif',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(192,132,252,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || typing}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: input.trim() && !typing
                  ? 'linear-gradient(135deg, #7c3aed, #db2777)'
                  : 'rgba(255,255,255,0.06)',
                border: 'none',
                cursor: input.trim() && !typing ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                flexShrink: 0,
              }}
            >
              <Send className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* FAB Toggle Button */}
      <div className="chatbot-widget">
        <button
          id="chatbot-toggle"
          onClick={() => setOpen(v => !v)}
          className="relative w-14 h-14 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center"
          style={{
            background: open
              ? 'linear-gradient(135deg, #374151, #1f2937)'
              : 'linear-gradient(135deg, #7c3aed, #db2777)',
            boxShadow: open
              ? '0 8px 25px rgba(0,0,0,0.5)'
              : '0 8px 25px rgba(124,58,237,0.5), 0 0 0 4px rgba(124,58,237,0.15)',
          }}
        >
          {open ? (
            <ChevronDown className="w-5 h-5 text-white" />
          ) : (
            <MessageCircle className="w-5 h-5 text-white" />
          )}

          {/* Unread badge */}
          {unread > 0 && !open && (
            <span
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse"
            >
              {unread}
            </span>
          )}
        </button>
      </div>
    </>
  );
}
