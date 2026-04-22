/*
 * Responsibility: orchestrate the ERA shell, active profile state and top-level rendering.
 * Exports: App.
 */

function App() {
  const [tab, setTab] = useState("ficha");
  const [profilesState, setProfilesState] = useState({ activeId: null, profiles: [] });
  const [loaded, setLoaded] = useState(false);
  const [showVersionNotice, setShowVersionNotice] = useState(false);

  useEffect(() => {
    const bootState = loadEraAppBootState();
    setProfilesState(bootState.profilesState);
    setShowVersionNotice(bootState.showVersionNotice);
    setLoaded(true);
  }, []);

  const activeProfile = profilesState.profiles.find((profile) => profile.id === profilesState.activeId) || profilesState.profiles[0];
  const char = activeProfile ? activeProfile.char : DEFAULT_CHAR;

  useEffect(() => {
    if (!loaded || !profilesState.profiles.length) return;
    try {
      persistEraAppBootState(profilesState, char);
    } catch (error) {
    }
  }, [profilesState, char, loaded]);

  const upd = useCallback((nextValue) => {
    setProfilesState((currentState) => updateActiveProfileState(currentState, nextValue));
  }, []);

  function selectProfile(profileId) {
    setProfilesState((currentState) => selectEraProfileState(currentState, profileId));
  }

  function renameActiveProfile(nextName) {
    setProfilesState((currentState) => renameEraActiveProfileState(currentState, nextName));
  }

  function createBlankProfile() {
    setProfilesState((currentState) => createEraBlankProfileState(currentState).nextState);
    setTab("ficha");
  }

  function duplicateActiveProfile() {
    setProfilesState((currentState) => duplicateEraActiveProfileState(currentState).nextState);
    setTab("ficha");
  }

  function deleteActiveProfile() {
    setProfilesState((currentState) => deleteEraActiveProfileState(currentState));
    setTab("ficha");
  }

  function createExampleProfile(example) {
    setProfilesState((currentState) => createEraExampleProfileState(currentState, example).nextState);
    setTab("ficha");
  }

  return (
    <div className="app-shell">
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, textarea {
          background: ${C.bg3};
          color: ${C.text};
          border: 1px solid ${C.border};
          border-radius: 6px;
          padding: 7px 9px;
          font-family: ${FONT_TEXT};
          font-size: 13px;
          width: 100%;
          outline: none;
        }
        select {
          background: ${C.bg3};
          color: ${C.text};
          border: 1px solid ${C.border};
          border-radius: 6px;
          padding: 7px 9px;
          font-family: ${FONT_SYSTEM};
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
        body { background-color: ${C.bg}; }
      `}</style>

      <div className="app-frame">
        <div
          style={{
            background: `linear-gradient(135deg, ${C.bg2}, ${C.bg})`,
            borderBottom: `1px solid ${C.border}`,
            padding: "16px",
            display: "grid",
            gap: 14,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
              <HeaderSigil />
              <div>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 10, color: C.gold, letterSpacing: 3, textTransform: "uppercase" }}>
                  UnheaveN - ERA - Palimpsest
                </div>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 700, color: C.text, marginTop: 2 }}>
                  {char.name || "Personagem"}
                  <span style={{ fontSize: 11, color: C.muted, fontFamily: FONT_SYSTEM, marginLeft: 8 }}>Nv.{char.level}</span>
                </div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 4, maxWidth: 520 }}>
                  Trama tripla entre corpo, mente e alma. O sigilo do Palimpsest guia a identidade da app e o ritmo de leitura do sistema.
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              {HEADER_RESOURCES.map((resource) => (
                <HeaderResource key={resource.key} char={char} resource={resource} />
              ))}
            </div>
          </div>

          <ProfileManager
            profiles={profilesState.profiles}
            activeId={profilesState.activeId}
            onSelect={selectProfile}
            onRename={renameActiveProfile}
            onCreate={createBlankProfile}
            onDuplicate={duplicateActiveProfile}
            onDelete={deleteActiveProfile}
            onCreateExample={createExampleProfile}
          />
        </div>

        {showVersionNotice ? <VersionNotice onRefresh={refreshEraAppVersion} onDismiss={() => setShowVersionNotice(false)} /> : null}

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
