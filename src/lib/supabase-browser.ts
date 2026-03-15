"use client";
import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "../types/database";

/**
 * Browser-side Supabase client wrapped in Auth Helpers
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseAnonKey ? createBrowserClient<Database>(supabaseUrl, supabaseAnonKey) : null;
