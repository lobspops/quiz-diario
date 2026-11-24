"use strict";

/* ============================================================
   GLOSSÁRIO ODONTOLÓGICO  inglês ; português
   - o plural é montado sozinho ("pocket" também acha "pockets")
   - linha que começa com "=" só vale quando a alternativa inteira
     é aquele termo (palavras ambíguas, como "file" ou "rest")
   Pode acrescentar ou corrigir linhas à vontade.
   ============================================================ */
const TERMOS = `
=all of the above;Todas as anteriores
=none of the above;Nenhuma das anteriores
=all;Todas
=all of these;Todas estas
=none;Nenhuma
=none of these;Nenhuma destas
=both;Ambas
=any of the above;Qualquer uma das anteriores
=true;Verdadeiro
=false;Falso
=yes;Sim
=no;Não
=increases;Aumenta
=increased;Aumentado
=decreases;Diminui
=decreased;Diminuído
=no change;Não se altera
=remains same;Permanece igual
=remains the same;Permanece igual
=no effect;Sem efeito
=canine;Canino
=file;Lima
=reamer;Alargador
=rest;Apoio
=clasp;Grampo
=crown;Coroa
=root;Raiz
=apex;Ápice
=neck;Colo
=base;Base
=liner;Forrador
=bur;Broca
=wedge;Cunha
=post;Pino
=core;Núcleo
=band;Banda
=wire;Fio
=spring;Mola
=screw;Parafuso
=plate;Placa
=cast;Modelo
=die;Troquel
=sprue;Conduto de alimentação
=shoulder;Ombro
=chamfer;Chanfro
=bevel;Bisel
=knife edge;Lâmina de faca
=mesial;Mesial
=distal;Distal
=lingual;Lingual
=labial;Vestibular
=buccal;Vestibular
=facial;Vestibular
=palatal;Palatina
=occlusal;Oclusal
=incisal;Incisal
=cervical;Cervical
=apical;Apical
=gingival;Gengival
=anterior;Anterior
=posterior;Posterior
=crowding;Apinhamento
=spacing;Diastema
=tipping;Inclinação
=intrusion;Intrusão
=extrusion;Extrusão
=scaling;Raspagem
=polishing;Polimento
=extraction;Extração
=excision;Excisão
=antibiotics;Antibióticos
=surgery;Cirurgia
=radiotherapy;Radioterapia
=chemotherapy;Quimioterapia
deep bite;mordida profunda
open bite;mordida aberta
anterior open bite;mordida aberta anterior
cross bite;mordida cruzada
crossbite;mordida cruzada
anterior cross bite;mordida cruzada anterior
posterior cross bite;mordida cruzada posterior
scissors bite;mordida em tesoura
overbite;sobremordida
overjet;sobressaliência
malocclusion;má oclusão
normal occlusion;oclusão normal
balanced occlusion;oclusão balanceada
centric relation;relação cêntrica
centric occlusion;oclusão cêntrica
centric jaw relation;relação cêntrica
eccentric movement;movimento excêntrico
jaw relation;relação maxilomandibular
maximum intercuspation;máxima intercuspidação
intercuspal position;posição de intercuspidação
working side;lado de trabalho
balancing side;lado de balanceio
non-working side;lado de não trabalho
nonworking side;lado de não trabalho
protrusive movement;movimento protrusivo
lateral excursion;movimento de lateralidade
canine guidance;guia canina
anterior guidance;guia anterior
incisal guidance;guia incisal
condylar guidance;guia condilar
group function;função em grupo
trauma from occlusion;trauma oclusal
occlusal trauma;trauma oclusal
occlusal plane;plano oclusal
occlusal splint;placa oclusal
occlusal rest;apoio oclusal
occlusal rim;plano de cera
occlusion rim;plano de cera
occlusal adjustment;ajuste oclusal
selective grinding;desgaste seletivo
bruxism;bruxismo
clenching;apertamento dentário
temporomandibular joint;articulação temporomandibular
temporomandibular disorder;disfunção temporomandibular
articular disc;disco articular
disc displacement;deslocamento de disco
articular eminence;eminência articular
glenoid fossa;fossa mandibular
hinge axis;eixo terminal de rotação
condyle;côndilo
mandibular condyle;côndilo mandibular
coronoid process;processo coronoide
ramus;ramo da mandíbula
mandible;mandíbula
maxilla;maxila
vertical dimension;dimensão vertical
vertical dimension of occlusion;dimensão vertical de oclusão
vertical dimension of rest;dimensão vertical de repouso
freeway space;espaço funcional livre
interocclusal space;espaço funcional livre
interocclusal distance;distância interoclusal
compensating curve;curva de compensação
curve of spee;curva de Spee
curve of wilson;curva de Wilson
articulator;articulador
semi-adjustable articulator;articulador semiajustável
face bow;arco facial
facebow;arco facial
muscles of mastication;músculos da mastigação
masticatory muscle;músculo mastigatório
lateral pterygoid;pterigóideo lateral
medial pterygoid;pterigóideo medial
temporalis;músculo temporal
masseter;masseter
buccinator;bucinador
digastric;digástrico
mylohyoid;milo-hióideo
genioglossus;genioglosso
orbicularis oris;orbicular da boca
angle's class;classe de Angle
angles class;classe de Angle
orthodontic treatment;tratamento ortodôntico
fixed appliance;aparelho fixo
removable appliance;aparelho removível
functional appliance;aparelho funcional
headgear;aparelho extrabucal
face mask;máscara facial
bracket;braquete
arch wire;arco ortodôntico
archwire;arco ortodôntico
anchorage;ancoragem
space maintainer;mantenedor de espaço
band and loop;banda-alça
lingual arch;arco lingual
thumb sucking;sucção digital
tongue thrust;interposição lingual
tongue thrusting;interposição lingual
mouth breathing;respiração bucal
midline diastema;diastema mediano
leeway space;espaço livre de Nance
primate space;espaço primata
crowding;apinhamento
cranial base;base do crânio
growth spurt;surto de crescimento
tooth;dente
teeth;dentes
deciduous teeth;dentes decíduos
primary teeth;dentes decíduos
deciduous tooth;dente decíduo
primary tooth;dente decíduo
permanent teeth;dentes permanentes
permanent tooth;dente permanente
anterior teeth;dentes anteriores
posterior teeth;dentes posteriores
abutment teeth;dentes pilares
abutment tooth;dente pilar
missing teeth;dentes ausentes
front teeth;dentes anteriores
natal teeth;dentes natais
supernumerary teeth;dentes supranumerários
impacted teeth;dentes impactados
impacted tooth;dente impactado
primary dentition;dentição decídua
deciduous dentition;dentição decídua
mixed dentition;dentição mista
permanent dentition;dentição permanente
maxillary arch;arco superior
mandibular arch;arco inferior
dental arch;arco dentário
maxillary sinus;seio maxilar
maxillary tuberosity;tuberosidade da maxila
retromolar pad;papila retromolar
hard palate;palato duro
soft palate;palato mole
incisive papilla;papila incisiva
palatal rugae;rugas palatinas
hamular notch;sulco hamular
alveolar bone;osso alveolar
alveolar crest;crista alveolar
alveolar ridge;rebordo alveolar
residual ridge;rebordo residual
edentulous ridge;rebordo edêntulo
mandibular ridge;rebordo inferior
maxillary ridge;rebordo superior
edentulous;edêntulo
bone loss;perda óssea
bone resorption;reabsorção óssea
lamina dura;lâmina dura
buccal mucosa;mucosa jugal
oral mucosa;mucosa bucal
oral cavity;cavidade bucal
oral hygiene;higiene bucal
oral health;saúde bucal
vestibule;vestíbulo
floor of the mouth;assoalho bucal
buccal surface;face vestibular
facial surface;face vestibular
labial surface;face vestibular
lingual surface;face lingual
palatal surface;face palatina
mesial surface;face mesial
distal surface;face distal
proximal surface;face proximal
occlusal surface;face oclusal
root surface;superfície radicular
tooth surface;superfície dentária
buccal cusp;cúspide vestibular
lingual cusp;cúspide lingual
palatal cusp;cúspide palatina
mesiobuccal cusp;cúspide mesiovestibular
distobuccal cusp;cúspide distovestibular
mesiolingual cusp;cúspide mesiolingual
distolingual cusp;cúspide distolingual
cusp of carabelli;cúspide de Carabelli
cusp;cúspide
fissure;fissura
pit and fissure sealant;selante de fóssulas e fissuras
marginal ridge;crista marginal
oblique ridge;ponte de esmalte
cingulum;cíngulo
mamelon;mamelo
incisal edge;borda incisal
contact area;área de contato
contact point;ponto de contato
embrasure;ameia
line angle;ângulo diedro
point angle;ângulo triedro
axial wall;parede axial
pulpal wall;parede pulpar
pulpal floor;parede pulpar
gingival seat;parede gengival
gingival wall;parede gengival
cervical line;linha cervical
cementoenamel junction;junção amelocementária
cemento-enamel junction;junção amelocementária
dentinoenamel junction;junção amelodentinária
dentino-enamel junction;junção amelodentinária
enamel;esmalte
dentin;dentina
dentine;dentina
cementum;cemento
enamel organ;órgão do esmalte
enamel epithelium;epitélio do esmalte
outer enamel epithelium;epitélio externo do esmalte
inner enamel epithelium;epitélio interno do esmalte
reduced enamel epithelium;epitélio reduzido do esmalte
enamel hypoplasia;hipoplasia do esmalte
amelogenesis imperfecta;amelogênese imperfeita
dentinogenesis imperfecta;dentinogênese imperfeita
dentinal tubule;túbulo dentinário
secondary dentin;dentina secundária
tertiary dentin;dentina terciária
reparative dentin;dentina reparadora
predentin;pré-dentina
stratum intermedium;estrato intermediário
stellate reticulum;retículo estrelado
bell stage;fase de campânula
cap stage;fase de capuz
bud stage;fase de botão
crown completion;formação completa da coroa
dental papilla;papila dentária
dental lamina;lâmina dentária
tooth germ;germe dentário
eruption;erupção
dental caries;cárie dentária
caries;cárie
carious lesion;lesão cariosa
carious;cariado
root caries;cárie radicular
rampant caries;cárie rampante
nursing bottle caries;cárie de mamadeira
caries activity;atividade de cárie
pit;fóssula
cavity preparation;preparo cavitário
tooth preparation;preparo dentário
tooth structure;estrutura dentária
resistance form;forma de resistência
retention form;forma de retenção
outline form;forma de contorno
convenience form;forma de conveniência
cavosurface angle;ângulo cavossuperficial
cavosurface margin;margem cavossuperficial
undercut;área retentiva
amalgam restoration;restauração de amálgama
dental amalgam;amálgama dentário
amalgam;amálgama
high copper amalgam;amálgama com alto teor de cobre
composite restoration;restauração de resina composta
composite resin;resina composta
composite;resina composta
glass ionomer cement;cimento de ionômero de vidro
glass ionomer;ionômero de vidro
zinc phosphate cement;cimento de fosfato de zinco
zinc phosphate;fosfato de zinco
zinc oxide eugenol;óxido de zinco e eugenol
zinc oxide;óxido de zinco
polycarboxylate cement;cimento de policarboxilato
resin cement;cimento resinoso
calcium hydroxide;hidróxido de cálcio
direct filling gold;ouro para restauração direta
gold foil;folha de ouro
gold alloy;liga de ouro
bonding agent;agente adesivo
dentin bonding agent;adesivo dentinário
bond strength;resistência de união
smear layer;smear layer (lama dentinária)
hybrid layer;camada híbrida
acid etching;condicionamento ácido
acid etch;condicionamento ácido
etching;condicionamento ácido
phosphoric acid;ácido fosfórico
light cure;fotopolimerizável
light curing;fotopolimerização
polymerization shrinkage;contração de polimerização
setting time;tempo de presa
working time;tempo de trabalho
compressive strength;resistência à compressão
tensile strength;resistência à tração
thermal expansion;expansão térmica
moisture contamination;contaminação por umidade
microleakage;microinfiltração
bleaching;clareamento
rubber dam;isolamento absoluto
matrix band;matriz metálica
carbide bur;broca carbide
diamond bur;ponta diamantada
water fluoridation;fluoretação da água
fluoride varnish;verniz fluoretado
fluoride;flúor
fluorosis;fluorose
dental fluorosis;fluorose dentária
pit and fissure;fóssulas e fissuras
sealant;selante
root canal treatment;tratamento endodôntico
root canal therapy;tratamento endodôntico
endodontic treatment;tratamento endodôntico
root canal;canal radicular
root canals;canais radiculares
pulp chamber;câmara pulpar
pulp horn;corno pulpar
pulp capping;capeamento pulpar
direct pulp capping;capeamento pulpar direto
indirect pulp capping;capeamento pulpar indireto
pulp vitality;vitalidade pulpar
vitality test;teste de vitalidade
pulp tissue;tecido pulpar
dental pulp;polpa dentária
pulpal;pulpar
pulpotomy;pulpotomia
formocresol pulpotomy;pulpotomia com formocresol
formocresol;formocresol
pulpectomy;pulpectomia
pulpitis;pulpite
reversible pulpitis;pulpite reversível
irreversible pulpitis;pulpite irreversível
pulp;polpa
pulp necrosis;necrose pulpar
pulp polyp;pólipo pulpar
pink tooth;dente róseo
internal resorption;reabsorção interna
external resorption;reabsorção externa
root resorption;reabsorção radicular
root fracture;fratura radicular
vertical root fracture;fratura radicular vertical
root end;extremidade radicular
root apex;ápice radicular
apical foramen;forame apical
apical constriction;constrição apical
apical third;terço apical
middle third;terço médio
cervical third;terço cervical
working length;comprimento de trabalho
apex locator;localizador apical
gutta percha;guta-percha
gutta-percha;guta-percha
silver cone;cone de prata
lateral condensation;condensação lateral
apexification;apicificação
apexogenesis;apicigênese
apicoectomy;apicectomia
access cavity;cavidade de acesso
access opening;abertura coronária
irrigant;solução irrigadora
sodium hypochlorite;hipoclorito de sódio
hydrogen peroxide;peróxido de hidrogênio
k-file;lima tipo K
h-file;lima Hedström
endodontic file;lima endodôntica
barbed broach;extirpa-nervos
apical periodontitis;periodontite apical
periapical abscess;abscesso periapical
periapical lesion;lesão periapical
avulsed tooth;dente avulsionado
avulsion;avulsão
luxation;luxação
replantation;reimplante
gingiva;gengiva
attached gingiva;gengiva inserida
free gingiva;gengiva livre
gingival margin;margem gengival
gingival sulcus;sulco gengival
gingival crevicular fluid;fluido gengival
gingival enlargement;aumento gengival
gingival hyperplasia;hiperplasia gengival
gingival recession;recessão gengival
gingivitis;gengivite
gingivectomy;gengivectomia
junctional epithelium;epitélio juncional
sulcular epithelium;epitélio sulcular
connective tissue;tecido conjuntivo
periodontitis;periodontite
juvenile periodontitis;periodontite juvenil
aggressive periodontitis;periodontite agressiva
chronic periodontitis;periodontite crônica
periodontal disease;doença periodontal
periodontal ligament;ligamento periodontal
periodontal pocket;bolsa periodontal
infrabony pocket;bolsa infraóssea
pocket depth;profundidade de bolsa
periodontal probe;sonda periodontal
probing depth;profundidade de sondagem
bleeding on probing;sangramento à sondagem
clinical attachment loss;perda de inserção clínica
clinical attachment level;nível de inserção clínica
attachment loss;perda de inserção
furcation involvement;lesão de furca
furcation;furca
tooth mobility;mobilidade dentária
plaque control;controle de placa
dental plaque;placa dentária
plaque index;índice de placa
gingival index;índice gengival
calculus;cálculo dental
subgingival calculus;cálculo subgengival
supragingival calculus;cálculo supragengival
root planing;alisamento radicular
scaling and root planing;raspagem e alisamento radicular
flap surgery;cirurgia a retalho
bone graft;enxerto ósseo
guided tissue regeneration;regeneração tecidual guiada
free gingival graft;enxerto gengival livre
toothbrush;escova dental
tooth paste;creme dental
toothpaste;creme dental
dental floss;fio dental
mouthwash;enxaguatório bucal
dentifrice;dentifrício
complete denture;prótese total
partial denture;prótese parcial
removable partial denture;prótese parcial removível
fixed partial denture;prótese parcial fixa
resin retained fpd;prótese adesiva
immediate denture;prótese imediata
overdenture;overdenture
denture;prótese
denture base;base da prótese
denture stomatitis;estomatite protética
denture flange;flange da prótese
major connector;conector maior
minor connector;conector menor
lingual bar;barra lingual
lingual plate;placa lingual
palatal bar;barra palatina
palatal strap;cinta palatina
direct retainer;retentor direto
indirect retainer;retentor indireto
retainer;retentor
retentive arm;braço de retenção
reciprocal arm;braço de oposição
circumferential clasp;grampo circunferencial
combination clasp;grampo combinado
clasp;grampo
distal extension;extremidade livre
kennedy class;classe de Kennedy
abutment;pilar
pontic;pôntico
ridge lap pontic;pôntico em sela
modified ridge lap;sela modificada
ridge lap;sela
sanitary pontic;pôntico higiênico
fixed bridge;ponte fixa
cantilever bridge;prótese em cantiléver
maryland bridge;prótese adesiva de Maryland
porcelain jacket crown;coroa jaqueta de porcelana
metal ceramic crown;coroa metalocerâmica
metal ceramic restoration;restauração metalocerâmica
metal ceramic;metalocerâmica
full veneer crown;coroa total
stainless steel crown;coroa de aço inoxidável
stainless steel;aço inoxidável
all ceramic crown;coroa totalmente cerâmica
temporary crown;coroa provisória
provisional restoration;restauração provisória
cast restoration;restauração fundida
post and core;pino e núcleo
veneer;faceta
inlay wax;cera para incrustação
wax pattern;padrão de cera
impression material;material de moldagem
impression tray;moldeira
custom tray;moldeira individual
impression making;moldagem
impression compound;godiva
final impression;moldagem final
preliminary impression;moldagem preliminar
impression;moldagem
alginate;alginato
irreversible hydrocolloid;hidrocoloide irreversível
reversible hydrocolloid;hidrocoloide reversível
addition silicone;silicone de adição
condensation silicone;silicone de condensação
elastomeric impression;moldagem com elastômero
polyether;poliéter
polysulfide;polissulfeto
dental stone;gesso-pedra
die stone;gesso especial
plaster of paris;gesso Paris
gypsum;gesso
study cast;modelo de estudo
master cast;modelo de trabalho
bonded investment;revestimento
phosphate bonded investment;revestimento fosfatado
gypsum bonded investment;revestimento à base de gesso
casting shrinkage;contração de fundição
long axis;longo eixo
height of contour;equador protético
path of insertion;eixo de inserção
relief chamber;câmara de alívio
posterior palatal seal;selamento palatino posterior
border molding;vedamento periférico
border moulding;vedamento periférico
rest position;posição de repouso
occlusal table;mesa oclusal
osseointegration;osseointegração
dental implant;implante dentário
implant;implante
local anesthesia;anestesia local
local anaesthesia;anestesia local
local anesthetic;anestésico local
nerve block;bloqueio nervoso
inferior alveolar nerve block;bloqueio do nervo alveolar inferior
inferior alveolar nerve;nervo alveolar inferior
lingual nerve;nervo lingual
mental nerve;nervo mentual
mental foramen;forame mentual
mandibular foramen;forame da mandíbula
mandibular canal;canal mandibular
infraorbital nerve;nervo infraorbital
facial nerve;nervo facial
trigeminal nerve;nervo trigêmeo
trigeminal neuralgia;neuralgia do trigêmeo
mandibular nerve;nervo mandibular
maxillary nerve;nervo maxilar
glossopharyngeal nerve;nervo glossofaríngeo
hypoglossal nerve;nervo hipoglosso
chorda tympani;corda do tímpano
foramen ovale;forame oval
foramen rotundum;forame redondo
foramen spinosum;forame espinhoso
parotid gland;glândula parótida
submandibular gland;glândula submandibular
sublingual gland;glândula sublingual
salivary gland;glândula salivar
minor salivary gland;glândula salivar menor
stensen's duct;ducto parotídeo
wharton's duct;ducto submandibular
taste bud;botão gustativo
third molar;terceiro molar
dry socket;alveolite seca
tooth extraction;extração dentária
pericoronitis;pericoronarite
trismus;trismo
cellulitis;celulite facial
ludwig's angina;angina de Ludwig
jaw;maxilares
mucoperiosteal flap;retalho mucoperiosteal
osteomyelitis;osteomielite
osteoradionecrosis;osteorradionecrose
dentigerous cyst;cisto dentígero
radicular cyst;cisto radicular
odontogenic keratocyst;ceratocisto odontogênico
eruption cyst;cisto de erupção
lateral periodontal cyst;cisto periodontal lateral
nasopalatine cyst;cisto nasopalatino
dermoid cyst;cisto dermoide
odontogenic cyst;cisto odontogênico
odontogenic tumor;tumor odontogênico
odontogenic tumour;tumor odontogênico
ameloblastoma;ameloblastoma
odontoma;odontoma
compound odontoma;odontoma composto
complex odontoma;odontoma complexo
giant cell granuloma;granuloma de células gigantes
pyogenic granuloma;granuloma piogênico
fibrous dysplasia;displasia fibrosa
pleomorphic adenoma;adenoma pleomórfico
mucoepidermoid carcinoma;carcinoma mucoepidermoide
adenoid cystic carcinoma;carcinoma adenoide cístico
squamous cell carcinoma;carcinoma espinocelular
verrucous carcinoma;carcinoma verrucoso
basal cell carcinoma;carcinoma basocelular
oral submucous fibrosis;fibrose submucosa bucal
leukoplakia;leucoplasia
erythroplakia;eritroplasia
lichen planus;líquen plano
pemphigus vulgaris;pênfigo vulgar
bullous pemphigoid;penfigoide bolhoso
pemphigoid;penfigoide
pemphigus;pênfigo
aphthous ulcer;úlcera aftosa
aphthous stomatitis;estomatite aftosa
herpes simplex;herpes simples
herpes zoster;herpes-zóster
candidiasis;candidíase
angular cheilitis;queilite angular
geographic tongue;língua geográfica
fissured tongue;língua fissurada
hairy tongue;língua pilosa
hairy leukoplakia;leucoplasia pilosa
ankyloglossia;anquiloglossia
cleft lip;fissura labial
cleft palate;fissura palatina
anodontia;anodontia
hypodontia;hipodontia
dens invaginatus;dens invaginatus
dens in dente;dens in dente
taurodontism;taurodontismo
gemination;geminação
fusion;fusão
concrescence;concrescência
dilaceration;dilaceração
attrition;atrição
abrasion;abrasão
abfraction;abfração
ankylosis;anquilose
hypercementosis;hipercementose
pulp stone;nódulo pulpar
xerostomia;xerostomia
halitosis;halitose
ranula;rânula
mucocele;mucocele
periapical radiograph;radiografia periapical
bitewing radiograph;radiografia interproximal
bite wing radiograph;radiografia interproximal
bitewing;radiografia interproximal
panoramic radiograph;radiografia panorâmica
occlusal radiograph;radiografia oclusal
intraoral radiograph;radiografia intrabucal
radiolucency;área radiolúcida
radiolucent;radiolúcido
radiopaque;radiopaco
radiopacity;área radiopaca
bisecting angle technique;técnica da bissetriz
paralleling technique;técnica do paralelismo
cone cut;meia-lua
intensifying screen;écran intensificador
cone beam;feixe cônico
intraoral examination;exame intrabucal
intra-oral examination;exame intrabucal
extraoral examination;exame extrabucal
chief complaint;queixa principal
treatment of choice;tratamento de escolha
drug of choice;medicamento de escolha
dental chair;cadeira odontológica
dental office;consultório odontológico
dental clinic;clínica odontológica
dentist;cirurgião-dentista
=all the above;Todas as anteriores
=none of above;Nenhuma das anteriores
=all of above;Todas as anteriores
=both of the above;Ambas as anteriores
=both a and b;Ambas, A e B
=both a & b;Ambas, A e B
=both 1 and 2;Ambas, 1 e 2
=can be any of the above;Pode ser qualquer uma das anteriores
=at birth;Ao nascimento
=pain;Dor
=touch;Tato
=temperature;Temperatura
=mode;Moda
=median;Mediana
=mean;Média
=water;Água
=retention;Retenção
=resistance;Resistência
=esthetics;Estética
=hardening;Endurecimento
=condensation;Condensação
=carving;Escultura
=trituration;Trituração
=mulling;Homogeneização da massa
=burnishing;Brunimento
=finishing;Acabamento
=syneresis;Sinérese
=imbibition;Embebição
=porosity;Porosidade
=triangular;Triangular
=who;OMS
=fda;FDA
=zoe;Óxido de zinco e eugenol (OZE)
=gic;Cimento de ionômero de vidro (CIV)
=mta;MTA
=activator;Ativador
=anteroposterior palatal bar;Barra palatina anteroposterior
=mental retardation;Deficiência intelectual
=vitamin deficiency;Deficiência vitamínica
=extraction of the tooth;Extração do dente
=early bell stage;Fase inicial de campânula
=late bell stage;Fase tardia de campânula
=advanced bell stage;Fase avançada de campânula
buccal;vestibular
buccolingual;vestibulolingual
mesiodistal;mesiodistal
mesiobuccal;mesiovestibular
distobuccal;distovestibular
shoulder with bevel;ombro biselado
heavy chamfer;chanfro profundo
shoulder finish line;término em ombro
finish line;término cervical
guiding plane;plano guia
proximal plate;placa proximal
rest seat;nicho
tooth brush;escova dental
green strength;resistência inicial
plastic deformation;deformação plástica
elastic limit;limite elástico
proportional limit;limite de proporcionalidade
modulus of elasticity;módulo de elasticidade
stress;tensão
strain;deformação
creep;creep (fluência)
tarnish;manchamento
corrosion;corrosão
galvanism;galvanismo
solder;solda
soldering;soldagem
flux;fundente
colloidal silica;sílica coloidal
polysulphide;polissulfeto
agar-agar;ágar-ágar
bite registration;registro de mordida
gothic arch tracing;traçado do arco gótico
try-in;prova
flange;flange
relining;reembasamento
rebasing;rebase
tissue conditioner;condicionador de tecido
retromylohyoid;retromilo-hióideo
tooth germs;germes dentários
odontoblast;odontoblasto
ameloblast;ameloblasto
cementoblast;cementoblasto
fibroblast;fibroblasto
osteoblast;osteoblasto
osteoclast;osteoclasto
stratum corneum;estrato córneo
stratum spinosum;estrato espinhoso
stratum basale;estrato basal
stratum granulosum;estrato granuloso
stratum lucidum;estrato lúcido
lamina propria;lâmina própria
basement membrane;membrana basal
hertwig's epithelial root sheath;bainha epitelial de Hertwig
epithelial rests of malassez;restos epiteliais de Malassez
rests of malassez;restos de Malassez
sharpey's fibers;fibras de Sharpey
sharpey's fibres;fibras de Sharpey
korff's fibers;fibras de von Korff
oblique fibers;fibras oblíquas
oblique fibres;fibras oblíquas
incremental line;linha incremental
striae of retzius;estrias de Retzius
neonatal line;linha neonatal
tomes granular layer;camada granulosa de Tomes
curettage;curetagem
gingival curettage;curetagem gengival
crown lengthening;aumento de coroa clínica
biologic width;distância biológica
fenestration;fenestração
dehiscence;deiscência
mouth mirror;espelho bucal
dental explorer;sonda exploradora
high speed handpiece;alta rotação
handpiece;peça de mão
air rotor;turbina de alta rotação
hand instrument;instrumento manual
cutting edge;borda cortante
blade angle;ângulo da lâmina
gingival marginal trimmer;recortador de margem gengival
spoon excavator;colher de dentina
proximal box;caixa proximal
dovetail;cauda de andorinha
pulp exposure;exposição pulpar
carious exposure;exposição por cárie
traumatic exposure;exposição traumática
sinus tract;fístula
tender on percussion;sensível à percussão
tenderness on percussion;sensibilidade à percussão
cold test;teste de frio
cracked tooth;dente trincado
cracked tooth syndrome;síndrome do dente trincado
open apex;ápice aberto
immature tooth;dente com rizogênese incompleta
intracanal medicament;medicação intracanal
mandibular block;bloqueio mandibular
pulpal anesthesia;anestesia pulpar
infiltration;anestesia infiltrativa
behaviour management;manejo do comportamento
behavior management;manejo do comportamento
tell-show-do;dizer-mostrar-fazer
tell show do;dizer-mostrar-fazer
voice control;controle de voz
hand over mouth;mão sobre a boca
pediatric dentistry;odontopediatria
cephalometric analysis;análise cefalométrica
hand wrist radiograph;radiografia de mão e punho
sella turcica;sela túrcica
nasion;násio
frankfort horizontal plane;plano horizontal de Frankfurt
mandibular plane;plano mandibular
retruded mandible;mandíbula retruída
prognathic;prognata
prognathism;prognatismo
proclined;vestibularizado
retroclined;lingualizado
proclination;vestibularização
retroclination;lingualização
tipping movement;movimento de inclinação
bodily movement;movimento de corpo
torque;torque
hyalinization;hialinização
relapse;recidiva
retention appliance;contenção
removable retainer;contenção removível
serial extraction;extração seriada
rapid maxillary expansion;expansão rápida da maxila
maxillary expansion;expansão da maxila
oral ulcer;úlcera bucal
nikolsky's sign;sinal de Nikolsky
nikolsky sign;sinal de Nikolsky
tzanck smear;esfregaço de Tzanck
tzank smear;esfregaço de Tzanck
wickham's striae;estrias de Wickham
koplik's spots;manchas de Koplik
fordyce's granules;grânulos de Fordyce
fordyce granules;grânulos de Fordyce
torus palatinus;tórus palatino
torus mandibularis;tórus mandibular
impacted canine;canino impactado
maxillary antrum;seio maxilar
`.trim().split("\n").map((l) => l.split(";"));

