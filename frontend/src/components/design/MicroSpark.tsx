"use client";

interface Props {
  values: number[];
  color?: string;
}

export function MicroSpark({ values, color = "var(--teal)" }: Props) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-[2px] h-4">
      {values.map((v, i) => (
        <div
          key={i}
          style={{
            height: `${(v / max) * 100}%`,
            width: 3,
            background: color,
            opacity: 0.8,
            borderRadius: 1,
          }}
        />
      ))}
    </div>
  );
}
