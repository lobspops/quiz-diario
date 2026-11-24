"use strict";

/* ============================================================
   BANCOS ABERTOS DE QUESTÕES E TRADUÇÃO
   Nada aqui usa o Claude nem precisa de senha.

   MedMCQA      inglês, provas de seleção para pós na Índia, Apache 2.0
   HealthQA-BR  português, provas do Enare, CC BY 4.0
   ============================================================ */
const ORIGENS = {
  medmcqa: { nome: "MedMCQA (provas de pós da Índia, Apache 2.0)", url: "https://huggingface.co/datasets/openlifescienceai/medmcqa" },
  healthqa: { nome: "HealthQA-BR (Enare, D'addario 2025, CC BY 4.0)", url: "https://huggingface.co/datasets/Larxel/healthqa-br" }
};

const AREAS = [
  ["Dental", "odontologia"], ["Anatomy", "anatomia"], ["Pathology", "patologia"],
  ["Physiology", "fisiologia"], ["Radiology", "radiologia"]
];

/* Palavras usadas na busca de cada matéria. Dá para editar pelo app. */
const TEMAS_PADRAO = {
  oclusao: {
    areas: ["Dental"],
    en: ["occlus", "temporomandibular", "tmj", "condyl", "centric", "bruxism", "articulator", "intercusp", "masticat"],
    pt: ["oclus", "temporomandib", "dtm", "bruxismo", "mastiga", "côndilo", "articulador"]
  },
  anatomia: {
    areas: ["Dental", "Anatomy"],
    en: ["facial nerve", "trigeminal", "mandibular", "maxillary", "tongue", "parotid", "pterygo", "masseter", "palate", "pharyn", "carotid", "cranial nerve", "infratemporal"],
    pt: ["nervo", "artéria", "músculo", "forame", "viscerocrânio", "mandíbula", "maxila"]
  },
  radiologia: {
    areas: ["Dental"],
    en: ["radiograph", "x-ray", "film", "opg", "panoramic", "cbct", "bitewing", "radiolucen", "radiopa"],
    pt: ["radiogr", "tomogr", "panorâmica", "radiolog"]
  },
  estomatologia: {
    areas: ["Dental"],
    en: ["leukoplakia", "lichen planus", "ulcer", "candid", "pemphig", "submucous", "mucosa", "vesic", "aphth", "oral lesion", "oral cancer"],
    pt: ["mucosa", "úlcera", "leucoplas", "candid", "líquen", "câncer de boca", "lesão bucal"]
  },
  patologia: {
    areas: ["Dental", "Pathology"],
    en: ["cyst", "ameloblast", "odontogenic", "odontoma", "dysplasia", "oral carcinoma", "giant cell", "necrosis", "inflammation", "metaplasia"],
    pt: ["cisto", "tumor", "neoplas", "carcinoma", "ameloblast", "patolog"]
  },
  fisiologia: {
    areas: ["Dental", "Physiology"],
    en: ["saliva", "taste", "masticat", "swallow", "deglutition", "gingival fluid", "crevicular fluid", "dentinal fluid", "odontoblast", "gustat", "jaw reflex", "jaw jerk"],
    pt: ["saliva", "fisiolog", "hemost", "deglut"]
  }
};

// Termos tirados dos arquivos da matéria, menos os que a pessoa apagou.
function temaAutomatico(materia) {
  const lidos = Object.values(materia.lidos || {});
  const fora = materia.removidas || { en: [], pt: [] };
  // Poucos termos nos arquivos: usa também o nome da matéria e dos arquivos.
  // (As matérias de fábrica já têm palavras padrão e não precisam disso.)
  if (!TEMAS_PADRAO[materia.id] && new Set(lidos.flatMap((l) => l.en || [])).size < 3) lidos.push(temasDoNome(materia));
  const juntar = (campo) => [...new Set(lidos.flatMap((l) => l[campo] || []))].filter((t) => !fora[campo].includes(t));
  const areas = [...new Set(lidos.flatMap((l) => l.areas || []))];
  return { en: juntar("en"), pt: juntar("pt"), areas };
}

