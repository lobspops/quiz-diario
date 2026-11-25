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
    en: ["occlusion", "occlusal contact", "occlusal adjust", "occlusal splint", "occlusal interference", "temporomandibular", "tmj", "condyl", "centric relation", "bruxism", "articulator", "intercusp", "muscles of mastication", "masticatory muscle", "mandibular movement", "lateral excursi", "anterior guidance"],
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
    en: ["leukoplakia", "erythroplakia", "lichen planus", "ulcer", "candid", "pemphig", "submucous fibrosis", "oral mucosa", "buccal mucosa", "aphth", "lesion", "oral cancer", "herpe", "stomatitis", "cheilitis", "biopsy", "burning mouth", "xerostomia", "sialo", "ranula", "mucocele", "fordyce", "pigmentation"],
    pt: ["mucosa", "úlcera", "leucoplas", "candid", "líquen", "câncer de boca", "lesão bucal"]
  },
  patologia: {
    areas: ["Dental"],
    en: ["cyst", "ameloblast", "odontogenic", "odontoma", "dysplasia", "carcinoma", "giant cell", "tumor", "tumour", "granuloma", "osteomyelitis", "fibroma", "hyperplasia", "necrosis", "inflammation", "adenoma", "imperfecta", "dens in dente", "taurodont", "supernumerary", "anodontia", "cherubism", "paget", "syndrome"],
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
const CHAVE_BANCO = "quiz-diario-banco-v2";
try { localStorage.removeItem("quiz-diario-banco-v1"); } catch (e) { /* sem memória */ }
const SERVIDOR = "https://datasets-server.huggingface.co/filter";
const PAGINA = 100;
const MAXIMO_GUARDADO = 500;

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

// A área "Dental" do banco traz algumas de dermatologia e clínica geral.
const CORPO = /\b(penis|penile|genital\w*|groin|axilla\w*|vagina\w*|cervix|glans|scrot\w*|testi\w*|prostat\w*|breast|ovar\w*|uterus|chancr\w*|sexual\w*|sex worker|intercourse|duoden\w*|gastric|peptic|colon|rectal|rectum|corneal?|diabetic foot|bed sore)\b/i;
const PELE = /\b(rash|itch\w*|prurit\w*|extremit\w*|knees?|elbows?|nails?|scalp|dermatitis|scabies|psoriasis|papules?|trunk)\b/i;
const BOCA = /\b(oral|mouth|buccal|lips?|tooth|teeth|dental|dent\w+|tongue|gingiv\w*|palat\w*|jaws?|mandib\w*|maxill\w*|saliva\w*|tmj|temporomandibular)\b/i;
function foraDaBoca(pergunta, opcoes) {
  const tudo = pergunta + " " + opcoes.join(" ");
  return CORPO.test(tudo) ? !BOCA.test(pergunta) || /genital|sexual|penis|glans/i.test(pergunta) : PELE.test(tudo) && !BOCA.test(pergunta);
}

function converterIngles(linha) {
  const opcoes = [linha.opa, linha.opb, linha.opc, linha.opd].map((o) => String(o ?? "").replace(/^\s*\(?[a-d]\)\s*/i, "").trim());
  const pergunta = String(linha.question ?? "").trim();
  const unicas = new Set(opcoes.map((o) => o.toLowerCase()));
  const pedeImagem = /\b(image|figure|picture|photograph|diagram|shown (below|above|in|here))\b/i.test(pergunta);
  if (pergunta.length < 12 || unicas.size < 4 || unicas.has("") || !(linha.cop in opcoes) || pedeImagem || foraDaBoca(pergunta, opcoes)) return null;
  // enunciados colados com alternativas, ou respostas em código ("bc")
  if (/a\)[\s\S]*b\)[\s\S]*c\)/i.test(pergunta) || opcoes.some((o) => /^[a-e]{1,4}$/i.test(o))) return null;
  const explicacao = String(linha.exp ?? "").trim();
  return {
    chave: "mm|" + linha.id, origem: "medmcqa", ingles: true, letras: true, pergunta, opcoes,
    certa: opcoes[linha.cop],
    explicacao: explicacao.length > 1200 ? explicacao.slice(0, 1200) + "…" : explicacao
  };
}

