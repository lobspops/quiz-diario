"use strict";

/* ============================================================
   LEITOR DE ARQUIVOS
   Lê o texto dentro do próprio navegador. Nada é enviado.
   ============================================================ */
const PDFJS = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/";
const TESSERACT = "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js";
const MAXIMO_ARQUIVO = 80 * 1024 * 1024;
const MAXIMO_TEXTO = 400000;
const MAXIMO_OCR = 15; // páginas ou imagens por arquivo

const programas = {};
function carregarPrograma(url) {
  if (!programas[url]) {
    programas[url] = new Promise((pronto, falha) => {
      const s = document.createElement("script");
      s.src = url;
      s.onload = pronto;
      s.onerror = () => { delete programas[url]; s.remove(); falha(new Error("sem internet para carregar o leitor")); };
      document.head.append(s);
    });
  }
  return programas[url];
}

const extensao = (nome) => (nome.match(/\.([a-z0-9]+)$/i) || ["", ""])[1].toLowerCase();
const EH_IMAGEM = /^(png|jpe?g|webp|bmp)$/;

async function lerArquivo(arquivo, aviso) {
  const tipo = extensao(arquivo.name);
  if (arquivo.size > MAXIMO_ARQUIVO) throw new Error("arquivo grande demais (limite de 80 MB)");
  let texto;
  if (tipo === "pdf") texto = await lerPdf(arquivo, aviso);
  else if (tipo === "docx" || tipo === "pptx") texto = await lerOffice(arquivo, tipo, aviso);
  else if (tipo === "txt" || tipo === "md") texto = await arquivo.text();
  else if (EH_IMAGEM.test(tipo)) texto = await lerImagens([arquivo], aviso);
  else if (tipo === "doc" || tipo === "ppt") throw new Error("formato antigo: salve como ." + tipo + "x");
  else throw new Error("tipo de arquivo não lido");
  return texto.slice(0, MAXIMO_TEXTO);
}

/* ---------- PDF ---------- */
async function lerPdf(arquivo, aviso) {
  aviso("lendo PDF…");
  await carregarPrograma(PDFJS + "pdf.min.js");
  pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + "pdf.worker.min.js";
  const tarefa = pdfjsLib.getDocument({ data: await arquivo.arrayBuffer(), isEvalSupported: false });
  const pdf = await tarefa.promise;
  try {
    const paginas = Math.min(pdf.numPages, 300);
    const partes = [];
    const vazias = [];
    let tamanho = 0;
    for (let n = 1; n <= paginas && tamanho < MAXIMO_TEXTO; n++) {
      if (n % 10 === 0) aviso("lendo página " + n + " de " + paginas + "…");
      const pagina = await pdf.getPage(n);
      const itens = (await pagina.getTextContent()).items;
      const texto = itens.map((i) => i.str + (i.hasEOL ? "\n" : " ")).join("");
      if (texto.replace(/\s/g, "").length < 15) vazias.push(n);
      partes.push(texto);
      tamanho += texto.length;
    }
    // PDF escaneado: quase nenhuma página tem texto.
    if (vazias.length > paginas / 2) {
      const imagens = [];
      for (const n of vazias.slice(0, MAXIMO_OCR)) {
        const pagina = await pdf.getPage(n);
        const base = pagina.getViewport({ scale: 1 });
        const viewport = pagina.getViewport({ scale: Math.min(3, 1600 / base.width) });
        const tela = document.createElement("canvas");
        tela.width = Math.ceil(viewport.width);
        tela.height = Math.ceil(viewport.height);
        await pagina.render({ canvasContext: tela.getContext("2d"), viewport }).promise;
        imagens.push(await new Promise((ok) => tela.toBlob(ok, "image/png")));
      }
      partes.push(await lerImagens(imagens, aviso));
    }
    return partes.join("\n");
  } finally {
    tarefa.destroy();
  }
}