// O que foi digitado vem primeiro; depois, os arquivos. As palavras
// padrão só entram quando os arquivos ainda dizem pouco.
function temaDe(materia) {
  const padrao = TEMAS_PADRAO[materia.id] || { areas: ["Dental"], en: [], pt: [] };
  const auto = temaAutomatico(materia);
  const manual = materia.tema;
  const usaPadrao = !manual && (auto.en.length < 3 || materia.completar);
  const base = manual || (usaPadrao ? padrao : { en: [], pt: [] });
  return {
    en: limparPalavras([...(base.en || []), ...auto.en]),
    pt: limparPalavras([...(base.pt || []), ...auto.pt]),
    areas: (manual && manual.areas && manual.areas.length && manual.areas) || (auto.areas.length && !usaPadrao ? auto.areas : [...new Set([...padrao.areas, ...auto.areas])])
  };
}

/* ============================================================
   BUSCA
   ============================================================ */
const CHAVE_BANCO = "quiz-diario-banco-v1";
const SERVIDOR = "https://datasets-server.huggingface.co/filter";
const PAGINA = 100;
const MAXIMO_GUARDADO = 300;

let banco = lerGuardado(CHAVE_BANCO, {});

function lerGuardado(chave, padrao) {
  try { return JSON.parse(localStorage.getItem(chave)) || padrao; }
  catch (e) { return padrao; }
}
function guardar(chave, valor) {
  try { localStorage.setItem(chave, JSON.stringify(valor)); return true; }
  catch (e) { return false; } // sem espaço: segue só na memória
}

async function consultar(dataset, onde, inicio, quantos) {
  const url = SERVIDOR + "?" + new URLSearchParams({
    dataset, config: "default", split: "train", where: onde, offset: inicio, length: quantos
  });
  const resposta = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!resposta.ok) throw new Error("banco respondeu " + resposta.status);
  return resposta.json();
}

// Só letras, números, espaço e hífen: o que sobra não quebra a consulta.
function limparPalavras(lista) {
  return [...new Set(lista.map((p) => String(p).normalize("NFC").replace(/[^\p{L}\p{N} -]/gu, " ").replace(/\s+/g, " ").trim().toLowerCase()))]
    .filter((p) => p.length >= 2).slice(0, 40);
}

function filtroIngles(tema) {
  const palavras = limparPalavras(tema.en);
  const areas = tema.areas.filter((a) => AREAS.some(([id]) => id === a));
  if (!palavras.length || !areas.length) return null;
  return "(" + areas.map((a) => `"subject_name"='${a}'`).join(" OR ") + ") AND (" +
    palavras.map((p) => `"question" ILIKE '%${p}%'`).join(" OR ") + ")";
}

async function contarIngles(tema) {
  const onde = filtroIngles(tema);
  if (!onde) return 0;
  return (await consultar("openlifescienceai/medmcqa", onde, 0, 1)).num_rows_total;
}

function converterIngles(linha) {
  const opcoes = [linha.opa, linha.opb, linha.opc, linha.opd].map((o) => String(o ?? "").trim());
  const pergunta = String(linha.question ?? "").trim();
  const unicas = new Set(opcoes.map((o) => o.toLowerCase()));
  const pedeImagem = /\b(image|figure|picture|photograph|diagram|shown (below|above|in|here))\b/i.test(pergunta);
  if (pergunta.length < 12 || unicas.size < 4 || unicas.has("") || !(linha.cop in opcoes) || pedeImagem) return null;
  const explicacao = String(linha.exp ?? "").trim();
  return {
    chave: "mm|" + linha.id, origem: "medmcqa", ingles: true, letras: true, pergunta, opcoes,
    certa: opcoes[linha.cop],
    explicacao: explicacao.length > 1200 ? explicacao.slice(0, 1200) + "…" : explicacao
  };
}