/* ---------- dificuldade estimada ----------
   O banco não informa dificuldade. A estimativa soma pistas do texto
   (tamanho, caso clínico, termos avançados, palavras raras) e compara
   as questões do mesmo tema entre si. */
// Ciência básica avançada, teoria e pesquisa: puxam para o extremo.
const AVANCADO = /\b(genes?|genetic\w*|mutation\w*|chromosom\w*|receptors?|mglur\w*|cytokine\w*|interleukin\w*|enzymes?|kinases?|protease\w*|collagen|antibod\w*|antigen\w*|immuno\w*|histochem\w*|ultrastructur\w*|pathogenesis|molecul\w*|syndromes?|biomechanic\w*|modulus|coefficient|pka|half.?life|metabolis\w*|pharmacokinetic\w*|embryo\w*|derived from|derivative|differentiat\w*|hypothes[ie]s|theor(y|ies)|concept|criteria|index|proposed|described by|given by|introduced|discovered|coined|microscop\w*|electron|isotope\w*|cephalometric|fulcrum|vectors?|plexus|nucleus|ganglion|synap\w*|fibroblast\w*|osteoclast\w*|osteoblast\w*|apopto\w*|marker|law of|angle of|bennett|fischer|christensen|hanau|monson)\b|\bp\d{2}\b/gi;
// Conceitos diretos e conduta do dia a dia: puxam para o fácil.
const BASICO = /\b(most common(ly)?|commonest|is called|also (called|known as)|known as|is defined as|definition|main|chief|function of|treatment of choice|indicated|contraindicated|first (sign|step|choice)|best treat\w*|management of|used for|used to|caused by|cause of|due to|prevent\w*|sign of|feature of|symptom\w*)\b/gi;
const PRATICO = /\b(patients?|treatment|caries|restor\w*|denture|extract\w*|crown|pain|fracture|radiograph|anesthe\w*|toothbrush\w*|fluoride|gingiv\w*|implant|orthodontic|malocclusion|xerostomia)\b/gi;

function pontosDeDificuldade(q) {
  const vezes = (texto, regra) => (texto.match(regra) || []).length;
  const opcoes = q.opcoes.join(" ");
  const caso = /\b(year[- ]old|years old|presents? with|complain\w*|on examination|history of|reports? (to|with))\b/i.test(q.pergunta);
  let pontos = Math.min(caso ? 0.8 : 1.8, Math.log2(1 + q.pergunta.length / 60));
  pontos += Math.min(0.8, opcoes.length / 220);
  pontos += Math.min(4, vezes(q.pergunta, AVANCADO) * 1.6 + vezes(opcoes, AVANCADO) * 0.5);
  pontos -= Math.min(1.6, vezes(q.pergunta, BASICO) * 0.8);
  pontos -= Math.min(1.2, vezes(q.pergunta, PRATICO) * 0.4);
  if (caso) pontos += 0.9; // caso clínico: em geral fica no médio ou difícil
  if (/\b(except|not true|false|incorrect|least likely|all of the following)\b/i.test(q.pergunta)) pontos += 0.3;
  if (q.opcoes.filter((o) => /\d/.test(o)).length >= 3 && !caso) pontos += 1.3; // valores exatos
  return pontos;
}

// Dá a cada questão uma posição de 0 (mais básica) a 1 (mais difícil).
function ordenarPorDificuldade(lista) {
  const palavrasDe = (q) => [...new Set((q.pergunta + " " + q.opcoes.join(" ")).toLowerCase().match(/[a-z]{4,}/g) || [])];
  const emQuantas = {};
  const palavras = lista.map(palavrasDe);
  palavras.forEach((ps) => ps.forEach((p) => { emQuantas[p] = (emQuantas[p] || 0) + 1; }));
  const notas = lista.map((q, i) => {
    const raras = palavras[i].length ? palavras[i].reduce((s, p) => s + Math.log(lista.length / emQuantas[p]), 0) / palavras[i].length : 0;
    return { q, nota: pontosDeDificuldade(q) + raras * 0.6 };
  }).sort((a, b) => a.nota - b.nota);
  return notas.map(({ q }, i) => ({ ...q, posicao: notas.length > 1 ? i / (notas.length - 1) : 0.5 }));
}

