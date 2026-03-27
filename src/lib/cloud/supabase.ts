import { createClient, type Session, type SupabaseClient, type User } from "@supabase/supabase-js";
import type { AppData } from "@/types/app";

type SnapshotRow = {
  user_id: string;
  payload: AppData;
  updated_at: string;
};

let supabaseClient: SupabaseClient | null | undefined;

export const isCloudConfigured = () =>
  Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

export const getSupabaseClient = () => {
  if (!isCloudConfigured()) return null;
  if (supabaseClient) return supabaseClient;

  supabaseClient = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    },
  );

  return supabaseClient;
};

export const getCurrentUser = async () => {
  const client = getSupabaseClient();
  if (!client) return null;

  const {
    data: { user },
  } = await client.auth.getUser();

  return user;
};

export const getCurrentSession = async () => {
  const client = getSupabaseClient();
  if (!client) return null;

  const {
    data: { session },
  } = await client.auth.getSession();

  return session;
};

export const sendMagicLink = async (email: string) => {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase no está configurado");

  const redirectTo = `${window.location.origin}${import.meta.env.BASE_URL}`;
  const { error } = await client.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo,
    },
  });

  if (error) throw error;
};

export const signOutCloud = async () => {
  const client = getSupabaseClient();
  if (!client) return;

  const { error } = await client.auth.signOut();
  if (error) throw error;
};

export const subscribeToAuthChanges = (callback: (session: Session | null, user: User | null) => void) => {
  const client = getSupabaseClient();
  if (!client) return () => undefined;

  const {
    data: { subscription },
  } = client.auth.onAuthStateChange((_event, session) => {
    callback(session, session?.user ?? null);
  });

  return () => subscription.unsubscribe();
};

export const fetchRemoteSnapshot = async (userId: string) => {
  const client = getSupabaseClient();
  if (!client) return null;

  const { data, error } = await client
    .from("app_snapshots")
    .select("user_id,payload,updated_at")
    .eq("user_id", userId)
    .maybeSingle<SnapshotRow>();

  if (error) throw error;
  return data;
};

export const saveRemoteSnapshot = async (userId: string, payload: AppData) => {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase no está configurado");

  const updatedAt = new Date().toISOString();
  const { error } = await client.from("app_snapshots").upsert(
    {
      user_id: userId,
      payload,
      updated_at: updatedAt,
    },
    {
      onConflict: "user_id",
    },
  );

  if (error) throw error;
  return updatedAt;
};
