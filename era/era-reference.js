/*
 * Audit refactor:
 * - Documents the ERA reference/search tab and keeps rendered rule data declarative.
 * - Preserves all labels, tables, formulas, and system terminology.
 * - Adds PDF-sourced KW, advanced manifestation, and combat pressure reference panels.
 * - Adds live-table quick search, condition filters, and session notes.
 */

/**
 * Normalizes reference text for accent-insensitive search.
 * @param {*} value
 * @returns {string}
 */
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

const CONDITION_FILTERS = [
  { id: "all", label: "Todas" },
  { id: "fisica", label: "Fisicas" },
  { id: "controle", label: "Controle" },
  { id: "mental", label: "Mental" },
  { id: "sensorial", label: "Sensorial" },
  { id: "vulnerabilidade", label: "Vulnerabilidade" },
  { id: "especial", label: "Magico/Especial" },
];

const QUICK_REFERENCE_FILTERS = [
  { id: "all", label: "Tudo" },
  { id: "testes", label: "Testes" },
  { id: "condicoes", label: "Condicoes" },
  { id: "combate", label: "Combate" },
  { id: "manifestacoes", label: "Manifestacoes" },
  { id: "recursos", label: "Recursos" },
];

/**
 * Resolves the broad table category for a condition without changing source data.
 * @param {object} condition
 * @returns {string}
 */
function getConditionCategory(condition) {
  const label = normalizeReferenceSearch(condition.label);
  if (/(imobilizado|paralisado|atordoado|caido|desarmado)/.test(label)) return "controle";
  if (/(assustado|apavorado|desorientado|enlouquecido|insano|entorpecido|drogado)/.test(label)) return "mental";
  if (/(cegueira|cego|surdo|silenciado|mudo)/.test(label)) return "sensorial";
  if (/(vulneravel|estado critico)/.test(label)) return "vulnerabilidade";
  if (/(amaldicoado|enfeiticado|dominado|charm|assombro)/.test(label)) return "especial";
  return "fisica";
}

/**
 * Builds one searchable quick-reference entry.
 * @param {string} category
 * @param {string} title
 * @param {string} detail
 * @param {string=} meta
 * @returns {object}
 */
function createQuickReferenceEntry(category, title, detail, meta = "") {
  return {
    category,
    title,
    detail,
    meta,
    search: normalizeReferenceSearch([category, title, detail, meta].join(" ")),
  };
}

/**
 * Builds a compact full-text index from the ERA rule tables already loaded.
 * @returns {object[]}
 */
function buildQuickReferenceIndex() {
  return [
    ...DT_TABLE.map((row) => createQuickReferenceEntry("testes", `DT ${row.dt} - ${row.grau}`, `${row.apt}: ${row.note}`)),
    ...APT_DIFFS.map((row) => createQuickReferenceEntry("testes", row.diff, row.effect, "Diferenca de APT")),
    createQuickReferenceEntry("testes", "Metodo de rolagem", "Role PLL dados d6, pegue o maior resultado e some PGE. Vantagem/desvantagem ajusta dados."),
    ...CONDS.map((condition) => createQuickReferenceEntry("condicoes", condition.label, condition.desc, CONDITION_FILTERS.find((item) => item.id === getConditionCategory(condition))?.label || "")),
    ...RECOVERY.map((row) => createQuickReferenceEntry("recursos", `Descanso - ${row.resource}`, row.value)),
    ...OVERDRAFT.map((row) => createQuickReferenceEntry("recursos", `Overdraft ${row.grade}`, `${row.limit}; ${row.exhaustion}; ${row.rest}`)),
    ...TRAUMAS.map((row) => createQuickReferenceEntry("recursos", `${row.group} - ${row.grade}`, `${row.trigger}: ${row.effect}`, "Trauma")),
    ...EXHAUSTION.map((row) => createQuickReferenceEntry("recursos", `Exaustao ${row.grade} - ${row.state}`, row.effect)),
    ...ACOES.map((row) => createQuickReferenceEntry("combate", `${row.sym} - ${row.name}`, row.desc, "Acao de turno")),
    ...COMBAT_SEQUENCE.map((row) => createQuickReferenceEntry("combate", `${row.step}. ${row.action}`, row.detail, "Sequencia de ataque")),
    ...DAMAGE_TYPE_RULES.map((row) => createQuickReferenceEntry("combate", row.type, `Pele nua: ${row.naked}; leve: ${row.light}; media: ${row.medium}; pesada: ${row.heavy}; critico: ${row.crit}`, "Tipo de dano")),
    ...COMBAT_PRESSURE_SYSTEM.states.map((row) => createQuickReferenceEntry("combate", row.state, `${row.hp}; ${row.defense}; ${row.damage}; ${row.extra}`, "Pressao")),
    ...KW_GUIDE.intensities.map((row) => createQuickReferenceEntry("manifestacoes", row.grade, `${row.pe}; minimo ${row.minTier}; ${row.effect}`, "Intensidade PE")),
    ...KW_GUIDE.bonus.map((row) => createQuickReferenceEntry("manifestacoes", `KW ${row.range}`, `${row.dice}; ${row.damage}; ${row.note}`, "Bonus KW")),
    ...MANIFESTATION_ADVANCED_REFERENCE.forms.map((row) => createQuickReferenceEntry("manifestacoes", row.name, `${row.pe} PE; ${row.req}; ${row.area}; ${row.note}`, row.tier)),
    ...MANIFESTATION_ADVANCED_REFERENCE.propertyBands.map((row) => createQuickReferenceEntry("manifestacoes", row.band, row.names, row.note)),
  ];
}