// Distância da questão até a faixa do nível: 0 quando está dentro dela.
const FAIXAS = { 1: [0, 0.25], 2: [0.25, 0.5], 3: [0.5, 0.75], 4: [0.75, 1] };
function distanciaDoNivel(q, nivel) {
  const [de, ate] = FAIXAS[nivel];
  return q.posicao < de ? de - q.posicao : q.posicao > ate ? q.posicao - ate : 0;
}

// Devolve questões em inglês do tema e do nível, buscando mais quando
// faltam inéditas. Se a faixa não bastar, completa com as vizinhas.
async function questoesIngles(materia, jaVista, quantas, nivel) {
  const onde = filtroIngles(temaDe(materia));
  if (!onde) return { lista: [], falhou: false };
  const caixa = banco[onde] || (banco[onde] = { total: null, proxima: 0, lista: [] });
  const doNivel = () => ordenarPorDificuldade(caixa.lista).filter((q) => distanciaDoNivel(q, nivel) === 0);
  const ineditas = () => doNivel().filter((q) => !jaVista(q.chave)).length;
  let falhou = false;

  const receber = (linhas) => {
    const conhecidas = new Set(caixa.lista.map((q) => q.chave));
    const textos = new Set(caixa.lista.map((q) => q.pergunta.toLowerCase()));
    for (const { row } of linhas) {
      const q = converterIngles(row);
      if (q && !conhecidas.has(q.chave) && !textos.has(q.pergunta.toLowerCase())) {
        conhecidas.add(q.chave);
        textos.add(q.pergunta.toLowerCase());
        caixa.lista.push(q);
      }
    }
  };
  const buscarPagina = async () => {
    const pagina = caixa.proxima;
    const paginas = Math.max(1, Math.ceil((caixa.total || 1) / PAGINA));
    caixa.proxima = (caixa.proxima + 1) % paginas;
    const dados = await consultar("openlifescienceai/medmcqa", onde, pagina * PAGINA, PAGINA);
    caixa.total = dados.num_rows_total;
    return dados.rows;
  };

  try {
    if (caixa.total === null) {
      receber(await buscarPagina());
      caixa.proxima = caixa.total > PAGINA ? 1 : 0;
    }
    const paginas = Math.ceil(caixa.total / PAGINA);
    // Até 4 páginas por vez: o bastante para comparar dificuldades.
    const cabem = Math.min(paginas - 1, 3);
    if (cabem > 0 && caixa.lista.length < MAXIMO_GUARDADO && (caixa.lista.length < cabem * PAGINA * 0.8 || ineditas() < quantas)) {
      const partes = await Promise.all(Array.from({ length: cabem }, buscarPagina));
      partes.forEach(receber);
    }
  } catch (e) { falhou = true; }

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

  const ordenadas = ordenarPorDificuldade(caixa.lista).map((q) => ({ ...q, distancia: distanciaDoNivel(q, nivel) }));
  const limite = ordenadas.filter((q) => q.distancia === 0 && !jaVista(q.chave)).length >= quantas ? 0 : 0.25;
  let lista = ordenadas.filter((q) => q.distancia <= limite);
  if (lista.length < quantas) lista = ordenadas.sort((a, b) => a.distancia - b.distancia).slice(0, quantas);
  return { lista, falhou };
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
  // Casos longos ficam no difícil; perguntas diretas, no médio.
  return { lista: lista.map((q) => ({ ...q, nivel: q.pergunta.length > 300 || /paciente/i.test(q.pergunta) ? 3 : 2 })), falhou };
}

/* ============================================================
   TRADUÇÃO (tradutor embutido do Chrome, no computador)
   ============================================================ */
const CHAVE_TRADUCOES = "quiz-diario-traducoes-v2";
try { localStorage.removeItem("quiz-diario-traducoes-v1"); } catch (e) { /* sem memória */ }
const MAXIMO_TRADUCOES = 1500;
let traducoes = lerGuardado(CHAVE_TRADUCOES, {});

