import { redirect } from "next/navigation";
import { DashboardShell } from "../../components/dashboard-shell";
import { serverSupabase } from "../../lib/supabase-server";

const MOCK_REPORTS = [
  { title: "Demir Teslimatı", detail: "Hafriyat aşaması için 80 ton demir" },
  { title: "Beton Pompası", detail: "H-fundasyon için 420 m3" },
  { title: "Periyodik Personel", detail: "Haftalık vardiya planlaması" },
];

export default async function DemoPage() {
  const supabase = await serverSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const { data: roleEntry } = await supabase
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", session.user.id)
    .maybeSingle();

  const roleName = (roleEntry as { roles?: { name?: string } } | null)?.roles?.name ?? "standard";
  if (roleName !== "demo_guest") {
    redirect("/");
  }

  return (
    <DashboardShell userName={session.user.email ?? "Demo"} role={roleName}>
      <div className="grid gap-6 lg:grid-cols-3">
        {MOCK_REPORTS.map((report) => (
          <div key={report.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Rapor</p>
            <h3 className="mt-3 text-lg font-semibold text-white">{report.title}</h3>
            <p className="mt-2 text-sm text-slate-300">{report.detail}</p>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