// Devolve questões em inglês do tema, buscando mais quando faltam inéditas.
async function questoesIngles(materia, jaVista, quantas) {
  const onde = filtroIngles(temaDe(materia));
  if (!onde) return { lista: [], falhou: false };
  const caixa = banco[onde] || (banco[onde] = { total: null, proxima: 0, lista: [] });
  const ineditas = () => caixa.lista.filter((q) => !jaVista(q.chave)).length;
  let falhou = false;

  for (let tentativa = 0; tentativa < 4 && ineditas() < quantas; tentativa++) {
    const paginas = caixa.total === null ? 1 : Math.ceil(caixa.total / PAGINA);
    if (caixa.total !== null && tentativa >= paginas) break;
    try {
      const dados = await consultar("openlifescienceai/medmcqa", onde, caixa.proxima * PAGINA, PAGINA);
      caixa.total = dados.num_rows_total;
      caixa.proxima = (caixa.proxima + 1) % Math.max(1, Math.ceil(caixa.total / PAGINA));
      const conhecidas = new Set(caixa.lista.map((q) => q.chave));
      const textos = new Set(caixa.lista.map((q) => q.pergunta.toLowerCase()));
      for (const { row } of dados.rows) {
        const q = converterIngles(row);
        if (q && !conhecidas.has(q.chave) && !textos.has(q.pergunta.toLowerCase())) {
          conhecidas.add(q.chave);
          textos.add(q.pergunta.toLowerCase());
          caixa.lista.push(q);
        }
      }
      if (!caixa.total) break;
    } catch (e) {
      falhou = true;
      break;
    }
  }
  if (caixa.lista.length > MAXIMO_GUARDADO) {
    const novas = caixa.lista.filter((q) => !jaVista(q.chave));
    const velhas = caixa.lista.filter((q) => jaVista(q.chave));
    caixa.lista = novas.concat(velhas).slice(0, MAXIMO_GUARDADO);
  }
  // Joga fora buscas antigas, de temas que mudaram.
  const atuais = new Set(estado.materias.map((m) => filtroIngles(temaDe(m))));
  for (const chave of Object.keys(banco)) {
    if (chave !== "enare" && chave !== "contagens" && chave !== onde && !atuais.has(chave)) delete banco[chave];
  }
  guardar(CHAVE_BANCO, banco);
  return { lista: caixa.lista, falhou };
}

