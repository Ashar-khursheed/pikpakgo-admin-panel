export default function QueueStatusCard({ label, count }) {
  return (
    <div className="p-4 rounded-lg shadow border">
      <p className="text-sm text-gray-600 mb-2">{label}</p>
      <p className="text-2xl font-bold text-blue-600">{count}</p>
    </div>
  );
}
