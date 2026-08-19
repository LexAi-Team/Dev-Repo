import React, { useState } from 'react';
import { askLexAI } from '../../services/aiService';
import LoadingSpinner from '../LoadingSpinner';

export default function AITutorQuick() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState(null);

  const handleAsk = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setAnswer(null);
    try {
      const data = await askLexAI(query.trim());
      // backend may return { answer } or { response }
      setAnswer(data.answer || data.response || data.message || JSON.stringify(data));
    } catch (err) {
      setError(err.message || 'AI request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-ivory rounded-lg border border-accent p-4 shadow-sm">
      <h3 className="font-semibold mb-2">Ask LEX AI</h3>
      <textarea
        rows={3}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ask a legal question, e.g. 'What documents are needed for a theft complaint?'"
        className="w-full p-3 rounded-md border border-accent bg-parchment text-sm mb-3"
      />
      <div className="flex items-center gap-2">
        <button
          onClick={handleAsk}
          disabled={loading}
          className="px-4 py-2 bg-primary text-secondary rounded-md disabled:opacity-50"
        >
          Ask
        </button>
        {loading && <div className="w-6"><LoadingSpinner /></div>}
      </div>

      <div className="mt-3">
        {error && <div className="text-red-600">{error}</div>}
        {answer && (
          <div className="whitespace-pre-wrap bg-parchment p-3 rounded-md border border-accent mt-2">{answer}</div>
        )}
      </div>
    </div>
  );
}