// Correções para quando o tradutor não respeita o termo do glossário:
// valem só se o inglês tiver o termo.
const CORRECOES = [
  [/\b(canine|cuspid)s?\b/i, /\b(cachorro|cão|cães|cachorros)\b/gi, "canino"],
  [/\boverjet\b/i, /\b(overjet|sobrejato|excesso de jato)\b/gi, "sobressaliência"],
  [/\boverbite\b/i, /\b(overbite|mordida excessiva|sobremordida excessiva)\b/gi, "sobremordida"],
  [/\b(deciduous|primary) (teeth|tooth|dentition|molars?|incisors?|canines?)\b/i, /\bprimári([ao]s?)\b/gi, "decídu$1"],
  [/\bbuccal\b/i, /\b(face|superfície|cúspide|parede|lado|raiz) bucal\b/gi, "$1 vestibular"],
  [/\bbite ?wing\b/i, /\b(asas? de mordida|bite ?wing|mordida de asa)\b/gi, "interproximal"],
  [/\bsquamous cell carcinoma\b/i, /\bcarcinoma de células escamosas\b/gi, "carcinoma espinocelular"],
  [/\bdentures?\b/i, /\bdentadura(s?)\b/gi, "prótese$1"],
  [/\bimpressions?\b/i, /\bimpress(ão|ões)\b/gi, (m, f) => (f === "ão" ? "moldagem" : "moldagens")],
  [/\bfiles?\b/i, /\barquivo(s?)\b/gi, "lima$1"],
  [/\bburs?\b/i, /\brebarba(s?)\b/gi, "broca$1"],
  [/\bclasps?\b/i, /\bfecho(s?)\b/gi, "grampo$1"],
  [/\bpockets?\b/i, /\bbolso(s?)\b/gi, "bolsa$1"],
  [/\bcrowding\b/i, /\b(aglomeração|superlotação|lotação)\b/gi, "apinhamento"],
  [/\bflaps?\b/i, /\baba(s?)\b/gi, "retalho$1"],
  [/\broots? planing\b/i, /\b(aplainamento|planejamento) (da raiz|radicular)\b/gi, "alisamento radicular"],
  [/\bscaling\b/i, /\b(dimensionamento|escalonamento|escamação)\b/gi, "raspagem"],
  [/\bprobing\b/i, /\binvestigação\b/gi, "sondagem"],
  [/\bcast\b/i, /\b(elenco|gesso fundido)\b/gi, "modelo"],
  [/\bsetting\b/i, /\bconfiguração\b/gi, "presa"],
  [/\babutments?\b/i, /\b(pilastra|encontro|contraforte)(s?)\b/gi, "pilar"],
  [/\bsocket\b/i, /\b(soquete|tomada)\b/gi, "alvéolo"],
  [/\bsyndrome\b/i, /\bsíndroma\b/gi, "síndrome"]
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
  const fixo = termoInteiro(limpo);
  if (fixo) return fixo;
  if (!/[a-z]{2}/i.test(limpo)) return limpo; // números, fórmulas
  const traduzir = (s) => comLimite(t.translate(s), 30000);
  const { texto, usados } = aplicarGlossario(limpo);

  // Primeira tentativa: frase com os termos já em português. Só vale se
  // o tradutor manteve os termos; senão, traduz o inglês puro e corrige.
  if (usados.length) {
    const saida = await traduzir(texto);
    const achatado = semAcento(saida);
    const manteve = usados.filter((u) => achatado.includes(semAcento(u))
      || u.split(" ").every((p) => p.length < 4 || achatado.includes(semAcento(p).slice(0, -2)))).length;
    if (manteve / usados.length >= 0.75) return corrigir(limpo, saida);
  }
  return corrigir(limpo, await traduzir(limpo));
}

function corrigir(ingles, saida) {
  for (const [seTiver, errado, certo] of CORRECOES) if (seTiver.test(ingles)) saida = saida.replace(errado, certo);
  return saida.replace(/\s+([,.;:?!])/g, "$1");
}

// Guarda na memória, jogando fora as mais antigas quando passa do limite.
function guardarTraducao(chave, feita) {
  delete traducoes[chave];
  traducoes[chave] = feita;
  const chaves = Object.keys(traducoes);
  chaves.slice(0, Math.max(0, chaves.length - MAXIMO_TRADUCOES)).forEach((c) => delete traducoes[c]);
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
      guardarTraducao(q.chave, feita);
      guardar(CHAVE_TRADUCOES, traducoes);
      return feita;
    })().catch(() => null).finally(() => traduzindo.delete(q.chave));
    traduzindo.set(q.chave, tarefa);
  }
  return traduzindo.get(q.chave);
}
