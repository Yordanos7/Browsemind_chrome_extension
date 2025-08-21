export default function BarRow({
  label,
  valuePct,
  right,
}: {
  label: string;
  valuePct: number;
  right: string;
}) {
  return (
    <div className="mb-2">
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="text-gray-500">{right}</span>
      </div>
      <div className="w-full h-2 rounded bg-gray-200 overflow-hidden">
        <div className="h-full bg-gray-900" style={{ width: `${valuePct}%` }} />
      </div>
    </div>
  );
}
