import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [mode, setMode] = useState(null); // null | 'citizen' | 'advocate'
  const [tab, setTab] = useState("login"); // 'login' | 'register'
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", barNumber: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, loginWithGoogle, register } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (tab === "register") {
      const cleanPhone = form.phone.replace(/\D/g, "");
      if (cleanPhone.length < 10) {
        setError("Please enter a valid 10-digit phone number.");
        return;
      }
    }

    setLoading(true);
    try {
      if (tab === "login") {
        const user = await login(form.email, form.password, mode);
        navigate(user.role === "advocate" ? "/advocate/dashboard" : "/citizen/dashboard");
      } else {
        const payload = mode === "advocate"
          ? { name: form.name, email: form.email, phone: form.phone, password: form.password, barNumber: form.barNumber }
          : { name: form.name, email: form.email, phone: form.phone, password: form.password };
        const user = await register(payload, mode);
        navigate(user.role === "advocate" ? "/advocate/dashboard" : "/citizen/dashboard");
      }
    } catch (err) {
      console.error("Auth error:", err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Authentication failed. Please check your credentials.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setGoogleLoading(true);
    try {
      const promptEmail = form.email || `${mode}_google_user@gmail.com`;
      const promptName = form.name || (mode === "advocate" ? "Advocate Google User" : "Citizen Google User");
      
      const user = await loginWithGoogle({ email: promptEmail, name: promptName }, mode);
      navigate(user.role === "advocate" ? "/advocate/dashboard" : "/citizen/dashboard");
    } catch (err) {
      console.error("Google login error:", err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || "Google authentication failed. Please try again.";
      setError(errorMsg);
    } finally {
      setGoogleLoading(false);
    }
  }

  if (!mode) {
    return (
      <div className="min-h-screen bg-parchment flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <GavelSVG className="w-10 h-10 text-secondary" />
              <h1
                className="text-4xl font-bold text-primary"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                LEX AI
              </h1>
            </div>
            <p className="text-text-secondary text-lg mt-2" style={{ fontFamily: "'Source Serif 4', serif" }}>
              Intelligent Legal Guidance — For Everyone
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
            <RoleCard
              icon={<CitizenIcon />}
              title="I'm a Citizen"
              subtitle="Get guided legal assistance for your case"
              onClick={() => setMode("citizen")}
            />
            <RoleCard
              icon={<AdvocateIcon />}
              title="I'm an Advocate"
              subtitle="Review and manage client cases"
              onClick={() => setMode("advocate")}
            />
          </div>
        </div>
        <FooterNote />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-parchment flex flex-col items-center justify-center px-4 py-16">
      <button
        onClick={() => { setMode(null); setError(""); }}
        className="mb-8 text-text-secondary text-sm hover:text-primary transition-colors flex items-center gap-1 font-medium"
      >
        ← Change Role ({mode === "advocate" ? "Advocate" : "Citizen"})
      </button>

      <div className="w-full max-w-md">
        <div
          className="rounded-t-lg px-8 py-6"
          style={{ background: "#5C3A21" }}
        >
          <div className="flex items-center gap-2 mb-1">
            {mode === "advocate" ? <AdvocateIcon white /> : <CitizenIcon white />}
            <h2
              className="text-2xl font-bold text-secondary"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {mode === "advocate" ? "Advocate Portal" : "Citizen Portal"}
            </h2>
          </div>
          <p className="text-secondary opacity-70 text-sm">
            {mode === "advocate" ? "Access your case management dashboard" : "Begin your legal journey"}
          </p>
        </div>

        <div className="bg-ivory rounded-b-lg shadow-courtroom border border-accent border-opacity-20 overflow-hidden">
          <div className="flex border-b border-accent border-opacity-20">
            {["login", "register"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setTab(t); setError(""); }}
                className={`flex-1 py-3 text-sm font-semibold capitalize transition-colors duration-150 ${
                  tab === t
                    ? "text-primary border-b-2 border-secondary"
                    : "text-text-secondary hover:text-primary"
                }`}
              >
                {t === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {tab === "register" && (
              <Field label="Full Name" name="name" type="text" value={form.name} onChange={handleChange} placeholder="John Doe" required />
            )}
            <Field label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} placeholder="user@example.com" required />
            {tab === "register" && (
              <Field label="Phone Number" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="e.g. 9876543210" required />
            )}
            <Field label="Password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" required />
            {tab === "register" && mode === "advocate" && (
              <Field label="Bar Registration Number" name="barNumber" type="text" value={form.barNumber} onChange={handleChange} placeholder="BAR/2026/101" required />
            )}

            {error && (
              <div className="bg-red-50 border-l-4 border-red-600 text-red-800 p-4 rounded text-sm space-y-1.5 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-red-900">
                  <WarningIcon className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>Authentication Failed</span>
                </div>
                <p className="text-xs leading-relaxed">{error}</p>
                {tab === "login" ? (
                  <button
                    type="button"
                    onClick={() => { setTab("register"); setError(""); }}
                    className="mt-2 text-xs font-bold text-red-900 underline hover:text-black transition-colors block text-left"
                  >
                    Don't have an account? Click here to Register →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setTab("login"); setError(""); }}
                    className="mt-2 text-xs font-bold text-red-900 underline hover:text-black transition-colors block text-left"
                  >
                    Already registered? Click here to Sign In →
                  </button>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 py-2.5 font-semibold"
            >
              {loading ? (
                <SpinnerIcon className="w-4 h-4 animate-spin" />
              ) : null}
              {tab === "login" ? "Sign In" : "Create Account"}
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-accent border-opacity-30"></div>
              <span className="flex-shrink mx-4 text-xs uppercase tracking-widest text-text-secondary opacity-60 font-semibold">Or continue with</span>
              <div className="flex-grow border-t border-accent border-opacity-30"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 border border-gray-300 rounded shadow-sm flex items-center justify-center gap-3 text-sm font-medium text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-secondary"
            >
              {googleLoading ? (
                <SpinnerIcon className="w-4 h-4 animate-spin text-gray-600" />
              ) : (
                <GoogleSVG className="w-5 h-5 flex-shrink-0" />
              )}
              <span>Continue with Google</span>
            </button>
          </form>
        </div>
      </div>
      <FooterNote />
    </div>
  );
}

function RoleCard({ icon, title, subtitle, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group bg-ivory rounded-lg shadow-card border border-accent border-opacity-20 p-8 text-left transition-all duration-200 hover:shadow-courtroom hover:border-secondary hover:border-opacity-60 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
    >
      <div className="w-14 h-14 rounded-full bg-primary bg-opacity-10 flex items-center justify-center mb-5 group-hover:bg-secondary group-hover:bg-opacity-20 transition-colors duration-200">
        {icon}
      </div>
      <h3
        className="text-xl font-bold text-primary mb-2"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        {title}
      </h3>
      <p className="text-text-secondary text-sm leading-relaxed">{subtitle}</p>
      <div className="mt-5 flex items-center gap-1 text-secondary text-sm font-semibold group-hover:gap-2 transition-all duration-150">
        Continue <span>→</span>
      </div>
    </button>
  );
}

function Field({ label, name, type, value, onChange, placeholder, required }) {
  return (
    <div>
      <label className="block text-xs font-semibold tracking-widest uppercase text-text-secondary mb-1.5">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-2.5 rounded border border-accent border-opacity-30 bg-parchment text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-colors placeholder-gray-400"
      />
    </div>
  );
}

function FooterNote() {
  return (
    <p className="mt-8 text-xs text-text-secondary opacity-50 text-center">
      LEX AI is not a substitute for qualified legal advice.
    </p>
  );
}

function GavelSVG({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21l9-9m0 0l3-3m-3 3l-3-3m3 3l3 3M9 3l3 3-3 3-3-3 3-3zm6 6l3 3-3 3-3-3 3-3z" />
    </svg>
  );
}

function CitizenIcon({ white }) {
  return (
    <svg className={`w-7 h-7 ${white ? "text-secondary" : "text-primary"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function AdvocateIcon({ white }) {
  return (
    <svg className={`w-7 h-7 ${white ? "text-secondary" : "text-primary"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  );
}

function SpinnerIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function WarningIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

function GoogleSVG({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}
