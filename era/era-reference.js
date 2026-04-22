function normalizeReferenceSearch(value) {
  return (value || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function matchesReferenceSearch(values, normalizedFilter) {
  if (!normalizedFilter) return true;
  return values.some((value) => normalizeReferenceSearch(value).includes(normalizedFilter));
}

function getStyleAccent(detail) {
  const normalizedWeapon = normalizeReferenceSearch(detail.weapon);
  const normalizedStyle = normalizeReferenceSearch(detail.style);
  if (detail.synthesis) return C.alma;
  if (/(sniper|rifle|pistola|revolver|arco|balestra)/.test(normalizedWeapon)) return C.mente;
  if (/(controle|cobertura|observador|precisao|utilitaria)/.test(normalizedStyle)) return C.gold;
  return C.corpo;
}

function CompendiumTable({ columns, rows }) {
  if (!rows || !rows.length) {
    return <div style={{ fontSize: 11, color: C.muted }}>Sem dados nessa secao.</div>;
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, minWidth: 440 }}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                style={{
                  textAlign: column.align || "left",
                  padding: "6px 7px",
                  color: C.muted,
                  borderBottom: `1px solid ${C.border}`,
                  fontSize: 10,
                  whiteSpace: "nowrap",
                }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row.id || row.name || row.tier || row.grade || row.stage || row.combo || rowIndex} style={{ background: rowIndex % 2 === 0 ? C.bg3 : "transparent" }}>
              {columns.map((column) => (
                <td key={column.key} style={{ padding: "7px 7px", color: column.emphasis ? column.emphasis(row) : C.text, textAlign: column.align || "left", verticalAlign: "top", lineHeight: 1.5 }}>
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StyleReferencePanel({ filter }) {
  const normalizedFilter = normalizeReferenceSearch(filter);
  const detailedKeys = STYLE_DETAILS.reduce((set, detail) => {
    set.add(`${detail.weapon}::${detail.style}`);
    return set;
  }, new Set());

  const shownMap = WEAPON_STYLE_MAP.filter((entry) =>
    matchesReferenceSearch([entry.weapon, entry.styleA, entry.styleB, entry.synthesis || ""], normalizedFilter)
  );

  const shownDetails = STYLE_DETAILS.filter((detail) => {
    const techniqueValues = detail.levels.reduce((acc, level) => {
      level.entries.forEach((entry) => acc.push(entry.name, entry.type, entry.action, entry.effect));
      return acc;
    }, []);

    return matchesReferenceSearch(
      [detail.weapon, detail.style, detail.summary, detail.requirements || "", ...techniqueValues],
      normalizedFilter
    );
  });

  return (
    <div>
      <Sect title="Afinidade de Estilo" color={C.gold}>
        <ResponsiveGrid minWidth={180}>
          {STYLE_AFFINITY.map((item) => (
            <div key={item.level} style={{ ...card, background: item.level >= 2 ? `${C.gold}0F` : C.bg3, borderColor: item.level >= 2 ? `${C.gold}44` : C.border }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, lineHeight: 1, color: item.level >= 2 ? C.gold : C.text }}>{item.level}</div>
              <div style={{ fontWeight: 700, fontSize: 13, margin: "6px 0 4px" }}>{item.name}</div>
              <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>{item.effect}</div>
            </div>
          ))}
        </ResponsiveGrid>

        <ResponsiveGrid minWidth={240} style={{ marginTop: 12 }}>
          <div style={{ ...card, background: `${C.mente}0E`, borderColor: `${C.mente}33` }}>
            <div style={{ fontWeight: 700, color: C.mente, marginBottom: 6 }}>Permite reagir</div>
            {STYLE_REACTION_RULES.allow.map((rule) => (
              <div key={rule} style={{ fontSize: 11, color: C.text, marginBottom: 5, lineHeight: 1.5 }}>{rule}</div>
            ))}
          </div>
          <div style={{ ...card, background: `${C.corpo}0E`, borderColor: `${C.corpo}33` }}>
            <div style={{ fontWeight: 700, color: C.corpo, marginBottom: 6 }}>Impede reagir</div>
            {STYLE_REACTION_RULES.block.map((rule) => (
              <div key={rule} style={{ fontSize: 11, color: C.text, marginBottom: 5, lineHeight: 1.5 }}>{rule}</div>
            ))}
          </div>
          <div style={{ ...card, background: `${C.alma}0E`, borderColor: `${C.alma}33` }}>
            <div style={{ fontWeight: 700, color: C.alma, marginBottom: 6 }}>Aparos validos</div>
            {STYLE_REACTION_RULES.parry.map((rule) => (
              <div key={rule.tool} style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.text }}>{rule.tool}</div>
                <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.4 }}>{rule.scope}</div>
              </div>
            ))}
          </div>
        </ResponsiveGrid>
      </Sect>

      <Sect title="Mapa de Estilos" color={C.corpo}>
        <ResponsiveGrid minWidth={220}>
          {shownMap.map((entry) => {
            const hasStyleA = detailedKeys.has(`${entry.weapon}::${entry.styleA}`);
            const hasStyleB = detailedKeys.has(`${entry.weapon}::${entry.styleB}`);
            const hasSynthesis = entry.synthesis ? detailedKeys.has(`${entry.weapon}::${entry.synthesis}`) : false;

            return (
              <div key={entry.weapon} style={{ ...card, background: C.bg3 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{entry.weapon}</div>
                  {(hasStyleA || hasStyleB || hasSynthesis) ? <div style={{ fontSize: 9, color: C.gold, letterSpacing: 1 }}>DETALHADO</div> : null}
                </div>
                <div className="chip-row">
                  <span style={{ padding: "3px 8px", borderRadius: 999, background: `${C.corpo}14`, border: `1px solid ${C.corpo}33`, fontSize: 10, color: C.corpo }}>{entry.styleA}</span>
                  <span style={{ padding: "3px 8px", borderRadius: 999, background: `${C.gold}14`, border: `1px solid ${C.gold}33`, fontSize: 10, color: C.gold }}>{entry.styleB}</span>
                  {entry.synthesis ? <span style={{ padding: "3px 8px", borderRadius: 999, background: `${C.alma}14`, border: `1px solid ${C.alma}33`, fontSize: 10, color: C.alma }}>{entry.synthesis}</span> : null}
                </div>
              </div>
            );
          })}
        </ResponsiveGrid>
        {shownMap.length === 0 ? <div style={{ textAlign: "center", color: C.muted, paddingTop: 12 }}>Nenhum estilo encontrado para "{filter}".</div> : null}
      </Sect>

      <Sect title="Tecnicas por Estilo" color={C.alma}>
        <ResponsiveGrid minWidth={320}>
          {shownDetails.map((detail) => {
            const accent = getStyleAccent(detail);
            return (
              <div key={`${detail.weapon}-${detail.style}`} style={{ ...card, background: `${accent}0D`, borderColor: `${accent}33` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>{detail.weapon}</div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: accent }}>{detail.style}</div>
                  </div>
                  {detail.synthesis ? <div style={{ fontSize: 9, color: C.alma, letterSpacing: 1 }}>SINTESE</div> : null}
                </div>
                <div style={{ fontSize: 11, color: C.text, lineHeight: 1.55 }}>{detail.summary}</div>
                {detail.requirements ? <div style={{ fontSize: 10, color: C.gold, marginTop: 6 }}>{detail.requirements}</div> : null}

                {detail.levels.map((level) => (
                  <div key={level.tier} style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 10, color: accent, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>AFINIDADE {level.tier}</div>
                    {level.entries.map((entry) => (
                      <div key={`${level.tier}-${entry.name}`} style={{ marginBottom: 7 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: C.text }}>
                          {entry.name} <span style={{ color: accent }}>({entry.type} - {entry.action})</span>
                        </div>
                        <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.45 }}>{entry.effect}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            );
          })}
        </ResponsiveGrid>
        {shownDetails.length === 0 ? <div style={{ textAlign: "center", color: C.muted, paddingTop: 12 }}>Sem tecnicas detalhadas para esse filtro.</div> : null}
      </Sect>
    </div>
  );
}

function AdvancedSystemsPanel() {
  const [section, setSection] = useState("alchemy");
  const sections = [
    { id: "alchemy", label: "Alquimia" },
    { id: "chaining", label: "Encadeamento" },
    { id: "projects", label: "Projetos" },
    { id: "relics", label: "Reliquias" },
  ];

  return (
    <div>
      <div className="chip-row" style={{ marginBottom: 8 }}>
        {sections.map((item) => {
          const active = section === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              style={{
                padding: "5px 12px",
                borderRadius: 20,
                whiteSpace: "nowrap",
                background: active ? `${C.alma}22` : C.bg2,
                border: `1px solid ${active ? C.alma : C.border}`,
                color: active ? C.alma : C.muted,
                fontSize: 12,
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {section === "alchemy" ? (
        <Sect title="Alquimia e Materiais Persistentes" color={C.alma}>
          <CompendiumTable
            columns={[
              { key: "combo", label: "Combinacao" },
              { key: "material", label: "Material", emphasis: () => C.gold },
              { key: "req", label: "Req." },
              { key: "duration", label: "Duracao" },
              { key: "properties", label: "Propriedades" },
            ]}
            rows={ADVANCED_SYSTEMS.alchemy}
          />
        </Sect>
      ) : null}

      {section === "chaining" ? (
        <div>
          <Sect title="Manifestacoes Extremas" color={C.corpo}>
            <div style={{ ...card, background: C.bg3, marginBottom: 12 }}>
              {ADVANCED_SYSTEMS.chaining.flow.map((item) => (
                <div key={item} style={{ fontSize: 11, color: C.text, marginBottom: 6, lineHeight: 1.5 }}>{item}</div>
              ))}
            </div>
            <CompendiumTable
              columns={[
                { key: "turns", label: "Turnos" },
                { key: "pe", label: "PE acumulado" },
                { key: "master", label: "Base Mestre+" },
                { key: "mastery", label: "Base Maestria" },
                { key: "extra", label: "Efeito extra" },
                { key: "req", label: "Req." },
              ]}
              rows={ADVANCED_SYSTEMS.chaining.turns}
            />
          </Sect>

          <Sect title="Detectabilidade" color={C.gold}>
            <ResponsiveGrid minWidth={180}>
              {ADVANCED_SYSTEMS.chaining.detectability.map((item) => (
                <div key={item.stage} style={{ ...card, background: `${C.gold}0E`, borderColor: `${C.gold}33` }}>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, color: C.gold, marginBottom: 4 }}>{item.stage}</div>
                  <div style={{ fontSize: 11, color: C.text, lineHeight: 1.5 }}>{item.effect}</div>
                </div>
              ))}
            </ResponsiveGrid>
          </Sect>
        </div>
      ) : null}

      {section === "projects" ? (
        <div>
          <Sect title="Projetos Complexos" color={C.mente}>
            <CompendiumTable
              columns={[
                { key: "grade", label: "Grau", emphasis: () => C.mente },
                { key: "stages", label: "Etapas" },
                { key: "dt", label: "DT" },
                { key: "time", label: "Tempo" },
                { key: "req", label: "Req. minimo" },
                { key: "result", label: "Resultado" },
              ]}
              rows={ADVANCED_SYSTEMS.projects.tiers}
            />
          </Sect>

          <Sect title="Qualidade do Projeto" color={C.gold}>
            <ResponsiveGrid minWidth={220}>
              {ADVANCED_SYSTEMS.projects.quality.map((item) => (
                <div key={item.name} style={{ ...card, background: C.bg3 }}>
                  <div style={{ fontWeight: 700, color: C.gold, marginBottom: 4 }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>{item.trigger}</div>
                </div>
              ))}
            </ResponsiveGrid>
          </Sect>
        </div>
      ) : null}

      {section === "relics" ? (
        <div>
          <Sect title="Reliquias e Artefatos" color={C.gold}>
            <CompendiumTable
              columns={[
                { key: "tier", label: "Tier", emphasis: () => C.gold },
                { key: "pe", label: "PE" },
                { key: "req", label: "Req." },
                { key: "will", label: "Vontade?" },
              ]}
              rows={ADVANCED_SYSTEMS.relics.tiers}
            />
          </Sect>

          <Sect title="Reliquia com Vontade" color={C.alma}>
            <ResponsiveGrid minWidth={220}>
              {ADVANCED_SYSTEMS.relics.willNotes.map((item) => (
                <div key={item.name} style={{ ...card, background: `${C.alma}0E`, borderColor: `${C.alma}33` }}>
                  <div style={{ fontWeight: 700, color: C.alma, marginBottom: 4 }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: C.text, lineHeight: 1.5 }}>{item.effect}</div>
                </div>
              ))}
            </ResponsiveGrid>
          </Sect>
        </div>
      ) : null}
    </div>
  );
}

function TabArsenal() {
  const [filter, setFilter] = useState("");
  const [cat, setCat] = useState("cacl");
  const cats = [
    { id: "cacl", label: "CaC Leve" },
    { id: "cacm", label: "CaC Media" },
    { id: "cacp", label: "CaC Pesada" },
    { id: "dist", label: "Distancia" },
    { id: "armor", label: "Armaduras" },
    { id: "styles", label: "Estilos" },
  ];

  const normalizedFilter = normalizeReferenceSearch(filter);
  const weaponList = cat === "armor" ? ARMORS : WEAPONS.filter((weapon) => weapon.cat === cat);
  const shown = weaponList.filter((item) => matchesReferenceSearch([item.name, item.type || "", item.crit || ""], normalizedFilter));

  return (
    <div>
      <input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder={cat === "styles" ? "Buscar arma, estilo ou tecnica..." : "Buscar..."} style={{ marginBottom: 10 }} />
      <div className="chip-row" style={{ marginBottom: 8 }}>
        {cats.map((item) => {
          const active = cat === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCat(item.id)}
              style={{
                padding: "5px 12px",
                borderRadius: 20,
                whiteSpace: "nowrap",
                background: active ? `${C.corpo}22` : C.bg2,
                border: `1px solid ${active ? C.corpo : C.border}`,
                color: active ? C.corpo : C.muted,
                fontSize: 12,
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {cat === "styles" ? <StyleReferencePanel filter={filter} /> : null}

      {cat !== "styles" ? (
        <ResponsiveGrid minWidth={280}>
          {cat === "armor"
            ? shown.map((armor) => (
                <div key={armor.name} style={{ ...card, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{armor.name}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{armor.type} - {armor.pen}</div>
                  </div>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 700, color: C.corpo }}>RD {armor.rd}</div>
                </div>
              ))
            : shown.map((weapon) => (
                <div key={weapon.name} style={{ ...card }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4, gap: 10 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 1 }}>{weapon.name}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>
                        {weapon.type}
                        {weapon.range ? ` - ${weapon.range}` : ""}
                        {weapon.emp ? ` - ${weapon.emp}` : ""}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 19, fontWeight: 700, color: C.corpo }}>{weapon.dmg}</div>
                      <div style={{ fontSize: 10, color: C.muted }}>{weapon.act}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: C.goldWarm }}>Critico: {weapon.crit}</div>
                  {weapon.pen ? <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>Penalidade: {weapon.pen}</div> : null}
                </div>
              ))}
        </ResponsiveGrid>
      ) : null}

      {cat !== "styles" && shown.length === 0 ? <div style={{ textAlign: "center", color: C.muted, padding: 20 }}>Nenhum resultado para "{filter}"</div> : null}
    </div>
  );
}

function TabSistema() {
  const [sec, setSec] = useState("dt");
  const sections = [
    { id: "dt", label: "DTs" },
    { id: "conds", label: "Condicoes" },
    { id: "manif", label: "Manifestacoes" },
    { id: "acoes", label: "Acoes" },
    { id: "advanced", label: "Avancado" },
    { id: "builder", label: "Builder" },
  ];

  return (
    <div>
      <div className="chip-row" style={{ marginBottom: 8 }}>
        {sections.map((section) => {
          const active = sec === section.id;
          return (
            <button
              key={section.id}
              onClick={() => setSec(section.id)}
              style={{
                padding: "5px 12px",
                borderRadius: 20,
                whiteSpace: "nowrap",
                background: active ? `${C.gold}22` : C.bg2,
                border: `1px solid ${active ? C.gold : C.border}`,
                color: active ? C.gold : C.muted,
                fontSize: 12,
              }}
            >
              {section.label}
            </button>
          );
        })}
      </div>

      {sec === "dt" ? (
        <Sect title="Classes de Dificuldade">
          {DT_TABLE.map((item) => (
            <div key={item.dt} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 700, color: C.mente, width: 28, flexShrink: 0 }}>{item.dt}</div>
              <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{item.grau}</div>
              <div style={{ fontSize: 11, color: C.green, textAlign: "right", flexShrink: 0 }}>auto: {item.auto}</div>
            </div>
          ))}
          <div style={{ marginTop: 10, padding: "8px 10px", background: C.bg3, borderRadius: 6, fontSize: 11, color: C.muted }}>
            <strong style={{ color: C.gold }}>Critico:</strong> melhor dado = 6, confirma rolando novamente vs DT original.<br />
            <strong style={{ color: C.danger }}>Falha critica:</strong> melhor dado = 1 e falha gera complicacao narrativa.<br />
            <strong style={{ color: C.mente }}>Vantagem/Desvantagem:</strong> rola 1 dado extra e descarta o pior ou o melhor.
          </div>
        </Sect>
      ) : null}

      {sec === "conds" ? (
        <ResponsiveGrid minWidth={260}>
          {CONDS.map((condition) => (
            <div key={condition.id} style={{ ...card, background: `${condition.color}11`, borderLeft: `3px solid ${condition.color}` }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: condition.color, marginBottom: 2 }}>{condition.label}</div>
              <div style={{ fontSize: 12, color: C.text }}>{condition.desc}</div>
            </div>
          ))}
          <div style={{ ...card, background: "#6B728011", borderLeft: "3px solid #6B7280" }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: C.muted, marginBottom: 2 }}>Exaustao 1-4</div>
            <div style={{ fontSize: 12, color: C.text }}>1: -1. 2: -2 e PE maximo reduzido. 3: -3 e movimento reduzido. 4: inconsciente, PE zero.</div>
          </div>
        </ResponsiveGrid>
      ) : null}

      {sec === "manif" ? (
        <ResponsiveGrid>
          <Sect title="Tipos por KW">
            {MANIFESTATION_ACTIONS.map((item) => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                <span style={{ fontWeight: 600, color: item.color }}>{item.tierLabel}</span>
                <span style={{ color: C.muted }}>{item.rangeLabel}</span>
                <span style={{ color: C.text, fontSize: 11 }}>{`${item.short} - ${item.detail}`}</span>
              </div>
            ))}
          </Sect>

          <Sect title="Escala de Dano" className="section-span-2">
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, minWidth: 300 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "4px 5px", color: C.muted, borderBottom: `1px solid ${C.border}`, fontSize: 10 }}>Tier</th>
                    {DMG_COLS.map((column) => (
                      <th key={column} style={{ padding: "4px 3px", color: C.muted, borderBottom: `1px solid ${C.border}`, fontSize: 10, textAlign: "center" }}>{column}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DMG_ROWS.map((row, rowIndex) => (
                    <tr key={row.tier} style={{ background: rowIndex % 2 === 0 ? C.bg3 : "transparent" }}>
                      <td style={{ padding: "5px 5px", fontWeight: 600, color: C.alma, fontSize: 11 }}>{row.tier}</td>
                      {row.vals.map((value, valueIndex) => (
                        <td key={valueIndex} style={{ padding: "5px 3px", textAlign: "center", color: valueIndex === row.vals.length - 1 ? C.gold : valueIndex === 0 ? C.muted : C.text, fontWeight: valueIndex === row.vals.length - 1 ? 700 : 400, fontSize: 11 }}>
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 8 }}>KW define a complexidade da manifestacao. A intensidade e a escala de dano usam apenas a amplificacao extra em PE alem do KW.</div>
          </Sect>

          <Sect title="Vetor Indireto">
            <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>
              Manifestacoes nao agem diretamente sobre seres com Vontade. Cura direta exige efeito indireto como Regenerante, Totem ou alvos sem resistencia ativa.
            </div>
          </Sect>
        </ResponsiveGrid>
      ) : null}

      {sec === "acoes" ? (
        <Sect title="Acoes de Turno">
          {ACOES.map((action) => (
            <div key={action.sym} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ fontFamily: FONT_DISPLAY, width: 30, height: 30, background: `${C.gold}22`, border: `1px solid ${C.gold}44`, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: C.gold, flexShrink: 0 }}>
                {action.sym}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{action.name}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{action.desc}</div>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 10, padding: "8px 10px", background: C.bg3, borderRadius: 6, fontSize: 11, color: C.muted, lineHeight: 1.5 }}>
            No guia de estilos, muitas tecnicas usam <strong style={{ color: C.gold }}>m</strong> para acao menor e <strong style={{ color: C.gold }}>L</strong> para acao livre.
            O tracker legado do companion continua tratando a acao menor como <strong style={{ color: C.gold }}>u</strong> para manter compatibilidade com o resto do app.
          </div>
        </Sect>
      ) : null}

      {sec === "advanced" ? <AdvancedSystemsPanel /> : null}
      {sec === "builder" ? <ManifBuilder /> : null}
    </div>
  );
}

function ManifBuilder() {
  const [selectedElements, setSelectedElements] = useState([]);
  const [selectedForms, setSelectedForms] = useState([]);
  const [selectedProps, setSelectedProps] = useState([]);
  const [amp, setAmp] = useState(0);

  function toggleSelection(setter, item) {
    setter((currentList) => {
      const exists = currentList.some((entry) => entry.name === item.name);
      return exists ? currentList.filter((entry) => entry.name !== item.name) : [...currentList, item];
    });
  }

  const kw = [...selectedElements, ...selectedForms, ...selectedProps].reduce((total, item) => total + item.pe, 0);
  const keywordCount = getKeywordCount(selectedElements, selectedForms, selectedProps);
  const peTotal = getManifestationPeTotal(kw, amp);
  const actionMeta = getActionMeta(kw);
  const scaleBand = getScaleBand(amp);
  const previewTrack = getDamageTrackByTier("Esp.");
  const selectedSummary = [...selectedElements, ...selectedForms, ...selectedProps];

  return (
    <Sect title="Builder de Manifestacao" color={C.gold}>
      {[
        { label: "Elementos", data: ELEMENTOS, selected: selectedElements, setSelected: setSelectedElements, color: C.alma },
        { label: "Formas", data: FORMAS, selected: selectedForms, setSelected: setSelectedForms, color: C.mente },
        { label: "Propriedades", data: PROPS, selected: selectedProps, setSelected: setSelectedProps, color: C.gold },
      ].map((group) => (
        <div key={group.label} style={{ marginBottom: 14 }}>
          <Lbl>{group.label}</Lbl>
          <div className="chip-row" style={{ marginTop: 4 }}>
            {group.data.map((item) => {
              const active = group.selected.some((entry) => entry.name === item.name);
              return (
                <button
                  key={item.name}
                  onClick={() => toggleSelection(group.setSelected, item)}
                  style={{
                    padding: "4px 9px",
                    borderRadius: 6,
                    fontSize: 11,
                    background: active ? `${group.color}22` : C.bg3,
                    border: `1px solid ${active ? group.color : C.border}`,
                    color: active ? group.color : C.text,
                  }}
                >
                  {item.name} <span style={{ color: C.gold }}>{item.pe} KW</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div style={{ marginBottom: 14 }}>
        <Lbl>Amplificacao extra</Lbl>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
          <SmBtn onClick={() => setAmp((value) => Math.max(0, value - 1))}>-</SmBtn>
          <span style={{ fontWeight: 700, color: C.gold, width: 24, textAlign: "center" }}>{amp}</span>
          <SmBtn onClick={() => setAmp((value) => value + 1)}>+</SmBtn>
        </div>
      </div>

      <div style={{ ...card, borderColor: actionMeta.color, background: `${actionMeta.color}0D`, padding: 14 }}>
        <div style={{ display: "flex", gap: 14, marginBottom: 10, flexWrap: "wrap" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>Keywords</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 26, fontWeight: 700, color: C.mente, lineHeight: 1 }}>{keywordCount}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>KW</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 26, fontWeight: 700, color: C.alma, lineHeight: 1 }}>{kw}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>PE Total</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 26, fontWeight: 700, color: C.gold, lineHeight: 1 }}>{peTotal}</div>
          </div>
          <div style={{ flex: 1, textAlign: "right", paddingTop: 4 }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>Tipo de Acao</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 13, fontWeight: 700, color: actionMeta.color }}>{actionMeta.label}</div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>Faixa de intensidade: {scaleBand.label}</div>
          </div>
        </div>

        {selectedSummary.length ? (
          <div style={{ fontSize: 11, color: C.muted, borderTop: `1px solid ${C.border}`, paddingTop: 8, lineHeight: 1.7 }}>
            {selectedSummary.map((item) => `${item.name} (${item.pe} KW)`).join(" + ")}
            {amp > 0 ? ` + ${amp} Amplif.` : ""}
          </div>
        ) : (
          <div style={{ fontSize: 11, color: C.muted, borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>Selecione varios elementos, formas e propriedades para compor a manifestacao.</div>
        )}

        {selectedElements.length ? <div style={{ fontSize: 11, color: C.text, marginTop: 6 }}>Elementos: {selectedElements.map((item) => item.desc).join(" | ")}</div> : null}
        {selectedForms.length ? <div style={{ fontSize: 11, color: C.text, marginTop: 4 }}>Formas: {selectedForms.map((item) => item.desc).join(" | ")}</div> : null}
        {selectedProps.length ? <div style={{ fontSize: 11, color: C.text, marginTop: 4 }}>Props: {selectedProps.map((item) => item.desc).join(" | ")}</div> : null}
      </div>

      <div style={{ marginTop: 12 }}>
        <Lbl>Escala rapida por amplificacao</Lbl>
        <div className="chip-row" style={{ marginTop: 4 }}>
          {previewTrack.map((formula, index) => (
            <div
              key={`${formula}-${index}`}
              style={{
                flex: 1,
                minWidth: 74,
                padding: "6px 8px",
                borderRadius: 8,
                background: scaleBand.index === index ? `${C.alma}18` : C.bg3,
                border: `1px solid ${scaleBand.index === index ? C.alma : C.border}`,
              }}
            >
              <div style={{ fontSize: 9, color: C.muted, marginBottom: 3 }}>{AMP_LABELS[index]}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: scaleBand.index === index ? C.almaLight : C.text }}>{formula}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 10, color: C.muted, marginTop: 6 }}>Keywords e KW definem a forma e a complexidade. Amplificacao define a intensidade.</div>
      </div>

      <Sect title="Exemplos de Manifestacao" className="section-span-2" color={C.alma}>
        <ResponsiveGrid minWidth={220}>
          {MANIFESTATION_EXAMPLES.map((example) => (
            <div key={example.name} style={{ ...card, background: `${C.alma}0D`, borderColor: `${C.alma}33` }}>
              <div style={{ fontWeight: 700, color: C.alma, marginBottom: 4 }}>{example.name}</div>
              <div style={{ fontSize: 11, color: C.text, marginBottom: 6 }}>{example.summary}</div>
              <div style={{ fontSize: 10, color: C.muted }}>
                {example.keywords} keywords - KW {example.kw} - amp +{example.amp}
              </div>
            </div>
          ))}
        </ResponsiveGrid>
      </Sect>
    </Sect>
  );
}
