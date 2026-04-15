const APP_TABS = [
  { id: "ficha", label: "FICHA", icon: "[]"},
  { id: "dados", label: "DADOS", icon: "d6" },
  { id: "combate", label: "COMBATE", icon: "ATK" },
  { id: "arsenal", label: "ARSENAL", icon: "EQP" },
  { id: "sistema", label: "SISTEMA", icon: "SYS" },
];

const HEADER_RESOURCES = [
  { key: "hp", color: C.corpo, label: "HP" },
  { key: "sp", color: C.mente, label: "SP" },
  { key: "pe", color: C.alma, label: "PE" },
];

const STORAGE_KEY = "uh_char_v2";

function hydrateCharacter(rawCharacter) {
  const parsed = rawCharacter ? JSON.parse(rawCharacter) : null;
  if (!parsed) return DEFAULT_CHAR;

  const level = clampNumber(Number(parsed.level) || 1, 1, LEVELS.length);
  const levelData = getCurrentLevelData(level);
  const merged = {
    ...DEFAULT_CHAR,
    ...parsed,
    level,
    pilares: { ...DEFAULT_CHAR.pilares, ...(parsed.pilares || {}) },
    subs: { ...DEFAULT_SUBS, ...(parsed.subs || {}) },
    pericias: { ...DEFAULT_PERICIAS, ...(parsed.pericias || {}) },
    condicoes: Array.isArray(parsed.condicoes) ? parsed.condicoes.filter((id) => getConditionById(id)) : [],
    effects: Array.isArray(parsed.effects) ? parsed.effects.map(normalizeEffect) : [],
  };

  return {
    ...merged,
    hp: {
      cur: clampNumber(
        parsed.hp && parsed.hp.cur != null ? Number(parsed.hp.cur) : DEFAULT_CHAR.hp.cur,
        0,
        levelData.hp
      ),
      max: levelData.hp,
    },
    sp: {
      cur: clampNumber(
        parsed.sp && parsed.sp.cur != null ? Number(parsed.sp.cur) : DEFAULT_CHAR.sp.cur,
        0,
        100
      ),
      max: 100,
    },
    pe: {
      cur: clampNumber(
        parsed.pe && parsed.pe.cur != null ? Number(parsed.pe.cur) : DEFAULT_CHAR.pe.cur,
        0,
        levelData.pe
      ),
      max: levelData.pe,
    },
  };
}

function HeaderResource({ char, resource }) {
  const value = char[resource.key];
  const percent = getMeterPercent(value.cur, value.max);

  return (
    <div style={{ minWidth: 52, textAlign: "center" }}>
      <div style={{ fontSize: 9, color: C.muted, letterSpacing: 1 }}>{resource.label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: percent < 25 ? "#EF4444" : resource.color }}>
        {value.cur}
      </div>
      <div style={{ height: 4, background: C.bg3, borderRadius: 999 }}>
        <div style={{ height: 4, width: `${percent}%`, background: resource.color, borderRadius: 999, transition: "width 0.3s" }} />
      </div>
    </div>
  );
}

function AppTabButton({ activeTab, tab, onSelect }) {
  const active = activeTab === tab.id;
  return (
    <button
      onClick={() => onSelect(tab.id)}
      style={{
        flex: 1,
        minWidth: 92,
        padding: "10px 6px",
        background: active ? C.bg3 : "transparent",
        borderBottom: active ? `2px solid ${C.gold}` : "2px solid transparent",
        color: active ? C.gold : C.muted,
        fontFamily: "Georgia,serif",
        fontSize: 10,
        letterSpacing: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
      }}
    >
      <span style={{ fontSize: 12 }}>{tab.icon}</span>
      <span>{tab.label}</span>
    </button>
  );
}

function AppContent({ tab, char, upd }) {
  if (tab === "ficha") return <TabFicha char={char} upd={upd} />;
  if (tab === "dados") return <TabDados char={char} />;
  if (tab === "combate") return <TabCombate char={char} />;
  if (tab === "arsenal") return <TabArsenal />;
  return <TabSistema />;
}

function App() {
  const [tab, setTab] = useState("ficha");
  const [char, setChar] = useState(DEFAULT_CHAR);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      setChar(hydrateCharacter(localStorage.getItem(STORAGE_KEY)));
    } catch (error) {
      setChar(DEFAULT_CHAR);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(char));
    } catch (error) {
      // Persistencia falhou, mas a app segue funcional.
    }
  }, [char, loaded]);

  const upd = useCallback((nextValue) => {
    setChar((currentChar) => (
      typeof nextValue === "function"
        ? nextValue(currentChar)
        : { ...currentChar, ...nextValue }
    ));
  }, []);

  return (
    <div className="app-shell">
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, textarea, select {
          background: ${C.bg3};
          color: ${C.text};
          border: 1px solid ${C.border};
          border-radius: 6px;
          padding: 7px 9px;
          font-family: inherit;
          font-size: 13px;
          width: 100%;
          outline: none;
        }
        input:focus, textarea:focus, select:focus { border-color: ${C.gold}; }
        button {
          cursor: pointer;
          border: none;
          font-family: inherit;
        }
        textarea { resize: vertical; min-height: 48px; }
        body { background: ${C.bg}; }
      `}</style>

      <div className="app-frame">
        <div
          style={{
            background: C.bg2,
            borderBottom: `1px solid ${C.border}`,
            padding: "12px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ fontFamily: "Georgia,serif", fontSize: 10, color: C.gold, letterSpacing: 3, textTransform: "uppercase" }}>
              UnheaveN - ERA - Palimpsest
            </div>
            <div style={{ fontFamily: "Georgia,serif", fontSize: 18, fontWeight: 700, color: C.text, marginTop: 2 }}>
              {char.name || "Personagem"}
              <span style={{ fontSize: 11, color: C.muted, fontFamily: "sans-serif", marginLeft: 8 }}>Nv.{char.level}</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            {HEADER_RESOURCES.map((resource) => (
              <HeaderResource key={resource.key} char={char} resource={resource} />
            ))}
          </div>
        </div>

        <div className="app-tabs">
          {APP_TABS.map((tabItem) => (
            <AppTabButton key={tabItem.id} activeTab={tab} tab={tabItem} onSelect={setTab} />
          ))}
        </div>

        <div className="app-content">
          <AppContent tab={tab} char={char} upd={upd} />
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
