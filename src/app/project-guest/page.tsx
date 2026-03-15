import { redirect } from "next/navigation";
import { DashboardShell } from "../../components/dashboard-shell";
import { serverSupabase } from "../../lib/supabase-server";

type GuestMaterial = {
  malzeme_adi: string;
  miktar: number | null;
  birim: string | null;
  depo: string | null;
};

export default async function ProjectGuestPage() {
  const supabase = await serverSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const sessionEmail = session.user.email ?? "";

  const { data: roleEntry } = await supabase
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", session.user.id)
    .maybeSingle();

  const roleName = (roleEntry as { roles?: { name?: string } } | null)?.roles?.name ?? "standard";
  if (roleName !== "restricted") {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("user")
    .select("yetki_alani")
    .eq("eposta", sessionEmail)
    .maybeSingle();

  const typedProfile = profile as { yetki_alani?: string[] } | null;

  const sites = typedProfile?.yetki_alani ?? [];
  const materials = sites.length
    ? await supabase
        .from("incoming_material")
        .select("malzeme_adi, miktar, birim, depo")
        .in("site_id", sites)
        .limit(6)
    : { data: [] };

  const materialRows = (materials.data ?? []) as GuestMaterial[];

  return (
    <DashboardShell userName={session.user.email ?? "Misafir"} role={roleName}>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-sm uppercase tracking-[0.3em] text-slate-400">Şantiye Bazlı Gerçek Veriler</h2>
        {sites.length ? (
          <div className="mt-4 grid gap-3 text-sm text-white">
            {materialRows.map((material) => (
              <div key={material.malzeme_adi} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                <div>
                  <p className="font-semibold">{material.malzeme_adi}</p>
                  <p className="text-xs text-slate-300">{material.depo}</p>
                </div>
                <span className="text-base font-semibold">
                  {material.miktar} {material.birim}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-300">Henüz bir şantiyeye atanmadınız.</p>
        )}
      </div>
    </DashboardShell>
  );
}
