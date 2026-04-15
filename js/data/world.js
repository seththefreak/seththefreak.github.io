const MUNDO_REGIOES = [
  {
    nome: 'Alsahra', emoji: '🏜️', slogan: 'Alsahra não conquista — ela atravessa.',
    clima: 'Quente e árido, variações extremas entre dia e noite',
    terreno: 'Desertos, oásis, litoral navegável, dunas móveis, zonas proibidas',
    cultura: 'Tradicional, mas flexível. Valorizam experiência, palavra dada e adaptação.',
    sociedade: 'Vários reinos e cidades-estado. Autoridade vem do respeito.',
    especialidades: ['Navegação marítima e estelar', 'Artesanato e artífice', 'Comércio de longo alcance', 'Sobrevivência extrema'],
    ameacas: 'Serpentes de areia, desertos viperinos, dragões do deserto',
    relacoes: 'Exportadores, guias, mercadores. Difíceis de enganar.',
    cor: '#f0deb0',
    provincias: [
      { nome: 'Desiver', tipo: 'Zona Proibida', desc: 'Território instável de criaturas e fenômenos. Rito de passagem para guias. Conhecimento do Desiver vale mais que ouro.', gancho: 'Algo em Desiver começou a mudar o deserto ao redor.' },
      { nome: 'Costa Safira', tipo: 'Mercantil Marítima', desc: 'Portos avançados e rotas oceânicas. Forte presença estrangeira. Pouca política, muito contrato.', gancho: null }
    ],
    microreinos: [
      { nome: 'Zahiret', tipo: 'Talassocracia mercantil', gov: 'Conselho de Capitães', militar: 'Marinha leve e experiente', comercial: 5, perigo: 'Sabem mais rotas do que admitem.', uso: 'Intrigas comerciais, mapas proibidos, contrabando de informação.' },
      { nome: 'Qadimra', tipo: 'Reino tradicional central', gov: 'Soberano ritualístico', militar: 'Guardas de oásis', comercial: 3, perigo: 'Tradições antigas não registradas em lugar nenhum.', uso: null },
      { nome: 'Serapha', tipo: 'Reino-fronteira', gov: 'Clãs juramentados', militar: 'Especialistas em caça', comercial: 2, perigo: 'Sabem matar sem deixar prova.', uso: null }
    ]
  },
  {
    nome: 'Severnoye', emoji: '🌤️', slogan: 'Severnoye não esquece — e não repete erros.',
    clima: 'Temperado, estações bem definidas',
    terreno: 'Planícies férteis, rios, colinas suaves, fronteiras fortificadas',
    cultura: 'Pragmática, diplomática e marcada pela memória histórica. Honra = responsabilidade.',
    sociedade: 'Reino unificado com forte administração central e participação política.',
    especialidades: ['Agricultura em larga escala', 'Logística', 'Diplomacia', 'Defesa territorial'],
    ameacas: 'Poucas — maior perigo é político/militar',
    relacoes: 'Confiável, respeitado, sempre cauteloso com Impersky As.',
    cor: '#b3d4f0',
    provincias: [
      { nome: 'Baixa Planície', tipo: 'Agrícola', desc: 'Celeiro do reino. Pouco militarizada. População leal mas vulnerável.', gancho: null },
      { nome: 'Guarda do Norte', tipo: 'Militar', desc: 'Fortalezas contínuas. Serviço militar obrigatório. Cultura marcial defensiva.', gancho: null }
    ],
    microreinos: [
      { nome: 'Velkar', tipo: 'Reino-estado administrativo', gov: 'Monarquia parlamentar', militar: 'Exército regular disciplinado', comercial: 4, perigo: 'Burocracia usada como arma.', uso: null },
      { nome: 'Morvask', tipo: 'Reino militarizado', gov: 'Marechais regionais', militar: 'Defensivo ⭐⭐⭐⭐⭐', comercial: 2, perigo: 'Uma faísca vira guerra aberta com Impersky.', uso: null }
    ]
  },
  {
    nome: 'Impersky As', emoji: '🏔️', slogan: 'Impersky não pergunta se deve avançar — pergunta quando.',
    clima: 'Frio severo',
    terreno: 'Cordilheiras, serras escarpadas, vales fechados',
    cultura: 'Rígida, militarizada, hierárquica. Disciplina acima do indivíduo.',
    sociedade: 'Ditadura imperial com dois grandes impérios rivais. Exército é a espinha dorsal.',
    especialidades: ['Guerra convencional', 'Estratégia militar', 'Mineração', 'Forjas'],
    ameacas: 'Clima, terreno, dragões menores (risco aceitável)',
    relacoes: 'Isolados, desconfiados, expansionistas quando oportuno.',
    cor: '#a090cc',
    provincias: [
      { nome: 'Cinturão de Ferro', tipo: 'Industrial', desc: 'Minas profundas, cidades-forja. Trabalho forçado comum.', gancho: null },
      { nome: 'Altos Domínios', tipo: 'Política', desc: 'Local do poder real. Isolada, fortificada, desconectada da população.', gancho: null }
    ],
    microreinos: [
      { nome: 'Karsgrad', tipo: 'Capital imperial', gov: 'Ditadura militar', militar: '⭐⭐⭐⭐⭐', comercial: 2, perigo: 'População treinada para obedecer… ou esmagar.', uso: null },
      { nome: 'Vostheim', tipo: 'Reino-muralha', gov: 'Governadores militares', militar: 'Tropas de elite', comercial: 1, perigo: 'Nenhuma lei civil vale aqui.', uso: null }
    ]
  },
  {
    nome: 'Hae', emoji: '🌲', slogan: 'Hae cura o mundo — mas esconde o custo.',
    clima: 'Úmido e ameno na costa, instável no interior',
    terreno: 'Florestas densas, árvores colossais, litoral desenvolvido',
    cultura: 'Erudita, científica e controlada. Conhecimento como poder.',
    sociedade: 'Reino tecnocrático, forte divisão entre costa civilizada e interior florestal.',
    especialidades: ['Farmacologia', 'Alquimia', 'Medicina', 'Pesquisa aplicada'],
    ameacas: 'Floresta profunda, entidades desconhecidas, colapso ecológico',
    relacoes: 'Essencial. Todos dependem de Hae em algum momento.',
    cor: '#b8e4d4',
    provincias: [
      { nome: 'Costa Verde', tipo: 'Civilizada/Acadêmica', desc: 'Cidades organizadas, universidades e laboratórios. Exportação de medicamentos.', gancho: null },
      { nome: 'Interior Profundo', tipo: 'Interditada', desc: 'Floresta hostil, experimentos não divulgados. Poucos retornam.', gancho: null }
    ],
    microreinos: [
      { nome: 'Lunareth', tipo: 'Cidade-estado acadêmica', gov: 'Conselho erudito', militar: 'Guarda científica', comercial: 4, perigo: 'Conhecimento sem limite ético.', uso: null },
      { nome: 'Eldruun', tipo: 'Domínio florestal oculto', gov: 'Desconhecido', militar: 'Assimétrica, invisível', comercial: 1, perigo: 'A floresta decide quem sai.', uso: null }
    ]
  },
  {
    nome: 'Alloe', emoji: '🌿', slogan: 'Alloe não guarda segredos — ela testa limites.',
    clima: 'Indefinido / instável',
    terreno: 'Bosque vivo saturado de energia mágica',
    cultura: 'Incompreensível para padrões externos. Se existe, não é linear.',
    sociedade: 'Não reconhecida, não catalogada, não governável.',
    especialidades: ['Concentração mágica', 'Fenômenos únicos', 'Alteração da realidade'],
    ameacas: 'A própria região',
    relacoes: 'Fonte de mitos, teorias e desaparecimentos.',
    cor: '#b8e4d4',
    provincias: [
      { nome: 'Zona Pulsante', tipo: 'Região Instável', desc: 'Realidade variável. Cartografia impossível. Tempo inconsistente. Estudada à distância por Hae.', gancho: null }
    ],
    microreinos: [
      { nome: 'Vael', tipo: 'Zona limítrofe viva', gov: 'Nenhum', militar: 'Magia reativa', comercial: 3, perigo: 'Mudança permanente do indivíduo.', uso: null },
      { nome: 'Nym-All', tipo: 'Núcleo mágico', gov: 'Inexistente', militar: 'Irrelevante', comercial: 5, perigo: 'Realidade instável.', uso: null }
    ]
  },
  {
    nome: 'Vallerohk', emoji: '🔥', slogan: 'Em Vallerohk, viver já é vitória.',
    clima: 'Instável, zonas de calor extremo',
    terreno: 'Território fragmentado, hostil, cercado por criaturas e dragões maiores',
    cultura: 'Pragmática, inovadora, resiliente. Sobrevivência gera engenhosidade.',
    sociedade: 'Pequenos reinos independentes, alianças circunstanciais.',
    especialidades: ['Engenharia avançada', 'Tecnologia defensiva', 'Armamentos não convencionais'],
    ameacas: 'Dragões maiores, fauna hostil, falhas ambientais',
    relacoes: 'Respeitados, temidos, raramente subestimados.',
    cor: '#f0c8d8',
    provincias: [
      { nome: 'Anel de Aço', tipo: 'Defensiva', desc: 'Fortificações móveis. Armamento experimental. Engenharia de sobrevivência.', gancho: null },
      { nome: 'Zona Rubra', tipo: 'Risco Dracônico', desc: 'Presença constante de dragões. Nenhuma cidade permanente. Postos avançados rotativos.', gancho: null }
    ],
    microreinos: [
      { nome: 'Skarn', tipo: 'Reino-forja', gov: 'Tecnarquia', militar: 'Engenharia ofensiva', comercial: 4, perigo: 'Tecnologia sem freio moral.', uso: null },
      { nome: 'Kalth', tipo: 'Reino-sentinela', gov: 'Conselho de sobreviventes', militar: 'Especialistas anti-dragão', comercial: 2, perigo: 'Sabem coisas que ninguém mais sobreviveu para contar.', uso: null }
    ]
  },
  {
    nome: 'Ryu Tal', emoji: '🐲', slogan: 'Ryu Tal não é lugar. É fim.',
    clima: 'Irrelevante (letal)',
    terreno: 'Hostil em todos os níveis',
    cultura: 'Dragônica / incompreensível',
    sociedade: 'Nenhuma forma reconhecível',
    especialidades: ['Existência absoluta', 'Extinção instantânea'],
    ameacas: 'Tudo',
    relacoes: 'Nenhuma — apenas medo e lenda.',
    cor: '#c05060',
    provincias: [],
    microreinos: []
  },
  {
    nome: 'Lilyfrost', emoji: '❄️', slogan: 'LilyFrost não governa territórios — governa destinos.',
    clima: 'Frio extremo e constante',
    terreno: 'Altitudes elevadas, gelo permanente',
    cultura: 'Aristocrática, elitista, refinada. Adaptação genética vista como mérito.',
    sociedade: 'Domínio de casas nobres antigas, poder herdado e protegido.',
    especialidades: ['Erudição avançada', 'Pesquisa genética/arcana', 'Finanças e patrocínio'],
    ameacas: 'Poucas — o ambiente é aliado',
    relacoes: 'Influência indireta, controle por dependência.',
    cor: '#b3d4f0',
    provincias: [
      { nome: 'Cúpulas Nobres', tipo: 'Elitista', desc: 'Acesso restrito. Tecnologia avançada. População selecionada.', gancho: null },
      { nome: 'Terras Brancas', tipo: 'Isolamento', desc: 'Pouco povoamento. Usada para exílio nobre. Ambiente hostil controlado.', gancho: null }
    ],
    microreinos: [
      { nome: 'Valeciel', tipo: 'Capital aristocrática', gov: 'Casas nobres', militar: 'Elite restrita', comercial: 5, perigo: 'Moldam o mundo sem aparecer.', uso: null },
      { nome: 'Iskrevane', tipo: 'Reino-fortaleza', gov: 'Casa militar', militar: 'Defesa absoluta', comercial: 2, perigo: 'Nenhuma invasão conhecida teve sucesso.', uso: null }
    ]
  },
  {
    nome: 'Frost Forest', emoji: '❄️🌲', slogan: 'A floresta decide quem passa.',
    clima: 'Frio, silencioso, mutável',
    terreno: 'Florestas congeladas, trilhas vivas',
    cultura: 'Nativa, espiritual, territorial',
    sociedade: 'Comunidades orgânicas, liderança fluida',
    especialidades: ['Navegação ritual', 'Camuflagem', 'Comunicação com a floresta'],
    ameacas: 'Perda de orientação, entidades naturais',
    relacoes: 'Fechada. Entrada só com permissão implícita.',
    cor: '#b3d4f0',
    provincias: [],
    microreinos: []
  },
  {
    nome: 'Kentrikos', emoji: '🏙️', slogan: "Kentrikos não é o centro do mundo — é o nó que o mantém inteiro.",
    clima: 'Moderado',
    terreno: 'Urbano, pontes monumentais, rotas centrais',
    cultura: 'Globalizada, multicultural, pragmática',
    sociedade: 'Cidade-estado neutra, governada por conselhos.',
    especialidades: ['Comércio internacional', 'Mediação política', 'Integração cultural'],
    ameacas: 'Poucas — ameaças são políticas',
    relacoes: 'Indispensável a todos.',
    cor: '#f0deb0',
    provincias: [
      { nome: 'Distrito Central', tipo: 'Urbana', desc: 'Sede de tratados. Zona multicultural. Neutralidade armada.', gancho: null },
      { nome: 'Anéis Comerciais', tipo: 'Logística', desc: 'Armazéns gigantes. Fluxo constante de bens. Conflitos econômicos frequentes.', gancho: null }
    ],
    microreinos: [
      { nome: 'Distrito Central', tipo: 'Cidade-mundo', gov: 'Conselho neutro armado', militar: 'Força dissuasiva', comercial: 5, perigo: "Neutralidade só existe porque todos precisam dela.", uso: null }
    ]
  }
];

