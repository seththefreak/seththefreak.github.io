/* ============================================================
   MODO LEITURA / PREVIEW
============================================================ */
function previewSheet() {
  saveCurrentSheet(true);
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  const content = document.getElementById('readModeContent');
  content.innerHTML = buildReadModeHTML(sheet);
  document.getElementById('readModeOverlay').classList.add('open');
}

function closeReadMode() {
  document.getElementById('readModeOverlay').classList.remove('open');
}
/* ============================================================
   EXPORTAR PDF — corrigido
   Correções:
     1. slotName() agora resolve o equipamento pelo EQUIPAMENTOS_INDEX
        e exibe todos os atributos relevantes (dado, tipoDano, etc.)
     2. A janela de impressão recebe color-scheme correto e a regra
        @media print não sobrescreve mais as cores do tema escolhido
   buildReadModeHTML permanece intacta para o preview overlay.
   buildPrintHTML é a versão self-contained para impressão.
============================================================ */

/* ============================================================
   EXPORTAR PDF — v2 (habilidades corrigidas + suporte a retrato)
============================================================ */

function buildPrintHTML(s, isDark) {

  /* ── PALETA FIXA (sem CSS variables) ──────────────────── */
  const C = isDark ? {
    bg       : '#18111f',
    bgCard   : '#221a30',
    bgCard2  : '#2c2040',
    text     : '#e8e0f8',
    muted    : '#9080b0',
    accent   : '#c0a0f0',
    border   : '#3a2a4a',
    pos      : '#5fc88a',
    neg      : '#e06070',
    zero     : '#7060a0',
    posBg    : '#1a2e22',
    negBg    : '#2e1a20',
    badgeBg  : '#2a1e3a',
    ornament : 'rgba(180,140,255,0.25)',
    resHP    : '#e05070', resMPbg: '#5040a0', resSP: '#40a870', resSAN: '#5090d0',
  } : {
    bg       : '#f8f4ff',
    bgCard   : '#f2ecfc',
    bgCard2  : '#ede5fa',
    text     : '#3d3452',
    muted    : '#9080b0',
    accent   : '#8060b8',
    border   : '#ddd4f0',
    pos      : '#5fa87a',
    neg      : '#c05060',
    zero     : '#a89ec2',
    posBg    : '#d8f4e8',
    negBg    : '#fce8ec',
    badgeBg  : '#e8dff8',
    ornament : 'rgba(160,120,220,0.25)',
    resHP    : '#e05070', resMPbg: '#8060c8', resSP: '#40a870', resSAN: '#5090d0',
  };

  /* ── HELPERS ───────────────────────────────────────────── */
  const esc = str => str
    ? String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
    : '';

  const section = (title, icon, body) => `
    <div style="background:${C.bgCard};border:1px solid ${C.border};border-radius:10px;
                padding:20px 22px;margin-bottom:18px;page-break-inside:avoid;">
      <div style="font-family:'Playfair Display',serif;font-size:1rem;font-weight:700;
                  color:${C.accent};margin-bottom:14px;padding-bottom:8px;
                  border-bottom:1px solid ${C.border};display:flex;align-items:center;gap:8px;">
        <span>${icon}</span> ${title}
      </div>
      ${body}
    </div>`;

  const pill = (label, bg, color) =>
    `<span style="display:inline-block;padding:2px 11px;border-radius:20px;font-size:0.68rem;
                  font-weight:700;text-transform:uppercase;letter-spacing:0.05em;
                  background:${bg};color:${color};">${esc(label)}</span>`;

  const listBlock = (arr, fallback = '') => {
    const items = (arr || []).filter(x => x);
    if (!items.length) return fallback;
    return `<ul style="list-style:none;padding:0;margin:0;">${
      items.map(x => `<li style="padding:4px 0 4px 16px;position:relative;font-size:0.85rem;
                                  color:${C.muted};line-height:1.6;">
        <span style="position:absolute;left:0;top:8px;color:${C.border};font-size:0.5rem;">◆</span>
        ${esc(x)}</li>`).join('')
    }</ul>`;
  };

  /* ── INDEX DE HABILIDADES ──────────────────────────────── */
  /*
   * Varre todo o RACES_DB e monta um Map<id → objeto> cobrindo:
   *   - race.habilidades[]            (habilidades base da raça)
   *   - race.progressao.nucleo[]      (habilidades de núcleo)
   *   - race.progressao.caminhos[].habilidades[]  (caminhos)
   *
   * Isso resolve o bug em que progressaoAtiva continha apenas IDs
   * (ex: "hum_n1") e a impressão mostrava o ID bruto em vez do
   * nome/tipo/descrição reais da habilidade.
   */
  const buildHabIndex = () => {
    const map = new Map();
    if (typeof RACES_DB === 'undefined') return map;
    for (const race of RACES_DB) {
      for (const h of (race.habilidades || [])) {
        map.set(h.id, h);
      }
      const prog = race.progressao || {};
      for (const h of (prog.nucleo || [])) {
        map.set(h.id, h);
      }
      for (const cam of (prog.caminhos || [])) {
        for (const h of (cam.habilidades || [])) {
          map.set(h.id, h);
        }
      }
    }
    return map;
  };
  const HAB_INDEX = buildHabIndex();

  /* ── DADOS DO SHEET ────────────────────────────────────── */
  const attrs   = s.atributos || {};
  const modos   = s.modos || {};
  const rec     = s._recAtual || { HP: '—', MP: '—', SP: '—', SAN: '—' };
  const cart    = s.carteira  || { cobre: 0, prata: 0, ouro: 0, platina: 0 };
  const equip   = s.equipamento || {};
  const inv     = (s.inventario || []).filter(x => x);
  const pericias = s.pericias || {};
  const habs    = (s.progressaoAtiva || []).filter(x => x);
  const portrait = s.portrait || s.portraitData || s.avatarUrl || null;
  const bg      = {
    origem    : s.bgOrigem     || '',
    memoria   : s.bgMemoria    || '',
    objetivo  : s.bgObjetivo   || '',
    motivacao : s.bgMotivacao  || '',
    valores   : s.bgValores    || '',
  };

  /* ── BADGES DE CABEÇALHO ───────────────────────────────── */
  const classColors = {
    base       : { bg: C.badgeBg,   color: C.accent },
    celestial  : { bg: '#daeeff',   color: '#5a90c8' },
    excentrica : { bg: '#fce8f0',   color: '#c07898' },
    eccentrica : { bg: '#fce8f0',   color: '#c07898' },
    default    : { bg: C.badgeBg,   color: C.accent },
  };
  const classKey = (s.classificacao || 'base').toLowerCase();
  const classCfg = classColors[classKey] || classColors.default;

  const tipoMap = { preset: 'Preset Racial', npc: 'NPC', jogador: 'Jogador' };
  const tipoLabel = tipoMap[s.tipo] || 'Jogador';
  const tipoColors = {
    preset : { bg: '#e8dff8', color: '#8060b8' },
    npc    : { bg: '#f0deb0', color: '#987040' },
    jogador: { bg: '#d8f4ec', color: '#5f9e80' },
  };
  const tipoCfg = tipoColors[s.tipo] || tipoColors.jogador;

  /* ── RECURSOS ──────────────────────────────────────────── */
  let recMaxes = { HP: '?', MP: '?', SP: '?', SAN: '?' };
  try { recMaxes = calcRecursos(s); } catch(e) {}

  const resMeta = [
    { key: 'HP',  icon: '❤',  label: 'HP',  sub: 'Vida',     cor: '#e05070' },
    { key: 'MP',  icon: '💜', label: 'MP',  sub: 'Mana',     cor: '#8060c8' },
    { key: 'SP',  icon: '💚', label: 'SP',  sub: 'Estamina', cor: '#40a870' },
    { key: 'SAN', icon: '🔵', label: 'SAN', sub: 'Sanidade', cor: '#5090d0' },
  ];
  const recursosHTML = `
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;">
      ${resMeta.map(m => `
        <div style="background:${C.bgCard2};border:1px solid ${C.border};border-radius:8px;
                    padding:10px 8px;text-align:center;">
          <div style="font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;
                      color:${m.cor};margin-bottom:4px;">${m.icon} ${m.sub}</div>
          <div style="font-family:'Playfair Display',serif;font-size:1.4rem;font-weight:700;color:${m.cor};">
            ${rec[m.key] ?? '—'}
          </div>
          <div style="font-size:0.65rem;color:${C.muted};margin-top:2px;">/ ${recMaxes[m.key] ?? '—'} max</div>
        </div>`).join('')}
    </div>`;

  /* ── ATRIBUTOS ─────────────────────────────────────────── */
  const ATTRS_GROUPS_LOCAL = [
    ['FOR','CON','AGI','DES','VIDA','DEF'],
    ['INT','SAB','VON','CAR','PER'],
    ['MAG','RESM','ATQ']
  ];
  const ATTR_LABELS_LOCAL = {
    FOR:'Força', CON:'Constituição', AGI:'Agilidade', DES:'Destreza',
    VIDA:'Vida', DEF:'Defesa', INT:'Inteligência', SAB:'Sabedoria',
    VON:'Vontade', CAR:'Carisma', PER:'Percepção',
    MAG:'Magia', RESM:'Res.Mág', ATQ:'Ataque'
  };
  const attrCard = (key) => {
    const v   = attrs[key] ?? 0;
    const col = v > 0 ? C.pos : v < 0 ? C.neg : C.zero;
    const disp = v > 0 ? `+${v}` : String(v);
    return `
      <div style="text-align:center;background:${C.bgCard2};border-radius:8px;padding:8px 4px;">
        <div style="font-size:0.58rem;font-weight:700;text-transform:uppercase;
                    letter-spacing:0.07em;color:${C.muted};margin-bottom:3px;">${ATTR_LABELS_LOCAL[key]||key}</div>
        <div style="font-family:'Playfair Display',serif;font-size:1.25rem;
                    font-weight:700;color:${col};">${disp}</div>
      </div>`;
  };

  const atributosHTML = ATTRS_GROUPS_LOCAL.map((group, gi) => {
    const groupLabels = ['Físicos', 'Mentais', 'Combate'];
    return `
      <div style="margin-bottom:12px;">
        <div style="font-size:0.62rem;font-weight:700;text-transform:uppercase;letter-spacing:0.09em;
                    color:${C.muted};margin-bottom:6px;">${groupLabels[gi]}</div>
        <div style="display:grid;grid-template-columns:repeat(${group.length},1fr);gap:6px;">
          ${group.map(attrCard).join('')}
        </div>
      </div>`;
  }).join('');

  const picoFraqueza = (s.picoPrincipal || s.fraquezaEstrutural) ? `
    <div style="display:flex;gap:10px;margin-top:10px;flex-wrap:wrap;">
      ${s.picoPrincipal ? `
        <div style="background:${C.posBg};border-radius:6px;padding:8px 14px;font-size:0.82rem;">
          <span style="color:${C.pos};font-weight:700;">▲ Pico:</span> ${esc(s.picoPrincipal)}
        </div>` : ''}
      ${s.fraquezaEstrutural ? `
        <div style="background:${C.negBg};border-radius:6px;padding:8px 14px;font-size:0.82rem;">
          <span style="color:${C.neg};font-weight:700;">▼ Fraqueza:</span> ${esc(s.fraquezaEstrutural)}
        </div>` : ''}
    </div>` : '';

  /* ── MODOS ─────────────────────────────────────────────── */
  const modesVals = Object.values(modos);
  const maxM = modesVals.length ? Math.max(...modesVals) : 0;
  const modosHTML = Object.entries(modos).map(([k, v]) => {
    const isDom = v === maxM && v > 1;
    return `<div style="padding:6px 14px;border-radius:6px;font-size:0.82rem;
                         background:${isDom ? C.accent : C.bgCard2};
                         color:${isDom ? (isDark ? '#18111f' : '#fff') : C.text};
                         font-weight:${isDom ? '700' : '400'};">
      ${esc(k)}: <strong>${v}</strong>
    </div>`;
  }).join('');

  /* ── PERÍCIAS ──────────────────────────────────────────── */
  const periciasFiltradas = Object.entries(pericias).filter(([, v]) => v !== 0);
  const periciasHTML = periciasFiltradas.length
    ? `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;">
        ${periciasFiltradas.map(([k, v]) => `
          <div style="display:flex;justify-content:space-between;align-items:center;
                      background:${C.bgCard2};border-radius:6px;padding:6px 10px;">
            <span style="font-size:0.78rem;color:${C.muted};">${esc(k)}</span>
            <span style="font-size:0.88rem;font-weight:700;
                         color:${v > 0 ? C.pos : C.neg};">${v > 0 ? '+' : ''}${v}</span>
          </div>`).join('')}
       </div>`
    : `<p style="font-size:0.82rem;color:${C.muted};font-style:italic;">Nenhuma perícia treinada.</p>`;

  /* ── HABILIDADES (CORRIGIDO) ───────────────────────────── */
  /*
   * Agora resolve cada ID via HAB_INDEX para exibir nome, tipo e
   * descrição reais. IDs não encontrados no DB (ex: habilidades
   * customizadas) caem num fallback de pílula com o ID cru.
   */
  const HAB_TIPO_COLOR = {
    passiva    : isDark ? '#9070d0' : '#8060b8',
    ativa      : isDark ? '#5090d0' : '#4070c0',
    progressao : isDark ? '#40a870' : '#2e8a5a',
    negativa   : isDark ? '#e06070' : '#c05060',
  };

  const habsHTML = habs.length
    ? `<div style="display:flex;flex-direction:column;gap:8px;">
        ${habs.map(id => {
          const h = HAB_INDEX.get(id);

          /* ID não encontrado → pílula de fallback */
          if (!h) {
            return `<span style="display:inline-block;padding:5px 12px;border-radius:20px;
                                 font-size:0.78rem;font-family:'IBM Plex Mono',monospace;
                                 background:${C.bgCard2};border:1px solid ${C.border};
                                 color:${C.muted};font-style:italic;">${esc(id)}</span>`;
          }

          const tipoCor = HAB_TIPO_COLOR[h.tipo] || C.muted;

          return `
            <div style="background:${C.bgCard2};border:1px solid ${C.border};border-radius:8px;
                        padding:10px 14px;position:relative;overflow:hidden;">
              <div style="position:absolute;left:0;top:0;bottom:0;width:3px;
                          background:${tipoCor};border-radius:2px 0 0 2px;"></div>
              <div style="padding-left:12px;">
                <div style="display:flex;align-items:center;gap:7px;margin-bottom:4px;flex-wrap:wrap;">
                  <span style="font-weight:700;font-size:0.88rem;color:${C.text};">${esc(h.nome)}</span>
                  ${h.tipo ? `<span style="font-size:0.6rem;font-weight:700;text-transform:uppercase;
                                           letter-spacing:0.06em;padding:1px 7px;border-radius:10px;
                                           background:${tipoCor}22;color:${tipoCor};">${esc(h.tipo)}</span>` : ''}
                </div>
                ${h.req ? `<div style="font-size:0.7rem;color:${C.accent};font-style:italic;margin-bottom:5px;">
                              Req: ${esc(h.req)}</div>` : ''}
                <div style="font-size:0.8rem;color:${C.muted};line-height:1.55;">${esc(h.desc || '')}</div>
                ${h.efeito && h.efeito.condicional ? `
                  <div style="margin-top:5px;font-size:0.7rem;color:${tipoCor};font-style:italic;">
                    ⚡ ${esc(h.efeito.condicional)}
                  </div>` : ''}
              </div>
            </div>`;
        }).join('')}
       </div>`
    : `<p style="font-size:0.82rem;color:${C.muted};font-style:italic;">Nenhuma habilidade adquirida.</p>`;

  /* ── EQUIPAMENTOS ──────────────────────────────────────── */
  const resolveEquip = (slot) => {
    if (!slot) return null;
    if (typeof slot === 'string') {
      return (typeof EQUIPAMENTOS_INDEX !== 'undefined' && EQUIPAMENTOS_INDEX.get(slot)) || { nome: slot };
    }
    if (slot.id && typeof EQUIPAMENTOS_INDEX !== 'undefined') {
      const fromDB = EQUIPAMENTOS_INDEX.get(slot.id);
      return fromDB ? { ...fromDB, ...slot } : slot;
    }
    return slot;
  };

  const slotCard = (obj, label, icon) => {
    if (!obj) {
      return `
        <div style="background:${C.bgCard2};border-radius:8px;padding:10px 12px;">
          <div style="font-size:0.62rem;font-weight:700;text-transform:uppercase;
                      color:${C.muted};margin-bottom:6px;">${icon} ${label}</div>
          <span style="color:${C.muted};font-style:italic;font-size:0.82rem;">— vazio —</span>
        </div>`;
    }

    const nome = esc(obj.nome || obj.id || '?');
    const detailRow = (lbl, val) => val != null && val !== ''
      ? `<div style="display:flex;gap:4px;align-items:baseline;font-size:0.73rem;margin-top:3px;">
           <span style="color:${C.muted};min-width:72px;">${lbl}</span>
           <span style="color:${C.text};font-weight:600;">${esc(String(val))}</span>
         </div>`
      : '';

    let details = '';
    const tipo = obj.tipo || '';

    if (tipo === 'arma') {
      details = [
        detailRow('Dano',        obj.dado),
        detailRow('Tipo',        obj.tipoDano),
        detailRow('Empunhadura', obj.empunhadura),
        detailRow('Alcance',     obj.alcance),
        detailRow('Ação',        obj.acao),
        obj.penalidade  ? detailRow('Penalidade',  obj.penalidade)  : '',
        obj.bonus       ? detailRow('Bônus',       obj.bonus)       : '',
        obj.critico     ? detailRow('Crítico',     obj.critico)     : '',
        obj.aspectos    ? detailRow('Aspectos',    obj.aspectos)    : '',
        obj.requisitos  ? detailRow('Requisitos',  Object.entries(obj.requisitos).map(([k,v])=>`${k} ${v>=0?'+':''}${v}`).join(', ')) : '',
      ].join('');
    } else if (tipo === 'armadura') {
      details = [
        detailRow('RD',          obj.rd),
        detailRow('CA',          obj.ca),
        detailRow('Res. Mágica', obj.rm  || null),
        obj.penalidade  ? detailRow('Penalidade',  obj.penalidade)  : '',
        detailRow('Peso',        obj.peso != null ? `${obj.peso} kg` : null),
      ].join('');
    } else if (tipo === 'escudo') {
      details = [
        detailRow('Defesa',       obj.defesa),
        detailRow('Durabilidade', obj.durabilidade),
        obj.penalidade  ? detailRow('Penalidade', obj.penalidade)  : '',
        detailRow('Peso',         obj.peso != null ? `${obj.peso} kg` : null),
      ].join('');
    } else {
      details = [
        detailRow('Tipo', obj.categoria || obj.subtipo || null),
        detailRow('Peso', obj.peso != null ? `${obj.peso} kg` : null),
      ].join('');
    }

    return `
      <div style="background:${C.bgCard2};border-radius:8px;padding:10px 12px;">
        <div style="font-size:0.62rem;font-weight:700;text-transform:uppercase;
                    color:${C.muted};margin-bottom:6px;">${icon} ${label}</div>
        <div style="font-weight:700;color:${C.text};font-size:0.88rem;margin-bottom:4px;">${nome}</div>
        ${details
          ? `<div style="border-top:1px solid ${C.border};margin-top:6px;padding-top:6px;">${details}</div>`
          : ''}
      </div>`;
  };

  const maoEsq  = resolveEquip(equip.maoEsquerda);
  const maoDir  = resolveEquip(equip.maoDireita);
  const armadura = resolveEquip(equip.armadura);

  const equipHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;">
      ${slotCard(maoEsq,  'Mão Esq.',  '🗡')}
      ${slotCard(maoDir,  'Mão Dir.',  '⚔')}
      ${slotCard(armadura,'Armadura',  '🛡')}
    </div>`;

  /* ── INVENTÁRIO ─────────────────────────────────────────── */
  const invHTML = inv.length
    ? `<table style="width:100%;border-collapse:collapse;font-size:0.82rem;">
        <thead>
          <tr style="border-bottom:1px solid ${C.border};">
            <th style="text-align:left;padding:4px 8px;color:${C.muted};font-weight:700;font-size:0.65rem;text-transform:uppercase;">Item</th>
            <th style="text-align:center;padding:4px 8px;color:${C.muted};font-weight:700;font-size:0.65rem;text-transform:uppercase;">Qtd</th>
            <th style="text-align:center;padding:4px 8px;color:${C.muted};font-weight:700;font-size:0.65rem;text-transform:uppercase;">Peso</th>
          </tr>
        </thead>
        <tbody>
          ${inv.map((item, i) => `
            <tr style="background:${i % 2 === 0 ? 'transparent' : C.bgCard2};">
              <td style="padding:5px 8px;color:${C.text};">${esc(item.nome || item.id || '?')}</td>
              <td style="padding:5px 8px;text-align:center;color:${C.muted};">${item.quantidade ?? 1}</td>
              <td style="padding:5px 8px;text-align:center;color:${C.muted};">${item.peso ?? '—'}</td>
            </tr>`).join('')}
        </tbody>
      </table>`
    : `<p style="font-size:0.82rem;color:${C.muted};font-style:italic;">Inventário vazio.</p>`;

  /* ── CARTEIRA ───────────────────────────────────────────── */
  const moedaChip = (label, valor, cor) =>
    `<div style="text-align:center;background:${C.bgCard2};border-radius:8px;padding:8px 12px;min-width:60px;">
      <div style="font-size:0.6rem;font-weight:700;text-transform:uppercase;color:${cor};margin-bottom:3px;">${label}</div>
      <div style="font-family:'Playfair Display',serif;font-size:1.1rem;font-weight:700;color:${C.text};">${valor}</div>
    </div>`;

  const carteiraHTML = `
    <div style="display:flex;gap:10px;flex-wrap:wrap;">
      ${moedaChip('Cobre',   cart.cobre   || 0, '#b87040')}
      ${moedaChip('Prata',   cart.prata   || 0, '#9090b0')}
      ${moedaChip('Ouro',    cart.ouro    || 0, '#c0a020')}
      ${moedaChip('Platina', cart.platina || 0, '#80c0d0')}
    </div>`;

  /* ── BACKGROUND ─────────────────────────────────────────── */
  const bgRow = (label, val) => val
    ? `<div style="margin-bottom:10px;">
        <div style="font-size:0.62rem;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;
                    color:${C.accent};margin-bottom:4px;">${label}</div>
        <div style="font-size:0.85rem;color:${C.muted};line-height:1.6;padding:8px 12px;
                    background:${C.bgCard2};border-radius:6px;border-left:3px solid ${C.accent};">
          ${esc(val)}
        </div>
       </div>`
    : '';

  const backgroundHTML = [
    bgRow('Origem',    bg.origem),
    bgRow('Memória',   bg.memoria),
    bgRow('Objetivo',  bg.objetivo),
    bgRow('Motivação', bg.motivacao),
    bgRow('Valores',   bg.valores),
    s.impeto ? `<div style="margin-top:8px;display:flex;align-items:center;gap:8px;">
      <span style="font-size:0.62rem;font-weight:700;text-transform:uppercase;color:${C.accent};">Ímpeto</span>
      <span style="font-family:'Playfair Display',serif;font-size:1.1rem;font-weight:700;color:${C.pos};">${s.impeto}</span>
    </div>` : '',
  ].join('');

  const hasBg = Object.values(bg).some(v => v) || s.impeto;

  /* ── BADGE RAÇA ─────────────────────────────────────────── */
  const raceBadges = [
    s.raceSelecionada     ? pill(s.raceSelecionada,     '#e0d4f8', C.accent)   : '',
    s.subraçaSelecionada  ? pill(s.subraçaSelecionada,  '#d4eef8', '#5a90c8')  : '',
    s.modificador         ? pill(s.modificador === 'Aika' ? '💠 Aika' : '🔶 Ukya', '#ffe8cc', '#987040') : '',
  ].filter(Boolean).join(' ');

  /* ── MONTAGEM FINAL ─────────────────────────────────────── */
  return `
    <!-- ORNAMENTO -->
    <div style="text-align:center;letter-spacing:0.4em;color:${C.ornament};font-size:1.1rem;margin-bottom:10px;">✦ ❧ ✦</div>

    <!-- CABEÇALHO (com retrato opcional) -->
    <div style="margin-bottom:20px;">

      ${portrait ? `
        <div style="float:right;margin:0 0 16px 20px;">
          <div style="width:110px;height:147px;border-radius:8px;overflow:hidden;
                      border:2px solid ${C.border};box-shadow:0 4px 16px rgba(0,0,0,0.25);">
            <img src="${portrait}"
                 style="width:100%;height:100%;object-fit:cover;display:block;"
                 alt="Retrato de ${esc(s.name || '')}"/>
          </div>
        </div>` : ''}

      <h1 style="font-family:'Playfair Display',serif;font-size:2.2rem;font-weight:700;
                  color:${C.accent};margin:0 0 8px;">
        ${esc(s.name || 'Ficha sem nome')}
      </h1>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
        ${pill(s.classificacao || 'Base', classCfg.bg, classCfg.color)}
        ${pill(`Nível ${s.nivel || 1}`, C.badgeBg, C.accent)}
        ${pill(tipoLabel, tipoCfg.bg, tipoCfg.color)}
      </div>
      ${raceBadges ? `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;">${raceBadges}</div>` : ''}
      ${s.conceitoNarrativo
        ? `<p style="font-style:italic;color:${C.muted};font-size:0.9rem;line-height:1.7;
                     margin:10px 0 0;padding:10px 14px;background:${C.bgCard};border-radius:8px;
                     border-left:3px solid ${C.accent};">${esc(s.conceitoNarrativo)}</p>`
        : ''}

      ${portrait ? '<div style="clear:both;"></div>' : ''}
    </div>

    <div style="border-top:1px solid ${C.border};margin-bottom:18px;
                text-align:center;padding-top:10px;color:${C.ornament};letter-spacing:0.3em;">· · ·</div>

    <!-- RECURSOS -->
    ${section('Recursos', '⚡', recursosHTML)}

    <!-- ATRIBUTOS -->
    ${section('Atributos Base', '⚔', atributosHTML + picoFraqueza)}

    <!-- MODOS -->
    ${section('Modos Narrativos', '🎭',
      `<div style="display:flex;gap:8px;flex-wrap:wrap;">${modosHTML}</div>`)}

    <!-- PERÍCIAS -->
    ${section('Perícias', '📖', periciasHTML)}

    <!-- HABILIDADES -->
    ${section('Habilidades Adquiridas', '✨', habsHTML)}

    <!-- TRAÇOS / VANTAGENS / VULNERAB. -->
    ${(s.tracos?.some(x=>x) || s.vantagens?.some(x=>x) || s.vulnerabilidades?.some(x=>x))
      ? section('Características', '🧬', `
          ${s.tracos?.some(x=>x) ? `
            <div style="margin-bottom:12px;">
              <div style="font-size:0.65rem;font-weight:700;text-transform:uppercase;
                          color:${C.accent};margin-bottom:6px;">Traços Fixos</div>
              ${listBlock(s.tracos)}
            </div>` : ''}
          ${s.vantagens?.some(x=>x) ? `
            <div style="margin-bottom:12px;">
              <div style="font-size:0.65rem;font-weight:700;text-transform:uppercase;
                          color:${C.pos};margin-bottom:6px;">▲ Vantagens Situacionais</div>
              ${listBlock(s.vantagens)}
            </div>` : ''}
          ${s.vulnerabilidades?.some(x=>x) ? `
            <div>
              <div style="font-size:0.65rem;font-weight:700;text-transform:uppercase;
                          color:${C.neg};margin-bottom:6px;">▼ Vulnerabilidades Naturais</div>
              ${listBlock(s.vulnerabilidades)}
            </div>` : ''}`)
      : ''}

    <!-- ARQUÉTIPO / CUSTO -->
    ${(s.arquetipo || s.custoNarrativo) ? section('Perfil Narrativo', '📜', `
      ${s.arquetipo ? `
        <div style="margin-bottom:10px;">
          <div style="font-size:0.65rem;font-weight:700;text-transform:uppercase;color:${C.muted};margin-bottom:4px;">Arquétipo Natural</div>
          <div style="font-size:0.85rem;color:${C.muted};">${esc(s.arquetipo)}</div>
        </div>` : ''}
      ${s.custoNarrativo ? `
        <div>
          <div style="font-size:0.65rem;font-weight:700;text-transform:uppercase;color:${C.muted};margin-bottom:4px;">Custo Narrativo</div>
          <div style="font-size:0.85rem;color:${C.muted};">${esc(s.custoNarrativo)}</div>
        </div>` : ''}
    `) : ''}

    <!-- EQUIPAMENTOS -->
    ${section('Equipamentos', '⚔', equipHTML)}

    <!-- INVENTÁRIO -->
    ${section('Inventário', '🎒', invHTML)}

    <!-- CARTEIRA -->
    ${section('Carteira', '💰', carteiraHTML)}

    <!-- BACKGROUND -->
    ${hasBg ? section('Background do Personagem', '📖', backgroundHTML) : ''}

    <!-- RODAPÉ -->
    <div style="text-align:center;letter-spacing:0.4em;color:${C.ornament};font-size:1.1rem;margin-top:10px;">✦ ❧ ✦</div>
    <div style="text-align:center;font-size:0.62rem;color:${C.ornament};margin-top:6px;font-family:'IBM Plex Mono',monospace;">
      Verloren RPG Sheets · ${esc(s.name || '')} · Nível ${s.nivel || 1}
    </div>
  `;
}

/* ============================================================
   EXPORTAR PDF
============================================================ */
function exportSheetPDF() {
  saveCurrentSheet(true);
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  
// Injeta o retrato salvo separadamente no objeto da ficha antes de gerar o PDF
  const _pKey = 'portrait_' + currentSheetId;
  sheet.portraitData = localStorage.getItem(_pKey) || '';

  const isDark = getDarkModeState();
  const bg     = isDark ? '#18111f' : '#f8f4ff';
  const text   = isDark ? '#e8e0f8' : '#3d3452';

  const colorSchemeMeta = isDark ? 'dark' : 'light';
  const colorSchemeCSS  = isDark ? 'dark'  : 'light';

  const html = `<!DOCTYPE html>