/* ---------- Word e PowerPoint (são arquivos zip com XML) ---------- */
async function lerOffice(arquivo, tipo, aviso) {
  aviso(tipo === "docx" ? "lendo Word…" : "lendo PowerPoint…");
  const zip = await abrirZip(arquivo);
  const querTexto = tipo === "docx"
    ? /^word\/(document|footnotes|header\d*)\.xml$/
    : /^ppt\/(slides\/slide|notesSlides\/notesSlide)\d+\.xml$/;
  const nomes = Object.keys(zip).filter((n) => querTexto.test(n))
    .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
  if (!nomes.length) throw new Error("arquivo danificado ou protegido por senha");
  const partes = [];
  for (const nome of nomes) {
    const xml = new TextDecoder().decode(await zip[nome](20 * 1024 * 1024));
    const doc = new DOMParser().parseFromString(xml, "application/xml");
    for (const paragrafo of doc.querySelectorAll("p")) {
      const texto = [...paragrafo.getElementsByTagNameNS("*", "t")].map((t) => t.textContent).join("");
      if (texto.trim()) partes.push(texto);
    }
  }
  const texto = partes.join("\n");
  // Slides feitos só de imagens: tenta ler o texto delas.
  if (texto.length < 200) {
    const fotos = Object.keys(zip).filter((n) => /\/media\//.test(n) && EH_IMAGEM.test(extensao(n))).slice(0, MAXIMO_OCR);
    const imagens = [];
    for (const nome of fotos) imagens.push(new Blob([await zip[nome](20 * 1024 * 1024)]));
    if (imagens.length) return texto + "\n" + await lerImagens(imagens, aviso);
  }
  return texto;
}

// Devolve { nome: função que entrega os bytes }.
async function abrirZip(arquivo) {
  const bytes = new Uint8Array(await arquivo.arrayBuffer());
  const dados = new DataView(bytes.buffer);
  let fim = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 66000); i--) {
    if (dados.getUint32(i, true) === 0x06054b50) { fim = i; break; }
  }
  if (fim < 0) throw new Error("arquivo danificado ou protegido por senha");
  const total = dados.getUint16(fim + 10, true);
  let p = dados.getUint32(fim + 16, true);
  const entradas = {};
  for (let i = 0; i < total && p + 46 <= bytes.length && dados.getUint32(p, true) === 0x02014b50; i++) {
    const metodo = dados.getUint16(p + 10, true);
    const comprimido = dados.getUint32(p + 20, true);
    const tamNome = dados.getUint16(p + 28, true);
    const local = dados.getUint32(p + 42, true);
    const nome = new TextDecoder().decode(bytes.subarray(p + 46, p + 46 + tamNome));
    p += 46 + tamNome + dados.getUint16(p + 30, true) + dados.getUint16(p + 32, true);
    entradas[nome] = async (limite) => {
      const inicio = local + 30 + dados.getUint16(local + 26, true) + dados.getUint16(local + 28, true);
      const cru = bytes.subarray(inicio, inicio + comprimido);
      if (metodo === 0) return cru;
      if (metodo !== 8) throw new Error("compactação não suportada");
      const leitor = new Blob([cru]).stream().pipeThrough(new DecompressionStream("deflate-raw")).getReader();
      const pedacos = [];
      let tamanho = 0;
      for (;;) {
        const { done, value } = await leitor.read();
        if (done) break;
        tamanho += value.length;
        if (tamanho > limite) { leitor.cancel(); throw new Error("conteúdo grande demais"); }
        pedacos.push(value);
      }
      return new Uint8Array(await new Blob(pedacos).arrayBuffer());
    };
  }
  return entradas;
}

/* ---------- Imagens com texto ---------- */
async function lerImagens(imagens, aviso) {
  aviso("preparando leitor de imagem…");
  await carregarPrograma(TESSERACT);
  const operario = await Tesseract.createWorker("por");
  try {
    const partes = [];
    for (let i = 0; i < imagens.length; i++) {
      aviso("lendo imagem " + (i + 1) + " de " + imagens.length + "…");
      try { partes.push((await operario.recognize(imagens[i])).data.text); }
      catch (e) { /* imagem ilegível: pula */ }
    }
    return partes.join("\n");
  } finally {
    operario.terminate();
  }
}

/* ============================================================
   TEMAS A PARTIR DO TEXTO
   ============================================================ */
const regraDe = (termo) => new RegExp("(^|[^a-z0-9])" + termo.replace(/[^a-z0-9 -]/g, "") + (termo.length <= 4 ? "(?![a-z0-9])" : ""), "g");

function contarNoTexto(texto, termo) { return (texto.match(regraDe(termo)) || []).length; }

// Acha termos do vocabulário e palavras frequentes fora dele.
function acharTermos(textoOriginal) {
  const texto = semAcento(textoOriginal).replace(/-\n/g, "").replace(/\s+/g, " ");
  const conhecidos = VOCABULARIO.map((v) => ({
    ...v,
    vezes: v.pt.reduce((s, t) => s + contarNoTexto(texto, t), 0) || contarNoTexto(texto, v.en),
  })).filter((v) => v.vezes > 0).sort((a, b) => b.vezes - a.vezes);

  // Em texto longo, uma menção solta não faz um tema.
  const minimo = texto.length > 8000 ? 2 : 1;
  const bons = conhecidos.filter((v) => v.vezes >= minimo).slice(0, 18);

  const frequencia = {};
  for (const palavra of texto.match(/[a-z]{7,}/g) || []) {
    if (!PALAVRAS_VAZIAS.has(palavra) && !/mente$|coes$|ndo$/.test(palavra)) frequencia[palavra] = (frequencia[palavra] || 0) + 1;
  }
  const raizes = VOCABULARIO.flatMap((v) => v.pt);
  const livres = Object.entries(frequencia)
    .filter(([palavra, vezes]) => vezes >= 4 && !raizes.some((r) => palavra.startsWith(r) || r.split(" ").some((x) => x.length > 4 && palavra.startsWith(x))))
    .sort((a, b) => b[1] - a[1]).slice(0, 6).map(([palavra]) => palavra);

  return { bons, livres, texto };
}

