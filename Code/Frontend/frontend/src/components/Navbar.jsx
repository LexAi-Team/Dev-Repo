import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const dashboardPath = user?.role === "advocate" ? "/advocate/dashboard" : "/citizen/dashboard";

  return (
    <nav className="bg-primary shadow-courtroom">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to={dashboardPath} className="flex items-center gap-2 group">
          <GavelIcon className="w-7 h-7 text-secondary group-hover:rotate-12 transition-transform duration-200" />
          <span
            className="text-secondary text-xl font-bold tracking-wide"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            LEX AI
          </span>
          <span className="hidden sm:block text-secondary text-opacity-60 text-xs tracking-widest uppercase ml-1 mt-0.5 opacity-60">
            Legal Intelligence
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {user && (
            <>
              <span className="hidden sm:block text-secondary text-opacity-80 text-sm">
                {user.role === "advocate" ? "Adv. " : ""}{user.name || user.email}
              </span>
              <div className="w-px h-5 bg-secondary opacity-30" />
              <button
                onClick={handleLogout}
                className="text-secondary text-sm hover:text-white transition-colors duration-150 font-medium"
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function GavelIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21l9-9m0 0l3-3m-3 3l-3-3m3 3l3 3M9 3l3 3-3 3-3-3 3-3zm6 6l3 3-3 3-3-3 3-3z" />
    </svg>
  );
}
