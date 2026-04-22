const HABILIDADES_ACERVO = [
  {
    cat: "Combate e Físico",
    color: "#EF4444",
    items: [
      { id: "resistente",      label: "Resistente",       desc: "Reduz em 2 pts todo dano físico recebido (mínimo 1)." },
      { id: "letal",           label: "Letal",            desc: "Margem de Ameaça expandida: resultado 5 ou 6 conta como Ameaça." },
      { id: "mestre_armas",    label: "Mestre das Armas", desc: "Proficiência com todas as armas. +1 Prog. Efetivo em testes de crítico." },
      { id: "guerreiro",       label: "Guerreiro",        desc: "Dado de dano extra em ataques CaC com armas pesadas (descarta o menor)." },
      { id: "duelista",        label: "Duelista",         desc: "Ao declarar alvo único por turno: +1 Prog. Efetivo em ataque e defesa contra ele." },
      { id: "atirador",        label: "Atirador",         desc: "+1 Prog. Efetivo em ataques à distância. Ignora cobertura leve." },
      { id: "guardiao",        label: "Guardião",         desc: "+1 Prog. Efetivo em defesa ao proteger aliados. Pode interceptar ataques como Reação." },
      { id: "assassino",       label: "Assassino",        desc: "+1 Prog. Efetivo em ataques surpresa e em Enganação/Disfarce." },
      { id: "combatente_dual", label: "Combatente Dual",  desc: "Reduz penalidade de duas armas para −1. +1 ataque extra com arma secundária." },
      { id: "evasivo",         label: "Evasivo",          desc: "+1 Prog. Efetivo em Esquiva. Nunca sofre dano de área se esquivar com sucesso." },
      { id: "golpe_vital",     label: "Golpe Vital",      desc: "+1 dado de dano em acertos que superam defesa por 2+. Em crítico: efeito adicional." },
    ],
  },
  {
    cat: "Estigma e Manifestação",
    color: "#A78BFA",
    items: [
      { id: "feiticeiro",       label: "Feiticeiro",          desc: "+1 Prog. Efetivo em Domínio. −1 PE em Manifestações Simples e Avançadas." },
      { id: "invocador",        label: "Invocador",           desc: "+1 Prog. Efetivo em Poder ao usar Formas de Invocação. +1 turno de duração." },
      { id: "barreira_mistica", label: "Barreira Mística",    desc: "Manifestações de barreira custam −1 PE. +1 Prog. Efetivo em Afinidade." },
      { id: "necromante",       label: "Necromante",          desc: "+1 Prog. Efetivo em Poder com Umbra/Noctis/Vita. Pode animar mortos (narrativo)." },
      { id: "mestre_chamas",    label: "Mestre das Chamas",   desc: "+1 Prog. Efetivo em ataques com Pyro e derivados. Resistência a fogo." },
      { id: "exorcista",        label: "Exorcista",           desc: "+1 Prog. Efetivo em Domínio e Afinidade vs. entidades. Resistência espiritual." },
      { id: "elementalista",    label: "Elementalista",       desc: "Escolhe 1 Elemento: −1 PE e +1 Prog. Efetivo. (Múltipla aquisição permitida)" },
      { id: "sensitivo",        label: "Sensitivo",           desc: "+1 Prog. Efetivo em detectar Névoa, Estigmas ativos e entidades próximas." },
      { id: "catalisador",      label: "Catalisador",         desc: "Pode emprestar até 5 PE por turno a aliado com Estigma em alcance." },
      { id: "rastreador_almas", label: "Rastreador de Almas", desc: "Detecta rastros de Essência em até 6u. +1 Prog. Efetivo em identificação." },
    ],
  },
  {
    cat: "Mental / Suporte / Utilidade",
    color: "#22D3EE",
    items: [
      { id: "resiliencia_mental",  label: "Resiliência Mental",   desc: "Reduz perda de sanidade em 1 (mínimo 0) por evento." },
      { id: "vontade_indomavel",   label: "Vontade Indomável",    desc: "1× por sessão: re-rola teste mental. Sucesso: recupera 1d4 SP." },
      { id: "sangue_frio",         label: "Sangue Frio",          desc: "+1 Prog. Efetivo em testes de sanidade durante combate ou tensão aguda." },
      { id: "curandeiro",          label: "Curandeiro",           desc: "Dobra a eficácia de cura via Medicina. +10 HP em primeiros socorros." },
      { id: "ladino",              label: "Ladino",               desc: "+1 Prog. Efetivo em Furtividade e Ladinagem simultaneamente." },
      { id: "analista",            label: "Analista",             desc: "+1 Prog. Efetivo em tech humana. Pré-requisito para projetos TEK operacional." },
      { id: "lider_tatico",        label: "Líder Tático",         desc: "Aliados em alcance 3u ganham +1 Prog. Efetivo em iniciativa." },
      { id: "sorte_estranha",      label: "Sorte Estranha",       desc: "1× por sessão: re-rola uma falha crítica." },
      { id: "momento_gloria",      label: "Momento de Glória",    desc: "1× por sessão: transforma uma falha comum em sucesso simples." },
    ],
  },
];

