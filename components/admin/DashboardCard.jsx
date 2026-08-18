export default function DashboardCard({ label, value }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      {/* Label above value, set quiet and small: the number is what the admin
          is scanning for, and it should win the moment the page loads. */}
      <p className="label-caps text-[10px] text-text-subtle">{label}</p>
      <p className="tabular mt-2 text-3xl font-semibold tracking-tight text-text">{value}</p>
    </div>
  );
}
