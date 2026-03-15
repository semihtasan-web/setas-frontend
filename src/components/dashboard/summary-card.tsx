import { Card } from "../ui/card";

type SummaryCardProps = {
  label: string;
  value: number;
  helper?: string;
};

export function SummaryCard({ label, value, helper }: SummaryCardProps) {
  return (
    <Card className="bg-slate-900/60 border-white/10 text-white">
      <div className="text-sm uppercase tracking-[0.3em] text-slate-400">{label}</div>
      <div className="mt-2 text-3xl font-semibold">{value.toLocaleString()}</div>
      {helper && <p className="mt-1 text-xs text-slate-400">{helper}</p>}
    </Card>
  );
}
