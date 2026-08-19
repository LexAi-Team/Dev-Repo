import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../api/axios";

const EXPIRY_MINUTES = 5;

export default function AdvocateDocuments() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    api.get(`/advocate/cases/${caseId}/documents`)
      .then((r) => setFiles(r.data?.documents || []))
      .catch(() => {});
  }, [caseId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setFiles((prev) =>
        prev.map((f) => ({
          ...f,
          secondsLeft: Math.max(0, (f.secondsLeft ?? EXPIRY_MINUTES * 60) - 1),
        }))
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  async function handleUpload(fileList) {
    if (!fileList?.length) return;
    setUploading(true);
    const formData = new FormData();
    Array.from(fileList).forEach((f) => formData.append("files", f));
    try {
      const { data } = await api.post(`/advocate/cases/${caseId}/documents`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const incoming = (data?.documents || []).map((d) => ({ ...d, secondsLeft: EXPIRY_MINUTES * 60 }));
      setFiles((prev) => [...prev, ...incoming]);
    } catch {
      Array.from(fileList).forEach((f) => {
        setFiles((prev) => [
          ...prev,
          { _id: Date.now() + Math.random(), name: f.name, size: f.size, secondsLeft: EXPIRY_MINUTES * 60 },
        ]);
      });
    } finally {
      setUploading(false);
    }
  }

  function formatTime(secs) {
    if (secs <= 0) return "Expired";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  function formatSize(bytes) {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="min-h-screen bg-parchment flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <button
          onClick={() => navigate(`/advocate/case/${caseId}`)}
          className="text-text-secondary text-sm hover:text-primary mb-6 flex items-center gap-1 transition-colors"
        >
          ← Case Brief
        </button>

        <div className="mb-8">
          <p className="label-caps mb-1">Case Documents</p>
          <h1 className="page-title mb-2">Document Upload</h1>
          <p className="text-text-secondary text-sm">
            Uploaded files are available for <strong className="text-warning">5 minutes</strong>. Download or process them before the link expires.
          </p>
        </div>

        <div
          className={`border-2 border-dashed rounded-xl p-10 text-center mb-8 transition-all duration-200 cursor-pointer ${
            dragOver ? "border-secondary bg-secondary bg-opacity-5" : "border-accent border-opacity-40 hover:border-secondary hover:border-opacity-60"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
          <div className="text-4xl mb-3">{uploading ? "⏳" : "📎"}</div>
          <p className="text-primary font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>
            {uploading ? "Uploading…" : "Drop files here or click to browse"}
          </p>
          <p className="text-text-secondary text-sm mt-1">PDF, DOCX, JPG, PNG — up to 10 MB each</p>
        </div>

        {files.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
                Uploaded Files
              </h2>
              <span className="label-caps">{files.length} file{files.length !== 1 ? "s" : ""}</span>
            </div>

            <div className="space-y-3">
              {files.map((f) => {
                const expired = (f.secondsLeft ?? 0) <= 0;
                const urgentColor = !expired && f.secondsLeft < 60 ? "#C62828" : f.secondsLeft < 120 ? "#ED6C02" : "#2E7D32";

                return (
                  <div
                    key={f._id}
                    className="card flex items-center justify-between gap-4"
                    style={{ opacity: expired ? 0.5 : 1 }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileIcon ext={f.name?.split(".").pop()?.toUpperCase()} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-primary truncate">{f.name}</p>
                        <p className="text-xs text-text-secondary">{formatSize(f.size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: expired ? "#9E9E9E" : urgentColor }}
                        />
                        <span
                          className="text-xs font-semibold tabular-nums"
                          style={{ color: expired ? "#9E9E9E" : urgentColor }}
                        >
                          {expired ? "Expired" : formatTime(f.secondsLeft)}
                        </span>
                      </div>
                      {f.url && !expired && (
                        <a
                          href={f.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-secondary border border-secondary border-opacity-40 rounded px-2 py-1 hover:bg-secondary hover:text-primary transition-colors"
                        >
                          Download
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function FileIcon({ ext }) {
  const colors = { PDF: "#C62828", DOCX: "#1565C0", DOC: "#1565C0", JPG: "#2E7D32", PNG: "#2E7D32" };
  return (
    <div
      className="w-10 h-10 rounded flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
      style={{ background: colors[ext] || "#5C3A21" }}
    >
      {ext?.slice(0, 3) || "DOC"}
    </div>
  );
}
