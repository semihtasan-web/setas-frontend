/**
 * TypeScript tipi Supabase şeması.
 */
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      site: {
        Row: { id: string; shantiye_adi: string; lokasyon: string | null; aciklama: string | null; created_at: string };
      };
      "user": {
        Row: { id: string; kullanici_adi: string; rol: string; yetki_alani: string[]; eposta: string; durum: string; created_at: string };
      };
      incoming_material: {
        Row: { id: string; malzeme_kodu: string; malzeme_adi: string; miktar: number; birim: string; tedarikci: string | null; gelis_tarihi: string | null; fatura_no: string | null; depo: string | null; site_id: string | null; created_at: string };
      };
      employee: {
        Row: { id: string; personel_no: string; ad_soyad: string; gorev: string | null; baslama_tarihi: string | null; departman: string | null; telefon: string | null; eposta: string | null; durum: string | null; created_at: string };
      };
      overtime: {
        Row: { id: string; personel_id: string; tarih: string; giris_saati: string | null; cikis_saati: string | null; toplam_mesai_saat: number | null; mesai_tipi: string | null; aciklama: string | null; created_at: string };
      };
      imalat: {
        Row: { id: string; poz_no: string | null; poz_adi: string | null; mahal: string | null; alt_mahal: string | null; imalat_detay: string | null; miktar: number | null; birim: string | null; proje_adi: string | null; aciklama: string | null; site_id: string | null; created_at: string };
      };
      roles: {
        Row: { id: number; name: string; description: string | null };
      };
      user_roles: {
        Row: { id: number; user_id: string; role_id: number };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