<html data-theme="${isDark ? 'dark' : 'light'}">
<head>
<meta charset="UTF-8"/>
<meta name="color-scheme" content="${colorSchemeMeta}"/>
<title>${(sheet.name || 'Ficha').replace(/</g,'&lt;')} — Verloren RPG Sheets</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&family=Merriweather:wght@400;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet"/>
<style>
  :root { color-scheme: ${colorSchemeCSS}; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Merriweather', serif;
    background: ${bg} !important;
    color: ${text} !important;
    padding: 32px 40px;
    max-width: 780px;
    margin: 0 auto;
    font-size: 14px;
    line-height: 1.5;
  }
  @media print {
    html, body {
      -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
      background: ${bg} !important;
      color: ${text} !important;
    }
    body { padding: 16px 24px; }
    @page { margin: 12mm 14mm; }
  }
</style>
</head>
<body data-theme="${isDark ? 'dark' : 'light'}">
${buildPrintHTML(sheet, isDark)}
<script>
  document.fonts.ready.then(() => { window.print(); });
<\/script>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (!win) {
    toast('Pop-up bloqueado pelo navegador. Permita pop-ups para exportar o PDF.', 'error');
    return;
  }
  win.document.write(html);
  win.document.close();
  toast('PDF aberto para impressão!', 'success');
}

