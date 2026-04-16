const EQUIPAMENTOS_DB = {
  armas: [
    // === ESPADAS & LÂMINAS ===
    { id:'arma_espada_vitoriana',  nome:'Espada Vitoriana',      tipo:'arma', categoria:'media',  dado:'1d10',      tipoDano:'Corte',           empunhadura:'1M',     alcance:'Adjacente', peso:1.4, preco:25,  requisitos:{FOR:1}, critico:'Desarmar ou empurrar 1u',       acao:'Golpe (M)',   aspectos:'Balanceada' },
    { id:'arma_espada_alexandrina',nome:'Espada Alexandrina',    tipo:'arma', categoria:'pesada', dado:'1d12',      tipoDano:'Corte',           empunhadura:'1M/2M',  alcance:'Adjacente', peso:1.8, preco:40,  requisitos:{FOR:2}, critico:'Derrubar ou Fragilizar',        acao:'Golpe (M+m)', penalidade:-2, aspectos:'Corte profundo' },
    { id:'arma_katana',            nome:'Katana',                tipo:'arma', categoria:'leve',   dado:'1d8/2d4+2', tipoDano:'Corte',           empunhadura:'1M/2M',  alcance:'Adjacente', peso:1.2, preco:22,  requisitos:{DES:1}, critico:'Sangramento',                   acao:'Golpe (M)',   aspectos:'Saque rápido', bonus:'+2 precisão ou +1 ataque adicional (−2)' },
    { id:'arma_odachi',            nome:'Odachi',                tipo:'arma', categoria:'pesada', dado:'2d8',       tipoDano:'Corte',           empunhadura:'2M',     alcance:'2u',        peso:3.0, preco:60,  requisitos:{FOR:3}, critico:'Derrubar + Fragilizar',         acao:'Golpe (M+m)', penalidade:-3, aspectos:'Varredura' },
    { id:'arma_cimitarra',         nome:'Cimitarra',             tipo:'arma', categoria:'leve',   dado:'1d8',       tipoDano:'Corte',           empunhadura:'1M',     alcance:'1u',        peso:1.0, preco:18,  requisitos:{DES:1}, critico:'Desarmar',                      acao:'Golpe (M)',   bonus:'+1 ataque adicional (−2)', aspectos:'Curva, Ágil' },
    { id:'arma_zweihander',        nome:'Zweihänder',            tipo:'arma', categoria:'pesada', dado:'2d6',       tipoDano:'Corte',           empunhadura:'2M',     alcance:'2u',        peso:3.0, preco:70,  requisitos:{FOR:3}, critico:'Empurrar 2u + Fragilizar',      acao:'Golpe (M+m)', penalidade:-3, aspectos:'Varredura pesada' },
    // === HASTES & ALCANCE ===
    { id:'arma_lanca',             nome:'Lança',                 tipo:'arma', categoria:'media',  dado:'1d8/2d4+2', tipoDano:'Perfuração',       empunhadura:'1M/2M',  alcance:'2u',        peso:1.6, preco:16,  requisitos:{FOR:1}, critico:'Empurrar 1u',                   acao:'Golpe (M)',   aspectos:'Pode arremessar' },
    { id:'arma_tridente',          nome:'Tridente',              tipo:'arma', categoria:'media',  dado:'1d10/2d6',  tipoDano:'Perfuração',       empunhadura:'1M/2M',  alcance:'2u',        peso:2.0, preco:28,  requisitos:{FOR:1}, critico:'Imobilizar',                    acao:'Golpe (M)',   aspectos:'Arremessável' },
    { id:'arma_alabarda',          nome:'Alabarda',              tipo:'arma', categoria:'pesada', dado:'2d6',       tipoDano:'Corte/Perfuração', empunhadura:'2M',     alcance:'2u',        peso:2.5, preco:35,  requisitos:{FOR:2}, critico:'Derrubar ou empurrar 2u',       acao:'Golpe (M+m)', penalidade:-2, aspectos:'Perfurar + Cortar' },
    { id:'arma_naginata',          nome:'Naginata',              tipo:'arma', categoria:'media',  dado:'1d10',      tipoDano:'Corte',           empunhadura:'2M',     alcance:'2u',        peso:2.0, preco:30,  requisitos:{DES:1}, critico:'Desarmar',                      acao:'Golpe (M)',   bonus:'+1 ataque', aspectos:'Defesa em alcance' },
    { id:'arma_nagamaki',          nome:'Nagamaki',              tipo:'arma', categoria:'media',  dado:'1d10',      tipoDano:'Corte',           empunhadura:'2M',     alcance:'2u',        peso:2.0, preco:34,  requisitos:{FOR:1}, critico:'Derrubar',                      acao:'Golpe (M)',   aspectos:'Varredura híbrida' },
    { id:'arma_bisento',           nome:'Bisento',               tipo:'arma', categoria:'pesada', dado:'1d12',      tipoDano:'Corte',           empunhadura:'2M',     alcance:'2u',        peso:2.6, preco:65,  requisitos:{FOR:3}, critico:'Derrubar em área',              acao:'Golpe (M+m)', penalidade:-2, aspectos:'Lâmina larga, Varredura' },
    // === MACHADOS & IMPACTO ===
    { id:'arma_machado_mao',       nome:'Machado de Mão',        tipo:'arma', categoria:'leve',   dado:'1d6',       tipoDano:'Corte',           empunhadura:'D',      alcance:'Adjacente', peso:0.8, preco:10,  requisitos:{FOR:0}, critico:'Sangramento',                   acao:'Golpe (m)',   bonus:'Pode atacar após Mv', aspectos:'Arremessável' },
    { id:'arma_machado_guerra',    nome:'Machado de Guerra',     tipo:'arma', categoria:'pesada', dado:'2d8',       tipoDano:'Corte',           empunhadura:'2M',     alcance:'Adjacente', peso:2.2, preco:45,  requisitos:{FOR:3}, critico:'Sangramento',                   acao:'Golpe (M+m)', penalidade:-2, aspectos:'Corte brutal' },
    { id:'arma_martelo_mao',       nome:'Martelo de Mão',        tipo:'arma', categoria:'leve',   dado:'1d6',       tipoDano:'Impacto',         empunhadura:'1M',     alcance:'Adjacente', peso:0.9, preco:12,  requisitos:{FOR:0}, critico:'Fragilizar',                    acao:'Golpe (m)',   aspectos:'Ignora armadura leve' },
    { id:'arma_martelo_guerra',    nome:'Martelo de Guerra',     tipo:'arma', categoria:'pesada', dado:'1d12',      tipoDano:'Impacto',         empunhadura:'2M',     alcance:'Adjacente', peso:2.5, preco:48,  requisitos:{FOR:3}, critico:'Fragilizar',                    acao:'Golpe (M+m)', penalidade:-2, aspectos:'Anti-armadura' },
    // === ARMAS LEVES & EXÓTICAS ===
    { id:'arma_adaga',             nome:'Adaga',                 tipo:'arma', categoria:'leve',   dado:'1d4',       tipoDano:'Perfuração',       empunhadura:'1M/D',   alcance:'Adjacente', peso:0.4, preco:6,   requisitos:{DES:0}, critico:'Perfuração vital',              acao:'Golpe (m)',   bonus:'+1 ataque adicional (−2)', aspectos:'Ocultável' },
    { id:'arma_kukri',             nome:'Kukri',                 tipo:'arma', categoria:'leve',   dado:'1d6',       tipoDano:'Corte',           empunhadura:'1M/D',   alcance:'Adjacente', peso:0.6, preco:10,  requisitos:{DES:0}, critico:'Sangramento',                   acao:'Golpe (m)',   aspectos:'Corte interno' },
    { id:'arma_cinquedea',         nome:'Cinquedea',             tipo:'arma', categoria:'leve',   dado:'1d8',       tipoDano:'Corte/Perfuração', empunhadura:'1M',     alcance:'Adjacente', peso:0.7, preco:14,  requisitos:{DES:1}, critico:'Vital',                         acao:'Golpe (m)',   aspectos:'Lâmina larga' },
    { id:'arma_rondel',            nome:'Rondel',                tipo:'arma', categoria:'leve',   dado:'1d6',       tipoDano:'Perfuração',       empunhadura:'1M',     alcance:'Adjacente', peso:0.5, preco:8,   requisitos:{DES:1}, critico:'Ignora resistência',            acao:'Golpe (m)',   aspectos:'Anti-armadura leve' },
    { id:'arma_kusarifundo',       nome:'Kusarifundo',           tipo:'arma', categoria:'media',  dado:'1d8/2d4+2', tipoDano:'Impacto',         empunhadura:'1M/2M',  alcance:'2u',        peso:1.4, preco:32,  requisitos:{DES:1}, critico:'Imobilizar ou Desarmar',        acao:'Golpe (M)',   bonus:'Ataque adicional (−2)', aspectos:'Ignora guarda, Flexível' },
    { id:'arma_kusarigama',        nome:'Kusarigama',            tipo:'arma', categoria:'media',  dado:'1d10/2d6',  tipoDano:'Corte/Impacto',   empunhadura:'1M/2M',  alcance:'2u',        peso:2.2, preco:45,  requisitos:{DES:2}, critico:'Puxar alvo ou Derrubar',       acao:'Golpe (M)',   bonus:'Ataque adicional', aspectos:'Controle híbrido, Ignora guarda' },
    { id:'arma_foice_gigante',     nome:'Foice Gigante',         tipo:'arma', categoria:'pesada', dado:'1d10',      tipoDano:'Corte',           empunhadura:'2M',     alcance:'2u',        peso:2.3, preco:55,  requisitos:{FOR:2}, critico:'Derrubar + Sangramento',        acao:'Golpe (M+m)', penalidade:-2, aspectos:'Puxar alvo' },
    { id:'arma_cajado',            nome:'Cajado Mágico',         tipo:'arma', categoria:'leve',   dado:'1d4',       tipoDano:'Impacto/Mágico',  empunhadura:'2M',     alcance:'Adjacente', peso:2.0, preco:150, requisitos:{MAG:2}, critico:'Disrupção',                     acao:'Golpe (M)',   aspectos:'Foco mágico' },
    { id:'arma_florete',           nome:'Florete',               tipo:'arma', categoria:'leve',   dado:'1d4',       tipoDano:'Perfuração',       empunhadura:'1M',     alcance:'Adjacente', peso:0.8, preco:110, requisitos:{DES:2}, critico:'Sangramento',                   acao:'Golpe (m)',   aspectos:'Precisão' },
    { id:'arma_arco',              nome:'Arco Curto',            tipo:'arma', categoria:'leve',   dado:'1d6',       tipoDano:'Perfuração',       empunhadura:'2M',     alcance:'8u',        peso:1.0, preco:80,  requisitos:{DES:1}, critico:'Preciso',                       acao:'Golpe (M)',   aspectos:'À distância' },
    // === DESARMADO ===
    { id:'arma_soco_ingles',       nome:'Soco Inglês',           tipo:'arma', categoria:'leve',   dado:'1d6',       tipoDano:'Laceração',        empunhadura:'D',      alcance:'Adjacente', peso:0.2, preco:10,  requisitos:{FOR:0}, critico:'Sangramento',                   acao:'Golpe (m)',   aspectos:'Pequeno, ocultável' },
    { id:'arma_manopla',           nome:'Manopla',               tipo:'arma', categoria:'pesada', dado:'1d8',       tipoDano:'Impacto',          empunhadura:'D',      alcance:'Adjacente', peso:0.8, preco:20,  requisitos:{FOR:1}, critico:'Fragilizar + Concussão',        acao:'Golpe (m)',   penalidade:-2, aspectos:'Integrada à mão' }
  ],
  armaduras: [
    { id:'arm_nenhuma',   nome:'Sem Armadura',     tipo:'armadura', rd:0,  ca:0,  rm:0, penalidade:0,  peso:0,  preco:0  },
    { id:'arm_couro',     nome:'Armadura de Couro',tipo:'armadura', rd:2,  ca:1,  rm:0, penalidade:-1, peso:8,  preco:50 },
    { id:'arm_malha',     nome:'Cota de Malha',    tipo:'armadura', rd:4,  ca:2,  rm:0, penalidade:-2, peso:16, preco:200},
    { id:'arm_placas',    nome:'Armadura de Placas',tipo:'armadura',rd:6,  ca:3,  rm:0, penalidade:-3, peso:24, preco:500},
    { id:'arm_tecido',    nome:'Robes Arcanos',    tipo:'armadura', rd:0,  ca:0,  rm:2, penalidade:0,  peso:2,  preco:80 },
    { id:'arm_couro_tach',nome:'Couro Tachonado',  tipo:'armadura', rd:3,  ca:1,  rm:1, penalidade:-1, peso:10, preco:120}
  ],
  escudos: [
    { id:'esc_madeira',  nome:'Escudo de Madeira',   tipo:'escudo', durabilidade:10, defesa:1, penalidade:-1, peso:4,  preco:30 },
    { id:'esc_ferro',    nome:'Escudo de Ferro',      tipo:'escudo', durabilidade:20, defesa:2, penalidade:-1, peso:6,  preco:100},
    { id:'esc_pavez',    nome:'Escudo Pavez',         tipo:'escudo', durabilidade:15, defesa:2, penalidade:-2, peso:8,  preco:80 },
    { id:'esc_adarga',   nome:'Adarga de Couro',      tipo:'escudo', durabilidade:8,  defesa:1, penalidade:0,  peso:2,  preco:40 },
    { id:'esc_magico',   nome:'Escudo Arcano',        tipo:'escudo', durabilidade:12, defesa:1, penalidade:0,  peso:1,  preco:200}
  ]
};