// ── Dados: Bestiário ───────────────────────────────────────
const MUNDO_BESTAS = [
  // ── Dificuldade 1 ──
  { nome:'Lanoryx', apelido:'Ovelha de Lã Etérea', hab:['Mitte der Welt','Severnoye'], diff:'1', tam:'90cm', hab_str:'Mitte der Welt, Severnoye',
    stats:{ hp:'8–12', atq:'1d2', def:1, mov:'4u', sen:'Audição aguçada' },
    desc:'Herbívora dócil criada por aldeões. Sua lã retém temperatura corporal indefinidamente. Raramente ataca, mas quando acuada pode dar uma topada surpreendente.',
    habilidades:[
      { nome:'Lã Isotérmica', desc:'Ao ser tosada, a lã pode ser usada como material para mantos térmicos (+1 resistência ao frio por dia de uso).' },
      { nome:'Passividade Instintiva', desc:'Não ataca primeiro. Se não ameaçada, foge em vez de lutar. Pode ser domesticada com testes de Persuasão (DIF 2).' },
      { nome:'Ancoragem Leve', desc:'Sua presença reduz o custo de SP ao descansar em campo aberto (-1 SP de desgaste noturno).' }
    ],
    drops:[{item:'Lã de Lanoryx',chance:'100%',rar:0,desc:'Material básico. Mantém calor por 24h. Usado em mantos e kits de sobrevivência.'},{item:'Leite de Lanoryx',chance:'40%',rar:0,desc:'Restaura 1 HP. Pode ser consumido imediatamente ou guardado por 2 dias.'}] },

  { nome:'Burim', apelido:'Toupeira de Pedra', hab:['Impersky'], diff:'1', tam:'70cm', hab_str:'Impersky, subterrâneos',
    stats:{ hp:'10–15', atq:'1d4 (garra)', def:2, mov:'3u (superfície) / 6u (solo)', sen:'Tremossensível' },
    desc:'Escava através de rocha com as garras duras como pedra. Cega acima do solo, mas detecta vibração a 20 metros.',
    habilidades:[
      { nome:'Escavação Rochosa', desc:'Pode escavar até 2 metros de rocha por turno. Cria tuneis que duram 1d4 horas antes de desmoronar.' },
      { nome:'Sentido Sísmico', desc:'Detecta qualquer criatura pisando no chão a até 15 metros. Não pode ser surpreendido em solo firme.' },
      { nome:'Ocultação Natural', desc:'Sob o chão, é invisível. Emerge com ataque surpresa (vantagem no primeiro ataque).' }
    ],
    drops:[{item:'Garra de Burim',chance:'50%',rar:1,desc:'Material duro como aço. Usado como ferramenta de escavação ou ponta de flechas perfurantes.'},{item:'Couro Pétreo',chance:'30%',rar:1,desc:'Resistente ao impacto. Pode ser usado em armaduras improvisadas (+0,5 RD).'}] },

  { nome:'Solcapra', apelido:'Cabra Solar', hab:['Alsahra','Severnoye'], diff:'1', tam:'1,2m', hab_str:'Alsahra, Severnoye, regiões quentes',
    stats:{ hp:'12–16', atq:'1d4 (chifrada)', def:1, mov:'6u', sen:'Visão solar (não ofuscável)' },
    desc:'Criatura herbívora adaptada ao calor extremo. Seus chifres acumulam energia solar e liberam calor em ambientes frios.',
    habilidades:[
      { nome:'Metabolismo Solar', desc:'Em regiões de sol intenso, regenera 1 HP por hora. Pode ser usada como fonte de calor em acampamentos.' },
      { nome:'Escalada Ágil', desc:'Sobe superfícies verticais com facilidade. Ignora penalidade de terreno acidentado.' },
      { nome:'Resistência ao Calor', desc:'Imune a dano de calor ambiente. Em locais quentes, recebe +1 em todos os atributos físicos.' }
    ],
    drops:[{item:'Leite Solar',chance:'70%',rar:0,desc:'Restaura 2 HP e 1 SP. Tem sabor adocicado. Estraga em 6 horas fora de ambiente quente.'},{item:'Chifre de Solcapra',chance:'30%',rar:1,desc:'Armazena calor por 12h. Pode ser usado para acender fogo sem fagulha ou como lanterna térmica.'}] },

  { nome:'Glissfin', apelido:'Peixe de Escama Lisa', hab:['Kentrikòs'], diff:'1', tam:'60cm', hab_str:'Kentrikòs, lagos e rios',
    stats:{ hp:'6–8', atq:'1d2 (mordida)', def:1, mov:'7u (água) / 1u (fora)', sen:'Linha lateral aquática' },
    desc:'Peixe ágil de rios rasos. Suas escamas refletem luz e confundem predadores. Comestível e abundante.',
    habilidades:[
      { nome:'Nado Reflexivo', desc:'Esquiva automaticamente de qualquer ataque de projétil dentro da água (reage antes do impacto).' },
      { nome:'Camuflagem Aquática', desc:'Parado na água, é virtualmente invisível. Detecção requer teste de Percepção (DIF 3).' },
      { nome:'Salto Curto', desc:'Pode saltar até 3 metros fora da água para escapar de ameaças.' }
    ],
    drops:[{item:'Escama Lisa',chance:'80%',rar:0,desc:'Superfície reflexiva. Usado em colares decorativos, espelhos improvisados ou iscas de pesca.'},{item:'Filé de Glissfin',chance:'60%',rar:0,desc:'Comestível. Restaura 1 HP quando consumido. Fresco por 1 dia.'}] },

  { nome:'Tremelac', apelido:'Sapo de Bruma', hab:['Severnoye'], diff:'1', tam:'35cm', hab_str:'Severnoye, pântanos e margens de rios',
    stats:{ hp:'5–8', atq:'1d2 (língua)', def:0, mov:'4u', sen:'Termorreceptores na pele' },
    desc:'Sapo que libera névoa densa quando ameaçado. A névoa obscurece visão mas não causa dano diretamente.',
    habilidades:[
      { nome:'Exalar Bruma', desc:'Ação: libera névoa 3x3u ao redor. Visibilidade reduzida a 1 metro. Dura 1d4 turnos. Pode usar 1x por combate.' },
      { nome:'Salto Amortecido', desc:'Cai de qualquer altura sem dano. Seus ossos são altamente flexíveis.' },
      { nome:'Pele Úmida', desc:'Resistente a fogo (−2 de dano). Em seco extremo, perde 1 HP por turno.' }
    ],
    drops:[{item:'Secreção de Bruma',chance:'50%',rar:1,desc:'Pode ser usada para criar bombas de fumaça improvisadas (área 2x2u, dura 3 turnos).'},{item:'Olho de Tremelac',chance:'20%',rar:2,desc:'Ingrediente alquímico. Base para poções de neblina ou de camuflagem.'}] },

  // ── Dificuldade 2 ──
  { nome:'Pistraw', apelido:null, hab:['Kentrikòs'], diff:'2-5', tam:'2×2u a 6×6u', hab_str:'Kentrikòs, Lago de Ametista',
    stats:{ hp:'30–120', atq:'1d6 a 3d8 (garra/canhão)', def:'2–6', mov:'5u (água)', sen:'Ecolocalização subaquática' },
    desc:'Crustáceo adaptável que cresce ao longo da vida. Pequenos são pragas de rios; os maiores são caçados como boss de masmorra. Quanto maior, mais letais as garras e o canhão de vórtex.',
    habilidades:[
      { nome:'Estalo de Pressão', desc:'Estala a garra criando onda de choque: 1d4 dano + Atordoamento (1 turno) em cone 3u. Afeta criaturas fora da água também.' },
      { nome:'Garra Martelo', desc:'Ataque que ignora RD de armaduras de couro. Contra metal, causa dano normal mas danifica o equipamento (−1 de proteção).' },
      { nome:'Canhão de Vórtex', desc:'[Cooldown 3 turnos] Lança vórtex d\'água: 2d6 dano, arrasta 3u em direção ao Pistraw. Alcance 8u.' }
    ],
    drops:[{item:'Garra de Pistraw',chance:'65%',rar:2,desc:'Arma natural. 1d6 dano de corte. Pode ser usada como ferramenta de esmagamento.'},{item:'Canhão de Pistraw',chance:'25%',rar:3,desc:'Câmara orgânica que armazena pressão. Artífices podem usá-la em armas de pressão ou armadilhas.'}] },

  { nome:'Arken', apelido:null, hab:['Mar de Fuzuryu'], diff:'2', tam:'1,5m', hab_str:'Mar de Fuzuryu',
    stats:{ hp:'20–28', atq:'1d6 (arpão)', def:2, mov:'8u (água)', sen:'Eletrorrecepção' },
    desc:'Cefalópode ágil de mar profundo. Lança arpões biológicos e libera cortinas de tinta tóxica para escapar.',
    habilidades:[
      { nome:'Propulsão Hidráulica', desc:'Pode se mover 12u em linha reta como ação bonus. Pode fazer isso fora da água por 1 turno antes de perder mobilidade.' },
      { nome:'Cortina Tóxica', desc:'Libera tinta que causa Cegueira (2 turnos) e 1d2 de dano veneno por turno. Área 2x2u. 1x por combate.' },
      { nome:'Lançamento de Arpão', desc:'Ataque à distância 6u: 1d6 perfuro + Enredado (teste FOR DIF 3 para se libertar).' }
    ],
    drops:[{item:'Tinta de Arken',chance:'60%',rar:2,desc:'3 usos. Pode ser usada como arma improvisada (cegueira) ou tinta de escrita permanente.'},{item:'Gel Tóxico de Arken',chance:'35%',rar:2,desc:'Veneno de contato. 1d3 dano por turno por 3 turnos. DIF 3 de CON para resistir.'}] },

  { nome:'Frozteryx', apelido:'Ave de Cristal Aurora', hab:['Vallerohk','Alloe'], diff:'2-3', tam:'3m envergadura', hab_str:'Vallerohk, Alloe, Ukya Lake',
    stats:{ hp:'22–40', atq:'1d6 (penas cortantes) / 1d8 (mergulho)', def:2, mov:'3u (solo) / 10u (voo)', sen:'Visão ultravioleta' },
    desc:'Ave cujas penas são fragmentos de cristal voadores. Em ataque de mergulho, pode cortar armaduras leves. O véu de aurora que emite confunde sentidos.',
    habilidades:[
      { nome:'Penas de Cristal', desc:'Quando golpeado, libera 1d4 penas cortantes ao redor (1 dano a todos adjacentes). Penas podem ser coletadas.' },
      { nome:'Mergulho de Falcão', desc:'[Turno de recarga] Mergulho de altura: 1d8 + 2 dano, ignora escudos. Só pode usar com pelo menos 4u de espaço vertical.' },
      { nome:'Véu de Aurora', desc:'Emite luz iridescente: criaturas num raio de 4u devem testar VON DIF 2 ou ficam Desorientadas (−1 em ações) por 1 turno.' }
    ],
    drops:[{item:'Penas de Frozteryx',chance:'100%',rar:2,desc:'Cortantes como lâminas. Usadas em flechas +1 dano ou acessórios de luxo (valor 40P cada).'},{item:'Safira Congelada',chance:'20%',rar:3,desc:'Cristal mágico que emite aurora fraca. Base para itens de ilusão ou encantamentos de confusão.'}] },

  { nome:'Lupis Sangrento', apelido:'Lobo das Sombras', hab:['Frost Forest'], diff:'2', tam:'2m', hab_str:'Frost Forest',
    stats:{ hp:'25–32', atq:'1d8 (mordida) + Sangramento', def:2, mov:'7u', sen:'Olfato: rastreia sangue a 2km' },
    desc:'Lobo que ataca em bando. Sua mordida causa Sangramento persistente. Usa a sombra das árvores para emboscar.',
    habilidades:[
      { nome:'Aterrorizar', desc:'Uivo longo: todas criaturas num raio 8u que ouçam testam VON DIF 3 ou ficam Amedrontadas (−2 ações ofensivas) por 2 turnos.' },
      { nome:'Dilacerar', desc:'Mordida que causa Sangramento: 1 HP de dano por turno por 3 turnos. Medicina DIF 2 para estancar.' },
      { nome:'Ocultar nas Sombras', desc:'Em florestas ou ambientes escuros, torna-se Furtivo automaticamente. Primeira rodada de combate sempre tem iniciativa +3.' }
    ],
    drops:[{item:'Presa de Lupis',chance:'45%',rar:2,desc:'Dente com veneno residual. Pode ser montada como ponta de arma (adiciona Sangramento 1/turno por 2 turnos).'},{item:'Couro de Lupis',chance:'55%',rar:1,desc:'Couro negro que absorve luz. −1 em testes de percepção contra quem usa. Valor 60P.'}] },

  { nome:'Corvex', apelido:'Corvo de Olho Duplo', hab:['Kentrikòs','Vallerohk'], diff:'2', tam:'55cm', hab_str:'Mitte der Welt, Vallerohk',
    stats:{ hp:'12–18', atq:'1d4 (bico + olhos)', def:1, mov:'2u (solo) / 9u (voo)', sen:'Visão 360°, detecta magia' },
    desc:'Corvo com dois pares de olhos. Um par vê o plano físico, o outro detecta rastros mágicos. Muito inteligente, aprende com cada caçador que observa.',
    habilidades:[
      { nome:'Visão Duplicada', desc:'Nunca pode ser surpreendido ou flanqueado. Detecta invisibilidade mágica (DIF 2 para esconder magia do Corvex).' },
      { nome:'Memória Visual', desc:'Após observar uma criatura por 1 turno completo, o Corvex "aprende" seu padrão de ataque. Torna-se mais difícil de acertar em voo.' },
      { nome:'Furto Oportunista', desc:'Pode roubar pequenos objetos de personagens durante o combate (ataque com DES vs DES). Alvos prioridade: itens brilhantes e poções.' }
    ],
    drops:[{item:'Pena de Corvex',chance:'60%',rar:2,desc:'Pena imbuída com percepção. Usada como pena de escrita mágica ou em amuletos de detecção.'},{item:'Olho de Corvex',chance:'15%',rar:3,desc:'Ingrediente raro. Usado em poções de True Sight (visão de auras e ilusões por 1 hora).'}] },

  { nome:'Gromel', apelido:'Javali Musgoso', hab:['Hae'], diff:'2', tam:'1,5m', hab_str:'Hae, florestas densas',
    stats:{ hp:'28–36', atq:'1d6 + 1 (investida com presas)', def:3, mov:'5u', sen:'Olfato excelente, visão ruim' },
    desc:'Javali coberto de musgo vivo. O musgo é um organismo simbiótico que lhe dá camuflagem mas também consome seus nutrientes.',
    habilidades:[
      { nome:'Camuflagem de Musgo', desc:'Em ambiente florestal, se imóvel por 1 turno, torna-se virtualmente invisível. Percepção DIF 4 para encontrar.' },
      { nome:'Investida Bruta', desc:'Move até 6u em linha reta e ataca: 1d8 + derrube automático. Se colide com parede, causa 1d4 de autostun.' },
      { nome:'Persistência Animal', desc:'Quando reduzido a 0 HP, tem 40% de chance de agir uma vez mais antes de cair. Não pode ser intimidado ou amedrontado.' }
    ],
    drops:[{item:'Couro Musgoso',chance:'50%',rar:1,desc:'Leve e respirável. Serve como armadura natural (+1 RD) em ambientes úmidos. Em ambientes secos, perde bônus.'},{item:'Presa de Gromel',chance:'30%',rar:1,desc:'Resistente. Pode ser usada como ferramenta ou ponta de lança improvizada (1d4 dano).'}] },

  { nome:'Fiorin', apelido:'Raposa de Flor', hab:['Hae','Alloe'], diff:'2', tam:'75cm', hab_str:'Hae, Alloe',
    stats:{ hp:'14–20', atq:'1d4 (mordida)', def:1, mov:'8u', sen:'Olfato floral, detecta emoções por odor' },
    desc:'Raposa elegante que se camufla entre flores. Mais curiosa que agressiva, mas defende território com mordidas precisas. Detecta o estado emocional de criaturas próximas.',
    habilidades:[
      { nome:'Camuflagem Floral', desc:'Em áreas com flores ou vegetação colorida, invisível. Pode se mover até 4u mantendo camuflagem.' },
      { nome:'Curiosidade Astuta', desc:'Aprende rotas de fuga dos inimigos rapidamente. Após 2 turnos de combate, nenhuma armadilha pega uma Fiorin que já viu o combate.' },
      { nome:'Mordida Defensiva', desc:'Contra inimigos que estejam atacando outras criaturas, sua mordida causa +1d4 de dano adicional.' }
    ],
    drops:[{item:'Pêlo de Fiorin',chance:'40%',rar:2,desc:'Sedoso e levemente perfumado. Usado em cosméticos alquímicos ou como material de luxo (30P o quilo).'},{item:'Colar de Flores',chance:'10%',rar:2,desc:'Às vezes a Fiorin usa colares naturais. Têm propriedades de camuflagem residual (−1 em detecção por 6h).'}] },

  // ── Dificuldade 3 ──
  { nome:'Raptor', apelido:'Veloz de Crista Vermelha', hab:['Impersky','Vallerohk'], diff:'3', tam:'1,5m', hab_str:'Impersky, Vallerohk, Alsahra',
    stats:{ hp:'35–50', atq:'1d8 (garra) + 1d4 (mordida)', def:3, mov:'9u', sen:'Visão de movimento (180°)' },
    desc:'Predador bípede que caça em grupos de 3 a 5. Coordenam emboscadas com sinais visuais e sono de cauda. Cada um tem papel: flanqueador, isca, atacante.',
    habilidades:[
      { nome:'Garra Terrível', desc:'Ataque de garra: se acertar com 5+ acima da DIF, o alvo cai (derrubado). Mantém o alvo preso até ser removido (ação).' },
      { nome:'Reunir', desc:'Uivo curto faz todos os Raptores adjacentes moverem 3u como reação. Usado para reorganizar posicionamento.' },
      { nome:'Emboscada', desc:'Se todos os Raptores agirem antes do alvo numa rodada, cada um faz +1d4 de dano nessa rodada. Requer que o alvo não tenha agido ainda.' }
    ],
    drops:[{item:'Dente de Raptor',chance:'55%',rar:2,desc:'Afiado como bisturi. Usado como ferramenta cirúrgica ou ponta de dardo. +1 ao dano de perfuro.'},{item:'Couro de Raptor',chance:'50%',rar:2,desc:'Flexível e resistente. Bom material para armaduras leves. RD 3, penalidade −1.'}] },

  { nome:'Titanoboa', apelido:'Serpente-Lança', hab:['Hae'], diff:'3', tam:'4×4u', hab_str:'Hae, pântanos e rios largos',
    stats:{ hp:'60–80', atq:'2d6 (constrição) / 1d8 (cauda)', def:4, mov:'6u', sen:'Fosseta loreal (calor), vibração terrestre' },
    desc:'Serpente massiva que mata por constrição. Pode caçar presas maiores que ela. A cauda independente funciona como segunda arma.',
    habilidades:[
      { nome:'Constrição', desc:'Agarrar automático se mordida acertar. Cada turno agarrado: 2d6 dano. Para escapar: FOR vs FOR (DIF 5). Múltiplos alvos possíveis.' },
      { nome:'Camuflagem Ativa', desc:'Padrão que muda cor: em qualquer ambiente, Percepção DIF 4 para detectar quando imóvel.' },
      { nome:'Cauda Chicote', desc:'Ataque à área: cauda golpeia todos numa linha de 6u. 1d8 dano + Derrubado. Ação separada da mordida.' }
    ],
    drops:[{item:'Couro de Titanoboa',chance:'60%',rar:3,desc:'Extremamente resistente e flexível. Armadura de elite: RD 5, penalidade −1, peso 12kg. Valor 400P.'},{item:'Veneno de Titanoboa',chance:'25%',rar:3,desc:'Paralisa músculos. DIF 4 CON para resistir: 2d4 dano por turno por 4 turnos + paralisia muscular gradual.'}] },

  { nome:'Zomrex', apelido:'Morto-Errante Monumental', hab:['Ryu Tal','Vallerohk'], diff:'3', tam:'15m', hab_str:'Ryu Tal, Vallerohk, Impersky',
    stats:{ hp:'80–100', atq:'2d8 (mordida) + Maldição', def:5, mov:'4u', sen:'Detecta vivos a 30m por calor' },
    desc:'Criatura morta-viva de tamanho colossal. Emana aura de putrefação que enfraquece vivos. Sua mordida transmite maldição de decomposição.',
    habilidades:[
      { nome:'Morto-Vivo', desc:'Imune a: venenos, doenças, intimidação, medo, frio. Recebe dano duplo de magia de luz. Não pode ser curado por meios naturais.' },
      { nome:'Aura Pútrida', desc:'Raio 6u: criaturas vivas sofrem −1 em todos os testes por turno de exposição (acumulativo até −3). Saindo da área, recupera em 2 turnos.' },
      { nome:'Mordida Amaldiçoada', desc:'Infecta com Maldição de Putrefação: −2 HP máximo por dia. Cura exige ritual ou magia de purificação.' }
    ],
    drops:[{item:'Dente de Zomrex',chance:'40%',rar:3,desc:'Imbuído com energia necrótica. Pode ser usado para criar flechas de maldição (+1d4 necrótico, aplica Maldição Menor).'},{item:'Gel Necrótico',chance:'35%',rar:2,desc:'Substância que drena vida. Pode ser usado como veneno (−2 HP máximo por dia por 3 dias) ou em rituais.'}] },

  { nome:'Thalmyr', apelido:'Leviatã da Baía', hab:['Kentrikòs'], diff:'3-5', tam:'12–25m', hab_str:'Baía Central de Kentrikòs',
    stats:{ hp:'100–200', atq:'3d8 (mandíbula) / 2d6 (onda)', def:'5–7', mov:'12u (água)', sen:'Ecolocalização de 200m' },
    desc:'Leviatã que vive no fundo da Baía de Kentrikòs. Criação de correntes e redemoinhos. Os menores são confrontáveis; o Thalmyr adulto é uma lenda viva.',
    habilidades:[
      { nome:'Onda de Compressão', desc:'Dispara onda de pressão hidráulica: alcance 20u, 2d6 dano + arremessa alvo 4u atrás. Fora da água, alcance reduz para 6u.' },
      { nome:'Mandíbula Abissal', desc:'Mordida que ignora RD de armaduras metálicas. Chance 30% de prender o alvo (requer FOR DIF 5 para soltar).' },
      { nome:'Redemoinho Interno', desc:'[1x/combate] Cria vórtice 8x8u: tudo nessa área é arrastado para o centro. 3d6 dano por turno dentro. Dura até o Thalmyr morrer ou sair.' }
    ],
    drops:[{item:'Escama de Thalmyr',chance:'70%',rar:3,desc:'Dureza equivalente ao ferro, mas flexível. Armadura rara: RD 6, resistência aquática, imune à corrosão. Valor 600P.'},{item:'Núcleo Hidrostático',chance:'20%',rar:4,desc:'Órgão que acumula pressão absurda. Artífices o usam em armas de pressão ou como geradores de força mágica.'}] },

  { nome:'Zar\'Khesh', apelido:'Escorpião de Vidro', hab:['Alsahra'], diff:'3', tam:'4m', hab_str:'Alsahra, zonas de areia vítrea',
    stats:{ hp:'55–70', atq:'1d8 (ferrão) + Veneno / 1d6 (pinça)', def:5, mov:'6u', sen:'Vibrossensor de areia, visão composta 360°' },
    desc:'Escorpião com exoesqueleto de sílica cristalizada. Usa o deserto como arma: quando ferido, o exoesqueleto fragmenta e lança lascas.',
    habilidades:[
      { nome:'Ferrão Prismático', desc:'Ferrão causa 1d8 + veneno cristalino: DIF 3 CON ou 1d4 por turno por 3 turnos + cegueira temporária (1 turno).' },
      { nome:'Camuflagem de Areia', desc:'Em desertos arenosos, se imóvel: invisível. Em movimento, Percepção DIF 3.' },
      { nome:'Estouro de Quartzo', desc:'Quando abaixo de 30% HP: exoesqueleto fragmenta enviando estilhaços em cone 5u: 2d4 dano + Sangramento a todos atingidos.' }
    ],
    drops:[{item:'Ferrão de Zar\'Khesh',chance:'50%',rar:3,desc:'Ancora veneno cristalino por semanas. Arma única: 1d8 + veneno por 2 usos antes de secar.'},{item:'Fragmento de Vidro Vivo',chance:'40%',rar:2,desc:'Material translúcido e cortante. Usado em lâminas especiais ou como lente mágica (foca energia).'}] },

  { nome:'Nivraeth', apelido:'Cervo do Inverno Eterno', hab:['Lilyfrost','Frost Forest'], diff:'3', tam:'2,5m', hab_str:'Lilyfrost, Frost Forest',
    stats:{ hp:'50–65', atq:'1d8 (galho) + Frio / 1d6 (cascos)', def:3, mov:'8u', sen:'Visão infravermelha inversa (vê calor como escuridão)' },
    desc:'Cervo majestoso que personifica o inverno. Onde pisa, o chão gela. Seus chifres absorvem calor do ambiente.',
    habilidades:[
      { nome:'Investida Glacial', desc:'Corrida de 8u e golpe de galho: 1d8 + 1d4 frio. O alvo fica Retardado (mov ÷ 2) por 2 turnos.' },
      { nome:'Passos Silenciosos', desc:'Move-se sem fazer som. Rastreamento requer Percepção DIF 5. Neve não registra seus rastros.' },
      { nome:'Aura de Bruma', desc:'Raio permanente 3u: temperatura cai, visibilidade reduz a 2u. Criaturas que entram testam CON DIF 2 ou −1 em ações.' }
    ],
    drops:[{item:'Galhada de Nivraeth',chance:'40%',rar:3,desc:'Sempre fria ao toque. Raramente cai. Pode ser usada como foco mágico para magias de gelo ou como ornamento de alto valor (300P).'},{item:'Véu de Gelo Vivo',chance:'30%',rar:3,desc:'Cristal translúcido que forma na galhada. Gel mágico: quando aplicado em superfície, cria camada de gelo que dura 4 horas.'}] },

  { nome:'Ophidryx', apelido:'Serpente de Magma Frio', hab:['Severnoye'], diff:'3-4', tam:'15m', hab_str:'Severnoye, regiões de contraste térmico',
    stats:{ hp:'65–90', atq:'1d10 (mordida criotérmica) + Queimadura Fria', def:4, mov:'6u', sen:'Detecta variações térmicas a 50m' },
    desc:'Paradoxo: serpente que usa magma frio. Seu corpo contém câmaras de energia térmica oposta — extremamente quente por dentro, gela o que toca externamente.',
    habilidades:[
      { nome:'Mordida Criotérmica', desc:'Causa 1d6 dano de frio + 1d4 dano de queimadura térmica simultâneos. Resistência a apenas um tipo ignora metade; resistir a ambos cancela tudo.' },
      { nome:'Corpo Fluido', desc:'Escorrega por espaços de 30cm de diâmetro. Imune a agarramentos. Pode se mover através de grade e fissuras.' },
      { nome:'Explosão de Vapor', desc:'[1x/combate] Libera vapor criotérmico em área 4×4u: 2d6 dano térmico misto + Cegueira por 2 turnos.' }
    ],
    drops:[{item:'Glândula Térmica',chance:'45%',rar:3,desc:'Órgão que mantém temperatura extrema. Artífices usam para criar armas de dano misto (quente+frio) ou granadas térmicas.'},{item:'Escama Dual',chance:'35%',rar:3,desc:'Cada escama tem dois lados: um quente, um frio. Base para armaduras de resistência mista (+2 contra fogo, +2 contra gelo).'}] },

  { nome:'Dragão Terrestre', apelido:'Drakon do Solo', hab:['Severnoye','Alsahra','Ryu Tal'], diff:'3', tam:'5m', hab_str:'Severnoye, Alsahra, Ryu Tal, Vallerohk, Impersky',
    stats:{ hp:'70–90', atq:'2d6 (garra) / 1d8 (cauda)', def:5, mov:'7u', sen:'Visão térmica, olfato dracônico' },
    desc:'Dragão sem asas, adaptado ao solo. Mais rápido e resistente que parece. Pode ser domesticado com muito esforço — Montaria de elite para aventureiros experientes.',
    habilidades:[
      { nome:'Couro Escamado', desc:'RD natural 5. Armas sem bônus mágico causam −2 de dano contra ele.' },
      { nome:'Montaria', desc:'Se domado (processo de 1d4 semanas e testes), pode ser usado como montaria. Carrega até 200kg sem penalidade.' },
      { nome:'Impulso Terrestre', desc:'Uma vez por combate: move 12u em linha reta, atropelando tudo no caminho (2d8 dano, alvo derrubado).' }
    ],
    drops:[{item:'Couro de Dragão Terrestre',chance:'60%',rar:3,desc:'Material excepcional. Armadura pesada sem penalidade de mobilidade: RD 7, peso 18kg, valor 800P.'},{item:'Escama Dracônica',chance:'40%',rar:3,desc:'Resistente ao fogo. Pode ser usada como escudo natural ou integrada em armaduras existentes (+1 RD, +1 resistência fogo).'}] },

  // ── Dificuldade 4 ──
  { nome:'Foxina', apelido:'Raposa Espectral', hab:['Frost Forest'], diff:'4', tam:'80cm', hab_str:'Frost Forest',
    stats:{ hp:'45–60', atq:'1d6 (mordidia etérea) + Dreno', def:3, mov:'9u (pode passar por paredes em curtas distâncias)', sen:'Vê planos espirituais' },
    desc:'Criatura entre dois planos. Parte física, parte espiritual. Seu olhar drena força vital. Raramente ataca por fome — ataca por território ou curiosidade.',
    habilidades:[
      { nome:'Caminhar entre Mundos', desc:'Uma vez por turno, pode se mover 3u passando por obstáculos sólidos (não por barreiras mágicas).' },
      { nome:'Devorar Espírito', desc:'Mordida especial: causa 0 HP mas drena 1d4 de SAN. Se a SAN chegar a 0, alvo desmaia por 1d4 horas com pesadelos.' },
      { nome:'Chama Espiritual', desc:'[3x/combate] Projeta chama branca de espírito: alcance 6u, 1d8 dano + ignora RD completamente.' }
    ],
    drops:[{item:'Essência Lunar',chance:'5%',rar:5,desc:'Substância etérea condensada. Ingrediente para rituais de travessia planar ou poções de invisibilidade de 1 hora.'},{item:'Pêlo Espectral',chance:'40%',rar:4,desc:'Translúcido e levemente luminoso. Usado em amuletos de proteção espiritual (+2 SAN máx por 24h).'}] },

  { nome:'Desiver', apelido:'A Criatura', hab:['Alsahra'], diff:'4', tam:'30m', hab_str:'Alsahra, interior das dunas proibidas',
    stats:{ hp:'150–200', atq:'3d8 (engolir) / 2d6 (areia)', def:6, mov:'— (solo) / 8u (no interior das dunas)', sen:'Sente qualquer pisada em 100m de raio' },
    desc:'A lenda viva de Alsahra. Ninguém viu um e sobreviveu para descrever completamente. O Desiver é o deserto — ou pelo menos parte dele. Existem teorias de que é múltiplo ou único.',
    habilidades:[
      { nome:'Mergulho na Areia', desc:'Desaparece abaixo das dunas instantaneamente. Reaparece em qualquer ponto do deserto no turno seguinte. Rastrear: impossível.' },
      { nome:'Caixão de Areia', desc:'Emerge sob um alvo: automaticamente o engole se o alvo não passar em Reflexos DIF 5. Dentro: 2d6 sufocação por turno.' },
      { nome:'Corpo de Areia', desc:'Imune a corte e perfuro. Dano elétrico e água causam dano normal. O Desiver dissolve em partículas se "morto" — reaparece em 1d6 dias.' }
    ],
    drops:[{item:'Diamante do Desiver',chance:'30%',rar:4,desc:'Formado pela pressão extrema dentro do Desiver. Puro e magicamente carregado. Valor 2000P ou usado como núcleo mágico.'},{item:'Areia de Ferro',chance:'40%',rar:3,desc:'Areia que o Desiver processa. Extremamente densa. Usada em pesos de âncora ou como material de forja especial.'}] },

  { nome:'Demokrok', apelido:'Crocodilo Colossal', hab:['Severnoye','Impersky'], diff:'4', tam:'15m', hab_str:'Severnoye, Impersky, Alsahra, Ryu Tal',
    stats:{ hp:'180–240', atq:'3d10 (mordida) + Quebrar Ossos', def:7, mov:'5u (solo) / 8u (água)', sen:'Laplace de 80m, visão noturna' },
    desc:'Crocodilo antigo que cresceu por séculos. Seu couro é mais duro que a maioria dos metais. Uma mordida parte um cavaleiro ao meio com armadura.',
    habilidades:[
      { nome:'Quebrar Ossos', desc:'Mordida com 8+ acima da DIF: causa Fratura (−3 em ações com membro afetado, cura leva 1d4 dias).' },
      { nome:'Imposição', desc:'Presence aterrorizante: todas criaturas de DIF <4 que o vejam diretamente testam VON DIF 4 ou fogem na primeira oportunidade.' },
      { nome:'Terremoto', desc:'[1x/combate] Golpeia o solo com a cauda: terremoto em área 10×10u. 2d8 dano + todos na área caem. Dura 1 turno.' }
    ],
    drops:[{item:'Escamas de Demokrok',chance:'50%',rar:4,desc:'Mais duras que placas de ferro. Armadura ultra-pesada: RD 9, penalidade −4, peso 35kg. Valor 1500P.'},{item:'Presa de Demokrok',chance:'40%',rar:4,desc:'2m de comprimento. Usada como espada de mão única (2d8 dano de corte) ou como componente de arma lendária.'},{item:'Coração de Demokrok',chance:'15%',rar:5,desc:'Pulsa por 48h após a morte. Ingrediente para poções de resistência extrema (RD +3 por 24h).'}] },

  { nome:'Dragão Menor', apelido:'Drakon Voador', hab:['Ryu Tal','Vallerohk'], diff:'4', tam:'5×5u', hab_str:'Ryu Tal, Vallerohk, Severnoye, Impersky',
    stats:{ hp:'120–160', atq:'2d8 (garra) / 2d6 (bafo)', def:6, mov:'6u (solo) / 14u (voo)', sen:'Visão mágica, olfato dracônico a 1km' },
    desc:'Dragão jovem, mas já devastador. Domina seu território com bafo e voo. Inteligente o suficiente para reconhecer e se vingar de quem o feriu.',
    habilidades:[
      { nome:'Bafo', desc:'Cone 8×4u: 3d6 dano de fogo/gelo/ácido (varia por indivíduo). DEX DIF 4 para metade. Cooldown 1d3 turnos.' },
      { nome:'Intimidar', desc:'Presença + rugido: todas criaturas de DIF <5 num raio 12u testam VON DIF 4 ou ficam Atordoadas por 1 turno.' },
      { nome:'Escamas Infusionadas', desc:'RD 6 natural. Imune ao seu próprio tipo de bafo. Resistência 50% a tipos diferentes.' }
    ],
    drops:[{item:'Couro de Dragão Menor',chance:'50%',rar:4,desc:'Símbolo de prestígio. Armor excepcional: RD 7, leve (8kg), resistência ao tipo de bafo do dragão. Valor 2000P.'},{item:'Escamas de Dragão Menor',chance:'60%',rar:4,desc:'Usadas individualmente ou em armaduras compostas. Cada escama: +0,3 RD. 30 escamas = 1 conjunto. Valor 50P cada.'},{item:'Coração de Dragão',chance:'10%',rar:5,desc:'Condensa poder dracônico. Ingrediente para encantamentos definitivos ou armas únicas. Valor 5000P.'},{item:'Gel Inflamável',chance:'40%',rar:3,desc:'Resíduo do bafo. 3 usos como bomba de fogo (2d6 área 3×3u) ou para acender chamas sem fagulha.'}] },

  { nome:'Mycelord', apelido:'Soberano Esporoso', hab:['Hae','Alloe'], diff:'4', tam:'6–9m', hab_str:'Hae, Alloe, florestas úmidas profundas',
    stats:{ hp:'100–140', atq:'2d6 (tentáculo fúngico) / 1d8 (esporos)', def:4, mov:'3u (muito lento)', sen:'Consciência micelar: sente qualquer criatura a 50m' },
    desc:'Fungo gigante com consciência distribuída. Controla fungos menores numa rede. Suas ações parecem lentas, mas a rede ao redor age como armadilha.',
    habilidades:[
      { nome:'Nuvem de Esporos', desc:'Área 6×6u: esporos causam 1d4 por turno + Confusão (−2 em INT e SAB). CON DIF 4 para resistir. A área persiste 3 turnos.' },
      { nome:'Domínio Micótico', desc:'Controla fungos no raio 20u como extensões. Pode animar até 4 fungos menores (HP 8, 1d4 dano) que agem como servos.' },
      { nome:'Regeneração Parasitária', desc:'Recupera 5 HP por turno se houver matéria orgânica (criaturas vivas ou mortas) no raio 4u.' }
    ],
    drops:[{item:'Núcleo Fúngico',chance:'35%',rar:4,desc:'Centro de consciência do Mycelord. Ingrediente para poções de domínio mental ou comunicação telepática por 1 hora.'},{item:'Esporo Régio',chance:'55%',rar:3,desc:'2 usos. Jogado como granada: área 3×3u de nuvem de esporos (efeito idêntico à habilidade do Mycelord).'}] },

  { nome:'Skylorn', apelido:'Serpe de Cristal Alado', hab:['Vallerohk','Ryu Tal'], diff:'4-6', tam:'20m', hab_str:'Vallerohk, Ryu Tal',
    stats:{ hp:'130–250', atq:'2d10 (rasante) / 2d6 (rugido)', def:'6–8', mov:'5u (solo) / 18u (voo)', sen:'Audição supersônica, visão em todas frequências' },
    desc:'Serpente cristalina alada que voa a velocidades letais. As escamas refletem e reorientam magias. Seu rugido em frequência específica pode desnortear todos ao redor.',
    habilidades:[
      { nome:'Rasante Cortante', desc:'Em voo: passa por linha de 20u, todos no caminho: 2d8 dano de corte. Pode fazer mais de uma vez por turno (custo de ação bônus).' },
      { nome:'Escamas Reflexivas', desc:'30% de chance de refletir magias de volta ao lançador. Se refletida, o lançador recebe o efeito completo.' },
      { nome:'Rugido Supersônico', desc:'[2x/combate] Raio 15u: 2d6 dano sônico + Atordoados por 1 turno. Surdez temporária por 3 turnos (−2 Percepção auditiva).' }
    ],
    drops:[{item:'Escama de Skylorn',chance:'80%',rar:4,desc:'Reflexiva e translúcida. Usada em escudos mágicos (+1 chance de refletir magia) ou em instrumentos musicais de alta qualidade.'},{item:'Cristal Harmônico',chance:'25%',rar:5,desc:'Vibra em frequências específicas. Foco mágico para magias sônicas ou barreiras de frequência. Valor 3000P.'}] },

  // ── Dificuldade 5+ ──
  { nome:'Korvhal', apelido:'Colosso das Nuvens', hab:['Impersky'], diff:'5', tam:'18m', hab_str:'Impersky, planaltos e tempestades',
    stats:{ hp:'200–280', atq:'3d10 (punho) / 2d8 (raio)', def:7, mov:'7u (solo)', sen:'Sente cargas elétricas em 200m' },
    desc:'Gigante de pedra viva eletricamente carregado. Gera tempestade localizada ao redor de si. Cada passo é um terremoto menor.',
    habilidades:[
      { nome:'Passo Sísmico', desc:'Cada passo causa 1d6 dano a todos que estejam no chão no raio 4u. Terreno fratura permanentemente na área.' },
      { nome:'Punho de Trovão', desc:'Golpe canaliza eletricidade: 3d8 + 1d8 elétrico. Alvo e todos adjacentes a ele recebem o dano elétrico (cadeia).' },
      { nome:'Chamado da Tempestade', desc:'[1x/combate] Invoca tempestade local: raio 20u, relâmpagos aleatórios a cada turno (2d6 dano, alvos aleatórios). Dura 5 turnos.' }
    ],
    drops:[{item:'Coração de Korvhal',chance:'15%',rar:5,desc:'Núcleo elétrico vivo. Gera energia por 30 dias. Usado em armas que descarregam eletricidade ou como fonte de poder mágico.'},{item:'Rocha Trovejante',chance:'60%',rar:3,desc:'Pedra impregnada de eletricidade. 5 usos como granada elétrica (2d4 dano, raio 2u) ou como componente de arma elétrica.'}] },

  { nome:'Ha Ziz', apelido:'A Grande Abutre Tempestuosa', hab:['Alsahra','Vallerohk'], diff:'6', tam:'8×8u', hab_str:'Alsahra, Vallerohk, altos céus',
    stats:{ hp:'220–300', atq:'3d8 (garra) / 2d10 (ventania)', def:6, mov:'4u (solo) / 20u (voo)', sen:'Visão a 10km, detecta morte a 50km' },
    desc:'Ave colossal que alimenta de batalhas. Sua presença cria ventos que arremedam projéteis. Circunda batalhas esperando sobreviventes enfraquecidos.',
    habilidades:[
      { nome:'Ventania', desc:'Bate as asas: vento de tempestade em área 12×12u. Projéteis em voo são desviados. Criaturas ≤ 1m são arremessadas 4u.' },
      { nome:'Ensurdecer', desc:'Grasnido: 1d6 sônico + Surdez permanente (até curado) para criaturas que falhem em CON DIF 5 num raio 10u.' },
      { nome:'Rapina', desc:'Pega uma criatura com as garras (tamanho ≤ médio) e voa. No próximo turno: joga o alvo de altitude (2d10 queda). Quase impossível se libertar durante o voo.' }
    ],
    drops:[{item:'Penas de Ziz',chance:'40%',rar:4,desc:'2m de comprimento. Deflectem vento e projéteis. Usadas em capas mágicas de desvio (+2 contra projéteis) ou em instrumentos de navegação.'},{item:'Osso Oco de Ziz',chance:'20%',rar:4,desc:'Levíssimo e resistente. Usado em cajados, arcos compostos ou instrumentos de vento mágicos. Valor 800P.'}] },

  { nome:'Dragão Maior', apelido:'Drakon Ancestral', hab:['Ryu Tal','Vallerohk'], diff:'5', tam:'7×7u', hab_str:'Ryu Tal, Vallerohk',
    stats:{ hp:'300–400', atq:'3d10 (garra/mordida) / 3d8 (bafo)', def:8, mov:'8u (solo) / 20u (voo)', sen:'Visão mágica, olfato dracônico a 5km' },
    desc:'Dragão adulto pleno. Inteligente, calculista e com território fixo de centenas de quilômetros. Considera humanoides como peões ou ameaças, raramente como iguais.',
    habilidades:[
      { nome:'Bafo Devastador', desc:'Cone 15×8u: 4d8 dano elemental. DEX DIF 5 para metade. Cooldown 1d2 turnos. Pode mudar o tipo de bafo em ataques consecutivos.' },
      { nome:'Declarar Território', desc:'Rugido: criaturas de DIF <7 no raio 30u testam VON DIF 5 ou fogem em pânico por 1d4 turnos. Inanima criaturas com SAN < 5.' },
      { nome:'Escamas Infusionadas Avançadas', desc:'RD 8 natural. Imune ao elemento do bafo. 50% resistência a todos outros elementos. Armas sem +2 mágico não penetram.' }
    ],
    drops:[{item:'Escamas de Dragão Maior',chance:'60%',rar:5,desc:'Lendárias. Conjunto completo: RD 10, resistência elemental total ao elemento do dragão. Valor 10000P o conjunto.'},{item:'Couro de Dragão Maior',chance:'40%',rar:5,desc:'Material de forja lendária. Armadura mista: RD 8, penalidade zero, peso 10kg. Valor 8000P.'},{item:'Coração Puro de Dragão',chance:'5%',rar:6,desc:'Pulsa com poder dracônico puro. Componente para armas lendárias (+3 mágico mínimo) ou rituais de ascensão.'},{item:'Metal-cristal Rúnico',chance:'15%',rar:5,desc:'Encontrado nas presas. Material de forja único que conduz magia. Usado em armas com bônus +2 ou superiores.'}] },

  { nome:'Ylthera', apelido:'Mãe das Bestas de Gelo', hab:['Frost Forest','Lilyfrost'], diff:'7', tam:'60m', hab_str:'Frost Forest, Lilyfrost',
    stats:{ hp:'500–700', atq:'4d12 (pisão) / 3d10 (sopro glacial)', def:9, mov:'6u', sen:'Vê através de nevascas, sente calor vital a 500m' },
    desc:'Ser primordial do gelo. Progenitora de criaturas do frio. Sua presença faz a temperatura cair 10°C por rodada até congelar o ambiente. Combatê-la é uma missão de facção inteira.',
    habilidades:[
      { nome:'Invocação da Prole Glacial', desc:'[2x/combate] Invoca 1d4 Rilhorns e 1d2 Nivraeths que agem imediatamente e perseveram pela duração do combate.' },
      { nome:'Inverno Absoluto', desc:'Área 30u ao redor: −3 em todos atributos físicos por frio. Superfícies congelam (terreno difícil). Criaturas expostas: 1d4 dano de frio por turno.' },
      { nome:'Manto da Matriarca', desc:'Regenera 20 HP por turno enquanto houver neve/gelo ao redor. Pode se tornar parte da paisagem (invisível imóvel). Imune a fogo se não abaixo de 30% HP.' }
    ],
    drops:[{item:'Ovo de Ylthera',chance:'2%',rar:6,desc:'Extremamente raro. Pode ser chocado para obter uma criatura de gelo domesticada. Ou vendido por 50000P.'},{item:'Medula de Gelo Primordial',chance:'8%',rar:6,desc:'Gelo que nunca derrete, mesmo em vulcões. Componente lendário para armas glaciais ou rituais de inverno eterno.'}] },

  { nome:'Zer\'Khalum', apelido:'Titã das Dunas Eternas', hab:['Alsahra'], diff:'8', tam:'120m', hab_str:'Alsahra (núcleo do grande deserto)',
    stats:{ hp:'800–1200', atq:'5d12 (sepultamento) / 4d10 (tempestade)', def:10, mov:'— (imóvel / move o deserto)' , sen:'O Zer\'Khalum É o deserto. Sente tudo nele.'},
    desc:'O Zer\'Khalum não é uma criatura que vive no deserto — é o deserto que ganhou consciência. Não pode ser morto convencionalmente. Pode ser "adormecido" por rituais antigos.',
    habilidades:[
      { nome:'Sepultamento Continental', desc:'Escolhe área 30×30u: areia sobe e enterra tudo. Escape requer DEX DIF 6. Criaturas enterradas: 3d8 sufocação/turno.' },
      { nome:'Tempestade de Vidro', desc:'Área 50u ao redor: tempestade de areia vitrificada. 2d8 por turno a todos. Visibilidade zero. Rota mágicas bloqueadas.' },
      { nome:'Corpo de Areia Ancestral', desc:'Imune a físico convencional. Apenas magia de água, gelo ou rituais específicos causam dano. Pode ser dispersado temporariamente mas retorna.' }
    ],
    drops:[{item:'Coração de Areia Viva',chance:'3%',rar:6,desc:'Núcleo de consciência do Zer\'Khalum. Extremamente perigoso de portar. Drena SAN ao longo do tempo. Poder imenso para rituais.'},{item:'Colosso de Quartzo',chance:'10%',rar:5,desc:'Formação de quartzo puro gerada pelo corpo. Conduz magia perfeitamente. Valor 20000P ou componente de magia suprema.'}] },

  { nome:'Abyssarion', apelido:'O Que Afunda Mundos', hab:['Mar de Fuzuryu'], diff:'9', tam:'180–300m', hab_str:'Mar de Fuzuryu, fossas abissais',
    stats:{ hp:'2000+', atq:'6d12 (mandíbula) / 4d12 (colapso oceânico)', def:12, mov:'20u (oceano profundo)', sen:'Sente vibrações oceânicas globalmente' },
    desc:'Entidade abissal. Não uma criatura — uma força da natureza. Seu simples despertar altera correntes oceânicas. Lendas dizem que afundou cidades inteiras em eras passadas.',
    habilidades:[
      { nome:'Colapso Oceânico', desc:'Provoca maremoto: ondas de 30m que atingem 200u de costa. Dano estrutural total. Criaturas na área: 5d10 + arremessadas.' },
      { nome:'Mandíbulas de Pressão Infinita', desc:'Morde: pressão equivalente a abismo oceânico. Qualquer material não mágico é destruído. Dano: 6d12, ignora toda RD.' },
      { nome:'Canto Abissal', desc:'Frequência que ressoa no fundo do mar: todas criaturas inteligentes no raio 1km testam VON DIF 7 ou ficam Loucas (DM define) por 1d4 horas.' }
    ],
    drops:[{item:'Dente de Abyssarion',chance:'5%',rar:6,desc:'1m de comprimento. Símbolo de loucura dos mares. Arma que causa dano psíquico além do físico. Único.'},{item:'Núcleo de Pressão Viva',chance:'1%',rar:6,desc:'Concentra pressão abissal. Pode ser usado para criar uma arma de destruição em massa ou como componente de ritual de era.'}] },

  { nome:'Drakhaelor', apelido:'Herdeiro do Primeiro Fogo', hab:['Ryu Tal','Vallerohk'], diff:'9', tam:'90m', hab_str:'Ryu Tal, Vallerohk',
    stats:{ hp:'1500+', atq:'5d12 (garra/bafo primordial)', def:11, mov:'10u (solo) / 25u (voo)', sen:'Visão mágica total, sente poder dracônico global' },
    desc:'O Dragão Maior dos Dragões. Descendente direto do Primeiro Dragão. Sua magia não é aprendida — é instintiva e primordial. Confrontá-lo é um evento de era.',
    habilidades:[
      { nome:'Chama Ancestral', desc:'Não é fogo — é o Primeiro Fogo. Ignora todas as resistências e imunidades. Cone 25×15u: 5d10 dano primordial.' },
      { nome:'Rugido do Fim', desc:'Raio ilimitado: todos que ouçam testam VON DIF 8 ou param de agir por 1d6 turnos (apatia existencial).' },
      { nome:'Domínio Dracônico', desc:'Todos os dragões num raio de 100km reconhecem a presença e param de agir por 1 turno de estupor. Dragões menores se submetem.' }
    ],
    drops:[{item:'Escama Primordial',chance:'15%',rar:6,desc:'Cada escama contém uma faísca do Primeiro Fogo. Imune a toda magia comum. Componente lendário definitivo. Valor inestimável.'},{item:'Fragmento do Primeiro Fogo',chance:'3%',rar:6,desc:'Chama que não apaga. Pode dar vida a construtos, criar armas definitivas ou iniciar ou encerrar eras mágicas. Incalculável.'}] },

  { nome:'Kor\'Velis', apelido:'O Caminhante de Mundos', hab:['Frost Forest','Severnoye'], diff:'8', tam:'Variável (3–30m)', hab_str:'Frost Forest, Severnoye, aparições temporais',
    stats:{ hp:'600–900', atq:'4d10 (toque extradimensional) / 3d10 (apagamento)', def:9, mov:'Qualquer (ignora obstáculos físicos)', sen:'Percepção total de todos os planos simultaneamente' },
    desc:'Ser que existe em múltiplos planos simultaneamente. Sua forma física é apenas uma projeção. Atacar sua "forma" pode não causara dano real. Requer magia de travessia planar para afetar plenamente.',
    habilidades:[
      { nome:'Passo Intermundano', desc:'Teleporta instantaneamente a qualquer ponto visível. Pode sair do plano material por 1 turno e ser inalcançável.' },
      { nome:'Dilatação Temporal', desc:'Numa área 8×8u, o tempo passa diferente: criaturas nessa área envelhecem 1d4 anos por turno de exposição.' },
      { nome:'Apagamento Existencial', desc:'[1x/combate] Toca uma criatura: CON DIF 7 ou é apagada da existência por 1d6 horas (retorna sem memória do período).' }
    ],
    drops:[{item:'Fragmento de Realidade',chance:'1%',rar:6,desc:'Pedaço de plano material condensado. Permite criar um portal estável por 1 uso ou usada em rituais de criação de espaço extradimensional.'},{item:'Essência Deslocada',chance:'5%',rar:5,desc:'Energia de plano alternativo. Poção de deslocamento: por 1 hora, 20% de chance de qualquer ataque errar por deslocamento.'}] },

  { nome:'Mycoryss', apelido:'o Eterno (Deus-Fungo)', hab:['Alloe'], diff:'10', tam:'Colônia continental (núcleo 40m)', hab_str:'Alloe (zonas proibidas)',
    stats:{ hp:'Ilimitado (núcleo: 3000)', atq:'— (o ambiente É o Mycoryss)', def:11, mov:'— (se move lentamente por todo Alloe)', sen:'Consciência de todo fungo em Alloe' },
    desc:'Não é uma criatura — é um ecossistema com vontade. A zona proibida de Alloe É o Mycoryss. Confrontá-lo diretamente é inconcebível; apenas o núcleo pode ser abordado após semanas de purga de micelio.',
    habilidades:[
      { nome:'Consciência Micelar', desc:'Conhece a posição de toda criatura em Alloe através da rede de fungos. Nunca é surpreendido dentro de seu domínio.' },
      { nome:'Reescrita Biológica', desc:'Criaturas que passem 24h em seu domínio: CON DIF 5 ou iniciam transformação fúngica (perda de controle em 1d4 dias).' },
      { nome:'Assimilação de Ecossistemas', desc:'Absorve criaturas mortas em seu micelio: as ressuscita como servos fúngicos com HP original e todas as habilidades, mas sem vontade própria.' }
    ],
    drops:[{item:'Esporo da Eternidade',chance:'0,5%',rar:6,desc:'Pode criar vida, modificar ecossistemas ou infectar mundos. Extremamente perigoso de portar. Drena SAN apenas de tocá-lo.'},{item:'Núcleo Micelar Antigo',chance:'2%',rar:5,desc:'Pedaço do núcleo central. Consciência residual. Pode ser usado para entrar em contato com o Mycoryss ou como foco de magia de vida absurda.'}] }
];

