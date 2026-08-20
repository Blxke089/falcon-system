import type { ReactNode } from "react";

interface CardProps {
  title?: string;
  children: ReactNode;
}

export default function Card({ title, children }: CardProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-lg">
      {title && (
        <h2 className="mb-5 text-lg font-semibold text-white">
          {title}
        </h2>
      )}

      {children}
    </div>
  );
}