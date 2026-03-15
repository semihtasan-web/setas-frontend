"use client";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { useMemo, useState } from "react";
import { supabase } from "../lib/supabase-browser";

export interface DashboardShellProps {
  children: React.ReactNode;
  userName: string;
  role: string;
}

export function DashboardShell({ children, userName, role }: DashboardShellProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const initials = useMemo(() => {
    if (!userName) return "";
    return userName
      .split(" ")
      .map((seg) => seg[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [userName]);

  const handleLogout = async () => {
    setBusy(true);
    if (supabase) {
      await supabase.auth.signOut();
    }
    setBusy(false);
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-900/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Setas Deniz</p>
            <p className="text-xl font-semibold text-white">Şantiye Yönetim Platformu</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 rounded-full border border-white/5 bg-white/10 px-3 py-1 text-sm">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold uppercase text-white">
                {initials || userName[0]}
              </span>
              <div className="text-left">
                <p className="text-sm font-semibold text-white">{userName}</p>
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">{role}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} disabled={busy} className="!border-white/30 !bg-white/5 px-4 text-xs uppercase tracking-widest">
              Çıkış
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
