export default function UsageCard({ label, value }) {
  const getColor = (val) => {
    if (val > 80) return 'bg-red-500';
    if (val > 50) return 'bg-yellow-400';
    return 'bg-green-500';
  };

  return (
    <div className="p-4 rounded-lg shadow border">
      <p className="text-sm text-gray-600 mb-2">{label}</p>
      <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor(value)}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <p className="text-xs text-right mt-1 text-gray-500">{value}% used</p>
    </div>
  );
}
