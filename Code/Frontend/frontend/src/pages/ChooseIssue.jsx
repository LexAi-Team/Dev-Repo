import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const CATEGORIES = [
  { id: "property", label: "Property Dispute", icon: "🏠", desc: "Land, ownership, tenancy conflicts" },
  { id: "family", label: "Family Law", icon: "👨‍👩‍👧", desc: "Divorce, custody, maintenance" },
  { id: "consumer", label: "Consumer Rights", icon: "🛒", desc: "Defective goods, service fraud" },
  { id: "labour", label: "Labour & Employment", icon: "⚖️", desc: "Wrongful termination, wages" },
  { id: "criminal", label: "Criminal Matter", icon: "🔒", desc: "Bail, FIR, charges" },
  { id: "cheque", label: "Cheque Dishonour", icon: "📄", desc: "Bounced cheque under Sec. 138" },
  { id: "cyber", label: "Cyber Crime", icon: "💻", desc: "Online fraud, harassment" },
  { id: "civil", label: "Civil Dispute", icon: "🤝", desc: "Contracts, recovery, damages" },
  { id: "domestic", label: "Domestic Violence", icon: "🛡️", desc: "Protection, restraining orders" },
  { id: "motor", label: "Motor Accident", icon: "🚗", desc: "Compensation claims, insurance" },
  { id: "medical", label: "Medical Negligence", icon: "🏥", desc: "Malpractice, negligence claims" },
  { id: "other", label: "Other Legal Issue", icon: "📋", desc: "Any matter not listed above" },
];

export default function ChooseIssue() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-parchment flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10">
          <p className="label-caps mb-1">Step 1 of 4</p>
          <h1 className="page-title mb-2">What is your legal issue?</h1>
          <p className="text-text-secondary">
            Select the category that best describes your situation. This helps LEX AI tailor the right questions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => navigate(`/citizen/questions/${cat.id}`)}
              className="group bg-ivory rounded-lg border border-accent border-opacity-20 p-6 text-left transition-all duration-200 hover:border-secondary hover:border-opacity-60 hover:shadow-courtroom focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200 inline-block">
                {cat.icon}
              </div>
              <h3
                className="font-bold text-primary mb-1 text-base"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {cat.label}
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">{cat.desc}</p>
            </button>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
