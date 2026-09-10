import { useState, type FormEvent } from "react";
import { useAuth } from "../AuthContext";
import { isSupabaseConfigured } from "../../lib/supabase";
import { Button, Card, Field, Spinner, TextInput } from "../ui";

export default function AdminLogin() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const r = await signIn(email.trim(), password);
    setBusy(false);
    if (r.error) setError(r.error);
  };

  return (
    <div className="texture-dark grid min-h-screen place-items-center bg-forest-950 px-5 py-10">
      <div className="w-full max-w-sm">
        <a href="#inicio" className="mb-5 inline-block text-xs font-bold text-cream-200/60 transition-colors hover:text-gold-300">
          ← Voltar ao site
        </a>

        <Card className="p-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold-400">Área restrita</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-cream-50">
            Painel do <span className="text-gold-400 italic">restaurante</span>
          </h1>
          <p className="mt-2 text-sm text-cream-200/60">
            Entre com o email e a senha da sua conta (admin do restaurante ou superadmin).
          </p>

          {!isSupabaseConfigured && (
            <div className="mt-5 rounded-xl border border-gold-500/40 bg-gold-500/10 px-4 py-3 text-xs leading-relaxed text-gold-200">
              ⚠️ <strong>Supabase não configurado.</strong> Crie o arquivo <code>.env</code> na raiz do projeto
              com <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code>, rode o arquivo{" "}
              <code>supabase/schema.sql</code> no seu projeto e reinicie o build.
            </div>
          )}

          <form onSubmit={submit} className="mt-5 space-y-4">
            <Field label="Email">
              <TextInput
                type="email"
                required
                autoComplete="email"
                placeholder="voce@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field label="Senha">
              <TextInput
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>

            {error && (
              <p role="alert" className="rounded-xl border border-red-400/30 bg-red-400/10 px-3 py-2.5 text-sm text-red-200">
                {error}
              </p>
            )}

            <Button type="submit" disabled={busy || !isSupabaseConfigured} className="w-full py-3">
              {busy ? <Spinner /> : "Entrar"}
            </Button>
          </form>
        </Card>

        <p className="mt-4 text-center text-[11px] leading-relaxed text-cream-200/40">
          Esqueceu a senha? A recuperação é feita no painel do Supabase (Authentication → Users).
        </p>
      </div>
    </div>
  );
}