/* Nome de disciplina -> grupo do vocabulário. */
const GRUPO_PELO_NOME = {
  oclusao: ["oclus", "dtm"], anatomia: ["anatomia"], radiologia: ["radiolog", "imaginolog"],
  estomatologia: ["estomatolog", "semiolog", "diagnostico bucal", "diagnostico oral"], patologia: ["patolog"],
  fisiologia: ["fisiolog"], histologia: ["histolog", "embriolog"], dentistica: ["dentistica", "cariolog", "materiais dentarios"],
  endodontia: ["endodont"], periodontia: ["periodont"], protese: ["protese", "reabilitacao oral", "implantodont"],
  cirurgia: ["cirurgia", "bucomaxilo", "traumatolog"], farmacologia: ["farmaco", "anestesiolog", "terapeutica"],
  ortodontia: ["ortodont"], odontopediatria: ["odontopediatr", "pediatr"], microbiologia: ["microbiolog", "imunolog"],
  saudecoletiva: ["saude coletiva", "saude publica", "epidemiolog", "preventiva"]
};
const guardadoNome = new Map();

// Temas tirados só dos nomes, sem precisar ler nenhum arquivo.
function temasDoNome(materia) {
  const limpo = (t) => semAcento(t).replace(/\.[a-z0-9]{2,4}$/, "").replace(/[_.-]+/g, " ");
  const nome = limpo(materia.nome || "");
  const tudo = [nome, ...(materia.materiais || []).map(limpo)].join(" . ");
  if (!guardadoNome.has(tudo)) {
    const achados = VOCABULARIO.filter((v) => v.pt.some((t) => contarNoTexto(tudo, t)));
    const grupos = Object.keys(GRUPO_PELO_NOME).filter((g) => GRUPO_PELO_NOME[g].some((t) => contarNoTexto(nome, t)));
    const doGrupo = TEMAS_PADRAO[materia.id] ? [] : VOCABULARIO.filter((v) => grupos.includes(v.grupo)).slice(0, 25);
    const todos = [...new Set([...achados, ...doGrupo])];
    guardadoNome.set(tudo, {
      en: todos.map((v) => v.en),
      pt: todos.map((v) => v.pt[0]),
      areas: todos.length ? ["Dental", ...grupos.map((g) => AREA_DO_GRUPO[g]).filter(Boolean)] : []
    });
  }
  return guardadoNome.get(tudo);
}

let tradutorVolta = null;
async function paraIngles(palavras, original) {
  if (!palavras.length || !temTradutor()) return [];
  try {
    if (!tradutorVolta) {
      tradutorVolta = comLimite(Translator.create({ sourceLanguage: "pt", targetLanguage: "en" }), 20000)
        .catch(() => { tradutorVolta = null; return null; });
    }
    const t = await tradutorVolta;
    if (!t) return [];
    const saida = [];
    for (const palavra of palavras) {
      // usa a forma com acento, que traduz melhor
      const comAcento = (original.match(/[\p{L}]{7,}/gu) || []).find((p) => semAcento(p) === palavra) || palavra;
      const en = (await comLimite(t.translate(comAcento.toLowerCase()), 15000)).toLowerCase().trim();
      if (/^[a-z][a-z -]{3,30}$/.test(en) && en !== palavra) saida.push(en);
    }
    return saida;
  } catch (e) { return []; }
}

const AREA_DO_GRUPO = { anatomia: "Anatomy", patologia: "Pathology", fisiologia: "Physiology" };

// Devolve { en, pt, areas } só com termos que trazem questões.
async function temasDoTexto(textoOriginal, aviso) {
  const { bons, livres } = acharTermos(textoOriginal);
  aviso("escolhendo temas…");
  const candidatos = bons.map((v) => v.en).concat(await paraIngles(livres, textoOriginal));

  const areas = ["Dental"];
  for (const [grupo, area] of Object.entries(AREA_DO_GRUPO)) {
    const quantos = bons.filter((v) => v.grupo === grupo).length;
    if (quantos >= 2 && quantos / bons.length >= 0.4) areas.push(area);
  }

  const contagens = banco.contagens || (banco.contagens = {});
  const en = [];
  const fila = [...new Set(limparPalavras(candidatos))];
  await Promise.all([0, 1, 2].map(async () => {
    while (fila.length) {
      const termo = fila.shift();
      if (!(termo in contagens)) {
        try { contagens[termo] = await contarIngles({ en: [termo], areas: ["Dental"] }); }
        catch (e) { en.push(termo); continue; } // sem resposta: mantém sem testar
      }
      const n = contagens[termo];
      const daArea = areas.length > 1 && bons.some((v) => v.en === termo && AREA_DO_GRUPO[v.grupo]);
      if ((n > 0 && n <= 1500) || (n === 0 && daArea)) en.push(termo);
    }
  }));
  guardar(CHAVE_BANCO, banco);
  const ordem = limparPalavras(candidatos);
  en.sort((a, b) => ordem.indexOf(a) - ordem.indexOf(b));
  const pt = bons.flatMap((v) => v.pt.filter((t) => contarNoTexto(semAcento(textoOriginal), t)).slice(0, 1)).concat(livres.slice(0, 3));
  return { en, pt: limparPalavras(pt), areas };
}
