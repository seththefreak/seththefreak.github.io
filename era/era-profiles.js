/*
 * Audit refactor:
 * - Documents profile hydration/normalization helpers.
 * - Preserves storage schema compatibility and ERA character defaults.
 * - Keeps all mechanical values and labels unchanged.
 */

/**
 * Hydrates a stored ERA character into the current schema.
 * @param {string | null} rawCharacter
 * @returns {object}
 */
function hydrateCharacter(rawCharacter) {
  const parsed = rawCharacter ? JSON.parse(rawCharacter) : null;
  if (!parsed) return DEFAULT_CHAR;

  const level = clampNumber(Number(parsed.level) || 1, 1, LEVELS.length);
  const levelData = getCurrentLevelData(level);
  const parsedSubs = { ...(parsed.subs || {}) };
  if (parsedSubs.afinidade && !parsedSubs.sintonia) {
    parsedSubs.sintonia = parsedSubs.afinidade;
  }
  const merged = {
    ...DEFAULT_CHAR,
    ...parsed,
    level,
    pilares: { ...DEFAULT_CHAR.pilares, ...(parsed.pilares || {}) },
    subs: { ...DEFAULT_SUBS, ...parsedSubs },
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

function sanitizeCharacter(characterLike) {
  try {
    return hydrateCharacter(JSON.stringify(characterLike || DEFAULT_CHAR));
  } catch (error) {
    return DEFAULT_CHAR;
  }
}

function createProfile(name, characterLike) {
  const char = sanitizeCharacter(characterLike || DEFAULT_CHAR);
  return {
    id: createId("profile"),
    name: name || char.name || "Ficha",
    char,
  };
}

function hydrateProfiles(rawProfiles, rawLegacyCharacter) {
  try {
    if (rawProfiles) {
      const parsed = JSON.parse(rawProfiles);
      const parsedProfiles = Array.isArray(parsed.profiles) ? parsed.profiles : [];
      const profiles = parsedProfiles.map((profile, index) => ({
        id: profile.id || createId(`profile-${index + 1}`),
        name: profile.name || `Ficha ${index + 1}`,
        char: sanitizeCharacter(profile.char),
      }));

      if (profiles.length) {
        const activeId = profiles.some((profile) => profile.id === parsed.activeId) ? parsed.activeId : profiles[0].id;
        return { activeId, profiles };
      }
    }
  } catch (error) {
  }

  const legacyChar = rawLegacyCharacter ? hydrateCharacter(rawLegacyCharacter) : DEFAULT_CHAR;
  const initialProfile = createProfile(legacyChar.name || "Ficha 1", legacyChar);
  return { activeId: initialProfile.id, profiles: [initialProfile] };
}
