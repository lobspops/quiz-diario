"use strict";

/* ============================================================
   VOCABULÁRIO DE ODONTOLOGIA
   Cada linha:  grupo ; começos de palavra em português ; busca em inglês
   - em português, sem acento; mais de um começo separado por vírgula
   - começos com até 4 letras só valem como palavra inteira
   Pode acrescentar linhas à vontade.
   ============================================================ */
const VOCABULARIO = `
oclusao;oclus,intercuspid;occlusion
oclusao;temporomandib,atm,dtm;temporomandibular
oclusao;condil;condyl
oclusao;disco articular,deslocamento de disco;articular disc
oclusao;bruxismo;bruxism
oclusao;relacao centrica;centric relation
oclusao;articulador;articulator
oclusao;mastigat,mastigac;mastication
oclusao;guia canina,guia anterior;canine guid
oclusao;placa oclusal,placa estabilizadora,placa miorrelaxante;splint
oclusao;dimensao vertical;vertical dimension
oclusao;lateralidade,trabalho e balanceio;lateral excursi
oclusao;protrus;protrusi
oclusao;anquilose;ankylosis
oclusao;luxacao da mandibula,luxacao mandibular;dislocation
anatomia;nervo facial;facial nerve
anatomia;trigemeo;trigeminal
anatomia;nervo mandibular;mandibular nerve
anatomia;nervo maxilar;maxillary nerve
anatomia;alveolar inferior;inferior alveolar
anatomia;nervo lingual;lingual nerve
anatomia;hipoglosso;hypoglossal
anatomia;glossofaringeo;glossopharyngeal
anatomia;nervos cranianos,nervo craniano,pares cranianos;cranial nerve
anatomia;masseter;masseter
anatomia;pterigoid;pterygoid
anatomia;musculo temporal;temporalis
anatomia;bucinador;buccinator
anatomia;digastrico;digastric
anatomia;milo-hioideo,milohioideo;mylohyoid
anatomia;parotida;parotid
anatomia;submandibular;submandibular
anatomia;sublingual;sublingual
anatomia;palato;palat
anatomia;lingua;tongue
anatomia;faringe;pharyn
anatomia;laringe;laryn
anatomia;carotida;carotid
anatomia;arteria maxilar;maxillary artery
anatomia;arteria facial;facial artery
anatomia;forame;foramen
anatomia;fossa infratemporal,infratemporal;infratemporal
anatomia;seio maxilar,seios paranasais;maxillary sinus
anatomia;mandibula;mandib
anatomia;linfonodo;lymph node
anatomia;esternocleido;sternocleidomastoid
radiologia;radiograf;radiograph
radiologia;panoramica;panoramic
radiologia;interproximal,bite-wing,bitewing;bitewing
radiologia;periapical;periapical
radiologia;tomografia;tomograph
radiologia;feixe conico;cone beam
radiologia;radiolucid;radiolucen
radiologia;radiopac;radiopa
radiologia;raios x,raio x;x-ray
radiologia;bissetriz;bisecting
radiologia;paralelismo;paralleling
radiologia;filme radiografico,filmes radiograficos;x-ray film
radiologia;radioprotecao,protecao radiologica;radiation protection
radiologia;dose de radiacao,radiacao ionizante;radiation
radiologia;ressonancia magnetica;mri
radiologia;cefalometr;cephalometr
radiologia;lamina dura;lamina dura
estomatologia;leucoplas;leukoplakia
estomatologia;eritroplas;erythroplakia
estomatologia;liquen plano;lichen planus
estomatologia;candid;candid
estomatologia;afta,aftas,aftosa;aphth
estomatologia;ulcera,ulcerac;ulcer
estomatologia;penfig;pemphig
estomatologia;penfigoide;pemphigoid
estomatologia;herpes,herpetic;herpe
estomatologia;cancer de boca,cancer bucal,cancer oral;oral cancer
estomatologia;espinocelular,celulas escamosas;squamous cell
estomatologia;queilite;cheilitis
estomatologia;lingua geografica;geographic tongue
estomatologia;hpv,papiloma;papilloma
estomatologia;biopsia;biopsy
estomatologia;xerostomia,boca seca;xerostomia
estomatologia;mucocele;mucocele
estomatologia;ranula;ranula
estomatologia;hemangioma;hemangioma
estomatologia;sifilis;syphilis
estomatologia;ardencia bucal,boca ardente;burning mouth
estomatologia;sjogren;sjogren
estomatologia;sialolit;sialolith
estomatologia;sialoaden;sialadenitis
estomatologia;pigmentac;pigmentation
patologia;cisto;cyst
patologia;dentigero;dentigerous
patologia;cisto radicular;radicular cyst
patologia;ceratocisto,queratocisto;keratocyst
patologia;ameloblastoma;ameloblastoma
patologia;odontoma;odontoma
patologia;tumor odontogenico,tumores odontogenicos,odontogenic;odontogenic
patologia;displasia;dysplasia
patologia;carcinoma;carcinoma
patologia;sarcoma,osteossarcoma;sarcoma
patologia;granuloma;granuloma
patologia;celulas gigantes;giant cell
patologia;osteomielite;osteomyelitis
patologia;adenoma pleomorfico;pleomorphic adenoma
patologia;mucoepidermoide;mucoepidermoid
patologia;metaplasia;metaplasia
patologia;neoplas;neoplas
patologia;necrose;necrosis
patologia;apoptose;apoptosis
patologia;inflamac;inflammation
patologia;hiperplas;hyperplas
patologia;fibroma;fibroma
patologia;osteonecrose;osteonecrosis
patologia;cherubismo,querubismo;cherubism
patologia;paget;paget
patologia;linfoma;lymphoma
fisiologia;saliva,salivar;saliva
fisiologia;gustac,gustativ,paladar;taste
fisiologia;deglut;swallow
fisiologia;hemostas,coagulac;coagulation
fisiologia;fluido gengival,fluido crevicular;gingival fluid
fisiologia;fluido dentinario,hidrodinamica;hydrodynamic
fisiologia;propriocep;proprioce
fisiologia;reflexo mandibular,reflexo mentoniano;jaw jerk
fisiologia;metabolismo do calcio,calcio serico,calcio salivar;calcium
fisiologia;paratormonio,paratireoid;parathyroid
fisiologia;remineraliz;reminerali
fisiologia;desmineraliz;deminerali
histologia;esmalte;enamel
histologia;dentina,dentinari;dentin
histologia;cemento;cementum
histologia;polpa;pulp
histologia;odontoblasto;odontoblast
histologia;ameloblasto;ameloblast
histologia;odontogenese;tooth development
histologia;ligamento periodontal;periodontal ligament
histologia;osso alveolar;alveolar bone
dentistica;carie;caries
dentistica;resina composta;composite
dentistica;amalgama;amalgam
dentistica;ionomero;glass ionomer
dentistica;adesiv,sistema adesivo;bonding
dentistica;condicionamento acido;acid etch
dentistica;clareamento;bleaching
dentistica;restaurac;restorat
dentistica;preparo cavitario;cavity prepar
dentistica;selante;sealant
dentistica;fluor,fluoret;fluorid
endodontia;endodont;endodont
endodontia;canal radicular,canais radiculares;root canal
endodontia;pulpite;pulpitis
endodontia;hipoclorito;hypochlorite
endodontia;hidroxido de calcio;calcium hydroxide
endodontia;mta;mta
endodontia;guta-percha,guta percha;gutta
endodontia;avuls;avuls
endodontia;reabsorc;resorption
periodontia;periodont;periodont
periodontia;gengivite;gingivitis
periodontia;gengiv;gingiva
periodontia;biofilme,placa bacteriana;plaque
periodontia;calculo dental,calculo dentario,tartaro;calculus
periodontia;raspagem;scaling
periodontia;bolsa periodontal;periodontal pocket
periodontia;furca;furcation
periodontia;recessao gengival;recession
periodontia;regeneracao tecidual;regeneration
protese;protese total,dentadura;complete denture
protese;protese parcial removivel,ppr;partial denture
protese;protese fixa,ponte fixa;fixed partial
protese;coroa total,coroas totais,metaloceramica;crown
protese;implante;implant
protese;osseointegr;osseointegra
protese;moldagem;impression
protese;ceramica,porcelana;porcelain
cirurgia;exodontia,extracao dentaria;extraction
cirurgia;terceiro molar,terceiros molares;third molar
cirurgia;dente incluso,dentes inclusos,impactad;impact
cirurgia;alveolite;dry socket
cirurgia;fratura;fracture
cirurgia;angina de ludwig;ludwig
cirurgia;le fort;le fort
cirurgia;osteotomia;osteotom
cirurgia;enxerto;graft
cirurgia;sutura;sutur
farmacologia;anestes;anesthe
farmacologia;lidocaina;lidocaine
farmacologia;articaina;articaine
farmacologia;vasoconstritor,epinefrina,adrenalina;epinephrine
farmacologia;antibiotic,amoxicilina;antibiotic
farmacologia;profilaxia antibiotica,endocardite;endocarditis
farmacologia;analgesic;analgesic
farmacologia;bisfosfonato;bisphosphonate
farmacologia;bloqueio do nervo,bloqueio regional;nerve block
ortodontia;ortodont;orthodont
ortodontia;maloclus,ma oclusao;malocclusion
ortodontia;classe de angle,classificacao de angle;angles class
ortodontia;mordida cruzada;crossbite
ortodontia;mordida aberta;open bite
ortodontia;sobremordida;overbite
ortodontia;sobressaliencia,overjet;overjet
ortodontia;crescimento craniofacial,crescimento facial;growth
odontopediatria;decidu,dentes de leite;deciduous
odontopediatria;pulpotomia;pulpotomy
odontopediatria;pulpectomia;pulpectomy
odontopediatria;erupcao;eruption
odontopediatria;mantenedor de espaco;space maintainer
odontopediatria;fluorose;fluorosis
odontopediatria;hipomineraliz;hypominerali
microbiologia;streptococcus,estreptococ;streptococc
microbiologia;lactobacil;lactobacill
microbiologia;porphyromonas;porphyromonas
microbiologia;esteriliz,autoclave;steriliz
microbiologia;hepatite;hepatitis
microbiologia;hiv,aids;hiv
saudecoletiva;cpod,cpo-d,ceo-d;dmf
saudecoletiva;epidemiolog;epidemiolog
saudecoletiva;prevalencia,incidencia;prevalence
saudecoletiva;escovac;toothbrush
saudecoletiva;fissura labiopalat,fissura palatina,fenda palatina;cleft
`.trim().split("\n").map((linha) => {
  const [grupo, pt, en] = linha.split(";");
  return { grupo, pt: pt.split(","), en };
});