const semAcento = (t) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function converterPortugues(linha) {
  const texto = String(linha.question ?? "");
  const inicio = texto.search(/'A'\s*:/);
  const achadas = [...texto.matchAll(/'([A-E])'\s*:\s*(['"])([\s\S]*?)\2\s*(?=\n\s*'[A-E]'\s*:|\s*$)/g)];
  const correta = achadas.find((a) => a[1] === linha.answer);
  const opcoes = achadas.map((a) => a[3].trim());
  if (inicio < 1 || achadas.length < 4 || !correta || new Set(opcoes).size < opcoes.length) return null;
  return {
    chave: "br|" + linha.id, origem: "healthqa", letras: true, ano: linha.year,
    pergunta: texto.slice(0, inicio).trim(), opcoes, certa: correta[3].trim(), explicacao: ""
  };
}

// As questões de odontologia do Enare são poucas: baixa todas uma vez.
async function questoesPortugues(materia) {
  let falhou = false;
  if (!banco.enare) {
    try {
      const dados = await consultar("Larxel/healthqa-br", "\"group\"='Odontologia'", 0, PAGINA);
      banco.enare = dados.rows.map(({ row }) => converterPortugues(row)).filter(Boolean);
      guardar(CHAVE_BANCO, banco);
    } catch (e) { falhou = true; }
  }
  const palavras = limparPalavras(temaDe(materia).pt).map(semAcento);
  const lista = (banco.enare || []).filter((q) => {
    const texto = semAcento(q.pergunta + " " + q.opcoes.join(" "));
    // começo de palavra, para "dtm" ou "atm" não casarem no meio de outra
    return palavras.some((p) => contarNoTexto(texto, p) > 0);
  });
  return { lista, falhou };
}

/* ============================================================
   TRADUÇÃO (tradutor embutido do Chrome, no computador)
   ============================================================ */
const CHAVE_TRADUCOES = "quiz-diario-traducoes-v1";
const MAXIMO_TRADUCOES = 1500;
let traducoes = lerGuardado(CHAVE_TRADUCOES, {});

// Termos que, sozinhos numa alternativa, têm tradução fixa.
const GLOSSARIO = {
  "all of the above": "Todas as anteriores", "none of the above": "Nenhuma das anteriores",
  "all": "Todas", "none": "Nenhuma", "both": "Ambas", "true": "Verdadeiro", "false": "Falso",
  "overbite": "Sobremordida", "overjet": "Sobressaliência", "deep bite": "Mordida profunda",
  "open bite": "Mordida aberta", "cross bite": "Mordida cruzada", "crossbite": "Mordida cruzada",
  "centric relation": "Relação cêntrica", "centric occlusion": "Oclusão cêntrica",
  "deciduous teeth": "Dentes decíduos", "primary teeth": "Dentes decíduos", "permanent teeth": "Dentes permanentes",
  "enamel": "Esmalte", "dentin": "Dentina", "dentine": "Dentina", "cementum": "Cemento", "pulp": "Polpa",
  "gingiva": "Gengiva", "alveolar bone": "Osso alveolar", "periodontal ligament": "Ligamento periodontal",
  "incisors": "Incisivos", "canine": "Canino", "canines": "Caninos", "premolars": "Pré-molares", "molars": "Molares",
  "buccal": "Vestibular", "lingual": "Lingual", "palatal": "Palatina", "mesial": "Mesial", "distal": "Distal",
  "masseter": "Masseter", "temporalis": "Temporal", "lateral pterygoid": "Pterigóideo lateral",
  "medial pterygoid": "Pterigóideo medial", "buccinator": "Bucinador", "digastric": "Digástrico",
  "facial nerve": "Nervo facial", "trigeminal nerve": "Nervo trigêmeo", "lingual nerve": "Nervo lingual",
  "inferior alveolar nerve": "Nervo alveolar inferior", "chorda tympani": "Corda do tímpano",
  "parotid": "Parótida", "parotid gland": "Glândula parótida", "submandibular gland": "Glândula submandibular",
  "sublingual gland": "Glândula sublingual", "dentigerous cyst": "Cisto dentígero", "radicular cyst": "Cisto radicular",
  "odontogenic keratocyst": "Ceratocisto odontogênico", "ameloblastoma": "Ameloblastoma",
  "lichen planus": "Líquen plano", "leukoplakia": "Leucoplasia", "pemphigus vulgaris": "Pênfigo vulgar",
  "squamous cell carcinoma": "Carcinoma espinocelular", "x-ray": "Raio X", "bitewing": "Interproximal"
};

// Correções na frase traduzida, aplicadas só se o inglês tiver o termo.
const CORRECOES = [
  [/\boverjet\b/i, /\b(overjet|sobrejato|excesso de jato)\b/gi, "sobressaliência"],
  [/\boverbite\b/i, /\b(overbite|mordida excessiva|sobremordida excessiva)\b/gi, "sobremordida"],
  [/\b(deciduous|primary) (teeth|tooth|dentition)\b/i, /\bprimári([ao]s?)\b/gi, "decídu$1"],
  [/\bbuccal (surface|cusp|side|aspect)\b/i, /\bbucal\b/gi, "vestibular"],
  [/\b(bite ?wing)\b/i, /\b(asas? de mordida|bite ?wing|mordida de asa)\b/gi, "interproximal"],
  [/\bcrown\b/i, /\bcoroa dentária dentária\b/gi, "coroa dentária"],
  [/\bsquamous cell carcinoma\b/i, /\bcarcinoma de células escamosas\b/gi, "carcinoma espinocelular"]
];

let tradutor = null; // promessa do tradutor, depois do primeiro clique

function temTradutor() { return "Translator" in self; }

// Precisa ser chamada direto do clique: o Chrome só baixa o idioma assim.
function ligarTradutor(aoBaixar) {
  if (!temTradutor()) return Promise.resolve(null);
  if (!tradutor) {
    tradutor = new Promise((pronto, falha) => {
      // Desiste se ficar 45 s sem terminar nem avançar no download.
      let relogio = setTimeout(falha, 45000);
      Translator.create({
        sourceLanguage: "en", targetLanguage: "pt",
        monitor(m) {
          m.addEventListener("downloadprogress", (e) => {
            clearTimeout(relogio);
            relogio = setTimeout(falha, 45000);
            if (aoBaixar && e.loaded < 1) aoBaixar(Math.round(e.loaded * 100));
          });
        }
      }).then(pronto, falha).finally(() => clearTimeout(relogio));
    }).catch(() => { tradutor = null; return null; });
  }
  return tradutor;
}

function comLimite(promessa, ms) {
  return Promise.race([promessa, new Promise((_, falha) => setTimeout(() => falha(new Error("demorou demais")), ms))]);
}

async function traduzirTexto(t, ingles) {
  const limpo = ingles.trim();
  if (!limpo) return "";
  const fixo = GLOSSARIO[limpo.toLowerCase().replace(/[.:]$/, "")];
  if (fixo) return fixo;
  if (!/[a-z]{2}/i.test(limpo)) return limpo; // números, fórmulas
  let saida = await comLimite(t.translate(limpo), 30000);
  for (const [seTiver, errado, certo] of CORRECOES) if (seTiver.test(limpo)) saida = saida.replace(errado, certo);
  return saida;
}

const traduzindo = new Map();

// Devolve { pergunta, opcoes, explicacao } em português, ou null.
function traduzirQuestao(q) {
  if (traducoes[q.chave]) return Promise.resolve(traducoes[q.chave]);
  if (!tradutor) return Promise.resolve(null);
  if (!traduzindo.has(q.chave)) {
    const tarefa = (async () => {
      const t = await tradutor;
      if (!t) return null;
      const feita = { pergunta: await traduzirTexto(t, q.pergunta), opcoes: [], explicacao: "" };
      for (const o of q.opcoes) feita.opcoes.push(await traduzirTexto(t, o));
      feita.explicacao = await traduzirTexto(t, q.explicacao);
      traducoes[q.chave] = feita;
      const chaves = Object.keys(traducoes);
      chaves.slice(0, Math.max(0, chaves.length - MAXIMO_TRADUCOES)).forEach((c) => delete traducoes[c]);
      guardar(CHAVE_TRADUCOES, traducoes);
      return feita;
    })().catch(() => null).finally(() => traduzindo.delete(q.chave));
    traduzindo.set(q.chave, tarefa);
  }
  return traduzindo.get(q.chave);
}

/* ============================================================
   IMPORTAR QUESTÕES COLADAS
   Entende alternativas "A) ...", "Resposta: B" e "Explicação: ..."
   ============================================================ */
function lerQuestoes(texto) {
  const prontas = [];
  const problemas = [];
  let atual = null, depoisDeVazia = false, lugar = "";
  const nova = () => ({ pergunta: "", opcoes: [], resposta: "", explicacao: "" });
  const fechar = () => {
    if (!atual) return;
    const { pergunta, opcoes, resposta, explicacao } = atual;
    const titulo = pergunta.trim().replace(/^(quest[ãa]o\s*)?\d+\s*[.):-]\s*/i, "");
    const certa = opcoes.find((o) => o.letra === resposta);
    const textos = opcoes.map((o) => o.texto.trim());
    if (!titulo && !opcoes.length) { /* sobra de texto */ }
    else if (!titulo) problemas.push("Uma questão está sem enunciado.");
    else if (opcoes.length < 2) problemas.push("Sem alternativas: " + titulo.slice(0, 60));
    else if (!certa) problemas.push("Sem resposta: " + titulo.slice(0, 60));
    else if (new Set(textos).size < textos.length) problemas.push("Alternativas repetidas: " + titulo.slice(0, 60));
    else prontas.push({ pergunta: titulo, certa: certa.texto.trim(), erradas: textos.filter((t) => t !== certa.texto.trim()), explicacao: explicacao.trim() });
    atual = null;
  };

  for (const bruta of texto.replace(/\r/g, "").split("\n")) {
    const linha = bruta.trim();
    if (!linha) { depoisDeVazia = true; continue; }
    const opcao = linha.match(/^(\*)?\s*\(?([A-Ea-e])\s*[).:-]\s*(.+)$/);
    const resposta = linha.match(/^(?:resposta(?: correta)?|gabarito|alternativa correta)\s*[:\-]?\s*\(?([A-Ea-e])\b/i);
    const explica = linha.match(/^(?:explica[çc][ãa]o|coment[áa]rio|justificativa)\s*:\s*(.*)$/i);
    if (resposta && atual) { atual.resposta = resposta[1].toUpperCase(); lugar = "resposta"; }
    else if (explica && atual) { atual.explicacao = explica[1]; lugar = "explicacao"; }
    else if (opcao && atual && atual.pergunta && !atual.resposta.length) {
      const letra = opcao[2].toUpperCase();
      atual.opcoes.push({ letra, texto: opcao[3] });
      if (opcao[1]) atual.marcada = letra;
      lugar = "opcao";
    }
    else if (atual && lugar === "explicacao" && !depoisDeVazia) atual.explicacao += " " + linha;
    else if (atual && lugar === "opcao" && !depoisDeVazia && !/^(quest[ãa]o\s*)?\d+\s*[.):-]\s/i.test(linha)) atual.opcoes[atual.opcoes.length - 1].texto += " " + linha;
    else {
      if (atual && atual.opcoes.length) { if (!atual.resposta) atual.resposta = atual.marcada || ""; fechar(); }
      if (!atual) atual = nova();
      atual.pergunta += (atual.pergunta ? " " : "") + linha;
      lugar = "pergunta";
    }
    depoisDeVazia = false;
  }
  if (atual && !atual.resposta) atual.resposta = atual.marcada || "";
  fechar();
  return { prontas, problemas };
}
