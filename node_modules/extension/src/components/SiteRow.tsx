export default function SiteRow({
  host,
  time,
  onLimit,
  onBlock,
  onRecat,
}: {
  host: string;
  time: string;
  onLimit?: () => void;
  onBlock?: () => void;
  onRecat?: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b">
      <div className="text-sm">
        <div className="font-medium">{host}</div>
        <div className="text-gray-500">{time}</div>
      </div>
      <div className="flex gap-2">
        {onLimit && (
          <button className="text-xs underline" onClick={onLimit}>
            Set limit
          </button>
        )}
        {onBlock && (
          <button className="text-xs underline" onClick={onBlock}>
            Block
          </button>
        )}
        {onRecat && (
          <button className="text-xs underline" onClick={onRecat}>
            Re-cat
          </button>
        )}
      </div>
    </div>
  );
}
