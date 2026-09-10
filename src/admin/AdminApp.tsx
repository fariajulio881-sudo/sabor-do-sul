import { useEffect } from "react";
import { AuthProvider, useAuth } from "./AuthContext";
import { isSupabaseConfigured } from "../lib/supabase";
import { Spinner } from "./ui";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";

/* ------------------------------------------------------------------ */
/* Rotas protegidas (hash):
/*   #/admin/login          → login (admins + superadmin)
/*   #/admin/dashboard      → painel do dono do restaurante
/*   #/superadmin/dashboard → painel do superadmin
/* Regras:
/*   - sem sessão  → sempre cai na tela de login
/*   - admin       → só acessa o painel do próprio restaurante
/*   - superadmin  → acessa tudo
/* ------------------------------------------------------------------ */

function SetupNotice() {
  return (
    <div className="texture-dark grid min-h-screen place-items-center bg-forest-950 px-5">
      <div className="max-w-md rounded-2xl border border-gold-500/40 bg-forest-850/70 p-7 text-sm leading-relaxed text-cream-100">
        <h1 className="font-display text-2xl font-bold text-gold-400">Supabase não configurado</h1>
        <p className="mt-3 text-cream-200/70">
          Para ativar o painel administrativo:
        </p>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-cream-200/70">
          <li>Crie um projeto em <strong>supabase.com</strong></li>
          <li>Rode o arquivo <code className="text-gold-300">supabase/schema.sql</code> no SQL Editor</li>
          <li>Crie um arquivo <code className="text-gold-300">.env</code> com <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code></li>
          <li>Rode o build novamente</li>
        </ol>
        <a href="#inicio" className="mt-5 inline-block text-xs font-bold text-gold-300 underline underline-offset-4">
          ← Voltar ao site
        </a>
      </div>
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="texture-dark grid min-h-screen place-items-center bg-forest-950 px-5">
      <div className="max-w-sm rounded-2xl border border-red-400/30 bg-forest-850/70 p-7 text-center">
        <p className="text-4xl">🚫</p>
        <h1 className="mt-3 font-display text-2xl font-bold text-cream-50">Acesso negado</h1>
        <p className="mt-2 text-sm text-cream-200/60">
          Sua conta é de admin de restaurante e não tem permissão para a área do superadmin.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <a href="#/admin/dashboard" className="rounded-full bg-gold-500 px-5 py-2 text-sm font-bold text-forest-950">
            Ir para meu painel
          </a>
        </div>
      </div>
    </div>
  );
}

function NoRole() {
  return (
    <div className="texture-dark grid min-h-screen place-items-center bg-forest-950 px-5">
      <div className="max-w-sm rounded-2xl border border-gold-500/30 bg-forest-850/70 p-7 text-center">
        <p className="text-4xl">🔐</p>
        <h1 className="mt-3 font-display text-2xl font-bold text-cream-50">Conta sem permissão</h1>
        <p className="mt-2 text-sm text-cream-200/60">
          Seu login existe, mas nenhum papel (admin/superadmin) foi vinculado. Peça ao superadmin para liberar seu acesso.
        </p>
        <a href="#inicio" className="mt-5 inline-block text-xs font-bold text-gold-300 underline underline-offset-4">
          ← Voltar ao site
        </a>
      </div>
    </div>
  );
}

function Router({ path }: { path: string }) {
  const { session, role, loading } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [path]);

  if (!isSupabaseConfigured) return <SetupNotice />;
  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-forest-950">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }
  if (!session) return <AdminLogin />;
  if (role === "superadmin") return <SuperAdminDashboard />;
  if (role === "admin") {
    if (path.startsWith("/superadmin")) return <AccessDenied />;
    return <AdminDashboard />;
  }
  return <NoRole />;
}

export default function AdminApp({ path }: { path: string }) {
  return (
    <AuthProvider>
      <Router path={path} />
    </AuthProvider>
  );
}