/**
 * Reads saved live-table notes from local storage.
 * @returns {object[]}
 */
function readSessionNotes() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SESSION_NOTES_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

/**
 * Persists live-table notes without interrupting play if storage is unavailable.
 * @param {object[]} notes
 * @returns {void}
 */
function writeSessionNotes(notes) {
  try {
    localStorage.setItem(SESSION_NOTES_STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    // Notes are a convenience layer; blocked storage should not break the table tools.
  }
}

/**
 * Renders the full-text rule search requested for quick table lookup.
 * @returns {JSX.Element}
 */
function QuickReferencePanel() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const entries = useMemo(() => buildQuickReferenceIndex(), []);
  const normalizedQuery = normalizeReferenceSearch(query);
  const shownEntries = entries
    .filter((entry) => category === "all" || entry.category === category)
    .filter((entry) => !normalizedQuery || entry.search.includes(normalizedQuery))
    .slice(0, 80);

  return (
    <div>
      <Sect title="Busca Rapida de Regras" color={C.gold}>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar DT, condicao, KW, arma, pressao..." style={{ marginBottom: 10 }} />
        <div className="chip-row" style={{ marginBottom: 10 }}>
          {QUICK_REFERENCE_FILTERS.map((item) => {
            const active = category === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCategory(item.id)}
                style={{
                  padding: "5px 12px",
                  borderRadius: 20,
                  background: active ? `${C.gold}22` : C.bg2,
                  border: `1px solid ${active ? C.gold : C.border}`,
                  color: active ? C.gold : C.muted,
                  fontSize: 12,
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>
        <ResponsiveGrid minWidth={260}>
          {shownEntries.map((entry, index) => (
            <div key={`${entry.category}-${entry.title}-${index}`} style={{ ...card, background: C.bg3, borderLeft: `3px solid ${entry.category === "manifestacoes" ? C.alma : entry.category === "combate" ? C.corpo : entry.category === "condicoes" ? C.gold : C.mente}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: C.text }}>{entry.title}</div>
                <div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>{entry.category}</div>
              </div>
              <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>{entry.detail}</div>
              {entry.meta ? <div style={{ fontSize: 10, color: C.gold, marginTop: 6 }}>{entry.meta}</div> : null}
            </div>
          ))}
        </ResponsiveGrid>
        {shownEntries.length === 0 ? <div style={{ textAlign: "center", color: C.muted, padding: 20 }}>Nada encontrado para "{query}".</div> : null}
      </Sect>
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

/**
 * Renders the imported PDF source list as a small provenance table.
 * @returns {JSX.Element|null}
 */
function SourceGuidesPanel() {
  if (!PDF_SOURCE_GUIDES.length) return null;

  return (
    <Sect title="Guias adicionados" color={C.gold}>
      <CompendiumTable
        columns={[
          { key: "name", label: "Arquivo", emphasis: () => C.gold },
          { key: "scope", label: "Escopo" },
          { key: "status", label: "Entrou no ERA" },
        ]}
        rows={PDF_SOURCE_GUIDES}
      />
    </Sect>
  );
}

/**
 * Renders KW construction, bonus, damage and healing references.
 * @returns {JSX.Element}
 */
function KwReferencePanel() {
  return (
    <ResponsiveGrid>
      <SourceGuidesPanel />

      <Sect title="Principios KW" color={C.alma}>
        {KW_GUIDE.principles.map((item) => (
          <div key={item} style={{ fontSize: 11, color: C.text, lineHeight: 1.55, marginBottom: 6 }}>{item}</div>
        ))}
      </Sect>

      <Sect title="Fluxo de Criacao" color={C.mente} className="section-span-2">
        <CompendiumTable
          columns={[
            { key: "step", label: "#" },
            { key: "action", label: "Passo", emphasis: () => C.mente },
            { key: "detail", label: "Detalhe" },
          ]}
          rows={KW_GUIDE.flow}
        />
      </Sect>

      <Sect title="Amplificacao e Intensidade" color={C.gold} className="section-span-2">
        <CompendiumTable
          columns={[
            { key: "grade", label: "Grau", emphasis: () => C.gold },
            { key: "pe", label: "PE" },
            { key: "minTier", label: "Tier min." },
            { key: "effect", label: "Efeito narrativo" },
          ]}
          rows={KW_GUIDE.intensities}
        />
      </Sect>

      <Sect title="Tipos por PE Total" color={C.mente} className="section-span-2">
        <CompendiumTable
          columns={[
            { key: "type", label: "Tipo", emphasis: () => C.mente },
            { key: "peTotal", label: "PE Total" },
            { key: "action", label: "Acao" },
            { key: "note", label: "Observacao" },
          ]}
          rows={KW_GUIDE.actionTypes}
        />
      </Sect>

      <Sect title="Bonus de Dados por KW Total" color={C.gold} className="section-span-2">
        <CompendiumTable
          columns={[
            { key: "range", label: "KW" },
            { key: "dice", label: "Dados", emphasis: () => C.gold },
            { key: "damage", label: "Referencia" },
            { key: "note", label: "Nota" },
          ]}
          rows={KW_GUIDE.bonus}
        />
      </Sect>

      <Sect title="Escala de Dano Canonica" color={C.corpo} className="section-span-2">
        <CompendiumTable
          columns={[{ key: "tier", label: "Tier" }, ...DMG_COLS.map((column, index) => ({ key: `v${index}`, label: column }))]}
          rows={DMG_ROWS.map((row) => ({
            tier: row.tier,
            v0: row.vals[0],
            v1: row.vals[1],
            v2: row.vals[2],
            v3: row.vals[3],
            v4: row.vals[4],
            v5: row.vals[5],
          }))}
        />
      </Sect>

      <Sect title="Escala de Cura" color={C.green} className="section-span-2">
        <CompendiumTable
          columns={[
            { key: "tier", label: "Tier" },
            { key: "amp0", label: "+0" },
            { key: "amp1", label: "+1-2 PE" },
            { key: "amp2", label: "+3-5 PE" },
            { key: "amp3", label: "+6+ PE" },
          ]}
          rows={KW_GUIDE.healingScale}
        />
        <div style={{ fontSize: 10, color: C.muted, marginTop: 8 }}>
          Cura direta de HP em seres com Vontade exige Vetor Indireto. Bonus KW na cura segue a mesma regra do dano.
        </div>
      </Sect>

      <Sect title="Acumulo de Keywords" color={C.alma} className="section-span-2">
        <CompendiumTable
          columns={[
            { key: "case", label: "Situacao", emphasis: () => C.alma },
            { key: "rule", label: "Regra" },
            { key: "example", label: "Exemplo" },
          ]}
          rows={KW_GUIDE.stacking}
        />
      </Sect>
    </ResponsiveGrid>
  );
}

/**
 * Renders advanced manifestation forms, properties, conflicts and synergies.
 * @returns {JSX.Element}
 */
function ManifestationAdvancedPanel() {
  const [section, setSection] = useState("forms");
  const sections = [
    { id: "forms", label: "Formas" },
    { id: "props", label: "Props" },
    { id: "req", label: "Req." },
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

      {section === "forms" ? (
        <ResponsiveGrid>
          <Sect title="Formas de Manifestacao" color={C.alma} className="section-span-2">
            <CompendiumTable
              columns={[
                { key: "tier", label: "Tier" },
                { key: "name", label: "Forma", emphasis: () => C.alma },
                { key: "pe", label: "PE" },
                { key: "req", label: "Req." },
                { key: "area", label: "Area/alcance" },
                { key: "note", label: "Nota" },
              ]}
              rows={MANIFESTATION_ADVANCED_REFERENCE.forms}
            />
          </Sect>

          <Sect title="Armas Elementais" color={C.corpo} className="section-span-2">
            <CompendiumTable
              columns={[
                { key: "name", label: "Forma", emphasis: () => C.corpo },
                { key: "pe", label: "PE" },
                { key: "req", label: "Req." },
                { key: "damage", label: "Dano" },
                { key: "range", label: "Alcance" },
                { key: "note", label: "Nota" },
              ]}
              rows={MANIFESTATION_ADVANCED_REFERENCE.elementalWeapons}
            />
          </Sect>
        </ResponsiveGrid>
      ) : null}

      {section === "props" ? (
        <ResponsiveGrid>
          <Sect title="Bandas de Propriedades" color={C.gold} className="section-span-2">
            <CompendiumTable
              columns={[
                { key: "band", label: "Faixa", emphasis: () => C.gold },
                { key: "names", label: "Propriedades" },
                { key: "note", label: "Uso" },
              ]}
              rows={MANIFESTATION_ADVANCED_REFERENCE.propertyBands}
            />
          </Sect>

          <Sect title="Conflitos" color={C.corpo}>
            <CompendiumTable
              columns={[
                { key: "combo", label: "Combo" },
                { key: "reason", label: "Motivo" },
                { key: "alternative", label: "Alternativa" },
              ]}
              rows={MANIFESTATION_ADVANCED_REFERENCE.conflicts}
            />
          </Sect>

          <Sect title="Sinergias (-1 PE total)" color={C.green}>
            <CompendiumTable
              columns={[
                { key: "combo", label: "Combo" },
                { key: "condition", label: "Condicao" },
                { key: "effect", label: "Efeito" },
              ]}
              rows={MANIFESTATION_ADVANCED_REFERENCE.synergies}
            />
          </Sect>
        </ResponsiveGrid>
      ) : null}

      {section === "req" ? (
        <ResponsiveGrid>
          <Sect title="Pre-requisitos por Faixa" color={C.mente} className="section-span-2">
            <CompendiumTable
              columns={[
                { key: "band", label: "Faixa", emphasis: () => C.mente },
                { key: "req", label: "Req. minimo" },
                { key: "capacity", label: "Capacidades" },
              ]}
              rows={MANIFESTATION_ADVANCED_REFERENCE.prerequisites}
            />
          </Sect>

          <Sect title="Alma e Desbloqueios" color={C.alma} className="section-span-2">
            <CompendiumTable
              columns={[
                { key: "soul", label: "Alma" },
                { key: "unlock", label: "Desbloqueio", emphasis: () => C.alma },
                { key: "note", label: "Observacao" },
              ]}
              rows={MANIFESTATION_ADVANCED_REFERENCE.soulUnlocks}
            />
          </Sect>
        </ResponsiveGrid>
      ) : null}
    </div>
  );
}

/**
 * Renders the combat pressure expansion and sniper threshold tables.
 * @returns {JSX.Element}
 */
function CombatPressurePanel() {
  return (
    <ResponsiveGrid>
      <Sect title="Estados de Pressao" color={C.corpo} className="section-span-2">
        <CompendiumTable
          columns={[
            { key: "state", label: "Estado", emphasis: () => C.corpo },
            { key: "hp", label: "HP" },
            { key: "defense", label: "Defesa" },
            { key: "damage", label: "Dano recebido" },
            { key: "extra", label: "Extra" },
          ]}
          rows={COMBAT_PRESSURE_SYSTEM.states}
        />
      </Sect>

      <Sect title="Dano Contextual" color={C.gold} className="section-span-2">
        <CompendiumTable
          columns={[
            { key: "source", label: "Fonte", emphasis: () => C.gold },
            { key: "effect", label: "Efeito" },
          ]}
          rows={COMBAT_PRESSURE_SYSTEM.damageSources}
        />
      </Sect>

      <Sect title="Criticos por Estado" color={C.alma}>
        <CompendiumTable columns={[{ key: "state", label: "Estado" }, { key: "effect", label: "Efeito" }]} rows={COMBAT_PRESSURE_SYSTEM.criticalByState} />
      </Sect>

      <Sect title="Execucao" color={C.danger}>
        {COMBAT_PRESSURE_SYSTEM.execution.map((item) => (
          <div key={item} style={{ fontSize: 11, color: C.text, lineHeight: 1.55, marginBottom: 6 }}>{item}</div>
        ))}
      </Sect>

      <Sect title="Sniper e Mira" color={C.mente} className="section-span-2">
        <CompendiumTable
          columns={[
            { key: "aim", label: "Mira", emphasis: () => C.mente },
            { key: "intact", label: "Intacto" },
            { key: "wounded", label: "Ferido" },
            { key: "critical", label: "Critico" },
          ]}
          rows={COMBAT_PRESSURE_SYSTEM.sniperAim}
        />
      </Sect>

      <Sect title="Sinergias de Estado" color={C.green}>
        <CompendiumTable columns={[{ key: "combo", label: "Combo" }, { key: "effect", label: "Efeito" }]} rows={COMBAT_PRESSURE_SYSTEM.synergies} />
      </Sect>

      <Sect title="Funcoes dos Estilos" color={C.gold}>
        <CompendiumTable columns={[{ key: "role", label: "Funcao" }, { key: "styles", label: "Estilos" }, { key: "goal", label: "Objetivo" }]} rows={COMBAT_PRESSURE_SYSTEM.styleRoles} />
      </Sect>
    </ResponsiveGrid>
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
                { key: "mastery", label: "Base Lenda" },
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

function TabSessao({ char }) {
  const [notes, setNotes] = useState(() => readSessionNotes());
  const [draft, setDraft] = useState("");
  const [tags, setTags] = useState("");
  const [filterTag, setFilterTag] = useState("all");

  useEffect(() => {
    writeSessionNotes(notes);
  }, [notes]);

  /**
   * Adds a timestamped session note.
   * @returns {void}
   */
  function addNote() {
    const text = draft.trim();
    if (!text) return;

    const noteTags = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 6);

    setNotes((current) => [
      {
        id: `note-${Date.now()}`,
        text,
        tags: noteTags,
        character: char && char.name ? char.name : "Mesa",
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
    setDraft("");
  }

  /**
   * Removes one saved session note.
   * @param {string} noteId
   * @returns {void}
   */
  function removeNote(noteId) {
    setNotes((current) => current.filter((note) => note.id !== noteId));
  }

  const tagList = Array.from(new Set(notes.flatMap((note) => note.tags || []))).sort((a, b) => a.localeCompare(b));
  const visibleNotes = filterTag === "all" ? notes : notes.filter((note) => (note.tags || []).includes(filterTag));

  return (
    <div className="desktop-split">
      <Sect title="Notas de Sessao" color={C.gold}>
        <Lbl>Registro rapido</Lbl>
        <textarea
          rows={8}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Cena, NPC, pista, item, decisao da mesa..."
          style={{ minHeight: 160, marginBottom: 10 }}
        />
        <Lbl>Tags</Lbl>
        <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="npc, local, item, pista..." style={{ marginBottom: 10 }} />
        <button
          onClick={addNote}
          style={{
            width: "100%",
            minHeight: 44,
            borderRadius: 8,
            background: `${C.gold}1A`,
            border: `1px solid ${C.gold}`,
            color: C.gold,
            fontWeight: 700,
          }}
        >
          Salvar nota com timestamp
        </button>
      </Sect>

      <Sect title="Historico da Mesa" color={C.mente}>
        <div className="chip-row" style={{ marginBottom: 10 }}>
          {[{ id: "all", label: "Todas" }, ...tagList.map((tag) => ({ id: tag, label: tag }))].map((item) => {
            const active = filterTag === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setFilterTag(item.id)}
                style={{
                  padding: "5px 12px",
                  borderRadius: 20,
                  background: active ? `${C.mente}22` : C.bg2,
                  border: `1px solid ${active ? C.mente : C.border}`,
                  color: active ? C.mente : C.muted,
                  fontSize: 12,
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {visibleNotes.map((note) => {
            const date = new Date(note.createdAt);
            const timeLabel = Number.isNaN(date.getTime())
              ? "sem data"
              : date.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

            return (
              <div key={note.id} style={{ ...card, background: C.bg3 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                  <div style={{ fontSize: 10, color: C.gold, fontFamily: FONT_SYSTEM }}>{timeLabel} · {note.character}</div>
                  <button
                    onClick={() => removeNote(note.id)}
                    aria-label="Excluir nota"
                    style={{ minWidth: 44, minHeight: 44, borderRadius: 6, background: `${C.corpo}16`, border: `1px solid ${C.corpo}55`, color: C.corpo, fontSize: 11 }}
                  >
                    X
                  </button>
                </div>
                <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{note.text}</div>
                {note.tags && note.tags.length ? (
                  <div className="chip-row" style={{ marginTop: 8 }}>
                    {note.tags.map((tag) => (
                      <span key={tag} style={{ padding: "3px 8px", borderRadius: 999, background: `${C.mente}14`, border: `1px solid ${C.mente}33`, color: C.mente, fontSize: 10 }}>{tag}</span>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
          {visibleNotes.length === 0 ? <div style={{ textAlign: "center", color: C.muted, padding: 20 }}>Nenhuma nota salva neste filtro.</div> : null}
        </div>
      </Sect>
    </div>
  );
}

function TabSistema() {
  const [sec, setSec] = useState("base");
  const [conditionCategory, setConditionCategory] = useState("all");
  const [conditionQuery, setConditionQuery] = useState("");
  const sections = [
    { id: "busca", label: "Busca" },
    { id: "base", label: "Base" },
    { id: "recursos", label: "Recursos" },
    { id: "conds", label: "Condicoes" },
    { id: "combate", label: "Combate" },
    { id: "pressao", label: "Pressao" },
    { id: "dano", label: "Dano" },
    { id: "manif", label: "Manifestacoes" },
    { id: "kw", label: "KW" },
    { id: "manif-adv", label: "Manif. Avanc." },
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

      {sec === "busca" ? <QuickReferencePanel /> : null}

      {sec === "base" ? (
        <ResponsiveGrid>
          <Sect title="Pilares" color={C.gold}>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>
              Base: PH 1, MD 1, SL 0. Nivel 1 recebe +2 pontos livres; niveis impares depois disso recebem +1. Nenhum Pilar passa de 5.
            </div>
            <ResponsiveGrid minWidth={180}>
              {Object.entries(PILARS).map(([pillarId, pillar]) => (
                <div key={pillarId} style={{ ...card, background: `${pillar.color}10`, borderColor: `${pillar.color}33` }}>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 700, color: pillar.color }}>{pillar.abbr}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{pillar.label}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 5 }}>
                    {pillar.subs.map((subId) => `${SUBS[subId].abbr} ${SUBS[subId].label}`).join(" | ")}
                  </div>
                </div>
              ))}
            </ResponsiveGrid>
          </Sect>

          <Sect title="Atributos e APT" color={C.mente}>
            <CompendiumTable
              columns={[
                { key: "abbr", label: "Cod." },
                { key: "name", label: "Atributo" },
                { key: "pillar", label: "Pilar" },
                { key: "desc", label: "Uso" },
              ]}
              rows={Object.entries(SUBS).map(([subId, sub]) => ({
                abbr: sub.abbr,
                name: sub.label,
                pillar: PILARS[SUB_TO_PILAR[subId]].abbr,
                desc: sub.desc,
              }))}
            />
            <div style={{ marginTop: 10, fontSize: 11, color: C.muted, lineHeight: 1.6 }}>
              Cada nivel concede +2 pontos livres de Atributo. Cada ponto investido em um Pilar concede +3 pontos para distribuir nos Atributos da arvore daquele Pilar. PGI vai de +0 a +3; ao passar de +3, volta para +0 e o APT sobe.
            </div>
          </Sect>

          <Sect title="Rolagem e Dificuldade" color={C.alma} className="section-span-2">
            <div style={{ ...card, background: C.bg3, marginBottom: 10, fontSize: 12, color: C.text, lineHeight: 1.7 }}>
              Role <strong style={{ color: C.gold }}>PLL dados d6</strong>, pegue o maior resultado e some o <strong style={{ color: C.gold }}>PGE</strong>. PGE = PGI + Condicoes + Skills + outros modificadores. Vantagem rola +1 dado e descarta o pior; Desvantagem rola +1 dado e descarta o melhor.
            </div>
            <ResponsiveGrid minWidth={220}>
              <CompendiumTable
                columns={[
                  { key: "dt", label: "DT" },
                  { key: "grau", label: "Grau" },
                  { key: "apt", label: "APT ref." },
                  { key: "note", label: "Nota" },
                ]}
                rows={DT_TABLE}
              />
              <CompendiumTable
                columns={[
                  { key: "diff", label: "Diferenca" },
                  { key: "effect", label: "Efeito" },
                ]}
                rows={APT_DIFFS}
              />
            </ResponsiveGrid>
          </Sect>

          <Sect title="Pericias" color={C.gold} className="section-span-2">
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>
              Pericias usam PGI/APT como Atributos. A acao define qual Atributo e rolado; a Pericia soma ao PGE quando aplicavel. Nivel 1 concede 11 pontos; niveis seguintes concedem +3.
            </div>
            <ResponsiveGrid minWidth={220}>
              {PERICIA_GROUPS.map((group) => (
                <div key={group.id} style={{ ...card, background: `${group.color}0D`, borderColor: `${group.color}33` }}>
                  <div style={{ fontWeight: 700, color: group.color, marginBottom: 6 }}>{group.label}</div>
                  <div style={{ fontSize: 11, color: C.text, lineHeight: 1.7 }}>
                    {PERICIAS_LIST.filter((pericia) => pericia.category === group.id).map((pericia) => pericia.label).join(" | ")}
                  </div>
                </div>
              ))}
            </ResponsiveGrid>
          </Sect>
        </ResponsiveGrid>
      ) : null}

      {sec === "recursos" ? (
        <ResponsiveGrid>
          <Sect title="HP, SP e PE" color={C.corpo}>
            <CompendiumTable
              columns={[
                { key: "l", label: "Nivel" },
                { key: "hp", label: "HP" },
                { key: "sp", label: "SP" },
                { key: "pe", label: "PE" },
              ]}
              rows={LEVELS}
            />
          </Sect>
          <Sect title="Descanso Longo" color={C.green}>
            <CompendiumTable columns={[{ key: "resource", label: "Recurso" }, { key: "value", label: "Recuperacao" }]} rows={RECOVERY} />
          </Sect>
          <Sect title="Overdraft" color={C.alma} className="section-span-2">
            <CompendiumTable
              columns={[
                { key: "grade", label: "Grau" },
                { key: "limit", label: "Limite" },
                { key: "exhaustion", label: "Exaustao" },
                { key: "rest", label: "Descanso" },
              ]}
              rows={OVERDRAFT}
            />
          </Sect>
          <Sect title="Traumas" color={C.gold} className="section-span-2">
            <CompendiumTable
              columns={[
                { key: "group", label: "Tipo" },
                { key: "grade", label: "Grau" },
                { key: "trigger", label: "Gatilho" },
                { key: "effect", label: "Efeito" },
              ]}
              rows={TRAUMAS}
            />
          </Sect>
          <Sect title="Exaustao" color={C.muted}>
            <CompendiumTable columns={[{ key: "grade", label: "Grau" }, { key: "state", label: "Estado" }, { key: "effect", label: "Efeito" }]} rows={EXHAUSTION} />
          </Sect>
          <Sect title="Perda de Sanidade" color={C.mente}>
            <CompendiumTable columns={[{ key: "source", label: "Fonte" }, { key: "loss", label: "Perda" }, { key: "note", label: "Nota" }]} rows={SANITY_LOSS} />
          </Sect>
        </ResponsiveGrid>
      ) : null}

      {sec === "conds" ? (
        <div>
          <input value={conditionQuery} onChange={(event) => setConditionQuery(event.target.value)} placeholder="Filtrar condicoes..." style={{ marginBottom: 10 }} />
          <div className="chip-row" style={{ marginBottom: 10 }}>
            {CONDITION_FILTERS.map((item) => {
              const active = conditionCategory === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setConditionCategory(item.id)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 20,
                    background: active ? `${C.gold}22` : C.bg2,
                    border: `1px solid ${active ? C.gold : C.border}`,
                    color: active ? C.gold : C.muted,
                    fontSize: 12,
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
          <ResponsiveGrid minWidth={260}>
            {CONDS
              .filter((condition) => conditionCategory === "all" || getConditionCategory(condition) === conditionCategory)
              .filter((condition) => !conditionQuery || matchesReferenceSearch([condition.label, condition.desc], normalizeReferenceSearch(conditionQuery)))
              .map((condition) => (
                <div key={condition.id} style={{ ...card, background: `${condition.color}11`, borderLeft: `3px solid ${condition.color}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 2 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: condition.color }}>{condition.label}</div>
                    <div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>
                      {CONDITION_FILTERS.find((item) => item.id === getConditionCategory(condition))?.label || ""}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: C.text }}>{condition.desc}</div>
                </div>
              ))}
          </ResponsiveGrid>
        </div>
      ) : null}

      {sec === "combate" ? (
        <ResponsiveGrid>
          <Sect title="Acoes de Turno" color={C.gold}>
            {ACOES.map((action) => (
              <div key={action.sym} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontFamily: FONT_DISPLAY, width: 32, height: 32, background: `${C.gold}22`, border: `1px solid ${C.gold}44`, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: C.gold, flexShrink: 0 }}>
                  {action.sym}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{action.name}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{action.desc}</div>
                </div>
              </div>
            ))}
            <div style={{ marginTop: 10, fontSize: 11, color: C.muted }}>A Acao Maior pode virar duas Acoes Menores. O Movimento pode ser dividido.</div>
          </Sect>
          <Sect title="Sequencia de Ataque" color={C.corpo}>
            <CompendiumTable columns={[{ key: "step", label: "#" }, { key: "action", label: "Acao" }, { key: "detail", label: "Detalhe" }]} rows={COMBAT_SEQUENCE} />
            <div style={{ fontSize: 10, color: C.muted, marginTop: 8 }}>PGI nao soma no dano fisico; dano fisico usa o dano bruto da arma, rolado 2x, pegando o melhor.</div>
          </Sect>
          <Sect title="Reacoes" color={C.mente} className="section-span-2">
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>Ao ser atacado, escolha uma reacao. Nao e possivel combinar. So e possivel reagir se perceber o ataque.</div>
            <ResponsiveGrid minWidth={320}>
              <div>
                <div style={{ fontWeight: 700, color: C.mente, marginBottom: 6 }}>Desviar</div>
                <CompendiumTable columns={[{ key: "margin", label: "Margem" }, { key: "result", label: "Resultado" }, { key: "effect", label: "Efeito" }]} rows={DODGE_REACTIONS} />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: C.gold, marginBottom: 6 }}>Aparar</div>
                <CompendiumTable columns={[{ key: "margin", label: "Margem" }, { key: "result", label: "Resultado" }, { key: "effect", label: "Efeito" }]} rows={PARRY_REACTIONS} />
              </div>
            </ResponsiveGrid>
            <div style={{ ...card, background: C.bg3, marginTop: 10, fontSize: 11, color: C.muted, lineHeight: 1.6 }}>
              Bloquear aceita o impacto e rola CON + bonus do item; o resultado e dano mitigado. Armas pesadas somam CON ao dano mitigado em aparadas. Peso acima desloca margem +1; peso abaixo desloca -1; dois pesos abaixo falha automaticamente.
            </div>
          </Sect>
          <Sect title="Manobras e Posicionamento" color={C.alma} className="section-span-2">
            <ResponsiveGrid minWidth={320}>
              <CompendiumTable columns={[{ key: "name", label: "Manobra" }, { key: "cost", label: "Custo" }, { key: "test", label: "Teste" }, { key: "effect", label: "Efeito" }]} rows={CONTROL_MANEUVERS} />
              <CompendiumTable columns={[{ key: "name", label: "Posicao" }, { key: "effect", label: "Efeito" }, { key: "method", label: "Como obter" }]} rows={POSITIONING_RULES} />
            </ResponsiveGrid>
          </Sect>
        </ResponsiveGrid>
      ) : null}

      {sec === "pressao" ? <CombatPressurePanel /> : null}

      {sec === "dano" ? (
        <ResponsiveGrid>
          <Sect title="Tipos de Dano Fisico" color={C.corpo} className="section-span-2">
            <CompendiumTable
              columns={[
                { key: "type", label: "Tipo" },
                { key: "naked", label: "Pele Nua" },
                { key: "light", label: "Leve" },
                { key: "medium", label: "Media" },
                { key: "heavy", label: "Pesada" },
                { key: "crit", label: "Critico" },
              ]}
              rows={DAMAGE_TYPE_RULES}
            />
          </Sect>
          <Sect title="Criticos e Falhas" color={C.gold}>
            <div style={{ fontSize: 12, color: C.text, lineHeight: 1.7 }}>
              Ameaca: melhor dado = 6. Role novamente; se atingir a DT original, critico confirmado. Critico confirmado causa dano maximo automatico e aplica o efeito critico da arma. Em cenas climaticas, role dano 2x. Falha critica: melhor dado = 1 + falha, com complicacao narrativa proporcional.
            </div>
          </Sect>
          <Sect title="Rolagem de Sorte" color={C.green}>
            <CompendiumTable columns={[{ key: "roll", label: "1d10" }, { key: "result", label: "Resultado" }, { key: "effect", label: "Efeito" }]} rows={LUCK_ROLL} />
          </Sect>
        </ResponsiveGrid>
      ) : null}

      {sec === "manif" ? (
        <ResponsiveGrid>
          <Sect title="Tipos por KW">
            {MANIFESTATION_ACTIONS.map((item) => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "7px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                <span style={{ fontWeight: 600, color: item.color }}>{item.tierLabel}</span>
                <span style={{ color: C.muted }}>{item.rangeLabel}</span>
                <span style={{ color: C.text, fontSize: 11 }}>{`${item.short} - ${item.detail}`}</span>
              </div>
            ))}
          </Sect>
          <Sect title="Escala de Dano" className="section-span-2">
            <CompendiumTable
              columns={[{ key: "tier", label: "Tier" }, ...DMG_COLS.map((column, index) => ({ key: `v${index}`, label: column }))]}
              rows={DMG_ROWS.map((row) => ({
                tier: row.tier,
                v0: row.vals[0],
                v1: row.vals[1],
                v2: row.vals[2],
                v3: row.vals[3],
                v4: row.vals[4],
                v5: row.vals[5],
              }))}
            />
            <div style={{ fontSize: 10, color: C.muted, marginTop: 8 }}>KW define a complexidade. Amplificacao extra em PE define a intensidade.</div>
          </Sect>
          <Sect title="Vetor Indireto">
            <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>
              Manifestacoes nao agem diretamente sobre seres com Vontade. Cura direta exige efeito indireto como Regenerante, Totem ou alvos sem resistencia ativa.
            </div>
          </Sect>
        </ResponsiveGrid>
      ) : null}

      {sec === "kw" ? <KwReferencePanel /> : null}
      {sec === "manif-adv" ? <ManifestationAdvancedPanel /> : null}
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
  const previewTrack = getDamageTrackByTier("Especialista");
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
