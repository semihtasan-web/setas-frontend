import { redirect } from "next/navigation";
import { DashboardShell } from "../components/dashboard-shell";
import { SummaryCard } from "../components/dashboard/summary-card";
import { serverSupabase } from "../lib/supabase-server";

const STAT_KEYS = [
  { label: "Gelen Malzeme", table: "incoming_material" },
  { label: "Personel", table: "employee" },
  { label: "Mesai Girişi", table: "overtime" },
  { label: "İmalat", table: "imalat" },
];

type MaterialSummary = {
  malzeme_kodu: string | null;
  malzeme_adi: string | null;
  miktar: number | null;
  birim: string | null;
  depo: string | null;
  gelis_tarihi: string | null;
};

type OvertimeSummary = {
  id: string;
  personel_id: string | null;
  tarih: string;
  toplam_mesai_saat: number | null;
  mesai_tipi: string | null;
};

const fetchCount = (supabase: Awaited<ReturnType<typeof serverSupabase>>, table: string) =>
  supabase.from(table).select("id", { count: "exact", head: true });

export default async function HomePage() {
  const supabase = await serverSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const sessionEmail = user.email ?? "";

  const statsResponses = await Promise.all(STAT_KEYS.map((stat) => fetchCount(supabase, stat.table)));
  const stats = STAT_KEYS.map((stat, index) => ({
    label: stat.label,
    value: statsResponses[index]?.count ?? 0,
  }));

  const latestMaterials = await supabase
    .from("incoming_material")
    .select("malzeme_kodu, malzeme_adi, miktar, birim, depo, gelis_tarihi")
    .order("gelis_tarihi", { ascending: false })
    .limit(4);

  const recentOvertime = await supabase
    .from("overtime")
    .select("id, personel_id, tarih, toplam_mesai_saat, mesai_tipi")
    .order("tarih", { ascending: false })
    .limit(4);

  const latestMaterialsData = (latestMaterials.data ?? []) as MaterialSummary[];
  const recentOvertimeData = (recentOvertime.data ?? []) as OvertimeSummary[];

  const [{ data: roleEntry }, { data: userProfile }] = await Promise.all([
    supabase
      .from("user_roles")
      .select("role_id, roles(name)")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("user")
      .select("kullanici_adi, yetki_alani")
      .eq("eposta", sessionEmail)
      .maybeSingle(),
  ]);

  const typedUserProfile = userProfile as
    | { kullanici_adi?: string; yetki_alani?: string[]; rol?: string }
    | null;

  let assignedSites: string[] = [];
  if (typedUserProfile?.yetki_alani?.length) {
    const { data } = await supabase
      .from("site")
      .select("shantiye_adi")
      .in("id", typedUserProfile.yetki_alani);
    const sitesData = data as Array<{ shantiye_adi: string }> | null;
    assignedSites = sitesData?.map((site) => site.shantiye_adi) ?? [];
  }

  const roleName =
    (roleEntry as { roles?: { name?: string } } | null)?.roles?.name ?? typedUserProfile?.rol ?? "standard";

  return (
    <DashboardShell
      userName={typedUserProfile?.kullanici_adi ?? user.email ?? "Kullanıcı"}
      role={roleName}
    >
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <SummaryCard key={stat.label} label={stat.label} value={stat.value ?? 0} />
        ))}
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-sm uppercase tracking-[0.3em] text-slate-400">Atanan Şantiyeler</h2>
          {assignedSites.length ? (
            <ul className="mt-4 space-y-2 text-base text-white">
              {assignedSites.map((site) => (
                <li key={site} className="rounded-xl bg-white/5 px-4 py-2">
                  {site}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-slate-300">Henüz bir şantiye atamanız yok.</p>
          )}
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-sm uppercase tracking-[0.3em] text-slate-400">Rol Bilgisi</h2>
          <p className="mt-4 text-lg font-semibold text-white">{roleName}</p>
          <p className="mt-2 text-sm text-slate-300">Bu rol, sistemdeki veriler üzerinde anlık yetki kontrolü sağlar.</p>
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-sm uppercase tracking-[0.3em] text-slate-400">Yeni Gelen Malzemeler</h3>
          <div className="mt-4 space-y-3 text-sm text-white">
            {latestMaterialsData.length ? (
              latestMaterialsData.map((material, index) => (
              <div key={material.malzeme_kodu ?? `${material.malzeme_adi}-${index}`} className="flex justify-between rounded-xl bg-white/5 px-4 py-3">
                  <div>
                    <p className="font-semibold">{material.malzeme_adi}</p>
                    <p className="text-xs text-slate-300">{material.depo || "Depo yok"}</p>
                  </div>
                  <span className="text-base font-semibold">
                    {material.miktar} {material.birim}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-slate-300">Henüz kayıtlı bir malzeme yok.</p>
            )}
          </div>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-sm uppercase tracking-[0.3em] text-slate-400">Son Mesai Girişleri</h3>
          <div className="mt-4 space-y-3 text-sm text-white">
            {recentOvertimeData.length ? (
              recentOvertimeData.map((mesai) => (
                <div key={mesai.id} className="flex items-start justify-between rounded-xl bg-white/5 px-4 py-3">
                  <div>
                    <p className="font-semibold">{mesai.mesai_tipi || "Standart"}</p>
                    <p className="text-xs text-slate-300">{new Date(mesai.tarih).toLocaleDateString()}</p>
                  </div>
                  <span className="text-base font-semibold">{mesai.toplam_mesai_saat ?? "-"}h</span>
                </div>
              ))
            ) : (
              <p className="text-slate-300">Henüz mesai kaydı yok.</p>
            )}
          </div>
        </article>
      </section>
    </DashboardShell>
  );
}
