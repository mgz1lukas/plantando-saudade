"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";

type Planta = {
  id: string;
  slug: string;
  nome: string;
  nome_cientifico: string | null;
  categoria: string | null;
  criada_em: string | null;
};

export default function AdminPage() {
  const [plantas, setPlantas] = useState<Planta[]>([]);
  const [totalFloracoes, setTotalFloracoes] = useState(0);
  const [totalFotosFloracoes, setTotalFotosFloracoes] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [excluindo, setExcluindo] = useState("");

  async function sair() {
  await supabase.auth.signOut();
  window.location.href = "/login";
}

  async function carregarDados() {
    setCarregando(true);
    setErro("");

    const { data: plantasData, error: erroPlantas } = await supabase
      .from("plantas")
      .select("id, slug, nome, nome_cientifico, categoria, criada_em")
      .order("criada_em", { ascending: false });

    const { count: countFloracoes, error: erroFloracoes } = await supabase
      .from("floracoes")
      .select("id", { count: "exact", head: true });

    const { count: countFotos, error: erroFotos } = await supabase
      .from("fotos_plantas")
      .select("id", { count: "exact", head: true });

    if (erroPlantas || erroFloracoes || erroFotos) {
      setErro(
        erroPlantas?.message ||
          erroFloracoes?.message ||
          erroFotos?.message ||
          "Erro ao carregar dados."
      );
      setPlantas([]);
    } else {
      setPlantas(plantasData || []);
      setTotalFloracoes(countFloracoes || 0);
      setTotalFotosFloracoes(countFotos || 0);
    }

    setCarregando(false);
  }

  useEffect(() => {
    carregarDados();
  }, []);

  async function excluirPlanta(planta: Planta) {
    const confirmar = window.confirm(
      `Tem certeza que deseja excluir a planta "${planta.nome}"? Essa ação não poderá ser desfeita.`
    );

    if (!confirmar) return;

    setErro("");
    setExcluindo(planta.id);

    const { error } = await supabase
      .from("plantas")
      .delete()
      .eq("id", planta.id);

    setExcluindo("");

    if (error) {
      setErro(error.message);
      return;
    }

    await carregarDados();
  }

  const totalPlantas = plantas.length;

  const especiesRegistradas = new Set(
    plantas
      .map((planta) => planta.nome_cientifico)
      .filter((nome) => nome && nome.trim() !== "")
  ).size;

  return (
    <main className="min-h-screen bg-[#f6f1e8] px-6 py-8 text-[#263528]">
      <section className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 border-b border-[#d8cbb8] pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-[#7b8f6a]">
              Área administrativa
            </p>

            <h1 className="mt-2 text-4xl font-semibold">Painel do jardim</h1>

            <p className="mt-3 max-w-2xl leading-7 text-[#52624f]">
              Cadastre novas plantas, edite informações, registre florações,
              adicione fotos e gere QR Codes para as etiquetas.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
  type="button"
  onClick={sair}
  className="rounded-full border border-[#b6a78f] px-5 py-3 text-sm font-semibold text-[#465f3b] transition hover:bg-[#efe6d8]"
>
  Sair
</button>
            <a
              href="/"
              className="rounded-full border border-[#b6a78f] px-5 py-3 text-sm font-semibold text-[#465f3b] transition hover:bg-[#efe6d8]"
            >
              Ver site principal
            </a>

          
          </div>
        </header>

        {erro && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {erro}
          </div>
        )}

        <section className="grid gap-4 py-8 md:grid-cols-4">
          <div className="rounded-3xl border border-[#d8cbb8] bg-[#fffaf1] p-6">
            <p className="text-sm text-[#7b8f6a]">Plantas cadastradas</p>
            <strong className="mt-3 block text-4xl">{totalPlantas}</strong>
          </div>

          <div className="rounded-3xl border border-[#d8cbb8] bg-[#fffaf1] p-6">
            <p className="text-sm text-[#7b8f6a]">Espécies registradas</p>
            <strong className="mt-3 block text-4xl">
              {especiesRegistradas}
            </strong>
          </div>

          <div className="rounded-3xl border border-[#d8cbb8] bg-[#fffaf1] p-6">
            <p className="text-sm text-[#7b8f6a]">Florações registradas</p>
            <strong className="mt-3 block text-4xl">{totalFloracoes}</strong>
          </div>

          <div className="rounded-3xl border border-[#d8cbb8] bg-[#fffaf1] p-6">
            <p className="text-sm text-[#7b8f6a]">Fotos de florações</p>
            <strong className="mt-3 block text-4xl">
              {totalFotosFloracoes}
            </strong>
          </div>
        </section>

        <section className="rounded-[2rem] border border-[#d8cbb8] bg-[#fffaf1] p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-[#7b8f6a]">
                Plantas
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                Plantas cadastradas
              </h2>
            </div>

            <a
              href="/admin/plantas/nova"
              className="rounded-full bg-[#557247] px-5 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-[#465f3b]"
            >
              Nova planta
            </a>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-[#d8cbb8]">
            <div className="grid grid-cols-1 bg-[#efe6d8] px-5 py-3 text-sm font-semibold text-[#465f3b] md:grid-cols-[1.5fr_1fr_1.4fr]">
              <span>Nome</span>
              <span>Tipo</span>
              <span>Ações</span>
            </div>

            {carregando && (
              <div className="border-t border-[#d8cbb8] bg-white/50 px-5 py-6 text-[#52624f]">
                Carregando plantas...
              </div>
            )}

            {!carregando && plantas.length === 0 && (
              <div className="border-t border-[#d8cbb8] bg-white/50 px-5 py-6 text-[#52624f]">
                Nenhuma planta cadastrada ainda.
              </div>
            )}

            {!carregando &&
              plantas.map((planta) => (
                <div
                  key={planta.id}
                  className="grid grid-cols-1 gap-3 border-t border-[#d8cbb8] bg-white/50 px-5 py-5 md:grid-cols-[1.5fr_1fr_1.4fr] md:items-center"
                >
                  <div>
                    <strong>{planta.nome}</strong>
                    <p className="mt-1 text-sm text-[#7b8f6a]">
                      {planta.nome_cientifico || "Espécie ainda não informada"}
                    </p>
                  </div>

                  <span>{planta.categoria || "Não informado"}</span>

                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`/p/${planta.slug}`}
                      className="rounded-full border border-[#d8cbb8] px-4 py-2 text-sm font-medium text-[#465f3b] hover:bg-[#efe6d8]"
                    >
                      Ver
                    </a>

                    <a
                      href={`/admin/plantas/${planta.slug}/editar`}
                      className="rounded-full border border-[#d8cbb8] px-4 py-2 text-sm font-medium text-[#465f3b] hover:bg-[#efe6d8]"
                    >
                      Editar
                    </a>

                    <a
                      href={`/admin/plantas/${planta.slug}/editar#qrcode`}
                      className="rounded-full bg-[#557247] px-4 py-2 text-sm font-medium text-white hover:bg-[#465f3b]"
                    >
                      QR Code
                    </a>

                    <button
                      type="button"
                      onClick={() => excluirPlanta(planta)}
                      disabled={excluindo === planta.id}
                      className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-60"
                    >
                      {excluindo === planta.id ? "Excluindo..." : "Excluir"}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </section>
      </section>
    </main>
  );
}