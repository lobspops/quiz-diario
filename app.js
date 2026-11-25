"use strict";

/* ============================================================
   1. MEMÓRIA DO APP (fica salva no navegador)
   ============================================================ */
const CHAVE = "quiz-diario-v1";
const UM_DIA = 24 * 60 * 60 * 1000;
const VERSAO = 8; // mude junto com os ?v= do index.html

// Botões de teste só aparecem no computador, nunca no site publicado.
const MODO_TESTE = ["", "localhost", "127.0.0.1"].includes(location.hostname);

let estado = carregar();
let quiz = null; // quiz em andamento (não é salvo)

function estadoInicial() {
  return {
    modo: "facil",
    foguinho: FOGUINHO_INICIAL,
    diaSimulado: 0,               // quantos dias o botão de teste já avançou
    ultimoDia: diaReal() - 1,     // como se o último quiz tivesse sido ontem
    vistas: {},                   // ordem em que cada pergunta foi respondida por último
    contador: 0,
    ocultas: {},                  // questões que a pessoa escondeu
    materias: JSON.parse(JSON.stringify(MATERIAS_EXEMPLO))
  };
}

function carregar() {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE));
    if (salvo && Array.isArray(salvo.materias)) return Object.assign(estadoInicial(), salvo);
  } catch (e) { /* sem memória disponível: usa os exemplos */ }
  return estadoInicial();
}

function salvar() {
  try { localStorage.setItem(CHAVE, JSON.stringify(estado)); }
  catch (e) { avisar("Não foi possível salvar neste navegador."); }
}

/* ============================================================
   2. FOGUINHO
   ============================================================ */
// Número do dia no calendário local (muda à meia-noite).
function diaReal() {
  const d = new Date();
  return Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / UM_DIA);
}
function hoje() { return diaReal() + estado.diaSimulado; }
function feitoHoje() { return estado.ultimoDia >= hoje(); }

// Se passou um dia inteiro sem quiz, a sequência volta a zero.
function foguinhoAtual() { return hoje() - estado.ultimoDia > 1 ? 0 : estado.foguinho; }

// Só aumenta uma vez por dia. Devolve true quando aumentou.
function concluirDia() {
  if (feitoHoje()) return false;
  estado.foguinho = foguinhoAtual() + 1;
  estado.ultimoDia = hoje();
  salvar();
  return true;
}

/* ============================================================
   3. PEQUENAS AJUDAS
   ============================================================ */
const $ = (seletor) => document.querySelector(seletor);

// Cria um elemento: el("button", { class: "botao", onclick: f }, "texto")
function el(tag, atributos, ...filhos) {
  const no = document.createElement(tag);
  for (const [nome, valor] of Object.entries(atributos || {})) {
    if (nome.startsWith("on")) no.addEventListener(nome.slice(2), valor);
    else if (valor === true) no.setAttribute(nome, "");
    else if (valor !== false && valor != null) no.setAttribute(nome, valor);
  }
  no.append(...filhos.flat().filter((f) => f != null && f !== false));
  return no;
}

function icone(desenho) {
  const molde = document.createElement("template");
  molde.innerHTML = desenho;
  return molde.content.firstChild;
}
const iconePasta = () => icone('<svg viewBox="0 0 40 36" fill="currentColor" aria-hidden="true"><path d="M3 2h11c1 0 1.700.400 2.300 1.200L18.500 6H37a3 3 0 0 1 3 3v22a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3z"/></svg>');
const iconeMais = () => icone('<svg viewBox="0 0 40 40" stroke="currentColor" stroke-width="3.500" aria-hidden="true"><path d="M20 6v28M6 20h28"/></svg>');

function plural(n, um, varios) { return n + " " + (n === 1 ? um : varios); }

