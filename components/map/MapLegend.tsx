// The key for the line styles used on the route map.
const LEGEND: { label: string; className: string }[] = [
  { label: "Walk", className: "border-t-4 border-dotted border-ink" },
  { label: "Bus", className: "border-t-4 border-[#1976d2]" },
  { label: "O-Train", className: "border-t-4 border-brand" },
];

export default function MapLegend() {
  return (
    <ul className="flex flex-wrap gap-4 text-xs text-muted" aria-label="Map legend">
      {LEGEND.map((item) => (
        <li key={item.label} className="flex items-center gap-2">
          <span className={`inline-block w-7 ${item.className}`} aria-hidden="true" />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