const SO_INTEIRO = {};
const DENTRO = {};
for (const [en, pt] of TERMOS) {
  if (en.startsWith("=")) SO_INTEIRO[en.slice(1)] = pt;
  else DENTRO[en] = pt;
}

/* ---------- plural em português ---------- */
const PLURAIS = { raiz: "raízes", "órgão": "órgãos", "mal": "males", "lápis": "lápis", "retalho": "retalhos" };
function plural1(p) {
  if (PLURAIS[p]) return PLURAIS[p];
  if (/s$/.test(p) || /[-\d)]$/.test(p)) return p;
  if (/ão$/.test(p)) return p.replace(/ão$/, "ões");
  if (/(á|í|ó)vel$/.test(p)) return p.replace(/el$/, "eis");
  if (/al$|ol$|ul$/.test(p)) return p.replace(/l$/, "is");
  if (/el$/.test(p)) return p.replace(/el$/, "éis");
  if (/il$/.test(p)) return p.replace(/il$/, "is");
  if (/m$/.test(p)) return p.replace(/m$/, "ns");
  if (/[rz]$/.test(p)) return p + "es";
  return /[aeiouáéíóúâêôãõ]$/.test(p) ? p + "s" : p;
}
function pluralizar(termo) {
  const palavras = termo.split(" ");
  let fim = palavras.findIndex((p) => /^(de|do|da|dos|das|em|a|à|e|com|para|por)$/.test(p));
  if (fim < 0) fim = palavras.length;
  return palavras.map((p, i) => (i < fim ? plural1(p) : p)).join(" ");
}

