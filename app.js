// UnheaveN: ERA - Companion · app.js
// Ponto de entrada da aplicacao: composicao da UI + bootstrap do React.

const APP_TABS = [
  { id: "ficha", icon: "◈", label: "FICHA" },
  { id: "dados", icon: "◉", label: "DADOS" },
  { id: "combate", icon: "◆", label: "COMBATE" },
  { id: "arsenal", icon: "◇", label: "ARSENAL" },
  { id: "sistema", icon: "◎", label: "SISTEMA" },
];

const HEADER_RESOURCES = [
  { key: "hp", color: C.corpo, label: "HP" },
  { key: "sp", color: C.mente, label: "SP" },
  { key: "pe", color: C.alma, label: "PE" },
];

const STORAGE_KEY = "uh_char_v2";

function getMeterPercent(current, max) {
  if (max <= 0) return 0;
  return Math.max(0, Math.min(100, (current / max) * 100));
}

function hydrateCharacter(rawCharacter) {
  const parsed = rawCharacter ? JSON.parse(rawCharacter) : null;
  if (!parsed) return DEFAULT_CHAR;

  const parsedPericias = parsed.pericias || DEFAULT_PERICIAS;
  return {
    ...DEFAULT_CHAR,
    ...parsed,
    pericias: {
      ...DEFAULT_PERICIAS,
      ...parsedPericias,
    },
  };
}

function HeaderResource({ char, resource }) {
  const { key, color, label } = resource;
  const value = char[key];
  const percent = getMeterPercent(value.cur, value.max);

  return (
    <div style={{ width: 38, textAlign: "center" }}>
      <div style={{ fontSize: 9, color: C.muted, letterSpacing: 1 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: percent < 25 ? "#EF4444" : color }}>
        {value.cur}
      </div>
      <div style={{ height: 3, background: C.bg3, borderRadius: 2 }}>
        <div style={{ height: 3, width: `${percent}%`, background: color, borderRadius: 2, transition: "width 0.3s" }} />
      </div>
    </div>
  );
}

function AppTabButton({ activeTab, tab, onSelect }) {
  const isActive = activeTab === tab.id;

  return (
    <button
      onClick={() => onSelect(tab.id)}
      style={{
        flex: 1,
        padding: "8px 2px",
        background: isActive ? C.bg3 : "transparent",
        borderBottom: isActive ? `2px solid ${C.gold}` : "2px solid transparent",
        color: isActive ? C.gold : C.muted,
        fontFamily: "Georgia,serif",
        fontSize: 9,
        letterSpacing: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        transition: "all 0.15s",
      }}
    >
      <span style={{ fontSize: 14 }}>{tab.icon}</span>
      <span>{tab.label}</span>
    </button>
  );
}

function AppContent({ tab, char, upd }) {
  if (tab === "ficha") return <TabFicha char={char} upd={upd} />;
  if (tab === "dados") return <TabDados char={char} />;
  if (tab === "combate") return <TabCombate char={char} upd={upd} />;
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
      // Mantem o comportamento atual: falha de persistencia nao interrompe a app.
    }
  }, [char, loaded]);

  const upd = useCallback((nextValue) => {
    setChar((previousChar) => (
      typeof nextValue === "function"
        ? nextValue(previousChar)
        : { ...previousChar, ...nextValue }
    ));
  }, []);

  return (
    <div
      className="app-shell"
      style={{
        background: C.bg,
        color: C.text,
        fontFamily: "'Segoe UI',system-ui,sans-serif",
        maxWidth: 500,
        margin: "0 auto",
        minHeight: "100dvh",
      }}
    >
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, textarea, select {
          background: ${C.bg3}; color: ${C.text};
          border: 1px solid ${C.border}; border-radius: 4px;
          padding: 5px 8px; font-family: inherit; font-size: 13px;
          width: 100%; outline: none;
        }
        input:focus, textarea:focus { border-color: ${C.gold}; }
        button { cursor: pointer; border: none; font-family: inherit; }
        textarea { resize: none; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; }
        body { background: ${C.bg}; }
      `}</style>

      <div
        style={{
          background: C.bg2,
          borderBottom: `1px solid ${C.border}`,
          padding: "8px 14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontFamily: "Georgia,serif", fontSize: 9, color: C.gold, letterSpacing: 3, textTransform: "uppercase" }}>
            UnheaveN · ERA · Palimpsest
          </div>
          <div style={{ fontFamily: "Georgia,serif", fontSize: 15, fontWeight: 700, color: C.text, marginTop: 1 }}>
            {char.name || "—"}{" "}
            <span style={{ fontSize: 11, color: C.muted, fontFamily: "sans-serif" }}>Nv.{char.level}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {HEADER_RESOURCES.map((resource) => (
            <HeaderResource key={resource.key} char={char} resource={resource} />
          ))}
        </div>
      </div>

      <div style={{ display: "flex", background: C.bg2, borderBottom: `1px solid ${C.border}` }}>
        {APP_TABS.map((tabItem) => (
          <AppTabButton key={tabItem.id} activeTab={tab} tab={tabItem} onSelect={setTab} />
        ))}
      </div>

      <div style={{ padding: "10px 10px 80px" }}>
        <AppContent tab={tab} char={char} upd={upd} />
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);