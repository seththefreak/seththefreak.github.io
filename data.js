/* UnheaveN: ERA Companion — data.js
   Dados extraídos de Palimpsest v2.9.0 */

const DATA = {

  tiers: ['Leigo', 'Treinado', 'Especialista', 'Mestre', 'Maestria'],

  tierAuto: {
    Leigo: '—', Treinado: 'DT 4', Especialista: 'DT 5', Mestre: 'DT 6', Maestria: 'DT 7'
  },

  pilarDice: { 1:'1d6', 2:'2d6↑', 3:'3d6↑', 4:'4d6↑', 5:'5d6↑' },

  nivelStats: {
    1:  { hp:  50, sp:  24, pe:  15 },
    2:  { hp:  63, sp:  30, pe:  19 },
    3:  { hp:  79, sp:  38, pe:  24 },
    4:  { hp:  98, sp:  47, pe:  30 },
    5:  { hp: 123, sp:  59, pe:  37 },
    6:  { hp: 153, sp:  74, pe:  47 },
    7:  { hp: 192, sp:  92, pe:  58 },
    8:  { hp: 239, sp: 115, pe:  73 },
    9:  { hp: 299, sp: 144, pe:  91 },
    10: { hp: 374, sp: 180, pe: 114 },
    11: { hp: 468, sp: 225, pe: 142 },
  },

  pilares: [
    { id: 'corpo', nome: 'CORPO', cor: 'corpo', subas: [
      { id: 'forca',        nome: 'Força',        desc: 'Poder físico bruto. Armas pesadas, impacto muscular. Usado em ataques CaC com armas pesadas.' },
      { id: 'constituicao', nome: 'Constituição',  desc: 'Resistência a dano, esforço e adversidade. Usado em bloqueios e testes de aguantar dano.' },
      { id: 'destreza',     nome: 'Destreza',      desc: 'Precisão, velocidade, armas leves e de fogo. Determina iniciativa e alcance de movimento (4 + Prog.).' },
    ]},
    { id: 'mente', nome: 'MENTE', cor: 'mente', subas: [
      { id: 'intelecto', nome: 'Intelecto', desc: 'Raciocínio, análise, conhecimento técnico. Base para projetos e cognição.' },
      { id: 'sabedoria', nome: 'Sabedoria', desc: 'Intuição, percepção e leitura de situação. Alternativa à Destreza em iniciativa.' },
      { id: 'vontade',   nome: 'Vontade',   desc: 'Concentração e resistência mental. Resiste a medo, controle mental e interrupção de Manifestações.' },
    ]},
    { id: 'alma', nome: 'ALMA', cor: 'alma', subas: [
      { id: 'poder',     nome: 'Poder',     desc: 'Intensidade bruta da Manifestação. Determina escala de dano.' },
      { id: 'dominio',   nome: 'Domínio',   desc: 'Controle e precisão da Manifestação. Usado no acerto de Manifestações.' },
      { id: 'afinidade', nome: 'Afinidade', desc: 'Sintonia com a malha. Sustentação simultânea = Prog.+1. Alcance, duração, sensibilidade à Névoa.' },
    ]},
  ],

  afinidadeNiveis: [
    { n:1, nome: 'Desperto',    desc: 'Manifestações possíveis. Custo normal de PE.' },
    { n:2, nome: 'Sintonizado', desc: '−1 PE em todas as Manifestações (mín 1). +1 PE efetivo em controle.' },
    { n:3, nome: 'Dominante',   desc: '−1 PE adicional (mín 1). +1 passo em escala de efeitos. Vantagem em controle.' },
    { n:4, nome: 'Convergente', desc: 'Manipulação livre dentro do conceito da Marca. Pode ignorar limitações menores de KW.' },
  ],

  regras: [
    {
      id: 'r1', titulo: 'Fórmula de Rolagem', tag: 'sistema',
      conteudo: `<b>PILAR (melhor de Qd6) + Progresso Interno + Progresso Efetivo = Total vs. DT</b><br><br>
Role Q dados d6 (Q = valor do Pilar). Use sempre o <b>melhor</b> resultado. Some Progresso Interno do Subatributo + Progresso Efetivo situacional.
<br><br>O Tier de Domínio define o que você faz <b>sem rolar</b> — role apenas quando a dificuldade excede o Tier, há risco narrativo ou oposição ativa.
<div class="rule-table-wrap"><table class="rule-table"><thead><tr><th>DT</th><th>Grau</th><th>Auto-sucesso</th></tr></thead><tbody>
<tr><td>4</td><td>Fácil</td><td>Treinado+</td></tr>
<tr><td>5</td><td>Moderado</td><td>Especialista+</td></tr>
<tr><td>6</td><td>Difícil</td><td>Mestre+</td></tr>
<tr><td>7</td><td>Extremo</td><td>Maestria</td></tr>
<tr><td>8</td><td>Sobrehumano</td><td>Estigma ativo</td></tr>
<tr><td>9</td><td>Transcendente</td><td>P5 + Prog +3 + condições</td></tr>
</tbody></table></div>`
    },
    {
      id: 'r2', titulo: 'Críticos e Falhas', tag: 'sistema',
      conteudo: `<b>Ameaça:</b> Melhor dado = 6 → role novamente. Se atingir a DT original: <b>crítico confirmado</b>.<br>
• Impacto Bruto: dano máximo automático.<br>
• Efeito Crítico: aplica efeito da arma. Em cenas climáticas: rola dano duas vezes.<br><br>
<b>Falha Crítica:</b> Melhor dado = 1 + falha → complicação narrativa proporcional.<br><br>
<b>Vantagem:</b> +1 dado extra, descarta o pior.<br>
<b>Desvantagem:</b> +1 dado extra, descarta o melhor.`
    },
    {
      id: 'r3', titulo: 'Escalas de Dano — Manifestações', tag: 'estigma',
      conteudo: `Dano = Tier + Amplificação (PE extra gasto). O Progresso (+0 a +3) soma ao resultado dos dados.<br><br>
<div class="rule-table-wrap"><table class="rule-table"><thead><tr><th>Tier</th><th>+0</th><th>+1–2</th><th>+3–5</th><th>+6–9</th><th>+10–14</th><th>+15+</th></tr></thead><tbody>
<tr><td>Leigo</td><td>1d6</td><td>1d10</td><td>2d8</td><td>3d8</td><td>4d8</td><td>5d8</td></tr>
<tr><td>Treinado</td><td>1d10</td><td>2d8</td><td>3d8</td><td>4d8</td><td>5d8</td><td>6d8</td></tr>
<tr><td>Especialista</td><td>2d8</td><td>3d8</td><td>4d8</td><td>5d8</td><td>6d8</td><td>8d8</td></tr>
<tr><td>Mestre</td><td>3d8</td><td>4d8</td><td>5d8</td><td>6d8</td><td>8d8</td><td>10d8</td></tr>
<tr><td>Maestria</td><td>4d8</td><td>5d8</td><td>6d8</td><td>8d8</td><td>10d8</td><td>12d8+</td></tr>
</tbody></table></div>
<br><b>Tipo por PE total:</b> Simples 1–3 (m) · Avançada 4–7 (Mv) · Completa 8–14 (M) · Extrema 15+ (C)`
    },
    {
      id: 'r4', titulo: 'Construir Manifestação (KW)', tag: 'estigma',
      conteudo: `Toda Manifestação = <b>ELEMENTO + FORMA + PROPRIEDADE</b>. KW = soma dos três.<br><br>
• KW define comportamento e complexidade — <b>não</b> a escala de poder.<br>
• Escala de poder = PE extra em <b>Amplificação</b>.<br><br>
<b>Sustentadas:</b> custam KW÷2 PE/turno (arredondamento ≥ 0.7).<br>
Máximo simultâneo = Prog. Afinidade + 1.`
    },
    {
      id: 'r5', titulo: 'Elementos (resumo)', tag: 'estigma',
      conteudo: `<div class="rule-table-wrap"><table class="rule-table"><thead><tr><th>PE</th><th>Elementos</th></tr></thead><tbody>
<tr><td>1</td><td>Pyro · Hydro · Geo · Aero · Lux · Umbra</td></tr>
<tr><td>2</td><td>Cryo · Electro · Plantae · Saxum · Harenae · Fumum</td></tr>
<tr><td>3</td><td>Vita · Inanis · Solus · Nebula · Sonus</td></tr>
<tr><td>4</td><td>Ferrum · Hitze · Kalt · Fulgaris · Noctis · Ignis Lux · Plasmoris · Venenis · Chronos Eco</td></tr>
<tr><td>6–7</td><td>Krystallis · Aposis · Oblivion · Pestes · Tempus · Fulminis · Anima</td></tr>
</tbody></table></div>
Novo Elemento = dois existentes + 1 PE. Aprovação do Mestre obrigatória.`
    },
    {
      id: 'r6', titulo: 'Recursos — HP, SP e PE', tag: 'recursos',
      conteudo: `<div class="rule-table-wrap"><table class="rule-table"><thead><tr><th>Recurso</th><th>Base N1</th><th>A 0...</th></tr></thead><tbody>
<tr><td>HP</td><td>50</td><td>Inconsciente → risco de morte</td></tr>
<tr><td>SP</td><td>24</td><td>Colapso mental / insanidade</td></tr>
<tr><td>PE</td><td>15</td><td>Sem Manifestações até recuperar</td></tr>
</tbody></table></div>
<br><b>Rec. HP:</b> 15% por descanso longo (mín 15 pts).<br>
<b>Rec. SP:</b> 1d6+nível por descanso longo.<br>
<b>Rec. PE:</b> 3/4 por descanso longo. 1/5 por hora.<br><br>
<b>Overdraft:</b> PE abaixo de 0 → 1 Exaustão imediata por ponto. Limite: Alma×5.`
    },
    {
      id: 'r7', titulo: 'Ações de Turno', tag: 'combate',
      conteudo: `<div class="rule-table-wrap"><table class="rule-table"><thead><tr><th>Símbolo</th><th>Nome</th><th>Uso</th></tr></thead><tbody>
<tr><td>M</td><td>Ação Maior</td><td>Ataque, Manifestação Completa, interação complexa.</td></tr>
<tr><td>m</td><td>Ação Menor</td><td>Manifestação Simples (1–3 PE), item, falar.</td></tr>
<tr><td>Mv</td><td>Movimento</td><td>4 + Prog. Destreza unidades. Manifestação Avançada (4–7 PE).</td></tr>
<tr><td>R</td><td>Reação</td><td>1/rodada. Esquiva, bloqueio, contra-ataque.</td></tr>
<tr><td>L</td><td>Livre</td><td>Falas curtas. Ilimitado.</td></tr>
<tr><td>C</td><td>Ação Completa</td><td>Consome o turno. Manifestações Extremas (15+ PE).</td></tr>
</tbody></table></div>
<br><b>Composições:</b> M+m+Mv (versátil) · M+m+m (sem deslocamento) · Mv+Mv+m (mobilidade)`
    },
    {
      id: 'r8', titulo: 'Condições de Combate', tag: 'condicoes',
      conteudo: `<div class="rule-table-wrap"><table class="rule-table"><thead><tr><th>Condição</th><th>Efeito</th><th>Remoção</th></tr></thead><tbody>
<tr><td>Envenenado</td><td>1d6 HP/turno, −1 Corpo</td><td>Antídoto / Lux</td></tr>
<tr><td>Sangramento</td><td>3 HP/turno</td><td>Primeiros Socorros (m)</td></tr>
<tr><td>Imobilizado</td><td>Sem movimento, −2 Destreza</td><td>Força vs DT 6</td></tr>
<tr><td>Atordoado</td><td>Perde M no próximo turno</td><td>1 turno automático</td></tr>
<tr><td>Cego</td><td>Ataques com desvantagem</td><td>Cura ou duração</td></tr>
<tr><td>Amedrontado</td><td>Foge da fonte. −2 em tudo</td><td>Vontade DT 5/turno</td></tr>
<tr><td>Queimando</td><td>1d6 fogo/turno</td><td>Ação para apagar</td></tr>
<tr><td>Congelado</td><td>Imobilizado. Próx. ataque +1d6</td><td>Calor ou 2 turnos</td></tr>
<tr><td>Confuso</td><td>Alvo aleatório (1d4)</td><td>Vontade DT 6/turno</td></tr>
</tbody></table></div>`
    },
    {
      id: 'r9', titulo: 'Exaustão', tag: 'condicoes',
      conteudo: `<div class="rule-table-wrap"><table class="rule-table"><thead><tr><th>Nível</th><th>Gatilho</th><th>Efeito</th></tr></thead><tbody>
<tr><td>1 — Cansado</td><td>24h sem descanso</td><td>−1 em todas as rolagens</td></tr>
<tr><td>2 — Esgotado</td><td>48h / Overdraft de PE</td><td>−2 em tudo; PE máx −25%</td></tr>
<tr><td>3 — Exausto</td><td>72h / trauma grave</td><td>−3; movimento metade; HP bloqueado</td></tr>
<tr><td>4 — Colapso</td><td>96h+ / HP 0 mais de 2×</td><td>Inconsciente; PE zero</td></tr>
</tbody></table></div>`
    },
    {
      id: 'r10', titulo: 'Progressão de Tier', tag: 'sistema',
      conteudo: `Pontos investidos aumentam o <b>Progresso Interno</b> (+0 a +3).<br>
Ao acumular 4 pontos: reset para +0 e <b>+1 Tier</b> automaticamente.<br><br>
<b>Limite:</b> máximo distribuível = 4 + nível do personagem.<br>
Não aplique pontos 3× seguidas no mesmo Subatributo em uma sessão.`
    },
    {
      id: 'r11', titulo: 'Zonas XENO e XERO', tag: 'sistema',
      conteudo: `<b>XENO</b> — eXtradimensional ENtity Occurrence:<br>
Manifestações anômalas espontâneas · Distorções sensoriais · Entidades surgem · Estigma amplificado e instável.<br><br>
<b>XERO</b> — eXtinction of Esoteric Resonance Output:<br>
Impossibilidade absoluta de fenômenos sobrenaturais · Estigma completamente inativo · Portadores sentem dor/náusea · Em níveis profundos: degradação de percepção, memória e identidade.<br><br>
<i>"XERO não representa equilíbrio, mas anulação. Não é o silêncio entre as notas. É a ausência da possibilidade de som."</i>`
    },
    {
      id: 'r12', titulo: 'Determinação', tag: 'sistema',
      conteudo: `Cicatrizes que viram recurso. Cada ponto = sobrevivência, não conquista.<br><br>
<b>Concessão:</b> GM concede após experiências grandes o suficiente para deixar marca.<br>
<b>Ativação:</b> Só quando a cena confronta a Declaração daquele ponto. O obstáculo é <em>suspenso</em> — não some.<br><br>
<b>Recuos possíveis:</b><br>
• Ignorar Exaustão → limite visível para todos na cena.<br>
• Ignorar Dor → cobrança adiada para o pior momento.<br>
• Ignorar Medo → Estigma flutua, mais permeável ao paranormal.<br>
• Ignorar Situação → solução cria complicação equivalente em escala.`
    },
    {
      id: 'r13', titulo: 'Rolagem de Sorte (1d10)', tag: 'sistema',
      conteudo: `<div class="rule-table-wrap"><table class="rule-table"><thead><tr><th>1d10</th><th>Resultado</th></tr></thead><tbody>
<tr><td>1–3</td><td>Azar — Complicação narrativa imediata</td></tr>
<tr><td>4–6</td><td>Neutro — Sorte gasta sem efeito</td></tr>
<tr><td>7–9</td><td>Sorte — Vantagem imediata OU +2 dano</td></tr>
<tr><td>10</td><td>Grande Sorte — Efeito positivo significativo (Mestre define)</td></tr>
</tbody></table></div>`
    },
    {
      id: 'r14', titulo: 'Arredondamento Universal', tag: 'sistema',
      conteudo: `Fração <b>≥ 0.7</b> → arredonda CIMA.<br>
Fração <b>< 0.7</b> → arredonda BAIXO.<br><br>
Exemplos: 3.7→4 · 3.5→3 · 2.7→3 · 4.3→4`
    },
    {
      id: 'r15', titulo: 'Criação de Personagem', tag: 'sistema',
      conteudo: `<b>Pilares base:</b> Corpo 1 · Mente 1 · Alma 0. Distribua mais 2 pontos livremente.<br>
Cada ponto de Pilar = 3 pontos de Subatributo para distribuir.<br><br>
<b>Perícias Iniciais:</b><br>
• 3 perícias Treinadas (1 jogador + 2 Mestre)<br>
• 1 perícia Especialista (Mestre)<br>
• +1 Progresso em 3 perícias diferentes (jogador)<br><br>
<b>Habilidades:</b> 2 escolhas do jogador + 1 concedida pela lore.<br>
<b>Manifestações definidas:</b> até (Prog. Afinidade + 2).<br>
<b>Determinação:</b> Nenhum ponto na criação.`
    },
  ],

  habilidades: [
    // COMBATE
    { id:'h01', cat:'combate', icon:'⚔️', nome:'Resistente',       resumo:'−2 pts em todo dano físico recebido',           efeito:'Reduz em 2 pts todo dano físico recebido (mínimo 1 ponto de dano).' },
    { id:'h02', cat:'combate', icon:'🎯', nome:'Letal',             resumo:'Ameaça com 5 ou 6 (normal só 6)',               efeito:'Margem de Ameaça expandida: resultado 5 ou 6 conta como Ameaça.' },
    { id:'h03', cat:'combate', icon:'🗡️', nome:'Mestre das Armas',  resumo:'Proficiência com todas as armas; +1 PE em crítico',efeito:'Proficiência com todas as armas. +1 Progresso Efetivo nos testes de crítico.' },
    { id:'h04', cat:'combate', icon:'💪', nome:'Guerreiro',          resumo:'Dado de dano extra em CaC pesado (descarta menor)',efeito:'Rola dado de dano extra em ataques CaC com armas pesadas (descarta o menor).' },
    { id:'h05', cat:'combate', icon:'🗡️', nome:'Duelista',           resumo:'+1 PE em ataque e defesa vs. alvo único declarado',efeito:'Ao declarar um alvo único por turno: +1 Prog. Efetivo em ataque e defesa contra ele.' },
    { id:'h06', cat:'combate', icon:'🔫', nome:'Atirador',           resumo:'+1 PE em ataques à distância; ignora cobertura leve',efeito:'+1 Prog. Efetivo em ataques à distância com armas de fogo. Ignora cobertura leve.' },
    { id:'h07', cat:'combate', icon:'🛡️', nome:'Guardião',           resumo:'Intercepta ataques em aliados como Reação',     efeito:'+1 Prog. Efetivo em defesa ao proteger aliados. Pode interceptar ataques como Reação.' },
    { id:'h08', cat:'combate', icon:'🤸', nome:'Acrobata',           resumo:'Vantagem em manobras ágeis; nunca cai em terreno difícil',efeito:'Vantagem em manobras ágeis. Nunca cai ao cruzar terreno difícil.' },
    { id:'h09', cat:'combate', icon:'🗡️', nome:'Assassino',          resumo:'+1 PE em ataques surpresa e em Enganação/Disfarce',efeito:'+1 Prog. Efetivo em ataques surpresa. +1 Prog. Efetivo em Enganação e Disfarce.' },
    { id:'h10', cat:'combate', icon:'⚔️', nome:'Combatente Dual',    resumo:'Penalidade de duas armas −1; +1 ataque extra',  efeito:'Reduz penalidade de duas armas para −1. +1 ataque extra com arma secundária.' },
    { id:'h11', cat:'combate', icon:'💨', nome:'Evasivo',            resumo:'+1 PE em Esquiva; nunca sofre dano de área ao esquivar',efeito:'+1 Prog. Efetivo em Esquiva. Nunca sofre dano de área se esquivar com sucesso.' },
    { id:'h12', cat:'combate', icon:'⚡', nome:'Reflexos Afiados',   resumo:'Pode esquivar como Reação sem declarar',        efeito:'+1 Prog. Efetivo em Esquiva. Pode realizar esquiva como Reação mesmo sem declará-la.' },
    { id:'h13', cat:'combate', icon:'💥', nome:'Golpe Vital',        resumo:'+1 dado de dano ao superar defesa por 2+',      efeito:'+1 dado de dano em acertos que superam a defesa por 2+. Em crítico: efeito adicional automático.' },
    { id:'h14', cat:'combate', icon:'🥊', nome:'Ambidestria',        resumo:'2 ataques por turno (2º usa −1 dado)',           efeito:'Pode realizar 2 ataques por turno como ação de ataque. O segundo usa −1 dado.' },
    { id:'h15', cat:'combate', icon:'❤️', nome:'Pulso de Adrenalina',resumo:'Permanece em pé com 1 HP ao cair a 0',          efeito:'Ao cair a 0 HP: permanece em pé com 1 HP até o fim do turno. Pode realizar apenas 1 ação.' },
    // ESTIGMA
    { id:'h16', cat:'estigma', icon:'✨', nome:'Feiticeiro',         resumo:'+1 PE em Domínio; −1 PE em Simples e Avançadas', efeito:'+1 Prog. Efetivo em Domínio. −1 PE em Manifestações Simples e Avançadas.' },
    { id:'h17', cat:'estigma', icon:'🌀', nome:'Invocador',          resumo:'+1 PE em Poder em Invocações; +1 turno de duração',efeito:'+1 Prog. Efetivo em Poder ao usar Formas de Invocação. +1 turno de duração.' },
    { id:'h18', cat:'estigma', icon:'🛡️', nome:'Barreira Mística',  resumo:'Barreiras custam −1 PE; +1 PE em Afinidade',    efeito:'Manifestações de barreira custam −1 PE. +1 Prog. Efetivo em Afinidade.' },
    { id:'h19', cat:'estigma', icon:'💀', nome:'Necromante',         resumo:'+1 PE em Poder com Umbra, Noctis ou Vita',       efeito:'+1 Prog. Efetivo em Poder com Umbra, Noctis ou Vita. Pode animar mortos (narrativo).' },
    { id:'h20', cat:'estigma', icon:'🔥', nome:'Mestre das Chamas',  resumo:'+1 PE em Pyro e derivados; resistência ao fogo', efeito:'+1 Prog. Efetivo em ataques com Pyro e derivados. Resistência a dano de fogo.' },
    { id:'h21', cat:'estigma', icon:'✝️', nome:'Exorcista',          resumo:'+1 PE em Domínio e Afinidade vs. entidades',    efeito:'+1 Prog. Efetivo em Domínio e Afinidade vs. entidades. Resistência a ataques espirituais.' },
    { id:'h22', cat:'estigma', icon:'⚗️', nome:'Elementalista',      resumo:'−1 PE e +1 PE em 1 Elemento escolhido (múltipla aquisição)',efeito:'Escolhe 1 Elemento: −1 PE e +1 Prog. Efetivo para esse Elemento. Pode ser adquirida múltiplas vezes.' },
    { id:'h23', cat:'estigma', icon:'👁️', nome:'Sensitivo',          resumo:'+1 PE em detectar Névoa, Estigmas e entidades', efeito:'+1 Prog. Efetivo em detectar Névoa, Estigmas ativos e entidades próximas.' },
    { id:'h24', cat:'estigma', icon:'🔗', nome:'Catalisador',         resumo:'Empresta até 5 PE/turno a aliado com Estigma',  efeito:'Pode emprestar até 5 PE por turno a aliado com Estigma em alcance.' },
    { id:'h25', cat:'estigma', icon:'🌌', nome:'Sensitivo Avançado',  resumo:'Detecta Névoa em 15u; comunica com entidades 1×/sessão',efeito:'Detecta Névoa passiva e ativa em 15u. 1× por sessão: comunicação breve com entidade próxima.' },
    { id:'h26', cat:'estigma', icon:'🔍', nome:'Rastreador de Almas', resumo:'+1 PE em identificação paranormal; rastreia Essência em 6u',efeito:'Detecta rastros de Essência em até 6u. +1 Prog. Efetivo em identificação paranormal.' },
    // SUPORTE
    { id:'h27', cat:'suporte', icon:'🧠', nome:'Resiliência Mental',  resumo:'−1 perda de SP por evento (mín 0)',             efeito:'Reduz perda de sanidade em 1 (mínimo 0) por evento.' },
    { id:'h28', cat:'suporte', icon:'💎', nome:'Vontade Indomável',   resumo:'Re-rola 1 teste mental/sessão; sucesso = +1d4 SP',efeito:'1× por sessão: re-rola qualquer teste mental. Aceita o novo resultado. Sucesso: recupera 1d4 SP.' },
    { id:'h29', cat:'suporte', icon:'🩸', nome:'Sangue Frio',         resumo:'+1 PE em sanidade durante combate/tensão',      efeito:'+1 Prog. Efetivo em testes de sanidade durante combate ou cenas de tensão aguda.' },
    { id:'h30', cat:'suporte', icon:'💊', nome:'Curandeiro',          resumo:'Dobra eficácia de Medicina; +10 HP em primeiros-socorros',efeito:'Dobra a eficácia de cura via Medicina. +10 HP em primeiros socorros.' },
    { id:'h31', cat:'suporte', icon:'🥷', nome:'Ladino',              resumo:'+1 PE em Furtividade e Ladinagem',              efeito:'+1 Prog. Efetivo em Furtividade e Ladinagem simultaneamente.' },
    { id:'h32', cat:'suporte', icon:'🗺️', nome:'Explorador',         resumo:'+1 PE em Sobrevivência e navegação',            efeito:'+1 Prog. Efetivo em Sobrevivência e navegação em terreno desconhecido.' },
    { id:'h33', cat:'suporte', icon:'🤝', nome:'Negociador',          resumo:'+1 PE em Diplomacia e Persuasão; re-rola 1×/cena',efeito:'+1 Prog. Efetivo em Diplomacia e Persuasão. Re-rola 1× por cena.' },
    { id:'h34', cat:'suporte', icon:'🔮', nome:'Vidente',             resumo:'+1 PE em Intuição; pergunta sim/não ao Mestre 1×/dia',efeito:'+1 Prog. Efetivo em Intuição e Percepção. 1× por dia: pergunta sim/não ao Mestre.' },
    { id:'h35', cat:'suporte', icon:'💻', nome:'Analista',            resumo:'+1 PE em tech humana; pré-req para TEK operacional',efeito:'+1 Prog. Efetivo em tech humana. Pré-requisito para projetos tech complexos e TEK operacional.' },
    { id:'h36', cat:'suporte', icon:'🏥', nome:'Médico de Campo',     resumo:'Estabiliza inconsciente com m; +5 HP em primeiros-socorros',efeito:'Estabiliza inconsciente com Ação Menor. +5 HP extra por primeiros socorros.' },
    { id:'h37', cat:'suporte', icon:'👑', nome:'Líder Tático',        resumo:'Aliados em 3u ganham +1 PE em iniciativa',      efeito:'Aliados em alcance 3u ganham +1 Prog. Efetivo em iniciativa e 1 re-rolar por combate.' },
    { id:'h38', cat:'suporte', icon:'🍀', nome:'Sorte Estranha',      resumo:'Re-rola 1 falha crítica por sessão',            efeito:'1× por sessão: pode re-rolar uma falha crítica. Aceita o novo resultado.' },
    { id:'h39', cat:'suporte', icon:'⭐', nome:'Momento de Glória',   resumo:'Transforma 1 falha comum em sucesso simples',   efeito:'1× por sessão: transforma uma falha comum em sucesso simples. Não funciona em falhas críticas.' },
  ],

};