function HabilidadesAcervo({ char, upd }) {
  const [expandedId, setExpandedId] = useState(null);

  const learned = Array.isArray(char.habilidadesAprendidas) ? char.habilidadesAprendidas : [];

  function toggleLearn(id) {
    upd((prev) => {
      const current = Array.isArray(prev.habilidadesAprendidas) ? prev.habilidadesAprendidas : [];
      const next = current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id];
      return { ...prev, habilidadesAprendidas: next };
    });
  }

  function toggleExpand(id) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  const totalLearned = learned.length;

  return (
    <div>
      <div style={{ fontSize: 11, color: C.muted, marginBottom: 12, padding: "8px 10px", background: C.bg3, borderRadius: 6 }}>
        Clique em uma habilidade para ver sua descrição. Clique em{" "}
        <span style={{ color: C.gold }}>Aprender</span> para adicioná-la ao personagem.
        {totalLearned > 0 && (
          <span style={{ marginLeft: 8, color: C.gold, fontWeight: 700 }}>
            {totalLearned} {totalLearned === 1 ? "habilidade aprendida" : "habilidades aprendidas"}
          </span>
        )}
      </div>

      {HABILIDADES_ACERVO.map((group) => (
        <div key={group.cat} style={{ marginBottom: 16 }}>
          <div style={{
            fontSize: 10,
            fontFamily: FONT_DISPLAY,
            color: group.color,
            letterSpacing: 2,
            textTransform: "uppercase",
            marginBottom: 8,
            paddingBottom: 4,
            borderBottom: `1px solid ${group.color}33`,
          }}>
            {group.cat}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {group.items.map((item) => {
              const isLearned = learned.includes(item.id);
              const isExpanded = expandedId === item.id;

              return (
                <div key={item.id} style={{
                  borderRadius: 8,
                  border: `1px solid ${isLearned ? group.color + "66" : C.border}`,
                  background: isLearned ? `${group.color}0D` : C.bg3,
                  overflow: "hidden",
                  transition: "all 0.15s",
                }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 10px",
                      cursor: "pointer",
                    }}
                    onClick={() => toggleExpand(item.id)}
                  >
                    <div style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: isLearned ? group.color : C.border,
                      boxShadow: isLearned ? `0 0 6px ${group.color}88` : "none",
                      transition: "all 0.2s",
                    }} />

                    <span style={{
                      flex: 1,
                      fontSize: 12,
                      fontWeight: isLearned ? 700 : 400,
                      color: isLearned ? group.color : C.text,
                      fontFamily: FONT_DISPLAY,
                    }}>
                      {item.label}
                    </span>

                    <span style={{
                      fontSize: 10,
                      color: C.muted,
                      fontFamily: FONT_SYSTEM,
                      marginRight: 4,
                    }}>
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  </div>

                  {isExpanded && (
                    <div style={{
                      padding: "0 10px 10px 26px",
                      borderTop: `1px solid ${group.color}22`,
                    }}>
                      <div style={{
                        fontSize: 11,
                        color: C.text,
                        lineHeight: 1.6,
                        marginTop: 8,
                        marginBottom: 10,
                        fontFamily: FONT_TEXT,
                      }}>
                        {item.desc}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleLearn(item.id); }}
                        style={{
                          padding: "5px 14px",
                          borderRadius: 999,
                          border: `1px solid ${isLearned ? C.danger : group.color}`,
                          background: isLearned ? `${C.danger}18` : `${group.color}22`,
                          color: isLearned ? C.danger : group.color,
                          fontSize: 11,
                          fontFamily: FONT_DISPLAY,
                          fontWeight: 700,
                          cursor: "pointer",
                          letterSpacing: 0.5,
                        }}
                      >
                        {isLearned ? "Esquecer" : "Aprender"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
