const STATUS_MAP = {
  active: { label: "Active", bg: "#E8F5E9", color: "#2E7D32", dot: "#2E7D32" },
  pending: { label: "Pending", bg: "#FFF3E0", color: "#ED6C02", dot: "#ED6C02" },
  closed: { label: "Closed", bg: "#FFEBEE", color: "#C62828", dot: "#C62828" },
  review: { label: "Under Review", bg: "#F3EAD3", color: "#B8860B", dot: "#C5A059" },
  submitted: { label: "Submitted", bg: "#E8F5E9", color: "#2E7D32", dot: "#2E7D32" },
  draft: { label: "Draft", bg: "#F5F2EB", color: "#4A4A4A", dot: "#9E9E9E" },
};

export default function StatusBadge({ status }) {
  const cfg = STATUS_MAP[status] || STATUS_MAP.draft;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: cfg.dot }}
      />
      {cfg.label}
    </span>
  );
}
