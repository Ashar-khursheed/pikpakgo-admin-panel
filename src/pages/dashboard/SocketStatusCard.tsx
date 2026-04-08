export default function SocketStatusCard({ status, socketCount }) {
  const isConnected = status === 'connected';

  return (
    <div className="p-4 rounded-lg shadow border">
      <p className="text-sm text-gray-600 mb-1">Socket Status</p>
      <div className="flex items-center gap-2">
        <div
          className={`h-3 w-3 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}
        ></div>
        <span className="text-sm">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Active connections: {socketCount}
      </p>
    </div>
  );
}