// ── Dados: Metaflora ───────────────────────────────────────
const MUNDO_FLORA = [
  // Raridade 0
  { nome:'Guavree', apelido:null, hab:'Mitte der Welt, Severnoye, Ryu Tal, Hae', rar:0, tam:'Árvore 22–28m', prop:'Nenhuma propriedade especial conhecida.', drops:['Guavree'] },
  { nome:'Sunral', apelido:'Coral', hab:'Mar de Severnoye, Baía de Kentrikòs', rar:0, tam:'50cm × ∞', prop:'Colares e pó brilhante.', drops:['Coral brilhante'] },
  // Raridade 1
  { nome:'Minxi', apelido:null, hab:'Impersky As', rar:1, tam:'Árvore de 2m', prop:'Suco saboroso.', drops:['Minxi (1–3)'] },
  { nome:'Mansal', apelido:null, hab:'Cavernas de Severnoye', rar:1, tam:'Tamanho da caverna', prop:'Madeira grande, pesada e resistente.', drops:['Madeira de Mansal'] },
  { nome:'Aeralith', apelido:'Grama do Vento Alto', hab:'Impersky', rar:1, tam:'Touceira 0,7m', prop:'Lâminas reduzem peso de objetos quando secas corretamente.', drops:['Fibra aerada', 'Semente leve'] },
  { nome:'Sangrass', apelido:'Grama Sangrenta', hab:'Hae', rar:1, tam:'Tapete rasteiro', prop:'Lâminas microscópicas causam sangramento contínuo. Atrai predadores pelo cheiro.', drops:['Lâmina sangrass', 'Raiz fibrada'] },
  { nome:'Folha de Névia', apelido:null, hab:'Lilyfrost, Frost Forest', rar:1, tam:'Planta baixa', prop:'Reduz inflamações e retarda sangramentos. Essencial para kits de sobrevivência.', drops:['Folha de névia', 'Talinho gelado'] },
  { nome:'Pétala-de-Névoa', apelido:'Nebelia', hab:'Kentrikòs, Severnoye', rar:1, tam:'Flor 0,4m', prop:'Névoa perfumada acalma criaturas. Em excesso causa sonolência profunda.', drops:['Pétala suave', 'Néctar enevoado'] },
  { nome:'Campainha-de-Vento', apelido:'Aeris bellis', hab:'Impersky', rar:1, tam:'Flor pendente 0,5m', prop:'Emite sons suaves com o vento. Vibrações erradas causam vertigem intensa.', drops:['Cálice aéreo', 'Fio sonoro'] },
  { nome:'Verdena', apelido:'Folha Verde-Clara', hab:'Kentrikòs, Severnoye', rar:1, tam:'Arbusto 1–1,5m', prop:'Folhas reduzem febre e estabilizam mana leve. Comum em infusões.', drops:['Folha de verdena', 'Galho tenro'] },
  { nome:'Rubelã', apelido:'Fruta Rubra Suave', hab:'Hae, Severnoye', rar:1, tam:'Arbusto 1m', prop:'Restaura energia física e melhora circulação. Excesso causa taquicardia.', drops:['Rubelã', 'Semente rubra'] },
  { nome:'Férula Viva', apelido:'Haste Curativa', hab:'Hae', rar:1, tam:'Planta 2–3m', prop:'Seiva acelera cicatrização superficial. Muito usada por curandeiros de campo.', drops:['Seiva férula', 'Fibra medicinal'] },
  // Raridade 2
  { nome:'Rosert', apelido:null, hab:'Alsahra', rar:2, tam:'15cm', prop:'Perfume de alto valor.', drops:['Flor de Rosert (65%)'] },
  { nome:'Vinuse', apelido:null, hab:'Hae, Alloe, Vallerohk, Ryu Tal', rar:2, tam:'Vinha de 3–7m', prop:'Pode ser bom antídoto ou veneno terrível.', drops:['Vinha virtuosa (50%)', 'Vinha cruel (50%)'] },
  { nome:'Sahramel', apelido:'Cacto de Âmbar', hab:'Alsahra', rar:2, tam:'Cacto 2–4m', prop:'Armazena água encantada. Seiva restaura vigor mas causa sede extrema depois.', drops:['Seiva de sahramel', 'Espinho âmbar'] },
  { nome:'Mirrath', apelido:'Cacto do Engano', hab:'Alsahra', rar:2, tam:'Cacto 1,5–3m', prop:'Exala vapores alucinógenos que criam miragens de água e abrigo.', drops:['Espinho miragem', 'Bolsa de vapor'] },
  { nome:'Sorriluz', apelido:'Dente-de-lume', hab:'Lilyfrost, Frost Forest', rar:2, tam:'Flor 0,3m', prop:'Brilha fracamente no escuro. Arrancada de forma brusca libera choque térmico.', drops:['Bulbo luminoso', 'Filamento frio'] },
  { nome:'Cogumelo Sépala', apelido:'Mycosépalus', hab:'Hae, Severnoye', rar:2, tam:'Fungo 0,5–1m', prop:'Esporos causam riso incontrolável seguido de colapso muscular.', drops:['Esporo sépala', 'Talo flexível'] },
  { nome:'Flor-de-Cera', apelido:'Ceraflora', hab:'Alsahra, Kentrikòs', rar:2, tam:'Flor 0,6m', prop:'Pétalas resistentes ao calor. Derretem com magia instável causando queimaduras.', drops:['Cera floral', 'Estame seco'] },
  { nome:'Solfruta', apelido:'Baga do Meio-Dia', hab:'Alsahra, Severnoye', rar:2, tam:'Planta rasteira', prop:'Armazena calor vital. Tônicos contra exaustão e choque térmico.', drops:['Solfruta', 'Casca solar'] },
  { nome:'Calmélia', apelido:'Flor-Folha Serena', hab:'Lilyfrost, Kentrikòs', rar:2, tam:'Arbusto 0,8m', prop:'Folhas acalmam mente e reduzem instabilidade mágica. Base de poções mentais.', drops:['Folha calmélia', 'Pétala serena'] },
  { nome:'Melsombra', apelido:'Fruto Escuro Doce', hab:'Hae, Vallerohk', rar:2, tam:'Árvore pequena 4m', prop:'Recupera mana lentamente. Usada como adoçante alquímico.', drops:['Melsombra', 'Seiva doce'] },
  { nome:'Flor de Ketrin', apelido:'Lótus Cinza', hab:'Kentrikòs', rar:2, tam:'Flor aquática 0,5m', prop:'Purifica líquidos e neutraliza toxinas leves.', drops:['Pétala de ketrin', 'Estame filtrante'] },
  // Raridade 3
  { nome:'Linco', apelido:null, hab:'Kentrikòs, Lilyfrost', rar:3, tam:'Arbusto 1×1m', prop:'A fruta recupera mana e a flor tem aroma doce.', drops:['Linco', 'Linco petal'] },
  { nome:'Verdanox', apelido:'Árvore Pulso-Verde', hab:'Hae', rar:3, tam:'Árvore 8–12m', prop:'Tronco pulsa como coração. Acelera regeneração natural quando próxima.', drops:['Seiva verdanox', 'Casca pulsante'] },
  { nome:'Rasgaosso', apelido:'Trepa-Fíbula', hab:'Impersky, Vallerohk', rar:3, tam:'Vinha 4–10m', prop:'Reage ao calor corporal, comprimindo até fraturar ossos.', drops:['Fibra constritora', 'Espinho ósseo'] },
  { nome:'Raiz de Morn', apelido:'Mornroot', hab:'Impersky, Severnoye', rar:3, tam:'Raiz até 1,2m', prop:'Aumenta resistência física e tolerância à dor. Difícil de extrair.', drops:['Raiz de morn', 'Fibra densa'] },
  { nome:'Áurea-Baga', apelido:'Fruta Clara', hab:'Alloe', rar:3, tam:'Arbusto 0,6m', prop:'Amplifica efeitos alquímicos sem alterar propriedades originais.', drops:['Áurea-baga', 'Polpa catalisadora'] },
  { nome:'Belamor', apelido:'Coração-do-Campo', hab:'Severnoye', rar:3, tam:'Arbusto 1m', prop:'Vibra suavemente quando alguém se aproxima. Pode induzir apego emocional temporário.', drops:['Fruto belamor', 'Semente pulsante'] },
  { nome:'Luminéu', apelido:'Cogumelo-Fada', hab:'Frost Forest, Alloe', rar:3, tam:'Fungo 0,4m', prop:'Emite luz colorida agradável. Esporos causam desorientação temporal leve.', drops:['Pó luminéu', 'Talo iridescente'] },
  { nome:'Velkroot', apelido:'Raiz Errante', hab:'Severnoye, Hae', rar:3, tam:'Raiz até 2m', prop:'Move-se lentamente sob o solo e perfura criaturas adormecidas.', drops:['Tendão vegetal', 'Olho radicular'] },
  // Raridade 4
  { nome:'Crysolia', apelido:'Lírio de Gelo Vivo', hab:'Lilyfrost, Frost Forest', rar:4, tam:'Flor 0,6m', prop:'Congela lentamente tudo ao redor. Usada para poções de preservação e estase.', drops:['Pétala crysolia', 'Núcleo glacial'] },
  { nome:'Lacrimae Gelum', apelido:'Salgueiro da Geada', hab:'Lilyfrost, Frost Forest', rar:4, tam:'Árvore 6–9m', prop:'Libera cristais de gelo cortantes ao menor movimento. "Choro" causa hipotermia rápida.', drops:['Lágrima gélida', 'Galho congelado'] },
  { nome:'Sussurracarne', apelido:'Flor Murmurante', hab:'Kentrikòs, Alloe', rar:4, tam:'Flor 0,9m', prop:'Emite sussurros psíquicos que atraem criaturas inteligentes. Causa paranoia e perda de foco.', drops:['Cálice sussurrante', 'Néctar delirante'] },
  { nome:'Fungo Olho-Pálido', apelido:'Oculomyces', hab:'Alloe, Vallerohk', rar:4, tam:'Colônia 1–2m', prop:'"Observa" movimentos e libera toxinas se encarado diretamente por muito tempo.', drops:['Globo ocular micótico', 'Esporo vigilante'] },
  { nome:'Rosal da Garganta', apelido:'Rosathrax', hab:'Vallerohk, Ryu Tal', rar:4, tam:'Arbusto 1,5m', prop:'Espinhos liberam toxina que paralisa fala e respiração gradualmente.', drops:['Espinho rosathrax', 'Seiva sufocante'] },
  // Raridade 5
  { nome:'Lilyun', apelido:null, hab:'Alloe', rar:5, tam:'5cm', prop:'Base mágica e remédio de alto valor.', drops:['Flor de Lilyun (70%)'] },
  { nome:'Vyostal', apelido:null, hab:'Alloe', rar:5, tam:'5cm', prop:'Pó é base para rituais de alto poder.', drops:['Flor de Vyostal'] },
  { nome:'Umbralloe', apelido:'Flor do Véu Profundo', hab:'Alloe', rar:5, tam:'Flor única 0,5m', prop:'Interage com emoções e memórias. Extremamente instável fora de Alloe.', drops:['Essência umbral', 'Cálice do véu'] },
  { nome:'Drakorya', apelido:'Flor do Sangue Antigo', hab:'Ryu Tal, Vallerohk', rar:5, tam:'Arbusto 1,2m', prop:'Cresce onde dragões morreram. Amplifica magia dracônica e efeitos destrutivos.', drops:['Pétala dracônica', 'Raiz escarlate'] },
  { nome:'Noctyra', apelido:'Flor da Asfixia', hab:'Alloe', rar:5, tam:'Flor 0,7m', prop:'Absorve oxigênio ao florescer. Áreas fechadas tornam-se letais em minutos.', drops:['Cálice vazio', 'Pó de estase'] },
  { nome:'Drakenbloom', apelido:'Coração de Cinzas', hab:'Ryu Tal, Vallerohk', rar:5, tam:'Planta 1,8m', prop:'Reage a magia violenta explodindo em chamas instáveis. Cresce em campos de batalha dracônicos.', drops:['Núcleo carbonizado', 'Cinza viva'] },
  { nome:'Beijaflor Mortis', apelido:'Flor-Boca', hab:'Hae', rar:5, tam:'Flor carnívora 1,2m', prop:'Imita perfumes doces. Fecha-se violentamente ao detectar calor corporal.', drops:['Néctar carnívoro', 'Dente floral'] }
];

/* ── Funções de Mundo ──────────────────────────────────── */
