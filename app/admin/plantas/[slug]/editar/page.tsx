"use client";

import { QRCodeCanvas } from "qrcode.react";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
  data_chegada: string | null;
  origem: string | null;
  historia: string | null;
  cuidados: string | null;
  observacoes: string | null;
  foto_principal_url: string | null;
};

export default function EditarPlantaPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [salvandoFloracao, setSalvandoFloracao] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [plantaId, setPlantaId] = useState("");
  const [nome, setNome] = useState("");
  const [nomeCientifico, setNomeCientifico] = useState("");
  const [categoria, setCategoria] = useState("");
  const [localizacao, setLocalizacao] = useState("");
  const [dataChegada, setDataChegada] = useState("");
  const [origem, setOrigem] = useState("");
  const [historia, setHistoria] = useState("");
  const [cuidados, setCuidados] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [fotoPrincipalUrl, setFotoPrincipalUrl] = useState("");

  const [floracoes, setFloracoes] = useState<Floracao[]>([]);
  const [tituloFloracao, setTituloFloracao] = useState("");
  const [dataFloracao, setDataFloracao] = useState("");
  const [descricaoFloracao, setDescricaoFloracao] = useState("");
  const [fotosFloracao, setFotosFloracao] = useState<FileList | null>(null);

  const linkDaPlanta = `http://localhost:3000/p/${slug}`;

  useEffect(() => {
    carregarDados();
  }, [slug]);

  async function carregarDados() {
    setCarregando(true);
    setErro("");

    const { data, error } = await supabase
      .from("plantas")
      .select(
        "id, slug, nome, nome_cientifico, categoria, localizacao, data_chegada, origem, historia, cuidados, observacoes, foto_principal_url"
      )
      .eq("slug", slug)
      .single<Planta>();

    if (error || !data) {
      setErro(error?.message || "Planta não encontrada.");
      setCarregando(false);
      return;
    }

    setPlantaId(data.id);
    setNome(data.nome || "");
    setNomeCientifico(data.nome_cientifico || "");
    setCategoria(data.categoria || "");
    setLocalizacao(data.localizacao || "");
    setDataChegada(data.data_chegada || "");
    setOrigem(data.origem || "");
    setHistoria(data.historia || "");
    setCuidados(data.cuidados || "");
    setObservacoes(data.observacoes || "");
    setFotoPrincipalUrl(data.foto_principal_url || "");

    await carregarFloracoes(data.id);

    setCarregando(false);
  }

  async function carregarFloracoes(idDaPlanta: string) {
    const { data, error } = await supabase
      .from("floracoes")
      .select(
        "id, data_floracao, titulo, descricao, fotos_plantas(id, url, legenda)"
      )
      .eq("planta_id", idDaPlanta)
      .order("data_floracao", { ascending: false });

    if (error) {
      setErro(error.message);
      setFloracoes([]);
      return;
    }

    setFloracoes(data || []);
  }

  async function salvarAlteracoes(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setSucesso("");

    if (!nome.trim()) {
      setErro("Informe o nome da planta.");
      return;
    }

    setSalvando(true);

    const { error } = await supabase
      .from("plantas")
      .update({
        nome,
        nome_cientifico: nomeCientifico || null,
        categoria: categoria || null,
        localizacao: localizacao || null,
        data_chegada: dataChegada || null,
        origem: origem || null,
        historia: historia || null,
        cuidados: cuidados || null,
        observacoes: observacoes || null,
        foto_principal_url: fotoPrincipalUrl || null,
        atualizada_em: new Date().toISOString(),
      })
      .eq("slug", slug);

    setSalvando(false);

    if (error) {
      setErro(error.message);
      return;
    }

    setSucesso("Alterações salvas com sucesso.");
  }

  async function enviarFotoPrincipal(event: ChangeEvent<HTMLInputElement>) {
    const arquivo = event.target.files?.[0];

    if (!arquivo) return;

    setErro("");
    setSucesso("");
    setEnviandoFoto(true);

    const nomeSeguro = arquivo.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9.]/g, "-");

    const caminho = `${slug}/principal-${Date.now()}-${nomeSeguro}`;

    const { error: erroUpload } = await supabase.storage
      .from("fotos-plantas")
      .upload(caminho, arquivo, {
        cacheControl: "3600",
        upsert: false,
      });

    if (erroUpload) {
      setErro(erroUpload.message);
      setEnviandoFoto(false);
      return;
    }

    const { data } = supabase.storage
      .from("fotos-plantas")
      .getPublicUrl(caminho);

    const urlPublica = data.publicUrl;

    const { error: erroBanco } = await supabase
      .from("plantas")
      .update({
        foto_principal_url: urlPublica,
        atualizada_em: new Date().toISOString(),
      })
      .eq("slug", slug);

    setEnviandoFoto(false);

    if (erroBanco) {
      setErro(erroBanco.message);
      return;
    }

    setFotoPrincipalUrl(urlPublica);
    setSucesso("Foto principal enviada com sucesso.");
  }

  async function salvarNovaFloracao() {
    setErro("");
    setSucesso("");

    if (!plantaId) {
      setErro("Planta não carregada.");
      return;
    }

    if (!dataFloracao) {
      setErro("Informe a data da floração.");
      return;
    }

    setSalvandoFloracao(true);

    const { data: floracaoCriada, error: erroFloracao } = await supabase
      .from("floracoes")
      .insert({
        planta_id: plantaId,
        data_floracao: dataFloracao,
        titulo: tituloFloracao || null,
        descricao: descricaoFloracao || null,
      })
      .select("id")
      .single();

    if (erroFloracao || !floracaoCriada) {
      setErro(erroFloracao?.message || "Erro ao salvar floração.");
      setSalvandoFloracao(false);
      return;
    }

    const floracaoId = floracaoCriada.id;

    if (fotosFloracao && fotosFloracao.length > 0) {
      for (const arquivo of Array.from(fotosFloracao)) {
        const nomeSeguro = arquivo.name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9.]/g, "-");

        const caminho = `${slug}/floracoes/${floracaoId}/${Date.now()}-${nomeSeguro}`;

        const { error: erroUpload } = await supabase.storage
          .from("fotos-plantas")
          .upload(caminho, arquivo, {
            cacheControl: "3600",
            upsert: false,
          });

        if (erroUpload) {
          setErro(erroUpload.message);
          setSalvandoFloracao(false);
          return;
        }

        const { data } = supabase.storage
          .from("fotos-plantas")
          .getPublicUrl(caminho);

        const urlPublica = data.publicUrl;

        const { error: erroFoto } = await supabase
          .from("fotos_plantas")
          .insert({
            planta_id: plantaId,
            floracao_id: floracaoId,
            url: urlPublica,
            legenda: tituloFloracao || null,
            data_foto: dataFloracao,
            principal: false,
          });

        if (erroFoto) {
          setErro(erroFoto.message);
          setSalvandoFloracao(false);
          return;
        }
      }
    }

    setTituloFloracao("");
    setDataFloracao("");
    setDescricaoFloracao("");
    setFotosFloracao(null);
    setSucesso("Floração registrada com sucesso.");

    await carregarFloracoes(plantaId);

    setSalvandoFloracao(false);
  }
