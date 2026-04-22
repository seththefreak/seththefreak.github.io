/*
 * Responsibility: render the ERA shell and header UI around the active tabs.
 * Exports: HeaderSigil, HeaderResource, ProfileManager, VersionNotice,
 * AppTabButton, AppContent.
 */

function HeaderSigil() {
  const orbitStyle = {
    position: "absolute",
    inset: 0,
    borderRadius: "50%",
    border: `1px solid ${C.border}`,
    opacity: 0.35,
  };

  return (
    <div style={{ position: "relative", width: 72, height: 72, flexShrink: 0 }}>
      <div style={{ ...orbitStyle, transform: "rotate(14deg)" }} />
      <div style={{ ...orbitStyle, transform: "rotate(-44deg) scale(0.84)" }} />
      <div style={{ ...orbitStyle, transform: "rotate(74deg) scale(0.68)" }} />
      {[
        { background: `linear-gradient(135deg, ${C.almaDark}, ${C.almaLight})`, top: 3, left: 22 },
        { background: `linear-gradient(135deg, ${C.menteDark}, ${C.menteLight})`, top: 40, right: 0 },
        { background: `linear-gradient(135deg, ${C.corpoDark}, ${C.corpoAccent})`, top: 40, left: 0 },
      ].map((orb, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            width: 22,
            height: 22,
            borderRadius: "50%",
            boxShadow: `0 0 16px ${index === 0 ? `${C.alma}55` : index === 1 ? `${C.mente}55` : `${C.corpo}55`}`,
            ...orb,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          inset: 22,
          borderRadius: "50%",
          border: `1px solid ${C.goldDark}`,
          boxShadow: `0 0 18px ${C.goldDark}33`,
          background: `radial-gradient(circle, ${C.goldGlow}22, transparent 70%)`,
        }}
      />
    </div>
  );
}

function HeaderResource({ char, resource }) {
  const value = char[resource.key];
  const percent = getMeterPercent(value.cur, value.max);

  return (
    <div style={{ minWidth: 56, textAlign: "center" }}>
      <div style={{ fontSize: 9, color: C.muted, letterSpacing: 1, fontFamily: FONT_SYSTEM }}>{resource.label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: percent < 25 ? C.danger : resource.color, fontFamily: FONT_SYSTEM }}>
        {value.cur}
      </div>
      <div style={{ height: 4, background: C.bg3, borderRadius: 999 }}>
        <div style={{ height: 4, width: `${percent}%`, background: resource.color, borderRadius: 999, transition: "width 0.3s" }} />
      </div>
    </div>
  );
}

function ProfileManager({
  profiles,
  activeId,
  onSelect,
  onRename,
  onCreate,
  onDuplicate,
  onDelete,
  onCreateExample,
}) {
  const activeProfile = profiles.find((profile) => profile.id === activeId) || profiles[0];

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(180px, 240px) minmax(180px, 1fr)", gap: 8 }}>
        <div>
          <Lbl>Ficha ativa</Lbl>
          <select value={activeId} onChange={(event) => onSelect(event.target.value)}>
            {profiles.map((profile, index) => (
              <option key={profile.id} value={profile.id}>
                {profile.name || `Ficha ${index + 1}`}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Lbl>Nome da ficha</Lbl>
          <input value={activeProfile ? (activeProfile.name || "") : ""} onChange={(event) => onRename(event.target.value)} placeholder="Nome da ficha salva" />
        </div>
      </div>

      <div className="chip-row">
        <button onClick={onCreate} style={{ padding: "6px 10px", borderRadius: 999, background: `${C.mente}18`, border: `1px solid ${C.mente}`, color: C.mente, fontFamily: FONT_SYSTEM, fontSize: 11 }}>
          + Nova ficha
        </button>
        <button onClick={onDuplicate} style={{ padding: "6px 10px", borderRadius: 999, background: `${C.gold}18`, border: `1px solid ${C.gold}`, color: C.gold, fontFamily: FONT_SYSTEM, fontSize: 11 }}>
          Duplicar
        </button>
        <button onClick={onDelete} style={{ padding: "6px 10px", borderRadius: 999, background: `${C.corpo}18`, border: `1px solid ${C.corpo}`, color: C.corpo, fontFamily: FONT_SYSTEM, fontSize: 11 }}>
          Excluir
        </button>
      </div>

      <div>
        <Lbl>Exemplos de ficha</Lbl>
        <div className="chip-row">
          {CHARACTER_EXAMPLES.map((example) => (
            <button
              key={example.id}
              onClick={() => onCreateExample(example)}
              style={{
                padding: "6px 10px",
                borderRadius: 999,
                background: `${C.alma}16`,
                border: `1px solid ${C.alma}55`,
                color: C.almaLight,
                fontSize: 11,
              }}
            >
              + {example.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function VersionNotice({ onRefresh, onDismiss }) {
  return (
    <div style={{ ...card, margin: "12px 16px 0", background: `${C.gold}0D`, borderColor: `${C.gold}55` }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 12, fontWeight: 700, color: C.gold, marginBottom: 3 }}>
            Atualizacao detectada - v{APP_VERSION}
          </div>
          <div style={{ fontSize: 11, color: C.muted }}>
            Recarregue a aplicacao para renovar cache e estrutura sem perder as fichas salvas.
          </div>
        </div>
        <div className="chip-row">
          <button onClick={onRefresh} style={{ padding: "7px 10px", borderRadius: 999, background: `${C.gold}18`, border: `1px solid ${C.gold}`, color: C.gold, fontFamily: FONT_SYSTEM, fontSize: 11 }}>
            Atualizar app
          </button>
          <button onClick={onDismiss} style={{ padding: "7px 10px", borderRadius: 999, background: C.bg3, border: `1px solid ${C.border}`, color: C.muted, fontFamily: FONT_SYSTEM, fontSize: 11 }}>
            Agora nao
          </button>
        </div>
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
        fontFamily: FONT_DISPLAY,
        fontSize: 10,
        letterSpacing: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
      }}
    >
      <span style={{ fontSize: 12, fontFamily: FONT_SYSTEM }}>{tab.icon}</span>
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
