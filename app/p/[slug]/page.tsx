import { supabase } from "@/app/lib/supabase";

type FotoFloracao = {
  id: string;
  url: string;
  legenda: string | null;
};

type Floracao = {
  id: string;
  data_floracao: string | null;
  titulo: string | null;
  descricao: string | null;
  fotos_plantas?: FotoFloracao[];
};

type Planta = {
  id: string;
  slug: string;
  nome: string;
  nome_cientifico: string | null;
  categoria: string | null;
  localizacao: string | null;
  historia: string | null;
  cuidados: string | null;
  foto_principal_url: string | null;
};

function formatarData(data: string | null) {
  if (!data) return "Sem data informada";

  return new Date(data + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function PlantaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: planta, error } = await supabase
    .from("plantas")
    .select(
      "id, slug, nome, nome_cientifico, categoria, localizacao, historia, cuidados, foto_principal_url"
    )
    .eq("slug", slug)
    .single<Planta>();

  if (error || !planta) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f1e8] px-6 text-[#263528]">
        <div className="max-w-2xl rounded-3xl border border-[#d8cbb8] bg-[#fffaf1] p-8 text-center shadow-sm">
          <h1 className="text-3xl font-semibold">Planta não encontrada</h1>

          <p className="mt-3 text-[#52624f]">
            Não encontramos nenhuma planta cadastrada com esse endereço.
          </p>

          <a
            href="/"
            className="mt-6 inline-block rounded-full bg-[#557247] px-6 py-3 text-sm font-semibold text-white"
          >
            Voltar ao site principal
          </a>
        </div>
      </main>
    );
  }

  const { data: floracoes } = await supabase
    .from("floracoes")
    .select(
      "id, data_floracao, titulo, descricao, fotos_plantas(id, url, legenda)"
    )
    .eq("planta_id", planta.id)
    .order("data_floracao", { ascending: false });

  const listaFloracoes = (floracoes || []) as Floracao[];

  const totalFotosFloracoes = listaFloracoes.reduce((total, floracao) => {
    return total + (floracao.fotos_plantas?.length || 0);
  }, 0);

  return (
    <main className="min-h-screen bg-[#f6f1e8] px-6 py-8 text-[#263528]">
      <section className="mx-auto max-w-4xl">
        <a href="/" className="text-sm font-medium text-[#557247]">
          ← Voltar ao site principal
        </a>

        <div className="mt-8 overflow-hidden rounded-[2rem] border border-[#d8cbb8] bg-[#fffaf1] shadow-sm">
          {planta.foto_principal_url ? (
            <img
              src={planta.foto_principal_url}
              alt={planta.nome}
              className="h-96 w-full object-cover"
            />
          ) : (
            <div className="h-72 bg-gradient-to-br from-[#dce7d2] via-[#f8ead7] to-[#c9d8b9]" />
          )}

          <div className="p-8">
            <p className="text-sm uppercase tracking-[0.35em] text-[#7b8f6a]">
              Site secundário da planta
            </p>

            <h1 className="mt-3 text-4xl font-semibold">{planta.nome}</h1>

            <p className="mt-2 text-lg italic text-[#66765e]">
              {planta.nome_cientifico || "Espécie ainda não informada"}
            </p>

            <p className="mt-6 text-lg leading-8 text-[#52624f]">
              {planta.historia ||
                "A história desta planta ainda não foi cadastrada."}
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-[#d8cbb8] bg-white/60 p-5">
                <p className="text-sm text-[#7b8f6a]">Tipo</p>
                <strong className="mt-2 block">
                  {planta.categoria || "Não informado"}
                </strong>
              </div>

              <div className="rounded-2xl border border-[#d8cbb8] bg-white/60 p-5">
                <p className="text-sm text-[#7b8f6a]">Local</p>
                <strong className="mt-2 block">
                  {planta.localizacao || "Não informado"}
                </strong>
              </div>

              <div className="rounded-2xl border border-[#d8cbb8] bg-white/60 p-5">
                <p className="text-sm text-[#7b8f6a]">Florações</p>
                <strong className="mt-2 block">
                  {listaFloracoes.length} registro(s)
                </strong>
              </div>
            </div>

            <section className="mt-10">
              <h2 className="text-2xl font-semibold">Cuidados</h2>
              <p className="mt-3 leading-7 text-[#52624f]">
                {planta.cuidados || "Os cuidados ainda não foram cadastrados."}
              </p>
            </section>

            <section className="mt-10">
              <h2 className="text-2xl font-semibold">
                Histórico de florações
              </h2>

              <p className="mt-2 text-sm text-[#7b8f6a]">
                {totalFotosFloracoes} foto(s) registradas em florações.
              </p>

              {listaFloracoes.length === 0 && (
                <div className="mt-4 rounded-3xl border border-dashed border-[#b6a78f] bg-white/50 p-8 text-center text-[#7b8f6a]">
                  Nenhuma floração cadastrada ainda.
                </div>
              )}

              <div className="mt-6 space-y-8">
                {listaFloracoes.map((floracao) => (
                  <article
                    key={floracao.id}
                    className="rounded-3xl border border-[#d8cbb8] bg-white/60 p-6"
                  >
                    <p className="text-sm uppercase tracking-[0.25em] text-[#7b8f6a]">
                      {formatarData(floracao.data_floracao)}
                    </p>

                    <h3 className="mt-3 text-2xl font-semibold">
                      {floracao.titulo || "Floração sem título"}
                    </h3>

                    {floracao.descricao && (
                      <p className="mt-3 leading-7 text-[#52624f]">
                        {floracao.descricao}
                      </p>
                    )}

                    {floracao.fotos_plantas &&
                    floracao.fotos_plantas.length > 0 ? (
                      <div className="mt-5 grid gap-4 md:grid-cols-3">
                        {floracao.fotos_plantas.map((foto) => (
                          <img
                            key={foto.id}
                            src={foto.url}
                            alt={floracao.titulo || planta.nome}
                            className="h-48 w-full rounded-2xl object-cover"
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-[#7b8f6a]">
                        Esta floração ainda não possui fotos.
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}