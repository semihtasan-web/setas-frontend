import { redirect } from "next/navigation";
import { DashboardShell } from "../../components/dashboard-shell";
import { serverSupabase } from "../../lib/supabase-server";

const ADMIN_ONLY = ["admin"];

type UserRow = {
  id: string;
  kullanici_adi: string | null;
  rol: string | null;
  eposta: string | null;
  durum: string | null;
};

type MaterialRow = {
  malzeme_kodu: string | null;
  malzeme_adi: string | null;
  miktar: number | null;
  birim: string | null;
  depo: string | null;
  gelis_tarihi: string | null;
};

type EmployeeRow = {
  personel_no: string;
  ad_soyad: string | null;
  gorev: string | null;
  departman: string | null;
  durum: string | null;
};

type OvertimeRow = {
  personel_id: string | null;
  tarih: string;
  toplam_mesai_saat: number | null;
  mesai_tipi: string | null;
};

export default async function AdminPage() {
  const supabase = await serverSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: roleEntry }] = await Promise.all([
    supabase
      .from("user_roles")
      .select("roles(name)")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const roleName = (roleEntry as { roles?: { name?: string } } | null)?.roles?.name ?? "standard";
  const isAdmin = ADMIN_ONLY.includes(roleName);

  if (!isAdmin) {
    return (
      <DashboardShell userName={user.email ?? "Kullanıcı"} role={roleName}>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white">
          <p className="text-lg font-semibold">Erişim engellendi</p>
          <p className="mt-2 text-sm text-slate-300">Bu sayfa yalnızca yönetici kullanıcılar için.</p>
        </div>
      </DashboardShell>
    );
  }

  const [usersRes, materialsRes, employeesRes, overtimeRes] = await Promise.all([
    supabase.from("user").select("id, kullanici_adi, rol, eposta, durum").limit(6),
    supabase
      .from("incoming_material")
      .select("malzeme_kodu, malzeme_adi, miktar, birim, depo, gelis_tarihi")
      .order("gelis_tarihi", { ascending: false })
      .limit(6),
    supabase
      .from("employee")
      .select("personel_no, ad_soyad, gorev, departman, durum"),
    supabase
      .from("overtime")
      .select("personel_id, tarih, toplam_mesai_saat, mesai_tipi").order("tarih", { ascending: false }).limit(6),
  ]);

  const users = (usersRes.data ?? []) as UserRow[];
  const materials = (materialsRes.data ?? []) as MaterialRow[];
  const employees = (employeesRes.data ?? []) as EmployeeRow[];
  const overtimes = (overtimeRes.data ?? []) as OvertimeRow[];

  return (
    <DashboardShell userName={user.email ?? "Yönetici"} role={roleName}>
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-sm uppercase tracking-[0.3em] text-slate-400">Kullanıcılar</h2>
          <div className="mt-4 space-y-3 text-sm text-white">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                <div>
                  <p className="font-semibold">{user.kullanici_adi}</p>
                  <p className="text-xs text-slate-300">{user.eposta}</p>
                </div>
                <span className="text-xs uppercase tracking-[0.2em] text-slate-400">{user.rol}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-sm uppercase tracking-[0.3em] text-slate-400">Malzeme Girişi</h2>
          <div className="mt-4 space-y-3 text-sm text-white">
            {materials.map((material) => (
              <div key={material.malzeme_kodu} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
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
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-sm uppercase tracking-[0.3em] text-slate-400">Personel</h2>
          <div className="mt-4 grid gap-2 text-sm text-white">
            {employees.map((employee) => (
              <div key={employee.personel_no} className="rounded-xl bg-white/5 px-4 py-3">
                <p className="font-semibold">{employee.ad_soyad}</p>
                <p className="text-xs text-slate-300">{employee.gorev}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-sm uppercase tracking-[0.3em] text-slate-400">Mesai</h2>
          <div className="mt-4 space-y-3 text-sm text-white">
            {overtimes.map((mesai) => (
              <div key={`${mesai.personel_id}-${mesai.tarih}`} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                <div>
                  <p className="font-semibold">{mesai.mesai_tipi}</p>
                  <p className="text-xs text-slate-300">{new Date(mesai.tarih).toLocaleDateString()}</p>
                </div>
                <span className="text-base font-semibold">{mesai.toplam_mesai_saat ?? "-"}h</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
