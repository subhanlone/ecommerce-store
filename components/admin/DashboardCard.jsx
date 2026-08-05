export default function DashboardCard({ label, value }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
