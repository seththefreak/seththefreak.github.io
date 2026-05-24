/*
 * Audit refactor:
 * - Documents this file as a declarative ERA compendium/data extension.
 * - Preserves global ERA_DATA augmentation for the current script stack.
 * - Adds PDF-sourced KW, pressure, and advanced manifestation references without changing existing base data.
 */

window.ERA_DATA = {
  ...window.ERA_DATA,

  STYLE_AFFINITY: [
    { level: 0, name: "Desconhecido", effect: "Sem acesso às técnicas do estilo." },
    { level: 1, name: "Familiarizado", effect: "Libera técnicas de Afinidade 1." },
    { level: 2, name: "Treinado", effect: "Libera Afinidade 2 e melhora as técnicas de Afinidade 1." },
    { level: 3, name: "Especialista", effect: "Libera todas as técnicas, combos e sínteses do estilo." },
  ],

  STYLE_REACTION_RULES: {
    allow: [
      "Você viu o ataque chegar.",
      "Sua arma ou técnica é compatível com a reação.",
      "Você não comprometeu o turno inteiro em M + m.",
      "Você está de pé e consciente.",
    ],
    block: [
      "Surpresa, costas ou ataque furtivo.",
      "Sobrecarga de múltiplos ataques no mesmo turno.",
      "Arma pequena tentando aparar ameaça grande demais.",
      "Status como atordoado, derrubado ou imobilizado.",
    ],
    parry: [
      { tool: "Arma leve", scope: "Apara apenas armas leves." },
      { tool: "Haste ou arma média+", scope: "Apara armas leves e médias." },
      { tool: "Escudo", scope: "Apara qualquer arma física." },
      { tool: "Corrente/flexível (Afin. 2+)", scope: "Apara leves, médias e projéteis." },
    ],
  },

  WEAPON_STYLE_MAP: [
    { weapon: "Ataque Desarmado", styleA: "Agressão", styleB: "Controle", synthesis: null },
    { weapon: "Soco Inglês", styleA: "Investida", styleB: "Sangria", synthesis: null },
    { weapon: "Manopla", styleA: "Ferro", styleB: "Guarda Fechada", synthesis: null },
    { weapon: "Adaga", styleA: "Sombra", styleB: "Duelista", synthesis: null },
    { weapon: "Kukri", styleA: "Gancho", styleB: "Dual", synthesis: null },
    { weapon: "Cinquedea", styleA: "Lâmina Larga", styleB: "Duelo Próximo", synthesis: null },
    { weapon: "Rondel", styleA: "Perfurador", styleB: "Presa", synthesis: null },
    { weapon: "Cimitarra", styleA: "Dança", styleB: "Duelo Árabe", synthesis: null },
    { weapon: "Katana", styleA: "Iai", styleB: "Kenjutsu", synthesis: null },
    { weapon: "Espada Vitoriana", styleA: "Esgrima", styleB: "Cavaleiro", synthesis: null },
    { weapon: "Espada Alexandrina", styleA: "Mão Única", styleB: "Duas Mãos", synthesis: null },
    { weapon: "Lança", styleA: "Formação", styleB: "Caçador", synthesis: null },
    { weapon: "Tridente", styleA: "Pescador", styleB: "Ondas", synthesis: null },
    { weapon: "Naginata", styleA: "Defesa em Alcance", styleB: "Fluxo", synthesis: null },
    { weapon: "Nagamaki", styleA: "Varredura", styleB: "Haste Híbrida", synthesis: null },
    { weapon: "Alabarda", styleA: "Machado de Haste", styleB: "Guarda de Haste", synthesis: null },
    { weapon: "Bisento", styleA: "Varredura Ampla", styleB: "Presença", synthesis: null },
    { weapon: "Foice Gigante", styleA: "Segador", styleB: "Ceifador", synthesis: null },
    { weapon: "Odachi", styleA: "Corte Absoluto", styleB: "Varredura", synthesis: null },
    { weapon: "Zweihander", styleA: "Meia-Espada", styleB: "Devastação", synthesis: null },
    { weapon: "Machado de Mão", styleA: "Arremessador", styleB: "Dual", synthesis: null },
    { weapon: "Martelo de Mão", styleA: "Ferreiro", styleB: "Fluxo Rápido", synthesis: null },
    { weapon: "Machado de Guerra", styleA: "Fenda", styleB: "Pressão Bruta", synthesis: null },
    { weapon: "Martelo de Guerra", styleA: "Demolidor", styleB: "Terremoto", synthesis: null },
    { weapon: "Kusarigama", styleA: "Kama", styleB: "Kunai/Kusari", synthesis: "Seiryu" },
    { weapon: "Kusarifundo", styleA: "Kama", styleB: "Fundo/Kusari", synthesis: "Kokuryu" },
    { weapon: "Arco Curto", styleA: "Disparo Móvel", styleB: "Saraivada", synthesis: null },
    { weapon: "Arco Longo", styleA: "Precisão", styleB: "Cobertura", synthesis: null },
    { weapon: "Balestra", styleA: "Anti-Armadura", styleB: "Precisão Calculada", synthesis: null },
    { weapon: "Zarabatana", styleA: "Veneno", styleB: "Fantasma", synthesis: null },
    { weapon: "Revólver", styleA: "Duelo", styleB: "Controle Tático", synthesis: null },
    { weapon: "Pistola", styleA: "Assalto Próximo", styleB: "Utilitária", synthesis: null },
    { weapon: "Rifle de Assalto", styleA: "Assalto", styleB: "Cobertura Tática", synthesis: null },
    { weapon: "Sniper", styleA: "Francotirador", styleB: "Observador", synthesis: null },
  ],

  STYLE_DETAILS: [
    {
      weapon: "Ataque Desarmado",
      style: "Agressão",
      summary: "Golpes diretos, pressão constante e fluxo de impacto sem pausa.",
      levels: [
        { tier: 1, entries: [
          { name: "Rajada", type: "Pressão", action: "M", effect: "Três golpes curtos; se todos acertam, o último passa pela defesa reativa." },
          { name: "Avanço Explosivo", type: "Golpe", action: "m", effect: "Embute 1u de avanço no ataque e pode empurrar o alvo em acerto." },
        ] },
        { tier: 2, entries: [
          { name: "Série Rompedora", type: "Pressão", action: "M", effect: "Cada hit reduz a defesa do alvo para o golpe seguinte no mesmo turno." },
          { name: "Derrubada", type: "Golpe", action: "M", effect: "Golpe baixo com varredura que derruba e atrasa a recuperação do inimigo." },
        ] },
        { tier: 3, entries: [
          { name: "Explosão Total", type: "Pressão", action: "M+m", effect: "Dois ataques completos no mesmo turno; forte, mas previsível no retorno." },
          { name: "Atordoamento Preciso", type: "Golpe", action: "M", effect: "Ataque limpo à cabeça que confirma atordoamento em crítico." },
        ] },
      ],
    },
    {
      weapon: "Ataque Desarmado",
      style: "Controle",
      summary: "Agarrões, projeções e pinos para anular posição e ritmo do alvo.",
      levels: [
        { tier: 1, entries: [
          { name: "Agarrão", type: "Controle", action: "M", effect: "Prende o alvo no lugar até alguém romper a disputa física." },
          { name: "Empurrão Direcionado", type: "Controle", action: "m", effect: "Empurra 1u para cobertura ruim, terreno perigoso ou outra ameaça." },
        ] },
        { tier: 2, entries: [
          { name: "Projeção", type: "Controle", action: "M", effect: "Arremessa o alvo, derruba e soma impacto à queda." },
          { name: "Estrangulamento", type: "Controle", action: "M", effect: "Converte agarrão em pressão progressiva no pescoço." },
        ] },
        { tier: 3, entries: [
          { name: "Imobilização Completa", type: "Controle", action: "M+m", effect: "Pino total no chão, exigindo escape pesado para sair." },
          { name: "Redirecionamento", type: "Reação", action: "m", effect: "Usa o momentum de ataque do inimigo contra ele e quebra seu turno." },
        ] },
      ],
    },
    {
      weapon: "Adaga",
      style: "Sombra",
      summary: "Furtividade, posicionamento e golpe vital antes do combate te ler.",
      levels: [
        { tier: 1, entries: [
          { name: "Golpe Oculto", type: "Golpe", action: "m", effect: "Ataque de flanco ou furtivo com dano extra e entrada fácil pelo movimento." },
          { name: "Guardar na Manga", type: "Abertura", action: "L", effect: "Mantém a adaga invisível até o próximo ataque surpresa com vantagem." },
        ] },
        { tier: 2, entries: [
          { name: "Ponto Vital", type: "Golpe", action: "M", effect: "Explora pescoço, axila ou virilha para crítico automático em boa posição." },
          { name: "Silencioso", type: "Golpe", action: "M", effect: "Suprime som e grito do alvo em uma eliminação furtiva." },
        ] },
        { tier: 3, entries: [
          { name: "Eliminação", type: "Golpe", action: "M", effect: "Ataque de assassino contra alvo surpreso ou preso, com dano triplicado." },
          { name: "Múltiplos Alvos", type: "Golpe", action: "M+m", effect: "Com duas adagas, encadeia dois golpes adjacentes na mesma abertura." },
        ] },
      ],
    },
    {
      weapon: "Adaga",
      style: "Duelista",
      summary: "Desviar para atacar e ganhar o duelo no espaço zero.",
      levels: [
        { tier: 1, entries: [
          { name: "Desvio Rápido", type: "Reação", action: "sem custo", effect: "Redireciona melee leve e concede reposicionamento curto." },
          { name: "Saque e Ataque", type: "Golpe", action: "m", effect: "Saca e golpeia em uma ação; se estava oculta, a defesa chega atrasada." },
        ] },
        { tier: 2, entries: [
          { name: "Contra-Estocada", type: "Reação", action: "m", effect: "Após desviar, devolve a estocada sem reação defensiva do alvo." },
          { name: "Fechar a Distância", type: "Golpe", action: "m", effect: "Avança 1u e golpeia de imediato, ótimo para punir arma pesada." },
        ] },
        { tier: 3, entries: [
          { name: "Dança de Lâminas", type: "Pressão", action: "M", effect: "Cada desvio bem-sucedido libera um contra-golpe adicional." },
          { name: "Perfurar a Guarda", type: "Golpe", action: "M", effect: "Atravessa bloqueios de escudo e armaduras leves ou médias." },
        ] },
      ],
    },
    {
      weapon: "Kukri",
      style: "Gancho",
      summary: "Curva interna para contornar guarda e aprofundar cortes.",
      levels: [
        { tier: 1, entries: [
          { name: "Corte em Arco", type: "Golpe", action: "m", effect: "Trajetória curva que reduz a proteção do escudo." },
          { name: "Puxar com a Lâmina", type: "Golpe", action: "m", effect: "Traciona o corte e aplica sangramento sem depender do crítico." },
        ] },
        { tier: 2, entries: [
          { name: "Gancho Vital", type: "Golpe", action: "M", effect: "Golpe de flanco ou costas com crítico automático confirmado." },
          { name: "Série Interna", type: "Pressão", action: "M", effect: "Dois arcos rápidos; se o primeiro abre, o segundo vem favorecido." },
        ] },
        { tier: 3, entries: [
          { name: "Devastação do Arco", type: "Golpe", action: "M", effect: "Grande corte em arco com sangramento elevado e fragilização em crítico." },
          { name: "Três Cortes", type: "Pressão", action: "M+m", effect: "Tripla sequência que escala muito contra hemorragia já aberta." },
        ] },
      ],
    },
    {
      weapon: "Kukri",
      style: "Dual",
      summary: "Dois kukris alternando avanço, guarda cruzada e convergência.",
      levels: [
        { tier: 1, entries: [
          { name: "Ataque Alternado", type: "Golpe", action: "M", effect: "Dois cortes de lados opostos, difíceis de ler na mesma defesa." },
          { name: "Guarda Cruzada", type: "Reação", action: "sem custo", effect: "Usa as duas lâminas para reduzir bastante o dano recebido." },
        ] },
        { tier: 2, entries: [
          { name: "Tesoura", type: "Golpe", action: "M", effect: "Ataque simultâneo em pinça, ruim para escudos pequenos." },
          { name: "Fluxo Dual", type: "Pressão", action: "M+m", effect: "Quatro golpes alternados com foco em empilhar sangramento." },
        ] },
        { tier: 3, entries: [
          { name: "Vórtex de Lâminas", type: "Pressão", action: "M+m", effect: "Distribui cortes em toda a adjacência e espalha sangramento." },
          { name: "Convergência", type: "Golpe", action: "M", effect: "Une as duas lâminas no mesmo ponto para perfurar quase qualquer defesa." },
        ] },
      ],
    },
    {
      weapon: "Cinquedea",
      style: "Lâmina Larga",
      summary: "Explora largura para atacar, aparar e ocupar espaço.",
      levels: [
        { tier: 1, entries: [
          { name: "Tajo Largo", type: "Golpe", action: "M", effect: "Corte horizontal capaz de tocar dois alvos próximos." },
          { name: "Aparar Plano", type: "Reação", action: "sem custo", effect: "Usa o plano da lâmina para aparar armas médias com confiança." },
        ] },
        { tier: 2, entries: [
          { name: "Corte Devastador", type: "Golpe", action: "M", effect: "Golpe de largura total com dano base elevado e ótima penetração leve." },
          { name: "Arco Defensivo", type: "Pressão", action: "M", effect: "Ataca enquanto cria espaço e ameaça quem insiste em avançar." },
        ] },
        { tier: 3, entries: [
          { name: "Fenda Cruzada", type: "Golpe", action: "M+m", effect: "Golpes cruzados em sequência, difíceis de defender por inteiro." },
          { name: "Muro de Lâmina", type: "Reação", action: "m", effect: "Interpõe a arma para bloquear leves automaticamente e médios por disputa." },
        ] },
      ],
    },
    {
      weapon: "Cinquedea",
      style: "Duelo Próximo",
      summary: "Estocadas rápidas, deflexões e leitura de espaço apertado.",
      levels: [
        { tier: 1, entries: [
          { name: "Estocada Rápida", type: "Golpe", action: "m", effect: "Perfuração direta mais veloz que o corte padrão da arma." },
          { name: "Deflexão", type: "Reação", action: "sem custo", effect: "Desvia em vez de bloquear e já prepara o contra-golpe." },
        ] },
        { tier: 2, entries: [
          { name: "Corte e Estocada", type: "Pressão", action: "M", effect: "Corte obriga defesa e a estocada entra na abertura restante." },
          { name: "Giro de Punho", type: "Golpe", action: "m", effect: "Alterna corte e perfuração no mesmo gesto, piorando a leitura defensiva." },
        ] },
        { tier: 3, entries: [
          { name: "Finalização Vital", type: "Golpe", action: "M", effect: "Estocada em ponto crítico após preparo técnico, com dano máximo." },
          { name: "Dança de Duelo", type: "Pressão", action: "M+m", effect: "Ciclo completo de corte, deflexão e estocada que vai afundando a defesa." },
        ] },
      ],
    },
    {
      weapon: "Rondel",
      style: "Perfurador",
      summary: "Busca junta, viseira e falha mecânica da armadura.",
      levels: [
        { tier: 1, entries: [
          { name: "Buscar a Junta", type: "Golpe", action: "M", effect: "Ignora RD ao mirar nas falhas da armadura após leitura prévia." },
          { name: "Estocada Concentrada", type: "Golpe", action: "m", effect: "Empurra a ponta com peso total para atravessar proteção leve." },
        ] },
        { tier: 2, entries: [
          { name: "Viseira", type: "Golpe", action: "M", effect: "Explora aberturas de capacete para crítico muito fácil ou automático." },
          { name: "Ponto de Pressão", type: "Golpe", action: "M", effect: "Cada golpe repetido na mesma área ignora ainda mais RD." },
        ] },
        { tier: 3, entries: [
          { name: "Penetração Total", type: "Golpe", action: "M", effect: "Remove toda a RD do alvo naquele golpe bem analisado." },
          { name: "Ponto Mortal", type: "Golpe", action: "M", effect: "Estocada letal contra alvo preso ou já exposto pela análise." },
        ] },
      ],
    },
    {
      weapon: "Rondel",
      style: "Presa",
      summary: "Primeiro imobiliza, depois perfura onde o corpo não protege.",
      levels: [
        { tier: 1, entries: [
          { name: "Agarrar e Ferir", type: "Golpe", action: "M", effect: "Prende e perfura no mesmo gesto, anulando esquiva do alvo." },
          { name: "Segurar o Pulso", type: "Controle", action: "m", effect: "Neutraliza a mão armada do oponente até escapar da disputa." },
        ] },
        { tier: 2, entries: [
          { name: "Derrubar e Perfurar", type: "Controle", action: "M", effect: "Joga o alvo no chão e ataca enquanto ele perde defesa." },
          { name: "Controle de Nuca", type: "Controle", action: "M", effect: "Transforma o rondel em ameaça de rendição ou execução." },
        ] },
        { tier: 3, entries: [
          { name: "Imobilização Mortal", type: "Controle", action: "M+m", effect: "Pino total com ponto vital já marcado e dano automático se ficar preso." },
          { name: "Execução de Duelo", type: "Golpe", action: "M", effect: "Finaliza alvo derrubado ou preso com dano muito ampliado." },
        ] },
      ],
    },
    {
      weapon: "Cimitarra",
      style: "Dança",
      summary: "Momentum circular que cresce a cada golpe conectado.",
      levels: [
        { tier: 1, entries: [
          { name: "Corte Circular", type: "Golpe", action: "M", effect: "Arco amplo que pode tocar dois alvos adjacentes." },
          { name: "Fluxo Livre", type: "Abertura", action: "m", effect: "Mantém a lâmina viva para baratear o ataque seguinte no turno." },
        ] },
        { tier: 2, entries: [
          { name: "Encadear", type: "Pressão", action: "M", effect: "Acertos sucessivos reduzem o custo do próximo golpe." },
          { name: "Desarme Cirúrgico", type: "Controle", action: "m", effect: "Golpeia a empunhadura para converter abertura em desarme." },
        ] },
        { tier: 3, entries: [
          { name: "Redemoinho", type: "Pressão", action: "M+m", effect: "Giro total que atinge toda a adjacência por ângulos ruins de defesa." },
          { name: "Fluxo Eterno", type: "Pressão", action: "M", effect: "Continua golpeando enquanto acerta, até falhar ou limpar a zona." },
        ] },
      ],
    },
    {
      weapon: "Cimitarra",
      style: "Duelo Árabe",
      summary: "Ângulos falsos, mão livre e desarme por surpresa.",
      levels: [
        { tier: 1, entries: [
          { name: "Ângulo Falso", type: "Golpe", action: "M", effect: "Começa em um eixo e termina em outro, piorando a defesa do alvo." },
          { name: "Mão Viva", type: "Reação", action: "sem custo", effect: "Usa a mão livre para desviar o braço inimigo e abrir contra-ataque." },
        ] },
        { tier: 2, entries: [
          { name: "Finta Aberta", type: "Abertura", action: "m", effect: "Consome a reação do alvo em falso e deixa o golpe real favorecido." },
          { name: "Corte em Oito", type: "Golpe", action: "M", effect: "Dois ângulos opostos para quebrar defesa preparada." },
        ] },
        { tier: 3, entries: [
          { name: "Maestria do Ângulo", type: "Golpe", action: "M", effect: "Ignora postura de escudo e pune quem reagiu defensivamente." },
          { name: "Desarme em Fluxo", type: "Controle", action: "M", effect: "Dois golpes em ritmo para arrancar a arma da linha do oponente." },
        ] },
      ],
    },
    {
      weapon: "Katana",
      style: "Iai",
      summary: "O saque já é o ataque; velocidade e intenção contam mais que volume.",
      levels: [
        { tier: 1, entries: [
          { name: "Saque Relâmpago", type: "Golpe", action: "m", effect: "Saca e ataca como ação menor, inclusive na iniciativa." },
          { name: "Corte de Saque", type: "Golpe", action: "M", effect: "Premia a arma embainhada com dano extra no primeiro corte." },
        ] },
        { tier: 2, entries: [
          { name: "Primeiro Corte", type: "Golpe", action: "M", effect: "Se o alvo não reagiu ainda, sangra mesmo sem crítico." },
          { name: "Saque Duplo", type: "Pressão", action: "m", effect: "Dois saques rápidos com penalidade, exigindo ritmo de embainhar." },
        ] },
        { tier: 3, entries: [
          { name: "Itomagoi", type: "Golpe", action: "M", effect: "Corte definitivo de Iai, devastador contra alvos desprevenidos." },
          { name: "Reflexo Perfeito", type: "Reação", action: "m", effect: "Responde ao ataque com um saque-ofensiva simultâneo." },
        ] },
      ],
    },
    {
      weapon: "Katana",
      style: "Kenjutsu",
      summary: "Postura, sequência e leitura disciplinada da distância.",
      levels: [
        { tier: 1, entries: [
          { name: "Postura de Guarda", type: "Abertura", action: "m", effect: "Troca ataque por defesa até o próximo turno sem travar a transição." },
          { name: "Corte Diagonal", type: "Golpe", action: "M", effect: "Corte natural que pressiona braços, ombro e reposicionamento." },
        ] },
        { tier: 2, entries: [
          { name: "Encadear Posturas", type: "Pressão", action: "M", effect: "Ataque saindo da postura defensiva, difícil de ler." },
          { name: "Pressão Mental", type: "Abertura", action: "m", effect: "Ameaça sem atacar e força o alvo a gastar reação por antecipação." },
        ] },
        { tier: 3, entries: [
          { name: "Sequência Completa", type: "Pressão", action: "M+m", effect: "Guarda, corte e retorno em um loop quase indecifrável." },
          { name: "Corte Perfeito", type: "Golpe", action: "M", effect: "Crítico automático quando o inimigo já mostrou defesa demais." },
        ] },
      ],
    },
    {
      weapon: "Espada Vitoriana",
      style: "Esgrima",
      summary: "Footwork, distância controlada e resposta precisa.",
      levels: [
        { tier: 1, entries: [
          { name: "Toque", type: "Golpe", action: "m", effect: "Estocada curta para revelar qual defesa o alvo prefere usar." },
          { name: "Recuar e Avançar", type: "Abertura", action: "m", effect: "Quebra o tempo do oponente e volta ao alcance sob outro ritmo." },
        ] },
        { tier: 2, entries: [
          { name: "Riposte", type: "Reação", action: "m", effect: "Esquiva e devolve a estocada antes da defesa se recompor." },
          { name: "Desengajar", type: "Abertura", action: "m", effect: "Move 1u sem gastar movimento completo e quebra pressão encadeada." },
        ] },
        { tier: 3, entries: [
          { name: "Sequência de Mestre", type: "Pressão", action: "M", effect: "Desvio, riposte e reposicionamento em fluxo único." },
          { name: "Finalização de Esgrima", type: "Golpe", action: "M", effect: "Fecha o duelo depois de acumular aberturas suficientes." },
        ] },
      ],
    },
    {
      weapon: "Espada Vitoriana",
      style: "Cavaleiro",
      summary: "Cortes pesados, escudo ativo e avanço de linha.",
      levels: [
        { tier: 1, entries: [
          { name: "Golpe Descendente", type: "Golpe", action: "M", effect: "Ataque forte que quebra escudo ou força recuo." },
          { name: "Escudo e Espada", type: "Abertura", action: "m", effect: "Usa o escudo para empurrar enquanto prepara a lâmina." },
        ] },
        { tier: 2, entries: [
          { name: "Golpe de Punho", type: "Golpe", action: "m", effect: "Atordoa com a guarda da espada para abrir o golpe principal." },
          { name: "Avanço de Linha", type: "Pressão", action: "M", effect: "Empurra com corpo, escudo e espada para desalojar a frente inimiga." },
        ] },
        { tier: 3, entries: [
          { name: "Quebrar a Linha", type: "Golpe", action: "M+m", effect: "Afasta o escudo alheio e golpeia o lado exposto." },
          { name: "Estampa de Cavaleiro", type: "Pressão", action: "M+m", effect: "Escudo mais dois golpes que empurram e fragilizam." },
        ] },
      ],
    },
    {
      weapon: "Espada Alexandrina",
      style: "Mão Única",
      summary: "Peso controlado com mão livre para escudo, magia ou impacto.",
      levels: [
        { tier: 1, entries: [
          { name: "Golpe Pesado 1M", type: "Golpe", action: "M", effect: "Aceita a penalidade da arma para manter utilidade na outra mão." },
          { name: "Usar a Guarda", type: "Golpe", action: "m", effect: "Converte a guarda em impacto curto e atordoamento leve." },
        ] },
        { tier: 2, entries: [
          { name: "Perfurar e Escudar", type: "Pressão", action: "M", effect: "Ataca e já fecha a linha defensiva com o escudo." },
          { name: "Investida", type: "Golpe", action: "M", effect: "Avança 2u para somar corpo e lâmina no mesmo choque." },
        ] },
        { tier: 3, entries: [
          { name: "Punho de Ferro", type: "Pressão", action: "M+m", effect: "Duas fontes de dano no mesmo turno, corte e impacto." },
          { name: "Domínio Unilateral", type: "Golpe", action: "M", effect: "Ataque mantendo a reação disponível, ou convertendo isso em vantagem depois." },
        ] },
      ],
    },
    {
      weapon: "Espada Alexandrina",
      style: "Duas Mãos",
      summary: "Zero penalidade, força máxima e domínio do espaço à frente.",
      levels: [
        { tier: 1, entries: [
          { name: "Golpe Poderoso", type: "Golpe", action: "M+m", effect: "Extrai o dano máximo da arma e já pressiona armadura média." },
          { name: "Pressionar", type: "Pressão", action: "M", effect: "O alcance da espada impede avanço seguro do alvo." },
        ] },
        { tier: 2, entries: [
          { name: "Corte Profundo", type: "Golpe", action: "M+m", effect: "Vai além da superfície e ignora parte relevante da RD." },
          { name: "Varredura Lateral", type: "Golpe", action: "M", effect: "Pega dois alvos adjacentes com amplitude total." },
        ] },
        { tier: 3, entries: [
          { name: "Golpe Definitivo", type: "Golpe", action: "M+m", effect: "Atinge o ápice da arma, ainda melhor contra alvos já fragilizados." },
          { name: "Domínio de Dois Metros", type: "Pressão", action: "M", effect: "Transforma 2u ao redor em zona de dano de oportunidade." },
        ] },
      ],
    },
    {
      weapon: "Lança",
      style: "Formação",
      summary: "Disciplina de linha, zona de ameaça e sincronia com aliados.",
      levels: [
        { tier: 1, entries: [
          { name: "Estocada de Linha", type: "Golpe", action: "M", effect: "Em formação, dois lançeiros podem atacar juntos sem custo extra." },
          { name: "Manter Distância", type: "Reação", action: "sem custo", effect: "Punir avanço para dentro de 2u com dano de oportunidade." },
        ] },
        { tier: 2, entries: [
          { name: "Muro de Lanças", type: "Pressão", action: "M", effect: "Com aliado, cria frente onde qualquer avanço recebe dano automático." },
          { name: "Desvio Coordenado", type: "Reação", action: "m", effect: "Desvia para o lado e entrega o contra-ataque ao companheiro." },
        ] },
        { tier: 3, entries: [
          { name: "Avalanche de Hastes", type: "Pressão", action: "M+m", effect: "Dois ou mais lançeiros focam o mesmo alvo e travam sua esquiva." },
          { name: "Linha Inquebrável", type: "Abertura", action: "M", effect: "Com 3+ lanças, cria barreira quase impossível de atravessar." },
        ] },
      ],
    },
    {
      weapon: "Lança",
      style: "Caçador",
      summary: "Solo, móvel e versátil; uma arma para perseguir criaturas.",
      levels: [
        { tier: 1, entries: [
          { name: "Arremesso Controlado", type: "Golpe", action: "M", effect: "Arremessa sem perder totalmente a transição para o próximo modo." },
          { name: "Guardar Distância Solo", type: "Abertura", action: "m", effect: "Sem aliados, mantém adjacência hostil sob risco constante." },
        ] },
        { tier: 2, entries: [
          { name: "Estocada Perfurante", type: "Golpe", action: "M", effect: "Concentra o corpo inteiro na ponta e apaga RD leve." },
          { name: "Giro de Haste", type: "Golpe", action: "M", effect: "Usa o outro lado da lança como impacto surpresa." },
        ] },
        { tier: 3, entries: [
          { name: "Caçada", type: "Pressão", action: "M", effect: "Segue cada recuo com avanço gratuito e nova pressão." },
          { name: "Explosão de Haste", type: "Golpe", action: "M+m", effect: "Arremessa e já troca para arma secundária no mesmo turno." },
        ] },
      ],
    },
    {
      weapon: "Naginata",
      style: "Defesa em Alcance",
      summary: "Transforma 2u de distância em muralha ofensiva.",
      levels: [
        { tier: 1, entries: [
          { name: "Barreira de Lâmina", type: "Abertura", action: "m", effect: "Qualquer avanço inimigo dentro de 2u passa a pagar em sangue." },
          { name: "Desvio de Haste", type: "Reação", action: "sem custo", effect: "Deflete ataques médios e já prepara o contra-ataque." },
        ] },
        { tier: 2, entries: [
          { name: "Manter no Alcance", type: "Pressão", action: "M", effect: "Ataca e recua, mantendo a distância ideal mesmo sob pressão." },
          { name: "Contra-Ataque de Alcance", type: "Reação", action: "m", effect: "Pune o avanço do alvo com o momentum dele." },
        ] },
        { tier: 3, entries: [
          { name: "Zona Proibida", type: "Pressão", action: "M+m", effect: "Por uma rodada, entrar em 2u passa a causar dano automático." },
          { name: "Resposta Perfeita", type: "Reação", action: "m", effect: "Bloqueia ou esquiva e devolve corte com vantagem." },
        ] },
      ],
    },
    {
      weapon: "Naginata",
      style: "Fluxo",
      summary: "Movimento perpétuo, vários ângulos e ritmo imprevisível.",
      levels: [
        { tier: 1, entries: [
          { name: "Varredura Baixa", type: "Golpe", action: "M", effect: "Corte rente ao chão que tropeça ou desalinha a próxima ação." },
          { name: "Mudar o Ângulo", type: "Abertura", action: "m", effect: "Troca o eixo do próximo golpe sem dar telegraph ao alvo." },
        ] },
        { tier: 2, entries: [
          { name: "Corte em Cruz", type: "Golpe", action: "M", effect: "Dois ângulos opostos em sequência forçando dupla defesa." },
          { name: "Fluxo de Lâmina", type: "Pressão", action: "M+m", effect: "Mantém a arma viva entre ataques e soma abertura a cada acerto." },
        ] },
        { tier: 3, entries: [
          { name: "Tempestade de Cortes", type: "Pressão", action: "M+m", effect: "Quatro cortes em ângulos diferentes, inclusive contra dois alvos." },
          { name: "Desarme em Fluxo", type: "Controle", action: "M", effect: "Prende arma adversária entre haste e lâmina para arrancá-la." },
        ] },
      ],
    },
    {
      weapon: "Odachi",
      style: "Corte Absoluto",
      summary: "Poucos golpes, cada um com preparação e intenção total.",
      levels: [
        { tier: 1, entries: [
          { name: "O Único Golpe", type: "Golpe", action: "M+m", effect: "Toda a leitura do turno em um corte com vantagem." },
          { name: "Postura de Espera", type: "Abertura", action: "m", effect: "Acumula poder para o próximo ataque ao custo de exposição." },
        ] },
        { tier: 2, entries: [
          { name: "Momento Perfeito", type: "Golpe", action: "M+m", effect: "Libera o corte máximo depois de um ou dois turnos de espera." },
          { name: "Atravessar", type: "Golpe", action: "M+m", effect: "Cruza a linha inteira de 2u e atinge dois alvos em linha." },
        ] },
        { tier: 3, entries: [
          { name: "Corte Mitológico", type: "Golpe", action: "M+m", effect: "Versão máxima do odachi, capaz de despedaçar armadura e alvo." },
          { name: "Inevitabilidade", type: "Abertura", action: "M", effect: "Declara o golpe de tal forma que a defesa já nasce quebrada." },
        ] },
      ],
    },
    {
      weapon: "Odachi",
      style: "Varredura",
      summary: "Comprimento extremo para limpar espaço e punir zonas inteiras.",
      levels: [
        { tier: 1, entries: [
          { name: "Varredura de Dois Metros", type: "Golpe", action: "M+m", effect: "Semicírculo que atinge todos em 2u com dano cheio." },
          { name: "Manter Afastado", type: "Abertura", action: "m", effect: "Cria zona de exclusão onde avanço custa oportunidade." },
        ] },
        { tier: 2, entries: [
          { name: "Dupla Varredura", type: "Pressão", action: "M+m", effect: "Horizontal e vertical em seguida, obrigando o alvo a duas respostas." },
          { name: "Quebrar Escudos", type: "Golpe", action: "M+m", effect: "Despreza bloqueio e transfere a brutalidade ao portador do escudo." },
        ] },
        { tier: 3, entries: [
          { name: "Horizonte Vazio", type: "Pressão", action: "M+m", effect: "Três varreduras para esvaziar toda a frente do portador." },
          { name: "Giro Total", type: "Golpe", action: "M+m", effect: "360° em espaço aberto, ameaçando todos os lados de uma vez." },
        ] },
      ],
    },
    {
      weapon: "Zweihander",
      style: "Meia-Espada",
      summary: "Segurar a lâmina para transformar a espada em ferramenta de controle.",
      levels: [
        { tier: 1, entries: [
          { name: "Morder a Lâmina", type: "Abertura", action: "m", effect: "Entra no modo curto para controle e impacto de guarda." },
          { name: "Golpe de Cruzeiro", type: "Golpe", action: "M", effect: "Usa a guarda como martelo e entrega fragilizar com atordoamento leve." },
        ] },
        { tier: 2, entries: [
          { name: "Alavanca", type: "Controle", action: "M", effect: "Converte o comprimento da arma em derrubada ou desarme." },
          { name: "Perfurar com a Ponta", type: "Golpe", action: "M+m", effect: "Estocada de precisão máxima contra armadura." },
        ] },
        { tier: 3, entries: [
          { name: "Domínio Próximo", type: "Pressão", action: "M+m", effect: "Guarda, alavanca e ponta em uma combinação curta e brutal." },
          { name: "Transição de Modo", type: "Abertura", action: "L", effect: "Alterna entre meia-espada e modo total sem custo." },
        ] },
      ],
    },
    {
      weapon: "Zweihander",
      style: "Devastação",
      summary: "Amplitude máxima, empurrão e fragilização em escala de campo.",
      levels: [
        { tier: 1, entries: [
          { name: "Golpe de Autoridade", type: "Golpe", action: "M+m", effect: "Empurra, machuca e já começa a fragilizar." },
          { name: "Quebradora", type: "Golpe", action: "M+m", effect: "Arranca escudos e barreiras leves da luta." },
        ] },
        { tier: 2, entries: [
          { name: "Limpar o Caminho", type: "Pressão", action: "M+m", effect: "Empurra toda a adjacência e desorganiza formação." },
          { name: "Golpe de Terra", type: "Golpe", action: "M+m", effect: "Bate no chão para derrubar em área com shockwave." },
        ] },
        { tier: 3, entries: [
          { name: "Devastação Total", type: "Pressão", action: "M+m", effect: "Série que acelera o fragilizar até colapso completo." },
          { name: "A Última Palavra", type: "Golpe", action: "M+m", effect: "Carrega um turno e libera o veredito final da arma." },
        ] },
      ],
    },
    {
      weapon: "Machado de Guerra",
      style: "Fenda",
      summary: "Aposta tudo no corte absoluto contra armadura, escudo e corpo.",
      levels: [
        { tier: 1, entries: [
          { name: "Golpe Brutal", type: "Golpe", action: "M+m", effect: "Entrega o pacote total do machado: potência, peso e fragilização." },
          { name: "Fender Escudo", type: "Golpe", action: "M+m", effect: "Converte o golpe em antiescudo pesado e destrutivo." },
        ] },
        { tier: 2, entries: [
          { name: "Cortar Através", type: "Golpe", action: "M+m", effect: "Excesso de dano continua para um segundo alvo adjacente." },
          { name: "Golpe Descendente", type: "Golpe", action: "M+m", effect: "Une dano, derrubada e sangramento grave no mesmo arco." },
        ] },
        { tier: 3, entries: [
          { name: "Dividir ao Meio", type: "Golpe", action: "M+m", effect: "Carrega e libera um corte monstruoso, pior ainda contra alvo fragilizado." },
          { name: "Rota Sangrenta", type: "Pressão", action: "M+m", effect: "Avança cortando tudo no trajeto de 3u." },
        ] },
      ],
    },
    {
      weapon: "Machado de Guerra",
      style: "Pressão Bruta",
      summary: "Vence pelo desgaste: empurrar, quebrar defesa e não parar de vir.",
      levels: [
        { tier: 1, entries: [
          { name: "Avanço Imparável", type: "Pressão", action: "M", effect: "Avança golpeando e desloca quem tenta resistir no caminho." },
          { name: "Desestabilizar", type: "Golpe", action: "M", effect: "Usa o peso para derrubar ou empurrar sem focar em dano puro." },
        ] },
        { tier: 2, entries: [
          { name: "Não Para", type: "Pressão", action: "M+m", effect: "Dois golpes seguidos sem deixar o alvo respirar." },
          { name: "Esmagar a Defesa", type: "Golpe", action: "M+m", effect: "Sobrepõe bloqueio e faz o próprio bloqueador pagar por ele." },
        ] },
        { tier: 3, entries: [
          { name: "Moedor de Carne", type: "Pressão", action: "M+m", effect: "Três golpes pesados que empilham fragilizar muito rápido." },
          { name: "Inevitável", type: "Pressão", action: "M", effect: "Avança 2u ignorando interrupções menores e limpando o eixo." },
        ] },
      ],
    },
    {
      weapon: "Martelo de Guerra",
      style: "Demolidor",
      summary: "A armadura é o alvo; o corpo sofre como consequência.",
      levels: [
        { tier: 1, entries: [
          { name: "Martelar Armadura", type: "Golpe", action: "M+m", effect: "Reduz RD de armadura de forma cumulativa, sobretudo pesada." },
          { name: "Impacto Profundo", type: "Golpe", action: "M+m", effect: "Metade da proteção não basta contra a transferência de impacto." },
        ] },
        { tier: 2, entries: [
          { name: "Britador de Placas", type: "Golpe", action: "M+m", effect: "Duas pancadas na mesma peça já podem inutilizá-la." },
          { name: "Cadeia de Impacto", type: "Pressão", action: "M+m", effect: "Segundo golpe amplificado no ponto já comprometido." },
        ] },
        { tier: 3, entries: [
          { name: "Demolição Completa", type: "Golpe", action: "M+m", effect: "Combina fragilizar máximo com atordoamento e colapso de peça." },
          { name: "Último Golpe", type: "Golpe", action: "M+m", effect: "Versão carregada e decisiva do martelo, com enorme escalada contra fragilizado." },
        ] },
      ],
    },
    {
      weapon: "Martelo de Guerra",
      style: "Terremoto",
      summary: "Troca o alvo pelo chão e transforma a área em desastre.",
      levels: [
        { tier: 1, entries: [
          { name: "Bater no Chão", type: "Golpe", action: "M+m", effect: "Shockwave curta que derruba em área com dano baixo." },
          { name: "Empurrão de Onda", type: "Golpe", action: "M+m", effect: "Manda o alvo mais longe e ainda converte colisão em dano." },
        ] },
        { tier: 2, entries: [
          { name: "Cascata de Quedas", type: "Golpe", action: "M+m", effect: "Golpe no chão entre dois alvos para derrubar ambos." },
          { name: "Onda de Choque", type: "Pressão", action: "M", effect: "Vibração crescente em 4u que mina testes físicos." },
        ] },
        { tier: 3, entries: [
          { name: "Terremoto Local", type: "Golpe", action: "M+m", effect: "Queda em área maior, com rachaduras e terreno ruim." },
          { name: "Fim do Mundo", type: "Pressão", action: "M+m", effect: "Dois golpes de chão e um golpe final no alvo principal." },
        ] },
      ],
    },
    {
      weapon: "Kusarigama",
      style: "Kama",
      summary: "A foice curva trabalha ângulo, gancho e pressão de curta distância.",
      levels: [
        { tier: 1, entries: [
          { name: "Gancho", type: "Golpe", action: "m", effect: "Puxa ou desequilibra com a curva da lâmina." },
          { name: "Pressão Circular", type: "Abertura", action: "m", effect: "Arco de foice que rompe guarda e força reposicionamento." },
          { name: "Aparar com a Haste", type: "Reação", action: "sem custo", effect: "Desvia leves e médios, já deixando contra-ataque disponível." },
        ] },
        { tier: 2, entries: [
          { name: "Corte em Retorno", type: "Golpe", action: "M", effect: "Vai e volta no mesmo gesto, no mesmo alvo ou em dois." },
          { name: "Enganchar Membro", type: "Controle", action: "M", effect: "Prende braço ou perna e impõe penalidade até escapar." },
          { name: "Contra-Golpe", type: "Reação", action: "m", effect: "Depois do aparo, responde sem dar reação defensiva." },
        ] },
        { tier: 3, entries: [
          { name: "Dança da Foice", type: "Pressão", action: "M+m", effect: "Sequência em arco que reduz defesa a cada acerto." },
          { name: "Enganchar e Puxar Arma", type: "Controle", action: "M", effect: "Tenta arrancar a arma da mão do oponente." },
        ] },
      ],
    },
    {
      weapon: "Kusarigama",
      style: "Kunai/Kusari",
      summary: "A corrente é o espaço e a kunai é o dente que fecha o controle.",
      levels: [
        { tier: 1, entries: [
          { name: "Arremesso", type: "Golpe", action: "M", effect: "Lança a kunai e barateia a próxima técnica de corrente." },
          { name: "Chicote de Corrente", type: "Golpe", action: "m", effect: "Ataque rápido de curta distância sem soltar a kunai." },
          { name: "Girar e Manter Distância", type: "Abertura", action: "m", effect: "Cria uma ameaça circular contra avanço precipitado." },
        ] },
        { tier: 2, entries: [
          { name: "Puxão", type: "Controle", action: "m", effect: "Depois do arremesso, puxa, desequilibra ou derruba." },
          { name: "Recolhimento Veloz", type: "Livre", action: "L", effect: "Traz a kunai de volta sem pagar ação, uma vez por turno." },
          { name: "Enrolar Membro", type: "Controle", action: "M", effect: "Prende braço ou perna com a corrente." },
        ] },
        { tier: 3, entries: [
          { name: "Estrangular", type: "Controle", action: "M+m", effect: "Fecha a corrente no torso ou pescoço e inicia pressão contínua." },
          { name: "Kunai Fantasma", type: "Golpe", action: "M", effect: "Finta com a foice e lança a kunai quando o alvo já reagiu errado." },
          { name: "Corrente Viva", type: "Reação", action: "m", effect: "Desvia projéteis ou armas arremessadas que você viu vir." },
        ] },
      ],
    },
    {
      weapon: "Kusarigama",
      style: "Seiryu",
      synthesis: true,
      requirements: "Requer Afinidade 2+ em Kama e 2+ em Kunai/Kusari.",
      summary: "Sem começo nem fim: melee, alcance e controle passam um para o outro sem ruptura.",
      levels: [
        { tier: 3, entries: [
          { name: "Fio e Foice", type: "Pressão", action: "M", effect: "Kunai abre, corrente alavanca e a foice entra com dano ampliado." },
          { name: "Redemoinho Azul", type: "Pressão", action: "M+m", effect: "Corrente vira zona de ameaça enquanto a foice corta em espiral." },
          { name: "Resposta Dupla", type: "Reação", action: "m", effect: "Contra-ataca com foice e prende com a corrente na mesma reação." },
        ] },
      ],
    },
    {
      weapon: "Arco Curto",
      style: "Disparo Móvel",
      summary: "Nunca estático; movimento é defesa e ataque ao mesmo tempo.",
      levels: [
        { tier: 1, entries: [
          { name: "Atirar e Mover", type: "Golpe", action: "M", effect: "Combina 1u de deslocamento e disparo em qualquer ordem." },
          { name: "Recuar Atirando", type: "Golpe", action: "m", effect: "Dispara enquanto recua, trocando precisão por mobilidade." },
        ] },
        { tier: 2, entries: [
          { name: "Círculo de Fogo", type: "Pressão", action: "M", effect: "Move em arco e obriga o alvo a girar sob tiros de vários ângulos." },
          { name: "Flecha em Movimento", type: "Golpe", action: "M", effect: "Disparo veloz e difícil de rastrear." },
        ] },
        { tier: 3, entries: [
          { name: "Fantasma Arqueiro", type: "Pressão", action: "M+m", effect: "Move 3u e atira duas vezes a partir de posições diferentes." },
          { name: "Mover, Atirar, Desaparecer", type: "Golpe", action: "M", effect: "Sai da cobertura, atira e some antes do contra-ataque." },
        ] },
      ],
    },
    {
      weapon: "Arco Curto",
      style: "Saraivada",
      summary: "Saturação acima de precisão; volume suficiente para quebrar leitura defensiva.",
      levels: [
        { tier: 1, entries: [
          { name: "Tiro Rápido", type: "Golpe", action: "m", effect: "Disparo menor com perda leve de qualidade e ótima economia." },
          { name: "Dois Tiros", type: "Pressão", action: "M", effect: "Dois disparos no mesmo alvo explorando a abertura do primeiro." },
        ] },
        { tier: 2, entries: [
          { name: "Dispersão", type: "Pressão", action: "M", effect: "Espalha três flechas entre vários alvos em curto alcance." },
          { name: "Cobrir Aliado", type: "Abertura", action: "M", effect: "Satura a área próxima ao aliado para atrapalhar quem o pressiona." },
        ] },
        { tier: 3, entries: [
          { name: "Tempestade de Flechas", type: "Pressão", action: "M+m", effect: "Saturação contínua sobre área fechada durante dois tempos encadeados." },
          { name: "Tiro Decisivo", type: "Golpe", action: "M", effect: "Depois da saraivada, encontra o ângulo que o alvo não esperava mais." },
        ] },
      ],
    },
    {
      weapon: "Arco Longo",
      style: "Precisão",
      summary: "Um tiro, um resultado; a distância vira soberania.",
      levels: [
        { tier: 1, entries: [
          { name: "Mirar", type: "Abertura", action: "m ou M", effect: "Mira rápida ou plena para elevar acerto e destravar técnicas de parte." },
          { name: "Tiro de Longa Distância", type: "Golpe", action: "M", effect: "Ganhos de dano quando o disparo vem do alcance alto da arma." },
        ] },
        { tier: 2, entries: [
          { name: "Perfurar a Cobertura", type: "Golpe", action: "M", effect: "Mira plena para apagar cobertura leve e parcial." },
          { name: "Tiro de Parte", type: "Golpe", action: "M", effect: "Mira plena para mirar membros com penalidades reduzidas." },
        ] },
        { tier: 3, entries: [
          { name: "Tiro Cirúrgico", type: "Golpe", action: "M", effect: "Dois tempos de mira para acertar parte com crítico automático." },
          { name: "Penetração Total", type: "Golpe", action: "M", effect: "Mira plena e máxima distância para ignorar armaduras leves e parte das médias." },
        ] },
      ],
    },
    {
      weapon: "Arco Longo",
      style: "Cobertura",
      summary: "Controla campo por posição, supressão e ameaça de área.",
      levels: [
        { tier: 1, entries: [
          { name: "Tiro de Supressão", type: "Abertura", action: "M", effect: "Faz o alvo se cobrir mesmo sem buscar acerto direto." },
          { name: "Posição Elevada", type: "Abertura", action: "m", effect: "Altura vira acerto, dano e proteção relativa." },
        ] },
        { tier: 2, entries: [
          { name: "Fogo Cerrado", type: "Pressão", action: "M", effect: "Quem tentar se mover atravessa fogo de oportunidade." },
          { name: "Tiro de Área", type: "Pressão", action: "M", effect: "Distribui flechas numa zona de 2u para travar avanço." },
        ] },
        { tier: 3, entries: [
          { name: "Volley", type: "Pressão", action: "M+m", effect: "Arco alto sobre uma área de 3u, ignorando cobertura horizontal." },
          { name: "Controle Total", type: "Pressão", action: "M", effect: "Soma posição, supressão e fogo cerrado em domínio local por 1 rodada." },
        ] },
      ],
    },
    {
      weapon: "Balestra",
      style: "Anti-Armadura",
      summary: "Cada virote é uma sentença contra proteção pesada.",
      levels: [
        { tier: 1, entries: [
          { name: "Penetração Básica", type: "Golpe", action: "M", effect: "Remove bastante RD, sobretudo em alvos muito protegidos." },
          { name: "Mira Antecipada", type: "Abertura", action: "m ou M", effect: "Melhora acerto e libera as técnicas pesadas da arma." },
        ] },
        { tier: 2, entries: [
          { name: "Virote Perfurante", type: "Golpe", action: "M", effect: "Mira plena para atravessar quase toda proteção comum." },
          { name: "Buscar a Junta", type: "Golpe", action: "M", effect: "Rondel à distância: encontra a falha da armadura pesada." },
        ] },
        { tier: 3, entries: [
          { name: "Desmontagem", type: "Golpe", action: "M", effect: "Desativa uma peça específica de armadura com um virote preparado." },
          { name: "Tiro Definitivo", type: "Golpe", action: "M", effect: "Recarga e mira prévias viram dano triplicado e crítico certo." },
        ] },
      ],
    },
    {
      weapon: "Balestra",
      style: "Precisão Calculada",
      summary: "Lentidão convertida em informação e sentença única.",
      levels: [
        { tier: 1, entries: [
          { name: "Calcular o Tiro", type: "Abertura", action: "M", effect: "Lê padrão de movimento para apagar bônus de mobilidade." },
          { name: "Tiro de Parte Calculado", type: "Golpe", action: "M", effect: "Parte sem penalidade após análise; com mira plena, crítico automático." },
        ] },
        { tier: 2, entries: [
          { name: "Emboscada Balística", type: "Golpe", action: "M", effect: "Disparo furtivo após mira plena, letal contra alvo desprevenido." },
          { name: "Dois Alvos em Linha", type: "Golpe", action: "M", effect: "Virote atravessa o primeiro e ainda castiga o segundo." },
        ] },
        { tier: 3, entries: [
          { name: "O Único Tiro", type: "Golpe", action: "M", effect: "Tudo foi montado para um único virote perfeito." },
          { name: "Reposicionamento Tático", type: "Abertura", action: "m", effect: "Depois do tiro, some para outro ponto antes da recarga." },
        ] },
      ],
    },
    {
      weapon: "Revólver",
      style: "Duelo",
      summary: "Seis oportunidades, cada uma mais importante que a anterior.",
      levels: [
        { tier: 1, entries: [
          { name: "Primeiro Tiro", type: "Golpe", action: "m", effect: "Mira rápida e dispara cedo, inclusive na disputa de iniciativa." },
          { name: "Contar as Balas", type: "Abertura", action: "L", effect: "Usa a leitura do tambor para manipular a coragem do inimigo." },
        ] },
        { tier: 2, entries: [
          { name: "Tiro Duplo", type: "Pressão", action: "M", effect: "Dois disparos na mesma linha de mira, com leve perda no segundo." },
          { name: "Gatilho Preparado", type: "Abertura", action: "m", effect: "Pré-arma a arma e ganha mira rápida sem custo depois." },
        ] },
        { tier: 3, entries: [
          { name: "Tiro de Duelo", type: "Golpe", action: "M", effect: "Mira plena e primeiro disparo do turno para crítico automático." },
          { name: "Fan the Hammer", type: "Pressão", action: "M+m", effect: "Volume bruto de quatro tiros, sacrificando precisão." },
        ] },
      ],
    },
    {
      weapon: "Revólver",
      style: "Controle Tático",
      summary: "Ferramenta de espaço, aviso e supressão mais do que de execução direta.",
      levels: [
        { tier: 1, entries: [
          { name: "Tiro de Aviso", type: "Abertura", action: "m", effect: "Força cobertura e hesitação sem buscar impacto direto." },
          { name: "Cobertura de Retirada", type: "Abertura", action: "m", effect: "Cobre o recuo de aliado e dificulta perseguição." },
        ] },
        { tier: 2, entries: [
          { name: "Disparo de Supressão", type: "Pressão", action: "M", effect: "Semeia uma zona onde avançar vira mau negócio." },
          { name: "Tiro no Escuro", type: "Golpe", action: "m", effect: "Atira por ruído ou movimento em baixa visibilidade." },
        ] },
        { tier: 3, entries: [
          { name: "Último Tiro Certeiro", type: "Golpe", action: "M", effect: "Com uma bala restante e mira plena, o tiro vira clímax." },
          { name: "Tiro Ricochete", type: "Golpe", action: "M", effect: "Usa obstáculo para alcançar quem achou que estava intocável." },
        ] },
      ],
    },
    {
      weapon: "Pistola",
      style: "Assalto Próximo",
      summary: "Carregador maior, vários disparos e avanço constante.",
      levels: [
        { tier: 1, entries: [
          { name: "Disparar em Movimento", type: "Golpe", action: "M", effect: "Atira durante deslocamento curto e dificulta leitura da origem." },
          { name: "Dois Alvos", type: "Pressão", action: "M", effect: "Divide disparos entre dois inimigos em alcance útil." },
        ] },
        { tier: 2, entries: [
          { name: "Rajada Controlada", type: "Pressão", action: "M+m", effect: "Três disparos no mesmo alvo, com abertura acumulando no terceiro." },
          { name: "Suprimir e Avançar", type: "Pressão", action: "M", effect: "Força cobertura enquanto você encurta a distância." },
        ] },
        { tier: 3, entries: [
          { name: "Esvaziar o Carregador", type: "Pressão", action: "M+m", effect: "Seis disparos em área curta, cobrando esquiva de todos." },
          { name: "Ponto Final", type: "Golpe", action: "M", effect: "Depois de suprimir, encontra o ângulo que ignora a cobertura." },
        ] },
      ],
    },
    {
      weapon: "Pistola",
      style: "Utilitária",
      summary: "Apoio tático, cobertura de aliados e criação de pânico pontual.",
      levels: [
        { tier: 1, entries: [
          { name: "Cobertura de Aliado", type: "Abertura", action: "m", effect: "Quem atacar o aliado passa antes pela sua ameaça." },
          { name: "Atenção Desviada", type: "Abertura", action: "m", effect: "Força o inimigo a olhar para você e libera vantagem ao aliado." },
        ] },
        { tier: 2, entries: [
          { name: "Zona Negada", type: "Pressão", action: "M", effect: "Por 1 turno, mover naquela área cobra resistência ou dano." },
          { name: "Trocar de Posição", type: "Abertura", action: "m", effect: "Reposiciona enquanto atira para sustentar o time." },
        ] },
        { tier: 3, entries: [
          { name: "Criar Pânico", type: "Pressão", action: "M", effect: "Série de disparos que manda um grupo inteiro para cobertura." },
          { name: "Execução Tática", type: "Golpe", action: "M", effect: "Converte alvo já derrubado ou imobilizado em disparo perfeito." },
        ] },
      ],
    },
    {
      weapon: "Rifle de Assalto",
      style: "Assalto",
      summary: "Pressão agressiva em avanço, limpando espaço sob fogo próprio.",
      levels: [
        { tier: 1, entries: [
          { name: "Fogo em Movimento", type: "Golpe", action: "M", effect: "Avança 2u enquanto dispara e obriga o inimigo a baixar a cabeça." },
          { name: "Rafada Curta", type: "Pressão", action: "m", effect: "Dois disparos rápidos como ação menor para acelerar o turno." },
        ] },
        { tier: 2, entries: [
          { name: "Avançar Suprimindo", type: "Pressão", action: "M", effect: "Avança sob série de disparos que trava toda a frente." },
          { name: "Limpar o Cômodo", type: "Pressão", action: "M+m", effect: "Varre uma faixa ampla em espaço fechado." },
        ] },
        { tier: 3, entries: [
          { name: "Rafada Total", type: "Pressão", action: "M+m", effect: "Esvazia muita munição para negar uma área de 3u." },
          { name: "Entrada Violenta", type: "Pressão", action: "M", effect: "Avança sem temer a primeira reação e dispara com vantagem na chegada." },
        ] },
      ],
    },
    {
      weapon: "Rifle de Assalto",
      style: "Cobertura Tática",
      summary: "Domínio de terreno por fogo de cobertura e supressão arquitetada.",
      levels: [
        { tier: 1, entries: [
          { name: "Posição de Cobertura", type: "Abertura", action: "m", effect: "Melhora defesa e estabilidade de tiro a partir da cobertura." },
          { name: "Fogo de Supressão", type: "Pressão", action: "M", effect: "Quem agir ou mover sem respeitar a zona paga com dano automático." },
        ] },
        { tier: 2, entries: [
          { name: "Controlar Zona", type: "Pressão", action: "M", effect: "Marca uma área de 3u com fogo de oportunidade." },
          { name: "Cobertura para Aliados", type: "Abertura", action: "M", effect: "Aliados se reposicionam sob seu fogo de proteção." },
        ] },
        { tier: 3, entries: [
          { name: "Supremacia de Fogo", type: "Pressão", action: "M+m", effect: "Controla toda a frente próxima por uma rodada inteira." },
          { name: "Reposicionamento Tático", type: "Abertura", action: "M", effect: "Troca posição durante a recarga e ainda reorganiza o grupo." },
        ] },
      ],
    },
    {
      weapon: "Sniper",
      style: "Francotirador",
      summary: "Mira obrigatória, posicionamento e o tiro que decide o combate.",
      levels: [
        { tier: 1, entries: [
          { name: "Mira Obrigatória", type: "Abertura", action: "M ou C", effect: "Sem mira a sniper cai muito; com ela começa a existir." },
          { name: "Respiração Controlada", type: "Abertura", action: "m", effect: "Apaga penalidades leves de ambiente e deslocamento." },
        ] },
        { tier: 2, entries: [
          { name: "Tiro de Precisão", type: "Golpe", action: "M", effect: "Mira plena para tratar partes como ataques normais." },
          { name: "Antecipar Movimento", type: "Abertura", action: "M", effect: "Observa o padrão do alvo para anular mobilidade e cobertura parcial." },
        ] },
        { tier: 3, entries: [
          { name: "Abater", type: "Golpe", action: "M", effect: "Mira sustentada de 2+ turnos para crítico ampliado e dano extra." },
          { name: "Tiro Definitivo", type: "Golpe", action: "M", effect: "Setup máximo: dano máximo, sem defesa efetiva, abate automático." },
        ] },
      ],
    },
    {
      weapon: "Sniper",
      style: "Observador",
      summary: "Informação, controle de saída e terror antes do disparo letal.",
      levels: [
        { tier: 1, entries: [
          { name: "Reconhecimento", type: "Abertura", action: "M", effect: "Mapeia 40u e entrega leitura tática para o grupo." },
          { name: "Marcar Alvo", type: "Abertura", action: "m", effect: "Marca um inimigo para facilitar o acerto dos aliados." },
        ] },
        { tier: 2, entries: [
          { name: "Atirar para Revelar", type: "Golpe", action: "m", effect: "Força alvo oculto a se mover ou correr risco real." },
          { name: "Negar Saída", type: "Pressão", action: "M", effect: "Converte uma rota específica em linha de morte." },
        ] },
        { tier: 3, entries: [
          { name: "Terror Psicológico", type: "Pressão", action: "M", effect: "Assusta grupo inimigo com tiros de aviso quase letais." },
          { name: "Autoridade de Alcance", type: "Abertura", action: "M", effect: "Com posição e mira sustentada, ninguém se move livremente." },
        ] },
      ],
    },
  ],

  PDF_SOURCE_GUIDES: [
    { name: "UnheaveN_ERA_Palimpsest.pdf", scope: "Livro base", status: "Base de pilares, recursos, condicoes e combate." },
    { name: "UnheaveN_ERA_Palimpsest_v3_KW.pdf", scope: "Manifestacoes v3-KW", status: "Escala canonica de dano/cura e bonus por KW Total." },
    { name: "UnheaveN_Manifestacoes_KW.pdf", scope: "Manifestacoes KW", status: "Fluxo de criacao, acumulo de keywords e custo PE total." },
    { name: "UnheaveN_ERA_Guia_Avancado_v300.pdf", scope: "Guia avancado v3.0", status: "Formas, propriedades, pre-requisitos, projetos e reliquias." },
    { name: "PALIMPSEST_GUIA_AVANCADO.pdf", scope: "Guia avancado", status: "Referencia expandida de manifestacoes, condicoes e extensoes." },
    { name: "guia_manifestacoes_expansao_avancada_KW.pdf", scope: "Expansao KW", status: "Combos, formas avancadas e leitura de KW em jogo." },
    { name: "guia_armas_v276_compacto.pdf", scope: "Armas v2.7.6", status: "Estilos, afinidades, tecnicas e identidade de armas." },
    { name: "PALIMPSEST_EXPANSAO_COMBATE.pdf", scope: "Expansao de combate", status: "Pressao por HP, execucao, dano contextual e sniper." },
  ],

  KW_GUIDE: {
    principles: [
      "KW mede peso conceitual da Manifestacao; nao e o custo de PE por si so.",
      "KW Total soma Elementos, Formas e Propriedades usados.",
      "Dano/Cura final = escala base por Tier + Amplificacao + bonus KW + Progresso Interno/Efetivo.",
      "PE Total = custo dos Elementos + Formas + Propriedades + PE de Amplificacao.",
      "Manifestacoes sustentadas custam metade do KW base por turno como PE de sustento.",
      "Se KW Total passar de 10 sem Maestria em Afinidade, teste Domínio DT 6 para controlar.",
    ],
    flow: [
      { step: "1", action: "Some os Keywords", detail: "Liste Elementos, Formas e Propriedades; some KW e custos de PE." },
      { step: "2", action: "Defina Amplificacao", detail: "Escolha quanto PE extra injeta; consulte a faixa de escala." },
      { step: "3", action: "Calcule PE Total", detail: "Custo Keywords + PE de Amplificacao. Isso define a acao usada." },
      { step: "4", action: "Escala base", detail: "Use Tier de Dominio e faixa de Amplificacao para dano/cura base." },
      { step: "5", action: "Bonus KW", detail: "Adicione os dados do KW Total, herdando o tipo da escala base." },
      { step: "6", action: "Role e some", detail: "Role escala base + bonus KW; some Progresso e aplique condicoes." },
    ],
    intensities: [
      { grade: "I - Centelha", pe: "0 PE extra", minTier: "Leigo", effect: "Efeito limitado. Escala de centimetros." },
      { grade: "II - Chispa", pe: "+1-2 PE", minTier: "Treinado", effect: "Efeito funcional. Alcanca uma pessoa ou objeto." },
      { grade: "III - Surto", pe: "+3-5 PE", minTier: "Especialista", effect: "Efeito consideravel. Alcanca uma sala pequena." },
      { grade: "IV - Ruptura", pe: "+6-9 PE", minTier: "Mestre", effect: "Efeito massivo. Alcanca edificacoes ou grandes areas." },
      { grade: "V - Cataclismo", pe: "+10+ PE", minTier: "Lenda", effect: "Efeito catastrofico. Pode alterar geografias locais." },
    ],
    actionTypes: [
      { type: "Simples", keywords: "1-3 keywords", action: "m", note: "Rapida e direta." },
      { type: "Avancada", keywords: "4-7 keywords", action: "Mv", note: "Libera M para outra coisa." },
      { type: "Completa", keywords: "8-14 keywords", action: "M", note: "Pode alterar o campo de batalha." },
      { type: "Extrema", keywords: "15+ keywords", action: "C", note: "Interrupcao por dano ou falha de Vontade DT 5 perde tudo." },
    ],
    bonus: [
      { range: "1-2", dice: "-", damage: "-", note: "KW baixo; Manifestacao simples." },
      { range: "3-4", dice: "+1 dado", damage: "+1d6/1d8", note: "Combinacao basica com rendimento." },
      { range: "5-7", dice: "+2 dados", damage: "+2d6/2d8", note: "Manifestacao composta com impacto real." },
      { range: "8-10", dice: "+3 dados", damage: "+3d6/3d8", note: "Alta complexidade; efeito multidimensional." },
      { range: "11-14", dice: "+4 dados", damage: "+4d6/4d8", note: "Construcao elaborada; requer dominio." },
      { range: "15-19", dice: "+5 dados", damage: "+5d6/5d8", note: "Grande ritual ou invocacao." },
      { range: "20+", dice: "+6 dados", damage: "+6d8+", note: "Manifestacao catastrofica e rara." },
    ],
    healingScale: [
      { tier: "Leigo", amp0: "1d6+2", amp1: "1d8+2", amp2: "2d6+3", amp3: "2d8+4" },
      { tier: "Treinado", amp0: "1d8+3", amp1: "2d6+3", amp2: "2d8+4", amp3: "3d6+5" },
      { tier: "Especialista", amp0: "2d6+4", amp1: "2d8+5", amp2: "3d6+6", amp3: "3d8+7" },
      { tier: "Mestre", amp0: "2d8+5", amp1: "3d6+6", amp2: "3d8+8", amp3: "4d6+10" },
      { tier: "Lenda", amp0: "3d6+6", amp1: "3d8+8", amp2: "4d6+10", amp3: "Restauracao significativa" },
    ],
    stacking: [
      { case: "2+ Elementos", rule: "Cada Elemento soma KW e PE. Dano de cada tipo aplica separadamente.", example: "Use o dado maior como base; demais entram como metade arredondada." },
      { case: "2+ Formas", rule: "Cada Forma adicional soma KW +1 e custo PE cheio.", example: "A primeira Forma define a mecanica principal." },
      { case: "2+ Propriedades", rule: "Cada Propriedade soma KW e PE cheio.", example: "Efeitos coexistem normalmente." },
      { case: "Elemento Composto", rule: "KW = soma dos componentes +1; PE = soma +1.", example: "Exige aprovacao do Mestre." },
      { case: "Condicoes iguais", rule: "Quando fontes iguais coexistem, aplique apenas o maior estagio.", example: "Dois Sangramentos nao somam estagios automaticamente." },
    ],
  },

  MANIFESTATION_ADVANCED_REFERENCE: {
    prerequisites: [
      { band: "Iniciante", req: "Leigo -> Treinado; Alma 1+", capacity: "Formas simples, 1 prop., Elementos 1-2 PE" },
      { band: "Competente", req: "Treinado -> Especialista; Alma 2+", capacity: "Formas medianas, 2-3 props., Elementos ate 3 PE" },
      { band: "Avancado", req: "Especialista -> Mestre; Alma 2+, Nivel 4+", capacity: "Formas complexas, 4-5 props., Elementos ate 4 PE" },
      { band: "Mestre", req: "Mestre -> Lenda; Alma 3+, Nivel 7+", capacity: "Formas mestras, 6+ props., Elementos ate 6 PE" },
      { band: "Transcendente", req: "Lenda; Alma 4+, Nivel 9+", capacity: "Projetos lendarios, construtos e todos os elementos" },
    ],
    soulUnlocks: [
      { soul: "0", unlock: "Sem Estigma", note: "Nenhuma Manifestacao; pode perceber anomalias fisicas." },
      { soul: "1", unlock: "Manifestacoes basicas", note: "Elementos 1-2 PE, formas simples, 1-2 propriedades." },
      { soul: "2", unlock: "Manifestacoes intermediarias", note: "Elementos ate 4 PE, combinacoes e formas medianas." },
      { soul: "3", unlock: "Manifestacoes avancadas", note: "Elementos ate 6 PE, Projetos Avancados e Totens Mestres." },
      { soul: "4", unlock: "Manifestacoes extremas", note: "Todos os elementos, Mandala, Nexo e Construtos APEX." },
      { soul: "5", unlock: "Apex", note: "Sem limite teorico de KW; risco de dissolucao de identidade." },
    ],
    forms: [
      { tier: "Basica", name: "Toque", pe: "0", req: "Alma 1+", area: "Adjacencia / contato", note: "Transferencia direta de Essencia; expoe o usuario." },
      { tier: "Basica", name: "Projetil", pe: "1", req: "Dominio Treinado", area: "6u + PI Afin.x2", note: "Forca concentrada contra um alvo; exige linha de visao." },
      { tier: "Basica", name: "Pulso", pe: "1", req: "Poder Treinado", area: "Raio 2u + PI Poder", note: "Acerto automatico dentro do raio; afeta aliados." },
      { tier: "Basica", name: "Cone", pe: "2", req: "Dominio Treinado", area: "Cone 90 graus, 4u + PI Afin.", note: "Cobre area sem mirar individualmente." },
      { tier: "Basica", name: "Bola", pe: "1", req: "Alma 1+", area: "8u, ponto de impacto", note: "Projetil compacto; pode ricochetear." },
      { tier: "Basica", name: "Parede", pe: "1", req: "Alma 1+", area: "2u x 4u", note: "Bloqueia passagem e linha de visao." },
      { tier: "Basica", name: "Lamina", pe: "1", req: "Alma 1+", area: "Contato / 2u", note: "Corte em arco; permite atacar com Dominio." },
      { tier: "Basica", name: "Fio", pe: "1", req: "Alma 1+", area: "Linha fina 6u", note: "Imobiliza, corta em linha ou arma armadilha." },
      { tier: "Basica", name: "Nuvem", pe: "1", req: "Alma 1+", area: "Raio 2u", note: "Area difusa; vento forte ou Aero dispersam." },
      { tier: "Basica", name: "Cilindro", pe: "1", req: "Alma 1+", area: "Raio 1u, altura 3u", note: "Coluna vertical; bloqueio, prisao ou plataforma." },
      { tier: "Basica", name: "Espinho", pe: "1", req: "Alma 1+", area: "1u", note: "Perfuracao/fixacao; critico ignora 2 RD adicional." },
      { tier: "Intermediaria", name: "Cupula", pe: "2", req: "Afinidade Treinado", area: "Raio 3u", note: "Hemisferio protetor; PV = PI Poder x10 + PE gasto x5." },
      { tier: "Intermediaria", name: "Barreira", pe: "2", req: "Afinidade Treinado", area: "4u x 2u a 6u", note: "Bloqueia Manifestacoes de KW menor; RD = Tier de Afinidade." },
      { tier: "Intermediaria", name: "Cubo", pe: "2", req: "Afinidade Treinado", area: "2u x 2u x 2u", note: "Volume solido; obstaculo ou clausura tridimensional." },
      { tier: "Intermediaria", name: "Plataforma", pe: "2", req: "Afinidade Treinado", area: "3u x 3u", note: "Superficie flutuante; move 2u/turno com Mv." },
      { tier: "Intermediaria", name: "Pilar", pe: "2", req: "Afinidade Treinado", area: "Raio 1u, altura 5u", note: "Coluna de impacto; CON DT 5 ou arremesso." },
      { tier: "Intermediaria", name: "Esfera", pe: "3", req: "Afinidade Treinado", area: "Raio 2u a 4u", note: "Bolha fechada; pressurizada explode ao quebrar." },
      { tier: "Intermediaria", name: "Onda", pe: "2", req: "Afinidade Treinado", area: "8u x 2u", note: "Frente de forca que empurra objetos 2u." },
      { tier: "Intermediaria", name: "Escada", pe: "3", req: "Afinidade Treinado", area: "Variavel", note: "Estrutura escalavel para navegacao vertical." },
      { tier: "Avancada", name: "Campo", pe: "3", req: "Afin. Esp. + Alma 2+", area: "Raio 2u + PI Afin.", note: "Zona persistente; quem entra sofre efeito automaticamente." },
      { tier: "Avancada", name: "Espiral", pe: "2", req: "Dom. Esp. + Afin. Treinado", area: "Raio 3u convergente", note: "Turno 1 metade; turno 2 dano total + condicao." },
      { tier: "Avancada", name: "Veu", pe: "3", req: "Afin. Esp. + Nivel 4+", area: "6u x 6u", note: "Impregna superficie/volume; detectavel por Sensitivo/Ocultismo." },
      { tier: "Avancada", name: "Ancora", pe: "2", req: "Afinidade Esp.", area: "Ponto/objeto", note: "Fixa efeito a um ponto; dura PI Afin. dias." },
      { tier: "Avancada", name: "Rede/Teia", pe: "3", req: "Dom. Esp. + Afin. Esp.", area: "4u x 4u", note: "Falha em Forca prende; elemento age a cada turno preso." },
      { tier: "Avancada", name: "Fio/Filamento", pe: "2", req: "Dominio Esp.", area: "Linha 10u + PI Dom.x3", note: "+1 PGE em acerto; ignora cobertura parcial." },
      { tier: "Avancada", name: "Aura", pe: "2", req: "Afinidade Esp.", area: "Raio 1u + PI Afin.", note: "Move com usuario/objeto tocado; sustentada por turno." },
      { tier: "Avancada", name: "Continuo", pe: "2", req: "Vontade Treinado", area: "Linha 8u", note: "Feixe sustentado; escala +1 dado apos 2 turnos." },
      { tier: "Avancada", name: "Impregnar", pe: "2", req: "Afinidade Treinado", area: "Objeto tocado", note: "Infunde objeto/superficie por PI Afin. horas." },
      { tier: "Avancada", name: "Invocacao", pe: "3", req: "Alma 2+, Afin. Esp., Nivel 4+", area: "Construto PI Poder HP", note: "Construto semi-autonomo de Tier Leigo." },
      { tier: "Mestra", name: "Nucleo", pe: "3", req: "Dom. Mestre + Alma 3+", area: "Esfera 0.3u -> PI Afin.", note: "Detona em 1d4 turnos; +2 dados, 50% ao redor." },
      { tier: "Mestra", name: "Mandala", pe: "4", req: "Afin. Mestre + Alma 3+, Nivel 6+", area: "Raio 5u", note: "+1 PGE em Poder para Manifestacoes na Mandala." },
      { tier: "Mestra", name: "Nexo", pe: "4", req: "Afin. Mestre + Alma 3+, Nivel 7+", area: "Dois pontos", note: "Liga pontos; efeitos emergem pelo outro ponto." },
      { tier: "Mestra", name: "Totem", pe: "4", req: "Afin. Mestre + Alma 3+", area: "Raio 3u", note: "Canaliza efeito por 2 PE/turno; HP 50." },
      { tier: "Ritual", name: "Runas", pe: "4", req: "Afin. Mestre + Alma 3+", area: "Simbolo estavel", note: "Armazena Manifestacao; runas mestras podem ser permanentes." },
      { tier: "Ritual", name: "Selo Mistico", pe: "5", req: "Afin. Mestre + Alma 3+", area: "Area selada", note: "Suprime Manifestacoes de Tier menor que o Dominio do criador." },
      { tier: "Ritual", name: "Portal", pe: "5", req: "Afin. Mestre + Alma 3+", area: "Dois pontos", note: "Objetos e efeitos podem cruzar." },
      { tier: "Ritual", name: "Nexo (Ritual)", pe: "6", req: "Afin. Mestre + Nivel 7+", area: "Raio 4u", note: "Dobra eficiencia de Manifestacoes aliadas no raio." },
    ],
    elementalWeapons: [
      { name: "Espada Curta", pe: "3", req: "Dominio Treinado", damage: "1d8 Corte/Elem.", range: "CaC (1u)", note: "Uma mao; critico: efeito elemental." },
      { name: "Espada Longa", pe: "3", req: "Dominio Treinado", damage: "1d10 Corte/Elem.", range: "CaC (1u)", note: "Versatil 1/2 maos; critico: Sangramento elemental." },
      { name: "Lanca", pe: "3", req: "Dominio Treinado", damage: "1d8 Perf./Elem.", range: "CaC (2u)", note: "Mantem distancia; Cryo imobiliza em critico." },
      { name: "Adaga", pe: "3", req: "Dominio Treinado", damage: "1d6 Perf./Elem.", range: "CaC / 4u", note: "Leve; pode ser arremessada." },
      { name: "Arco", pe: "3", req: "Dominio Treinado", damage: "1d8 Perf./Elem.", range: "12u", note: "Municao elemental ilimitada; usa Pontaria." },
      { name: "Corrente", pe: "3", req: "Dominio Treinado", damage: "1d8 Impacto/Elem.", range: "3u", note: "Pode imobilizar; critico imobiliza 1 turno." },
    ],
    propertyBands: [
      { band: "1 PE - Basicas", names: "Brilhante, Acido, Pesado, Leve, Frio, Calor, Silencioso, Afiado, Perfurante, Residual, Expansivo, Carregado, Atrasado, Catalisador, Preciso, Persistente, Rapido, Instavel", note: "Modificadores leves; varias exigem Treinado ou Dominio Treinado." },
      { band: "2-3 PE - Avancadas", names: "Dureza, Flexibilidade, Viscosidade, Velocidade, Ocultacao, Eletrico, Regenerante, Magnetico, Penetrante, Encadeado, Dissipante, Reflexivo, Selado, Duplo, Amplificado, Composto, Vinculado, Invertido, Venenoso, Imune, Sobrenatural, Inversao Alvo", note: "Alteram alvo, area, defesa, persistencia ou interacao elemental." },
      { band: "3-5 PE - Taticas", names: "Indestrutivel, Autocura, Levitacao, Explosivo, Paralisante, Invisivel, Cortante Duplo, Teletransporte, Barreira Mistica, Corruptor, Gelo Eterno, Dreno de PE", note: "Exigem leitura tática e tendem a impor condicoes fortes." },
      { band: "6-7 PE - Supremas", names: "Chama Perene, Peso Plumeo, Velocidade Sobre-humana, Glacial Total, Fogo Celestial, Dissolucao Etaria", note: "Efeitos extremos; normalmente dependem de alto Tier e aprovacao narrativa." },
    ],
    conflicts: [
      { combo: "Silencioso + Expansivo", reason: "Expansao cria movimento detectavel.", alternative: "Usar Silencioso em area ja estabelecida." },
      { combo: "Rapido + Atrasado", reason: "Velocidade e atraso se excluem.", alternative: "Carregado prepara; Rapido dispara." },
      { combo: "Instavel + Amplificado", reason: "Amplificar instabilidade aumenta risco.", alternative: "Permitido com Nivel 7+ e DT controle +2." },
      { combo: "Reflexivo + Preciso", reason: "Ricochete invalida exclusao precisa.", alternative: "Reflexivo primeiro; Preciso no tiro original." },
      { combo: "Selado + Expansivo", reason: "Conter e expandir conflitam.", alternative: "Selado define o limite maximo." },
      { combo: "Duplo + Encadeado", reason: "Multiplica alvos demais.", alternative: "Permitido com Afinidade Lenda; KW dobrado." },
      { combo: "Inversao Alvo + Reflexivo", reason: "Duas regras de redirecionamento colidem.", alternative: "Mestre decide prioridade." },
    ],
    synergies: [
      { combo: "Persistente + Ancora", condition: "Afinidade Esp.", effect: "-1 PE total; efeito ancorado dura mais." },
      { combo: "Continuo + Amplificado", condition: "Vontade Esp.", effect: "-1 PE total; fluxo sustentado amplifica naturalmente." },
      { combo: "Campo + Catalisador", condition: "Elemento compativel presente", effect: "-1 PE total; campo catalisa material ambiental." },
      { combo: "Silencioso + Carregado", condition: "Dominio Esp.", effect: "-1 PE total; preparacao silenciosa fica oculta." },
      { combo: "Preciso + Imune", condition: "Dominio Mestre", effect: "-1 PE total; logica de selecao compartilhada." },
      { combo: "Vinculado + Persistente", condition: "Afinidade Mestre", effect: "-1 PE total; vinculo ja favorece persistencia." },
      { combo: "Nucleo + Amplificado", condition: "Dom. Mestre + Nivel 6+", effect: "-1 PE total; concentracao do nucleo amplifica." },
    ],
  },

  COMBAT_PRESSURE_SYSTEM: {
    states: [
      { state: "Intacto", hp: "67-100% HP", defense: "Normal", damage: "Normal", extra: "Sem efeito adicional." },
      { state: "Ferido", hp: "34-66% HP", defense: "-1 Defesa", damage: "+1 dado recebido", extra: "Estados duram +1 turno." },
      { state: "Critico", hp: "1-33% HP", defense: "-2 Defesa", damage: "+2 dados recebidos", extra: "Vulneravel a Execucao." },
    ],
    damageSources: [
      { source: "Base", effect: "Rola dados da arma e aplica RD da armadura." },
      { source: "Condicao: Ferido", effect: "+1 dado em todos os ataques recebidos pelo alvo." },
      { source: "Condicao: Critico", effect: "+2 dados em todos os ataques recebidos pelo alvo." },
      { source: "Vantagem Posicional", effect: "Flanqueado, derrubado ou surpreso: +1 dado de dano." },
      { source: "Estado Ativo", effect: "Sangramento, Fragilizar e similares aplicam seus efeitos proprios." },
      { source: "Critico confirmado", effect: "Efeito da arma + bonus conforme o estado do alvo." },
    ],
    criticalByState: [
      { state: "Intacto", effect: "Aplica o efeito critico normal da arma." },
      { state: "Ferido", effect: "Efeito critico da arma + estado aplicado piora 1 nivel." },
      { state: "Critico", effect: "Efeito critico da arma + Execucao disponivel; CON DT 5 para evitar abate/incapacitacao." },
    ],
    execution: [
      "Qualquer critico confirmado contra alvo Critico pede Constituicao DT 5; falha = incapacitado ou morto, a criterio do Mestre.",
      "Tecnicas com tag Execucao ativam automaticamente em alvo Critico.",
      "Algumas tecnicas podem expandir o threshold de Execucao para Ferido quando o texto da tecnica permitir.",
    ],
    sniperAim: [
      { aim: "Sem Mira", intact: "-3 acerto, -1 dado", wounded: "-3 acerto, -1 dado", critical: "-3 acerto, -1 dado" },
      { aim: "Mira Rapida", intact: "Normal", wounded: "+1d10 critico", critical: "+1d10 + Exec. DT 5" },
      { aim: "Mira Plena", intact: "+1d10", wounded: "Abater: +2d10 + Derruba", critical: "Execucao DT 5" },
      { aim: "Sustentada 2t", intact: "+2d10 + Derruba", wounded: "Abater automatico sem critico", critical: "Execucao DT 6" },
      { aim: "Sustentada 3t+", intact: "Abater automatico", wounded: "Abater automatico", critical: "Execucao DT 8" },
    ],
    synergies: [
      { combo: "Sangramento + Critico", effect: "Sangramento 2+ pode abrir Execucao a cada turno." },
      { combo: "Fragilizar + arma pesada", effect: "Fragilizar 3 reduz a protecao pratica; armas pesadas entram com impacto total." },
      { combo: "Derrubado + Adaga/Rondel", effect: "Alvo caido perde defesa; Adaga e Rondel exploram vitalidade e execucao." },
      { combo: "Imobilizado + Sniper", effect: "Sem cobertura real; Mira Plena com critico tende a Execucao garantida." },
      { combo: "Atordoado + M+m", effect: "Sem reacao; acoes telegrafadas ficam seguras." },
      { combo: "Medo + armas de alcance", effect: "Recuo forcado empurra o alvo para zonas de ameaca." },
    ],
    styleRoles: [
      { role: "Pressao", styles: "Agressao, Investida, Ferro, Danca, Fluxo, Assalto", goal: "Empurrar o alvo para Ferido/Critico." },
      { role: "Controle", styles: "Controle, Presa, Pescador, Formacao, Meia-Espada", goal: "Criar imobilidade, queda ou abertura." },
      { role: "Finalizacao", styles: "Sombra, Iai, Francotirador, Perfurador, Presa Mortal", goal: "Explorar Critico e thresholds de Execucao." },
      { role: "Defesa", styles: "Guarda Fechada, Defesa em Alcance, Cavaleiro, Observador", goal: "Evitar entrar em estados ruins." },
      { role: "Alcance", styles: "Saraivada, Precisao, Cobertura, Anti-Armadura", goal: "Forcar cobertura ou pressionar thresholds." },
    ],
  },

  ADVANCED_SYSTEMS: {
    alchemy: [
      { combo: "Hydro + Geo", material: "Lama / Barro", req: "Leigo", duration: "1d4 rodadas", properties: "Moldável; endurece em 10 min; base cerâmica." },
      { combo: "Geo + Hitze", material: "Cerâmica / Tijolo", req: "Trein. Afin.", duration: "Permanente", properties: "Sólido e resistente ao fogo." },
      { combo: "Pyro + Plantae", material: "Carbono Bruto", req: "Trein. Afin.", duration: "Instável", properties: "Base para Diamante Espiritual." },
      { combo: "Carbono + Kalt", material: "Diamante Espiritual", req: "Esp. + Mestre Afin.", duration: "Permanente", properties: "Dureza extrema para lâminas e relíquias." },
      { combo: "Cryo + Hydro", material: "Gelo Puro", req: "Esp. Afin.", duration: "1d4 horas", properties: "Estrutural, transparente e bom para armadilhas." },
      { combo: "Geo + Saxum", material: "Pedra Moldada", req: "Trein. Afin.", duration: "Permanente c/ 6+", properties: "Pedra pré-formada para obra estrutural." },
      { combo: "Fumum + Venenis", material: "Ácido Fraco", req: "Esp. Afin.", duration: "1d4 turnos", properties: "Corrói metal leve e orgânicos." },
      { combo: "Ferrum + Hitze", material: "Metal Forjado", req: "Esp. + Analista", duration: "Permanente", properties: "Base metálica para relíquias; conduz Essência." },
      { combo: "Ferrum + Saxum", material: "Liga Mineral-Metálica", req: "Mestre + Analista", duration: "Permanente", properties: "Alta resistência com menos peso." },
      { combo: "Ignis Lux + Krystallis", material: "Cristal de Pureza", req: "Mestre Afin.", duration: "Permanente", properties: "Base para Runas Mestras e Lux puro." },
      { combo: "Nebula + Vita", material: "Neblina Vital", req: "Mestre Afin.", duration: "3 turnos", properties: "Névoa respirável que recupera 1 HP por turno." },
      { combo: "Inanis + Geo", material: "Pedra Neutra", req: "Mestre Afin.", duration: "Permanente", properties: "Não conduz Essência; excelente contenção." },
      { combo: "Hitze + Ferrum + Saxum", material: "Aço Espiritual", req: "Mestre + Analista + Nív. 6", duration: "Permanente", properties: "Dureza extrema e ótima condução para relíquias superiores." },
    ],
    chaining: {
      flow: [
        "Iniciação: M + m e pagamento do PE base.",
        "Canalização: M por turno, somando metade do KW por turno.",
        "Liberação: M para descarregar a escala máxima preparada.",
        "Interrupção por dano: teste de Vontade DT 5 + turnos canalizados.",
      ],
      turns: [
        { turns: "1t", pe: "KW base", master: "2d8", mastery: "3d6", extra: "Sem bônus extra", req: "Qualquer" },
        { turns: "2t", pe: "KW + 50%", master: "3d6", mastery: "3d8", extra: "+1 propriedade grátis", req: "Afin. Esp." },
        { turns: "3t", pe: "KW × 2", master: "3d8", mastery: "4d6", extra: "Amplificação grátis", req: "Mestre Afin." },
        { turns: "4t", pe: "KW × 3", master: "4d6", mastery: "4d8", extra: "Penetrante + amplificado", req: "Mestre Afin." },
        { turns: "5t", pe: "KW × 4", master: "4d8", mastery: "5d6+", extra: "Escala de cataclismo", req: "Lenda + Nív. 9" },
      ],
      detectability: [
        { stage: "T1", effect: "Brilho sutil a 2u." },
        { stage: "T2", effect: "Luz visível a 6u; leitura DT 5." },
        { stage: "T3", effect: "Distorção automática em 12u." },
        { stage: "T4+", effect: "Impossível não notar em 20u+." },
      ],
    },
    projects: {
      tiers: [
        { grade: "Simples", stages: "1", dt: "4–5", time: "1–2h", req: "Treinado relevante", result: "Reparo, objeto simples ou primeira runa." },
        { grade: "Moderado", stages: "2–3", dt: "5–6", time: "4–8h", req: "Especialista + habilidade", result: "Relíquia menor, poção complexa ou golem simples." },
        { grade: "Complexo", stages: "4–6", dt: "6–7", time: "1–3 dias", req: "Mestre + Analista + Nív. 5", result: "Relíquia maior, golem avançado ou implante." },
        { grade: "Avançado", stages: "6–10", dt: "7–8", time: "3–7 dias", req: "Mestre em 2 subs + Nív. 7", result: "Construto PRIME, arcologia ou modificação corporal." },
        { grade: "Lendário", stages: "10+", dt: "8–9", time: "Semanas+", req: "Lenda + equipe + Nív. 9", result: "Construtos APEX, portais permanentes ou reescrita maior." },
      ],
      quality: [
        { name: "Subpadrão", trigger: "2+ etapas em falha parcial." },
        { name: "Padrão", trigger: "Sucesso em todas as etapas." },
        { name: "Superior", trigger: "Ao menos um crítico." },
        { name: "Obra-Prima", trigger: "3+ críticos ou Lenda." },
        { name: "Lendário", trigger: "Maioria crítica com Nív. 9+." },
      ],
    },
    relics: {
      tiers: [
        { tier: "Sigilo / Runa", pe: "2–8", req: "Trein. Afin.", will: "Não" },
        { tier: "Relíquia Menor", pe: "5–15", req: "Esp. + Nív. 3", will: "Não" },
        { tier: "Relíquia Média", pe: "16–29", req: "Mestre + Nív. 5", will: "Não" },
        { tier: "Relíquia Maior", pe: "30–50", req: "Lenda + Nív. 7", will: "Possível" },
        { tier: "Transcendente", pe: "50+", req: "Lenda + Nív. 9", will: "Sim" },
      ],
      willNotes: [
        { name: "Lealdade", effect: "Alinhamento voluntário; não é obediência cega." },
        { name: "Recusa", effect: "Pode negar ações que ferem sua própria natureza." },
        { name: "Resistência", effect: "Não aceita corrupção ou encantamento sem consentimento." },
        { name: "Comunicação", effect: "Fala por impulsos, sensações, visões ou voz interior." },
        { name: "Separação", effect: "Quebrar vínculo exige testes de Vontade crescentes para ambos." },
      ],
    },
  },
};