// ── Banco de Dados: Consumíveis ────────────────────────────
const CONSUMIVEIS_DB = [
  // ── Poções de Cura ──
  { id:'poc_cura_menor',   nome:'Poção de Cura Menor',   tipo:'pocao', subtipo:'cura',     rar:1, peso:0.3, preco:50,  efeito:'Restaura 1d6+1 HP. Ação para consumir.', icone:'🧪' },
  { id:'poc_cura_media',   nome:'Poção de Cura Média',   tipo:'pocao', subtipo:'cura',     rar:2, peso:0.3, preco:120, efeito:'Restaura 2d6+3 HP. Estabiliza Sangramento.', icone:'🧪' },
  { id:'poc_cura_maior',   nome:'Poção de Cura Maior',   tipo:'pocao', subtipo:'cura',     rar:3, peso:0.3, preco:300, efeito:'Restaura 4d6+6 HP. Remove Sangramento e Veneno.', icone:'🧪' },
  { id:'poc_mana_menor',   nome:'Poção de Mana Menor',   tipo:'pocao', subtipo:'mana',     rar:1, peso:0.3, preco:60,  efeito:'Restaura 1d6+1 MP. Ação para consumir.', icone:'💜' },
  { id:'poc_mana_media',   nome:'Poção de Mana Média',   tipo:'pocao', subtipo:'mana',     rar:2, peso:0.3, preco:150, efeito:'Restaura 2d6+4 MP.', icone:'💜' },
  { id:'poc_vigor_menor',  nome:'Poção de Vigor Menor',  tipo:'pocao', subtipo:'vigor',    rar:1, peso:0.3, preco:45,  efeito:'Restaura 1d4+1 SP.', icone:'💚' },
  { id:'poc_vigor_media',  nome:'Poção de Vigor Média',  tipo:'pocao', subtipo:'vigor',    rar:2, peso:0.3, preco:100, efeito:'Restaura 2d4+2 SP. Remove Fadiga.', icone:'💚' },
  { id:'poc_san_menor',    nome:'Tônico Mental Menor',   tipo:'pocao', subtipo:'sanidade', rar:2, peso:0.3, preco:80,  efeito:'Restaura 1d4+1 SAN. Remove Confusão leve.', icone:'🔵' },
  { id:'poc_san_media',    nome:'Tônico Mental Médio',   tipo:'pocao', subtipo:'sanidade', rar:3, peso:0.3, preco:200, efeito:'Restaura 2d4+3 SAN. Remove Medo e Confusão.', icone:'🔵' },
  // ── Antídotos & Purgativos ──
  { id:'antidoto_menor',   nome:'Antídoto Simples',      tipo:'pocao', subtipo:'purga',    rar:1, peso:0.2, preco:35,  efeito:'Remove venenos de DIF ≤ 2. Reduz tempo de envenenamento pela metade.', icone:'💊' },
  { id:'antidoto_maior',   nome:'Antídoto Forte',        tipo:'pocao', subtipo:'purga',    rar:2, peso:0.2, preco:90,  efeito:'Remove qualquer veneno de DIF ≤ 4.', icone:'💊' },
  { id:'purgante_magico',  nome:'Purgante Mágico',       tipo:'pocao', subtipo:'purga',    rar:3, peso:0.2, preco:200, efeito:'Remove maldições menores e efeitos mágicos negativos.', icone:'✨' },
  // ── Buff temporários ──
  { id:'elixir_forca',     nome:'Elixir de Força',       tipo:'elixir', subtipo:'buff',    rar:2, peso:0.3, preco:100, efeito:'+2 FOR por 1 hora. Efeitos cumulativos causam náusea.', icone:'⚗️' },
  { id:'elixir_agilidade', nome:'Elixir de Agilidade',   tipo:'elixir', subtipo:'buff',    rar:2, peso:0.3, preco:100, efeito:'+2 AGI e +1 DES por 1 hora.', icone:'⚗️' },
  { id:'elixir_mente',     nome:'Elixir de Clareza',     tipo:'elixir', subtipo:'buff',    rar:2, peso:0.3, preco:120, efeito:'+2 INT e SAB por 1 hora. Cancela Confusão e Ilusão.', icone:'⚗️' },
  { id:'elixir_ferro',     nome:'Elixir de Ferro',       tipo:'elixir', subtipo:'buff',    rar:3, peso:0.4, preco:250, efeito:'+2 RD e +3 HP temporários por 30 min. Penalidade: −1 AGI.', icone:'⚗️' },
  { id:'elixir_sombra',    nome:'Elixir das Sombras',    tipo:'elixir', subtipo:'buff',    rar:3, peso:0.3, preco:300, efeito:'+3 FURT e Desvantagem em Percepção de outros contra você por 1 hora.', icone:'⚗️' },
  // ── Comidas e Provisões ──
  { id:'prov_campo',       nome:'Ração de Campo',        tipo:'comida', subtipo:'base',    rar:0, peso:0.5, preco:5,   efeito:'1 porção para 1 dia. Sem bônus especial.', icone:'🍖' },
  { id:'prov_luxo',        nome:'Provisões de Luxo',     tipo:'comida', subtipo:'especial',rar:1, peso:0.8, preco:25,  efeito:'Restaura +1 SP ao descanso noturno. 3 dias.', icone:'🍖' },
  { id:'prov_guerreiro',   nome:'Ração do Guerreiro',    tipo:'comida', subtipo:'especial',rar:2, peso:0.6, preco:50,  efeito:'+1 FOR e CON temporários por 6h após consumo.', icone:'🍖' },
  // ── Itens de Utilidade ──
  { id:'tocha',            nome:'Tocha',                 tipo:'util', subtipo:'luz',       rar:0, peso:0.3, preco:2,   efeito:'Ilumina raio 5u por 1 hora.', icone:'🔦' },
  { id:'corda_10m',        nome:'Corda (10m)',           tipo:'util', subtipo:'ferragem',  rar:0, peso:1.5, preco:10,  efeito:'Suporta até 300kg. Resistência: 8 pontos de corte.', icone:'🔗' },
  { id:'ganchos',          nome:'Ganchos de Escalada',  tipo:'util', subtipo:'ferragem',  rar:1, peso:0.5, preco:30,  efeito:'+2 em testes de escalada quando anchorado.', icone:'🔗' },
  { id:'kit_medicina',     nome:'Kit de Medicina',       tipo:'util', subtipo:'medico',    rar:1, peso:1.0, preco:60,  efeito:'5 usos. Cada uso: testa Medicina para estabilizar ou curar 1d4 HP.', icone:'⚕️' },
  { id:'veneno_contato',   nome:'Veneno de Contato',     tipo:'util', subtipo:'veneno',    rar:2, peso:0.1, preco:80,  efeito:'Aplica em arma: próximo ataque causa 1d4/turno por 3 turnos (CON DIF 3).', icone:'☠️' },
  { id:'bomba_fumaca',     nome:'Bomba de Fumaça',       tipo:'util', subtipo:'combate',   rar:1, peso:0.3, preco:25,  efeito:'Área 4×4u: visibilidade zero por 2 turnos. Não tóxica.', icone:'💨' },
  { id:'bomba_fogo',       nome:'Coquetel de Fogo',      tipo:'util', subtipo:'combate',   rar:2, peso:0.4, preco:75,  efeito:'Impacto: área 3×3u, 2d4 fogo. Superfícies inflamáveis continuam ardendo por 1d4 turnos.', icone:'🔥' },
  { id:'armadilha_basica', nome:'Armadilha de Aço',      tipo:'util', subtipo:'armadilha', rar:1, peso:2.0, preco:40,  efeito:'Instalar: ação. Ativa quando pisada: 1d6 + Preso (FOR DIF 3 para soltar).', icone:'⚙️' },
  { id:'oleo_sagrado',     nome:'Óleo Sagrado',          tipo:'util', subtipo:'sagrado',   rar:2, peso:0.3, preco:100, efeito:'Aplica em arma: +1d4 dano sagrado. Efetivo contra mortos-vivos e demônios. 3 turnos.', icone:'✨' },
  { id:'cristal_mana',     nome:'Cristal de Mana Bruta', tipo:'util', subtipo:'magico',    rar:2, peso:0.1, preco:150, efeito:'Contém 5 MP armazenados. Absorver como ação bônus. Quebra após uso.', icone:'💎' }
];