async function excluirFloracao(floracao: Floracao) {
  const confirmar = window.confirm(
    `Tem certeza que deseja excluir a floração "${floracao.titulo || "sem título"}"? Essa ação não poderá ser desfeita.`
  );

  if (!confirmar) return;

  setErro("");
  setSucesso("");

  const { error } = await supabase
    .from("floracoes")
    .delete()
    .eq("id", floracao.id);

  if (error) {
    setErro(error.message);
    return;
  }

  setSucesso("Floração excluída com sucesso.");

  if (plantaId) {
    await carregarFloracoes(plantaId);
  }
}
  function imprimirQRCode() {
    const canvas = document.getElementById(
      "qr-code-canvas"
    ) as HTMLCanvasElement | null;

    if (!canvas) {
      alert("QR Code não encontrado.");
      return;
    }

    const imagemQRCode = canvas.toDataURL("image/png");

    const janelaImpressao = window.open("", "_blank", "width=400,height=500");

    if (!janelaImpressao) {
      alert("Não foi possível abrir a janela de impressão.");
      return;
    }

    janelaImpressao.document.write(`
      <html>
        <head>
          <title>Imprimir QR Code</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              background: white;
            }

            img {
              width: 220px;
              height: 220px;
            }

            @media print {
              body {
                padding: 0;
              }

              img {
                width: 220px;
                height: 220px;
              }
            }
          </style>
        </head>
        <body>
          <img src="${imagemQRCode}" />
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);

    janelaImpressao.document.close();
  }

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f1e8] px-6 text-[#263528]">
        <div className="rounded-3xl border border-[#d8cbb8] bg-[#fffaf1] p-8 shadow-sm">
          Carregando planta...
        </div>
      </main>
    );
  }

  if (erro && !nome) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f1e8] px-6 text-[#263528]">
        <div className="rounded-3xl border border-[#d8cbb8] bg-[#fffaf1] p-8 text-center shadow-sm">
          <h1 className="text-3xl font-semibold">Planta não encontrada</h1>
          <p className="mt-3 text-[#52624f]">
            Não foi possível carregar esta planta.
          </p>
          <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
            {erro}
          </p>
          <a
            href="/admin"
            className="mt-6 inline-block rounded-full bg-[#557247] px-6 py-3 text-sm font-semibold text-white"
          >
            Voltar ao painel
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f1e8] px-6 py-8 text-[#263528]">
      <section className="mx-auto max-w-5xl">
        <header className="border-b border-[#d8cbb8] pb-6">
          <a href="/admin" className="text-sm font-medium text-[#557247]">
            ← Voltar ao painel
          </a>

          <p className="mt-8 text-sm uppercase tracking-[0.35em] text-[#7b8f6a]">
            Editar planta
          </p>

          <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-semibold">{nome}</h1>
              <p className="mt-3 max-w-2xl leading-7 text-[#52624f]">
                Edite as informações da planta, registre florações, adicione
                fotos e gere o QR Code para a etiqueta.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={`/p/${slug}`}
                className="rounded-full border border-[#b6a78f] px-5 py-3 text-sm font-semibold text-[#465f3b] transition hover:bg-[#efe6d8]"
              >
                Ver página
              </a>

              <a
                href="#qrcode"
                className="rounded-full bg-[#557247] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#465f3b]"
              >
                Ver QR Code
              </a>
            </div>
          </div>
        </header>

        {erro && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {erro}
          </div>
        )}

        {sucesso && (
          <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {sucesso}
          </div>
        )}

        <form onSubmit={salvarAlteracoes} className="mt-8 space-y-8">
          <section className="rounded-[2rem] border border-[#d8cbb8] bg-[#fffaf1] p-6 shadow-sm">
            <h2 className="text-2xl font-semibold">Informações principais</h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Nome da planta
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full rounded-2xl border border-[#d8cbb8] bg-white px-4 py-3 outline-none transition focus:border-[#557247]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Nome científico
                </label>
                <input
                  type="text"
                  value={nomeCientifico}
                  onChange={(e) => setNomeCientifico(e.target.value)}
                  placeholder="Ex: Adenium obesum"
                  className="w-full rounded-2xl border border-[#d8cbb8] bg-white px-4 py-3 outline-none transition focus:border-[#557247]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Tipo / categoria
                </label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full rounded-2xl border border-[#d8cbb8] bg-white px-4 py-3 outline-none transition focus:border-[#557247]"
                >
                  <option value="">Não informado</option>
                  <option>Orquídea</option>
                  <option>Suculenta</option>
                  <option>Cacto</option>
                  <option>Folhagem</option>
                  <option>Rosa do deserto</option>
                  <option>Florífera</option>
                  <option>Outra</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Local onde fica
                </label>
                <input
                  type="text"
                  value={localizacao}
                  onChange={(e) => setLocalizacao(e.target.value)}
                  placeholder="Ex: varanda, sala, jardim"
                  className="w-full rounded-2xl border border-[#d8cbb8] bg-white px-4 py-3 outline-none transition focus:border-[#557247]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Data de chegada
                </label>
                <input
                  type="date"
                  value={dataChegada}
                  onChange={(e) => setDataChegada(e.target.value)}
                  className="w-full rounded-2xl border border-[#d8cbb8] bg-white px-4 py-3 outline-none transition focus:border-[#557247]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Origem da planta
                </label>
                <input
                  type="text"
                  value={origem}
                  onChange={(e) => setOrigem(e.target.value)}
                  placeholder="Ex: presente, muda, comprada"
                  className="w-full rounded-2xl border border-[#d8cbb8] bg-white px-4 py-3 outline-none transition focus:border-[#557247]"
                />
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-[#d8cbb8] bg-[#fffaf1] p-6 shadow-sm">
            <h2 className="text-2xl font-semibold">História e cuidados</h2>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  História da planta
                </label>
                <textarea
                  rows={6}
                  value={historia}
                  onChange={(e) => setHistoria(e.target.value)}
                  className="w-full rounded-2xl border border-[#d8cbb8] bg-white px-4 py-3 outline-none transition focus:border-[#557247]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Cuidados
                </label>
                <textarea
                  rows={4}
                  value={cuidados}
                  onChange={(e) => setCuidados(e.target.value)}
                  placeholder="Ex: gosta de sol da manhã, regar duas vezes por semana..."
                  className="w-full rounded-2xl border border-[#d8cbb8] bg-white px-4 py-3 outline-none transition focus:border-[#557247]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Observações
                </label>
                <textarea
                  rows={4}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Anotações gerais sobre a planta"
                  className="w-full rounded-2xl border border-[#d8cbb8] bg-white px-4 py-3 outline-none transition focus:border-[#557247]"
                />
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-[#d8cbb8] bg-[#fffaf1] p-6 shadow-sm">
            <h2 className="text-2xl font-semibold">Foto principal</h2>

            {fotoPrincipalUrl && (
              <div className="mt-5 overflow-hidden rounded-3xl border border-[#d8cbb8] bg-white">
                <img
                  src={fotoPrincipalUrl}
                  alt={nome}
                  className="h-80 w-full object-cover"
                />
              </div>
            )}

            <div className="mt-5 rounded-3xl border border-dashed border-[#b6a78f] bg-white/50 p-8 text-center">
              <label className="cursor-pointer">
                <span className="rounded-full bg-[#557247] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#465f3b]">
                  {enviandoFoto ? "Enviando..." : "Enviar foto principal"}
                </span>

                <input
                  type="file"
                  accept="image/*"
                  onChange={enviarFotoPrincipal}
                  disabled={enviandoFoto}
                  className="hidden"
                />
              </label>
            </div>
          </section>

          <section className="rounded-[2rem] border border-[#d8cbb8] bg-[#fffaf1] p-6 shadow-sm">
            <h2 className="text-2xl font-semibold">Nova floração</h2>

            <p className="mt-2 text-sm leading-6 text-[#66765e]">
              Registre uma floração e envie as fotos daquele período.
            </p>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Data da floração
                </label>
                <input
                  type="date"
                  value={dataFloracao}
                  onChange={(e) => setDataFloracao(e.target.value)}
                  className="w-full rounded-2xl border border-[#d8cbb8] bg-white px-4 py-3 outline-none transition focus:border-[#557247]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Título
                </label>
                <input
                  type="text"
                  value={tituloFloracao}
                  onChange={(e) => setTituloFloracao(e.target.value)}
                  placeholder="Ex: Floração de janeiro"
                  className="w-full rounded-2xl border border-[#d8cbb8] bg-white px-4 py-3 outline-none transition focus:border-[#557247]"
                />
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium">
                Descrição
              </label>
              <textarea
                rows={4}
                value={descricaoFloracao}
                onChange={(e) => setDescricaoFloracao(e.target.value)}
                placeholder="Ex: Primeira floração depois do replantio..."
                className="w-full rounded-2xl border border-[#d8cbb8] bg-white px-4 py-3 outline-none transition focus:border-[#557247]"
              />
            </div>

            <div className="mt-5 rounded-3xl border border-dashed border-[#b6a78f] bg-white/50 p-8 text-center">
              <label className="cursor-pointer">
                <span className="rounded-full border border-[#b6a78f] px-5 py-3 text-sm font-semibold text-[#465f3b] transition hover:bg-[#efe6d8]">
                  Selecionar fotos da floração
                </span>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setFotosFloracao(e.target.files)}
                  className="hidden"
                />
              </label>

              <p className="mt-4 text-sm text-[#7b8f6a]">
                {fotosFloracao
                  ? `${fotosFloracao.length} foto(s) selecionada(s)`
                  : "Você pode selecionar várias fotos."}
              </p>
            </div>

            <button
              type="button"
              onClick={salvarNovaFloracao}
              disabled={salvandoFloracao}
              className="mt-5 rounded-full bg-[#557247] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#465f3b] disabled:opacity-60"
            >
              {salvandoFloracao ? "Salvando floração..." : "Salvar floração"}
            </button>
          </section>

          <section className="rounded-[2rem] border border-[#d8cbb8] bg-[#fffaf1] p-6 shadow-sm">
            <h2 className="text-2xl font-semibold">Histórico de florações</h2>

            {floracoes.length === 0 && (
              <p className="mt-4 text-[#52624f]">
                Nenhuma floração cadastrada ainda.
              </p>
            )}

            <div className="mt-6 space-y-6">
              {floracoes.map((floracao) => (
                <div
                  key={floracao.id}
                  className="rounded-3xl border border-[#d8cbb8] bg-white/60 p-5"
                >
                  <p className="text-sm text-[#7b8f6a]">
                    {floracao.data_floracao || "Sem data informada"}
                  </p>

                  <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
  <h3 className="text-xl font-semibold">
    {floracao.titulo || "Floração sem título"}
  </h3>

  <button
    type="button"
    onClick={() => excluirFloracao(floracao)}
    className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
  >
    Excluir floração
  </button>
</div>

                  {floracao.descricao && (
                    <p className="mt-3 leading-7 text-[#52624f]">
                      {floracao.descricao}
                    </p>
                  )}

                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    {floracao.fotos_plantas?.map((foto) => (
                      <img
                        key={foto.id}
                        src={foto.url}
                        alt={floracao.titulo || nome}
                        className="h-40 w-full rounded-2xl object-cover"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section
            id="qrcode"
            className="rounded-[2rem] border border-[#d8cbb8] bg-[#fffaf1] p-6 shadow-sm"
          >
            <h2 className="text-2xl font-semibold">QR Code</h2>

            <p className="mt-3 leading-7 text-[#52624f]">
              Este QR Code aponta para o site secundário desta planta.
            </p>

            <div className="mt-6 grid gap-6 md:grid-cols-[260px_1fr] md:items-center">
              <div className="flex justify-center rounded-3xl border border-[#d8cbb8] bg-white p-6">
                <QRCodeCanvas id="qr-code-canvas" value={linkDaPlanta} size={220} />
              </div>

              <div>
                <p className="text-sm text-[#7b8f6a]">Link da planta</p>
                <strong className="mt-2 block break-all">{linkDaPlanta}</strong>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={imprimirQRCode}
                    className="rounded-full bg-[#557247] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#465f3b]"
                  >
                    Imprimir QR Code
                  </button>

                  <a
                    href={linkDaPlanta}
                    className="rounded-full border border-[#b6a78f] px-5 py-3 text-sm font-semibold text-[#465f3b] transition hover:bg-[#efe6d8]"
                  >
                    Abrir página
                  </a>
                </div>
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-3 pb-10 md:flex-row md:justify-end">
            <a
              href="/admin"
              className="rounded-full border border-[#b6a78f] px-6 py-3 text-center text-sm font-semibold text-[#465f3b] transition hover:bg-[#efe6d8]"
            >
              Cancelar
            </a>

            <button
              type="submit"
              disabled={salvando}
              className="rounded-full bg-[#557247] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#465f3b] disabled:opacity-60"
            >
              {salvando ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}