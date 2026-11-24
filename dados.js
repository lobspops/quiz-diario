/* ============================================================
   DADOS DE EXEMPLO
   Tudo aqui é fictício e serve para testar o aplicativo.
   Revise as perguntas antes de usá-las para estudar de verdade.

   Formato de cada pergunta:
     nivel      1 = fácil, 2 = médio, 3 = difícil, 4 = extremo
     pergunta   o enunciado
     certa      a alternativa correta
     erradas    três alternativas incorretas
     explicacao texto curto mostrado depois da resposta
   (o aplicativo embaralha as alternativas sozinho)
   ============================================================ */

const FOGUINHO_INICIAL = 0;

/* Todo quiz tem esta quantidade; o que muda entre os modos é só o nível. */
const PERGUNTAS_POR_QUIZ = 30;

const MODOS = [
  { id: "facil",   nome: "modo fácil",   nivel: 1, descricao: "graduação: questões que você importar" },
  { id: "medio",   nome: "modo médio",   nivel: 2, descricao: "graduação detalhada: questões que você importar" },
  { id: "dificil", nome: "modo difícil", nivel: 3, descricao: "nível concurso (Enare e banco online)" },
  { id: "extremo", nome: "modo extremo", nivel: 4, descricao: "nível pós (provas de seleção)" }
];

const MATERIAS_EXEMPLO = [
  {
    id: "oclusao", nome: "oclusão e dtm", selecionada: true,
    materiais: ["aula 01 - introdução à oclusão.pdf", "aula 02 - movimentos mandibulares.pdf", "resumo dtm.pdf", "exame clínico da atm.pdf", "placas oclusais.pdf", "lista de exercícios.pdf"]
  },
  {
    id: "anatomia", nome: "anatomia cabeça e pescoço", selecionada: true,
    materiais: ["nervos cranianos.pdf", "músculos da mastigação.pdf", "irrigação da face.pdf"]
  },
  {
    id: "radiologia", nome: "radiologia", selecionada: false,
    materiais: ["técnicas intrabucais.pdf", "tomografia computadorizada.pdf"]
  },
  {
    id: "estomatologia", nome: "estomatologia", selecionada: false,
    materiais: ["lesões brancas.pdf", "biópsia.pdf"]
  },
  {
    id: "patologia", nome: "patologia", selecionada: false,
    materiais: ["cistos odontogênicos.pdf", "inflamação.pdf"]
  },
  {
    id: "fisiologia", nome: "fisiologia bucal", selecionada: false,
    materiais: ["saliva.pdf", "reflexos mastigatórios.pdf"]
  }
];

