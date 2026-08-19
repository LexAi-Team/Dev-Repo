export default function Footer() {
  return (
    <footer className="bg-primary mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-secondary text-opacity-70 text-sm opacity-70">
          © {new Date().getFullYear()} LEX AI — Legal Intelligence Platform
        </p>
        <p className="text-secondary text-opacity-50 text-xs opacity-50 tracking-wide">
          Not a substitute for qualified legal advice
        </p>
      </div>
    </footer>
  );
}