/* ---------- dentes: "maxillary left second premolar" ---------- */
const DENTES = {
  "central incisor": "incisivo central", "lateral incisor": "incisivo lateral", incisor: "incisivo", canine: "canino", cuspid: "canino",
  "first premolar": "primeiro pré-molar", "second premolar": "segundo pré-molar", premolar: "pré-molar", bicuspid: "pré-molar",
  "first bicuspid": "primeiro pré-molar", "second bicuspid": "segundo pré-molar",
  "first molar": "primeiro molar", "second molar": "segundo molar", "third molar": "terceiro molar", molar: "molar"
};
const QUALIDADES = {
  maxillary: [1, "superior"], upper: [1, "superior"], mandibular: [1, "inferior"], lower: [1, "inferior"],
  permanent: [2, "permanente"], deciduous: [2, "decíduo"], primary: [2, "decíduo"], right: [3, "direito"], left: [3, "esquerdo"]
};
const QUAL = Object.keys(QUALIDADES).join("|");
const REGRA_DENTE = new RegExp("\\b((?:(?:" + QUAL + ")\\s+)*)(central|lateral|first|second|third)?\\s*((?:(?:" + QUAL + ")\\s+)*)(incisor|canine|cuspid|premolar|bicuspid|molar)(s?)\\b", "gi");

