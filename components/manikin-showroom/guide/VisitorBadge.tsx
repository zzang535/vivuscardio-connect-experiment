"use client";

interface VisitorBadgeProps {
  name: string;
}

export default function VisitorBadge({ name }: VisitorBadgeProps) {
  if (!name) return null;

  return (
    <div className="fixed left-6 top-6 z-20 rounded-2xl border border-white/10 bg-black/60 px-5 py-3 text-white shadow-lg backdrop-blur">
      <p className="text-xs uppercase tracking-[0.3em] text-gray-300">Visitor</p>
      <p className="text-lg font-semibold">{name}</p>
    </div>
  );
}
