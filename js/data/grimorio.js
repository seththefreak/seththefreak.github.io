const GRIMORIO_ESCOLAS = {
  ataque: {
    nome: 'Escola de Ataque',
    cor: '#e05050',
    emoji: '⚔️',
    desc: 'Magias ofensivas diretas. Dano, acerto preciso, penetração de defesas.',
    capitulos: [
      {
        nome: 'I — Projéteis Elementais',
        magias: [
          { id:'atk_01', nome:'Dardo de Força', pm:3, nivel:0, escola:'Ataque', alcance:'8u', duracao:'Instantâneo', area:'Alvo único', desc:'Projétil de energia pura. Nunca erra. Dano: 1d4+1 força. Ignora cobertura parcial.' },
          { id:'atk_02', elemento:'🔥 Fogo', nome:'Bola de Fogo', pm:8, nivel:1, escola:'Ataque', alcance:'10u', duracao:'Instantâneo', area:'Raio 2u', desc:'Explosão ígnea. Dano: 2d6 fogo. Alvos na área testam AGI ou ficam Em Chamas.' },
          { id:'atk_03', elemento:'❄️ Gelo', nome:'Flecha de Gelo', pm:6, nivel:1, escola:'Ataque', alcance:'12u', duracao:'Instantâneo', area:'Alvo único', desc:'Projétil glacial. Dano: 1d8+2 frio. Alvo testa CON ou Lentificado 1 turno.' },
          { id:'atk_04', elemento:'⚡ Raio', nome:'Relâmpago', pm:10, nivel:2, escola:'Ataque', alcance:'10u', duracao:'Instantâneo', area:'Linha 10u', desc:'Descarga elétrica em linha. Dano: 3d6 raio. Todos na linha testam CON ou Atordoados.' },
          { id:'atk_05', elemento:'🧪 Ácido', nome:'Torrente Ácida', pm:7, nivel:1, escola:'Ataque', alcance:'6u', duracao:'2 turnos', area:'Cone 4u', desc:'Jato corrosivo. Dano: 1d6 ácido/turno por 2 turnos. Reduz RD do alvo em 1.' },
          { id:'atk_06', elemento:'🌪️ Vento', nome:'Rajada de Vento', pm:5, nivel:0, escola:'Ataque', alcance:'8u', duracao:'Instantâneo', area:'Alvo único', desc:'Impacto de pressão de ar. Dano: 1d6 contusão. Empurra alvo 2u. Vantagem contra alvos voadores.' },
          { id:'atk_07', elemento:'🪨 Terra', nome:'Espigão de Terra', pm:6, nivel:1, escola:'Ataque', alcance:'6u', duracao:'Instantâneo', area:'Alvo único', desc:'Pico de rocha irrompe sob o alvo. Dano: 2d4 perfuração. Alvo testa AGI ou Imobilizado.' },
          { id:'atk_08', elemento:'✨ Luz', nome:'Chama Solar', pm:12, nivel:2, escola:'Ataque', alcance:'15u', duracao:'Instantâneo', area:'Alvo único', desc:'Raio de luz concentrada. Dano: 3d8 luz. +50% contra mortos-vivos e criaturas das sombras.' },
          { id:'atk_09', elemento:'🌑 Sombra', nome:'Estilhaço Sombrio', pm:7, nivel:1, escola:'Ataque', alcance:'8u', duracao:'Instantâneo', area:'Raio 1u', desc:'Fragmentos de trevas. Dano: 2d4 sombra. Alvos atingidos sofrem −1 PER até o próximo turno.' },
          { id:'atk_10', elemento:'🔥 Fogo', nome:'Meteoro Menor', pm:15, nivel:3, escola:'Ataque', alcance:'20u', duracao:'Instantâneo', area:'Raio 3u', desc:'Pedra incandescente cai do céu. Dano: 4d8 fogo+impacto. Cratera de 1u deixa terreno difícil.' },
        ]
      },
      {
        nome: 'II — Ataques de Contato',
        magias: [
          { id:'atk_11', elemento:'🔥 Fogo', nome:'Toque Infernal', pm:5, nivel:0, escola:'Ataque', alcance:'Adjacente', duracao:'Instantâneo', area:'Alvo único', desc:'Mão ardente. Dano: 2d4 fogo. O alvo testa VON ou recua 1u.' },
          { id:'atk_12', nome:'Dreno Vital', pm:8, nivel:1, escola:'Ataque', alcance:'Toque', duracao:'Instantâneo', area:'Alvo único', desc:'Suga energia vital. Dano: 2d6 necrótico. Você recupera metade do dano causado como PV.' },
          { id:'atk_13', elemento:'⚡ Raio', nome:'Pulso Elétrico', pm:6, nivel:1, escola:'Ataque', alcance:'Adjacente', duracao:'Instantâneo', area:'Alvo único', desc:'Choque de contato. Dano: 1d8 raio. Chance de Atordoado 1 turno (CON dif.3).' },
          { id:'atk_14', nome:'Lâmina Fantasma', pm:7, nivel:1, escola:'Ataque', alcance:'Adjacente', duracao:'1 cena', area:'Alvo único', desc:'Arma etérea formada no punho. Dano: 1d10 força. Ignora armaduras não-mágicas. Ação menor para atacar.' },
          { id:'atk_15', elemento:'❄️ Gelo', nome:'Explosão Gélida', pm:9, nivel:2, escola:'Ataque', alcance:'Adjacente', duracao:'Instantâneo', area:'Cone 3u', desc:'Onda de frio extremo. Dano: 2d8 gelo. Alvos molhados testam com desvantagem.' },
        ]
      },
      {
        nome: 'III — Ataques em Área',
        magias: [
          { id:'atk_16', nome:'Tempestade de Lâminas', pm:12, nivel:2, escola:'Ataque', alcance:'Pessoal', duracao:'Instantâneo', area:'Raio 4u', desc:'Rajada de projéteis cortantes. Dano: 2d6 corte a todos na área. Aliados incluídos.' },
          { id:'atk_17', elemento:'🔥 Fogo', nome:'Nova de Fogo', pm:18, nivel:3, escola:'Ataque', alcance:'Pessoal', duracao:'Instantâneo', area:'Raio 6u', desc:'Explosão solar concentrada. Dano: 5d6 fogo. Alvo a ≤2u sofre dano máximo.' },
          { id:'atk_18', elemento:'❄️ Gelo', nome:'Queda de Granizo', pm:10, nivel:2, escola:'Ataque', alcance:'12u', duracao:'3 turnos [CONC]', area:'Raio 4u', desc:'Chuva de pedras de gelo. Dano: 1d6 impacto+frio/turno. Terreno vira difícil na área.' },
          { id:'atk_19', elemento:'⚡ Raio', nome:'Vórtice Elétrico', pm:14, nivel:3, escola:'Ataque', alcance:'8u', duracao:'2 turnos [CONC]', area:'Raio 3u', desc:'Redemoinho de relâmpagos. Dano: 2d8 raio/turno. Alvos metálicos testam com desvantagem.' },
          { id:'atk_20', elemento:'🪨 Terra', nome:'Onda de Choque', pm:8, nivel:2, escola:'Ataque', alcance:'Pessoal', duracao:'Instantâneo', area:'Raio 3u', desc:'Pulso sísmico a partir do conjurador. Dano: 2d4 impacto. Todos testam FOR ou Derrubados.' },
        ]
      },
      {
        nome: 'IV — Magias de Enfraquecimento Ofensivo',
        magias: [
          { id:'atk_21', elemento:'🔥 Fogo', nome:'Maldição Ardente', pm:9, nivel:2, escola:'Ataque', alcance:'6u', duracao:'Cena', area:'Alvo único', desc:'Marca o alvo. Todo dano de fogo recebido +25%. Não removível por resistência mundana.' },
          { id:'atk_22', elemento:'🌑 Sombra', nome:'Flechas de Sombra', pm:11, nivel:2, escola:'Ataque', alcance:'10u', duracao:'Instantâneo', area:'Até 3 alvos', desc:'Disparos múltiplos de escuridão. Dano: 1d6 sombra cada. Alvos atingidos têm DEF −1 turno.' },
          { id:'atk_23', elemento:'🌑 Sombra', nome:'Garra Sombria', pm:7, nivel:1, escola:'Ataque', alcance:'8u', duracao:'Instantâneo', area:'Alvo único', desc:'Mão espectral rasga armadura. Dano: 2d4 sombra. Reduz RD do alvo em 2 até o fim do turno.' },
          { id:'atk_24', elemento:'🪨 Terra', nome:'Punho de Pedra', pm:8, nivel:1, escola:'Ataque', alcance:'4u', duracao:'Instantâneo', area:'Alvo único', desc:'Golpe físico massivo à distância. Dano: 2d6 impacto. Conta como ataque físico Bruto para efeitos.' },
          { id:'atk_25', nome:'Raio da Ruína', pm:20, nivel:4, escola:'Ataque', alcance:'20u', duracao:'Instantâneo', area:'Alvo único', desc:'Ataque devastador de destruição pura. Dano: 6d10 força. Se matar o alvo, explosion de 2u causa 2d6 aos adjacentes.' },
        ]
      }
    ]
  },
  controle: {
    nome: 'Escola de Controle',
    cor: '#5080d0',
    emoji: '🌀',
    desc: 'Magias que manipulam, restringem, iludem e alteram o campo de batalha.',
    capitulos: [
      {
        nome: 'I — Imobilização & Restrição',
        magias: [
          { id:'ctr_01', elemento:'🪨 Terra', nome:'Raízes de Pedra', pm:6, nivel:1, escola:'Controle', alcance:'8u', duracao:'2 turnos', area:'Alvo único', desc:'Rochas emergem e prendem os pés. Alvo Imobilizado. Testa FOR dif.3 para escapar (ação maior).' },
          { id:'ctr_02', elemento:'❄️ Gelo', nome:'Teia Gelada', pm:7, nivel:1, escola:'Controle', alcance:'10u', duracao:'3 turnos', area:'Raio 2u', desc:'Cristais de gelo constringem a área. Todos testam AGI dif.3 ou Lentificados. Terreno difícil.' },
          { id:'ctr_03', nome:'Mãos Espectrais', pm:8, nivel:2, escola:'Controle', alcance:'6u', duracao:'Concentração', area:'Alvo único', desc:'Garras invisíveis seguram o alvo. Imobilizado enquanto você concentra. Pode realizar outras ações.' },
          { id:'ctr_04', elemento:'🌪️ Vento', nome:'Parede de Vento', pm:9, nivel:2, escola:'Controle', alcance:'8u', duracao:'3 turnos [CONC]', area:'Linha 6u', desc:'Barreira de pressão de ar. Projéteis desviados. Criaturas Pequenas não podem atravessar.' },
          { id:'ctr_05', elemento:'✨ Luz', nome:'Prisão de Luz', pm:12, nivel:2, escola:'Controle', alcance:'10u', duracao:'Cena [CONC]', area:'Alvo único', desc:'Gaiola de energia radiante. Alvo preso. +2 dif. para escapar se criatura das sombras.' },
          { id:'ctr_06', nome:'Emaranhamento', pm:6, nivel:1, escola:'Controle', alcance:'12u', duracao:'Cena', area:'Raio 3u', desc:'Vegetação ou fios mágicos crescem. Todos na área testam FOR ou Imobilizados. Persiste mesmo sem concentração.' },
          { id:'ctr_07', nome:'Grilhão Arcano', pm:10, nivel:2, escola:'Controle', alcance:'8u', duracao:'Cena', area:'Alvo único', desc:'Correntes mágicas vinculam o alvo. Imobilizado e −2 em testes de VON. Remoção exige dispersão mágica.' },
        ]
      },
      {
        nome: 'II — Ilusão & Engano',
        magias: [
          { id:'ctr_08', nome:'Imagem Ilusória', pm:5, nivel:0, escola:'Controle', alcance:'10u', duracao:'1 min [CONC]', area:'2u cubo', desc:'Ilusão visual e sonora. Alvo pode interagir com INT dif.3 para dissipar. Sem dano real.' },
          { id:'ctr_09', nome:'Invisibilidade', pm:10, nivel:2, escola:'Controle', alcance:'Toque', duracao:'10 min [CONC]', area:'Alvo único', desc:'Alvo torna-se invisível. Ataques contra alvo com desvantagem. Termina se alvo atacar.' },
          { id:'ctr_10', nome:'Confusão', pm:8, nivel:2, escola:'Controle', alcance:'8u', duracao:'3 turnos', area:'Alvo único', desc:'Mente do alvo embaralha. Ação aleatória a cada turno: recolher, atacar adjacente aleatório, ou agir normal.' },
          { id:'ctr_11', nome:'Névoa Espessa', pm:7, nivel:1, escola:'Controle', alcance:'15u', duracao:'5 min', area:'Raio 6u', desc:'Névoa impede visão além de 1u. Todos com desvantagem em ataques à distância na área.' },
          { id:'ctr_12', nome:'Duplicata', pm:9, nivel:2, escola:'Controle', alcance:'Pessoal', duracao:'Cena', area:'—', desc:'Cria 2 imagens ilusórias de você. Cada ataque tem 33% de acertar uma imagem (que desaparece).' },
          { id:'ctr_13', nome:'Terror', pm:8, nivel:2, escola:'Controle', alcance:'6u', duracao:'Cena', area:'Alvo único', desc:'Projeta medo paralisante. Alvo testa VON dif.4. Falha: Amedrontado, −2 em todos os testes.' },
        ]
      },
      {
        nome: 'III — Manipulação de Terreno',
        magias: [
          { id:'ctr_14', nome:'Levitar Objeto', pm:4, nivel:0, escola:'Controle', alcance:'8u', duracao:'Concentração', area:'Objeto ≤50kg', desc:'Levita e move objeto até 2u por turno. Pode ser usado como projétil (dano: pelo peso).' },
          { id:'ctr_15', elemento:'🪨 Terra', nome:'Tremor', pm:8, nivel:2, escola:'Controle', alcance:'Pessoal', duracao:'Instantâneo', area:'Raio 5u', desc:'Abalo sísmico local. Todos testam FOR ou Derrubados. Estruturas frágeis sofrem dano.' },
          { id:'ctr_16', elemento:'🌪️ Vento', nome:'Vórtice de Areia', pm:7, nivel:1, escola:'Controle', alcance:'10u', duracao:'3 turnos [CONC]', area:'Raio 3u', desc:'Redemoinhos de partículas cegas. Todos na área com −1 dado em ações que exijam visão.' },
          { id:'ctr_17', elemento:'🪨 Terra', nome:'Parede de Pedra', pm:12, nivel:2, escola:'Controle', alcance:'10u', duracao:'10 min', area:'Parede 6u×3u', desc:'Barreira de rocha sólida. RD 20, 50 PV. Pode dividir campo de batalha.' },
          { id:'ctr_18', nome:'Pântano Arcano', pm:10, nivel:2, escola:'Controle', alcance:'15u', duracao:'Cena [CONC]', area:'Raio 4u', desc:'Terreno vira lamaçal mágico. Movimento na área custa 3× o normal. Testam FOR ou afundam.' },
        ]
      },
      {
        nome: 'IV — Controle Mental',
        magias: [
          { id:'ctr_19', nome:'Sugestão', pm:9, nivel:2, escola:'Controle', alcance:'6u', duracao:'Hora', area:'Alvo único', desc:'Planta uma sugestão razoável. Alvo testa VON dif.4. Falha: segue a sugestão por 1h (sem ações suicidas).' },
          { id:'ctr_20', nome:'Sono', pm:7, nivel:1, escola:'Controle', alcance:'8u', duracao:'1h ou até acordar', area:'Até 3d6 PV de criaturas', desc:'Afeta criaturas com menor PV primeiro. Dano ou barulho alto desperta. Imune: mortos-vivos, construtos.' },
          { id:'ctr_21', nome:'Dominar', pm:16, nivel:4, escola:'Controle', alcance:'6u', duracao:'Cena [CONC]', area:'Alvo único', desc:'Controle total do alvo. Testa VON dif.5. Falha: segue seus comandos. Cada turno re-testa para libertar.' },
          { id:'ctr_22', nome:'Charme', pm:7, nivel:1, escola:'Controle', alcance:'8u', duracao:'Hora', area:'Alvo único', desc:'Alvo testa VON dif.3. Falha: te trata como amigo próximo. Ações violentas contra aliados quebram o efeito.' },
          { id:'ctr_23', nome:'Silêncio', pm:5, nivel:1, escola:'Controle', alcance:'10u', duracao:'3 turnos [CONC]', area:'Raio 4u', desc:'Zona de silêncio total. Sem feitiços verbais na área. −3 em conjuração de Arcana na área.' },
        ]
      }
    ]
  },
  ampliacao: {
    nome: 'Escola de Ampliação',
    cor: '#60b060',
    emoji: '⬆️',
    desc: 'Magias que fortalecem, curam, potencializam aliados e resistências.',
    capitulos: [
      {
        nome: 'I — Fortalecimento Físico',
        magias: [
          { id:'amp_01', nome:'Armadura Arcana', pm:5, nivel:0, escola:'Ampliação', alcance:'Toque', duracao:'Cena', area:'Alvo único', desc:'+2 RD contra dano físico. Não se acumula com armaduras mágicas.' },
          { id:'amp_02', nome:'Força do Gigante', pm:6, nivel:1, escola:'Ampliação', alcance:'Toque', duracao:'Cena', area:'Alvo único', desc:'+2 FOR efetivo. Ataque físico conta como mais pesado (w+0.2). Carga duplicada.' },
          { id:'amp_03', elemento:'🪨 Terra', nome:'Pele de Pedra', pm:10, nivel:2, escola:'Ampliação', alcance:'Toque', duracao:'Cena', area:'Alvo único', desc:'+5 RD natural. −1 AGI como penalidade. Resistência 25% a corte e impacto.' },
          { id:'amp_04', nome:'Velocidade', pm:7, nivel:1, escola:'Ampliação', alcance:'Toque', duracao:'3 turnos', area:'Alvo único', desc:'+4u MOV. Ação menor bônus/turno. Iniciativa +3. Esquiva +1.' },
          { id:'amp_05', nome:'Reflexos de Gato', pm:5, nivel:0, escola:'Ampliação', alcance:'Toque', duracao:'Cena', area:'Alvo único', desc:'+2 AGI para esquiva. Não cai em terreno difícil. Vantagem em testes de equilíbrio.' },
          { id:'amp_06', nome:'Salto Colossal', pm:4, nivel:0, escola:'Ampliação', alcance:'Toque', duracao:'10 min', area:'Alvo único', desc:'Capacidade de salto ×3. Queda de qualquer altura sem dano de até 6u.' },
          { id:'amp_07', nome:'Escudo Mágico', pm:6, nivel:1, escola:'Ampliação', alcance:'Reação', duracao:'Instantâneo', area:'Pessoal', desc:'Reação ao ser atingido. Reduz dano em 1d6+3. Pode usar sem slot de reação 1×/turno.' },
        ]
      },
      {
        nome: 'II — Cura & Restauração',
        magias: [
          { id:'amp_08', nome:'Curar Ferimentos', pm:5, nivel:0, escola:'Ampliação', alcance:'Toque', duracao:'Instantâneo', area:'Alvo único', desc:'Restaura 1d6+MAG PV. Não funciona em mortos-vivos (causa dano).' },
          { id:'amp_09', nome:'Cura Moderada', pm:9, nivel:2, escola:'Ampliação', alcance:'Toque', duracao:'Instantâneo', area:'Alvo único', desc:'Restaura 2d8+MAG PV. Remove 1 condição física leve (sangramento, lentificado).' },
          { id:'amp_10', nome:'Cura em Onda', pm:12, nivel:2, escola:'Ampliação', alcance:'Pessoal', duracao:'Instantâneo', area:'Raio 4u', desc:'Pulso de energia curativa. Restaura 1d6+MAG a todos os aliados na área.' },
          { id:'amp_11', nome:'Regeneração', pm:14, nivel:3, escola:'Ampliação', alcance:'Toque', duracao:'5 turnos', area:'Alvo único', desc:'Restaura 2d4 PV/turno. Regenera membros perdidos após 1 min fora de combate.' },
          { id:'amp_12', nome:'Purificar', pm:7, nivel:1, escola:'Ampliação', alcance:'Toque', duracao:'Instantâneo', area:'Alvo único', desc:'Remove venenos, doenças e maldições de nível ≤ sua Proficiência em Ampliação.' },
          { id:'amp_13', nome:'Ressurreição Parcial', pm:20, nivel:4, escola:'Ampliação', alcance:'Toque', duracao:'Instantâneo', area:'Alvo morto', desc:'Traz alvo de volta com 1 PV se morreu há ≤ 1h. Alvo fica Exausto por 1 dia.' },
        ]
      },
      {
        nome: 'III — Potencialização de Aliados',
        magias: [
          { id:'amp_14', nome:'Bênção', pm:5, nivel:0, escola:'Ampliação', alcance:'6u', duracao:'Cena', area:'Até 3 aliados', desc:'+1 dado em todos os testes de ataque e resistência nos alvos.' },
          { id:'amp_15', nome:'Heroísmo', pm:8, nivel:1, escola:'Ampliação', alcance:'Toque', duracao:'3 turnos', area:'Alvo único', desc:'Alvo imune a medo. +1d4 dano extra em cada ataque. +5 PV temporários.' },
          { id:'amp_16', nome:'Invisibilidade em Grupo', pm:15, nivel:3, escola:'Ampliação', alcance:'6u', duracao:'10 min [CONC]', area:'Até 4 alvos', desc:'Todo o grupo invisível. Termina para todos se qualquer um atacar.' },
          { id:'amp_17', nome:'Aura de Proteção', pm:10, nivel:2, escola:'Ampliação', alcance:'Pessoal', duracao:'Cena [CONC]', area:'Raio 4u', desc:'Aliados na aura: +1 RD, vantagem em testes de resistência mágica.' },
          { id:'amp_18', elemento:'🌀 Elemental', nome:'Potência Elemental', pm:8, nivel:2, escola:'Ampliação', alcance:'Toque', duracao:'Cena', area:'Alvo único', desc:'Escolha um elemento. Dano elemental do alvo +2d4 do tipo escolhido.' },
        ]
      },
      {
        nome: 'IV — Transmutação & Adaptação',
        magias: [
          { id:'amp_19', nome:'Respiração Aquática', pm:5, nivel:1, escola:'Ampliação', alcance:'Toque', duracao:'1h', area:'Até 2 alvos', desc:'Alvos respiram embaixo d\'água. Movimento aquático normal sem penalidade.' },
          { id:'amp_20', nome:'Forma Menor', pm:8, nivel:2, escola:'Ampliação', alcance:'Toque', duracao:'1h', area:'Alvo único', desc:'Alvo assume forma de animal Pequeno à escolha. Mantém INT e personalidade, perde habilidades mágicas.' },
          { id:'amp_21', nome:'Visão no Escuro', pm:4, nivel:0, escola:'Ampliação', alcance:'Toque', duracao:'1h', area:'Alvo único', desc:'Visão perfeita até 12u no escuro total.' },
          { id:'amp_22', elemento:'🌀 Elemental', nome:'Resistência Elemental', pm:6, nivel:1, escola:'Ampliação', alcance:'Toque', duracao:'Cena', area:'Alvo único', desc:'Resistência 50% a um elemento à escolha. Se já tem resistência racial, vira imunidade 1 cena.' },
        ]
      }
    ]
  },
  conjuracao: {
    nome: 'Escola de Conjuração',
    cor: '#a060d0',
    emoji: '🔮',
    desc: 'Magias que criam, invocam, teletransportam e manipulam a substância mágica.',
    capitulos: [
      {
        nome: 'I — Invocação de Criaturas',
        magias: [
          { id:'cnj_01', nome:'Familiar Menor', pm:5, nivel:1, escola:'Conjuração', alcance:'1u', duracao:'Cena', area:'—', desc:'Invoca familiar animal (corvo, gato, sapo, cobra). INT 2, PV 5. Pode reconhecer e relatar o que vê.' },
          { id:'cnj_02', nome:'Golem de Argila', pm:10, nivel:2, escola:'Conjuração', alcance:'2u', duracao:'Cena [CONC]', area:'—', desc:'Construto de argila animada. FOR 3, CON 3, AGI −1. PV: 20+nível×2. RD 4. Segue comandos simples.' },
          { id:'cnj_03', elemento:'🌀 Elemental', nome:'Elementar Menor', pm:12, nivel:3, escola:'Conjuração', alcance:'2u', duracao:'3 turnos [CONC]', area:'—', desc:'Elementar do seu elemento primário. Ataque 1d8 elemental. PV 25. Move-se de forma independente.' },
          { id:'cnj_04', nome:'Sombra Vinculada', pm:9, nivel:2, escola:'Conjuração', alcance:'2u', duracao:'Cena [CONC]', area:'—', desc:'Criatura das sombras em forma humanoide. Furtividade +4. Pode infiltrar áreas iluminadas por 1 turno antes de dissipar.' },
          { id:'cnj_05', nome:'Espectro Guerreiro', pm:15, nivel:3, escola:'Conjuração', alcance:'2u', duracao:'3 turnos', area:'—', desc:'Guerreiro fantasma com sua própria arma mágica. ATQ igual ao seu PWR. PV 30. Age independente.' },
          { id:'cnj_06', nome:'Besta Arcana', pm:18, nivel:4, escola:'Conjuração', alcance:'2u', duracao:'Cena [CONC]', area:'—', desc:'Criatura customizável (seleciona 3 traços: voar/veneno/regenerar/armadura/velocidade). PV 40, ATQ igual MAG.' },
        ]
      },
      {
        nome: 'II — Teletransporte & Espaço',
        magias: [
          { id:'cnj_07', nome:'Passo Sombrio', pm:5, nivel:1, escola:'Conjuração', alcance:'Pessoal', duracao:'Instantâneo', area:'—', desc:'Teleporta-se a qualquer ponto visível a até 6u. Ação menor. Pode usar durante movimento.' },
          { id:'cnj_08', nome:'Portal Menor', pm:12, nivel:2, escola:'Conjuração', alcance:'2u', duracao:'3 turnos', area:'Portal 1×2u', desc:'Abre portal bidirecional entre dois pontos visíveis a até 30u. Criaturas podem atravessar.' },
          { id:'cnj_09', nome:'Dimensão de Bolso', pm:8, nivel:2, escola:'Conjuração', alcance:'Pessoal', duracao:'8h', area:'—', desc:'Espaço extradimensional pessoal. Armazena até 200kg de objetos. Acessar: ação menor.' },
          { id:'cnj_10', nome:'Translocação', pm:14, nivel:3, escola:'Conjuração', alcance:'4u', duracao:'Instantâneo', area:'2 alvos', desc:'Troca posição de dois alvos (aliados ou inimigos). Resistência: VON dif.4 para alvos não-voluntários.' },
          { id:'cnj_11', nome:'Passo entre Sombras', pm:9, nivel:2, escola:'Conjuração', alcance:'Pessoal', duracao:'Instantâneo', area:'—', desc:'Entra numa sombra e sai em outra a até 30u. Requer sombra de tamanho suficiente em ambos os pontos.' },
        ]
      },
      {
        nome: 'III — Criação de Substância',
        magias: [
          { id:'cnj_12', nome:'Criar Água', pm:2, nivel:0, escola:'Conjuração', alcance:'1u', duracao:'Permanente', area:'—', desc:'Cria até 50L de água potável por conjuração. Apaga fogueiras pequenas. Pode afogar criaturas Muito Pequenas.' },
          { id:'cnj_13', nome:'Criar Alimento', pm:4, nivel:0, escola:'Conjuração', alcance:'1u', duracao:'24h', area:'—', desc:'Cria alimento suficiente para 3 criaturas por dia. Simples, nutritivo, mas sem sabor especial.' },
          { id:'cnj_14', nome:'Forja Arcana', pm:10, nivel:2, escola:'Conjuração', alcance:'Toque', duracao:'Cena', area:'—', desc:'Cria arma ou escudo mágico temporário. Qualidade +1. Desaparece ao fim do combate.' },
          { id:'cnj_15', elemento:'🔥 Fogo', nome:'Muro de Fogo', pm:10, nivel:2, escola:'Conjuração', alcance:'12u', duracao:'Cena [CONC]', area:'Parede 8u×3u', desc:'Parede de chamas. Atravessar: 3d6 fogo. Bloqueia visão. Projéteis que passam: 50% de incendiar.' },
          { id:'cnj_16', nome:'Invocar Relíquia', pm:7, nivel:1, escola:'Conjuração', alcance:'Toque', duracao:'Cena', area:'—', desc:'Manifesta uma cópia de um objeto conhecido (relíquia pessoal). Funcional mas sem encantamentos permanentes.' },
        ]
      },
      {
        nome: 'IV — Conjuração Maior',
        magias: [
          { id:'cnj_17', nome:'Templo do Vazio', pm:25, nivel:5, escola:'Conjuração', alcance:'10u', duracao:'1h', area:'Raio 10u', desc:'Cria bolsão dimensional em torno da área. Nada entra ou sai sem permissão. RD 30 para destruir as paredes.' },
          { id:'cnj_18', elemento:'🌀 Elemental', nome:'Avatar do Elemento', pm:22, nivel:4, escola:'Conjuração', alcance:'Pessoal', duracao:'3 turnos', area:'—', desc:'Você se funde com seu elemento primário. Tamanho Grande. Todos os danos elementais +100%. RD 10.' },
          { id:'cnj_19', elemento:'🌑 Sombra', nome:'Exército das Sombras', pm:20, nivel:4, escola:'Conjuração', alcance:'5u', duracao:'Cena [CONC]', area:'—', desc:'Invoca 1d4+2 guerreiros sombrios. PV 15 cada, ATQ igual MAG. Agem em sincronia no seu turno.' },
          { id:'cnj_20', nome:'Portão Abissal', pm:30, nivel:6, escola:'Conjuração', alcance:'8u', duracao:'Cena', area:'Portal 3×3u', desc:'Abre portal para plano inferior. Convoca entidade de nível livre (Mestre define a criatura e custo narrativo).' },
        ]
      }
    ]
  }
};