function embaralhar(lista) {
  const copia = lista.slice();
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

let relogioAviso;
function avisar(texto) {
  const aviso = $("#aviso");
  aviso.textContent = texto;
  aviso.classList.add("visivel");
  clearTimeout(relogioAviso);
  relogioAviso = setTimeout(() => aviso.classList.remove("visivel"), 3500);
}

function confirmar(titulo, texto, botao, acao) {
  $("#titulo-confirmar").textContent = titulo;
  $("#texto-confirmar").textContent = texto;
  $("#sim-confirmar").textContent = botao;
  $("#sim-confirmar").onclick = () => { $("#janela-confirmar").close(); acao(); };
  $("#janela-confirmar").showModal();
}

function mostrar(...conteudo) {
  $("#tela").replaceChildren(...conteudo);
  window.scrollTo(0, 0);
  const titulo = $("#tela h1");
  if (titulo) { titulo.tabIndex = -1; titulo.focus({ preventScroll: true }); }
}

function materiaPorId(id) { return estado.materias.find((m) => m.id === id); }
function materiasSelecionadas() { return estado.materias.filter((m) => m.selecionada); }
function perguntasDe(materia) {
  return PERGUNTAS[materia.id] || [];
}
function modoAtual() { return MODOS.find((m) => m.id === estado.modo) || MODOS[0]; }

/* ============================================================
   4. NAVEGAÇÃO (o endereço depois do # diz qual é a tela)
   ============================================================ */
function ir(rota) {
  if (location.hash === "#" + rota) desenhar();
  else location.hash = rota;
}

function desenhar() {
  document.querySelectorAll("dialog[open]").forEach((d) => d.close());
  const [rota, id] = location.hash.slice(1).split("/");
  if (rota !== "quiz") quiz = null;
  busca++;
  carregando = false;
  if (controleIA) controleIA.abort();

  if (rota === "selecionar") return telaSelecionar();
  if (rota === "cadastrar") return telaCadastrar();
  if (rota === "materia" && materiaPorId(id)) return telaMateria(materiaPorId(id));
  if (rota === "quiz" && quiz) return telaPergunta();
  telaInicial();
}

/* ============================================================
   5. TELA INICIAL (página 1 do PDF)
   ============================================================ */
function telaInicial() {
  const fogo = foguinhoAtual();
  const situacao = feitoHoje()
    ? "quiz de hoje concluído ✓"
    : fogo === 0 ? "faça o quiz de hoje para acender o foguinho" :"faça o quiz de hoje para chegar a " + (fogo + 1);

  const detalhe = el("p", { class: "detalhe", "aria-live": "polite" });
  const atualizarDetalhe = () => {
    const semTema = materiasSelecionadas().filter((m) => !filtroIngles(temaDe(m)) && !(temIA() && m.materiais.some((n) => naIA.has(idArquivo(m.id, n)))));
    detalhe.replaceChildren(...(materiasSelecionadas().length === 0
      ? ["nenhuma matéria selecionada"]
      : [modoAtual().descricao, el("br"), semTema.length
          ? "sem temas: " + semTema.map((m) => m.nome).join(", ")
          : "até " + PERGUNTAS_POR_QUIZ + " perguntas" + (temIA() ? " · IA a partir dos slides" : "")]));
  };

  const modos = MODOS.map((modo) => el("label", { class: "modo" },
    el("input", {
      type: "radio", name: "modo", value: modo.id, checked: modo.id === modoAtual().id,
      onchange: () => { estado.modo = modo.id; salvar(); atualizarDetalhe(); }
    }),
    el("span", {}, modo.nome)
  ));
  atualizarDetalhe();

  mostrar(
    el("div", { class: "conteudo" },
      el("div", { class: "abertura" },
        el("section", { class: "cartao" },
          el("div", { class: "cabeca" },
            el("h1", { class: "titulo-grande" }, "QUIZ DIÁRIO"),
            el("p", { class: "foguinho" + (fogo === 0 ? " apagado" : ""), "aria-label": "Sequência de " + plural(fogo, "dia", "dias") },
              String(fogo), el("span", { class: "chama", "aria-hidden": "true" }, "🔥")),
            el("p", { class: "situacao" }, situacao)
          ),
          el("div", { class: "modos", role: "radiogroup", "aria-label": "Dificuldade" }, modos),
          detalhe,
          el("button", { type: "button", class: "botao botao-forte botao-largo", onclick: comecarQuiz },
            feitoHoje() ? "treinar de novo" : "começar quiz")
        ),
        el("section", { class: "cartao" },
          el("div", { class: "cabeca" }, el("h2", { class: "titulo-grande" }, "PERSONALIZADO")),
          el("div", { class: "personalizado" },
            el("button", { type: "button", class: "botao-grande", onclick: () => ir("selecionar") }, "selecionar", el("br"), "matérias"),
            el("button", { type: "button", class: "botao-grande", onclick: () => ir("cadastrar") }, "cadastrar", el("br"), "matérias")
          )
        )
      )
    ),
    el("p", { class: "versao" },
      "versão " + VERSAO + " · IA " + (temIA() ? "ligada" : "desligada") + " ",
      el("button", { type: "button", class: "link", onclick: abrirIA }, "configurar IA")),
    ...(MODO_TESTE ? [el("div", { class: "teste" },
      el("span", {}, "para testar:"),
      el("button", { type: "button", onclick: simularDia }, "simular próximo dia"),
      el("button", { type: "button", onclick: restaurar }, "restaurar exemplo")
    )] : [])
  );
}

function simularDia() {
  estado.diaSimulado += 1;
  salvar();
  telaInicial();
  avisar(foguinhoAtual() === 0 ? "Um dia passou sem quiz: o foguinho apagou." : "Avançou um dia. O quiz está liberado de novo.");
}

function restaurar() {
  confirmar("restaurar exemplo?", "As matérias e os materiais que você adicionou serão apagados e o foguinho volta a " + FOGUINHO_INICIAL + ".", "restaurar", () => {
    estado = estadoInicial();
    apagarTudoIA();
    salvar();
    telaInicial();
    avisar("Exemplo restaurado.");
  });
}

/* ============================================================
   6. SELECIONAR MATÉRIAS (página 2 do PDF)
   ============================================================ */
function telaSelecionar() {
  // As mudanças só valem depois de "confirmar".
  const marcadas = new Set(materiasSelecionadas().map((m) => m.id));
  const contagem = el("span", { class: "contagem", "aria-live": "polite" });
  const botaoConfirmar = el("button", { type: "button", class: "botao botao-forte", onclick: () => {
    estado.materias.forEach((m) => { m.selecionada = marcadas.has(m.id); });
    salvar();
    ir("inicio");
    avisar("Matérias do quiz atualizadas.");
  } }, "confirmar");

  const atualizar = () => {
    botaoConfirmar.disabled = marcadas.size === 0;
    contagem.textContent = marcadas.size === 0 ? "marque pelo menos uma" : plural(marcadas.size, "marcada", "marcadas");
  };
  atualizar();

  mostrar(el("div", { class: "conteudo" },
    el("section", { class: "cartao cartao-unico" },
      el("div", { class: "topo" }, el("h1", { class: "titulo-tela" }, "selecionar matérias")),
      el("ul", { class: "rolagem" }, estado.materias.map((m) => el("li", {},
        el("label", { class: "chave" },
          el("input", { type: "checkbox", checked: marcadas.has(m.id), onchange: (e) => {
            if (e.target.checked) marcadas.add(m.id); else marcadas.delete(m.id);
            atualizar();
          } }),
          el("span", { class: "materia" }, m.nome)
        )
      ))),
      el("div", { class: "acoes rodape" },
        el("button", { type: "button", class: "botao botao-claro", onclick: () => ir("inicio") }, "voltar"),
        contagem,
        botaoConfirmar
      )
    )
  ));
}

/* ============================================================
   7. CADASTRAR MATÉRIAS (página 3 do PDF)
   ============================================================ */
function telaCadastrar() {
  mostrar(el("div", { class: "conteudo" },
    el("section", { class: "cartao cartao-unico" },
      el("div", { class: "topo" },
        el("button", { type: "button", class: "redondo", "aria-label": "Criar nova matéria", title: "criar nova matéria", onclick: abrirNovaMateria }, iconeMais()),
        el("h1", { class: "titulo-tela" }, "cadastrar matérias")
      ),
      el("div", { class: "rolagem" },
        el("ul", { class: "pastas" }, estado.materias.map((m) => el("li", {},
          el("button", { type: "button", class: "pasta", title: m.nome, onclick: () => ir("materia/" + m.id) },
            iconePasta(), el("span", { class: "materia" }, m.nome))
        )))
      ),
      el("div", { class: "acoes rodape" },
        el("button", { type: "button", class: "botao botao-claro", onclick: () => ir("inicio") }, "voltar")
      )
    )
  ));
}

function abrirNovaMateria() {
  $("#form-materia").reset();
  $("#erro-materia").textContent = "";
  $("#janela-materia").showModal();
  $("#nome-materia").focus();
}

$("#form-materia").addEventListener("submit", (e) => {
  e.preventDefault();
  const nome = $("#nome-materia").value.trim().replace(/\s+/g, " ");
  const igual = (a) => a.toLocaleLowerCase("pt-BR") === nome.toLocaleLowerCase("pt-BR");
  if (!nome) { $("#erro-materia").textContent = "Digite o nome da matéria."; return; }
  if (estado.materias.some((m) => igual(m.nome))) { $("#erro-materia").textContent = "Já existe uma matéria com esse nome."; return; }

  const nova = { id: "m" + Date.now().toString(36), nome, selecionada: false, materiais: [] };
  estado.materias.push(nova);
  salvar();
  $("#janela-materia").close();
  ir("materia/" + nova.id);
  const temas = temaAutomatico(nova).en.length;
  avisar(temas ? "Matéria criada com " + plural(temas, "tema", "temas") + " pelo nome." : "Matéria criada. Arraste arquivos para achar os temas.");
});

document.querySelectorAll("[data-fechar]").forEach((b) => b.addEventListener("click", () => b.closest("dialog").close()));

/* ============================================================
   8. MATÉRIA ABERTA (páginas 4 e 5 do PDF)
   O arquivo é lido aqui no navegador para achar os temas.
   O arquivo fica guardado só neste navegador, para a IA usar.
   ============================================================ */
const filaLeitura = [];
const lendo = {};          // "matéria|arquivo" -> o que está acontecendo agora
let lendoAgora = false;
let redesenharMateriais = null;

async function lerFila() {
  if (lendoAgora) return;
  lendoAgora = true;
  while (filaLeitura.length) {
    const { id, arquivo } = filaLeitura.shift();
    const chave = id + "|" + arquivo.name;
    const aviso = (texto) => { lendo[chave] = texto; if (redesenharMateriais) redesenharMateriais(); };
    let resultado;
    let paginas = [];
    let abriu = true;
    try {
      const lido = await lerArquivo(arquivo, aviso);
      const texto = lido.texto;
      paginas = lido.paginas;
      resultado = texto.replace(/\s/g, "").length < 20
        ? { en: [], pt: [], areas: [], erro: "não encontrei texto" }
        : await temasDoTexto(texto, aviso);
    } catch (e) {
      // imagem cujo texto não foi lido ainda serve para a IA
      abriu = EH_IMAGEM.test(extensao(arquivo.name));
      resultado = { en: [], pt: [], areas: [], erro: e.name === "PasswordException" ? "protegido por senha" : e.message || "não consegui ler" };
    }
    delete lendo[chave];
    const materia = materiaPorId(id);
    // a matéria ou o arquivo podem ter sido apagados durante a leitura
    if (materia && materia.materiais.includes(arquivo.name)) {
      materia.lidos = { ...(materia.lidos || {}), [arquivo.name]: resultado };
      let erroGuarda = "";
      try { if (abriu) await guardarArquivoIA(id, arquivo, paginas); } catch (e) { erroGuarda = e.message; }
      if (erroGuarda) avisar(arquivo.name + ": " + erroGuarda + ".");
      materia.completar = false;
      if (!materia.tema && TEMAS_PADRAO[materia.id]) {
        try { materia.completar = (await contarIngles(temaDe(materia))) < 60; } catch (e) { materia.completar = true; }
      }
      salvar();
      const n = resultado.en.length;
      avisar(resultado.erro ? arquivo.name + ": " + resultado.erro + "." : n ? plural(n, "tema encontrado", "temas encontrados") + " em " + arquivo.name + "." : "Nenhum tema reconhecido em " + arquivo.name + ".");
    }
    if (redesenharMateriais) redesenharMateriais();
  }
  lendoAgora = false;
}

function situacaoMaterial(materia, nome) {
  const agora = lendo[materia.id + "|" + nome];
  if (agora) return agora;
  const lido = (materia.lidos || {})[nome];
  if (!lido) return "não lido: arraste de novo";
  const guardado = naIA.has(idArquivo(materia.id, nome));
  const temas = lido.erro || (lido.en.length ? plural(lido.en.length, "tema", "temas") : "nenhum tema");
  if (guardado) return temas + " · pronto para a IA";
  return temas + (!lido.erro && temIA() ? " · arraste de novo para a IA" : "");
}

function telaMateria(materia) {
  const lista = el("ul", { class: "materiais" });
  const desenharLista = () => {
    lista.replaceChildren(...(materia.materiais.length
      ? materia.materiais.map((nome) => linhaMaterial(materia, nome, desenharLista))
      : [el("li", { class: "vazio" }, "Nenhum material ainda.")]));
  };
  desenharLista();
  redesenharMateriais = () => { if (lista.isConnected) desenharLista(); };

  // Arquivo repetido é lido de novo, para atualizar os temas.
  const adicionar = (arquivos) => {
    if (!arquivos.length) { avisar("Arraste arquivos, não pastas ou textos."); return; }
    for (const arquivo of arquivos) {
      if (!materia.materiais.includes(arquivo.name)) materia.materiais.push(arquivo.name);
      const chave = materia.id + "|" + arquivo.name;
      if (lendo[chave]) continue;
      lendo[chave] = "na fila…";
      filaLeitura.push({ id: materia.id, arquivo });
    }
    salvar();
    desenharLista();
    lista.scrollTop = lista.scrollHeight;
    lerFila();
  };

  const escolher = el("input", { type: "file", multiple: true, hidden: true, accept: ".pdf,.docx,.pptx,.txt,.md,.png,.jpg,.jpeg,.webp,.bmp", onchange: (e) => {
    if (e.target.files.length) adicionar([...e.target.files]);
    e.target.value = "";
  } });

  const area = el("div", {
    class: "solta",
    ondragover: (e) => { e.preventDefault(); area.classList.add("arrastando"); },
    ondragleave: (e) => { if (!area.contains(e.relatedTarget)) area.classList.remove("arrastando"); },
    ondrop: (e) => {
      e.preventDefault();
      area.classList.remove("arrastando");
      const itens = [...e.dataTransfer.items].filter((i) => i.kind === "file");
      const arquivos = itens.filter((i) => {
        const entrada = i.webkitGetAsEntry && i.webkitGetAsEntry();
        return !(entrada && entrada.isDirectory);
      }).map((i) => i.getAsFile()).filter(Boolean);
      adicionar(arquivos);
    }
  },
    lista,
    el("p", { class: "dica" }, "arraste aqui para adicionar ou ",
      el("button", { type: "button", onclick: () => escolher.click() }, "escolha um arquivo")),
    el("div", { class: "alvo", "aria-hidden": "true" }, "arraste aqui para adicionar"),
    escolher
  );

  mostrar(el("div", { class: "conteudo" },
    el("section", { class: "cartao cartao-unico" },
      el("div", { class: "topo" },
        el("span", { class: "redondo" }, iconePasta()),
        el("h1", { class: "materia" }, materia.nome)
      ),
      area,
      el("div", { class: "acoes rodape" },
        el("button", { type: "button", class: "botao botao-claro", onclick: () => ir("cadastrar") }, "voltar"),
        el("button", { type: "button", class: "botao botao-claro", onclick: () => abrirTemas(materia) }, "temas da busca")
      )
    )
  ));
}

/* ---------- temas da busca ---------- */
let materiaAberta = null;
const separar = (texto) => limparPalavras(texto.split(/[,;\n]/));

function abrirTemas(materia) {
  materiaAberta = materia;
  const tema = temaDe(materia);
  $("#temas-en").value = tema.en.join(", ");
  $("#temas-pt").value = tema.pt.join(", ");
  $("#resultado-temas").textContent = "";
  const auto = temaAutomatico(materia).en.length;
  $("#origem-temas").textContent = auto
    ? plural(auto, "palavra em inglês foi preenchida", "palavras em inglês foram preenchidas") + " sozinha" + (auto === 1 ? "" : "s") + ". Apague as que não servirem."
    : "Adicione arquivos à matéria para preencher sozinho, ou digite aqui.";
  mostrarEscondidas();
  $("#temas-areas").replaceChildren(el("legend", {}, "áreas do banco em inglês"), ...AREAS.map(([id, nome]) =>
    el("label", {}, el("input", { type: "checkbox", value: id, checked: tema.areas.includes(id) }), nome)));
  $("#janela-temas").showModal();
}

function mostrarEscondidas() {
  const quantas = Object.keys(estado.ocultas).length;
  $("#escondidas-temas").replaceChildren(...(quantas ? [el("button", { type: "button", class: "link", onclick: () => {
    estado.ocultas = {};
    salvar();
    mostrarEscondidas();
  } }, "voltar a mostrar " + plural(quantas, "questão escondida", "questões escondidas"))] : []));
}

function temaDigitado() {
  return {
    en: separar($("#temas-en").value),
    pt: separar($("#temas-pt").value),
    areas: [...document.querySelectorAll("#temas-areas input:checked")].map((c) => c.value)
  };
}

$("#testar-temas").addEventListener("click", async () => {
  const saida = $("#resultado-temas");
  const botao = $("#testar-temas");
  saida.textContent = "Buscando…";
  botao.disabled = true;
  try {
    const tema = temaDigitado();
    const ingles = await contarIngles(tema);
    const portugues = (await questoesPortugues({ id: "", tema, lidos: {} })).lista.length;
    saida.textContent = "Encontradas: " + ingles + " em inglês e " + portugues + " em português.";
  } catch (e) {
    saida.textContent = "O banco não respondeu. Confira a internet e tente de novo.";
  }
  botao.disabled = false;
});

$("#form-temas").addEventListener("submit", (e) => {
  e.preventDefault();
  // Separa o que é da pessoa do que veio dos arquivos: o digitado fica
  // para sempre, e o que ela apagou não volta nas próximas leituras.
  const digitado = temaDigitado();
  const mostrado = temaDe(materiaAberta);
  const auto = temaAutomatico(materiaAberta);
  const fora = materiaAberta.removidas || { en: [], pt: [] };
  const semMudanca = ["en", "pt", "areas"].every((c) => digitado[c].join() === mostrado[c].join());
  if (!semMudanca) {
    const mudouAreas = digitado.areas.join() !== mostrado.areas.join();
    const areasAntes = materiaAberta.tema && materiaAberta.tema.areas;
    const novo = mudouAreas ? { areas: digitado.areas } : areasAntes ? { areas: areasAntes } : {};
    const removidas = {};
    for (const c of ["en", "pt"]) {
      novo[c] = digitado[c].filter((t) => !auto[c].includes(t));
      removidas[c] = [...new Set([...fora[c], ...auto[c].filter((t) => !digitado[c].includes(t))])].filter((t) => !digitado[c].includes(t));
    }
    materiaAberta.tema = novo;
    materiaAberta.removidas = removidas;
  }
  salvar();
  $("#janela-temas").close();
  avisar("Temas salvos.");
});

function linhaMaterial(materia, nome, aoRemover) {
  const ponto = nome.lastIndexOf(".");
  const tipo = ponto > 0 ? nome.slice(ponto + 1, ponto + 5).toUpperCase() : "ARQ";
  return el("li", { class: "material" },
    el("span", { class: "etiqueta" + (tipo === "PDF" ? " pdf" : ""), "aria-hidden": "true" }, tipo),
    el("span", { class: "nome" }, nome),
    el("span", { class: "situacao-material" }, situacaoMaterial(materia, nome)),
    el("button", { type: "button", class: "remover", "aria-label": "Remover " + nome, title: "remover", onclick: () => {
      materia.materiais = materia.materiais.filter((n) => n !== nome);
      if (materia.lidos) delete materia.lidos[nome];
      apagarArquivoIA(materia.id, nome);
      salvar();
      aoRemover();
    } }, "×"));
}

// Soltar um arquivo fora da área não deve tirar a pessoa do app.
["dragover", "drop"].forEach((tipo) => window.addEventListener(tipo, (e) => e.preventDefault()));

/* ============================================================
   9. QUIZ
   ============================================================ */
// Questões que já estão no site. Quando os slides definem os temas,
// só entram as que falam desses temas.
function filaLocal(materia) {
  const nivel = modoAtual().nivel;
  const tema = temaDe(materia);
  const peloSlide = temaAutomatico(materia).en.length >= 3;
  const palavras = tema.pt.map(semAcento);
  const noTema = (p) => {
    const texto = semAcento(p.pergunta + " " + p.certa + " " + p.erradas.join(" ") + " " + p.explicacao);
    return palavras.some((t) => contarNoTexto(texto, t));
  };
  return perguntasDe(materia).filter((p) => p.nivel === nivel && (!peloSlide || noTema(p))).map((p) => ({
    ...p, chave: materia.id + "|" + p.pergunta, materia: materia.nome,
    opcoes: embaralhar([p.certa, ...p.erradas]), peso: p.exemplo ? 3 : 0
  }));
}

// Ordena cada fila e reveza entre as matérias, sem repetir no mesmo quiz.
// Primeiro as nunca respondidas (as em português antes das em inglês),
// depois as respondidas há mais tempo.
function escolher(filas) {
  const ultimaVez = (p) => estado.vistas[p.chave] || 0;
  const prontas = embaralhar(filas).map((fila) => embaralhar(fila)
    .filter((p) => !estado.ocultas[p.chave])
    .sort((a, b) => ultimaVez(a) - ultimaVez(b) || a.peso - b.peso));
  const usadas = new Set();
  const escolhidas = [];
  while (escolhidas.length < PERGUNTAS_POR_QUIZ && prontas.some((f) => f.length)) {
    for (const fila of prontas) {
      while (fila.length && usadas.has(fila[0].chave)) fila.shift();
      if (!fila.length || escolhidas.length >= PERGUNTAS_POR_QUIZ) continue;
      usadas.add(fila[0].chave);
      escolhidas.push(fila.shift());
    }
  }
  return embaralhar(escolhidas);
}

// Perguntas da IA primeiro; o que faltar vem do site e dos bancos abertos.
async function montarPerguntas(sinal) {
  const nivel = modoAtual().nivel;
  const jaVista = (chave) => Boolean(estado.vistas[chave] || estado.ocultas[chave]);
  const materias = materiasSelecionadas();
  const cota = Math.ceil(PERGUNTAS_POR_QUIZ / materias.length);
  const reserva = { pedidos: LOTES_POR_QUIZ };
  let falhou = false;
  let erroIA = null;
  let semArquivo = 0;
  const filas = await Promise.all(materias.map(async (materia) => {
    const daIA = await questoesIA(materia, nivel, cota, jaVista, reserva, sinal);
    erroIA = erroIA || daIA.erro;
    if (daIA.semArquivo) semArquivo++;
    const fila = daIA.lista;
    const bastante = materias.length === 1 ? PERGUNTAS_POR_QUIZ : cota;
    const ineditas = () => fila.filter((p) => !p.exemplo && !jaVista(p.chave)).length;
    if (ineditas() >= bastante) return fila;
    fila.push(...filaLocal(materia));
    const comum = { materia: materia.nome };
    if (nivel === 2 || nivel === 3) {
      const pt = await questoesPortugues(materia);
      falhou = falhou || pt.falhou;
      fila.push(...pt.lista.filter((q) => q.nivel === nivel).map((q) => ({ ...q, ...comum, peso: 1 })));
    }
    const prontas = ineditas();
    if (prontas < PERGUNTAS_POR_QUIZ) {
      const en = await questoesIngles(materia, jaVista, PERGUNTAS_POR_QUIZ - prontas, nivel);
      falhou = falhou || en.falhou;
      fila.push(...en.lista.map((q) => ({ ...q, ...comum, peso: 2 + q.distancia })));
    }
    return fila;
  }));
  return { perguntas: escolher(filas), falhou, erroIA, semArquivo: semArquivo === materias.length };
}

function linhaFonte(p) {
  if (p.ia) {
    const onde = p.arquivo + (p.pagina ? ", " + (/\.pptx$/i.test(p.arquivo) ? "slide " : "página ") + p.pagina : "");
    const situacao = p.nivel >= 3 ? "assunto do slide, aprofundado pela IA e não conferido"
      : p.conferida ? "trecho achado no arquivo: “" + p.trecho + "”" : "trecho não conferido";
    return el("p", { class: "fonte" }, "Criada por IA a partir de " + onde + " · " + situacao);
  }
  if (p.origem) {
    const origem = ORIGENS[p.origem];
    return el("p", { class: "fonte" }, "Fonte: ",
      el("a", { href: origem.url, target: "_blank", rel: "noopener noreferrer" }, origem.nome),
      (p.ano ? ", " + p.ano : "") + (p.ingles && traducoes[p.chave] ? (traducoes[p.chave].porIA ? " · traduzida por IA" : " · tradução automática") : "") + " · dificuldade estimada, não revisada");
  }
  if (p.exemplo) return el("p", { class: "fonte" }, "Pergunta de exemplo, sem fonte conferida.");
  const fonte = FONTES[p.fonte];
  if (!fonte) return el("p", { class: "fonte" }, "Fonte: conceito clássico, ainda não conferido em uma fonte específica.");
  return el("p", { class: "fonte" }, "Fonte: ",
    el("a", { href: fonte.url, target: "_blank", rel: "noopener noreferrer" }, fonte.nome));
}

let busca = 0;          // número da busca atual; mudar de tela cancela
let carregando = false;
let controleIA = null;  // para parar a IA sem sair do quiz

async function comecarQuiz() {
  if (carregando) return;
  if (!materiasSelecionadas().length) {
    ir("selecionar");
    avisar("Escolha as matérias do quiz primeiro.");
    return;
  }
  const modo = modoAtual();
  const minha = ++busca;
  carregando = true;
  ligarTradutor((p) => avisar("Baixando o tradutor do Chrome: " + p + "%"));
  controleIA = new AbortController();
  telaCarregando(temIA() ? "criando perguntas dos seus slides…" : "buscando questões…", "não esperar, usar o banco");
  const { perguntas, falhou, erroIA, semArquivo } = await montarPerguntas(controleIA.signal);
  if (minha !== busca) return; // a pessoa saiu durante a busca
  const emIngles = perguntas.filter((p) => p.ingles && !(traducoes[p.chave] || {}).porIA);
  let erroTraducao = null;
  if (temIA() && emIngles.length) {
    controleIA = new AbortController();
    telaCarregando("traduzindo as questões do banco…", "não esperar, usar o tradutor do Chrome");
    erroTraducao = await traduzirComIA(emIngles, controleIA.signal);
    if (minha !== busca) return;
  }
  carregando = false;
  if (!perguntas.length) {
    ir("inicio");
    avisar(falhou ? "O banco online não respondeu. Confira a internet." : "Nenhuma questão encontrada. Abra a matéria e arraste seus slides.");
    return;
  }
  quiz = { modo: modo.nome, perguntas, atual: 0, respostas: [], original: {}, terminou: false };
  ir("quiz");
  if (erroIA && erroIA.tipo !== "cancelado") avisar("IA: " + erroIA.message + ". Completei com o que estava guardado e com o banco.");
  else if (erroTraducao && erroTraducao.tipo !== "cancelado") avisar("IA: " + erroTraducao.message + ". Parte do quiz usa o tradutor do Chrome.");
  else if (temIA() && semArquivo) avisar("A IA ainda não tem seus slides. Arraste os arquivos de novo na matéria.");
  else if (falhou) avisar("O banco online não respondeu. Usando as questões guardadas.");
}

function telaCarregando(titulo, pular) {
  mostrar(el("div", { class: "conteudo" },
    el("section", { class: "cartao cartao-quiz carregando" },
      el("h1", { class: "titulo-tela" }, titulo),
      temIA() && el("p", { class: "traducao" }, "Pode levar de 1 a 2 minutos. Na próxima vez, aproveita o que já ficou pronto."),
      temIA() && el("button", { type: "button", class: "botao botao-claro", onclick: (e) => {
        e.target.disabled = true;
        controleIA.abort();
      } }, pular),
      el("button", { type: "button", class: "botao botao-claro", onclick: () => ir("inicio") }, "cancelar")
    )
  ));
}

// Texto que aparece na tela: traduzido quando houver, ou o original.
function textoDe(p, verOriginal) {
  const t = p.ingles && !verOriginal && traducoes[p.chave];
  return t || { pergunta: p.pergunta, opcoes: p.opcoes, explicacao: p.explicacao };
}

function telaPergunta() {
  if (quiz.terminou) return telaResultado();
  const p = quiz.perguntas[quiz.atual];
  const total = quiz.perguntas.length;
  const ultima = quiz.atual === total - 1;
  const estaRodada = quiz;
  const estaPergunta = quiz.atual;
  const enunciado = el("h1", { class: "pergunta" });
  const linhaTraducao = el("span", { class: "traducao" });
  const explicacao = el("div", { class: "explicacao", "aria-live": "polite" });

  const textoExplicacao = el("span");
  function escreverTextos() {
    const verOriginal = quiz.original[quiz.atual];
    const texto = textoDe(p, verOriginal);
    enunciado.textContent = texto.pergunta;
    botoes.forEach((botao, i) => {
      botao.firstChild.textContent = (p.letras ? "ABCDE"[i] + ") " : "") + texto.opcoes[i];
    });
    textoExplicacao.textContent = texto.explicacao || "Esta questão não traz explicação.";
    if (!p.ingles) return;
    linhaTraducao.replaceChildren(traducoes[p.chave]
      ? el("button", { type: "button", class: "link", onclick: () => {
          quiz.original[quiz.atual] = !verOriginal;
          escreverTextos();
        } }, verOriginal ? "ver tradução" : "ver original")
      : quiz.semTraducao ? "sem tradução: em inglês" : "traduzindo…");
  }

  const botoes = p.opcoes.map((opcao) => el("button", { type: "button", class: "opcao", onclick: (e) => {
    if (quiz.respostas[quiz.atual] !== undefined) return;
    quiz.respostas[quiz.atual] = opcao;
    estado.vistas[p.chave] = ++estado.contador;
    salvar();
    mostrarResposta();
    $(".explicacao .botao").focus();
  } }, el("span")));

  function mostrarResposta() {
    const escolhida = quiz.respostas[quiz.atual];
    botoes.forEach((botao, i) => {
      botao.disabled = true;
      if (p.opcoes[i] === p.certa) { botao.classList.add("certa"); botao.append(el("b", {}, "✓ certa")); }
      else if (p.opcoes[i] === escolhida) { botao.classList.add("errada"); botao.append(el("b", {}, "✗ sua resposta")); }
    });
    explicacao.replaceChildren(
      el("p", {}, el("strong", {}, escolhida === p.certa ? "Certo! " : "Não foi dessa vez. "), textoExplicacao),
      linhaFonte(p),
      el("div", { class: "rodape-resposta" },
        el("button", { type: "button", class: "link", onclick: (e) => {
          estado.ocultas[p.chave] = true;
          salvar();
          e.target.disabled = true;
          e.target.textContent = "questão escondida";
        } }, "esconder esta questão"),
        el("button", { type: "button", class: "botao botao-forte", onclick: avancar }, ultima ? "concluir quiz" : "próxima"))
    );
  }

  function avancar() {
    if (ultima) {
      quiz.subiu = concluirDia();
      quiz.terminou = true;
    } else {
      quiz.atual += 1;
    }
    telaPergunta();
  }

  const feito = Math.round(((quiz.atual + 1) / total) * 100);
  mostrar(el("div", { class: "conteudo" },
    el("section", { class: "cartao cartao-quiz" },
      el("div", { class: "quiz-topo" },
        el("span", {}, quiz.modo + " · " + (quiz.atual + 1) + " de " + total),
        el("button", { type: "button", class: "link", onclick: sairDoQuiz }, "sair")
      ),
      el("div", { class: "progresso", "aria-hidden": "true" }, el("div", { style: "width:" + feito + "%" })),
      el("div", { class: "assunto-linha" }, el("p", { class: "assunto materia" }, p.materia), linhaTraducao),
      enunciado,
      el("div", { class: "opcoes" }, botoes),
      explicacao
    )
  ));
  escreverTextos();
  if (quiz.respostas[quiz.atual] !== undefined) mostrarResposta();

  // Traduz esta e adianta as duas próximas.
  (async () => {
    if (p.ingles && !traducoes[p.chave]) {
      const feita = await traduzirQuestao(p);
      if (quiz !== estaRodada || quiz.atual !== estaPergunta || quiz.terminou) return;
      if (!feita) quiz.semTraducao = true;
      escreverTextos();
    }
    for (const proxima of estaRodada.perguntas.slice(estaPergunta + 1, estaPergunta + 3)) {
      if (proxima.ingles) await traduzirQuestao(proxima);
    }
  })();
}

function sairDoQuiz() {
  confirmar("sair do quiz?", "As respostas deste quiz serão perdidas e o foguinho não muda.", "sair", () => ir("inicio"));
}

function telaResultado() {
  const total = quiz.perguntas.length;
  const erradas = quiz.perguntas.map((p, i) => ({ p, r: quiz.respostas[i] })).filter(({ p, r }) => r !== p.certa);
  const acertos = total - erradas.length;

  mostrar(el("div", { class: "conteudo" },
    el("section", { class: "cartao cartao-quiz resultado" + (quiz.subiu ? " subiu" : "") },
      el("div", { class: "fogo-grande", "aria-hidden": "true" }, "🔥"),
      el("p", { class: "fogo-numero", "aria-label": "Sequência de " + plural(foguinhoAtual(), "dia", "dias") }, String(foguinhoAtual())),
      el("h1", { class: "mensagem" }, quiz.subiu ? "Quiz do dia concluído! Seu foguinho aumentou." : "Treino concluído! O foguinho de hoje já estava garantido."),
      el("p", { class: "nota" }, "Você acertou " + acertos + " de " + total + " · " + quiz.modo),
      erradas.length > 0 && el("div", { class: "revisao" },
        el("h2", {}, "Para revisar"),
        el("ul", {}, erradas.map(({ p }) => {
          const texto = textoDe(p, false);
          const certa = texto.opcoes[p.opcoes.indexOf(p.certa)];
          return el("li", {},
            el("p", {}, texto.pergunta),
            el("p", {}, "Resposta: " + certa.replace(/\.$/, "") + ". " + texto.explicacao),
            linhaFonte(p));
        }))
      ),
      el("div", { class: "acoes" },
        el("button", { type: "button", class: "botao botao-claro", onclick: comecarQuiz }, "treinar de novo"),
        el("button", { type: "button", class: "botao botao-forte", onclick: () => ir("inicio") }, "voltar ao início")
      )
    )
  ));
}

/* ============================================================
   10. CONFIGURAR IA
   ============================================================ */
function abrirIA() {
  $("#chave-ia").value = "";
  $("#chave-ia").placeholder = temIA() ? "chave já salva (cole outra para trocar)" : "cole aqui a sua chave";
  $("#resultado-ia").textContent = temIA() ? "IA ligada." + (configIA.modelos ? " Modelo: " + configIA.modelos[0] + "." : "") : "";
  $("#apagar-ia").hidden = !temIA();
  $("#janela-ia").showModal();
}

$("#form-ia").addEventListener("submit", async (e) => {
  e.preventDefault();
  const saida = $("#resultado-ia");
  const chave = $("#chave-ia").value.trim();
  if (!chave) { saida.textContent = temIA() ? "A chave salva continua valendo." : "Cole a chave primeiro."; return; }
  if (!/^[\w.-]{20,200}$/.test(chave)) { saida.textContent = "Isso não parece uma chave. Copie de novo, sem espaços."; return; }
  const botao = $("#salvar-ia");
  botao.disabled = true;
  saida.textContent = "Testando a chave…";
  try {
    const modelos = await listarModelos(chave);
    if (!guardarIA({ chave, modelos, quando: Date.now() })) throw new Error("este navegador não deixou salvar a chave");
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
    $("#chave-ia").value = "";
    $("#apagar-ia").hidden = false;
    saida.textContent = "Chave aceita. IA ligada, modelo " + modelos[0] + ".";
    if ($(".modos")) telaInicial();
  } catch (erro) {
    saida.textContent = "Não deu: " + erro.message + ".";
  }
  botao.disabled = false;
});

$("#apagar-ia").addEventListener("click", () => {
  guardarIA({});
  $("#apagar-ia").hidden = true;
  $("#chave-ia").placeholder = "cole aqui a sua chave";
  $("#resultado-ia").textContent = "Chave apagada deste navegador. IA desligada.";
  if ($(".modos")) telaInicial();
});

/* ============================================================
   11. INÍCIO
   ============================================================ */
window.addEventListener("hashchange", desenhar);
// Ao voltar para a aba em outro dia, atualiza o foguinho da tela inicial.
document.addEventListener("visibilitychange", () => {
  const naInicial = !["selecionar", "cadastrar", "materia", "quiz"].includes(location.hash.slice(1).split("/")[0]);
  if (!document.hidden && naInicial && !carregando && !$("dialog[open]")) telaInicial();
});
desenhar();
carregarListaIA().then(() => {
  if (redesenharMateriais) redesenharMateriais();
  if ($(".modos") && !carregando && !$("dialog[open]")) telaInicial();
});
