import { supabase } from "@/app/lib/supabase";

type Planta = {
  id: string;
  slug: string;
  nome: string;
  nome_cientifico: string | null;
  categoria: string | null;
  foto_principal_url: string | null;
  criada_em: string | null;
};
export const dynamic = "force-dynamic";
export default async function PlantasPage() {
  const { data: plantas } = await supabase
    .from("plantas")
    .select("id, slug, nome, nome_cientifico, categoria, foto_principal_url, criada_em")
    .order("criada_em", { ascending: false });

  const listaPlantas = plantas || [];

  return (
    <main className="min-h-screen bg-[#f6f1e8] px-6 py-8 text-[#263528]">
      <section className="mx-auto max-w-6xl">
        <header className="border-b border-[#d8cbb8] pb-6">
          <a href="/" className="text-sm font-medium text-[#557247]">
            ← Voltar ao site principal
          </a>

          <p className="mt-8 text-sm uppercase tracking-[0.35em] text-[#7b8f6a]">
            Plantas cadastradas
          </p>

          <h1 className="mt-2 text-4xl font-semibold">Todas as plantas</h1>

          <p className="mt-3 max-w-2xl leading-7 text-[#52624f]">
            Lista das plantas cadastradas no jardim digital. Clique em uma
            planta para abrir sua página.
          </p>
        </header>

        {listaPlantas.length === 0 && (
          <div className="mt-8 rounded-3xl border border-[#d8cbb8] bg-[#fffaf1] p-8 text-center text-[#52624f]">
            Nenhuma planta cadastrada ainda.
          </div>
        )}

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {listaPlantas.map((planta) => (
            <a
              key={planta.id}
              href={`/p/${planta.slug}`}
              className="overflow-hidden rounded-[2rem] border border-[#d8cbb8] bg-[#fffaf1] shadow-sm transition hover:-translate-y-1 hover:bg-[#efe6d8]"
            >
              {planta.foto_principal_url ? (
                <img
                  src={planta.foto_principal_url}
                  alt={planta.nome}
                  className="h-56 w-full object-cover"
                />
              ) : (
                <div className="h-56 bg-gradient-to-br from-[#dce7d2] via-[#f8ead7] to-[#c9d8b9]" />
              )}

              <div className="p-5">
                <p className="text-sm text-[#7b8f6a]">
                  {planta.categoria || "Categoria não informada"}
                </p>

                <h2 className="mt-2 text-2xl font-semibold">{planta.nome}</h2>

                <p className="mt-2 text-sm italic text-[#66765e]">
                  {planta.nome_cientifico || "Espécie ainda não informada"}
                </p>
              </div>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}