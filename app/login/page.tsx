"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [entrando, setEntrando] = useState(false);

  async function fazerLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro("");
    setEntrando(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    setEntrando(false);

    if (error) {
      setErro("E-mail ou senha inválidos.");
      return;
    }

    router.push("/admin");
  }

  return (
    <main className="min-h-screen bg-[#f6f1e8] px-6 py-8 text-[#263528]">
      <section className="mx-auto flex min-h-screen max-w-6xl items-center justify-center">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-[#d8cbb8] bg-[#fffaf1] shadow-sm md:grid-cols-2">
          <div className="hidden bg-gradient-to-br from-[#dce7d2] via-[#f8ead7] to-[#c9d8b9] p-10 md:flex md:flex-col md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-[#5d724f]">
                Área privada
              </p>

              <h1 className="mt-4 text-4xl font-semibold leading-tight text-[#263528]">
                Entre para cuidar do seu jardim digital.
              </h1>
            </div>

            <p className="text-base leading-7 text-[#465f3b]">
              Cadastre plantas, registre florações, adicione fotos e guarde as
              memórias de cada vaso em um só lugar.
            </p>
          </div>

          <div className="p-8 md:p-12">
            <a href="/" className="text-sm font-medium text-[#557247]">
              ← Voltar ao site principal
            </a>

            <div className="mt-10">
              <p className="text-sm uppercase tracking-[0.35em] text-[#7b8f6a]">
                Login
              </p>

              <h2 className="mt-3 text-3xl font-semibold">Acessar painel</h2>

              <p className="mt-3 text-sm leading-6 text-[#66765e]">
                Esta área é protegida por senha. Somente quem tiver acesso
                poderá cadastrar, editar e administrar as plantas.
              </p>
            </div>

            {erro && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {erro}
              </div>
            )}

            <form onSubmit={fazerLogin} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  E-mail
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  className="w-full rounded-2xl border border-[#d8cbb8] bg-white px-4 py-3 outline-none transition focus:border-[#557247]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Senha
                </label>

                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full rounded-2xl border border-[#d8cbb8] bg-white px-4 py-3 outline-none transition focus:border-[#557247]"
                />
              </div>

              <button
                type="submit"
                disabled={entrando}
                className="w-full rounded-full bg-[#557247] px-6 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-[#465f3b] disabled:opacity-60"
              >
                {entrando ? "Entrando..." : "Entrar"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}