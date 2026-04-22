/* ============================================================
   FICHA — VIEW TABS (Editar / Compacto / Expandido)
============================================================ */
function showFichaView(view) {
  document.querySelectorAll('.ficha-view-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.ficha-view-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('fichaview-' + view).classList.add('active');
  document.querySelectorAll('.ficha-view-tab').forEach(t => {
    if (t.getAttribute('onclick').includes("'" + view + "'")) t.classList.add('active');
  });

  if (view === 'compacto') renderFichaCompacta();
  if (view === 'expandido') renderFichaExpandida();
}

function renderFichaCompacta() {
  const container = document.getElementById('compactSheetContent');
  if (!container) return;
  if (!currentSheetId) {
    container.innerHTML = '<div class="empty-state" style="padding:60px 20px;color:var(--text-muted);"><div class="empty-state-icon">👁</div><h3>Nenhuma ficha aberta</h3></div>';
    return;
  }
  saveCurrentSheet(true);
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;

  const attrs    = sheet.atributos || {};
  const modos    = sheet.modos    || {};
  const der      = calcularTodosDerivados(sheet);
  const rec      = calcRecursos(sheet);
  const allAttrs = ATTRS_GROUPS.flat();
  _migrarRecAtual(sheet);

  // ── Atributos ──────────────────────────────────────────────
  const attrsHTML = allAttrs.map(a => {
    const base  = (attrs[a] ?? 0);
    const bonus = (sheet.raceBonus && sheet.raceBonus[a]) || 0;
    const total = base + bonus;
    const cls   = total > 0 ? 'pos' : total < 0 ? 'neg' : 'zero';
    return `<div class="compact-attr">
      <div class="compact-attr-label">${a}</div>
      <div class="compact-attr-val ${cls}">${total > 0 ? '+' + total : total}</div>
    </div>`;
  }).join('');

  // ── Modos ──────────────────────────────────────────────────
  const modesValues = Object.values(modos);
  const maxM = modesValues.length ? Math.max(...modesValues) : 0;
  const modosHTML = Object.entries(modos).map(([k,v]) =>
    `<div class="compact-modo ${v===maxM&&v>1?'dominant':''}">
      <span class="compact-modo-name">${k}</span>
      <span class="compact-modo-val">${v}</span>
    </div>`).join('');

  // ── Derivados (só valores, sem fórmulas) ──────────────────
  const derivKeyMap = [
    {k:'MV', v:der.MV,       label:'Mov'},
    {k:'EV', v:der.EV,       label:'Esq'},
    {k:'BLK',v:der.BLK,      label:'Blk'},
    {k:'DEF',v:der.DEF_TOTAL,label:'DEF'},
    {k:'MR', v:der.MR_TOTAL, label:'MR'},
    {k:'ATK',v:der.ATK_TOTAL,label:'ATK'},
    {k:'PWR',v:der.PWR,      label:'PWR'},
    {k:'WIL',v:der.WIL,      label:'WIL'},
    {k:'PER',v:der.PER_TESTE,label:'PER'},
    {k:'LK', v:der.LK,       label:'LK'},
  ];
  const subattrsHTML = derivKeyMap.map(({label, v}) =>
    `<div class="compact-subattr-pill">
      <span class="compact-subattr-key">${label}</span>
      <span class="compact-subattr-val">${v >= 0 ? '+' : ''}${v}</span>
    </div>`
  ).join('');

  // ── Recursos editáveis ─────────────────────────────────────
  const resHTML = ['HP','MP','SP','SAN'].map(r => {
    const meta    = _RES_META[r];
    const max     = rec[r];
    const current = Math.min(sheet._recAtual[r] ?? max, max);
    const pct     = max > 0 ? Math.max(0, Math.min(100, (current/max)*100)) : 0;
    return `<div class="resource-bar-wrap">
      <div class="resource-bar-header">
        <span class="resource-bar-name" style="color:${meta.cor}">${meta.icon} ${r}</span>
        <div style="display:flex;align-items:center;gap:4px;">
          <input class="resource-edit-input" type="number" value="${current}" min="0" max="${max}"
            onchange="updateRecursoAtual('${r}', this.value, ${max})" title="Valor atual" />
          <span style="font-size:0.72rem;color:var(--text-muted);">/ ${max}</span>
        </div>
      </div>
      <div class="resource-bar-track">
        <div class="resource-bar-fill" id="resbar-${r.toLowerCase()}" style="width:${pct}%;background:${meta.grad};"></div>
      </div>
    </div>`;
  }).join('');

  // ── Habilidades (só nomes) ─────────────────────────────────
  let habsNomesHTML = '';
  if (typeof RACES_DB !== 'undefined') {
    const race = RACES_DB.find(r => r.name === sheet.raceSelecionada);
    if (race) {
      const todasHabs = [
        ...(race.habilidades||[]), ...(race.passivas||[]),
        ...(race.progressao?.nucleo||[]),
        ...(race.progressao?.caminhos||[]).flatMap(c => c.habilidades||[]),
        ...(race.subraças||[]).flatMap(s => [...(s.habilidades||[]),...(s.passivas||[])]),
      ];
      const todasAtivas = [...(sheet.habilidadesAtivas||[]), ...(sheet.habilidadesAprendidas||[]), ...(sheet.progressaoAtiva||[])];
      const ativas = todasHabs.filter(h => todasAtivas.includes(h.id));
      if (ativas.length) {
        habsNomesHTML = `<div class="compact-section-label">Habilidades</div>
          <div class="compact-list">${ativas.map(h =>
            `<div class="compact-list-item" style="${h.negativa?'color:var(--attr-neg);':''}">${escapeHtml(h.nome)}</div>`
          ).join('')}</div>`;
      }
    }
  }

  // ── Equipamento equipado (só nomes) ───────────────────────
  let equipNomesHTML = '';
  if (sheet.equipamento && typeof EQUIPAMENTOS_INDEX !== 'undefined') {
    const slots = {maoEsquerda:'🗡 Mão Esq.', maoDireita:'🗡 Mão Dir.', armadura:'🛡 Armadura'};
    const rows = Object.entries(slots).map(([sk, sl]) => {
      const id = sheet.equipamento[sk];
      const item = (id && id !== '__locked_2h__') ? EQUIPAMENTOS_INDEX.get(id) : null;
      if (!item) return '';
      return `<div class="compact-list-item"><span style="color:var(--text-muted);font-size:0.7rem;margin-right:4px;">${sl}</span>${escapeHtml(item.nome)}</div>`;
    }).filter(Boolean).join('');
    if (rows) equipNomesHTML = `<div class="compact-section-label">Equipado</div><div class="compact-list">${rows}</div>`;
  }

  // ── Traços / Vantagens / Vulnerabilidades (só nomes) ──────
  const listNomes = (arr, label) => {
    const items = (arr || []).filter(x => x);
    if (!items.length) return '';
    return `<div class="compact-section-label">${label}</div>
      <div class="compact-list">${items.map(x => `<div class="compact-list-item">${escapeHtml(x)}</div>`).join('')}</div>`;
  };

  // ── Variação locus / caminho (só o nome) ──────────────────
  let escolhasHTML = '';
  const escolhas = [];
  if (sheet.caminhoEscolhido) escolhas.push(`Caminho: ${sheet.caminhoEscolhido}`);
  if (sheet.variacaoLocus && typeof RACES_DB !== 'undefined') {
    const race = RACES_DB.find(r => r.name === sheet.raceSelecionada);
    const vari = (race?.variacoes||[]).find(v => v.id === sheet.variacaoLocus);
    if (vari) escolhas.push(`Variação: ${vari.nome}`);
  }
  if (sheet.subraçaSelecionada) escolhas.push(`Subtipu: ${sheet.subraçaSelecionada}`);
  if (escolhas.length) {
    escolhasHTML = `<div class="compact-section-label">Escolhas Raciais</div>
      <div class="compact-list">${escolhas.map(x => `<div class="compact-list-item">${escapeHtml(x)}</div>`).join('')}</div>`;
  }

  const emojis = { 'Base':'🌱','Celestial':'✨','Excêntrica':'🌀' };
  container.innerHTML = `
    <div class="compact-sheet">
      <div class="compact-sheet-header">
        <div class="compact-avatar">${emojis[sheet.classificacao]||'✦'}</div>
        <div class="compact-title">
          <div class="compact-name">${escapeHtml(sheet.name || 'Sem nome')}</div>
          <div class="compact-subtitle">
            ${sheet.raceSelecionada ? escapeHtml(sheet.raceSelecionada) + ' · ' : ''}${sheet.classificacao||'Base'} · Nv.${sheet.nivel||1}
            ${sheet.modificador ? ' · ' + (sheet.modificador==='Aika'?'💠 Aika':'🔶 Ukya') : ''}
          </div>
        </div>
      </div>

      <div class="compact-section-label">Recursos</div>
      <div class="compact-resources">${resHTML}</div>

      <div class="compact-section-label">Atributos</div>
      <div class="compact-attrs">${attrsHTML}</div>

      <div class="compact-section-label">Derivados</div>
      <div class="compact-subattrs-row">${subattrsHTML}</div>

      <div class="compact-section-label">Modos Narrativos</div>
      <div class="compact-modos">${modosHTML}</div>

      ${escolhasHTML}
      ${habsNomesHTML}
      ${equipNomesHTML}
      ${listNomes(sheet.tracos, 'Traços')}
      ${listNomes(sheet.vantagens, 'Vantagens')}
      ${listNomes(sheet.vulnerabilidades, 'Vulnerabilidades')}

      <div style="text-align:center;color:var(--ornament-color);margin-top:20px;letter-spacing:0.4em;">✦ ❧ ✦</div>
    </div>`;
}

function updateRecursoAtual(recurso, valor, max) {
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;
  _migrarRecAtual(sheet);
  const v = Math.max(0, Math.min(parseInt(valor) || 0, max));
  sheet._recAtual[recurso] = v;
  // Atualiza barra no editor principal
  ajustarRecurso && _atualizarBarraUnica(sheet, recurso);
  // Atualiza barra na view compacta
  const bar = document.getElementById('resbar-' + recurso.toLowerCase());
  if (bar) bar.style.width = (max > 0 ? (v/max)*100 : 0) + '%';
  debounceSave();
}

function renderFichaExpandida() {
  const container = document.getElementById('expandedSheetContent');
  if (!container) return;
  if (!currentSheetId) {
    container.innerHTML = '<div class="empty-state" style="padding:60px 20px;color:var(--text-muted);"><div class="empty-state-icon">📜</div><h3>Nenhuma ficha aberta</h3></div>';
    return;
  }
  saveCurrentSheet(true);
  const sheet = getSheet(currentSheetId);
  if (!sheet) return;

  const attrs    = sheet.atributos || {};
  const modos    = sheet.modos    || {};
  const rec      = calcRecursos(sheet);
  const der      = calcularTodosDerivados(sheet);
  const allAttrs = ATTRS_GROUPS.flat();
  _migrarRecAtual(sheet);

  const modesValues = Object.values(modos);
  const maxM = modesValues.length ? Math.max(...modesValues) : 0;

  // ════════════════════════════════════════════════════════
  // HELPER: bloco padrão
  // ════════════════════════════════════════════════════════
  const block = (title, inner) => inner
    ? `<div class="expanded-block"><div class="expanded-block-title">${title}</div>${inner}</div>`
    : '';

  // ════════════════════════════════════════════════════════
  // 1. RECURSOS — barras visuais (read-only)
  // ════════════════════════════════════════════════════════
  const recRows = ['HP','MP','SP','SAN'].map(k => {
    const meta = _RES_META[k];
    const max  = rec[k];
    const cur  = sheet._recAtual[k] ?? max;
    const pct  = max > 0 ? Math.max(0,Math.min(100,(cur/max)*100)) : 0;
    // Quais atributos influenciam cada recurso (para o jogador entender)
    const influencias = { HP:'VIDA · CON', MP:'MAG · INT', SP:'CON · AGI', SAN:'VON · SAB' };
    return `<div class="resource-bar-wrap">
      <div class="resource-bar-header">
        <div>
          <span class="resource-bar-name" style="color:${meta.cor}">${meta.icon} ${k}</span>
          <span style="font-size:0.68rem;color:var(--text-muted);margin-left:6px;">influenciado por ${influencias[k]}</span>
        </div>
        <span class="resource-bar-value" style="color:${meta.cor};font-weight:700;">${cur} / ${max}</span>
      </div>
      <div class="resource-bar-track">
        <div class="resource-bar-fill" style="width:${pct}%;background:${pct<=meta.danger*100?meta.gradLow:meta.grad};"></div>
      </div>
    </div>`;
  }).join('');

  // ════════════════════════════════════════════════════════
  // 2. ATRIBUTOS BASE
  // ════════════════════════════════════════════════════════
  const attrRows = allAttrs.map(a => {
    const base  = attrs[a] ?? 0;
    const bonus = (sheet.raceBonus && sheet.raceBonus[a]) || 0;
    const total = base + bonus;
    const cls   = total > 0 ? 'pos' : total < 0 ? 'neg' : 'zero';
    const bonusLabel = bonus !== 0
      ? `<span style="font-size:0.65rem;color:var(--text-muted);margin-left:3px;">(base ${base>0?'+':''}${base} ${bonus>0?'+':''}${bonus} racial)</span>`
      : '';
    return `<div class="read-attr">
      <div class="read-attr-label">${a}</div>
      <div class="read-attr-val ${cls}">${total > 0 ? '+'+total : total}</div>
      ${bonusLabel}
    </div>`;
  }).join('');

  // ════════════════════════════════════════════════════════
  // 3. DERIVADOS — valor + o que influencia (sem fórmula)
  // ════════════════════════════════════════════════════════
  const derivGroups = [
    { title:'🏃 Mobilidade & Defesa', items:[
      { key:'MV',        val:der.MV,        label:'Movimento',       influence:'AGI',            desc:'Metros que você pode mover por turno em ação de Movimento.' },
      { key:'EV',        val:der.EV,        label:'Esquiva',         influence:'DES · AGI',       desc:'Bônus em testes para desviar de ataques ou efeitos de área.' },
      { key:'BLK',       val:der.BLK,       label:'Bloqueio',        influence:'FOR · DES',       desc:'Redução de dano ao bloquear com escudo ou corpo a corpo.' },
      { key:'DEF_TOTAL', val:der.DEF_TOTAL, label:'DEF Total',       influence:'DEF · CON · FOR · armadura', desc:'Defesa física total incluindo equipamento. Reduz dano direto.' },
      { key:'MR_TOTAL',  val:der.MR_TOTAL,  label:'MR Total',        influence:'RESM · VON · CON · escudo',  desc:'Resistência mágica total. Reduz dano e efeitos mágicos.' },
    ]},
    { title:'⚔️ Combate & Magia', items:[
      { key:'ATK_TOTAL', val:der.ATK_TOTAL, label:'ATK Total',       influence:'ATQ · DES · FOR · arma',     desc:'Bônus de ataque total com a arma equipada. Afeta testes de acerto.' },
      { key:'PWR',       val:der.PWR,       label:'Poder Mágico',    influence:'MAG · INT',       desc:'Força das suas magias e habilidades mágicas.' },
    ]},
    { title:'🧠 Testes & Sorte', items:[
      { key:'WIL',       val:der.WIL,       label:'Vontade',         influence:'VON · CON',       desc:'Resistência mental. Usado em testes contra medo, charme e controle.' },
      { key:'PER_TESTE', val:der.PER_TESTE, label:'Percepção',       influence:'PER · SAB · AGI', desc:'Capacidade de notar detalhes, armadilhas e ameaças ocultas.' },
      { key:'LK',        val:der.LK,        label:'Sorte',           influence:'CAR · SAB',       desc:'Bônus base para eventos e testes com fator aleatório.' },
    ]},
  ];
  const subRows = derivGroups.map(g => {
    const rows = g.items.map(({val, label, influence, desc}) => {
      const sign = val >= 0 ? '+' : '';
      return `<div class="expanded-hab-item" style="padding:10px 14px;margin-bottom:6px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <span style="font-weight:700;font-size:.88rem;color:var(--text-primary);">${label}</span>
            <span style="font-size:.68rem;color:var(--lavanda);margin-left:8px;font-weight:600;">${influence}</span>
          </div>
          <div style="font-family:'Playfair Display',serif;font-size:1.4rem;font-weight:700;color:var(--text-accent);">${sign}${val}</div>
        </div>
        <div style="font-size:.78rem;color:var(--text-muted);margin-top:3px;">${desc}</div>
      </div>`;
    }).join('');
    return `<div style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text-muted);margin-bottom:6px;">${g.title}</div>${rows}`;
  }).join('');

  // ════════════════════════════════════════════════════════
  // 4. MODOS NARRATIVOS + descrição de como funcionam
  // ════════════════════════════════════════════════════════
  const modosDesc = {
    Bruto:'Força bruta, resistência e combate físico direto.',
    Ágil:'Agilidade, acrobacia e reações rápidas.',
    Preciso:'Técnica, concentração e precisão cirúrgica.',
    Intuitivo:'Instinto, leitura de situações e criatividade.',
  };
  const modosHTML = Object.entries(modos).map(([k,v]) =>
    `<div class="read-modo ${v===maxM&&v>1?'dominant':''}">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="font-weight:700;">${k}</span>
        <strong style="font-family:'Playfair Display',serif;font-size:1.2rem;">${v}</strong>
      </div>
      <div style="font-size:0.72rem;color:var(--text-muted);margin-top:3px;">${modosDesc[k]||''}</div>
    </div>`).join('');

  // ════════════════════════════════════════════════════════
  // 5. RAÇA & CONCEITO (conceito narrativo da raça escolhida)
  // ════════════════════════════════════════════════════════
  let racaBlock = '';
  let race = null;
  if (sheet.raceSelecionada && typeof RACES_DB !== 'undefined') {
    race = RACES_DB.find(r => r.name === sheet.raceSelecionada);
    if (race) {
      const profRows = race.proficiencias ? Object.entries(race.proficiencias).filter(([k]) => k !== 'progressao').map(([k,v]) => {
        const labels = {armas:'Armas',armaduras:'Armaduras',escolas:'Escolas Mágicas',afinidades:'Afinidades',tipoMagico:'Tipo Mágico',skillsIniciais:'Skills Iniciais',periciasBonus:'Perícias Bônus'};
        const val = Array.isArray(v) ? v.join(', ') : String(v);
        return `<div style="display:flex;gap:8px;padding:4px 0;border-bottom:1px solid var(--border-light);font-size:0.82rem;">
          <span style="color:var(--text-muted);min-width:110px;flex-shrink:0;">${labels[k]||k}</span>
          <span style="color:var(--text-secondary);">${escapeHtml(val)}</span>
        </div>`;
      }).join('') : '';

      racaBlock = `
        ${race.conceito ? `<div style="font-style:italic;color:var(--text-secondary);font-size:0.88rem;line-height:1.6;margin-bottom:14px;padding:10px 14px;background:var(--bg-secondary);border-left:3px solid var(--lavanda);border-radius:0 var(--radius-sm) var(--radius-sm) 0;">"${escapeHtml(race.conceito)}"</div>` : ''}
        ${race.observacao ? `<div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:12px;padding:8px 12px;background:var(--lavanda-light);border-radius:var(--radius-sm);">⚙ ${escapeHtml(race.observacao)}</div>` : ''}
        ${profRows ? `<div style="margin-top:8px;">${profRows}</div>` : ''}`;
    }
  }

  // ════════════════════════════════════════════════════════
  // 6. SUBRA​ÇA — se escolhida
  // ════════════════════════════════════════════════════════
  let subracaBlock = '';
  if (race && sheet.subraçaSelecionada) {
    const sub = (race.subraças||[]).find(s => s.name === sheet.subraçaSelecionada);
    if (sub) {
      const subAttrBonuses = sub.atributos
        ? Object.entries(sub.atributos).filter(([,v])=>v!==0).map(([k,v])=>`${k}: ${v>0?'+':''}${v}`).join(', ')
        : '';
      subracaBlock = `
        <div style="font-size:0.8rem;font-weight:700;color:var(--text-accent);margin-bottom:8px;">Subtipo: ${escapeHtml(sub.name)}</div>
        ${sub.conceito ? `<div style="font-size:0.85rem;color:var(--text-secondary);line-height:1.6;margin-bottom:10px;">${escapeHtml(sub.conceito)}</div>` : ''}
        ${subAttrBonuses ? `<div style="font-size:0.78rem;color:var(--text-muted);margin-bottom:8px;">Bônus: ${subAttrBonuses}</div>` : ''}
        ${sub.mecanica ? `<div style="font-size:0.83rem;color:var(--text-secondary);padding:8px 12px;background:var(--bg-secondary);border-left:3px solid var(--celeste);border-radius:0 var(--radius-sm) var(--radius-sm) 0;">⚙ ${escapeHtml(sub.mecanica)}</div>` : ''}`;
    }
  }

  // ════════════════════════════════════════════════════════
  // 7. VARIAÇÃO LOCUS / CULTURAL — com descrição completa
  // ════════════════════════════════════════════════════════
  let variacaoBlock = '';
  if (race && sheet.variacaoLocus) {
    const vari = (race.variacoes||[]).find(v => v.id === sheet.variacaoLocus);
    if (vari) {
      variacaoBlock = `
        <div style="font-size:0.8rem;font-weight:700;color:var(--text-accent);margin-bottom:6px;">Variação: ${escapeHtml(vari.nome)}</div>
        <div style="font-size:0.85rem;color:var(--text-secondary);line-height:1.6;">${escapeHtml(vari.desc)}</div>`;
    }
  }

  // ════════════════════════════════════════════════════════
  // 8. MECÂNICA RACIAL
  // ════════════════════════════════════════════════════════
  let mecanicaBlock = '';
  if (race && race.mecanica) {
    mecanicaBlock = `<div class="expanded-mecanica-block">
      <div class="expanded-mecanica-title">⚙ Mecânica: ${escapeHtml(race.name)}</div>
      <div class="expanded-mecanica-desc">${escapeHtml(race.mecanica)}</div>
    </div>`;
  }
  if (race && sheet.subraçaSelecionada) {
    const sub = (race.subraças||[]).find(s => s.name === sheet.subraçaSelecionada);
    if (sub?.mecanica) {
      mecanicaBlock += `<div class="expanded-mecanica-block" style="margin-top:8px;">
        <div class="expanded-mecanica-title">⚙ Mecânica: ${escapeHtml(sub.name)}</div>
        <div class="expanded-mecanica-desc">${escapeHtml(sub.mecanica)}</div>
      </div>`;
    }
  }

  // ════════════════════════════════════════════════════════
  // 9. CAMINHO DE PROGRESSÃO — com descrição e habilidades
  // ════════════════════════════════════════════════════════
  let caminhoBlock = '';
  if (race && sheet.caminhoEscolhido) {
    const caminho = (race.progressao?.caminhos||[]).find(c => c.nome === sheet.caminhoEscolhido);
    if (caminho) {
      const habsProgAtivas = (sheet.progressaoAtiva||[]);
      const habsAprendidas = (sheet.habilidadesAprendidas||[]);

      // Habilidades do núcleo desbloqueadas
      const nucleo = (race.progressao?.nucleo||[]).filter(h =>
        habsProgAtivas.includes(h.id) || habsAprendidas.includes(h.id)
      );
      const caminhoHabs = (caminho.habilidades||[]).filter(h =>
        habsProgAtivas.includes(h.id) || habsAprendidas.includes(h.id)
      );

      const renderHabProg = (h) => {
        const tipoCls = h.tipo === 'passiva' ? 'hab-tipo-passiva' : 'hab-tipo-progressao';
        const tipoLabel = h.tipo === 'passiva' ? 'Passiva' : 'Progressão';
        return `<div class="expanded-hab-item">
          <div class="expanded-hab-nome">
            ${escapeHtml(h.nome)}
            <span class="hab-tipo-badge ${tipoCls}">${tipoLabel}</span>
          </div>
          ${h.req ? `<div class="hab-req" style="font-size:0.72rem;color:var(--attr-warn);margin-bottom:4px;">⚠ Req: ${escapeHtml(h.req)}</div>` : ''}
          <div class="expanded-hab-desc">${escapeHtml(h.desc||'Sem descrição.')}</div>
        </div>`;
      };

      caminhoBlock = `
        <div style="background:var(--lavanda-light);border:1.5px solid var(--lavanda);border-radius:var(--radius-md);padding:12px 16px;margin-bottom:14px;">
          <div style="font-family:'Playfair Display',serif;font-size:1rem;font-weight:700;color:var(--text-accent);margin-bottom:4px;">Caminho: ${escapeHtml(caminho.nome)}</div>
          ${caminho.foco ? `<div style="font-size:0.82rem;color:var(--text-secondary);font-style:italic;">${escapeHtml(caminho.foco)}</div>` : ''}
        </div>
        ${nucleo.length ? `<div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text-muted);margin-bottom:6px;">Habilidades do Núcleo</div>${nucleo.map(renderHabProg).join('')}` : ''}
        ${caminhoHabs.length ? `<div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text-muted);margin-bottom:6px;${nucleo.length?'margin-top:12px;':''}">Habilidades do Caminho</div>${caminhoHabs.map(renderHabProg).join('')}` : ''}
        ${(!nucleo.length && !caminhoHabs.length) ? '<div style="font-size:0.82rem;color:var(--text-muted);font-style:italic;">Nenhuma habilidade de progressão adquirida ainda.</div>' : ''}`;
    }
  }

  // ════════════════════════════════════════════════════════
  // 10. HABILIDADES RACIAIS — com descrição completa
  // ════════════════════════════════════════════════════════
  let habsBlock = '';
  if (race) {
    const todasHabsDB = [
      ...(race.habilidades||[]),
      ...(race.passivas||[]),
      ...(race.subraças||[]).flatMap(s => [...(s.habilidades||[]),...(s.passivas||[])]),
    ];
    const todasAtivas = [...(sheet.habilidadesAtivas||[]), ...(sheet.habilidadesAprendidas||[])];
    const ativas = todasHabsDB.filter(h => todasAtivas.includes(h.id));

    if (ativas.length) {
      habsBlock = ativas.map(h => {
        const neg = h.negativa;
        const tipoCls = neg ? 'hab-tipo-negativa' : h.tipo === 'passiva' ? 'hab-tipo-passiva' : 'hab-tipo-ativa';
        const tipoLabel = neg ? 'Negativa' : h.tipo === 'passiva' ? 'Passiva' : 'Ativa';
        return `<div class="expanded-hab-item ${neg ? 'negativa' : ''}">
          <div class="expanded-hab-nome">
            ${escapeHtml(h.nome)}
            <span class="hab-tipo-badge ${tipoCls}">${tipoLabel}</span>
          </div>
          ${h.req ? `<div class="hab-req" style="font-size:0.72rem;color:var(--attr-warn);margin-bottom:4px;">⚠ Req: ${escapeHtml(h.req)}</div>` : ''}
          <div class="expanded-hab-desc">${escapeHtml(h.desc||'Sem descrição.')}</div>
          ${h.efeito?.mods ? `<div style="font-size:0.72rem;color:var(--lavanda);margin-top:6px;">Efeitos: ${Object.entries(h.efeito.mods).map(([k,v])=>`${k} ${v>0?'+':''}${v}`).join(' · ')}</div>` : ''}
        </div>`;
      }).join('');
    }
  }

  // ════════════════════════════════════════════════════════
  // 11. EQUIPAMENTO — stats completos de cada item equipado
  // ════════════════════════════════════════════════════════
  let equipBlock = '';
  if (sheet.equipamento && typeof EQUIPAMENTOS_INDEX !== 'undefined') {
    const slots = {maoEsquerda:'🗡 Mão Esq.', maoDireita:'🗡 Mão Dir.', armadura:'🛡 Armadura'};
    const rows = Object.entries(slots).map(([slotKey, slotLabel]) => {
      const itemId = sheet.equipamento[slotKey];
      if (!itemId || itemId === '__locked_2h__') {
        const emptyLabel = itemId === '__locked_2h__' ? '<em style="color:var(--attr-warn);">🔒 Bloqueado (2M)</em>' : '<em style="color:var(--text-muted);">Vazio</em>';
        return `<div class="expanded-equip-row">
          <div class="expanded-equip-slot">${slotLabel}</div>
          <div class="expanded-equip-name">${emptyLabel}</div>
        </div>`;
      }
      const item = EQUIPAMENTOS_INDEX.get(itemId);
      if (!item) return '';

      let statsHTML = '';
      if (item.tipo === 'arma') {
        statsHTML = `
          <span class="equip-stat-pill atk">🎲 ${item.dado}</span>
          <span class="equip-stat-pill">${item.tipoDano}</span>
          <span class="equip-stat-pill">${item.empunhadura}</span>
          <span class="equip-stat-pill">⚖ ${item.peso}kg</span>
          <span class="equip-stat-pill preco">💰 ${item.preco}P</span>`;
      } else if (item.tipo === 'armadura') {
        statsHTML = `
          <span class="equip-stat-pill def">🛡 DEF +${item.rd}</span>
          <span class="equip-stat-pill">CA +${item.ca}</span>
          ${item.rm ? `<span class="equip-stat-pill mag">RM +${item.rm}</span>` : ''}
          ${item.penalidade ? `<span class="equip-stat-pill pen">AGI ${item.penalidade}</span>` : ''}
          <span class="equip-stat-pill">⚖ ${item.peso}kg</span>`;
      } else if (item.tipo === 'escudo') {
        statsHTML = `
          <span class="equip-stat-pill def">🛡 DEF +${item.defesa}</span>
          <span class="equip-stat-pill">Dur. ${item.durabilidade}</span>
          ${item.penalidade ? `<span class="equip-stat-pill pen">AGI ${item.penalidade}</span>` : ''}
          <span class="equip-stat-pill">⚖ ${item.peso}kg</span>`;
      }

      return `<div class="expanded-equip-row">
        <div class="expanded-equip-slot">${slotLabel}</div>
        <div style="flex:1;">
          <div class="expanded-equip-name">${escapeHtml(item.nome)}</div>
          ${item.categoria ? `<div style="font-size:0.7rem;color:var(--text-muted);margin-bottom:4px;">${item.categoria}</div>` : ''}
          <div class="expanded-equip-stats">${statsHTML}</div>
          ${item.critico ? `<div style="font-size:0.72rem;color:var(--text-muted);margin-top:4px;">Crítico: <b>${item.critico}</b></div>` : ''}
          ${item.requisitos ? `<div style="font-size:0.72rem;color:var(--attr-warn);margin-top:2px;">Req: ${Object.entries(item.requisitos).map(([k,v])=>k+' '+v).join(', ')}</div>` : ''}
        </div>
      </div>`;
    }).join('');
    equipBlock = rows || '<p style="color:var(--text-muted);font-style:italic;">Nenhum equipamento equipado.</p>';
  }

  // ════════════════════════════════════════════════════════
  // 12. INVENTÁRIO
  // ════════════════════════════════════════════════════════
  const inv = sheet.inventario || [];
  const invBlock = inv.length
    ? inv.map(item => `<div class="expanded-inv-item">
        <span class="expanded-inv-qty">×${item.quantidade ?? 1}</span>
        <span style="flex:1;font-size:0.85rem;color:var(--text-primary);">${escapeHtml(item.nome || item.id)}</span>
        ${item.peso ? `<span style="font-size:0.75rem;color:var(--text-muted);">${item.peso}kg</span>` : ''}
      </div>`).join('')
    : '';

  // ════════════════════════════════════════════════════════
  // 13. TRAÇOS / VANTAGENS / VULNERABILIDADES
  // ════════════════════════════════════════════════════════
  const sectionBlock = (label, icon, arr) => {
    const items = (arr||[]).filter(x=>x);
    if (!items.length) return '';
    return `<div class="expanded-block">
      <div class="expanded-block-title">${icon} ${label}</div>
      <ul class="read-list">${items.map(x => `<li>${escapeHtml(x)}</li>`).join('')}</ul>
    </div>`;
  };

  // ════════════════════════════════════════════════════════
  // 14. PERÍCIAS
  // ════════════════════════════════════════════════════════
  const pericias = sheet.pericias || {};
  const periciaRows = Object.entries(pericias).filter(([,v]) => v !== 0).map(([nome, val]) =>
    `<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid var(--border-light);font-size:0.85rem;">
      <span style="color:var(--text-primary);">${escapeHtml(nome)}</span>
      <span style="font-family:'Playfair Display',serif;font-size:1.05rem;font-weight:700;color:${val>0?'var(--attr-pos)':'var(--attr-neg)'};">${val>0?'+':''}${val}</span>
    </div>`).join('');

  // ════════════════════════════════════════════════════════
  // 15. BACKGROUND
  // ════════════════════════════════════════════════════════
  const bgFields = [
    {label:'Origem',           val: sheet.bgOrigem},
    {label:'Memória Marcante', val: sheet.bgMemoria},
    {label:'Objetivo',         val: sheet.bgObjetivo},
    {label:'Motivação',        val: sheet.bgMotivacao},
    {label:'Valores',          val: sheet.bgValores},
  ].filter(f => f.val);
  const bgBlock = bgFields.length
    ? bgFields.map(f => `<div style="margin-bottom:14px;">
        <div style="font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text-muted);margin-bottom:4px;">${f.label}</div>
        <div style="font-size:0.85rem;color:var(--text-secondary);line-height:1.6;">${escapeHtml(f.val)}</div>
      </div>`).join('')
    : '';

  // ════════════════════════════════════════════════════════
  // MONTAGEM FINAL
  // ════════════════════════════════════════════════════════
  const emojis = { 'Base':'🌱','Celestial':'✨','Excêntrica':'🌀' };

  container.innerHTML = `
    <div class="expanded-sheet">
      <div style="text-align:center;margin-bottom:8px;color:var(--ornament-color);letter-spacing:0.4em;">✦ ❧ ✦</div>

      <h1 style="font-family:'Playfair Display',serif;font-size:2rem;font-weight:700;color:var(--text-accent);text-align:center;margin-bottom:6px;">${escapeHtml(sheet.name || 'Sem nome')}</h1>
      <div style="text-align:center;margin-bottom:${sheet.conceitoNarrativo ? '10px' : '24px'};display:flex;justify-content:center;gap:8px;flex-wrap:wrap;">
        <span class="badge badge-${(sheet.classificacao||'base').toLowerCase()}">${sheet.classificacao||'Base'}</span>
        ${sheet.raceSelecionada ? `<span class="badge badge-player">${escapeHtml(sheet.raceSelecionada)}</span>` : ''}
        ${sheet.subraçaSelecionada ? `<span class="badge" style="background:var(--celeste-light);color:var(--celeste-dark);">${escapeHtml(sheet.subraçaSelecionada)}</span>` : ''}
        <span class="badge badge-npc">Nível ${sheet.nivel||1}</span>
        ${sheet.modificador ? `<span class="badge" style="background:var(--lavanda-light);color:var(--lavanda-dark);">${sheet.modificador==='Aika'?'💠 Aika':'🔶 Ukya'}</span>` : ''}
      </div>
      ${sheet.conceitoNarrativo ? `<div style="font-style:italic;text-align:center;color:var(--text-secondary);font-size:0.95rem;line-height:1.7;font-family:'Playfair Display',serif;margin-bottom:24px;">"${escapeHtml(sheet.conceitoNarrativo)}"</div>` : ''}

      ${block('💚 Recursos', recRows)}
      ${block('⚡ Atributos Base', `<div class="read-attrs-grid">${attrRows}</div>`)}
      ${block('📊 Derivados', subRows)}
      ${block('🎭 Modos Narrativos', `<div class="read-modos-row">${modosHTML}</div>`)}

      ${race ? block(`${emojis[race.classificacao]||'✦'} Raça: ${escapeHtml(race.name)}`, racaBlock) : ''}
      ${subracaBlock ? block('🔀 Subtipo Racial', subracaBlock) : ''}
      ${variacaoBlock ? block('🏛 Variação Cultural / Locus', variacaoBlock) : ''}
      ${mecanicaBlock ? block('⚙ Mecânicas Raciais', mecanicaBlock) : ''}
      ${caminhoBlock ? block('🛤 Caminho de Progressão', caminhoBlock) : ''}
      ${habsBlock ? block('⚡ Habilidades Raciais', habsBlock) : ''}

      ${sectionBlock('Traços Fixos', '📌', sheet.tracos)}
      ${sectionBlock('Vantagens Situacionais', '✅', sheet.vantagens)}
      ${sectionBlock('Vulnerabilidades', '⚠', sheet.vulnerabilidades)}

      ${block('⚔️ Equipamento', equipBlock)}
      ${invBlock ? block('🎒 Inventário', invBlock) : ''}
      ${periciaRows ? block('🎓 Perícias', periciaRows) : ''}
      ${bgBlock ? block('📖 Background', bgBlock) : ''}

      <div style="text-align:center;color:var(--ornament-color);margin-top:24px;letter-spacing:0.4em;">✦ ❧ ✦</div>
    </div>`;
}

/* Fix: ensure _recAtual is saved & migrated */
function restoreAppState() {
  const hash = window.location.hash;
  if (hash === '#new') {
    newSheet();
    if (history.replaceState) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    } else {
      window.location.hash = '';
    }
    return;
  }

  const lastPage = localStorage.getItem(LAST_PAGE_KEY) || 'library';
  const activeSheetId = localStorage.getItem(ACTIVE_SHEET_KEY);
  const activeSheet = activeSheetId ? getSheet(activeSheetId) : null;

  if (activeSheet) {
    setCurrentSheetId(activeSheetId);
  }

  if (lastPage === 'editor' && activeSheet) {
    openSheet(activeSheetId);
    return;
  }

  if (activeSheetId && !activeSheet) {
    setCurrentSheetId(null);
    localStorage.removeItem(ACTIVE_SHEET_KEY);
  }

  showPage(lastPage);
}

function init() {
  localStorage.setItem('companion_last_system', 'verloren');
  loadData();
  applyTheme(appData.config.theme || 'light');
  renderLibrary();

  // Fecha modais ao clicar fora
  initModalClickOutside();

  // Tab presets
  document.getElementById('tab-presets').addEventListener('click', () => showPage('presets'));

  // Tecla ESC fecha modais e modo leitura
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
      document.getElementById('readModeOverlay').classList.remove('open');
    }
  });

  // Marca grupo ativo inicial no sistema (Personagem)
  const grpBtn = document.getElementById('sgrpbtn-personagem');
  if (grpBtn) grpBtn.classList.add('has-active');

  // Marca grupo ativo inicial no mundo (Universo)
  const mundoGrpBtn = document.getElementById('sgrpbtn-mundo-universo');
  if (mundoGrpBtn) mundoGrpBtn.classList.add('has-active');

  if (typeof refreshInstallState === 'function') refreshInstallState();
  restoreAppState();
  if (window.CompanionUI && typeof window.CompanionUI.renderVerlorenSystemWorkbench === 'function') {
    window.CompanionUI.renderVerlorenSystemWorkbench(getSheet(currentSheetId));
  }

  // Se não há fichas, mostra estado vazio com dica
  if (!appData.sheets.length) {
    setTimeout(() => toast('Bem-vindo ao Verloren RPG Sheets! Crie sua primeira ficha ou pré-carregue as raças. ✦', 'info'), 500);
  }
}

document.addEventListener('DOMContentLoaded', init);