const PERGUNTAS = {
  oclusao: [
    { nivel: 1, pergunta: "O que significa a sigla DTM?", certa: "Disfunção temporomandibular", erradas: ["Distúrbio do tônus mastigatório", "Deslocamento traumático da mandíbula", "Dor temporal e maxilar"], explicacao: "DTM reúne problemas da articulação temporomandibular, dos músculos da mastigação e de estruturas associadas." },
    { nivel: 1, pergunta: "Qual destes músculos eleva a mandíbula?", certa: "Masseter", erradas: ["Milo-hióideo", "Gênio-hióideo", "Ventre anterior do digástrico"], explicacao: "O masseter eleva a mandíbula. Os outros três participam do abaixamento." },
    { nivel: 2, pergunta: "O que caracteriza a máxima intercuspidação habitual (MIH)?", certa: "O maior número de contatos entre os dentes", erradas: ["Os músculos em repouso completo", "A maior abertura possível da boca", "Contato apenas entre os incisivos"], explicacao: "A MIH é uma posição definida pelos dentes: é onde há o máximo de contatos entre as arcadas." },
    { nivel: 2, pergunta: "O que é o espaço funcional livre?", certa: "A distância entre as arcadas com a mandíbula em repouso", erradas: ["O espaço entre o côndilo e a fossa na abertura", "O diastema entre os incisivos centrais", "A distância entre as arcadas na abertura máxima"], explicacao: "Com a mandíbula em repouso, os dentes não se tocam; fica um espaço de cerca de 3 mm." },
    { nivel: 3, pergunta: "Na guia anterior adequada, o que se espera durante a protrusão?", certa: "Contato anterior e desoclusão dos posteriores", erradas: ["Contato posterior e desoclusão dos anteriores", "Contato simultâneo de todos os dentes", "Contato somente entre os últimos molares"], explicacao: "Os dentes anteriores guiam o movimento e separam os posteriores, protegendo-os." },
    { nivel: 3, pergunta: "Estalidos na abertura e no fechamento, com abertura normal, sugerem qual condição?", certa: "Deslocamento do disco com redução", erradas: ["Deslocamento do disco sem redução", "Anquilose da ATM", "Fratura do côndilo"], explicacao: "O disco deslocado volta à posição na abertura e torna a se deslocar no fechamento, gerando os estalidos." },
    { nivel: 4, pergunta: "Paciente tinha estalido, que sumiu de repente, e agora abre pouco a boca, com desvio para o lado afetado. Qual a hipótese principal?", certa: "Deslocamento do disco sem redução", erradas: ["Deslocamento do disco com redução", "Subluxação da ATM", "Mialgia isolada do temporal"], explicacao: "O disco deixa de reduzir e bloqueia a translação do côndilo: o estalido some e a abertura fica limitada." },
    { nivel: 4, pergunta: "Na lateralidade, para onde se move o côndilo do lado de não trabalho?", certa: "Para frente, para baixo e para medial", erradas: ["Para trás, para cima e para lateral", "Para frente, para cima e para lateral", "Apenas gira, sem se deslocar"], explicacao: "O côndilo de não trabalho (balanceio) translada sobre a eminência, indo para frente, baixo e medial." }
  ],

  anatomia: [
    { nivel: 1, pergunta: "Qual nervo é o principal responsável pela sensibilidade da face?", certa: "Trigêmeo (V)", erradas: ["Facial (VII)", "Hipoglosso (XII)", "Acessório (XI)"], explicacao: "O trigêmeo leva a sensibilidade da face por seus três ramos: oftálmico, maxilar e mandibular." },
    { nivel: 1, pergunta: "Qual osso da face se movimenta durante a mastigação?", certa: "Mandíbula", erradas: ["Maxila", "Zigomático", "Vômer"], explicacao: "A mandíbula se articula com o osso temporal na ATM e é o osso móvel da face." },
    { nivel: 2, pergunta: "Qual nervo comanda os músculos da mímica facial?", certa: "Facial (VII)", erradas: ["Trigêmeo (V)", "Glossofaríngeo (IX)", "Vago (X)"], explicacao: "O nervo facial é o motor da mímica. O trigêmeo é o motor da mastigação." },
    { nivel: 2, pergunta: "Onde se abre o ducto da glândula parótida?", certa: "Na bochecha, junto ao segundo molar superior", erradas: ["No assoalho bucal, ao lado do freio lingual", "No palato duro, atrás dos incisivos", "No fundo de vestíbulo inferior"], explicacao: "O ducto parotídeo atravessa o bucinador e se abre na mucosa da bochecha, próximo ao segundo molar superior." },
    { nivel: 3, pergunta: "Por qual abertura o nervo mandibular (V3) sai do crânio?", certa: "Forame oval", erradas: ["Forame redondo", "Forame espinhoso", "Fissura orbital superior"], explicacao: "V3 passa pelo forame oval, V2 pelo redondo e V1 pela fissura orbital superior." },
    { nivel: 3, pergunta: "Qual músculo da mastigação se relaciona com a cápsula e o disco da ATM?", certa: "Pterigóideo lateral", erradas: ["Pterigóideo medial", "Temporal", "Masseter"], explicacao: "Fibras da cabeça superior do pterigóideo lateral se inserem na cápsula e no disco da ATM." },
    { nivel: 4, pergunta: "Que fibras a corda do tímpano leva ao nervo lingual?", certa: "Gustativas e parassimpáticas", erradas: ["Motoras e de sensibilidade dolorosa", "Simpáticas e motoras", "Apenas proprioceptivas"], explicacao: "Ela leva a gustação dos dois terços anteriores da língua e fibras parassimpáticas para as glândulas submandibular e sublingual." },
    { nivel: 4, pergunta: "Em qual gânglio fazem sinapse as fibras parassimpáticas destinadas à parótida?", certa: "Ótico", erradas: ["Pterigopalatino", "Submandibular", "Ciliar"], explicacao: "As fibras vêm do glossofaríngeo, fazem sinapse no gânglio ótico e seguem pelo nervo auriculotemporal." }
  ],

  radiologia: [
    { nivel: 1, pergunta: "Como estruturas mais densas, como o esmalte, aparecem na radiografia?", certa: "Radiopacas (claras)", erradas: ["Radiolúcidas (escuras)", "Invisíveis", "Sempre borradas"], explicacao: "Estruturas densas absorvem mais raios X e aparecem claras, isto é, radiopacas." },
    { nivel: 1, pergunta: "Qual exame mostra as duas arcadas em uma única imagem?", certa: "Panorâmica", erradas: ["Periapical", "Interproximal", "Oclusal"], explicacao: "A panorâmica dá uma visão geral da maxila, da mandíbula e de estruturas vizinhas." },
    { nivel: 2, pergunta: "Para que a radiografia interproximal (bite-wing) é especialmente indicada?", certa: "Detectar cáries entre os dentes", erradas: ["Avaliar o ápice dos caninos", "Estudar os seios maxilares", "Medir o crescimento facial"], explicacao: "Ela mostra bem as faces proximais das coroas e a crista óssea alveolar." },
    { nivel: 2, pergunta: "O que propõe o princípio ALARA?", certa: "Usar a menor dose razoavelmente possível", erradas: ["Repetir a imagem para confirmar o achado", "Usar a maior dose para ter mais nitidez", "Radiografar a cada seis meses"], explicacao: "ALARA orienta manter a dose tão baixa quanto razoavelmente exequível, sem perder a utilidade do exame." },
    { nivel: 3, pergunta: "Na técnica de Clark, o objeto que se move no mesmo sentido do tubo está em qual posição?", certa: "Lingual ou palatina", erradas: ["Vestibular", "Apical", "Não é possível saber"], explicacao: "O objeto lingual acompanha o tubo; o vestibular se move no sentido oposto." },
    { nivel: 3, pergunta: "O que acontece com o contraste da imagem quando se aumenta o kVp?", certa: "Diminui", erradas: ["Aumenta", "Não se altera", "Inverte-se"], explicacao: "Com feixe mais penetrante há mais tons de cinza intermediários e menor contraste." },
    { nivel: 4, pergunta: "O aspecto radiográfico de “raios de sol” é classicamente associado a qual lesão?", certa: "Osteossarcoma", erradas: ["Cisto dentígero", "Odontoma composto", "Cisto radicular"], explicacao: "A formação óssea perpendicular à cortical, em alguns osteossarcomas, dá esse aspecto." },
    { nivel: 4, pergunta: "Na técnica do paralelismo, como se compensa a maior distância entre objeto e receptor?", certa: "Aumentando a distância do foco ao receptor", erradas: ["Reduzindo a distância do foco ao receptor", "Inclinando o feixe na direção da bissetriz", "Retirando o colimador"], explicacao: "Uma distância focal maior deixa o feixe mais paralelo e reduz a ampliação da imagem." }
  ],

  estomatologia: [
    { nivel: 1, pergunta: "Úlcera dolorosa e recorrente, em mucosa móvel e sem vesícula prévia, sugere o quê?", certa: "Afta", erradas: ["Leucoplasia", "Fibroma", "Língua geográfica"], explicacao: "A ulceração aftosa recorrente costuma surgir em mucosa não queratinizada, sem fase de vesícula." },
    { nivel: 1, pergunta: "Quais são os principais fatores de risco clássicos do câncer de boca?", certa: "Tabaco e álcool", erradas: ["Açúcar e café", "Bruxismo e estresse", "Flúor e clorexidina"], explicacao: "Tabaco e álcool aumentam o risco, e o efeito é ainda maior quando estão associados." },
    { nivel: 2, pergunta: "Placa branca que não sai à raspagem e não corresponde a outra doença definida recebe qual nome clínico?", certa: "Leucoplasia", erradas: ["Candidíase pseudomembranosa", "Eritroplasia", "Afta maior"], explicacao: "Leucoplasia é um termo clínico, usado depois de excluir outras doenças. Ela é potencialmente maligna." },
    { nivel: 2, pergunta: "Placas brancas removíveis à raspagem, com base avermelhada, sugerem o quê?", certa: "Candidíase pseudomembranosa", erradas: ["Leucoplasia", "Leucoedema", "Nevo branco esponjoso"], explicacao: "Na candidíase pseudomembranosa (“sapinho”), as placas se soltam com a raspagem." },
    { nivel: 3, pergunta: "As estrias de Wickham são características de qual doença?", certa: "Líquen plano", erradas: ["Pênfigo vulgar", "Herpes simples", "Sífilis primária"], explicacao: "São linhas brancas entrelaçadas, típicas da forma reticular do líquen plano." },
    { nivel: 3, pergunta: "O que é removido em uma biópsia incisional?", certa: "Uma parte representativa da lesão", erradas: ["A lesão inteira com margem", "Apenas células raspadas da superfície", "Somente o líquido da lesão"], explicacao: "A incisional retira uma parte da lesão; a excisional retira a lesão toda." },
    { nivel: 4, pergunta: "Sinal de Nikolsky positivo e anticorpos contra desmogleínas apontam para qual doença?", certa: "Pênfigo vulgar", erradas: ["Líquen plano reticular", "Herpes-zóster", "Afta herpetiforme"], explicacao: "Os anticorpos atacam as desmogleínas e separam as células do epitélio (acantólise)." },
    { nivel: 4, pergunta: "Onde ocorre a separação dos tecidos no penfigoide das membranas mucosas?", certa: "Abaixo do epitélio", erradas: ["Dentro da camada espinhosa", "Na camada córnea", "Dentro da camada muscular"], explicacao: "No penfigoide a fenda é subepitelial; no pênfigo vulgar ela é intraepitelial." }
  ],

  patologia: [
    { nivel: 1, pergunta: "Qual destes NÃO é um sinal cardinal da inflamação aguda?", certa: "Necrose", erradas: ["Calor", "Rubor", "Edema (tumor)"], explicacao: "Os sinais cardinais são calor, rubor, tumor (edema), dor e perda de função." },
    { nivel: 1, pergunta: "O que é hiperplasia?", certa: "Aumento do número de células", erradas: ["Aumento do tamanho das células", "Redução do tamanho das células", "Morte programada das células"], explicacao: "Hiperplasia é aumento do número; hipertrofia é aumento do tamanho das células." },
    { nivel: 2, pergunta: "O que é metaplasia?", certa: "Troca de um tipo celular maduro por outro", erradas: ["Perda total da diferenciação celular", "Crescimento maligno e invasivo", "Diminuição do volume de um órgão"], explicacao: "É uma adaptação, em geral reversível, em que um tecido maduro dá lugar a outro." },
    { nivel: 2, pergunta: "Qual cisto envolve a coroa de um dente não erupcionado?", certa: "Dentígero", erradas: ["Radicular", "Periodontal lateral", "Nasopalatino"], explicacao: "O cisto dentígero se forma em torno da coroa e se prende à junção amelocementária." },
    { nivel: 3, pergunta: "De onde vem o epitélio do cisto radicular?", certa: "Restos epiteliais de Malassez", erradas: ["Epitélio reduzido do esmalte", "Ducto nasopalatino", "Epitélio do seio maxilar"], explicacao: "A inflamação periapical estimula a proliferação dos restos de Malassez, no ligamento periodontal." },
    { nivel: 3, pergunta: "Qual tipo de necrose é característico da tuberculose?", certa: "Caseosa", erradas: ["Liquefativa", "Gordurosa", "Fibrinoide"], explicacao: "A necrose caseosa tem aspecto de queijo e aparece no centro de granulomas da tuberculose." },
    { nivel: 4, pergunta: "Múltiplos ceratocistos odontogênicos levantam a suspeita de qual síndrome?", certa: "Gorlin-Goltz", erradas: ["Gardner", "Sjögren", "Peutz-Jeghers"], explicacao: "A síndrome do carcinoma nevoide basocelular (Gorlin-Goltz) costuma cursar com ceratocistos múltiplos." },
    { nivel: 4, pergunta: "Qual alteração genética é frequente no ameloblastoma, sobretudo em mandíbula?", certa: "BRAF V600E", erradas: ["APC", "RET", "TP53 R175H"], explicacao: "A mutação BRAF V600E ativa a via MAPK e é frequente em ameloblastomas mandibulares." }
  ],

  fisiologia: [
    { nivel: 1, pergunta: "Qual é a principal função da amilase salivar?", certa: "Iniciar a digestão do amido", erradas: ["Digerir proteínas", "Produzir vitamina C", "Absorver gorduras"], explicacao: "A amilase salivar começa a quebrar o amido ainda na boca." },
    { nivel: 1, pergunta: "Quantos são os gostos básicos clássicos?", certa: "Cinco", erradas: ["Três", "Sete", "Nove"], explicacao: "São doce, salgado, azedo, amargo e umami." },
    { nivel: 2, pergunta: "Qual glândula mais contribui para a saliva em repouso?", certa: "Submandibular", erradas: ["Parótida", "Sublingual", "Glândulas labiais"], explicacao: "Em repouso, a submandibular é a que mais contribui; com estímulo, cresce a participação da parótida." },
    { nivel: 2, pergunta: "Qual é, aproximadamente, o pH crítico da hidroxiapatita do esmalte?", certa: "5,5", erradas: ["3,0", "7,0", "8,2"], explicacao: "Abaixo de cerca de 5,5 o esmalte tende a perder minerais." },
    { nivel: 3, pergunta: "Quais receptores iniciam o reflexo mandibular (mentoniano)?", certa: "Fusos musculares", erradas: ["Botões gustativos", "Nociceptores da polpa", "Corpúsculos de Pacini da pele"], explicacao: "É um reflexo de estiramento: os fusos dos músculos elevadores disparam a contração." },
    { nivel: 3, pergunta: "Qual é o principal tampão da saliva estimulada?", certa: "Bicarbonato", erradas: ["Hemoglobina", "Mucina", "Lisozima"], explicacao: "A concentração de bicarbonato aumenta com o fluxo salivar e ajuda a neutralizar ácidos." },
    { nivel: 4, pergunta: "Onde ficam os corpos celulares dos neurônios que inervam os fusos dos músculos elevadores da mandíbula?", certa: "Núcleo mesencefálico do trigêmeo", erradas: ["Núcleo espinal do trigêmeo", "Gânglio ótico", "Núcleo do hipoglosso"], explicacao: "É uma exceção: esses neurônios sensitivos primários ficam dentro do sistema nervoso central." },
    { nivel: 4, pergunta: "Quando o fluxo salivar aumenta, o que ocorre com a concentração de sódio na saliva?", certa: "Aumenta", erradas: ["Diminui", "Não se altera", "Chega a zero"], explicacao: "Com fluxo rápido, os ductos têm menos tempo para reabsorver o sódio." }
  ]
};

/* Tudo que está acima é exemplo. As questões definitivas ficam na
   pasta "questoes" e entram por adicionarQuestoes(), que troca os
   exemplos daquela matéria e nível pelas definitivas. */
Object.values(PERGUNTAS).flat().forEach((p) => { p.exemplo = true; });

const FONTES = {};

function adicionarQuestoes(materia, nivel, lista) {
  const restantes = (PERGUNTAS[materia] || []).filter((p) => !(p.exemplo && p.nivel === nivel));
  PERGUNTAS[materia] = restantes.concat(lista.map((p) => ({ nivel, ...p })));
}
