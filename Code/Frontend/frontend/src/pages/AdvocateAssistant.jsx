import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../api/axios";

const QUICK_ACTIONS = [
  { label: "Summarise Case", prompt: "Provide a concise legal summary of this case." },
  { label: "Identify Weaknesses", prompt: "What are the potential weaknesses in the citizen's case?" },
  { label: "Suggest Strategy", prompt: "What is the recommended legal strategy for this case?" },
  { label: "Draft Legal Notice", prompt: "Draft a professional legal notice based on this case." },
  { label: "Applicable Laws", prompt: "List all applicable laws, sections, and precedents for this case." },
  { label: "Winning Probability", prompt: "Assess the probability of success based on available facts." },
];

export default function AdvocateAssistant() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Good day, Advocate. I have reviewed the case brief. I am ready to assist with legal research, strategy, drafting, or any queries regarding this matter. How may I help?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [caseTitle, setCaseTitle] = useState("Case");
  const bottomRef = useRef();

  useEffect(() => {
    api.get(`/advocate/cases/${caseId}`)
      .then((r) => {
        const c = r.data?.case || r.data;
        setCaseTitle(`${c?.citizenName || "Citizen"} — ${c?.category || "Legal Matter"}`);
      })
      .catch(() => {});
  }, [caseId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text) {
    if (!text.trim() || loading) return;
    const userMsg = { role: "user", content: text.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await api.post(`/advocate/cases/${caseId}/assistant`, { message: text.trim() });
      setMessages((m) => [...m, { role: "assistant", content: data.response || data.message }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "I apologise — I encountered an issue processing your request. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div className="min-h-screen bg-parchment flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <button
              onClick={() => navigate(`/advocate/case/${caseId}`)}
              className="text-text-secondary text-sm hover:text-primary mb-2 flex items-center gap-1 transition-colors"
            >
              ← Case Brief
            </button>
            <h1 className="page-title text-2xl">AI Legal Assistant</h1>
            <p className="text-text-secondary text-sm">{caseTitle}</p>
          </div>
          <div
            className="hidden sm:flex items-center gap-2 bg-ivory border border-secondary border-opacity-30 rounded-lg px-3 py-2"
          >
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-text-secondary">LEX AI Online</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0">
          {/* Quick Actions Panel */}
          <div className="lg:w-56 flex-shrink-0">
            <p className="label-caps mb-3">Quick Actions</p>
            <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-1 lg:pb-0">
              {QUICK_ACTIONS.map((a) => (
                <button
                  key={a.label}
                  onClick={() => sendMessage(a.prompt)}
                  disabled={loading}
                  className="flex-shrink-0 text-left bg-ivory border border-accent border-opacity-20 rounded-lg px-3 py-2.5 text-sm text-primary font-medium hover:border-secondary hover:border-opacity-50 hover:shadow-card transition-all duration-150 disabled:opacity-50"
                  style={{ fontFamily: "'Source Serif 4', serif" }}
                >
                  <span className="text-secondary mr-1.5">›</span>
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Panel */}
          <div className="flex-1 flex flex-col bg-ivory rounded-xl border border-accent border-opacity-20 shadow-card overflow-hidden min-h-[500px]">
            <div
              className="px-5 py-3 border-b border-accent border-opacity-15 flex items-center gap-2"
              style={{ background: "#5C3A21" }}
            >
              <GavelIcon className="w-4 h-4 text-secondary" />
              <span className="text-secondary text-sm font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>
                LEX AI — Legal Intelligence
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div
                      className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mr-2 mt-0.5"
                      style={{ background: "#5C3A21" }}
                    >
                      <GavelIcon className="w-3.5 h-3.5 text-secondary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-secondary rounded-br-sm"
                        : "bg-parchment text-text-primary border border-accent border-opacity-15 rounded-bl-sm"
                    }`}
                    style={{ fontFamily: "'Source Serif 4', serif" }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mr-2 mt-0.5" style={{ background: "#5C3A21" }}>
                    <GavelIcon className="w-3.5 h-3.5 text-secondary" />
                  </div>
                  <div className="bg-parchment border border-accent border-opacity-15 rounded-xl px-4 py-3 flex gap-1.5 items-center">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full bg-secondary"
                        style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="px-4 py-3 border-t border-accent border-opacity-15">
              <div className="flex gap-2 items-end">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about this case… (Enter to send, Shift+Enter for new line)"
                  rows={2}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-accent border-opacity-30 bg-parchment text-text-primary text-sm resize-none focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-colors placeholder-gray-400"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || loading}
                  className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: "#5C3A21" }}
                >
                  <SendIcon className="w-4 h-4 text-secondary" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }`}</style>
    </div>
  );
}

function GavelIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21l9-9m0 0l3-3m-3 3l-3-3m3 3l3 3M9 3l3 3-3 3-3-3 3-3zm6 6l3 3-3 3-3-3 3-3z" />
    </svg>
  );
}

function SendIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  );
}
