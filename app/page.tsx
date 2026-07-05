import { supabase } from "@/app/lib/supabase";

type Planta = {
  id: string;
  slug: string;
  nome: string;
  nome_cientifico: string | null;
  categoria: string | null;
  criada_em: string | null;
};
export const dynamic = "force-dynamic";
export default async function Home() {
  const { data: plantas } = await supabase
    .from("plantas")
    .select("id, slug, nome, nome_cientifico, categoria, criada_em")
    .order("criada_em", { ascending: false });

  const listaPlantas = plantas || [];

  const totalPlantas = listaPlantas.length;

  const especiesRegistradas = new Set(
    listaPlantas
      .map((planta) => planta.nome_cientifico)
      .filter((nome) => nome && nome.trim() !== "")
  ).size;

  const ultimasPlantas = listaPlantas.slice(0, 3);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f6f1e8] text-[#263528]">
      <div
  className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.24]"
  style={{ backgroundImage: "url('/bg-flor-roxa.jpg.jpg')" }}
/>

<div className="pointer-events-none absolute inset-0 bg-[#f6f1e8]/35" />
      <section className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8">
        <header className="flex items-center justify-center border-b border-[#d8cbb8] pb-6 pt4">
          <a
  href="/"
  className="font-[var(--font-logo)] text-6xl font-medium leading-none tracking-wide text-[#5d724f]"
>
  Plantando Saudade
</a>
          <a
            href="/login"
            className="absolute right-0 rounded-full border border-[#7b8f6a] px-5 py-2 text-sm font-medium text-[#3f5f3d] transition hover:bg-[#e8dfcf]"
          >
            Entrar
          </a>
        </header>

        <section className="flex items-center py-16">
  <div>
    <p className="mb-4 text-sm uppercase tracking-[0.35em] text-[#7b8f6a]">
      Um jardim de memórias
    </p>

    <h2 className="max-w-3xl text-4xl font-semibold leading-tight text-[#263528] md:text-6xl">
      Onde a saudade cria raízes e floresce em memória.
    </h2>

    <p className="mt-8 max-w-2xl text-lg leading-8 text-[#52624f]">
      Este espaço nasceu para guardar a história de cada planta: suas fotos,
      florações, espécies, cuidados e lembranças. Mais do que um catálogo, é um
      jardim digital feito para acompanhar o tempo, o cuidado e as memórias que
      florescem em cada vaso.
    </p>
  </div>
</section>

        <section id="resumo" className="pb-16">
          <div className="mb-6">
            <p className="text-sm uppercase tracking-[0.35em] text-[#7b8f6a]">
              Resumo
            </p>
            <h2 className="mt-2 text-3xl font-semibold">Meu jardim em números</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <a
              href="/plantas"
              className="rounded-3xl border border-[#d8cbb8] bg-[#fffaf1] p-6 transition hover:bg-[#efe6d8]"
            >
              <p className="text-sm text-[#7b8f6a]">Plantas cadastradas</p>
              <strong className="mt-3 block text-4xl">{totalPlantas}</strong>
              <p className="mt-3 text-sm text-[#52624f]">
                Clique para ver todas as plantas.
              </p>
            </a>

            <div className="rounded-3xl border border-[#d8cbb8] bg-[#fffaf1] p-6">
              <p className="text-sm text-[#7b8f6a]">Espécies registradas</p>
              <strong className="mt-3 block text-4xl">
                {especiesRegistradas}
              </strong>
            </div>
          </div>
        </section>

        <section className="pb-16">
          <div className="rounded-[2rem] border border-[#d8cbb8] bg-[#fffaf1] p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.35em] text-[#7b8f6a]">
              Últimas
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              Últimas plantas cadastradas
            </h2>

            <div className="mt-6 space-y-3">
              {ultimasPlantas.length === 0 && (
                <p className="text-[#52624f]">
                  Nenhuma planta cadastrada ainda.
                </p>
              )}

              {ultimasPlantas.map((planta) => (
                <a
                  key={planta.id}
                  href={`/p/${planta.slug}`}
                  className="block rounded-2xl border border-[#d8cbb8] bg-white/60 px-4 py-3 transition hover:bg-[#efe6d8]"
                >
                  <strong>{planta.nome}</strong>
                  <p className="mt-1 text-sm text-[#7b8f6a]">
                    {planta.nome_cientifico || "Espécie ainda não informada"}
                  </p>
                </a>
              ))}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}