function trocarDentes(texto, usados) {
  return texto.replace(REGRA_DENTE, (tudo, antes, ordem, meio, tipo, s) => {
    const nome = DENTES[((ordem ? ordem + " " : "") + tipo).toLowerCase()];
    if (!nome) return tudo;
    const quais = (antes + " " + meio).toLowerCase().split(/\s+/).filter(Boolean).map((q) => QUALIDADES[q]).sort((a, b) => a[0] - b[0]);
    let pt = [nome, ...new Set(quais.map((q) => q[1]))].join(" ");
    if (s) pt = pluralizar(pt);
    usados.push(pt);
    return (/^\s/.test(tudo) ? " " : "") + pt;
  });
}

/* ---------- troca dos termos dentro da frase ---------- */
const escapar = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const ORDENADOS = Object.keys(DENTRO).sort((a, b) => b.length - a.length);
const REGRA_TERMOS = new RegExp("(?<![\\p{L}\\p{N}-])(" + ORDENADOS.map(escapar).join("|") + ")(s|es)?(?![\\p{L}\\p{N}-])", "giu");

const ORDINAIS = { "1st": "first", "2nd": "second", "3rd": "third" };
const porExtenso = (t) => t.replace(/\b(pre)[- ](molar)/gi, "$1$2").replace(/\b(1st|2nd|3rd)\b(?=\s+([a-z]+\s+)?(molar|premolar|bicuspid))/gi, (o) => ORDINAIS[o.toLowerCase()]);

