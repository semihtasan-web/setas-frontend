import { ReactNode } from "react";

type CardProps = { children: ReactNode; className?: string };

export function Card({ children, className }: CardProps) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-lg shadow-slate-900/5 backdrop-blur ${className ?? ""}`}>
      {children}
    </div>
  );
}

type CardHeaderProps = { children: ReactNode; className?: string };
export function CardHeader({ children, className }: CardHeaderProps) {
  return <div className={`mb-2 text-sm font-semibold text-slate-800 ${className ?? ""}`}>{children}</div>;
}

type CardContentProps = { children: ReactNode; className?: string };
export function CardContent({ children, className }: CardContentProps) {
  return <div className={`text-sm text-slate-600 ${className ?? ""}`}>{children}</div>;
}
