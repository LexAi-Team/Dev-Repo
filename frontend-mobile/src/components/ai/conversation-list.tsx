"use client";

import { useState } from "react";
import { Plus, MessageSquare, Clock, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { AIConversationItem } from "@/lib/api";

interface ConversationListProps {
  conversations: AIConversationItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => Promise<void>;
  loading?: boolean;
}

export default function ConversationList({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
}: ConversationListProps) {
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await onDelete(deleteTargetId);
    } finally {
      setIsDeleting(false);
      setDeleteTargetId(null);
    }
  };

  const targetConv = conversations.find((c) => c.id === deleteTargetId);

  return (
    <div className="flex flex-col h-full bg-[#FFFDF8] border-r border-[#E2D5C1] p-3 space-y-4 relative">
      {/* New Conversation Button */}
      <button
        onClick={onNew}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#A66A22] hover:bg-[#C58A35] text-[#FFFDF8] font-bold text-xs shadow-2xs transition-all outline-none"
      >
        <Plus className="w-4 h-4" />
        New Conversation
      </button>

      {/* List Header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#766B5F]">
          Previous Research ({conversations.length})
        </span>
      </div>

      {/* Conversation Thread Items */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-xs text-[#766B5F]/70 space-y-2">
            <MessageSquare className="w-6 h-6 text-[#A66A22]/40 mx-auto" />
            <p className="text-[11px]">No previous research yet.</p>
          </div>
        ) : (
          conversations.map((conv) => {
            const isActive = conv.id === activeId;
            const updatedDate = new Date(conv.updatedAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            });

            return (
              <div
                key={conv.id}
                className={`group relative w-full rounded-xl transition-all border ${
                  isActive
                    ? "bg-[#A66A22]/10 border-[#A66A22] shadow-2xs"
                    : "border-transparent hover:bg-[#F8F4EC] text-[#4A3E31]"
                }`}
              >
                <button
                  onClick={() => onSelect(conv.id)}
                  className="w-full text-left p-2.5 flex flex-col space-y-1 outline-none"
                >
                  <div className="flex items-center justify-between pr-6">
                    <span className="text-xs font-bold text-[#21170F] truncate max-w-[130px]">
                      {conv.title}
                    </span>
                    <span className="text-[10px] text-[#766B5F] flex items-center gap-0.5">
                      <Clock className="w-3 h-3 text-[#A66A22]/60 shrink-0" />
                      {updatedDate}
                    </span>
                  </div>
                  {conv._count?.messages !== undefined && (
                    <span className="text-[10px] text-[#766B5F]/80">
                      {conv._count.messages} messages
                    </span>
                  )}
                </button>

                {/* Subtle Delete Trash Icon Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTargetId(conv.id);
                  }}
                  className="absolute right-2 top-2.5 p-1.5 text-[#766B5F]/50 hover:text-rose-700 hover:bg-rose-100/60 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 outline-none"
                  title="Delete Conversation"
                  aria-label="Delete Conversation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Modal Overlay */}
      {deleteTargetId && (
        <div className="fixed inset-0 bg-[#21170F]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm text-[#21170F]">
                  Delete this conversation?
                </h3>
                <p className="text-[11px] text-[#766B5F] font-medium leading-relaxed mt-0.5">
                  This will permanently remove this conversation and its chat history.
                </p>
              </div>
            </div>

            {targetConv && (
              <div className="bg-[#F8F4EC]/60 p-2.5 rounded-xl border border-[#E2D5C1]/40 text-xs font-semibold text-[#21170F] truncate">
                &ldquo;{targetConv.title}&rdquo;
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                disabled={isDeleting}
                className="px-3.5 py-2 border border-[#E2D5C1] rounded-xl text-xs font-bold text-[#766B5F] hover:text-[#21170F] bg-[#FFFDF8] hover:bg-[#F8F4EC] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-[#FFFDF8] rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