const GRIMORIO_MUNDANAS_DATA = {
  I: { nome: 'Sentidos & Percepção', emoji: '👁️', magias: [
    { id:'mnd_09', nome:'Olhar do Rastro', pm:2, desc:'Revela pegadas recentes em até 6u ao redor.', alcance:'Pessoal', duracao:'1 min', area:'6u raio', obs:'Pegadas brilham levemente.' },
    { id:'mnd_11', nome:'Escuta Direcionada', pm:2, desc:'Concentra o som de uma única fonte, como se aproximasse o ouvido.', alcance:'10u', duracao:'Concentração', area:'Alvo único', obs:'+2 em Percepção auditiva para aquela fonte.' },
    { id:'mnd_25', nome:'Voz da Pedra', pm:2, desc:'Permite ouvir vibrações mínimas em paredes, pisos ou cavernas.', alcance:'Toque', duracao:'1 min', area:'—', obs:'+2 em testes para detectar movimentos próximos.' },
    { id:'mnd_39', nome:'Nariz Afiado', pm:1, desc:'Realça odores importantes (alimentos estragados, venenos, perfumes fortes).', alcance:'Pessoal', duracao:'1 min', area:'—', obs:'+2 em testes olfativos.' },
    { id:'mnd_46', nome:'Lentes da Claridade', pm:1, desc:'A visão do conjurador foca melhor objetos muito próximos.', alcance:'Pessoal', duracao:'5 min', area:'—', obs:'+2 para ler textos minúsculos ou inspecionar detalhes.' },
    { id:'mnd_48', nome:'Sussurro da Folha', pm:1, desc:'Permite ouvir o som do vento como se ele revelasse movimento próximo.', alcance:'Pessoal', duracao:'30s', area:'—', obs:'+1 para detectar criaturas escondidas em vegetação.' },
    { id:'mnd_76', nome:'Som do Passado', pm:2, desc:'Faz ecoar brevemente o último som forte produzido naquela área.', alcance:'Pessoal', duracao:'Instantâneo', area:'—', obs:'Descobrir se houve movimento recente.' },
    { id:'mnd_84', nome:'Olhar Telescópico', pm:1, desc:'Foca objetos distantes sem aumentar sua imagem, apenas clareando contornos.', alcance:'20u', duracao:'5s', area:'—', obs:'' },
    { id:'mnd_87', nome:'Toque de Eco', pm:1, desc:'Ao tocar duas superfícies, sente qual vibra mais — útil para achar ocos.', alcance:'Toque', duracao:'Instantâneo', area:'—', obs:'' },
    { id:'mnd_90', nome:'Visão da Borda', pm:1, desc:'Realça o brilho de objetos pontiagudos ou cortantes próximos.', alcance:'Pessoal', duracao:'1 min', area:'2u', obs:'+1 para detectar armadilhas simples.' },
    { id:'mnd_97', nome:'Onda de Cheiro', pm:1, desc:'Faz um odor recente se intensificar por 2s para facilitar identificação.', alcance:'1u', duracao:'2s', area:'—', obs:'' },
  ]},
  II: { nome: 'Luz & Sombra', emoji: '🌟', magias: [
    { id:'mnd_01', nome:'Luzinha', pm:1, desc:'Cria uma pequena esfera de luz flutuante que acompanha o conjurador.', alcance:'Pessoal', duracao:'1h', area:'3u raio', obs:'Ilumina um raio de 3u.' },
    { id:'mnd_21', nome:'Pincel Fantasma', pm:1, desc:'Um traço mágico desenha símbolos simples em superfícies.', alcance:'2u', duracao:'1h ou até apagado', area:'—', obs:'' },
    { id:'mnd_30', nome:'Selo de Poeira', pm:1, desc:'Cria um véu de poeira fina que indica quando alguém passar por ali.', alcance:'Pessoal', duracao:'12h', area:'2u', obs:'Marca passos com brilho fraco.' },
    { id:'mnd_43', nome:'Brilho da Areia', pm:1, desc:'Revela inscrições, símbolos ou runas apagadas em paredes.', alcance:'Toque', duracao:'30s', area:'—', obs:'' },
    { id:'mnd_51', nome:'Trilha de Luz', pm:1, desc:'Cada passo do conjurador deixa um brilho suave por 3s.', alcance:'Pessoal', duracao:'1 min', area:'—', obs:'Útil para indicar caminho em escuridão.' },
    { id:'mnd_81', nome:'Arco de Poeira', pm:1, desc:'Suspende partículas de poeira no ar, formando um rastro brilhante.', alcance:'2u', duracao:'5s', area:'—', obs:'Apontar direções, sinalização rápida.' },
    { id:'mnd_91', nome:'Lume de Fenda', pm:1, desc:'Preenche pequenas frestas com luz suave, revelando buracos e passagens mínimas.', alcance:'1u', duracao:'10s', area:'—', obs:'' },
    { id:'mnd_98', nome:'Brilho de Contorno', pm:1, desc:'Delimita o formato de um objeto no escuro com um brilho muito fraco.', alcance:'1u', duracao:'10s', area:'—', obs:'' },
    { id:'mnd_100', nome:'Ponto Fixo', pm:1, desc:'Cria um ponto luminoso imóvel no ar, útil como referência espacial.', alcance:'2u', duracao:'1 min', area:'—', obs:'' },
    { id:'mnd_101', nome:'Olhar de Reflexo', pm:1, desc:'Realça superfícies espelhadas, mesmo que opacas ou arranhadas.', alcance:'1u', duracao:'5s', area:'—', obs:'' },
  ]},
  III: { nome: 'Som & Silêncio', emoji: '🔇', magias: [
    { id:'mnd_04', nome:'Passo Silencioso', pm:2, desc:'Amortece o som dos passos do conjurador.', alcance:'Pessoal', duracao:'10 min', area:'—', obs:'+2 em furtividade para movimentação.' },
    { id:'mnd_07', nome:'Registro Auditivo', pm:2, desc:'Guarda até 6s de algum som ouvido recentemente.', alcance:'Pessoal', duracao:'Permanente', area:'—', obs:'Pode reproduzir o som quando quiser.' },
    { id:'mnd_23', nome:'Eco Suprimido', pm:1, desc:'Anula ecos em corredores, cavernas ou salões.', alcance:'Pessoal', duracao:'5 min', area:'4u', obs:'' },
    { id:'mnd_36', nome:'Batida Ritmada', pm:1, desc:'O coração do conjurador estabiliza em um ritmo calmo.', alcance:'Pessoal', duracao:'5 min', area:'—', obs:'Reduz penalidades de nervosismo.' },
    { id:'mnd_50', nome:'Dedilhar Silencioso', pm:1, desc:'Amortece sons de instrumentos ou ferramentas por 1 min.', alcance:'Toque', duracao:'1 min', area:'—', obs:'Ideal para estudar música ou mexer em mecanismos sem barulho.' },
    { id:'mnd_55', nome:'Acorde Suave', pm:1, desc:'Emite um som agradável que serve como alarme tranquilo.', alcance:'Pessoal', duracao:'8h ou até acionado', area:'3u', obs:'' },
    { id:'mnd_57', nome:'Pulso Metronômico', pm:1, desc:'Cria um "tic-tac" mental para auxiliar ritmo.', alcance:'Pessoal', duracao:'5 min', area:'—', obs:'+1 em tarefas cronometradas ou de tempo preciso.' },
    { id:'mnd_79', nome:'Eco Calmante', pm:1, desc:'Abafa sons internos do corpo (respiração, batimentos) por 1 min.', alcance:'Pessoal', duracao:'1 min', area:'—', obs:'Ajuda furtividade em silêncio absoluto.' },
    { id:'mnd_83', nome:'Palavra Muda', pm:1, desc:'Permite mover os lábios sem emitir som, mas um alvo a 1u entende perfeitamente.', alcance:'1u', duracao:'10s', area:'—', obs:'' },
    { id:'mnd_86', nome:'Rastro Mudo', pm:1, desc:'Anula completamente o som de arrastar objetos pequenos.', alcance:'Toque', duracao:'30s', area:'—', obs:'Puxar cadeiras, arrastar caixas discretamente.' },
    { id:'mnd_99', nome:'Orelha Rígida', pm:1, desc:'Bloqueia sons muito altos que possam assustar ou desconcentrar.', alcance:'Pessoal', duracao:'20s', area:'—', obs:'' },
    { id:'mnd_105', nome:'Forma da Voz', pm:1, desc:'A voz do conjurador sai mais clara em ambientes barulhentos.', alcance:'Pessoal', duracao:'1 min', area:'—', obs:'+1 em testes de comunicação em caos.' },
  ]},
  IV: { nome: 'Mãos & Ofício', emoji: '🔧', magias: [
    { id:'mnd_02', nome:'Secar Tecidos', pm:1, desc:'Remove completamente a umidade de roupas, capas e tecidos.', alcance:'Toque', duracao:'Instantâneo', area:'—', obs:'Seca até 5 peças.' },
    { id:'mnd_22', nome:'Aperto Preciso', pm:2, desc:'Estabiliza a mão do conjurador, removendo tremores.', alcance:'Pessoal', duracao:'10 min', area:'—', obs:'+2 em testes delicados (costura, escrita, cirurgia, joalheria etc.)' },
    { id:'mnd_27', nome:'Peso de Pluma', pm:1, desc:'Reduz o peso de um objeto pequeno em até 60%.', alcance:'Toque', duracao:'10 min', area:'—', obs:'' },
    { id:'mnd_32', nome:'Fio Engomado', pm:1, desc:'Deixa roupas lisas, alinhadas e sem amassados.', alcance:'Toque', duracao:'Permanente', area:'—', obs:'' },
    { id:'mnd_34', nome:'Gesto Magnético', pm:1, desc:'Atração fraca que puxa objetos metálicos muito leves (anéis, chaves).', alcance:'1u', duracao:'Instantâneo', area:'—', obs:'' },
    { id:'mnd_44', nome:'Trama Sutil', pm:1, desc:'Repara pequenos rasgos em tecidos.', alcance:'Toque', duracao:'Permanente', area:'—', obs:'Costura mágica com resistência normal.' },
    { id:'mnd_47', nome:'Nó Perfeito', pm:1, desc:'Ensina magicamente as mãos a amarrarem um nó firme e uniforme.', alcance:'Toque', duracao:'Permanente', area:'—', obs:'Torna quase impossível desatar sem cortar.' },
    { id:'mnd_49', nome:'Lâmina Fria', pm:1, desc:'Esfria uma lâmina ao ponto de causar leve dormência ao toque.', alcance:'Toque', duracao:'10 min', area:'—', obs:'Útil para pequenos procedimentos ou cortes precisos.' },
    { id:'mnd_53', nome:'Ponta Afiada', pm:1, desc:'Aponta lápis, carvão, pena ou ferramentas de escrita.', alcance:'Toque', duracao:'Instantâneo', area:'—', obs:'' },
    { id:'mnd_60', nome:'Dedos de Marfim', pm:1, desc:'Torna os dedos mais hábeis para manipular pequenos objetos.', alcance:'Pessoal', duracao:'5 min', area:'—', obs:'+1 em destrancar, joalheria, costura, artesanato minucioso.' },
    { id:'mnd_78', nome:'Tato de Ferro', pm:1, desc:'Fortalece brevemente a ponta dos dedos para apertar, puxar ou entortar algo pequeno.', alcance:'Pessoal', duracao:'10s', area:'—', obs:'Abrir tampas difíceis, puxar pregos fracos.' },
    { id:'mnd_80', nome:'Dobra Suave', pm:1, desc:'Permite dobrar papel, pano ou pergaminhos sem deixar vincos abruptos.', alcance:'Toque', duracao:'Instantâneo', area:'—', obs:'' },
  ]},
  V: { nome: 'Furtividade & Rastro', emoji: '🥷', magias: [
    { id:'mnd_12', nome:'Manto da Poeira', pm:2, desc:'Disfarça vestígios de presença humana (pegadas, poeira movimentada).', alcance:'Pessoal', duracao:'5 min', area:'3u', obs:'' },
    { id:'mnd_37', nome:'Mecha Vigiã', pm:2, desc:'Acende uma pequena chama que muda de cor quando algo se move a 3u.', alcance:'Toque', duracao:'1h', area:'3u', obs:'' },
    { id:'mnd_38', nome:'Passo de Seiva', pm:1, desc:'Permite atravessar pequenos arbustos sem barulho.', alcance:'Pessoal', duracao:'5 min', area:'—', obs:'' },
    { id:'mnd_88', nome:'Muralha de Aroma', pm:1, desc:'Cria uma linha de cheiro forte (menta, rosas, resina etc.) que serve como marcador.', alcance:'Pessoal', duracao:'12h', area:'3u linha', obs:'' },
    { id:'mnd_89', nome:'Passo de Vidro', pm:1, desc:'Permite andar sobre cacos pequenos sem ruído e sem se ferir.', alcance:'Pessoal', duracao:'1 min', area:'—', obs:'' },
    { id:'mnd_94', nome:'Rastro Invisível', pm:2, desc:'Os passos do conjurador não deixam marcas físicas por 1 min.', alcance:'Pessoal', duracao:'1 min', area:'—', obs:'Não remove som, apenas pegadas.' },
  ]},
  VI: { nome: 'Comunicação & Social', emoji: '💬', magias: [
    { id:'mnd_15', nome:'Mensagem Breve', pm:2, desc:'Envia uma frase curta (até 12 palavras) a alguém em linha reta.', alcance:'20u', duracao:'Instantâneo', area:'Alvo único', obs:'Apenas o alvo escuta a mensagem.' },
    { id:'mnd_20', nome:'Idioma Sussurrado', pm:2, desc:'Permite que o alvo entenda claramente uma frase curta, mesmo em idioma desconhecido.', alcance:'2u', duracao:'Instantâneo', area:'—', obs:'' },
    { id:'mnd_28', nome:'Voz Delicada', pm:1, desc:'Afina e suaviza a voz do conjurador.', alcance:'Pessoal', duracao:'15 min', area:'—', obs:'+1 em interações sociais sutis.' },
    { id:'mnd_31', nome:'Olhar Brando', pm:1, desc:'Suaviza a expressão facial do conjurador, tornando-o menos ameaçador.', alcance:'Pessoal', duracao:'10 min', area:'—', obs:'+1 em Diplomacia.' },
    { id:'mnd_41', nome:'Eco da Palavra', pm:1, desc:'Repete mentalmente a última frase que o conjurador ouviu.', alcance:'Pessoal', duracao:'1 min', area:'—', obs:'Ajuda em memorização.' },
    { id:'mnd_59', nome:'Asa de Papel', pm:1, desc:'Permite jogar mensagens em papel que sempre caem suavemente.', alcance:'Pessoal', duracao:'Instantâneo', area:'—', obs:'O papel nunca amassa ou rasga na queda.' },
  ]},
  VII: { nome: 'Clima & Conforto', emoji: '🌡️', magias: [
    { id:'mnd_08', nome:'Calor Suave', pm:1, desc:'Aquece as mãos ou um objeto pequeno sem risco de queimadura.', alcance:'Toque', duracao:'30 min', area:'—', obs:'' },
    { id:'mnd_13', nome:'Toque Refrigerante', pm:1, desc:'Resfria um objeto pequeno ou reduz o calor corporal levemente.', alcance:'Toque', duracao:'30 min', area:'—', obs:'' },
    { id:'mnd_19', nome:'Sopro Fresco', pm:1, desc:'Gera uma brisa fraca, suficiente para resfriar um ambiente pequeno.', alcance:'Pessoal', duracao:'5 min', area:'3u', obs:'' },
    { id:'mnd_54', nome:'Escudo de Cheiro', pm:1, desc:'Diminui odores ruins próximos ao conjurador.', alcance:'Pessoal', duracao:'15 min', area:'1u', obs:'Neutraliza cheiros fortes em 1u ao redor.' },
    { id:'mnd_56', nome:'Tranca de Brisa', pm:1, desc:'Faz uma cortina de ar segurar portas abertas ou fechadas.', alcance:'2u', duracao:'10 min', area:'—', obs:'' },
    { id:'mnd_58', nome:'Olhos de Veludo', pm:1, desc:'Suaviza a sensibilidade à luz forte.', alcance:'Pessoal', duracao:'30 min', area:'—', obs:'Evita incômodos por clarões leves.' },
    { id:'mnd_85', nome:'Sede Dispersa', pm:1, desc:'Remove a sensação de sede por um curto período.', alcance:'Pessoal', duracao:'10 min', area:'—', obs:'Não substitui hidratação real.' },
    { id:'mnd_103', nome:'Sopro Quente', pm:1, desc:'Aquece as mãos ou pequenos objetos por 30s.', alcance:'Toque', duracao:'30s', area:'—', obs:'Degelar fechaduras, confortar o frio.' },
  ]},
  VIII: { nome: 'Fechaduras & Trancas', emoji: '🔒', magias: [
    { id:'mnd_03', nome:'Verruma Fantasma', pm:2, desc:'Uma fina lâmina etérea corta cordas, tecidos e pequenas travas não metálicas.', alcance:'1u', duracao:'Instantâneo', area:'—', obs:'Corta materiais leves sem dano a criaturas.' },
    { id:'mnd_10', nome:'Tranca Simples', pm:2, desc:'Fecha e sela temporariamente portas sem fechadura ou mecanismos frágeis.', alcance:'Toque', duracao:'10 min', area:'—', obs:'Exige Força 3 para quebrar.' },
    { id:'mnd_42', nome:'Cola Temporária', pm:1, desc:'Deixa uma superfície levemente aderente.', alcance:'Toque', duracao:'10 min', area:'—', obs:'Pode segurar objetos leves ou impedir que algo deslize.' },
    { id:'mnd_96', nome:'Selo do Bolso', pm:1, desc:'Fecha um bolso ou bolsa com um travamento mágico fraco.', alcance:'Toque', duracao:'1h', area:'—', obs:'Exige um pequeno esforço para abrir.' },
    { id:'mnd_102', nome:'Chave Sutil', pm:1, desc:'Afrouxa fechaduras muito simples (trancas de armários, estojos, caixas).', alcance:'Toque', duracao:'Instantâneo', area:'—', obs:'Não funciona em fechaduras complexas.' },
  ]},
  IX: { nome: 'Limpeza & Ordem', emoji: '🧹', magias: [
    { id:'mnd_06', nome:'Aroma Puro', pm:1, desc:'Remove odores desagradáveis ou impregna um aroma suave escolhido pelo conjurador.', alcance:'1u', duracao:'Permanente', area:'2u', obs:'' },
    { id:'mnd_16', nome:'Mãos Limpas', pm:1, desc:'Remove sujeira, tinta, gordura ou sangue das mãos.', alcance:'Toque', duracao:'Instantâneo', area:'—', obs:'' },
    { id:'mnd_40', nome:'Toque Uniforme', pm:2, desc:'Ajusta ligeiramente o tamanho de roupas para caber perfeitamente no usuário.', alcance:'Toque', duracao:'Permanente (efeito fraco)', area:'—', obs:'' },
    { id:'mnd_92', nome:'Toque Seco', pm:1, desc:'Seca rapidamente áreas úmidas pequenas (roupas, páginas, couro).', alcance:'Toque', duracao:'Instantâneo', area:'—', obs:'' },
    { id:'mnd_95', nome:'Pano Fantasma', pm:1, desc:'Cria um efeito de limpeza leve em superfícies (como um pano úmido invisível).', alcance:'1u', duracao:'Instantâneo', area:'—', obs:'' },
  ]},
  X: { nome: 'Navegação & Mensuração', emoji: '🧭', magias: [
    { id:'mnd_18', nome:'Ponto de Firmeza', pm:2, desc:'Cria uma pequena área estável em terreno escorregadio.', alcance:'1u', duracao:'10 min', area:'1u', obs:'' },
    { id:'mnd_29', nome:'Pulso Mensurador', pm:1, desc:'Mede distâncias curtas com precisão mágica.', alcance:'20u', duracao:'Instantâneo', area:'—', obs:'Exibe mentalmente o valor exato da distância.' },
    { id:'mnd_45', nome:'Pulso do Norte', pm:1, desc:'Indica mentalmente a direção norte.', alcance:'Pessoal', duracao:'10 min', area:'—', obs:'' },
    { id:'mnd_52', nome:'Asa Transparente', pm:1, desc:'Cria uma leve corrente ascendente sob um objeto pequeno.', alcance:'1u', duracao:'Instantâneo', area:'—', obs:'Reduz drasticamente a chance de cair ao chão.' },
    { id:'mnd_82', nome:'Corrente Lenta', pm:1, desc:'Diminui a velocidade de líquidos em movimento (pingos, respingos, água escorrendo).', alcance:'1u', duracao:'10s', area:'—', obs:'Evitar sujeira ou derramamentos.' },
    { id:'mnd_104', nome:'Teia de Pó', pm:1, desc:'Faz poeira formar um desenho simples no ar antes de cair.', alcance:'Pessoal', duracao:'2s', area:'—', obs:'Sinalização rápida e silenciosa.' },
  ]},
  XI: { nome: 'Miscelânea Arcana', emoji: '✨', magias: [
    { id:'mnd_05', nome:'Faísca', pm:1, desc:'Produz uma micro faísca para acender velas, fogueiras ou pólvora.', alcance:'1u', duracao:'Instantâneo', area:'—', obs:'' },
    { id:'mnd_14', nome:'Reforço Temporário', pm:2, desc:'Endurece madeira, tecido ou couro por alguns instantes.', alcance:'Toque', duracao:'1 min', area:'—', obs:'+1 de Resistência do material.' },
    { id:'mnd_17', nome:'Olho do Lapidador', pm:1, desc:'Realça fissuras, falhas e imperfeições em minerais ou metais.', alcance:'Toque', duracao:'1 min', area:'—', obs:'' },
    { id:'mnd_24', nome:'Sabor Perfeito', pm:1, desc:'Ajusta o sabor de uma bebida ou comida simples.', alcance:'Toque', duracao:'Instantâneo', area:'—', obs:'' },
    { id:'mnd_26', nome:'Ligação Frágil', pm:1, desc:'Junta temporariamente itens quebrados (copos, tábuas, cerâmicas).', alcance:'Toque', duracao:'1h', area:'—', obs:'A junção quebra com força moderada.' },
    { id:'mnd_33', nome:'Sombra de Tinta', pm:1, desc:'Reproduz uma cópia perfeitamente legível de um texto pequeno.', alcance:'Toque', duracao:'24h', area:'—', obs:'A cópia desaparece após 24h.' },
    { id:'mnd_35', nome:'Cheiro Predial', pm:1, desc:'Identifica o cheiro mais marcante de uma área recente (fumaça, perfume, mofo).', alcance:'Pessoal', duracao:'Instantâneo', area:'3u', obs:'' },
    { id:'mnd_77', nome:'Selo de Brasa', pm:1, desc:'Marca uma superfície com um símbolo quente, mas que não queima.', alcance:'Toque', duracao:'1h', area:'—', obs:'' },
    { id:'mnd_93', nome:'Acesa Breve', pm:1, desc:'Cria uma chama do tamanho de um fósforo por 1s.', alcance:'Pessoal', duracao:'1s', area:'—', obs:'Acender velas, iscos, pequenas tochas.' },
  ]},
};
