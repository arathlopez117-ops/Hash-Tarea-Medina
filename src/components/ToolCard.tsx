import type { ReactNode } from 'react';

interface ToolCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ToolCard({ title, description, icon, children, className = '' }: ToolCardProps) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm ${className}`}>
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="mt-0.5 text-sm text-slate-400">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