// ── Banco de Dados: Materiais & Ingredientes ───────────────
const MATERIAIS_DB = [
  // Raridade 0 — Comuns
  { id:'mat_madeira',      nome:'Madeira Comum',         tipo:'material', subtipo:'vegetal',   rar:0, peso:1.0, preco:3,    desc:'Material de construção e artesanato básico.' },
  { id:'mat_couro_base',   nome:'Couro Bruto',           tipo:'material', subtipo:'animal',    rar:0, peso:0.8, preco:8,    desc:'Couro não tratado. Base para armaduras simples.' },
  { id:'mat_metal_base',   nome:'Ferro Bruto',           tipo:'material', subtipo:'mineral',   rar:0, peso:1.5, preco:10,   desc:'Minério de ferro. Forja armas e ferramentas comuns.' },
  { id:'mat_erva_base',    nome:'Ervas Medicinais',      tipo:'material', subtipo:'vegetal',   rar:0, peso:0.2, preco:5,    desc:'Pacote básico. Ingrediente para poções de cura menor.' },
  // Raridade 1 — Incomuns
  { id:'mat_seda_aranea',  nome:'Seda de Aranea',        tipo:'material', subtipo:'animal',    rar:1, peso:0.1, preco:40,   desc:'Fio resistente e leve. Usado em armaduras flexíveis ou cordas especiais.' },
  { id:'mat_resina_fria',  nome:'Resina Fria',           tipo:'material', subtipo:'vegetal',   rar:1, peso:0.3, preco:35,   desc:'Ressina que mantém temperatura baixa. Ingrediente para poções de resistência ao frio.' },
  { id:'mat_pedra_afiada', nome:'Pedra Afiada de Corte', tipo:'material', subtipo:'mineral',   rar:1, peso:0.5, preco:25,   desc:'Naturalmente afiada. Ferramenta ou ponta de arma leve.' },
  { id:'mat_carvao_puro',  nome:'Carvão Purificado',     tipo:'material', subtipo:'mineral',   rar:1, peso:0.4, preco:20,   desc:'Filtra toxinas e potencializa reações alquímicas.' },
  // Raridade 2 — Raros
  { id:'mat_cristal_mana', nome:'Fragmento de Mana',     tipo:'material', subtipo:'magico',    rar:2, peso:0.1, preco:200,  desc:'Cristal que conduz magia. Ingrediente chave em encantamentos e itens mágicos.' },
  { id:'mat_sangue_besta', nome:'Sangue de Besta Rara',  tipo:'material', subtipo:'animal',    rar:2, peso:0.2, preco:150,  desc:'Sangue de criaturas de DIF 3+. Potencializa qualquer poção (dobra duração ou efeito).' },
  { id:'mat_cobre_runico', nome:'Cobre Rúnico',          tipo:'material', subtipo:'mineral',   rar:2, peso:1.0, preco:180,  desc:'Liga natural de cobre com traços mágicos. Conduz magia. Encantamentos têm custo −1 MP.' },
  { id:'mat_cera_mistica', nome:'Cera Mística',          tipo:'material', subtipo:'vegetal',   rar:2, peso:0.2, preco:120,  desc:'Cera com propriedades de ancoragem mágica. Selos e rituais duram 2× mais tempo.' },
  { id:'mat_osso_antigo',  nome:'Osso Antigo Gravado',   tipo:'material', subtipo:'animal',    rar:2, peso:0.5, preco:250,  desc:'Osso de criatura antiga com gravações naturais. Base para amuletos e focus mágicos.' },
  // Raridade 3 — Épicos
  { id:'mat_escama_drako', nome:'Escama Dracônica',      tipo:'material', subtipo:'dracônico', rar:3, peso:0.3, preco:500,  desc:'Escama de dragão. RD +1 quando usada em armaduras. Resistência ao elemento do dragão.' },
  { id:'mat_essencia_esp', nome:'Essência Espiritual',   tipo:'material', subtipo:'espiritual',rar:3, peso:0.0, preco:800,  desc:'Energia condensada de plano espiritual. Necessária para magias de travessia e rituais maiores.' },
  { id:'mat_prata_sagrada',nome:'Prata Sagrada',         tipo:'material', subtipo:'sagrado',   rar:3, peso:0.8, preco:600,  desc:'Prata consagrada. Armas causam +1d4 dano sagrado a mortos-vivos. Barreiras duram 2× mais.' },
  { id:'mat_vidro_draco',  nome:'Vidro Dracônico',       tipo:'material', subtipo:'dracônico', rar:3, peso:0.2, preco:700,  desc:'Escama de Zar\'Khesh processada. Cortante e mágico. Lâminas de vidro dracônico causam +1d6.' },
  // Raridade 4 — Lendários
  { id:'mat_ouro_runico',  nome:'Ouro Rúnico',           tipo:'material', subtipo:'mineral',   rar:4, peso:1.0, preco:2000, desc:'Ouro com runas naturais. Apenas ele suporta encantamentos de +2 ou mais sem degradar.' },
  { id:'mat_cor_drako',    nome:'Coração Dracônico',     tipo:'material', subtipo:'dracônico', rar:4, peso:0.5, preco:5000, desc:'Coração de dragão menor ou superior. Fonte de poder imenso. Encantamentos supremos.' },
  { id:'mat_lagrima_esp',  nome:'Lágrima de Ylthera',    tipo:'material', subtipo:'espiritual',rar:4, peso:0.0, preco:8000, desc:'Cristal de gelo que não derrete. Forma-se nos olhos de Ylthera após grande batalha.' },
  // Raridade 5 — Míticos
  { id:'mat_primeiro_fogo',nome:'Centelha do Primeiro Fogo',tipo:'material',subtipo:'primordial',rar:5, peso:0.0, preco:50000, desc:'Fragmento do Primeiro Fogo. Apenas em armas lendárias. Não pode ser destruído.' },
  { id:'mat_micelio_antigo',nome:'Micélio Antigo',       tipo:'material', subtipo:'espiritual',rar:5, peso:0.1, preco:30000, desc:'Pedaço do Mycoryss. Permite criar vida ou modificar biologia. Extremamente perigoso.' }
];

// Índice de consumíveis e materiais
const CONSUMIVEIS_INDEX = new Map(CONSUMIVEIS_DB.map(c => [c.id, c]));
const MATERIAIS_INDEX   = new Map(MATERIAIS_DB.map(m => [m.id, m]));
const TODOS_ITENS_LOJA  = [...CONSUMIVEIS_DB, ...MATERIAIS_DB];

// Índice pré-computado de todos os equipamentos por ID
const TODOS_EQUIPAMENTOS = [
  ...EQUIPAMENTOS_DB.armas,
  ...EQUIPAMENTOS_DB.armaduras,
  ...EQUIPAMENTOS_DB.escudos
];
const EQUIPAMENTOS_INDEX = new Map(TODOS_EQUIPAMENTOS.map(e => [e.id, e]));

// Slot atual que está sendo editado
