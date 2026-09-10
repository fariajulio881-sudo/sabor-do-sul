import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, type Role } from "../lib/supabase";

type AuthCtx = {
  session: Session | null;
  role: Role | null;
  restaurantId: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}

function translateAuthError(msg: string) {
  if (msg.toLowerCase().includes("invalid login credentials")) return "Email ou senha incorretos.";
  if (msg.toLowerCase().includes("email not confirmed")) return "Confirme seu email antes de entrar.";
  if (msg.toLowerCase().includes("rate limit")) return "Muitas tentativas. Aguarde um instante.";
  return msg;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadRole = useCallback(async (userId: string | undefined) => {
    if (!userId) {
      setRole(null);
      setRestaurantId(null);
      return;
    }
    const { data } = await supabase
      .from("user_roles")
      .select("role, restaurant_id")
      .eq("user_id", userId)
      .maybeSingle();
    setRole((data?.role as Role) ?? null);
    setRestaurantId(data?.restaurant_id ?? null);
  }, []);

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setSession(data.session);
      loadRole(data.session?.user.id).finally(() => alive && setLoading(false));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      loadRole(s?.user.id);
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, [loadRole]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: translateAuthError(error.message) };
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setRole(null);
    setRestaurantId(null);
  }, []);

  const refreshRole = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    await loadRole(data.session?.user.id);
  }, [loadRole]);

  return (
    <Ctx.Provider value={{ session, role, restaurantId, loading, signIn, signOut, refreshRole }}>
      {children}
    </Ctx.Provider>
  );
}
