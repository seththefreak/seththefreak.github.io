const RACES_DB = [
  // ═══════════════════════════════════════════════════════ BASE
  // BALANÇO v3: Humano (+4 attr, +1 modo) > especialistas por flexibilidade.
  // Faerie: extremamente frágil, compensada por magia (-2 PM), mobilidade e habilidades ímpares.
  // Rex: penalidade Sorte -3, compensada por garras e resistência a rastreamento.
  // Siren: Sorte +4, restrição aquática e aridez como penalidade narrativa.
  // Ex Machina: sem magia, sistema de Energia próprio, 4 skills iniciais.
  // Jotunn: ocupa 2x2u, sem magia, melhor tanque físico do sistema.
  {
    name:'Humano', classificacao:'Base',
    conceito:'Adaptável Estrutural — sem bônus fixos em atributos, mas com pontos extras e versatilidade incomparável.',
    atributos:{ FOR:0,CON:0,AGI:0,DES:0,VIDA:0,DEF:0,VON:0,PER:0,INT:0,SAB:0,MAG:0,RESM:0,CAR:0,ATQ:0 },
    modos:{ Bruto:2,Ágil:2,Preciso:2,Intuitivo:2 }, pontosExtras:1, pontosExtrasAtributo:4, pontosExtrasModo:1,
    observacao:'Recebe +4 pontos de Atributo e +1 ponto de Modo extras na criação (Adaptabilidade Estrutural). Nenhum bônus racial fixo — depende totalmente da construção.',
    proficiencias:{ 
      armas:'Livre (via proficiências iniciais)', 
      armaduras:'1 tipo à escolha', 
      escolas:['3 à escolha'], 
      afinidades:['3 à escolha'], 
      tipoMagico:['Arcana','Bruxaria','Invocação'], 
      skillsIniciais:4, 
      periciasBonus:'+1 em 3 perícias à escolha',
      progressao:'Nova habilidade: nível 4/7/10/12/15/18 · Nova proficiência: nível 5/10/15/20 · +1 Modo · +18 Ímpeto'
    },
    habilidades:[
      { id:'hum_1', nome:'Adaptabilidade Estrutural', tipo:'passiva',
        desc:'+4 pontos adicionais de Atributo na criação e +1 ponto adicional de Modo. Respeita os limites máximos por nível.',
        efeito:{ tipo:'distribuicao', pontos:4, maxPorAttr:null, pontosModo:1, maxPorModo:4 } },
      { id:'hum_2', nome:'Formação Versátil', tipo:'passiva',
        desc:'+1 em três perícias diferentes à sua escolha. Não pode aplicar mais de +1 na mesma perícia por meio deste benefício.' },
      { id:'hum_3', nome:'Empenho', tipo:'passiva',
        desc:'Sempre que aprender 1 ou mais habilidades/magias, aprende +1 adicional.' },
      { id:'hum_4', nome:'Civilização Humana', tipo:'passiva',
        desc:'+50% do bônus de origem escolhida. Vantagem ao utilizar tecnologia comum humana.' }
    ],
    progressao:{
      nucleo:[
        { id:'hum_n1', nome:'Polivalência', req:'Núcleo',
          desc:'Pode redistribuir 1 ponto de atributo após descanso longo.' },
        { id:'hum_n2', nome:'Aprendizado Rápido', req:'Núcleo',
          desc:'1 vez por cena, pode repetir um teste de Modo falhado.' },
        { id:'hum_n3', nome:'Ambição', req:'VON 3',
          desc:'Ao falhar em ação importante, recebe +1 dado na próxima tentativa relacionada.' }
      ],
      caminhos:[
        { nome:'Especialista', nivel:5, foco:'Excelência Direcionada.', habilidades:[
          { id:'hum_e1', nome:'Foco Absoluto', req:'Preciso 3',
            desc:'Quando obtiver 2 sucessos em teste Preciso, recebe +1 sucesso adicional.' },
          { id:'hum_e2', nome:'Técnica Refinada', req:'Foco Absoluto',
            desc:'Se falhar por 1 sucesso em teste Preciso, trata como sucesso parcial.' },
          { id:'hum_e3', nome:'Maestria', req:'Nível 10, Modo 4',
            desc:'Escolha um Modo. Uma vez por cena, pode rolar +1 dado nesse Modo.',
            efeito:{ tipo:'dado', condicional:'1x por cena', delta:1 } },
          { id:'hum_e4', nome:'Lenda Técnica', req:'Nível 18, Maestria',
            desc:'Se alcançar sucesso máximo no Modo escolhido, pode realizar uma ação menor adicional.' }
        ]},
        { nome:'Adaptável', nivel:5, foco:'Flexibilidade Situacional.', habilidades:[
          { id:'hum_a1', nome:'Versatilidade Tática', req:'Nível 5',
            desc:'1 vez por cena, pode trocar o Modo após declarar a ação.' },
          { id:'hum_a2', nome:'Improvisador', req:'Versatilidade Tática',
            desc:'Possui vantagem ao usar recursos improvisados.' },
          { id:'hum_a3', nome:'Ajuste Estratégico', req:'Nível 10',
            desc:'No início da cena, pode mover 1 ponto entre dois atributos (efeito temporário, dura a cena).',
            efeito:{ tipo:'atributo', condicional:'início de cena', temporario:true } },
          { id:'hum_a4', nome:'Adaptação Suprema', req:'Nível 18',
            desc:'Uma vez por cena, pode tratar um Modo como se estivesse no valor máximo permitido.',
            efeito:{ tipo:'modo', condicional:'1x por cena', maxTemp:true } }
        ]}
      ]
    },
    variacoes:[
      { id:'hum_v1', nome:'Urbano',       desc:'Civilização Humana +20% em grandes centros. Vantagem em interações sociais.' },
      { id:'hum_v2', nome:'Acadêmico',    desc:'Empenho também cobre idiomas e técnicos. +1 em testes de pesquisa.' },
      { id:'hum_v3', nome:'Fronteiriço',  desc:'+1 em testes de sobrevivência. Uma vez por confronto ignora penalidade ambiental.' }
    ]
  },
  {
    name:'Jotunn', classificacao:'Base',
    conceito:'Titãs de carne e gelo. Força colossal, magia irrisória.',
    atributos:{ FOR:3,CON:3,AGI:-1,DES:-1,VIDA:0,DEF:0,VON:1,PER:0,INT:-1,SAB:0,MAG:-2,RESM:1,CAR:-1,ATQ:0,Sorte:0 },
    modos:{ Bruto:4,Ágil:1,Preciso:1,Intuitivo:2 },
    observacao:'Titãs de força colossal. Ocupa 2x2u. Sem magia. Pode empunhar armas Colossais sem penalidade.',
    proficiencias:{ 
      armas:'Pesadas', 
      armaduras:'Pesadas', 
      escolas:[], 
      afinidades:['Terra','Fogo'], 
      tipoMagico:['Não-mágico / residual'], 
      skillsIniciais:3, 
      periciasBonus:'Segurar · Influência',
      progressao:'Pouca afinidade com magia · Cultura tribal'
    },
    habilidades:[
      { id:'jot_1', nome:'Pele Rígida', tipo:'passiva',
        desc:'CA base: 4 + (2 × Nível).',
        efeito:{ tipo:'atributo', formula:'CA = 4 + (2×Nível)' } },
      { id:'jot_2', nome:'Corpo Colossal', tipo:'passiva',
        desc:'+2 DEF contra empurrões e quedas. Conta como categoria de tamanho acima em testes de Força. Pode empunhar armas Colossais sem penalidade.' },
      { id:'jot_3', nome:'Força de Titã', tipo:'passiva',
        desc:'Capacidade de carga dobrada. Pode arremessar criaturas Médias (dano: 1d6 + FOR efetivo).' },
      { id:'jot_4', nome:'Sangue Ancestral', tipo:'passiva',
        desc:'Resistência 25% a dano de Frio. Imune a efeitos climáticos naturais extremos.' },
      { id:'jot_5', nome:'Passo Sísmico', tipo:'ativa',
        desc:'1x por combate: golpeia o chão causando abalo em raio 2u. Criaturas Pequenas e Médias testam FOR ou são derrubadas.' },
      { id:'jot_6', nome:'Inércia Brutal', tipo:'ativa',
        desc:'Reação 1x por turno ao receber dano: reduz o dano em CON ÷ 2.',
        efeito:{ tipo:'reducaoDano', formula:'CON / 2', condicional:'Reação 1x/turno' } }
    ],
    progressao:{
      nucleo:[
        { id:'jot_n1', nome:'Ossos de Ferro', req:'CON 4',
          desc:'Inércia Brutal reduz dano em CON efetivo (ao invés de ÷2).',
          efeito:{ tipo:'reducaoDano', formula:'CON' } },
        { id:'jot_n2', nome:'Domínio pelo Medo', req:'Nível 3',
          desc:'Vantagem em Intimidação e imposição física com Modo Bruto.' },
        { id:'jot_n3', nome:'Caçada Implacável', req:'Nível 4',
          desc:'Contra alvos com menos de 50% de Vida, +1 dado em ações Brutas.',
          efeito:{ tipo:'dado', delta:1, condicional:'Alvo < 50% Vida' } }
      ],
      caminhos:[
        { nome:'Conquistador', nivel:5, foco:'Destruição direta e domínio de campo.', habilidades:[
          { id:'jot_c1', nome:'Impacto Devastador', req:'Nível 5, FOR 4',
            desc:'3+ sucessos em Bruto ofensivo: +2 dano adicional.',
            efeito:{ tipo:'dano', delta:2, condicional:'3+ sucessos Bruto' } },
          { id:'jot_c2', nome:'Bônus de Ataque Bruto', req:'Nível 6',
            desc:'+1 dado em ataques corpo a corpo.',
            efeito:{ tipo:'dado', delta:1 } },
          { id:'jot_c3', nome:'Fúria de Guerra', req:'Nível 8',
            desc:'Sofreu dano no turno anterior: +1 dado Bruto.',
            efeito:{ tipo:'dado', delta:1, condicional:'Sofreu dano turno anterior' } },
          { id:'jot_c4', nome:'Massacrar Contínuo', req:'Nível 12',
            desc:'Ao derrotar inimigo, pode realizar ação Bruta adicional com -1 dado.' },
          { id:'jot_c5', nome:'Sede de Sangue', req:'Nível 14',
            desc:'Abaixo de 50% de Vida: +1 dado Bruto permanente.',
            efeito:{ tipo:'dado', delta:1, condicional:'Vida < 50%' } },
          { id:'jot_c6', nome:'Executor Absoluto', req:'Nível 18',
            desc:'Ao reduzir alvo a 0 Vida com Bruto, ignora reações defensivas desse alvo.' }
        ]},
        { nome:'Titã Glacial', nivel:5, foco:'Resistência e supressão mágica.', habilidades:[
          { id:'jot_g1', nome:'Resistência Mágica', req:'Nível 5',
            desc:'+1 RESM permanente.', efeito:{ tipo:'atributo', mods:{ RESM:1 } } },
          { id:'jot_g2', nome:'Redução de Magia', req:'Nível 6',
            desc:'Reduz dano mágico recebido em 25%.' },
          { id:'jot_g3', nome:'Blindagem de Gelo', req:'Nível 8',
            desc:'1x/combate, reação: absorve completamente 1 ataque mágico. Custa 10 de Vida.' },
          { id:'jot_g4', nome:'Imparável', req:'Nível 9',
            desc:'1x/cena: Imparável por 2 turnos (não pode ser empurrado, derrubado ou imobilizado).' },
          { id:'jot_g5', nome:'Colosso Glacial', req:'Nível 18',
            desc:'1x/cena, 3 turnos: imune a condições mágicas e -50% dano elemental.' }
        ]},
        { nome:'Muralha Viva', nivel:5, foco:'Proteção de aliados e controle de espaço.', habilidades:[
          { id:'jot_m1', nome:'Guardião', req:'Nível 5',
            desc:'Aliados adjacentes recebem +1 DEF enquanto o Jotunn estiver em pé.',
            efeito:{ tipo:'atributo', attr:'DEF', delta:1, condicional:'Aliados adjacentes' } },
          { id:'jot_m2', nome:'Escudo de Carne', req:'Nível 6',
            desc:'Pode interpor-se entre aliado e ataque (reação 1x/turno). Recebe o dano no lugar.' },
          { id:'jot_m3', nome:'Controle de Área', req:'Nível 8',
            desc:'Inimigos que entrem em espaço adjacente testam FOR ou param o movimento.' },
          { id:'jot_m4', nome:'Aura de Intimidação', req:'Nível 9',
            desc:'Aura 3u: inimigos testam VON no início do turno. Falha → -1 dado.' },
          { id:'jot_m5', nome:'Baluarte', req:'Nível 14',
            desc:'Adjacente a 2+ aliados: CA +4 adicional.' },
          { id:'jot_m6', nome:'Muralha Total', req:'Nível 18',
            desc:'1x/cena, 2 turnos: aliados em raio 3u recebem -30% dano.' }
        ]}
      ]
    },
    variacoes:[
      { id:'jot_v1', nome:'Impersky As', desc:'Militarizado. +1 Intimidação. Corpo Colossal também reduz dano à distância em 2. Acesso a armaduras militares imperiais sem custo de adaptação.' },
      { id:'jot_v2', nome:'Severnoye',   desc:'Integrado. +1 Sobrevivência. Passo Sísmico 2x por combate. Vantagem em Influência com Jotunn de outras origens.' }
    ]
  },
  {
    name:'Dairo', classificacao:'Base',
    conceito:'Conquistadores. A raça que domina pelo peso da sua presença.',
    atributos:{ FOR:3,CON:2,AGI:0,DES:-1,VIDA:0,DEF:0,VON:2,PER:0,INT:-1,SAB:0,MAG:-1,RESM:1,CAR:1,ATQ:0,Sorte:0 },
    modos:{ Bruto:4,Ágil:1,Preciso:2,Intuitivo:1 },
    observacao:'Força bruta máxima. Dominação física e social por intimidação. Presença aterrorizante.',
    proficiencias:{ armas:'Pesadas e Médias', armaduras:'Pesadas', escolas:[], afinidades:['Terra','Fogo'], tipoMagico:['Não mágico'], skillsIniciais:3, periciasBonus:'Influência, Intimidação' },
    habilidades:[
      { id:'dai_1', nome:'Predador Impositivo', tipo:'passiva',
        desc:'Usando Modo Bruto, se obtiver ao menos 1 sucesso, recebe +1 sucesso adicional.',
        efeito:{ tipo:'sucesso', delta:1, condicional:'Modo Bruto + 1 sucesso' } },
      { id:'dai_2', nome:'Corpo de Guerra', tipo:'passiva',
        desc:'Reduz o primeiro dano físico de cada confronto em: 2 + FOR efetivo.',
        efeito:{ tipo:'reducaoDano', formula:'2 + FOR' } },
      { id:'dai_3', nome:'Domínio pelo Medo', tipo:'passiva',
        desc:'Vantagem em testes de Intimidação, imposição física ou contenção realizados com Modo Bruto.' },
      { id:'dai_4', nome:'Instinto de Conquista', tipo:'passiva',
        desc:'Ao derrotar um oponente em combate direto, recupera: 2 + CON efetivo de Vida.',
        efeito:{ tipo:'cura', formula:'2 + CON' } }
    ],
    progressao:{
      nucleo:[
        { id:'dai_n1', nome:'Sangue de Conquistador', req:'Nível 3',
          desc:'Ao ativar Predador Impositivo, recebe +1 DEF até o próximo turno.',
          efeito:{ tipo:'atributo', attr:'DEF', delta:1, duracao:'1 turno', condicional:'Predador Impositivo' } },
        { id:'dai_n2', nome:'Ossos de Ferro', req:'CON 4',
          desc:'Corpo de Guerra passa a reduzir dano em: 3 + CON efetivo.',
          efeito:{ tipo:'reducaoDano', formula:'3 + CON' } },
        { id:'dai_n3', nome:'Caçada Implacável', req:'Nível 4',
          desc:'Contra alvos com menos da metade da Vida, +1 dado em ações Brutas.',
          efeito:{ tipo:'dado', delta:1, condicional:'Alvo < 50% Vida' } }
      ],
      caminhos:[
        { nome:'Dominador', nivel:5, foco:'Supressão e controle de campo.', habilidades:[
          { id:'dai_d1', nome:'Presença Ameaçadora', req:'Nível 5',
            desc:'Alvos que falharem em Intimidação sofrem -1 dado no próximo teste contra o Dairo.' },
          { id:'dai_d2', nome:'Subjugador', req:'Nível 6',
            desc:'Ao imobilizar ou conter alvo, recebe +1 sucesso automático.' },
          { id:'dai_d3', nome:'Quebra-Espíritos', req:'Nível 8, VON 2',
            desc:'Ao reduzir inimigo abaixo de 50% com Bruto, ele sofre -1 dado em ações contra o Dairo até fim da cena.' },
          { id:'dai_d4', nome:'Tirano de Campo', req:'Nível 10',
            desc:'Adjacente a 2+ inimigos: +1 DEF. (Nível 14: adjacente a qualquer inimigo.)' },
          { id:'dai_d5', nome:'Senhor da Guerra', req:'Nível 18',
            desc:'1x/cena ao derrotar inimigo: testemunhas testam VON vs FOR. Falha → -1 dado até próximo turno.' }
        ]},
        { nome:'Carniceiro', nivel:5, foco:'Destruição direta e escalada de violência.', habilidades:[
          { id:'dai_c1', nome:'Impacto Devastador', req:'Nível 5, FOR 4',
            desc:'3+ sucessos em Bruto ofensivo: +2 dano adicional.',
            efeito:{ tipo:'dano', delta:2, condicional:'3+ sucessos Bruto' } },
          { id:'dai_c2', nome:'Fúria de Guerra', req:'Nível 6',
            desc:'Sofreu dano no turno anterior: +1 dado Bruto no próximo turno.',
            efeito:{ tipo:'dado', delta:1, condicional:'Sofreu dano turno anterior' } },
          { id:'dai_c3', nome:'Massacre Contínuo', req:'Nível 8',
            desc:'Ao derrotar inimigo, pode realizar ação Bruta adicional com -1 dado.' },
          { id:'dai_c4', nome:'Sede de Sangue', req:'Nível 10',
            desc:'Abaixo de 50% de Vida: +1 dado Bruto permanente no turno (Nível 14: +2 total).',
            efeito:{ tipo:'dado', delta:1, condicional:'Vida < 50%' } },
          { id:'dai_c5', nome:'Executor Absoluto', req:'Nível 18',
            desc:'Ao reduzir alvo a 0 Vida com Bruto, ignora reações defensivas desse alvo.' }
        ]}
      ]
    },
    variacoes:[
      { id:'dai_v1', nome:'Tribal',     desc:'Instinto de Conquista +1 Vida adicional. +1 Sobrevivência e Rastreamento. Vantagem em orientação em territórios não mapeados.' },
      { id:'dai_v2', nome:'Militar',    desc:'+1 DEF adjacente a aliado (formação). Corpo de Guerra também reduz dano à distância. Sem penalidade de mobilidade em armaduras pesadas padrão.',
        efeito:{ tipo:'atributo', attr:'DEF', delta:1, condicional:'Adjacente a aliado' } },
      { id:'dai_v3', nome:'Nômade',     desc:'Ignora penalidade de terreno difícil. +1 dado Bruto na primeira rodada. +1 Intimidação narrativa fora de combate.',
        efeito:{ tipo:'dado', delta:1, condicional:'Primeira rodada' } }
    ]
  },
  {
    name:'Rex', classificacao:'Base',
    conceito:'Humanoide dracônico. O maior crescimento vertical do sistema.',
    atributos:{ FOR:2,CON:2,AGI:1,DES:0,VIDA:0,DEF:0,VON:2,PER:1,INT:0,SAB:0,MAG:0,RESM:1,CAR:1,ATQ:0,Sorte:-3 },
    modos:{ Bruto:3,Ágil:2,Preciso:2,Intuitivo:1 },
    observacao:'Humanoide dracônico. Sorte -3. Portador do Drakon Aima — gene dracônico ancestral que desperta nos níveis ímpares.',
    proficiencias:{ 
      armas:'Geral (ênfase em naturais; garras 1d6 lacerante)', 
      armaduras:'Média', 
      escolas:['Ampliação','Mundanas'], 
      afinidades:['Nenhuma fixa'], 
      tipoMagico:['Bruxaria'], 
      skillsIniciais:3, 
      periciasBonus:'Travessia · Influência · ❌ Penalidade: Cognição e Comunicação',
      progressao:'Resistência a rastreamento e revelação · Visão noturna e térmica'
    },
    habilidades:[
      { id:'rex_1', nome:'Escamado', tipo:'passiva',
        desc:'CA base: 4 + Nível | RM base: 3 + (Nível × 2).',
        efeito:{ tipo:'atributo', formula:'CA = 4+Nível | RM = 3+(Nível×2)' } },
      { id:'rex_2', nome:'Garras', tipo:'passiva',
        desc:'Ataque desarmado causa 1d6 lacerante (arma natural). Garras potencializam efeitos elementais conforme estágio do Drakon Aima.' },
      { id:'rex_3', nome:'Natureza Réptil', tipo:'passiva',
        desc:'Vantagem em Travessia. Resistência a magia de revelação/rastreamento. Desvantagem em ações em clima frio. Visão Noturna e Térmica. Contato visual contínuo: Vantagem em Influência.' },
      { id:'rex_4', nome:'Drakon Aima — Fraco I', tipo:'passiva',
        desc:'+50 Vida permanente. Gene dracônico desperta (nível 1). Afinidade elemental inicial: Fogo/Rocha/Raio/Gelo/Sombra/Veneno.' },
      { id:'rex_5', nome:'Drakon Aima — Fraco II', tipo:'passiva',
        desc:'+50 Vida | +1 ATQ ou +1 Poder Mágico. Passivos elementais de Fraco I ganham profundidade.' },
      { id:'rex_6', nome:'Drakon Aima — Forte I', tipo:'passiva',
        desc:'+50 Vida | +1 ATQ ou +1 Poder Mágico. Alterações físicas evidentes. Garras: +50% dano elemental e 1d4 chance de condição elemental.' }
    ],
    progressao:{
      nucleo:[
        { id:'rex_n1', nome:'Escamas de Batalha', req:'Nível 3',
          desc:'Ao receber crítico, Escamado conta como o dobro até o fim do turno.' },
        { id:'rex_n2', nome:'Instinto de Sobrevivência', req:'CON 3',
          desc:'Abaixo de 30% da Vida: +1 dado em todos os testes físicos defensivos.',
          efeito:{ tipo:'dado', delta:1, condicional:'Vida < 30%' } },
        { id:'rex_n3', nome:'Ameaça Réptil', req:'Nível 4',
          desc:'Ao usar contato visual contínuo, o alvo sofre −1 dado no próximo teste contra o Rex.' }
      ],
      caminhos:[
        { nome:'Guerreiro Dracônico', nivel:5, foco:'Domínio marcial e pressão física.', habilidades:[
          { id:'rex_gd1', nome:'Escalada de Fúria', req:'Nível 5',
            desc:'Após receber dano, próximo ataque corpo a corpo causa +1d4 físico adicional.' },
          { id:'rex_gd2', nome:'Corpo de Predador', req:'Nível 6',
            desc:'Garras ignoram 25% da RD do alvo.' },
          { id:'rex_gd3', nome:'Pressão Corporal', req:'Nível 8',
            desc:'2+ sucessos num ataque Bruto: alvo é Empurrado 1u automaticamente.' },
          { id:'rex_gd4', nome:'Vitalidade Dracônica', req:'Nível 10',
            desc:'Ao derrotar inimigo em combate direto, recupera 3 + CON de Vida.',
            efeito:{ tipo:'cura', formula:'3+CON' } },
          { id:'rex_gd5', nome:'Predador Implacável', req:'Nível 14',
            desc:'Contra alvos abaixo de 50% de Vida: +1 dado em ações Brutas.',
            efeito:{ tipo:'dado', delta:1, condicional:'Alvo < 50% Vida' } },
          { id:'rex_gd6', nome:'Senhor do Campo', req:'Nível 18',
            desc:'1x/cena ao derrotar inimigo: todos adjacentes testam VON ou -1 dado até próximo turno.' }
        ]},
        { nome:'Sangue Místico', nivel:5, foco:'Potencial mágico dracônico.', habilidades:[
          { id:'rex_sm1', nome:'Canalização Elemental', req:'Nível 5',
            desc:'Habilidades do Drakon Aima custam -3 Mana.' },
          { id:'rex_sm2', nome:'Escamas Condutoras', req:'Nível 6',
            desc:'RM do Escamado também reduz 1 grau de condições elementais recebidas.' },
          { id:'rex_sm3', nome:'Despertar Ampliado', req:'Nível 8',
            desc:'Passivos e garras do gene elemental atual operam como 1 estágio acima.' },
          { id:'rex_sm4', nome:'Vínculo Primordial', req:'Nível 10',
            desc:'Em Transformação Parcial, magias de Ampliação custam 25% menos Mana.' },
          { id:'rex_sm5', nome:'Mente Dracônica', req:'Nível 14',
            desc:'Vantagem em testes de Vontade contra magia de controle e encantamento.' },
          { id:'rex_sm6', nome:'Legado do Ancião', req:'Nível 18',
            desc:'1x/dia pode ativar o próximo estágio do Drakon Aima por 1 cena sem custo de Mana.' }
        ]}
      ]
    },
    variacoes:[
      { id:'rex_v1', nome:'Vallerohk', desc:'Forjado entre Dragões e Tecnologia. Habilidades elementais Forte II +10% dano. +1 Cognição. Sem desvantagem em climas neutros sem progressão elemental.' },
      { id:'rex_v2', nome:'Hae', desc:'Erudito e Calculado. +1 Influência. Resistência a revelação dobra no Fraco I. Acesso a Escola Mundanas sem restrição.' },
      { id:'rex_v3', nome:'Alsahra', desc:'Deserto e Sangue. Forte I ativa bônus de clima quente fora de Alsahra. +1 Travessia. Desvantagem de frio apenas em condições extremas.' }
    ]
  },
  {
    name:'Metamorfo', classificacao:'Base',
    conceito:'Agressores instintivos e poderosos. Pouco controle fino, improvisação mínima.',
    atributos:{ FOR:0,CON:1,AGI:2,DES:1,VIDA:1,DEF:0,VON:1,PER:0,INT:0,SAB:0,MAG:1,RESM:0,CAR:1,ATQ:0 },
    modos:{ Bruto:4,Ágil:3,Preciso:0,Intuitivo:1 },
    observacao:'Agressores instintivos. Pouco controle fino, improvisação mínima.',
    proficiencias:{ armas:'Leves e Médias', armaduras:'Leves', escolas:['Ampliação'], afinidades:[], tipoMagico:['Bruxaria'], skillsIniciais:2, periciasBonus:'Travessia' },
    habilidades:[], progressao:{ nucleo:[], caminhos:[] }, variacoes:[]
  },
  {
    name:'Bestiais', classificacao:'Base',
    conceito:'Ursines e Lupinos. Entre a besta e a consciência.',
    atributos:{ FOR:1,CON:1,AGI:0,DES:-1,VIDA:0,DEF:0,VON:-2,PER:2,INT:0,SAB:0,MAG:0,RESM:0,CAR:-1,ATQ:0,Sorte:0 },
    modos:{ Bruto:3,Ágil:1,Preciso:2,Intuitivo:2 },
    observacao:'Escolha linhagem na criação: Ursine (+1 FOR, Bruto 3/Ágil 1/Preciso 2/Int 2) ou Lupino (+1 AGI, Bruto 2/Ágil 3/Preciso 2/Int 1). Lupinos não usam armaduras pesadas.',
    proficiencias:{ 
      armas:'Leves e Pesadas (Lupino: ❌ sem pesadas)', 
      armaduras:'Todas (❌ Lupino sem pesadas)', 
      escolas:['Ampliação','Conjuração (escolha 1)'], 
      afinidades:['Sombra','Raio','Fogo','Gelo (habitat específico)'], 
      tipoMagico:['Bruxaria'], 
      skillsIniciais:2, 
      periciasBonus:'Travessia · Investigação'
    },
    subraças:[
      {
        name:'Ursine',
        atributos:{ FOR:2,CON:1,AGI:0,DES:-1,VIDA:0,DEF:0,VON:-2,PER:2,INT:0,SAB:0,MAG:0,RESM:0,CAR:-1,ATQ:0 },
        modos:{ Bruto:3,Ágil:1,Preciso:2,Intuitivo:2 },
        passiva:'Ursine: bônus +1 FOR. Armaduras e armas pesadas permitidas.'
      },
      {
        name:'Lupino',
        atributos:{ FOR:1,CON:1,AGI:1,DES:-1,VIDA:0,DEF:0,VON:-2,PER:2,INT:0,SAB:0,MAG:0,RESM:0,CAR:-1,ATQ:0 },
        modos:{ Bruto:2,Ágil:3,Preciso:2,Intuitivo:1 },
        passiva:'Lupino: bônus +1 AGI. ❌ Sem armaduras pesadas. ❌ Sem armas pesadas. Preferência por armas leves e médias.'
      }
    ],
    habilidades:[
      { id:'bes_1', nome:'Fúria Primal', tipo:'passiva',
        desc:'Quando abaixo da metade da Vida: Vantagem em todos os testes físicos. +1 Margem de Ameaça. Dano adicional: 2 + Nível.',
        efeito:{ tipo:'dado', condicional:'Vida < 50%' } },
      { id:'bes_2', nome:'Sentidos Aguçados', tipo:'passiva',
        desc:'Vantagem em Percepção. Não pode receber ataques surpresa. Incompatível com armadura pesada (reduz percepção).' },
      { id:'bes_3', nome:'Regeneração', tipo:'passiva',
        desc:'Fora de combate, recupera Vida acelerada (dobro da taxa normal de descanso).' },
      { id:'bes_4', nome:'Transformação Parcial', tipo:'ativa',
        desc:'1x por cena | 3 turnos (7 no nível 9 | Livre no nível 14). +2 ATQ | +100 Vida temporária | +2 Esquiva. Fúria Primal dobrada.',
        efeito:{ tipo:'atributo', mods:{ ATQ:2,DEF:2 }, duracao:'3 turnos' } },
      { id:'bes_5', nome:'Transformação Completa', tipo:'ativa',
        desc:'Nível 12. 1x por cena | 5 turnos (Livre no nível 18). +4 ATQ | +200 Vida temporária | +4 Esquiva | -2 Vontade. Não pode falar ou usar magias que não sejam Ampliação.',
        efeito:{ tipo:'atributo', mods:{ ATQ:4,DEF:4,VON:-2 }, duracao:'5 turnos' } }
    ],
    progressao:{
      nucleo:[
        { id:'bes_n1', nome:'Faro de Predador', req:'Nível 3',
          desc:'Ao usar Sentidos Aguçados, pode rastrear alvo por odor/trilha por até 1 hora fora de combate.' },
        { id:'bes_n2', nome:'Natureza Indomável', req:'VON 2',
          desc:'Ao entrar em Fúria Primal, recupera imediatamente 5 + CON efetivo de Vida.',
          efeito:{ tipo:'cura', formula:'5 + CON' } },
        { id:'bes_n3', nome:'Instinto de Caça', req:'Nível 4',
          desc:'Ao atacar alvo já atingido neste combate, +1 dado no ataque.',
          efeito:{ tipo:'dado', delta:1, condicional:'Alvo já atingido no combate' } }
      ],
      caminhos:[
        { nome:'Besta Interior', nivel:5, foco:'Amplificar forma animal e instinto.', habilidades:[
          { id:'bes_b1', nome:'Sangue Selvagem', req:'Nível 5',
            desc:'Em Transformação Parcial, ataques causam +1d4 físico adicional.' },
          { id:'bes_b2', nome:'Cicatrização', req:'Nível 6',
            desc:'Em Transformação Parcial ou Completa, recupera 2 Vida/turno passivamente.' },
          { id:'bes_b3', nome:'Agressão Primordial', req:'Nível 8',
            desc:'Fúria Primal ativa mesmo acima de 50% de Vida por 1x/cena (ação bônus).' },
          { id:'bes_b4', nome:'Forma Estendida', req:'Nível 10',
            desc:'Transformação Parcial dura +2 turnos.' },
          { id:'bes_b5', nome:'Despertar Bestial', req:'Nível 14',
            desc:'Em Transformação Completa: imunidade a controle mental.' },
          { id:'bes_b6', nome:'Apex Predador', req:'Nível 18',
            desc:'1x/cena: Transformação Completa pode ser ativada como reação ao receber dano letal.' }
        ]},
        { nome:'Caçador Sombrio', nivel:5, foco:'Mobilidade, furtividade e caça.', habilidades:[
          { id:'bes_c1', nome:'Sombra da Floresta', req:'Nível 5',
            desc:'Vantagem em Furtividade em ambientes naturais.' },
          { id:'bes_c2', nome:'Salto do Predador', req:'Nível 6',
            desc:'1x/combate: teleporta até 4u para flanquear alvo (sem ataques de oportunidade).' },
          { id:'bes_c3', nome:'Emboscada Certeira', req:'Nível 8',
            desc:'Ao atacar de Furtividade: +2d6 dano adicional.',
            efeito:{ tipo:'dado', dado:'2d6', condicional:'Ataque de Furtividade' } },
          { id:'bes_c4', nome:'Rastro Silencioso', req:'Nível 10',
            desc:'Movimento nunca provoca ataques de oportunidade em terreno natural.' },
          { id:'bes_c5', nome:'Golpe da Sombra', req:'Nível 18',
            desc:'1x/cena: ataque invisível de qualquer posição. Inimigo não pode reagir.' }
        ]}
      ]
    },
    variacoes:[
      { id:'bes_v1', nome:'Ursine de Hae',             desc:'Interior Profundo. +1 Investigação. Regeneração funciona em descanso curto. Vantagem em identificação de plantas, venenos e criaturas.' },
      { id:'bes_v2', nome:'Lupino de Hallen',          desc:'Nativo do Gelo. +1 Travessia. Imune a frio extremo. Transformação Parcial +1 turno em frio intenso. Sem penalidade em neve/gelo.' }
    ]
  },
  {
    name:'Laika', classificacao:'Base',
    conceito:'Raça humanoide de origem animal — leal, perceptiva, sentidos aguçadíssimos. Modular por linhagem.',
    atributos:{ FOR:1,CON:1,AGI:1,DES:0,VIDA:1,DEF:0,VON:1,PER:2,INT:0,SAB:1,MAG:0,RESM:0,CAR:0,ATQ:0 },
    modos:{ Bruto:2,Ágil:2,Preciso:2,Intuitivo:2 },
    observacao:'Versáteis e perceptivos. Cada subtipo carrega traços do animal de origem.',
    proficiencias:{ armas:'Leves e Médias', armaduras:'Leves e Médias', escolas:['Ampliação','Controle'], afinidades:['Depende da linhagem'], tipoMagico:['Bruxaria'], skillsIniciais:2, periciasBonus:'Travessia, Percepção' },
    // Habilidades raciais base da Laika — instintos predatórios e sensoriais
    habilidades:[
      { id:'lai_1', nome:'Sentidos Aguçados', tipo:'passiva',
        desc:'+1 dado em testes baseados em percepção sensorial (olfato, audição, rastreamento).',
        efeito:{ tipo:'dado', delta:1, condicional:'Percepção sensorial (olfato, audição, rastreamento)' } },
      { id:'lai_2', nome:'Instinto Predatório', tipo:'passiva',
        desc:'Ao atacar alvo que ainda não agiu na rodada: +1 dado.',
        efeito:{ tipo:'dado', delta:1, condicional:'Alvo ainda não agiu na rodada' } },
      { id:'lai_3', nome:'Resistência Natural', tipo:'passiva',
        desc:'Recupera +1 Vida ao descansar em ambiente natural ou após vitória em combate.' },
      { id:'lai_4', nome:'Linhagem Bestial', tipo:'passiva',
        desc:'Ao entrar em qualquer Intensidade: +1 dado no primeiro ataque da cena.',
        efeito:{ tipo:'dado', delta:1, condicional:'Primeiro ataque após entrar em Intensidade' } }
    ],
    // Passivas intrínsecas da Laika — traços constantes de origem animal
    passivas:[
      { id:'lai_p1', nome:'Rastreador Nato', desc:'Pode rastrear por cheiro mesmo em ambiente urbano. +1 dado em seguir rastros.' },
      { id:'lai_p2', nome:'Terreno Familiar', desc:'Não sofre penalidades de terreno natural leve (mato, lama, neve leve).' },
      { id:'lai_neg1', nome:'Instinto Incontrolável', negativa:true, desc:'Ao sofrer dano acima de 50% da Vida em um único golpe, testa Vontade para não partir para o ataque.' },
      { id:'lai_neg2', nome:'Hiperreatividade Sensorial', negativa:true, desc:'Sons ou odores muito intensos causam -1 dado em testes de concentração.' }
    ],
    progressao:{
      nucleo:[
        { id:'lai_n1', nome:'Sangue de Predador', req:'Nível 3',
          desc:'Ao usar Intensidade 1 ou superior, o primeiro dano causado por turno ignora 1 ponto de Defesa.' },
        { id:'lai_n2', nome:'Vínculo de Matilha', req:'Von 3',
          desc:'Pode designar um aliado como parceiro de caçada. Ambos recebem +1 dado em testes cooperativos contra o mesmo alvo.',
          efeito:{ tipo:'dado', delta:1, condicional:'Aliado de matilha vs mesmo alvo' } },
        { id:'lai_n3', nome:'Instinto Aguçado', req:'Nível 4',
          desc:'Não pode ser surpreendido enquanto estiver em Intensidade 1 ou superior.' }
      ],
      caminhos:[
        { nome:'Caminho do Alfa', nivel:5, foco:'Liderança instintiva e domínio territorial.', habilidades:[
          { id:'lai_alfa_1', nome:'Presença Dominante',
            desc:'Aliados dentro do seu alcance sensorial recebem +1 dado contra alvos que você tenha ferido neste turno.',
            efeito:{ tipo:'dado', delta:1, condicional:'Aliado vs alvo ferido por você' } },
          { id:'lai_alfa_2', nome:'Hierarquia Natural', req:'Von 3',
            desc:'Pode suprimir Instabilidade Instintiva de aliados Laika próximos.' },
          { id:'lai_alfa_3', nome:'Marca Territorial', req:'Nível 7',
            desc:'Escolha um alvo. Enquanto ele estiver dentro do seu campo sensorial: ele sofre -1 dado ao atacar qualquer aliado que não seja você.' },
          { id:'lai_alfa_4', nome:'Uivo Primordial', req:'Nível 9',
            desc:'Uma vez por confronto, pode: reduzir em 1 o Instinto de todos aliados OU aumentar em 1 o Instinto de todos inimigos próximos (medo, tensão).' }
        ]},
        { nome:'Caminho do Predador', nivel:5, foco:'Execução, perseguição e domínio físico.', habilidades:[
          { id:'lai_pred_1', nome:'Caçada Focada',
            desc:'Recebe +1 dado contra alvos que já tenham sofrido dano seu.',
            efeito:{ tipo:'dado', delta:1, condicional:'Alvo já ferido por você' } },
          { id:'lai_pred_2', nome:'Intensificação Controlada', req:'Sab 3',
            desc:'Ao entrar em Intensidade 2 ou 3, pode ignorar o primeiro teste de Instinto da cena.' },
          { id:'lai_pred_3', nome:'Golpe Vital', req:'Intensidade 2',
            desc:'Se obtiver 2+ sucessos adicionais, impõe condição física (sangramento, imobilização leve, queda).' },
          { id:'lai_pred_4', nome:'Forma Apex', req:'Nível 9',
            desc:'Enquanto em Intensidade 3: +1 sucesso automático em ataques naturais. Não testa Instinto ao sofrer dano.' }
        ]},
        { nome:'Caminho do Guardião Ancestral', nivel:5, foco:'Resistência e proteção.', habilidades:[
          { id:'lai_guard_1', nome:'Corpo Inabalável',
            desc:'Cada Alter Form defensiva ativa concede +1 adicional em Def (máx. +2).',
            efeito:{ tipo:'atributo', mods:{ DEF:1 }, condicional:'Por Alter Form defensiva (máx 2)' } },
          { id:'lai_guard_2', nome:'Instinto Protetor', req:'Von 3',
            desc:'Pode direcionar ataques feitos contra aliado adjacente para si.' },
          { id:'lai_guard_3', nome:'Pele de Guerra', req:'Intensidade 2',
            desc:'Reduz dano físico recebido em 1 adicional.' },
          { id:'lai_guard_4', nome:'Manifestação Totêmica', req:'Nível 9',
            desc:'Ao entrar em Forma Bestial Total: aliados próximos recebem +1 Defesa. Você ignora penalidade mental ao retornar.',
            efeito:{ tipo:'atributo', mods:{ DEF:1 }, condicional:'Aliados próximos' } }
        ]},
        { nome:'Caminho do Sibilante', nivel:5, foco:'Controle e manipulação corporal.', habilidades:[
          { id:'lai_sib_1', nome:'Movimento Hipnótico',
            desc:'Recebe +1 dado em ações para distrair ou confundir.',
            efeito:{ tipo:'dado', delta:1, condicional:'Distrair/confundir' } },
          { id:'lai_sib_2', nome:'Constrição Instintiva', req:'Intensidade 2',
            desc:'Ao agarrar, alvo sofre -1 dado contínuo enquanto preso.' },
          { id:'lai_sib_3', nome:'Metabolismo Frio', req:'Con 3',
            desc:'Pode reduzir seu Instinto em 1 ao permanecer imóvel por 1 turno.' },
          { id:'lai_sib_4', nome:'Muda Profunda', req:'Nível 9',
            desc:'Uma vez por cena, pode: Encerrar todas Alter Forms + Remover uma condição negativa + Reduzir Instinto a 0.' }
        ]}
      ]
    },
    subraças:[
      {
        name:'Urso',
        atributos:{ FOR:3,CON:3,AGI:0,DES:-1,VIDA:3,DEF:1,VON:1,PER:2,INT:-1,SAB:1,MAG:0,RESM:1,CAR:0,ATQ:1 },
        modos:{ Bruto:4,Ágil:1,Preciso:1,Intuitivo:2 },
        passiva:'Massa Imponente — Não pode ser empurrado ou derrubado por efeitos de força leve/média.',
        negativa:'-1 dado em testes de furtividade.',
        alterForms:[
          { id:'af_urso_1', nome:'Pele Espessa', desc:'+1 Def, -1 Agi enquanto ativo.',
            efeito:{ tipo:'atributo', mods:{ DEF:1, AGI:-1 } } },
          { id:'af_urso_2', nome:'Mandíbula Expandida', desc:'Se causar dano, impõe -1 dado ao alvo no próximo turno.' },
          { id:'af_urso_3', nome:'Garras Alongadas', desc:'+1 dano natural. Não pode usar armas delicadas.',
            efeito:{ tipo:'dano', delta:1 } }
        ],
        intensidades:[
          { nivel:1, nome:'Instinto Elevado',  mods:{ FOR:1,AGI:1,PER:1 }, desc:'Traços visíveis aumentam. Sem penalidades mentais.' },
          { nivel:2, nome:'Meio Bestial',       mods:{ FOR:2,AGI:2,PER:2,INT:-1 }, desc:'Deve testar Vontade para ignorar provocação direta.' },
          { nivel:3, nome:'Predador Manifesto', mods:{ FOR:3,AGI:3,PER:2,INT:-2,SAB:-1 }, desc:'Ao sofrer dano significativo, testa Vontade para não atacar agressor.' }
        ],
        formaBestial:{ mods:{ FOR:3,AGI:3,PER:3,INT:-3,CON:2 }, bonus:'Con +2 adicional' }
      },
      {
        name:'Lobo',
        atributos:{ FOR:1,CON:1,AGI:3,DES:1,VIDA:1,DEF:0,VON:2,PER:3,INT:0,SAB:1,MAG:0,RESM:0,CAR:1,ATQ:2 },
        modos:{ Bruto:3,Ágil:3,Preciso:1,Intuitivo:2 },
        passiva:'Instinto de Matilha — +1 dado ao agir após aliado.',
        negativa:'Testa Vontade para não perseguir alvo ferido em fuga.',
        alterForms:[
          { id:'af_lobo_1', nome:'Sentidos Afiados', desc:'+1 Per, ignora penalidade de baixa luz.',
            efeito:{ tipo:'atributo', mods:{ PER:1 } } },
          { id:'af_lobo_2', nome:'Garras Alongadas', desc:'+1 dano natural.',
            efeito:{ tipo:'dano', delta:1 } },
          { id:'af_lobo_3', nome:'Membros Elásticos', desc:'+1 Agi, salto ampliado.',
            efeito:{ tipo:'atributo', mods:{ AGI:1 } } }
        ],
        intensidades:[
          { nivel:1, nome:'Instinto Elevado',  mods:{ FOR:1,AGI:1,PER:1 }, desc:'Sem penalidades mentais.' },
          { nivel:2, nome:'Meio Bestial',       mods:{ FOR:2,AGI:2,PER:2,INT:-1 }, desc:'Testa Vontade para ignorar provocação.' },
          { nivel:3, nome:'Predador Manifesto', mods:{ FOR:3,AGI:3,PER:2,INT:-2,SAB:-1 }, desc:'Reação instintiva ao dano.' }
        ],
        formaBestial:{ mods:{ FOR:3,AGI:3,PER:3,INT:-3 }, bonus:'Aliados próximos +1 dado' }
      },
      {
        name:'Lince',
        atributos:{ FOR:0,CON:0,AGI:3,DES:3,VIDA:0,DEF:1,VON:1,PER:4,INT:1,SAB:1,MAG:0,RESM:0,CAR:0,ATQ:1 },
        modos:{ Bruto:1,Ágil:3,Preciso:3,Intuitivo:2 },
        passiva:'Olhos da Penumbra — Ignora penalidade de baixa luz.',
        negativa:'VIDA -1 adicional.',
        alterForms:[
          { id:'af_lince_1', nome:'Membros Elásticos', desc:'+1 Agi, salto ampliado.',
            efeito:{ tipo:'atributo', mods:{ AGI:1 } } },
          { id:'af_lince_2', nome:'Sentidos Afiados', desc:'+1 Per, ignora baixa luz.',
            efeito:{ tipo:'atributo', mods:{ PER:1 } } },
          { id:'af_lince_3', nome:'Corpo Flexível', desc:'Atravessa espaços estreitos, +1 fuga.' }
        ],
        intensidades:[
          { nivel:1, nome:'Instinto Elevado',  mods:{ FOR:1,AGI:1,PER:1 }, desc:'Traços visíveis.' },
          { nivel:2, nome:'Meio Bestial',       mods:{ FOR:2,AGI:2,PER:2,INT:-1 }, desc:'Voz alterada.' },
          { nivel:3, nome:'Predador Manifesto', mods:{ FOR:3,AGI:3,PER:2,INT:-2,SAB:-1 }, desc:'Forma quase animal.' }
        ],
        formaBestial:{ mods:{ FOR:3,AGI:3,PER:3,INT:-3 }, bonus:'+1 sucesso em emboscadas' }
      },
      {
        name:'Gato do Mato',
        atributos:{ FOR:0,CON:0,AGI:3,DES:2,VIDA:1,DEF:1,VON:1,PER:3,INT:1,SAB:0,MAG:0,RESM:0,CAR:2,ATQ:1 },
        modos:{ Bruto:1,Ágil:4,Preciso:1,Intuitivo:3 },
        passiva:'Equilíbrio Absoluto — Nunca sofre penalidade por terreno instável leve.',
        negativa:'CON -1 adicional.',
        alterForms:[
          { id:'af_gato_1', nome:'Membros Elásticos', desc:'+1 Agi, salto ampliado.',
            efeito:{ tipo:'atributo', mods:{ AGI:1 } } },
          { id:'af_gato_2', nome:'Corpo Flexível', desc:'Atravessa espaços estreitos, +1 fuga.' },
          { id:'af_gato_3', nome:'Sentidos Afiados', desc:'+1 Per, ignora penalidade de baixa luz.',
            efeito:{ tipo:'atributo', mods:{ PER:1 } } }
        ],
        intensidades:[
          { nivel:1, nome:'Instinto Elevado',  mods:{ FOR:1,AGI:1,PER:1 }, desc:'Postura leve.' },
          { nivel:2, nome:'Meio Bestial',       mods:{ FOR:2,AGI:2,PER:2,INT:-1 }, desc:'Reflexos instintivos.' },
          { nivel:3, nome:'Predador Manifesto', mods:{ FOR:3,AGI:3,PER:2,INT:-2,SAB:-1 }, desc:'Movimentos totalmente instintivos.' }
        ],
        formaBestial:{ mods:{ FOR:3,AGI:3,PER:3,INT:-3 }, bonus:'Defesa +1 constante' }
      },
      {
        name:'Serpente',
        atributos:{ FOR:0,CON:2,AGI:2,DES:3,VIDA:1,DEF:0,VON:2,PER:3,INT:1,SAB:2,MAG:1,RESM:2,CAR:0,ATQ:1 },
        modos:{ Bruto:1,Ágil:2,Preciso:3,Intuitivo:3 },
        passiva:'Movimento Sinuoso — Pode escapar de agarrões com vantagem.',
        negativa:'FOR -1 adicional.',
        alterForms:[
          { id:'af_serp_1', nome:'Corpo Flexível', desc:'Atravessa espaços estreitos, +1 fuga.' },
          { id:'af_serp_2', nome:'Sentidos Afiados', desc:'+1 Per, ignora penalidade de baixa luz.',
            efeito:{ tipo:'atributo', mods:{ PER:1 } } },
          { id:'af_serp_3', nome:'Garras Alongadas', desc:'+1 dano, não pode usar armas delicadas.',
            efeito:{ tipo:'dano', delta:1 } }
        ],
        intensidades:[
          { nivel:1, nome:'Instinto Elevado',  mods:{ FOR:1,AGI:1,PER:1 }, desc:'Movimentos sinuosos acentuados.' },
          { nivel:2, nome:'Meio Bestial',       mods:{ FOR:2,AGI:2,PER:2,INT:-1 }, desc:'Língua bifurcada evidente.' },
          { nivel:3, nome:'Predador Manifesto', mods:{ FOR:3,AGI:3,PER:2,INT:-2,SAB:-1 }, desc:'Imobiliza ao obter 2+ sucessos.' }
        ],
        formaBestial:{ mods:{ FOR:3,AGI:3,PER:3,INT:-3 }, bonus:'Imobiliza com 2+ sucessos' }
      }
    ],
    // Variações de locus cultural — complementar às subraças; aplica-se após escolher subtipo
    variacoes:[
      { id:'lai_v1', nome:'Selvagem',  desc:'Criado em natureza indomada. +1 dado em sobrevivência. Ignora penalidade de terreno denso.',
        efeito:{ tipo:'dado', delta:1, condicional:'Sobrevivência em natureza indomada' } },
      { id:'lai_v2', nome:'Clânico',   desc:'Vinculado a um clã ancestral. +1 dado ao agir para proteger aliados do mesmo grupo.' ,
        efeito:{ tipo:'dado', delta:1, condicional:'Proteger aliados do mesmo clã' } },
      { id:'lai_v3', nome:'Errante',   desc:'Sem clã fixo. Adapta-se com facilidade. Ignora penalidade da primeira rodada em ambiente desconhecido.' }
    ]
  },
  {
    name:'Elfo', classificacao:'Base',
    conceito:'Movimentos leves e precisos, improvisação lógica. Frágil fisicamente, excelente em controle e execução.',
    atributos:{ FOR:-1,CON:-1,AGI:2,DES:3,VIDA:-1,DEF:1,VON:1,PER:3,INT:2,SAB:2,MAG:2,RESM:1,CAR:1,ATQ:1 },
    modos:{ Bruto:0,Ágil:4,Preciso:4,Intuitivo:3 },
    observacao:'Movimentos leves e precisos, improvisação lógica. Frágil fisicamente.',
    habilidades:[
      { id:'elf_1', nome:'Graça Natural', tipo:'passiva',
        desc:'Ao mover-se antes de agir: +1 dado na ação seguinte.',
        efeito:{ tipo:'dado', delta:1, condicional:'Após movimento no mesmo turno' } },
      { id:'elf_2', nome:'Percepção Aguçada', tipo:'passiva',
        desc:'+1 dado em testes de percepção passiva e rastreamento visual.',
        efeito:{ tipo:'dado', delta:1, condicional:'Percepção passiva e rastreamento visual' } },
      { id:'elf_3', nome:'Sintonia Arcana', tipo:'passiva',
        desc:'Magias com base em DES ou PER recebem +1 de alcance ou duração.' },
      { id:'elf_4', nome:'Passo Silencioso', tipo:'passiva',
        desc:'+1 dado em furtividade ao mover-se. Nunca deixa rastros em terreno natural.',
        efeito:{ tipo:'dado', delta:1, condicional:'Furtividade em movimento' } }
    ],
    progressao:{
      nucleo:[
        { id:'elf_n1', nome:'Reflexo Superior', req:'Nível 3',
          desc:'Uma vez por cena: pode agir antes de um oponente que tenha iniciativa maior.' },
        { id:'elf_n2', nome:'Harmonia Corporal', req:'DES 4',
          desc:'Ao obter 2+ sucessos em Ágil ou Preciso: próximo teste do mesmo modo +1 dado.' },
        { id:'elf_n3', nome:'Domínio do Silêncio', req:'AGI 3',
          desc:'Ignora penalidade de terreno leve para furtividade.' }
      ],
      caminhos:[
        { nome:'Arqueiro Fantasma', nivel:5, foco:'Precisão à distância.', habilidades:[
          { id:'elf_e1', nome:'Tiro Certeiro', req:'DES 4',
            desc:'Ataques à distância com 2+ sucessos ignoram 1 ponto de Defesa.' },
          { id:'elf_e2', nome:'Salva Relâmpago', req:'Tiro Certeiro',
            desc:'Pode atacar dois alvos diferentes com -1 dado cada. Só com arco ou arremesso.' },
          { id:'elf_e3', nome:'Olho de Aguia', req:'Nível 8',
            desc:'Sem penalidade de distância longa. +1 dado em emboscadas à distância.' }
        ]},
        { nome:'Dançarino das Lâminas', nivel:5, foco:'Combate ágil corpo a corpo.', habilidades:[
          { id:'elf_d1', nome:'Fluxo de Combate',
            desc:'Após desviar/defender com sucesso: +1 dado no próximo ataque.',
            efeito:{ tipo:'dado', delta:1, condicional:'Após defesa bem-sucedida' } },
          { id:'elf_d2', nome:'Corte Duplo', req:'Fluxo de Combate',
            desc:'Com duas armas leves: pode fazer dois ataques por turno com -1 dado cada.' },
          { id:'elf_d3', nome:'Dança Fantasma', req:'Nível 8',
            desc:'Por 2 turnos: esquiva automática de um ataque por rodada (sem teste).' }
        ]}
      ]
    },
    variacoes:[
      { id:'elf_v1', nome:'Florestal', desc:'+1 dado em ambientes naturais. Rastreia sem deixar rastros em qualquer terreno.' },
      { id:'elf_v2', nome:'Sombrio',   desc:'+1 dado em furtividade noturna. Visão no escuro até 10m.' },
      { id:'elf_v3', nome:'Solar',     desc:'+1 dado em magia arcana diurna. +1 RESM contra efeitos de escuridão.' }
    ]
  },
  {
    name:'Siren', classificacao:'Base',
    conceito:'Voz que comanda. Presença que domina. Água que abraça.',
    atributos:{ FOR:-1,CON:0,AGI:1,DES:0,VIDA:0,DEF:0,VON:2,PER:1,INT:1,SAB:0,MAG:2,RESM:0,CAR:2,ATQ:0,Sorte:4 },
    modos:{ Bruto:0,Ágil:2,Preciso:2,Intuitivo:4 },
    observacao:'Voz encantadora. Sorte +4. Fragilidade em climas áridos. Usa armaduras leves e armas leves. Afinidade com Água, Sombra e Luz.',
    proficiencias:{ 
      armas:'Leves (proficiência superior com cabos longos)', 
      armaduras:'Leves (❌ sem armaduras na Forma Aquática)', 
      escolas:['Ataque','Controle','Ampliação','Conjuração','Mundanas'], 
      afinidades:['Água (nível 2)','Sombra','Luz'], 
      tipoMagico:['Feitiçaria','Arcana'], 
      skillsIniciais:3, 
      periciasBonus:'Performance · Influência',
      progressao:'Canto (buff/controle/aura) · Forma Aquática · Penalidades severas em calor/aridez'
    },
    habilidades:[
      { id:'sir_1', nome:'Canto', tipo:'ativa',
        desc:'Canta para inspirar aliados: bônus +1/+2/+3/+4 em todos os testes (níveis 1/5/9/14). Recupera 1 PV/turno nos afetados. Custo: 1 PM/turno | Siren parada | Alcance 10u. Nível 7 — Canto de Encantamento: inimigos testam VON oposto. Falha → encantados enquanto canta.' },
      { id:'sir_2', nome:'Passos Graciosos', tipo:'passiva',
        desc:'Sem penalidade em terreno difícil. Vantagem em testes contra armadilhas.' },
      { id:'sir_3', nome:'Forma Aquática', tipo:'ativa',
        desc:'Ao mergulhar em corpo d\'água: +2 Esquiva | +2 Poder Mágico | Pode respirar na água. Não pode usar armadura na Forma Aquática.',
        efeito:{ tipo:'atributo', mods:{ DEF:2,MAG:2 }, condicional:'Em corpo d\'água' } },
      { id:'sir_4', nome:'Aura', tipo:'passiva',
        desc:'Nível 12. Diâmetro 10u: aliados recebem Vantagem em todas as ações. Passivo permanente enquanto ativa.' },
      { id:'sir_neg1', nome:'Fragilidade Árida', tipo:'passiva', negativa:true,
        desc:'Desvantagem em todas as ações em ambientes áridos e quentes. Desvantagem se desidratada.' }
    ],
    progressao:{
      nucleo:[
        { id:'sir_n1', nome:'Voz Penetrante', req:'Nível 3',
          desc:'Canto de Encantamento passa a afetar 1 inimigo adicional mesmo que o primeiro tenha resistido.' },
        { id:'sir_n2', nome:'Presença Atordoante', req:'CAR 3',
          desc:'1x por cena, ao entrar em cena social ou combate, pode forçar 1 alvo a testar VON ou ficar Atordoado por 1 turno.' },
        { id:'sir_n3', nome:'Ressonância Mágica', req:'Nível 4',
          desc:'Ao lançar magia de Controle enquanto canta, o alvo sofre -1 dado na resistência.' }
      ],
      caminhos:[
        { nome:'Voz Soberana', nivel:5, foco:'Controle e encantamento avançado.', habilidades:[
          { id:'sir_v1', nome:'Melodia Vinculante', req:'Nível 5',
            desc:'Alvos encantados pelo Canto sofrem -1 dado em todos os testes contra a Siren.' },
          { id:'sir_v2', nome:'Harmonia Forçada', req:'Nível 6',
            desc:'Enquanto inimigo estiver encantado, pode gastar 1 PM para fazê-lo agir contra aliado dele.' },
          { id:'sir_v3', nome:'Coro de Caos', req:'Nível 8',
            desc:'Canto de Encantamento afeta todos inimigos na área (1x/cena, custo: 3 PM extras).' },
          { id:'sir_v4', nome:'Vínculo Permanente', req:'Nível 10',
            desc:'Encantamento dura 1 turno adicional após a Siren parar de cantar.' },
          { id:'sir_v5', nome:'Soberana do Canto', req:'Nível 14',
            desc:'Pode cantar e se mover ao mesmo tempo (remove restrição de ficar parada).' },
          { id:'sir_v6', nome:'Voz Absoluta', req:'Nível 18',
            desc:'1x/dia: Canto que não permite resistência por 1 turno completo.' }
        ]},
        { nome:'Maré Profunda', nivel:5, foco:'Magia aquática e poder elemental.', habilidades:[
          { id:'sir_m1', nome:'Pulso das Profundezas', req:'Nível 5',
            desc:'Magias de Água causam +15% dano.' },
          { id:'sir_m2', nome:'Corrente Sutil', req:'Nível 6',
            desc:'Pode deslocar inimigos 1u por turno dentro de área aquática (sem ação).' },
          { id:'sir_m3', nome:'Vínculo com a Maré', req:'Nível 8',
            desc:'Forma Aquática ativa em qualquer superfície úmida (não apenas corpos d\'água).' },
          { id:'sir_m4', nome:'Pressão Abissal', req:'Nível 10',
            desc:'Magias de Água aplicam Ralentado por 1 turno como efeito secundário.' },
          { id:'sir_m5', nome:'Tempestade Interior', req:'Nível 14',
            desc:'1x/cena: zona aquática raio 4u por 3 turnos. Aliados: +1 dado mágico; inimigos: -1 dado físico.' },
          { id:'sir_m6', nome:'Leviatã Desperto', req:'Nível 18',
            desc:'1x/dia: Forma Aquática ativa em terra por 3 turnos com todos os bônus.' }
        ]}
      ]
    },
    variacoes:[
      { id:'sir_v1', nome:'Kentrikos',  desc:'Cosmopolita. +1 Influência. Canto inicia 1 turno mais rápido. Vantagem em Persuasão e Negociação formais.' },
      { id:'sir_v2', nome:'Severnoye',  desc:'Aquática Militarizada. +1 Percepção. Forma Aquática +1 Esquiva adicional. Armaduras leves reforçadas sem perder bônus da Forma Aquática.' }
    ]
  },
  {
    name:'Faerie', classificacao:'Base',
    conceito:'Ser feérico de dualidade morfológica. Extremamente ágil e social, frágil em combate direto. Travessura e manipulação são sua essência.',
    atributos:{ FOR:-3,CON:-2,AGI:3,DES:2,VIDA:-2,DEF:-2,VON:1,PER:2,INT:2,SAB:2,MAG:1,RESM:1,CAR:3,ATQ:0 },
    modos:{ Bruto:1,Ágil:3,Preciso:2,Intuitivo:3 },
    observacao:'Raça mais frágil em combate direto (DEF -2, VIDA -2 são penalidades reais). Compensa com mobilidade, social e Dualidade Morfológica.',
    proficiencias:{ 
      armas:'Sem proficiência com pesadas', 
      armaduras:'Leves (incapaz na prática)', 
      escolas:['Conjuração','Controle','Mundanas'], 
      afinidades:['Água','Vento (nível 2 em habitat nativo)'], 
      tipoMagico:['Feitiçaria'], 
      skillsIniciais:2, 
      periciasBonus:'Influência · Precisão',
      progressao:'1 magia no nível 1 · nova magia em nível par · escolas: nível 4/8/12/16/20 · habilidades raciais em níveis ímpares · -2 PM em magias · vantagem em Percepção e testes mágicos · habilidades dobradas em habitat nativo'
    },
    habilidades:[
      { id:'fae_1', nome:'Dualidade Morfológica', tipo:'passiva',
        desc:'Pode alternar entre Forma Humanoide e Forma Feérica no início do turno, sem custo. Forma Feérica: FOR -1, DEF -1, AGI +1, PER +1 — ganha voo leve, atravessa espaços estreitos, +1 dado furtividade, manipulação ambiental leve. Não pode usar armadura pesada ou equipamento de grande porte nessa forma.',
        efeito:{ tipo:'especial', nome:'Dualidade Morfológica' } },
      { id:'fae_2', nome:'Travessura Natural', tipo:'ativa',
        desc:'Uma vez por rodada: ao obter sucesso em Intuitivo não ofensivo, impõe -1 dado na próxima ação do alvo.',
        efeito:{ tipo:'dado', delta:-1, condicional:'1x/rodada, após sucesso Intuitivo não ofensivo, aplica ao alvo' } },
      { id:'fae_3', nome:'Encanto Leve', tipo:'passiva',
        desc:'+1 dado em interações sociais sutis (charme, distração, sedução). Não funciona para coerção.',
        efeito:{ tipo:'dado', delta:1, condicional:'Interação social leve/sutil' } },
      { id:'fae_4', nome:'Manipulação Sutil', tipo:'ativa',
        desc:'Altera pequenos elementos ambientais (brisa, aroma, reflexo, som, vibração) sem custo. Não causa dano direto.' },
      { id:'fae_5', nome:'Corpo Feérico', tipo:'passiva',
        desc:'Em Forma Feérica: +1 dado furtividade, flutua sobre terrenos instáveis, acessa locais inacessíveis.',
        efeito:{ tipo:'dado', delta:1, condicional:'Forma Feérica + furtividade' } },
      { id:'fae_6', nome:'Essência Natural', tipo:'passiva',
        desc:'Recupera +1 ao descansar em ambiente natural.' },
      { id:'fae_7', nome:'Sensibilidade Exacerbada', tipo:'passiva',
        desc:'Percebe automaticamente distorções mágicas próximas.' }
    ],
    passivas:[
      { id:'fae_pass_pm',  nome:'−2 PM em Magias',       negativa:false, tipo:'passiva', desc:'Custo de mana de qualquer magia lançada é reduzido em 2 PM. Habilidades raciais ativas desbloqueiam em níveis ímpares.' },
      { id:'fae_pass_hab', nome:'Habilidades no Habitat', negativa:false, tipo:'passiva', desc:'Todas as habilidades raciais têm efeito dobrado em ambiente nativo (floresta feérica, jardins mágicos). Vantagem em Percepção e testes mágicos.' },
      { id:'fae_neg1',     nome:'Corpo Sutil',            negativa:true,  desc:'+1 dano de ataques físicos massivos contra você.' },
      { id:'fae_neg2',     nome:'Curiosidade Impulsiva',  negativa:true,  desc:'Ao encontrar algo novo e desconhecido: teste VON para evitar investigar imediatamente.' }
    ],
    progressao:{
      nucleo:[
        { id:'fae_n1', nome:'Passo Etéreo', req:'Nível 3',
          desc:'Uma vez por rodada em Forma Feérica: ignora obstáculos leves ao mover-se.' },
        { id:'fae_n2', nome:'Brincadeira Persistente', req:'Nível 3',
          desc:'Travessura Natural pode afetar dois alvos distintos por cena.' },
        { id:'fae_n3', nome:'Laço Natural', req:'SAB 3',
          desc:'Ao criar vínculo emocional com criatura (cena inteira de interação): +1 dado em todos os testes contra ela ou ao protegê-la.' }
      ],
      caminhos:[
        { nome:'Ninfa Encantadora', nivel:5, foco:'Influência emocional e social.', habilidades:[
          { id:'fae_a1', nome:'Encanto Profundo', req:'CAR 4',
            desc:'Vantagem em interações sociais encantatórias. Alvos encantados têm -1 dado para resistir aos seus efeitos.' },
          { id:'fae_a2', nome:'Laço Emocional', req:'Encanto Profundo',
            desc:'Alvos afetados por sua magia ou encanto sofrem -1 dado contra você pelo restante da cena.' },
          { id:'fae_a3', nome:'Domínio Feérico', req:'Nível 8',
            desc:'Uma vez por cena: impõe condição emocional (confuso, apavorado, encantado) a todos os inimigos próximos.' },
          { id:'fae_a4', nome:'Aura Irresistível', req:'Nível 11',
            desc:'Sua presença impõe -1 dado a inimigos que não tenham agido contra você ainda na cena.' }
        ]},
        { nome:'Espírito Travesso', nivel:5, foco:'Manipulação de campo e anulação.', habilidades:[
          { id:'fae_s1', nome:'Interferência Fáe',
            desc:'+1 dado em ações para distrair, confundir ou interferir no ambiente.',
            efeito:{ tipo:'dado', delta:1, condicional:'Distração/confusão/interferência' } },
          { id:'fae_s2', nome:'Redirecionamento', req:'Interferência Fáe',
            desc:'Ao usar Travessura Natural com sucesso: redireciona o dano ou efeito do alvo para outro inimigo adjacente a ele (teste vs. VON do alvo).' },
          { id:'fae_s3', nome:'Campo de Caos', req:'Nível 7',
            desc:'Enquanto em Forma Feérica ativa: inimigos sofrem -1 dado em testes de concentração.' },
          { id:'fae_s4', nome:'Dança do Caos', req:'Nível 10',
            desc:'Uma vez por confronto: troca posição com aliado ou inimigo sem custo de ação.' }
        ]}
      ]
    },
    variacoes:[
      { id:'fae_v1', nome:'Silvana',   desc:'+1 dado em ambientes naturais. Forma Feérica ganha camuflagem natural (+1 dado adicional em furtividade).' },
      { id:'fae_v2', nome:'Urbana',    desc:'+1 dado em interações sociais em ambientes civilizados. Forma Humanoide mais convincente (+1 CAR efetivo).' },
      { id:'fae_v3', nome:'Anciã',     desc:'MAG +1. Manipulação Sutil pode afetar objetos até 5kg. +1 dado para perceber magia ou ilusão.' }
    ]
  },
  // ═══════════════════════════════════════════════ CELESTIAIS
  {
    name:'Anjo', classificacao:'Celestial',
    conceito:'Mensageiros e guardiões divinos, seres de luz que carregam a vontade dos planos superiores.',
    atributos:{ FOR:1,CON:1,AGI:2,DES:1,VIDA:1,DEF:2,VON:2,PER:2,INT:2,SAB:3,MAG:2,RESM:2,CAR:2,ATQ:1 },
    modos:{ Bruto:1,Ágil:2,Preciso:3,Intuitivo:2 },
    observacao:'Equilíbrio divino, precisão e estratégia.',
    proficiencias:{ armas:'Todas (ênfase em leves e médias)', armaduras:'Médias', escolas:['Ampliação','Controle','Mundanas'], afinidades:['Luz','Ar'], tipoMagico:['Arcana','Feitiçaria'], skillsIniciais:3, periciasBonus:'Sabedoria, Influência' },
    habilidades:[], progressao:{ nucleo:[], caminhos:[] }, variacoes:[]
  },
  {
    name:'Flügel', classificacao:'Celestial',
    conceito:'Soldado tático angelical. Intelecto arcano superior, estratégia estruturada, magia como cálculo.',
    atributos:{ FOR:1,CON:1,AGI:0,DES:1,VIDA:1,DEF:1,VON:2,PER:1,INT:3,SAB:1,MAG:2,RESM:2,CAR:1,ATQ:1 },
    modos:{ Bruto:2,Ágil:2,Preciso:3,Intuitivo:2 },
    observacao:'Dominância em estratégia e magia estruturada. Cálculo Absoluto permite usar Preciso no lugar de Intuitivo em magia.',
    proficiencias:{ armas:'Médias', armaduras:'Médias', escolas:['Ataque','Controle','Ampliação'], afinidades:['Ar','Luz'], tipoMagico:['Arcana'], skillsIniciais:3, periciasBonus:'Cognição, Investigação' },
    habilidades:[
      { id:'flu_1', nome:'Intelecto Arcano', tipo:'passiva',
        desc:'+1 sucesso em ações de cálculo lógico, estratégia ou magia estruturada com Preciso.',
        efeito:{ tipo:'sucesso', delta:1, condicional:'Cálculo/estratégia/magia estruturada via Preciso' } },
      { id:'flu_2', nome:'Cálculo Absoluto', tipo:'passiva',
        desc:'Pode substituir Intuitivo por Preciso em testes de magia ou estratégia (escolha antes do teste).' },
      { id:'flu_3', nome:'Arquitetura Mágica', tipo:'passiva',
        desc:'Magias estruturadas custam -1 de recurso (Mana, concentração ou componente).',
        efeito:{ tipo:'efeito', delta:-1, condicional:'Custo de magia estruturada' } },
      { id:'flu_4', nome:'Mente Superior', tipo:'passiva',
        desc:'Vantagem em resistências mentais. Imune a efeitos de medo.' }
    ],
    progressao:{
      nucleo:[
        { id:'flu_n1', nome:'Análise Antecipada', req:'Nível 3',
          desc:'Uma vez por rodada: declara ação defensiva após ver o resultado do oponente.',
          efeito:{ tipo:'reacao', condicional:'1x por rodada' } },
        { id:'flu_n2', nome:'Sobreposição Lógica', req:'VON 4',
          desc:'Trata um teste Preciso como +1 sucesso adicional. Uma vez por cena.',
          efeito:{ tipo:'sucesso', delta:1, condicional:'1x por cena, teste Preciso' } },
        { id:'flu_n3', nome:'Reestruturação Arcana', req:'Nível 4',
          desc:'Ao falhar em magia estruturada: recupera metade do custo e pode tentar novamente no próximo turno sem penalidade adicional.' }
      ],
      caminhos:[
        { nome:'Estrategista', nivel:5, foco:'Controle e superioridade intelectual.', habilidades:[
          { id:'flu_e1', nome:'Leitura de Campo',
            desc:'+1 dado contra alvos que já agiram nesta rodada.',
            efeito:{ tipo:'dado', delta:1, condicional:'Alvo já agiu na rodada' } },
          { id:'flu_e2', nome:'Exploração de Falhas', req:'Leitura de Campo',
            desc:'Se inimigo falhar contra você: +1 dado na próxima ação contra ele.',
            efeito:{ tipo:'dado', delta:1, condicional:'Após inimigo falhar contra você' } },
          { id:'flu_e3', nome:'Predição Tática', req:'Nível 7',
            desc:'Pode declarar a ação do oponente antes de ele rolar. Se acertar: +2 dados na resposta.',
            efeito:{ tipo:'dado', delta:2, condicional:'Predição correta da ação inimiga' } },
          { id:'flu_e4', nome:'Supremacia Tática', req:'Nível 9',
            desc:'Uma vez por confronto: -1 dado a todos os inimigos na rodada.' }
        ]},
        { nome:'Arquiteto Arcano', nivel:5, foco:'Construção mágica e poder estruturado.', habilidades:[
          { id:'flu_a1', nome:'Amplificação Arcana', req:'MAG 3',
            desc:'Magias ofensivas causam +2 dano.',
            efeito:{ tipo:'dano', delta:2, condicional:'Magia ofensiva' } },
          { id:'flu_a2', nome:'Arquitetura Superior', req:'Amplificação Arcana',
            desc:'Magias estruturadas ignoram 1 ponto de Resistência Mágica do alvo.' },
          { id:'flu_a3', nome:'Reescrita de Fluxo', req:'Nível 8',
            desc:'Uma vez por cena: altera tipo ou natureza de magia já lançada sem custo adicional.' },
          { id:'flu_a4', nome:'Fundamento Eterno', req:'Nível 11, INT 5',
            desc:'Magias estruturadas permanecem ativas passivamente sem custo de concentração.' }
        ]}
      ]
    },
    variacoes:[
      { id:'flu_v1', nome:'Celestial',   desc:'+1 dado em magia aérea ou espacial. Ignora penalidades de altitude.',
        efeito:{ tipo:'dado', delta:1, condicional:'Magia aérea ou espacial' } },
      { id:'flu_v2', nome:'Militar',     desc:'+1 Defesa seguindo plano previamente declarado.',
        efeito:{ tipo:'atributo', attr:'DEF', delta:1, condicional:'Seguindo plano declarado' } },
      { id:'flu_v3', nome:'Arcano-Puro', desc:'Magias +1 alcance. RESM +1.',
        efeito:{ tipo:'atributo', attr:'RESM', delta:1 } }
    ]
  },
  {
    name:'Ex Machina', classificacao:'Celestial',
    conceito:'Construto lógico, técnico, eficiente. Age por cálculo operacional, não por emoção.',
    atributos:{ FOR:0,CON:1,AGI:0,DES:1,VIDA:1,DEF:1,VON:3,PER:0,INT:2,SAB:0,MAG:1,RESM:2,CAR:-1,ATQ:0 },
    modos:{ Bruto:2,Ágil:3,Preciso:3,Intuitivo:1 },
    observacao:'Eficiência máxima, movimentos calculados. VON alta reflete controle operacional. CAR -1 reflete ausência de empatia natural.',
    proficiencias:{ 
      armas:'Todas', 
      armaduras:'Todas (pesadas muito exigem módulos)', 
      escolas:[], 
      afinidades:[], 
      tipoMagico:['Não-mágico (Energia; Núcleo: 25+4×nível)'], 
      skillsIniciais:4, 
      periciasBonus:'Cognição ×2',
      progressao:'Módulos: nível 3/6/9/12/15/18 · Não usa mana'
    },
    habilidades:[
      { id:'exm_1', nome:'Execução Programada', tipo:'passiva',
        desc:'Ao repetir ação na mesma cena: +1 dado cumulativo (máx. +2).',
        efeito:{ tipo:'dado', delta:1, max:2, condicional:'Mesma ação repetida na cena' } },
      { id:'exm_2', nome:'Estrutura Sintética', tipo:'passiva',
        desc:'Reduz todo dano recebido em 1 (após cálculos).',
        efeito:{ tipo:'reducaoDano', valor:1 } },
      { id:'exm_3', nome:'Análise Operacional', tipo:'ativa',
        desc:'Após observar alvo por 1 turno: +1 dado contra ele.',
        efeito:{ tipo:'dado', delta:1, condicional:'Alvo observado por 1 turno' } },
      { id:'exm_4', nome:'Imparcialidade Mecânica', tipo:'passiva',
        desc:'Vantagem contra efeitos emocionais ou de manipulação psicológica.' }
    ],
    progressao:{
      nucleo:[
        { id:'exm_n1', nome:'Otimização Contínua', req:'Nível 3',
          desc:'Mesma ação por 3 turnos consecutivos: +1 sucesso automático no 3º turno.' },
        { id:'exm_n2', nome:'Sistema de Redundância', req:'Con 3',
          desc:'Uma vez por cena: ignora uma condição negativa física.' },
        { id:'exm_n3', nome:'Processamento Avançado', req:'Int 3',
          desc:'Pode realizar ação técnica como ação secundária com -1 dado.' }
      ],
      caminhos:[
        { nome:'Executor', nivel:5, foco:'Eficiência ofensiva.', habilidades:[
          { id:'exm_e1', nome:'Ataque Calculado',
            desc:'Se agir antes do alvo: +1 sucesso automático.',
            efeito:{ tipo:'sucesso', delta:1, condicional:'Age antes do alvo' } },
          { id:'exm_e2', nome:'Perfuração Precisa', req:'Des 4',
            desc:'Ignora 1 ponto de Defesa do alvo.' },
          { id:'exm_e3', nome:'Eliminação Sistemática', req:'Nível 8',
            desc:'Ao reduzir alvo a 0 Vida: move-se e realiza outra ação com -2 dados.' }
        ]},
        { nome:'Supervisor', nivel:5, foco:'Controle e suporte técnico.', habilidades:[
          { id:'exm_s1', nome:'Análise de Campo',
            desc:'Aliados recebem +1 dado contra alvos que você analisou.',
            efeito:{ tipo:'dado', delta:1, condicional:'Aliado vs. alvo analisado' } },
          { id:'exm_s2', nome:'Reconfiguração Rápida', req:'Nível 6',
            desc:'Pode trocar equipamento ou postura sem custo de ação.' },
          { id:'exm_s3', nome:'Domínio Operacional', req:'Nível 8',
            desc:'Uma vez por confronto: concede vantagem a todos os aliados por 1 rodada.' }
        ]}
      ]
    },
    variacoes:[
      { id:'exm_v1', nome:'Bélico',     desc:'+1 dano em armas tecnológicas. Defesa +1 contra projéteis.',
        efeito:{ tipo:'atributo', attr:'DEF', delta:1, condicional:'Contra projéteis' } },
      { id:'exm_v2', nome:'Industrial', desc:'Manutenção pela metade. Recupera +1 Vida adicional ao ser reparado.' },
      { id:'exm_v3', nome:'Analítico',  desc:'+1 dado adicional em Análise Operacional. Analisa dois alvos simultaneamente.',
        efeito:{ tipo:'dado', delta:1, condicional:'Análise Operacional' } }
    ]
  },
  // ═══════════════════════════════════════════ EXCÊNTRICAS
  {
    name:'Hyakshin', classificacao:'Excêntrica',
    conceito:'Espíritos de origem oriental em forma humanoide. Equilíbrio entre mundos dos vivos e mortos.',
    atributos:{ FOR:0,CON:0,AGI:2,DES:2,VIDA:0,DEF:1,VON:2,PER:1,INT:1,SAB:3,MAG:2,RESM:2,CAR:0,ATQ:0 },
    modos:{ Bruto:2,Ágil:3,Preciso:3,Intuitivo:2 },
    observacao:'Equilíbrio. Técnica e força moderada, reflexos eficientes, improvisação limitada.',
    proficiencias:{ armas:'Leves e Médias', armaduras:'Leves', escolas:['Controle','Mundanas'], afinidades:['Ar','Sombra'], tipoMagico:['Feitiçaria'], skillsIniciais:3, periciasBonus:'Sabedoria, Furtividade' },
    habilidades:[], progressao:{ nucleo:[], caminhos:[] }, variacoes:[]
  },
  {
    name:'Nephilin', classificacao:'Excêntrica',
    conceito:'Filhos de anjos — poder imenso e maldição proporcional à sua origem.',
    atributos:{ FOR:1,CON:1,AGI:0,DES:0,VIDA:1,DEF:1,VON:3,PER:0,INT:1,SAB:1,MAG:2,RESM:1,CAR:1,ATQ:1 },
    modos:{ Bruto:3,Ágil:2,Preciso:3,Intuitivo:2 },
    observacao:'Força natural e estratégia moderada. Improvisação razoável.',
    proficiencias:{ armas:'Pesadas', armaduras:'Pesadas', escolas:['Ataque','Ampliação'], afinidades:['Luz','Fogo'], tipoMagico:['Arcana'], skillsIniciais:3, periciasBonus:'Influência, Sabedoria' },
    habilidades:[], progressao:{ nucleo:[], caminhos:[] }, variacoes:[]
  },
  {
    name:'Espírito Elemental', classificacao:'Excêntrica',
    conceito:'Nobreza primordial. Um elemento. Uma vontade.',
    atributos:{ FOR:-1,CON:-1,AGI:0,DES:2,VIDA:0,DEF:0,VON:1,PER:2,INT:0,SAB:0,MAG:3,RESM:1,CAR:0,ATQ:0 },
    modos:{ Bruto:1,Ágil:2,Preciso:4,Intuitivo:3 },
    observacao:'Nasce com afinidade máxima com 1 elemento único (escolhido na criação). Só pode usar magias desse elemento. Sem armas físicas (orgulho elemental). Habitat: Astra.',
    proficiencias:{ 
      armas:'❌ Não utiliza armas (orgulho elemental)', 
      armaduras:'Média', 
      escolas:['Ataque','Controle','Ampliação','Conjuração'], 
      afinidades:['1 Afinidade Elemental Máxima (única e exclusiva)'], 
      tipoMagico:['Feitiçaria'], 
      skillsIniciais:2, 
      periciasBonus:'Precisão',
      progressao:'Nova magia elemental em níveis pares · Só pode usar magias do próprio elemento'
    },
    habilidades:[
      { id:'ee_1', nome:'Elemento Primordial', tipo:'passiva',
        desc:'Afinidade máxima com 1 elemento único (definido na criação). Só pode usar magias desse elemento. +10% dano elemental passivo. Aprende 1 magia do elemento gratuitamente em cada nível par.',
        efeito:{ tipo:'especial', formula:'+10% dano elemental' } },
      { id:'ee_2', nome:'Visão Mágica', tipo:'passiva',
        desc:'Alcance 12u: enxerga fluxo de Mana, detecta conjuração ativa e revela invisibilidade mágica simples.' },
      { id:'ee_3', nome:'Nobreza Elemental', tipo:'passiva',
        desc:'Vantagem em Intimidação e imposição social. Desvantagem em Diplomacia empática. +1 dado em imposição/autoridade. Traço narrativo: arrogância, superioridade, orgulho de não empunhar armas.' },
      { id:'ee_4', nome:'Corpo Elemental', tipo:'passiva',
        desc:'Imune a: Veneno | Doença | Sangramento. Resistência 25% ao próprio elemento. Vulnerabilidade +25% ao elemento oposto.' }
    ],
    passivas:[
      { id:'ee_p1', nome:'Escalonamento Racial', desc:'Nível 5: +1 RESM. Nível 10: +1 VON. Nunca ultrapassa +3 em MAG pelo escalonamento racial.' }
    ],
    progressao:{
      nucleo:[
        { id:'ee_n1', nome:'Presença Majestosa', req:'Nível 3',
          desc:'Ao conjurar magia, 1 inimigo adjacente testa VON ou sofre -1 dado no próximo ataque.' },
        { id:'ee_n2', nome:'Fluxo de Astra', req:'MAG 3',
          desc:'1x por cena, recupera Mana igual a PER efetivo ao observar o fluxo mágico (ação bônus).' },
        { id:'ee_n3', nome:'Condutividade Elemental', req:'Nível 4',
          desc:'Ao aplicar condição elemental em alvo, ela dura +1 turno.' }
      ],
      caminhos:[
        { nome:'Catástrofe', nivel:3, foco:'Dano bruto elemental máximo.', habilidades:[
          { id:'ee_c1', nome:'Dano Adicional', req:'Nível 3',
            desc:'+10% dano elemental (total: +20% com o passivo).' },
          { id:'ee_c2', nome:'Penetração Mágica', req:'Nível 6',
            desc:'Magias ignoram 25% da Resistência Mágica do alvo.' },
          { id:'ee_c3', nome:'Explosão Concentrada', req:'Nível 9',
            desc:'1x por cena: dobra o dado base da magia lançada.' },
          { id:'ee_c4', nome:'Condição Automática', req:'Nível 12',
            desc:'Magias aplicam automaticamente o 1° grau de condição elemental (sem rolagem).' },
          { id:'ee_c5', nome:'Explosão Final', req:'Nível 18',
            desc:'1x/dia: lança magia com dado triplicado. Após: sem Mana por 2 turnos.' }
        ]},
        { nome:'Forma', nivel:3, foco:'Mobilidade e adaptação corporal.', habilidades:[
          { id:'ee_f1', nome:'Intangibilidade Parcial', req:'Nível 3',
            desc:'1x/cena: torna-se parcialmente intangível por 2 turnos (-50% dano físico recebido).' },
          { id:'ee_f2', nome:'Fluxo Contínuo', req:'Nível 6',
            desc:'Movimento nunca provoca ataque de oportunidade.' },
          { id:'ee_f3', nome:'Teleporte Elemental', req:'Nível 9',
            desc:'Teleporte elemental curto: 6u, sem custo de ação, 1x/turno.' },
          { id:'ee_f4', nome:'Atravessar Matéria', req:'Nível 12',
            desc:'Em forma intangível, pode atravessar objetos sólidos por 1 turno.' },
          { id:'ee_f5', nome:'Dissolução', req:'Nível 18',
            desc:'1x/dia: completamente intangível por 3 turnos (imune a dano físico).' }
        ]},
        { nome:'Supremacia', nivel:3, foco:'Domínio de campo elemental.', habilidades:[
          { id:'ee_s1', nome:'Controle Ampliado', req:'Nível 3',
            desc:'Magias de Controle elemental ganham +1 turno de duração.' },
          { id:'ee_s2', nome:'Pressão Elemental', req:'Nível 6',
            desc:'Inimigos sob condição elemental sofrem -1 dado em testes de resistência.' },
          { id:'ee_s3', nome:'Aura Elemental', req:'Nível 9',
            desc:'Aura passiva raio 3u: dano leve por turno a inimigos na área.' },
          { id:'ee_s4', nome:'Zona de Domínio', req:'Nível 12',
            desc:'1x/cena: área 6u onde magias custam -2 MAG por 3 turnos.' },
          { id:'ee_s5', nome:'Soberania do Elemento', req:'Nível 18',
            desc:'1x/dia: por 1 cena, aliados em 6u ganham +1 dado em ataques do mesmo elemento.' }
        ]}
      ]
    },
    variacoes:[
      { id:'ee_v1', nome:'Manifestação Recente', desc:'Plano Material. +1 Precisão. Vulnerabilidade ao oposto reduz de 50% para 25%. Tendência narrativa: curiosidade intensa, choque cultural, superioridade velada.' },
      { id:'ee_v2', nome:'Espírito Ancorado',   desc:'Longa Permanência. +1 Arcana. Visão Mágica alcança 20u. Pode empunhar 1 arma leve sem penalidade.' }
    ]
  },
  {
    name:'Aika/Ukya', classificacao:'Excêntrica',
    conceito:'Dualidade de luz e sombra — dois aspectos de um mesmo ser em equilíbrio tenso e necessário.',
    atributos:{ FOR:0,CON:0,AGI:2,DES:1,VIDA:0,DEF:1,VON:3,PER:1,INT:2,SAB:2,MAG:2,RESM:2,CAR:1,ATQ:1 },
    modos:{ Bruto:0,Ágil:3,Preciso:3,Intuitivo:4 },
    observacao:'Dualidade de luz e sombra. Escolha o aspecto dominante.',
    proficiencias:{ armas:'Leves', armaduras:'Leves', escolas:['Controle','Mundanas'], afinidades:['Luz (Aika)','Sombra (Ukya)'], tipoMagico:['Arcana (Aika)','Bruxaria (Ukya)'], skillsIniciais:3, periciasBonus:'Investigação, Furtividade' },
    habilidades:[], progressao:{ nucleo:[], caminhos:[] }, variacoes:[],
    subraças:[
      { name:'Aika',
        atributos:{ FOR:-1,CON:0,AGI:2,DES:1,VIDA:0,DEF:1,VON:2,PER:1,INT:3,SAB:3,MAG:3,RESM:3,CAR:1,ATQ:0 },
        modos:{ Bruto:0,Ágil:3,Preciso:3,Intuitivo:4 },
        obs:'Núcleo converte força física em magia. Adaptação e improvisação máximas.'
      },
      { name:'Ukya',
        atributos:{ FOR:2,CON:1,AGI:3,DES:2,VIDA:1,DEF:1,VON:3,PER:2,INT:1,SAB:1,MAG:0,RESM:1,CAR:0,ATQ:3 },
        modos:{ Bruto:4,Ágil:4,Preciso:3,Intuitivo:1 },
        obs:'Magia negativa convertida em potencial físico. Extremamente forte e rápido.'
      }
    ]
  },
  {
    name:'Perdidos', classificacao:'Excêntrica',
    conceito:'Fora de padrões. Improvisação máxima, força e precisão variáveis, altamente imprevisíveis.',
    atributos:{ FOR:1,CON:1,AGI:0,DES:0,VIDA:1,DEF:0,VON:2,PER:1,INT:0,SAB:1,MAG:1,RESM:0,CAR:1,ATQ:0 },
    modos:{ Bruto:3,Ágil:2,Preciso:2,Intuitivo:4 },
    observacao:'Fora de padrões. Improvisação máxima, altamente imprevisíveis.',
    proficiencias:{ armas:'Variável (imprevisível)', armaduras:'Leves', escolas:['1 à escolha'], afinidades:['Variável'], tipoMagico:['Bruxaria','Feitiçaria'], skillsIniciais:2, periciasBonus:'Improvisação' },
    habilidades:[], progressao:{ nucleo:[], caminhos:[] }, variacoes:[]
  }
];


const RACES_PRESETS = RACES_DB;

/* ============================================================
   SELETOR DE RAÇA NO EDITOR
============================================================ */
// Mapa interno: key CSS para classificação