/* ============================================================
   EXPORTAR PNG
============================================================ */
function exportSheetPNG() {
  saveCurrentSheet(true);
  previewSheet(); // abre o preview
  setTimeout(() => {
    toast('Use a captura de tela do navegador ou Ctrl+P → Salvar como PDF para exportar a imagem.', 'info');
  }, 500);
}

/* ============================================================
   MODAIS
============================================================ */
function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// Fechar modal ao clicar fora — registrado via delegação no document para garantir que o DOM está pronto
function initModalClickOutside() {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });
}

/* ============================================================
   TOAST
============================================================ */
function toast(msg, type = 'info') {
  const icons = { success: '✓', error: '✕', info: 'ℹ', warn: '⚠' };
  const container = document.getElementById('toastContainer');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${icons[type]}</span> ${msg}`;
  container.appendChild(el);
  setTimeout(() => {
    el.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

/* ============================================================
   UTILITÁRIOS
============================================================ */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}

/* ============================================================
   FASE 3 — SISTEMA DE EQUIPAMENTOS & INVENTÁRIO
============================================================ */

// ---- BASE DE DADOS DE EQUIPAMENTOS ----
let slotAtualSeletor = null;

// ---- MOEDAS ----
function salvarMoedas(valor) {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  sheet.moedas = sanitizeNonNegativeInt(valor);
  // sync carteira prata
  if (!sheet.carteira) sheet.carteira = { cobre:0, prata:0, ouro:0, platina:0 };
  sheet.carteira.prata = sheet.moedas;
  debounceSave();
}

function salvarMoedaEspecifica(tipo, valor) {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  if (!sheet.carteira) sheet.carteira = { cobre:0, prata:0, ouro:0, platina:0 };
  sheet.carteira[tipo] = sanitizeNonNegativeInt(valor);
  // keep moedas (prata) in sync
  sheet.moedas = sheet.carteira.prata || 0;
  const moedasEl = document.getElementById('moedasInput');
  if (moedasEl) moedasEl.value = sheet.moedas;
  debounceSave();
}

function converterMoedas() {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  if (!sheet.carteira) sheet.carteira = { cobre:0, prata:0, ouro:0, platina:0 };
  let { cobre, prata, ouro, platina } = sheet.carteira;
  // 100 cobre = 1 prata
  const cobreExcesso = Math.floor(cobre / 100);
  cobre = cobre % 100;
  prata += cobreExcesso;
  // 10 prata = 1 ouro
  const pratoExcesso = Math.floor(prata / 10);
  prata = prata % 10;
  ouro += pratoExcesso;
  // 10 ouro = 1 platina
  const ouroExcesso = Math.floor(ouro / 10);
  ouro = ouro % 10;
  platina += ouroExcesso;
  sheet.carteira = { cobre, prata, ouro, platina };
  sheet.moedas = prata;
  renderCarteiraUI(sheet);
  debounceSave();
  toast('Moedas convertidas! ⇅', 'success');
}

function renderCarteiraUI(sheet) {
  const c = sheet.carteira || { cobre:0, prata:0, ouro:0, platina:0 };
  const elC = document.getElementById('carteiraCobre');
  const elP = document.getElementById('carteiraPrata');
  const elO = document.getElementById('carteiraOuro');
  const elPt = document.getElementById('carteiraPlatina');
  if (elC)  elC.value  = c.cobre   || 0;
  if (elP)  elP.value  = c.prata   || 0;
  if (elO)  elO.value  = c.ouro    || 0;
  if (elPt) elPt.value = c.platina || 0;
  const moedasEl = document.getElementById('moedasInput');
  if (moedasEl) moedasEl.value = c.prata || 0;
}

// ── SISTEMA MONETÁRIO EXPANDIDO ────────────────────────────
const RAR_COLORS = ['#9ba8b0','#6ab87a','#6aace0','#b86ad8','#e09040','#e04050','#e0b020'];
const RAR_LABELS = ['Comum','Incomum','Raro','Épico','Lendário','Mítico','Único'];

let _lojaTab = 'todos';

function setLojaTab(tab) {
  _lojaTab = tab;
  document.querySelectorAll('.loja-tab').forEach(t => t.classList.remove('active'));
  const tabs = document.querySelectorAll('.loja-tab');
  const tabMap = ['todos','arma','armadura','escudo','pocao','elixir','util','material','comida'];
  const idx = tabMap.indexOf(tab);
  if (tabs[idx]) tabs[idx].classList.add('active');
  filtrarLoja();
}

function filtrarLoja() {
  const q = document.getElementById('lojaSearch')?.value || '';
  const grid = document.getElementById('lojaGrid');
  if (!grid) return;

  // Juntar todos os itens compráveis
  const equipItens = TODOS_EQUIPAMENTOS.map(e => ({ ...e, subtipo: e.tipo, icone: e.tipo === 'arma' ? '⚔️' : e.tipo === 'armadura' ? '🛡️' : '🔰', efeito: buildEquipEfeito(e) }));
  const todos = [...equipItens, ...CONSUMIVEIS_DB, ...MATERIAIS_DB];

  const filtrados = todos.filter(i => {
    const tipo = i.tipo || '';
    const matchTab = _lojaTab === 'todos' || tipo === _lojaTab || i.subtipo === _lojaTab;
    const matchQ = !q || includesNormalized(i.nome, q) || includesNormalized(i.efeito, q) || includesNormalized(i.desc, q);
    return matchTab && matchQ;
  });

  if (!filtrados.length) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:24px;">Nenhum item encontrado.</div>';
    return;
  }

  grid.innerHTML = filtrados.map(item => {
    const rar = item.rar !== undefined ? item.rar : 0;
    const rarC = RAR_COLORS[rar] || RAR_COLORS[0];
    const rarL = RAR_LABELS[rar] || 'Comum';
    const icone = item.icone || '📦';
    const efeito = item.efeito || item.desc || '—';
    const preco = item.preco || 0;
    const peso = item.peso !== undefined ? item.peso + 'kg' : '—';
    const idSeguro = (item.id||'').replace(/['"]/g, '');
    return `<div class="loja-card">
      <div class="loja-card-top">
        <span class="loja-icone">${icone}</span>
        <span class="loja-nome">${escapeHtml(item.nome)}</span>
        <span class="loja-rar" style="background:${rarC}22;color:${rarC};border:1px solid ${rarC}55;">${rarL}</span>
      </div>
      <div class="loja-efeito">${escapeHtml(efeito)}</div>
      <div class="loja-footer">
        <span class="loja-preco">💰 ${preco}P</span>
        <span class="loja-peso">⚖️ ${peso}</span>
        <button class="loja-comprar" onclick="comprarItem('${idSeguro}')">Comprar</button>
      </div>
    </div>`;
  }).join('');
}

function buildEquipEfeito(e) {
  if (e.tipo === 'arma')    return `Dano: ${e.dado||'—'} ${e.tipoDano||''} | Empun: ${e.empunhadura||'—'} | Crítico: ${e.critico||'—'}`;
  if (e.tipo === 'armadura') return `RD: ${e.rd} | CA: ${e.ca} | RM: ${e.rm} | Penalidade: ${e.penalidade}`;
  if (e.tipo === 'escudo')  return `Defesa: +${e.defesa} | Durabilidade: ${e.durabilidade} | Penalidade: ${e.penalidade}`;
  return '—';
}

function comprarItem(itemId) {
  const sheet = getSheet(currentSheetId);
  if (!sheet) { toast('Nenhuma ficha ativa!', 'error'); return; }

  // Verifica se é equipamento
  const equip = EQUIPAMENTOS_INDEX.get(itemId);
  const consumivel = CONSUMIVEIS_INDEX.get(itemId);
  const material = MATERIAIS_INDEX.get(itemId);
  const item = equip || consumivel || material;
  if (!item) { toast('Item não encontrado!', 'error'); return; }

  const preco = item.preco || 0;
  if (!sheet.carteira) sheet.carteira = { cobre:0, prata: sheet.moedas||0, ouro:0, platina:0 };
  const prataDispo = sheet.carteira.prata || 0;
  if (prataDispo < preco) {
    toast(`Prata insuficiente! Você tem ${prataDispo}P, precisa de ${preco}P`, 'error');
    return;
  }

  sheet.carteira.prata -= preco;
  sheet.moedas = sheet.carteira.prata;
  renderCarteiraUI(sheet);

  // Adicionar ao inventário
  sheet.inventario = sheet.inventario || [];
  sheet.inventario.push({
    id: 'item_' + generateId(),
    nome: item.nome,
    peso: item.peso || 0,
    quantidade: 1,
    origem: 'loja',
    itemId: itemId
  });

  // Registrar transação
  registrarTransacao(sheet, `Compra: ${item.nome}`, -preco);

  renderInventario(sheet);
  atualizarCarga(sheet);
  renderRecompensas(sheet);
  debounceSave();
  toast(`${item.nome} comprado! −${preco}P`, 'success');
}

function abrirTransacao(tipo) {
  const desc = document.getElementById('transacaoDescInput');
  const valor = document.getElementById('transacaoValorInput');
  const titulo = document.getElementById('transacaoTitulo');
  if (!desc || !valor) { abrirAdicionarRecompensa(); return; }
  if (titulo) titulo.textContent = tipo === 'ganhar' ? '💰 Ganhar Moedas' : '💸 Gastar Moedas';
  desc.value = '';
  valor.value = '100';
  desc.dataset.tipo = tipo;
  openModal('transacaoModal');
  setTimeout(() => desc.focus(), 100);
}

function confirmarTransacao() {
  const desc = document.getElementById('transacaoDescInput');
  const valor = document.getElementById('transacaoValorInput');
  if (!desc || !valor) return;
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;

  const tipo = desc.dataset.tipo || 'ganhar';
  const descricao = desc.value.trim();
  const quantia = sanitizeNonNegativeInt(valor.value);
  if (!descricao) { toast('Digite a descrição!', 'error'); return; }

  const delta = tipo === 'ganhar' ? quantia : -quantia;
  if (!sheet.carteira) sheet.carteira = { cobre:0, prata:0, ouro:0, platina:0 };
  sheet.carteira.prata = Math.max(0, (sheet.carteira.prata || 0) + delta);
  sheet.moedas = sheet.carteira.prata;

  renderCarteiraUI(sheet);

  registrarTransacao(sheet, descricao, delta);
  renderRecompensas(sheet);
  debounceSave();
  closeModal('transacaoModal');
  toast(tipo === 'ganhar' ? `+${quantia}P ganhos!` : `−${quantia}P gastos!`, 'success');
}

function registrarTransacao(sheet, desc, valor) {
  sheet.recompensas = sheet.recompensas || [];
  sheet.recompensas.unshift({ id: 'tx_' + generateId(), descricao: desc, valor, data: Date.now() });
  // Manter apenas últimas 50
  if (sheet.recompensas.length > 50) sheet.recompensas = sheet.recompensas.slice(0, 50);
}

function limparHistoricoTransacoes() {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  if (!confirm('Limpar todo o histórico de transações?')) return;
  sheet.recompensas = [];
  renderRecompensas(sheet);
  debounceSave();
  toast('Histórico limpo.', 'info');
}

function renderLoja() {
  _lojaTab = 'todos';
  filtrarLoja();
}

// ---- ÍMPETO ----
const IMPETO_TABLE = [0,10,25,45,70,100,140,190,250,320,400,490,590,700,820,950,1090,1240,1400,1600];

const MARCOS = {5:'Desafio',9:'Grande Feito',13:'Determinação',15:'Proeza Épica',17:'Ascensão Lendária',19:'Julgamento',20:'Lenda Viva'};

function salvarImpeto(valor) {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  sheet.impeto = sanitizeNonNegativeInt(valor);
  updateImpetoHint(sheet.nivel || 1, sheet.impeto);
  debounceSave();
}

function updateImpetoHint(nivel, impeto) {
  const hint = document.getElementById('impetoNivelHint');
  const meta = document.getElementById('impetoMeta');
  if (!hint || !meta) return;
  const proximoNivel = nivel + 1;
  if (proximoNivel <= 20) {
    const needed = IMPETO_TABLE[proximoNivel - 1];
    const diff = Math.max(0, needed - impeto);
    hint.textContent = diff === 0 ? '✅ Pronto para avançar de nível!' : `Próximo nível (${proximoNivel}): ${needed} Ímpeto — faltam ${diff}`;
  } else {
    hint.textContent = 'Nível máximo atingido!';
  }
  const marco = MARCOS[nivel];
  meta.innerHTML = marco ? `<span style="color:var(--lavanda-dark);font-weight:700;">✦ Marco: ${marco}</span>` : '';
}

// ---- CARGA ----
function atualizarCarga(sheet) {
  if (!sheet) return;
  // FOR efetivo = base + raceBonus; se Aika, trata como -3 para fins de carga
  const forEfetivo = getAtributoEfetivo(sheet, 'FOR');
  const forCarga = forEfetivo === -Infinity ? -3 : forEfetivo;
  const maxCarga = calcCapacidadeCarga(forCarga);
  const pesoTotal = calcularPesoTotal(sheet);
  const pct = maxCarga > 0 ? Math.min((pesoTotal / maxCarga) * 100, 100) : 100;
  const overloaded = pesoTotal > maxCarga;

  const fill  = document.getElementById('cargaFill');
  const atual = document.getElementById('cargaAtual');
  const maxEl = document.getElementById('cargaMaxima');

  if (fill)  { fill.style.width = pct + '%'; fill.classList.toggle('overload', overloaded); }
  if (atual) atual.textContent = pesoTotal.toFixed(1);
  if (maxEl) maxEl.textContent = maxCarga.toFixed(1);
}

function calcularPesoTotal(sheet) {
  let peso = 0;
  
  // Peso dos equipados
  const equip = sheet.equipamento || {};
  ['maoEsquerda', 'maoDireita', 'armadura'].forEach(slot => {
    const itemId = equip[slot];
    if (!itemId) return;
    if (typeof itemId === 'string' && itemId.endsWith('__bloqueado')) return; // skip marker
    const item = EQUIPAMENTOS_INDEX.get(itemId);
    if (item) peso += item.peso || 0;
  });
  
  // Peso do inventário
  (sheet.inventario || []).forEach(item => {
    peso += (item.peso || 0) * (item.quantidade || 1);
  });
  
  return peso;
}

// ---- EQUIPAMENTOS (SLOTS) ----
function abrirSeletorEquipamento(slotNome) {
  slotAtualSeletor = slotNome;
  const titulos = { maoEsquerda: '🗡️ Mão Esquerda', maoDireita: '🗡️ Mão Direita', armadura: '🛡️ Armadura' };
  const el = document.getElementById('seletorEquipTitulo');
  if (el) el.textContent = 'Escolher: ' + (titulos[slotNome] || slotNome);
  
  // Resetar filtros
  const search = document.getElementById('equipamentoSearch');
  const tipo = document.getElementById('equipamentoTipo');
  if (search) search.value = '';
  if (tipo) {
    if (slotNome === 'armadura') tipo.value = 'armadura';
    else tipo.value = 'arma';
  }
  
  filtrarEquipamentos();
  openModal('seletorEquipamentoModal');
}

function filtrarEquipamentos() {
  const search = document.getElementById('equipamentoSearch')?.value || '';
  const tipo = document.getElementById('equipamentoTipo')?.value || 'todos';
  const sheet = getSheet(currentSheetId);
  
  let items = TODOS_EQUIPAMENTOS.filter(i => {
    if (tipo !== 'todos' && i.tipo !== tipo) return false;
    if (search && !includesNormalized(i.nome, search) && !includesNormalized(i.aspectos, search)) return false;
    return true;
  });
  
  const grid = document.getElementById('equipamentoGrid');
  if (!grid) return;
  
  if (!items.length) {
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:24px;">Nenhum item encontrado.</p>';
    return;
  }
  
  grid.innerHTML = items.map(item => {
    const tipoCls = { arma: 'equip-tipo-arma', armadura: 'equip-tipo-armadura', escudo: 'equip-tipo-escudo' }[item.tipo] || '';
    let stats = '';
    if (item.tipo === 'arma') {
      const reqStr = item.requisitos ? Object.entries(item.requisitos).map(([k,v]) => `${k} ${v}`).join(', ') : '—';
      stats = `Dano: ${item.dado || '-'} ${item.tipoDano || ''} | Emp: ${item.empunhadura || '—'}<br>Alcance: ${item.alcance || 'Adj'} | Crítico: ${item.critico || '—'}<br>Req: ${reqStr} | ${item.preco}P`;
      if (item.aspectos) stats += `<br><em>${item.aspectos}</em>`;
    }
    if (item.tipo === 'armadura') stats = `RD: ${item.rd} | CA: ${item.ca} | RM: ${item.rm}<br>Penalidade: ${item.penalidade} | Peso: ${item.peso}kg<br>Preço: ${item.preco}P`;
    if (item.tipo === 'escudo')  stats = `Defesa: +${item.defesa} | Dur: ${item.durabilidade}<br>Penalidade: ${item.penalidade} | Peso: ${item.peso}kg<br>Preço: ${item.preco}P`;
    
    return `<div class="equipamento-card" onclick="equiparItem('${slotAtualSeletor}','${item.id}')">
      <div class="equip-card-nome">${escapeHtml(item.nome)}</div>
      <span class="equip-card-tipo ${tipoCls}">${item.tipo}</span>
      <div class="equip-card-stats">${stats}</div>
    </div>`;
  }).join('');
}

function equiparItem(slotNome, itemId) {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  sheet.equipamento = sheet.equipamento || { maoEsquerda: null, maoDireita: null, armadura: null };

  const novoItem = EQUIPAMENTOS_INDEX.get(itemId);
  if (!novoItem) return;

  // Two-handed check: empunhadura '2M' locks both hand slots
  const isTwoHanded = novoItem.tipo === 'arma' && novoItem.empunhadura === '2M';
  const isHandSlot = slotNome === 'maoEsquerda' || slotNome === 'maoDireita';

  // If a two-handed weapon is already occupying the other hand slot, block the equip
  if (isHandSlot && !isTwoHanded) {
    const otherSlot = slotNome === 'maoEsquerda' ? 'maoDireita' : 'maoEsquerda';
    const otherItem = sheet.equipamento[otherSlot] ? EQUIPAMENTOS_INDEX.get(sheet.equipamento[otherSlot]) : null;
    if (otherItem && otherItem.empunhadura === '2M') {
      toast('Remova a arma de duas mãos antes de equipar aqui.', 'error');
      return;
    }
  }

  // Se havia item anterior no slot, restitui o preço dele
  const itemAnteriorId = sheet.equipamento[slotNome];
  if (!sheet.carteira) sheet.carteira = { cobre:0, prata: sheet.moedas||0, ouro:0, platina:0 };
  if (itemAnteriorId && itemAnteriorId !== '__locked_2h__') {
    const itemAnterior = EQUIPAMENTOS_INDEX.get(itemAnteriorId);
    if (itemAnterior) { sheet.carteira.prata = (sheet.carteira.prata || 0) + (itemAnterior.preco || 0); sheet.moedas = sheet.carteira.prata; }
  }

  // Se arma de duas mãos: também remove item do outro slot de mão, restitui e trava
  if (isTwoHanded && isHandSlot) {
    const otherSlot = slotNome === 'maoEsquerda' ? 'maoDireita' : 'maoEsquerda';
    const otherItemId = sheet.equipamento[otherSlot];
    if (otherItemId && otherItemId !== '__locked_2h__') {
      const otherItem = EQUIPAMENTOS_INDEX.get(otherItemId);
      if (otherItem) { sheet.carteira.prata = (sheet.carteira.prata || 0) + (otherItem.preco || 0); sheet.moedas = sheet.carteira.prata; }
    }
    // Always lock the other slot when equipping 2H weapon in either hand
    sheet.equipamento[otherSlot] = '__locked_2h__';
  }

  // Deduz preço do novo item
  const preco = novoItem.preco || 0;
  if ((sheet.carteira.prata || 0) < preco) {
    toast(`Prata insuficiente! Faltam ${preco - (sheet.carteira.prata || 0)}P`, 'error');
    return;
  }
  sheet.carteira.prata = (sheet.carteira.prata || 0) - preco;
  sheet.moedas = sheet.carteira.prata;

  sheet.equipamento[slotNome] = itemId;

  // Atualiza UI de moedas
  renderCarteiraUI(sheet);

  renderSlots(sheet);
  atualizarCarga(sheet);
  debounceSave();
  closeModal('seletorEquipamentoModal');
  toast(`${novoItem.nome} equipado! −${preco}P`, 'success');
}

function removerEquipamento(slotNome) {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  sheet.equipamento = sheet.equipamento || {};

  // Restitui o preço do item removido
  const itemId = sheet.equipamento[slotNome];
  if (!sheet.carteira) sheet.carteira = { cobre:0, prata: sheet.moedas||0, ouro:0, platina:0 };
  if (itemId && itemId !== '__locked_2h__') {
    const item = EQUIPAMENTOS_INDEX.get(itemId);
    if (item && item.preco) {
      sheet.carteira.prata = (sheet.carteira.prata || 0) + item.preco;
      sheet.moedas = sheet.carteira.prata;
      renderCarteiraUI(sheet);
      toast(`${item.nome} removido. +${item.preco}P restituído.`, 'info');
      // If two-handed, also unlock the other slot
      if (item.empunhadura === '2M') {
        const otherSlot = slotNome === 'maoEsquerda' ? 'maoDireita' : 'maoEsquerda';
        if (sheet.equipamento[otherSlot] === '__locked_2h__') {
          sheet.equipamento[otherSlot] = null;
        }
      }
    }
  } else if (itemId === '__locked_2h__') {
    toast('Remova a arma de duas mãos do outro slot primeiro.', 'warn');
    return;
  }

  sheet.equipamento[slotNome] = null;
  renderSlots(sheet);
  atualizarCarga(sheet);
  debounceSave();
}


function renderSlots(sheet) {
  const equip = sheet.equipamento || {};
  const grips = sheet.empunhaduraAtiva || {}; // { maoEsquerda: '1M'|'2M', maoDireita: '1M'|'2M' }
  
  ['maoEsquerda', 'maoDireita', 'armadura'].forEach(slot => {
    const el = document.getElementById('slot-' + slot);
    if (!el) return;
    const itemId = equip[slot];
    if (!itemId) {
      el.innerHTML = '<span class="slot-vazio">Vazio</span>';
    } else if (itemId === '__locked_2h__') {
      el.innerHTML = '<span class="slot-vazio" style="color:var(--attr-warn);font-size:0.78rem;">🔒 Bloqueado (arma 2M)</span>';
    } else {
      const item = EQUIPAMENTOS_INDEX.get(itemId);
      if (item) {
        const isTwoHanded = item.empunhadura === '2M';
        const isDualGrip = item.empunhadura && item.empunhadura.includes('/');
        let gripHtml = '';
        if (isDualGrip && (slot === 'maoEsquerda' || slot === 'maoDireita')) {
          const grips_parts = item.empunhadura.split('/');
          const activeGrip = grips[slot] || grips_parts[0];
          gripHtml = `<div class="grip-toggle-row">${grips_parts.map(g => 
            `<button class="grip-btn${g === activeGrip ? ' active' : ''}" onclick="setGrip('${slot}','${g}')" title="Equipar em ${g}">${g}</button>`
          ).join('')}<span class="grip-active-label">${activeGrip === '2M' ? '⚔⚔ Duas mãos' : '⚔ Uma mão'}</span></div>`;
        }
        el.innerHTML = `
          <div class="item-slot-nome">${escapeHtml(item.nome)}${isTwoHanded ? ' <span style="font-size:0.68rem;color:var(--attr-warn);">⚔⚔ 2M</span>' : ''}</div>
          <div class="item-slot-peso">${item.peso}kg · ${item.preco}P</div>
          ${gripHtml}
          <button class="item-remover" onclick="removerEquipamento('${slot}')">✕ Remover</button>`;
      } else {
        el.innerHTML = '<span class="slot-vazio">Item não encontrado</span>';
      }
    }
  });
}

function setGrip(slot, grip) {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  if (!sheet.empunhaduraAtiva) sheet.empunhaduraAtiva = {};
  const itemId = sheet.equipamento?.[slot];
  if (!itemId) return;
  const item = EQUIPAMENTOS_INDEX.get(itemId);
  if (!item || !item.empunhadura.includes('/')) return;
  
  // If switching to 2M, lock the other hand
  const otherSlot = slot === 'maoEsquerda' ? 'maoDireita' : 'maoEsquerda';
  if (grip === '2M') {
    const otherItemId = sheet.equipamento[otherSlot];
    if (otherItemId && otherItemId !== '__locked_2h__') {
      const otherItem = EQUIPAMENTOS_INDEX.get(otherItemId);
      if (otherItem) { if (!sheet.carteira) sheet.carteira = {cobre:0,prata:sheet.moedas||0,ouro:0,platina:0}; sheet.carteira.prata = (sheet.carteira.prata||0) + (otherItem.preco||0); sheet.moedas = sheet.carteira.prata; }
    }
    sheet.equipamento[otherSlot] = '__locked_2h__';
  } else if (grip === '1M') {
    // Unlock if it was locked by this weapon
    if (sheet.equipamento[otherSlot] === '__locked_2h__') {
      sheet.equipamento[otherSlot] = null;
    }
  }
  sheet.empunhaduraAtiva[slot] = grip;
  renderSlots(sheet);
  renderCarteiraUI(sheet);
  debounceSave();
  toast(`${item.nome}: modo ${grip === '2M' ? 'duas mãos' : 'uma mão'}`, 'info');
}

// ---- INVENTÁRIO ----
function abrirAdicionarItem() {
  const nome = document.getElementById('itemNomeInput');
  const peso = document.getElementById('itemPesoInput');
  const qtd  = document.getElementById('itemQtdInput');
  if (nome) nome.value = '';
  if (peso) peso.value = '0.5';
  if (qtd)  qtd.value  = '1';
  openModal('adicionarItemModal');
  setTimeout(() => nome && nome.focus(), 100);
}

function confirmarAdicionarItem() {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  
  const nome = document.getElementById('itemNomeInput')?.value?.trim();
  const peso = parseFloat(document.getElementById('itemPesoInput')?.value) || 0;
  const qtd  = parseInt(document.getElementById('itemQtdInput')?.value) || 1;
  
  if (!nome) { toast('Digite o nome do item!', 'error'); return; }
  
  sheet.inventario = sheet.inventario || [];
  sheet.inventario.push({ id: 'item_' + generateId(), nome, peso, quantidade: qtd });
  
  renderInventario(sheet);
  atualizarCarga(sheet);
  debounceSave();
  closeModal('adicionarItemModal');
  toast(`${nome} adicionado ao inventário!`, 'success');
}

function ajustarQuantidade(itemId, delta) {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  const item = (sheet.inventario || []).find(i => i.id === itemId);
  if (!item) return;
  item.quantidade = Math.max(1, (item.quantidade || 1) + delta);
  renderInventario(sheet);
  atualizarCarga(sheet);
  debounceSave();
}

function removerItem(itemId) {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  sheet.inventario = (sheet.inventario || []).filter(i => i.id !== itemId);
  renderInventario(sheet);
  atualizarCarga(sheet);
  debounceSave();
}

function renderInventario(sheet) {
  const lista = document.getElementById('inventarioLista');
  if (!lista) return;
  const items = sheet.inventario || [];

  if (!items.length) {
    lista.innerHTML = '<div class="inventario-vazio">Inventário vazio. Adicione itens clicando em "+ Adicionar Item".</div>';
    return;
  }

  lista.innerHTML = items.map(item => {
    // FIX: fallback para campos legacy (name, id) e valor padrão legível
    const nome  = item.nome || item.name || item.id || 'Item sem nome';
    const peso  = item.peso    || 0;
    const qtd   = item.quantidade || 1;
    const total = (peso * qtd).toFixed(2);

    return `<div class="inventario-item">
      <div class="item-info">
        <span class="item-nome">${escapeHtml(nome)}</span>
        <span class="item-detalhes">${peso}kg × ${qtd} = ${total}kg total</span>
      </div>
      <div class="item-acoes">
        <button class="btn-qty" onclick="ajustarQuantidade('${item.id}',-1)" title="Diminuir">−</button>
        <span class="item-quantidade">${qtd}</span>
        <button class="btn-qty" onclick="ajustarQuantidade('${item.id}',1)" title="Aumentar">+</button>
        <button class="btn-qty danger" onclick="removerItem('${item.id}')" title="Remover">🗑️</button>
      </div>
    </div>`;
  }).join('');
}

// ---- RECOMPENSAS ----
function abrirAdicionarRecompensa() {
  const desc  = document.getElementById('recompDescInput');
  const valor = document.getElementById('recompValorInput');
  if (desc)  desc.value  = '';
  if (valor) valor.value = '100';
  openModal('adicionarRecompensaModal');
  setTimeout(() => desc && desc.focus(), 100);
}

function confirmarAdicionarRecompensa() {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  
  const desc  = document.getElementById('recompDescInput')?.value?.trim();
  const valor = parseInt(document.getElementById('recompValorInput')?.value) || 0;
  
  if (!desc) { toast('Digite a descrição da recompensa!', 'error'); return; }
  
  sheet.recompensas = sheet.recompensas || [];
  sheet.recompensas.unshift({ id: 'rew_' + generateId(), descricao: desc, valor, data: Date.now() });
  
  renderRecompensas(sheet);
  
  // Adicionar o valor nas moedas (prata)
  if (!sheet.carteira) sheet.carteira = { cobre:0, prata: sheet.moedas||0, ouro:0, platina:0 };
  sheet.carteira.prata = (sheet.carteira.prata || 0) + valor;
  sheet.moedas = sheet.carteira.prata;
  renderCarteiraUI(sheet);
  
  debounceSave();
  closeModal('adicionarRecompensaModal');
  toast(`+${valor}P registrado!`, 'success');
}

function removerRecompensa(rewId) {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  sheet.recompensas = (sheet.recompensas || []).filter(r => r.id !== rewId);
  renderRecompensas(sheet);
  debounceSave();
}

function renderRecompensas(sheet) {
  const lista = document.getElementById('recompensasLista');
  if (!lista) return;
  const rews = sheet.recompensas || [];

  if (!rews.length) {
    lista.innerHTML = '<div class="recompensas-vazio">Nenhuma transação registrada.</div>';
    return;
  }

  lista.innerHTML = rews.map(r => {
    const positivo = (r.valor || 0) >= 0;
    const sinal = positivo ? '+' : '';
    const cls = positivo ? 'pos' : 'neg';
    return `<div class="transacao-item">
      <span class="transacao-sinal ${cls}">${positivo ? '↑' : '↓'}</span>
      <div class="transacao-info">
        <div class="transacao-desc">${escapeHtml(r.descricao)}</div>
        <div class="transacao-data">${formatDate(r.data)}</div>
      </div>
      <span class="transacao-valor ${cls}">${sinal}${r.valor}P</span>
      <button class="recompensa-remover" onclick="removerRecompensa('${r.id}')" title="Remover">✕</button>
    </div>`;
  }).join('');
}

/** Tab ativa no momento (persiste entre fichas) */
let _equipTabActive = 'equipado';

function _equipSectionBlock(parentEl, childEl) {
  if (!childEl || !parentEl) return null;
  let node = childEl;
  while (node && node.parentElement !== parentEl) {
    node = node.parentElement;
    if (!node || node === document.body) return null;
  }
  return node !== parentEl ? node : null;
}

function _getEquipEditorSection() {
  const anchors = ['lojaGrid', 'inventarioLista', 'slot-maoEsquerda'];
  for (const id of anchors) {
    let el = document.getElementById(id);
    if (!el) continue;
    while (el && !el.classList.contains('editor-section')) el = el.parentElement;
    if (el) return el;
  }
  return null;
}

function _setupEquipTabs() {
  if (document.getElementById('equip-tab-bar')) {
    switchEquipTab(_equipTabActive);
    return;
  }

  const section = _getEquipEditorSection();
  if (!section) return;

  const title = section.querySelector('.section-title');
  if (!title) return;

  const blk = (id) => _equipSectionBlock(section, document.getElementById(id));

  const equipIds  = ['slot-maoEsquerda', 'slot-maoDireita', 'slot-armadura',
                     'cargaFill', 'carteiraCobre', 'carteiraPrata',
                     'carteiraOuro', 'carteiraPlatina', 'moedasInput', 'moedasInicial'];
  const invIds    = ['inventarioLista', 'recompensasLista'];
  const lojaIds   = ['lojaGrid', 'lojaSearch'];

  const resolve = (ids) => [...new Set(ids.map(blk).filter(Boolean))];
  const equipBlocks = resolve(equipIds);
  const invBlocks   = resolve(invIds);
  const lojaBlocks  = resolve(lojaIds);

  const allBlocks = new Set([...equipBlocks, ...invBlocks, ...lojaBlocks]);
  if (allBlocks.size < 2) {
    console.warn('[Verloren] _setupEquipTabs: não foi possível identificar seções separadas.');
    return;
  }

  const tagged = new Set();
  const tag = (blocks, panel) => {
    blocks.forEach(b => {
      if (!b || tagged.has(b)) return;
      b.dataset.equipPanel = panel;
      tagged.add(b);
    });
  };
  tag(equipBlocks, 'equipado');
  tag(invBlocks,   'inventario');
  tag(lojaBlocks,  'loja');

  const bar = document.createElement('div');
  bar.id = 'equip-tab-bar';
  bar.className = 'equip-tab-bar';
  bar.innerHTML = `
    <button class="equip-tab" data-equip-tab="equipado"   onclick="switchEquipTab('equipado')">⚔️ Equipado</button>
    <button class="equip-tab" data-equip-tab="inventario" onclick="switchEquipTab('inventario')">🎒 Inventário</button>
    <button class="equip-tab" data-equip-tab="loja"       onclick="switchEquipTab('loja')">🛒 Loja</button>
  `;
  title.insertAdjacentElement('afterend', bar);

  switchEquipTab(_equipTabActive);
}

function switchEquipTab(tab) {
  _equipTabActive = tab;

  document.querySelectorAll('#equip-tab-bar .equip-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.equipTab === tab);
  });

  const section = _getEquipEditorSection();
  if (!section) return;

  // Mostra/oculta painéis taggeados
  section.querySelectorAll('[data-equip-panel]').forEach(panel => {
    const visible = panel.dataset.equipPanel === tab;
    if (visible && panel.style.display === 'none') {
      panel.style.display = '';
      panel.style.animation = 'none';
      void panel.offsetWidth;
      panel.style.animation = '';
    } else if (!visible) {
      panel.style.display = 'none';
    }
  });

  // Fallback: garante que lojaGrid e seu bloco-pai ficam visíveis/ocultos
  // mesmo quando o tag não foi aplicado corretamente pelo _setupEquipTabs
  const lojaEl = document.getElementById('lojaGrid');
  const lojaSearchEl = document.getElementById('lojaSearch');
  if (lojaEl) {
    // Sobe até o bloco-pai dentro da section
    let lojaBlock = lojaEl;
    while (lojaBlock && lojaBlock.parentElement !== section) {
      lojaBlock = lojaBlock.parentElement;
      if (!lojaBlock || lojaBlock === document.body) { lojaBlock = null; break; }
    }
    if (lojaBlock && !lojaBlock.dataset.equipPanel) {
      // Bloco não foi taggeado — taga agora e aplica visibilidade
      lojaBlock.dataset.equipPanel = 'loja';
      lojaBlock.style.display = tab === 'loja' ? '' : 'none';
    }
    // Se o lojaGrid está dentro de um painel já taggeado, só garante display correto
    if (!lojaBlock) {
      lojaEl.style.display = tab === 'loja' ? '' : 'none';
      if (lojaSearchEl) lojaSearchEl.style.display = tab === 'loja' ? '' : 'none';
    }
  }
}

function renderEconomia(sheet) {
  // Initialize carteira if not exists (migrate from moedas)
  if (!sheet.carteira) {
    sheet.carteira = { cobre: 0, prata: sheet.moedas || 0, ouro: 0, platina: 0 };
  }

  // Moedas
  const moedasInicial = calcMoedasIniciais(sheet.nivel);
  const inicialEl = document.getElementById('moedasInicial');
  if (inicialEl) inicialEl.textContent = moedasInicial;

  // Render wallet UI
  renderCarteiraUI(sheet);

  // Slots
  renderSlots(sheet);

  // Inventário
  renderInventario(sheet);

  // Recompensas
  renderRecompensas(sheet);

  // Carga
  atualizarCarga(sheet);

  // Loja
  renderLoja();

  // Injeta subtabs (idempotente — safe chamar toda vez)
  _setupEquipTabs();
}


/* ============================================================
   FASE 4 — MOTOR DE ATRIBUTOS v2 (fórmulas oficiais)
   ──────────────────────────────────────────────────
   REGRA GLOBAL:
     safe(x) = Math.max(0, x)   → potências, ln, termos positivos
     pen(x)  = Math.min(0, x)   → penalidades
============================================================ */

// Helpers globais
const _safe = x => Math.max(0, x);
const _pen  = x => Math.min(0, x);
const _fl   = x => Math.floor(x);
const _ln   = x => Math.log(Math.max(0, x));   // ln seguro

/**
 * Retorna valor numérico de um atributo com regras Aika/Ukya + racial.
 * Trata -Infinity como -3.
 */
function evSheet(sheet, attr) {
  const v = getAtributoEfetivo(sheet, attr);
  return v === -Infinity ? -3 : (v || 0);
}

/* ── RECURSOS ─────────────────────────────────────────────── */

/**
 * HP — Vida
 * HP = 30
 *    + 0.7·safe(VIDA)² + 2·safe(VIDA) + 4·pen(VIDA)
 *    + 0.5·safe(CON)²  + 2·safe(CON)  + 3·pen(CON)
 *    + (LV-1)·(2·safe(CON) + safe(VIDA))
 */
function _getVerlorenHelpers() {
  return {
    resolveAttribute: getAtributoEfetivo,
    equipmentIndex: typeof EQUIPAMENTOS_INDEX === 'undefined' ? null : EQUIPAMENTOS_INDEX,
  };
}

function _getRaceLuckBonus(sheet) {
  if (!sheet || !sheet.raceSelecionada || typeof RACES_DB === 'undefined') return 0;
  const race = RACES_DB.find(function (item) { return item.name === sheet.raceSelecionada; });
  return race && race.atributos && race.atributos.LK ? race.atributos.LK : 0;
}

function _getDerivedVerloren(sheet) {
  const derived = window.CompanionSystems.Verloren.calculateDerived(sheet, _getVerlorenHelpers());
  return { ...derived, LK: derived.LK + _getRaceLuckBonus(sheet) };
}

function _buildLegacySubatributos(sheet, derived) {
  return {
    VIDA: derived.HP,
    DEF: derived.DEF_TOTAL,
    ATQ: derived.ATK_TOTAL,
    RESM: derived.MR_TOTAL,
    INIC: evSheet(sheet, 'PER') + evSheet(sheet, 'AGI'),
    MOV: derived.MV,
    CONC: _fl((evSheet(sheet, 'INT') + evSheet(sheet, 'VON')) / 2),
    PERCEP: derived.PER_TESTE,
    FURT: _fl((evSheet(sheet, 'AGI') + evSheet(sheet, 'DES')) / 2),
    SOCIAL: _fl((evSheet(sheet, 'CAR') + evSheet(sheet, 'INT')) / 2),
    HP: derived.HP,
    SP: derived.SP,
    MP: derived.MP,
    SAN: derived.SAN,
    EV: derived.EV,
    BLK: derived.BLK,
    PWR: derived.PWR,
    WIL: derived.WIL,
    PER_TESTE: derived.PER_TESTE,
    LK: derived.LK,
  };
}

function calcHP(sheet) {
  return window.CompanionSystems.Verloren.calcHP(sheet, _getVerlorenHelpers());
}

/**
 * SP — Estamina
 * SP = 20
 *    + 0.5·safe(CON)² + 2·safe(CON) + 3·pen(CON)
 *    + AGI
 *    + (LV-1)·(safe(CON) + AGI)
 */
function calcSP(sheet) {
  return window.CompanionSystems.Verloren.calcSP(sheet, _getVerlorenHelpers());
}

/**
 * MP — Mana
 * MP = 20
 *    + 0.6·safe(MAG)² + 2·safe(MAG) + 3·pen(MAG)
 *    + 0.4·safe(INT)² + 2·safe(INT) + 2·pen(INT)
 *    + (LV-1)·(safe(MAG) + safe(INT))
 */
function calcMP(sheet) {
  return window.CompanionSystems.Verloren.calcMP(sheet, _getVerlorenHelpers());
}

/**
 * SAN — Sanidade
 * SAN = 25
 *     + 0.8·safe(VON)² + 2·safe(VON) + 3·pen(VON)
 *     + SAB
 *     + (LV-1)·safe(VON)
 */
function calcSAN(sheet) {
  return window.CompanionSystems.Verloren.calcSAN(sheet, _getVerlorenHelpers());
}

/* ── MOBILIDADE & DEFESA ─────────────────────────────────── */

/**
 * MV — Movimento
 * MV = 4 + AGI + floor(3·ln(safe(AGI)+1)/ln(11)) + LV/6
 */
function calcMV(sheet) {
  return window.CompanionSystems.Verloren.calcMV(sheet, _getVerlorenHelpers());
}

/**
 * EV — Esquiva
 * EV = DES + floor(4·ln(safe(AGI)+1)/ln(11)) + LV/6
 */
function calcEV(sheet) {
  return window.CompanionSystems.Verloren.calcEV(sheet, _getVerlorenHelpers());
}

/**
 * BLK — Bloqueio
 * BLK = floor((FOR + DES) / 10)
 */
function calcBLK(sheet) {
  return window.CompanionSystems.Verloren.calcBLK(sheet, _getVerlorenHelpers());
}

/**
 * DEF_TOTAL — Defesa total
 * DEF_TOTAL = DEF + floor((safe(CON)+safe(FOR))/6) + equip
 */
function calcDEF_TOTAL(sheet) {
  return window.CompanionSystems.Verloren.calcDEF_TOTAL(sheet, _getVerlorenHelpers());
}

/**
 * MR_TOTAL — Resistência mágica total
 * MR_TOTAL = RESM + floor((safe(VON)+safe(CON))/6) + equip
 */
function calcMR_TOTAL(sheet) {
  return window.CompanionSystems.Verloren.calcMR_TOTAL(sheet, _getVerlorenHelpers());
}

/* ── COMBATE ─────────────────────────────────────────────── */

/**
 * ATK_TOTAL — Ataque total
 * ATK = ATQ + w·floor(5·ln(safe((1-p)·DES + p·FOR) + 1) / ln(11))
 */
function calcATK_TOTAL(sheet) {
  return window.CompanionSystems.Verloren.calcATK_TOTAL(sheet, _getVerlorenHelpers());
}

/**
 * PWR — Poder mágico
 * PWR = MAG + floor(5·ln(safe(MAG+INT)+1)/ln(11))
 */
function calcPWR(sheet) {
  return window.CompanionSystems.Verloren.calcPWR(sheet, _getVerlorenHelpers());
}

/* ── TESTES ──────────────────────────────────────────────── */

/**
 * WIL — Vontade (testes)
 * WIL = VON + floor(3·ln(safe(VON+CON)+1)/ln(11)) + LV/6
 */
function calcWIL(sheet) {
  return window.CompanionSystems.Verloren.calcWIL(sheet, _getVerlorenHelpers());
}

/**
 * PER_TESTE — Percepção (testes)
 * PER_TESTE = PER + floor(3·ln(safe(SAB+AGI)+1)/ln(11))
 */
function calcPER_TESTE(sheet) {
  return window.CompanionSystems.Verloren.calcPER_TESTE(sheet, _getVerlorenHelpers());
}

/**
 * LK — Sorte
 * LK = 10 + CAR + floor(SAB/2)
 */
function calcLK(sheet) {
  return window.CompanionSystems.Verloren.calcLK(sheet, _getVerlorenHelpers()) + _getRaceLuckBonus(sheet);
}

/* ── HELPERS DE EQUIPAMENTO ─────────────────────────────── */
function _getEquipBonus(sheet, campo) {
  return window.CompanionSystems.Verloren.getEquipBonus(sheet, campo, _getVerlorenHelpers());
}
function _getWeaponFactors(sheet) {
  return window.CompanionSystems.Verloren.getWeaponFactors(sheet, _getVerlorenHelpers());
}

/* ── AGREGADOR PRINCIPAL ─────────────────────────────────── */

/** Calcula todos os derivados de uma vez e retorna o objeto. */
function calcularTodosDerivados(sheet) {
  return _getDerivedVerloren(sheet);
}

/** Compat: calcularSubatributos agora delega ao motor novo */
function calcularSubatributos(sheet) {
  return _buildLegacySubatributos(sheet, calcularTodosDerivados(sheet));
}

/** Compat: calcRecursos agora usa o motor novo */
function calcRecursos(sheet) {
  const d = _getDerivedVerloren(sheet);
  return {
    HP: d.HP,
    MP: d.MP,
    SP: d.SP,
    SAN: d.SAN,
  };
}

/* ── METADATA DOS DERIVADOS ─────────────────────────────── */
const SUBATTR_META = {
  // Recursos (mostrados como barras visuais)
  HP:        { label:'HP',          formula:'30+0.7·safe(VIDA)²+0.5·safe(CON)²+…',         desc:'Vida máxima',             cor:'#e05070' },
  MP:        { label:'MP',          formula:'20+0.6·safe(MAG)²+0.4·safe(INT)²+…',           desc:'Mana máxima',             cor:'#8060c8' },
  SP:        { label:'SP',          formula:'20+0.5·safe(CON)²+2·safe(CON)+AGI+…',          desc:'Estamina máxima',         cor:'#40a870' },
  SAN:       { label:'SAN',         formula:'25+0.8·safe(VON)²+SAB+…',                       desc:'Sanidade máxima',         cor:'#5090d0' },
  // Mobilidade & Defesa
  MV:        { label:'MV',          formula:'4+AGI+⌊3·ln(safe(AGI)+1)/ln(11)⌋+LV/6',       desc:'Movimento (metros/turno)',cor:'#c0a040' },
  EV:        { label:'EV',          formula:'DES+⌊4·ln(safe(AGI)+1)/ln(11)⌋+LV/6',          desc:'Esquiva',                 cor:'#50b8a0' },
  BLK:       { label:'BLK',         formula:'⌊(FOR+DES)/10⌋',                                desc:'Bloqueio',                cor:'#8090a0' },
  DEF_TOTAL: { label:'DEF Total',   formula:'DEF+⌊(safe(CON)+safe(FOR))/6⌋+equip',          desc:'Defesa total c/ equip',   cor:'#7060a0' },
  MR_TOTAL:  { label:'MR Total',    formula:'RESM+⌊(safe(VON)+safe(CON))/6⌋+equip',         desc:'Resist. mágica total',    cor:'#9050c0' },
  // Combate
  ATK_TOTAL: { label:'ATK Total',   formula:'ATQ+w·⌊5·ln(safe((1-p)·DES+p·FOR)+1)/ln(11)⌋',desc:'Ataque total c/ arma',    cor:'#d06040' },
  PWR:       { label:'PWR',         formula:'MAG+⌊5·ln(safe(MAG+INT)+1)/ln(11)⌋',           desc:'Poder mágico',            cor:'#c070e0' },
  // Testes
  WIL:       { label:'WIL',         formula:'VON+⌊3·ln(safe(VON+CON)+1)/ln(11)⌋+LV/6',     desc:'Testes de Vontade',       cor:'#a08040' },
  PER_TESTE: { label:'PER Teste',   formula:'PER+⌊3·ln(safe(SAB+AGI)+1)/ln(11)⌋',           desc:'Percepção (testes)',       cor:'#6090a0' },
  LK:        { label:'LK',          formula:'10+CAR+⌊SAB/2⌋',                                desc:'Sorte',                   cor:'#50b040' },
};

/* ── BARRAS DE RECURSOS ─────────────────────────────────── */

const _RES_META = {
  HP:  { icon:'❤',  label:'HP',  sub:'Vida',     cor:'#e05070', grad:'linear-gradient(90deg,#c03050,#e05070)', gradLow:'linear-gradient(90deg,#801530,#c03050)', danger:0.25, crit:0.10 },
  MP:  { icon:'💜', label:'MP',  sub:'Mana',     cor:'#8060c8', grad:'linear-gradient(90deg,#5040a0,#8060c8)', gradLow:'linear-gradient(90deg,#302070,#5040a0)', danger:0.20, crit:0.05 },
  SP:  { icon:'💚', label:'SP',  sub:'Estamina', cor:'#40a870', grad:'linear-gradient(90deg,#208050,#40a870)', gradLow:'linear-gradient(90deg,#104030,#208050)', danger:0.30, crit:0.15 },
  SAN: { icon:'🔵', label:'SAN', sub:'Sanidade', cor:'#5090d0', grad:'linear-gradient(90deg,#3060a0,#5090d0)', gradLow:'linear-gradient(90deg,#203060,#3060a0)', danger:0.35, crit:0.20 },
};

/**
 * Garante que sheet._recAtual existe e está clampado ao máximo atual.
 */
function _migrarRecAtual(sheet) {
  const rec = calcRecursos(sheet);
  if (!sheet._recAtual) {
    sheet._recAtual = { HP: rec.HP, MP: rec.MP, SP: rec.SP, SAN: rec.SAN };
  } else {
    ['HP','MP','SP','SAN'].forEach(k => {
      if (sheet._recAtual[k] === undefined || sheet._recAtual[k] === null)
        sheet._recAtual[k] = rec[k];
      else
        sheet._recAtual[k] = Math.min(sheet._recAtual[k], rec[k]);
    });
  }
}

/** Renderiza o painel completo de barras de recursos. */
function renderBarrasRecursos(sheet) {
  const wrap = document.getElementById('recursosBarrasWrap');
  if (!wrap) return;
  _migrarRecAtual(sheet);
  const rec = calcRecursos(sheet);
  wrap.innerHTML = Object.entries(_RES_META).map(([id, m]) => {
    const max = rec[id];
    const cur = Math.max(0, Math.min(max, sheet._recAtual[id] ?? max));
    return _buildResBar(id, m, cur, max);
  }).join('');
}

function _buildResBar(id, m, cur, max) {
  const pct      = max > 0 ? Math.round((cur/max)*100) : 0;
  const isDanger = pct <= m.danger*100;
  const isCrit   = pct <= m.crit*100;
  const grad     = isDanger ? m.gradLow : m.grad;
  const cls      = isCrit ? 'res-critical' : isDanger ? 'res-danger' : '';
  return `<div class="res-bar-wrap ${cls}" id="reswrap-${id}">
    <div class="res-bar-header">
      <div class="res-bar-label-wrap">
        <span class="res-bar-icon">${m.icon}</span>
        <span class="res-bar-name">${m.label}</span>
        <span class="res-bar-sub">${m.sub}</span>
      </div>
      <div class="res-bar-vals">
        <span class="res-bar-cur" id="rescur-${id}">${cur}</span>
        <span class="res-bar-sep">/</span>
        <span class="res-bar-max" id="resmax-${id}">${max}</span>
      </div>
    </div>
    <div class="res-bar-track">
      <div class="res-bar-fill" id="resfill-${id}"
        style="width:${pct}%;background:${grad};"
        role="progressbar" aria-valuenow="${cur}" aria-valuemin="0" aria-valuemax="${max}">
      </div>
      <div class="res-bar-shimmer"></div>
    </div>
    <div class="res-bar-pct" id="respct-${id}">${pct}%</div>
    <div class="res-bar-btns">
      ${[-10,-1,1,10].map(d =>
        `<button class="res-btn ${d>0?'res-btn-plus':'res-btn-minus'}"
          onclick="ajustarRecurso('${id}',${d})"
          style="border-color:${m.cor}44;color:${m.cor}">${d>0?'+':''}${d}</button>`
      ).join('')}
      <button class="res-btn res-btn-max"
        onclick="restaurarRecurso('${id}')"
        style="border-color:${m.cor}33;color:${m.cor}88">MAX</button>
    </div>
  </div>`;
}

function _atualizarBarraUnica(sheet, id) {
  const m   = _RES_META[id];
  if (!m) return;
  const rec = calcRecursos(sheet);
  const max = rec[id];
  sheet._recAtual[id] = Math.max(0, Math.min(max, sheet._recAtual[id] ?? max));
  const cur = sheet._recAtual[id];
  const pct = max > 0 ? Math.round((cur/max)*100) : 0;
  const isDanger = pct <= m.danger*100;
  const isCrit   = pct <= m.crit*100;
  const grad     = isDanger ? m.gradLow : m.grad;

  const fill = document.getElementById(`resfill-${id}`);
  const curEl= document.getElementById(`rescur-${id}`);
  const maxEl= document.getElementById(`resmax-${id}`);
  const pctEl= document.getElementById(`respct-${id}`);
  const wrap = document.getElementById(`reswrap-${id}`);

  if (fill) { fill.style.width = `${pct}%`; fill.style.background = grad;
    fill.setAttribute('aria-valuenow', cur); fill.setAttribute('aria-valuemax', max); }
  if (curEl) curEl.textContent = cur;
  if (maxEl) maxEl.textContent = max;
  if (pctEl) pctEl.textContent = `${pct}%`;
  if (wrap)  {
    wrap.classList.toggle('res-danger',   isDanger && !isCrit);
    wrap.classList.toggle('res-critical', isCrit);
  }
}

function _atualizarTodasBarras(sheet) {
  Object.keys(_RES_META).forEach(id => _atualizarBarraUnica(sheet, id));
}

/** Chamado pelos botões +/− das barras */
function ajustarRecurso(id, delta) {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  _migrarRecAtual(sheet);
  const rec = calcRecursos(sheet);
  sheet._recAtual[id] = Math.max(0, Math.min(rec[id], (sheet._recAtual[id]??rec[id]) + delta));
  _atualizarBarraUnica(sheet, id);
  debounceSave();
}

/** Restaura recurso ao máximo */
function restaurarRecurso(id) {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  _migrarRecAtual(sheet);
  sheet._recAtual[id] = calcRecursos(sheet)[id];
  _atualizarBarraUnica(sheet, id);
  debounceSave();
}

/* ── RENDER / ATUALIZAÇÃO DOS DERIVADOS ─────────────────── */

const _DERIVADOS_GRUPOS = [
  { label:'🏃 Mobilidade & Defesa', keys:['MV','EV','BLK','DEF_TOTAL','MR_TOTAL'] },
  { label:'⚔ Combate',             keys:['ATK_TOTAL','PWR'] },
  { label:'🧠 Testes & Social',    keys:['WIL','PER_TESTE','LK'] },
];

function renderSubatributos(sheet) {
  // Barras de recursos
  renderBarrasRecursos(sheet);

  // Grid de derivados (exceto recursos — esses ficam nas barras)
  const grid = document.getElementById('subatributosGrid');
  if (!grid) return;

  const d = calcularTodosDerivados(sheet);
  let html = '';

  _DERIVADOS_GRUPOS.forEach(g => {
    html += `<div class="derivados-grupo-lbl">${g.label}</div>
      <div class="derivados-grupo-items">`;
    g.keys.forEach(key => {
      const meta = SUBATTR_META[key];
      if (!meta) return;
      const val  = d[key] ?? 0;
      const sign = (val >= 0 && !['MV','LK'].includes(key)) ? '+' : '';
      // Fórmula e descrição agora ficam no tooltip (title) — cards compactos
      const tooltip = `${meta.formula} — ${meta.desc}`;
      html += `<div class="subattr-card" title="${escapeHtml(tooltip)}">
        <div class="subattr-sigla" style="color:${meta.cor}">${meta.label}</div>
        <div class="subattr-valor" id="sub-${key.toLowerCase()}" style="color:${meta.cor}">${sign}${val}</div>
      </div>`;
    });
    html += '</div>';
  });

  grid.innerHTML = html;
}

function atualizarSubatributos(sheet) {
  const d = calcularTodosDerivados(sheet);

  // Atualiza derivados no grid
  Object.entries(d).forEach(([key, val]) => {
    const el = document.getElementById('sub-' + key.toLowerCase());
    if (!el) return;
    const sign = (val >= 0 && !['MV','LK','HP','MP','SP','SAN'].includes(key)) ? '+' : '';
    const txt  = `${sign}${val}`;
    if (el.textContent !== txt) {
      el.textContent = txt;
      el.classList.remove('changed');
      void el.offsetWidth;
      el.classList.add('changed');
    }
  });

  // Atualiza barras de recursos
  _migrarRecAtual(sheet);
  _atualizarTodasBarras(sheet);

  // Radar e carga
  renderRadarChart(sheet);
  atualizarCarga(sheet);
}

/* ── CSS DAS BARRAS (injetado uma vez) ─────────────────── */
(function _injetarCSSBarras() {
  if (document.getElementById('_res-bars-style')) return;
  const s = document.createElement('style');
  s.id = '_res-bars-style';
  s.textContent = `
/* ─── BARRAS DE RECURSOS ─────────────────────────── */
#recursosBarrasWrap{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
@media(max-width:480px){#recursosBarrasWrap{grid-template-columns:1fr;}}
.res-bar-wrap{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);padding:12px 14px;transition:border-color var(--transition),box-shadow var(--transition);}
.res-bar-wrap.res-danger{border-color:rgba(200,100,60,.5);box-shadow:0 0 10px rgba(200,100,60,.1);}
.res-bar-wrap.res-critical{border-color:rgba(200,50,50,.7);animation:_pulse-crit 2s ease-in-out infinite;}
@keyframes _pulse-crit{0%,100%{box-shadow:0 0 10px rgba(200,50,50,.15);}50%{box-shadow:0 0 22px rgba(200,50,50,.35);}}
.res-bar-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:7px;}
.res-bar-label-wrap{display:flex;align-items:center;gap:4px;}
.res-bar-icon{font-size:.9rem;}
.res-bar-name{font-weight:800;font-size:.82rem;color:var(--text-primary);}
.res-bar-sub{font-size:.6rem;color:var(--text-muted);font-style:italic;}
.res-bar-vals{display:flex;align-items:baseline;gap:2px;}
.res-bar-cur{font-family:'Playfair Display',serif;font-size:1.2rem;font-weight:700;color:var(--text-primary);transition:color .3s;}
.res-bar-sep{font-size:.78rem;color:var(--text-muted);}
.res-bar-max{font-size:.78rem;color:var(--text-secondary);}
.res-bar-track{height:9px;background:var(--bg-secondary);border-radius:5px;overflow:hidden;position:relative;margin-bottom:3px;box-shadow:inset 0 1px 3px rgba(0,0,0,.1);}
.res-bar-fill{height:100%;border-radius:5px;transition:width .4s cubic-bezier(.4,0,.2,1),background .35s;position:relative;}
.res-bar-shimmer{position:absolute;inset:0;background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,.13) 50%,transparent 100%);background-size:200% 100%;animation:_shimmer 2.6s ease-in-out infinite;pointer-events:none;}
@keyframes _shimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}
.res-bar-pct{font-size:.58rem;color:var(--text-muted);text-align:right;margin-bottom:7px;}
.res-bar-btns{display:flex;gap:4px;}
.res-btn{flex:1;padding:4px 0;background:var(--bg-secondary);border:1px solid transparent;border-radius:5px;font-size:.68rem;font-weight:700;font-family:'Courier New',monospace;cursor:pointer;transition:background var(--transition),transform .1s;}
.res-btn:hover{background:var(--bg-card-hover);transform:translateY(-1px);}
.res-btn:active{transform:scale(.94);}
.res-btn-max{flex:.7;font-size:.58rem;}
/* ─── DERIVADOS GRUPOS ───────────────────────────── */
.derivados-grupo-lbl{font-size:.64rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--text-muted);margin:14px 0 6px 2px;}
.derivados-grupo-items{display:grid;grid-template-columns:repeat(auto-fill,minmax(68px,1fr));gap:5px;margin-bottom:2px;}
.subattr-card{padding:5px 7px;min-height:0;gap:0;cursor:help;border-radius:var(--radius-sm);transition:box-shadow var(--transition),background var(--transition);}
.subattr-card:hover{box-shadow:var(--shadow-md);background:var(--bg-card-hover);}
.subattr-sigla{font-size:.58rem;letter-spacing:.02em;text-transform:uppercase;opacity:.85;}
.subattr-valor{font-size:1.05rem;font-weight:700;line-height:1.1;transition:transform .15s ease;}
.subattr-formula,.subattr-desc{display:none;}
@keyframes _subattr-pop{0%{transform:scale(1.25);}100%{transform:scale(1);}}
.subattr-valor.changed{animation:_subattr-pop .25s ease;}`;
  document.head.appendChild(s);
})();

/* ============================================================
   FASE 5 — GRÁFICO RADIAL
============================================================ */

let radarChartInstance = null;

function calcularCategorias(sheet) {
  const subs = calcularSubatributos(sheet);
  const modos = sheet.modos || {};
  const ev = (attr) => {
    const v = getAtributoEfetivo(sheet, attr);
    return v === -Infinity ? -10 : (v || 0);
  };
  
  // Normalizar para escala 0-10
  const norm = (v, min, max) => Math.max(0, Math.min(10, ((v - min) / (max - min)) * 10));
  const d = calcularTodosDerivados(sheet);
  const resistencia = norm(
  (norm(d.HP,        8,  750) * 4) +
  (norm(d.DEF_TOTAL, -4,  20) * 4) +
  (norm(d.MR_TOTAL,  -5,  25) * 2),
  0, 100  // corrigido
);
  const agressividade = norm(
  (norm(d.ATK_TOTAL, 0, 12) * 6) +
  (norm(ev('FOR'),  -3, 13) * 4),
  0, 100
);
  const magia = norm(d.PWR, -3, 19);
  const estrategia    = norm((ev('INT') + ev('SAB') + ev('PER')) / 3, -3, 5);
  const valores = [modos.Bruto||1, modos.Ágil||1, modos.Preciso||1, modos.Intuitivo||1];
  const media = valores.reduce((a,b) => a+b, 0) / 4;
  const desvio = Math.sqrt(valores.reduce((a,b) => a + Math.pow(b - media, 2), 0) / 4);
  const versatilidade = norm(desvio, 2, 0); // desvio alto = especialista = baixo; desvio baixo = versátil = alto
  
  return {
    resistencia:   parseFloat(resistencia.toFixed(1)),
    agressividade: parseFloat(agressividade.toFixed(1)),
    magia:         parseFloat(magia.toFixed(1)),
    estrategia:    parseFloat(estrategia.toFixed(1)),
    versatilidade: parseFloat(versatilidade.toFixed(1))
  };
}

function renderRadarChart(sheet) {
  const canvas = document.getElementById('radarChart');
  if (!canvas || !canvas.getContext) return;

  if (!radarChartInstance || radarChartInstance.canvas !== canvas) {
    destruirRadarChart();
    radarChartInstance = {
      canvas,
      resizeHandler: throttle(function() {
        const activeSheet = getSheet(currentSheetId) || sheet;
        if (activeSheet) renderRadarChart(activeSheet);
      }, 120)
    };
    window.addEventListener('resize', radarChartInstance.resizeHandler);
  }

  const labels = ['Resistencia', 'Agressividade', 'Magia', 'Estrategia', 'Versatilidade'];
  const values = Object.values(calcularCategorias(sheet));
  const palette = getDarkModeState()
    ? {
        text: 'rgba(232,224,248,0.88)',
        muted: 'rgba(200,188,236,0.56)',
        grid: 'rgba(88,74,140,0.52)',
        fill: 'rgba(136,110,240,0.2)',
        border: 'rgba(180,148,255,0.94)',
        point: 'rgba(220,196,255,1)',
        ring: 'rgba(24,18,42,0.34)'
      }
    : {
        text: 'rgba(61,52,82,0.9)',
        muted: 'rgba(92,82,118,0.46)',
        grid: 'rgba(189,176,221,0.82)',
        fill: 'rgba(181,150,234,0.22)',
        border: 'rgba(140,96,184,0.96)',
        point: 'rgba(123,78,168,1)',
        ring: 'rgba(255,255,255,0.56)'
      };

  const dpr = window.devicePixelRatio || 1;
  const wrapperWidth = canvas.parentElement ? canvas.parentElement.clientWidth : 320;
  const size = Math.max(260, Math.min(wrapperWidth, 420));
  canvas.width = Math.round(size * dpr);
  canvas.height = Math.round(size * dpr);
  canvas.style.width = '100%';
  canvas.style.height = size + 'px';

  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, size, size);

  const center = size / 2;
  const radius = size * 0.28;
  const maxValue = 10;

  ctx.save();
  ctx.translate(center, center);

  for (let ring = 5; ring >= 1; ring--) {
    const currentRadius = radius * (ring / 5);
    ctx.beginPath();
    labels.forEach(function(_, index) {
      const angle = (-Math.PI / 2) + (Math.PI * 2 * index / labels.length);
      const x = Math.cos(angle) * currentRadius;
      const y = Math.sin(angle) * currentRadius;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = ring % 2 === 0 ? palette.ring : 'transparent';
    ctx.fill();
    ctx.strokeStyle = palette.grid;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  labels.forEach(function(_, index) {
    const angle = (-Math.PI / 2) + (Math.PI * 2 * index / labels.length);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    ctx.strokeStyle = palette.grid;
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  ctx.beginPath();
  values.forEach(function(value, index) {
    const angle = (-Math.PI / 2) + (Math.PI * 2 * index / labels.length);
    const scaled = Math.max(0, Math.min(maxValue, value)) / maxValue;
    const x = Math.cos(angle) * radius * scaled;
    const y = Math.sin(angle) * radius * scaled;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = palette.fill;
  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 2.5;
  ctx.fill();
  ctx.stroke();

  values.forEach(function(value, index) {
    const angle = (-Math.PI / 2) + (Math.PI * 2 * index / labels.length);
    const scaled = Math.max(0, Math.min(maxValue, value)) / maxValue;
    const x = Math.cos(angle) * radius * scaled;
    const y = Math.sin(angle) * radius * scaled;
    ctx.beginPath();
    ctx.arc(x, y, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = palette.point;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = palette.border;
    ctx.stroke();
  });

  ctx.restore();

  ctx.fillStyle = palette.muted;
  ctx.font = '600 10px Merriweather, serif';
  ctx.textAlign = 'center';
  [2, 4, 6, 8, 10].forEach(function(step, index) {
    const y = center - (radius * (step / maxValue));
    ctx.fillText(String(step), center, y - (index === 4 ? 4 : 2));
  });

  ctx.fillStyle = palette.text;
  ctx.font = '600 12px Merriweather, serif';
  labels.forEach(function(label, index) {
    const angle = (-Math.PI / 2) + (Math.PI * 2 * index / labels.length);
    const labelRadius = radius + 30;
    const x = center + Math.cos(angle) * labelRadius;
    const y = center + Math.sin(angle) * labelRadius;
    ctx.textAlign = Math.abs(Math.cos(angle)) < 0.18 ? 'center' : (Math.cos(angle) > 0 ? 'left' : 'right');
    ctx.textBaseline = Math.sin(angle) > 0.52 ? 'top' : (Math.sin(angle) < -0.52 ? 'bottom' : 'middle');
    ctx.fillText(label, x, y);
  });
}

function destruirRadarChart() {
  if (radarChartInstance && radarChartInstance.resizeHandler) {
    window.removeEventListener('resize', radarChartInstance.resizeHandler);
  }
  if (radarChartInstance && radarChartInstance.canvas) {
    const ctx = radarChartInstance.canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, radarChartInstance.canvas.width, radarChartInstance.canvas.height);
  }
  radarChartInstance = null;
}