// Devolve a frase com os termos já em português e a lista do que entrou.
function aplicarGlossario(original) {
  const ingles = porExtenso(original);
  const usados = [];
  const guardados = [];
  // Cada troca vira uma marca, para uma não mexer na outra.
  const guardar1 = (pt) => { guardados.push(pt); return "\u0001" + (guardados.length - 1) + "\u0002"; };
  let texto = ingles.replace(REGRA_TERMOS, (tudo, termo, s) => {
    let pt = DENTRO[termo.toLowerCase()];
    if (s) pt = pluralizar(pt);
    usados.push(pt);
    return guardar1(pt);
  });
  texto = trocarDentes(texto, usados);
  return { texto: texto.replace(/\u0001(\d+)\u0002/g, (m, i) => guardados[i]), usados };
}

// Alternativa inteira que está no glossário: não precisa de tradutor.
function termoInteiro(ingles) {
  const limpo = porExtenso(ingles).trim().replace(/[.:;]+$/, "").replace(/\s+/g, " ");
  const tempo = limpo.match(/^(\d+(?:[.,]\d+)?(?:\s*(?:-|–|to)\s*\d+(?:[.,]\d+)?)?)\s*(weeks?|wks?|months?|years?|yrs?|days?|hours?|hrs?|minutes?|mins?|seconds?|secs?)$/i);
  if (tempo) {
    const unidade = { w: "semana", mo: "mês", y: "ano", d: "dia", h: "hora", mi: "minuto", s: "segundo" };
    const u = tempo[2].toLowerCase();
    const pt = unidade[u.slice(0, 2)] || unidade[u[0]];
    const numero = tempo[1].replace(/\s*to\s*/i, " a ");
    return numero + " " + (/^1$/.test(numero) ? pt : pt === "mês" ? "meses" : pt + "s");
  }
  const chave = limpo.toLowerCase().replace(/^the /, "");
  if (SO_INTEIRO[chave]) return SO_INTEIRO[chave];
  if (/[^s]s$/.test(chave) && SO_INTEIRO[chave.slice(0, -1)]) return pluralizar(SO_INTEIRO[chave.slice(0, -1)]);
  let pt = DENTRO[chave] || (DENTRO[chave.replace(/s$/, "")] && pluralizar(DENTRO[chave.replace(/s$/, "")]));
  if (!pt) {
    const usados = [];
    const troca = trocarDentes(chave, usados);
    if (usados.length === 1 && troca.trim() === usados[0]) pt = usados[0];
  }
  return pt ? pt[0].toUpperCase() + pt.slice(1) : null;
}
