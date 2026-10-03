import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { asyncGetStats } from "../states/lostFoundThunks";

const sum = (obj) => Object.values(obj).reduce((total, value) => total + value, 0);

export default function StatsPage() {
  const dispatch = useDispatch();
  const stats = useSelector((state) => state.lostFounds.lostFoundStats);
  const [period, setPeriod] = useState("daily");

  useEffect(() => {
    dispatch(asyncGetStats());
  }, [dispatch]);

  const data = stats[period];
  const labels = data ? Object.keys(data.stats_losts) : [];
  const rows = labels.map((label) => ({
    label,
    lost: data.stats_losts[label],
    found: data.stats_founds[label],
  }));
  const max = Math.max(1, ...rows.map((row) => row.lost + row.found));

  const lostTotal = data ? sum(data.stats_losts) : 0;
  const foundTotal = data ? sum(data.stats_founds) : 0;
  const completedTotal = data
    ? sum(data.stats_losts_completed) + sum(data.stats_founds_completed)
    : 0;
  const cards = [
    { label: "Total laporan", value: lostTotal + foundTotal },
    { label: "Barang hilang", value: lostTotal },
    { label: "Barang ditemukan", value: foundTotal },
    { label: "Selesai", value: completedTotal },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Statistik</h1>
          <p className="text-sm text-slate-500">
            {period === "daily" ? "7 hari terakhir" : "6 bulan terakhir"}
          </p>
        </div>
        <div className="inline-flex rounded-xl bg-slate-200 p-1 text-sm font-semibold">
          {[
            ["daily", "Harian"],
            ["monthly", "Bulanan"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={period === value}
              onClick={() => setPeriod(value)}
              className={`rounded-lg px-4 py-1.5 ${period === value ? "bg-white shadow-sm" : "text-slate-600"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {data === null ? (
        <p className="text-slate-500">Memuat statistik...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {cards.map((card) => (
              <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-sm text-slate-500">{card.label}</p>
                <p className="mt-1 text-3xl font-extrabold">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-sm bg-amber-400" /> Hilang</span>
              <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-sm bg-emerald-500" /> Ditemukan</span>
            </div>
            <ul className="space-y-3">
              {rows.map((row) => (
                <li key={row.label} className="flex items-center gap-3 text-sm">
                  <span className="w-20 shrink-0 text-slate-500">{row.label}</span>
                  <div className="flex h-5 flex-1 overflow-hidden rounded bg-slate-100">
                    <div className="bg-amber-400" style={{ width: `${(row.lost / max) * 100}%` }} />
                    <div className="bg-emerald-500" style={{ width: `${(row.found / max) * 100}%` }} />
                  </div>
                  <span className="w-16 shrink-0 text-right font-semibold">
                    {row.lost} / {row.found}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
