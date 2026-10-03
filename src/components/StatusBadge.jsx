export default function StatusBadge({ status, isCompleted }) {
  const isLost = status === "lost";
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <span
        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          isLost ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
        }`}
      >
        {isLost ? "Hilang" : "Ditemukan"}
      </span>
      {isCompleted ? (
        <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
          Selesai
        </span>
      ) : null}
    </span>
  );
}
