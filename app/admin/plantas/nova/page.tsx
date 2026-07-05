"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

function gerarSlug(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function NovaPlantaPage() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [nomeCientifico, setNomeCientifico] = useState("");
  const [categoria, setCategoria] = useState("");
  const [localizacao, setLocalizacao] = useState("");
  const [dataChegada, setDataChegada] = useState("");
  const [origem, setOrigem] = useState("");
  const [historia, setHistoria] = useState("");
  const [cuidados, setCuidados] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function salvarPlanta(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");

    if (!nome.trim()) {
      setErro("Informe o nome da planta.");
      return;
    }

    setSalvando(true);

    const slugBase = gerarSlug(nome);
    const slug = `${slugBase}-${Date.now().toString().slice(-5)}`;

    const { error } = await supabase.from("plantas").insert({
      slug,
      nome,
      nome_cientifico: nomeCientifico || null,
      categoria: categoria || null,
      localizacao: localizacao || null,
      data_chegada: dataChegada || null,
      origem: origem || null,
      historia: historia || null,
      cuidados: cuidados || null,
      observacoes: observacoes || null,
    });

    setSalvando(false);

    if (error) {
      setErro(error.message);
      return;
    }

    router.push(`/admin/plantas/${slug}/editar`);
  }

  return (
    <main className="min-h-screen bg-[#f6f1e8] px-6 py-8 text-[#263528]">
      <section className="mx-auto max-w-5xl">
        <header className="border-b border-[#d8cbb8] pb-6">
          <a href="/admin" className="text-sm font-medium text-[#557247]">
            ← Voltar ao painel
          </a>

          <p className="mt-8 text-sm uppercase tracking-[0.35em] text-[#7b8f6a]">
            Nova planta
          </p>

          <h1 className="mt-2 text-4xl font-semibold">Cadastrar nova planta</h1>

          <p className="mt-3 max-w-2xl leading-7 text-[#52624f]">
            Preencha as informações da planta. Depois de salva, ela terá uma
            página individual e poderá gerar um QR Code para impressão.
          </p>
        </header>

        {erro && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {erro}
          </div>
        )}

        <form onSubmit={salvarPlanta} className="mt-8 space-y-8">
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
                  placeholder="Ex: Rosa do deserto"
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
                  <option value="">Selecione</option>
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
                  placeholder="Conte a história dessa planta, de onde veio, qual lembrança ela carrega..."
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
            <h2 className="text-2xl font-semibold">Fotos</h2>

            <p className="mt-2 text-sm leading-6 text-[#66765e]">
              O envio real das imagens será conectado depois. Primeiro estamos
              salvando os dados principais da planta no banco.
            </p>

            <div className="mt-5 rounded-3xl border border-dashed border-[#b6a78f] bg-white/50 p-8 text-center">
              <p className="font-medium">Adicionar fotos da planta</p>
              <p className="mt-2 text-sm text-[#7b8f6a]">
                Em breve será possível enviar várias fotos e escolher a foto
                principal.
              </p>
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
              {salvando ? "Salvando..." : "Salvar planta"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}