/* Palavras comuns que não servem de tema. */
const PALAVRAS_VAZIAS = new Set(`
acordo adequada adequado agosto ainda alem algum alguma algumas alguns alteracao alteracoes alunos ambos anterior anteriores antes apenas apos apresenta apresentam apresentar aqui area areas aspecto aspectos assim atraves aula autor autores baixa baixo bibliografia brasil cada camada capacidade capitulo caracteristica caracteristicas casos causa causas certa clinica clinicas clinico clinicos como comum conceito conceitos conclusao condicao condicoes conforme conteudo contra corpo correta cuidados curso dados dentaria dentario dentarios dente dentes dentro departamento depois desde determinada devem deve devido diagnostico diferente diferentes direita direito disciplina discussao diversas diversos docente doenca doencas durante editora efeito elementos entao entre especial especialmente especifica especifico esquerda esquerdo estado estrutura estruturas estudo estudos etiologia exame exames exemplo exemplos existe existem externa externo faculdade fatores figura final fonte forma formacao formas frequente frequentemente funcao funcoes geral geralmente grande grandes grupo grupos idade importancia importante importantes imagem imagens indicacao indicacoes indicado individuo inferior inferiores inicial interna interno introducao isso junho lado lateral local localizacao longo maior maioria maneira medidas medial meio melhor menor menos mesma mesmo metodo metodos modo momento muito muitos nivel normal normalmente numero objetivo objetivos observar odontologia odontologica odontologico onde orgao origem outra outras outro outros paciente pacientes parte partes pela pelas pelo pelos pequena pequeno periodo pessoas pode podem ponto pontos porque portanto posicao possibilidade possivel posterior posteriores presenca presente principais principal principalmente problema processo processos produto professor professora profissional prof professores proxima qual qualquer quando quantidade quanto quatro realizada realizado realizar referencias regiao regioes relacao relacionada relacionado resposta resultado resultados seguinte seguintes segunda segundo seja semestre sempre sendo sinais sintomas sistema sistemas situacao sobre superficie superficies superior superiores tambem tamanho tecido tecidos tecnica tecnicas tempo tipo tipos toda todas todo todos trabalho tratamento tratamentos tres universidade uso utilizacao utilizada utilizado utilizar valor varias varios vezes
`.trim().split(/\s+/));
