/*
 * Audit refactor:
 * - Documented ERA bootstrap, persistence, and profile-state helpers.
 * - Kept localStorage schema, version prompt behavior, and profile transitions unchanged.
 * - Left refresh side effects explicit because they intentionally clear stale PWA caches.
 */

/**
 * Loads profiles and version metadata, falling back to a blank profile if storage fails.
 * @returns {{profilesState: object, showVersionNotice: boolean}}
 */
function loadEraAppBootState() {
  try {
    const profilesState = hydrateProfiles(
      localStorage.getItem(PROFILES_STORAGE_KEY),
      localStorage.getItem(LEGACY_STORAGE_KEY)
    );
    const meta = JSON.parse(localStorage.getItem(APP_META_STORAGE_KEY) || "{}");
    return {
      profilesState,
      showVersionNotice: meta.lastSeenVersion !== APP_VERSION,
    };
  } catch (error) {
    const fallbackProfile = createProfile("Ficha 1", DEFAULT_CHAR);
    return {
      profilesState: { activeId: fallbackProfile.id, profiles: [fallbackProfile] },
      showVersionNotice: true,
    };
  }
}

/**
 * Persists the profile collection and legacy active-character copy.
 * @param {object} profilesState
 * @param {object} activeCharacter
 * @returns {void}
 */
function persistEraAppBootState(profilesState, activeCharacter) {
  localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profilesState));
  localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(activeCharacter));
  localStorage.setItem(APP_META_STORAGE_KEY, JSON.stringify({ lastSeenVersion: APP_VERSION }));
}

/**
 * Applies a direct object patch or updater function to the active profile.
 * @param {object} currentState
 * @param {object | Function} nextValue
 * @returns {object}
 */
function updateActiveProfileState(currentState, nextValue) {
  return {
    ...currentState,
    profiles: currentState.profiles.map((profile) => {
      if (profile.id !== currentState.activeId) return profile;
      const nextChar = typeof nextValue === "function"
        ? nextValue(profile.char)
        : { ...profile.char, ...nextValue };
      return { ...profile, char: nextChar };
    }),
  };
}

/**
 * Selects the active profile id.
 * @param {object} currentState
 * @param {string} profileId
 * @returns {object}
 */
function selectEraProfileState(currentState, profileId) {
  return { ...currentState, activeId: profileId };
}

/**
 * Renames the active profile.
 * @param {object} currentState
 * @param {string} nextName
 * @returns {object}
 */
function renameEraActiveProfileState(currentState, nextName) {
  return {
    ...currentState,
    profiles: currentState.profiles.map((profile) => (
      profile.id !== currentState.activeId
        ? profile
        : { ...profile, name: nextName }
    )),
  };
}

/**
 * Creates and selects a new blank profile.
 * @param {object} currentState
 * @returns {{nextState: object, nextProfile: object}}
 */
function createEraBlankProfileState(currentState) {
  const nextProfile = createProfile(`Ficha ${currentState.profiles.length + 1}`, DEFAULT_CHAR);
  return {
    nextState: {
      activeId: nextProfile.id,
      profiles: [...currentState.profiles, nextProfile],
    },
    nextProfile,
  };
}

/**
 * Duplicates and selects the active profile.
 * @param {object} currentState
 * @returns {{nextState: object, nextProfile: object | null}}
 */
function duplicateEraActiveProfileState(currentState) {
  const activeProfile = currentState.profiles.find((profile) => profile.id === currentState.activeId) || currentState.profiles[0];
  if (!activeProfile) return { nextState: currentState, nextProfile: null };

  const duplicate = createProfile(`${activeProfile.name} copia`, activeProfile.char);
  return {
    nextState: {
      activeId: duplicate.id,
      profiles: [...currentState.profiles, duplicate],
    },
    nextProfile: duplicate,
  };
}

/**
 * Deletes the active profile while ensuring at least one profile remains.
 * @param {object} currentState
 * @returns {object}
 */
function deleteEraActiveProfileState(currentState) {
  if (currentState.profiles.length <= 1) {
    const fallbackProfile = createProfile("Ficha 1", DEFAULT_CHAR);
    return {
      activeId: fallbackProfile.id,
      profiles: [fallbackProfile],
    };
  }

  const nextProfiles = currentState.profiles.filter((profile) => profile.id !== currentState.activeId);
  return {
    activeId: nextProfiles[0].id,
    profiles: nextProfiles,
  };
}

/**
 * Creates a profile from bundled example character data.
 * @param {object} currentState
 * @param {object} example
 * @returns {{nextState: object, nextProfile: object}}
 */
function createEraExampleProfileState(currentState, example) {
  const nextProfile = createProfile(example.name, {
    ...DEFAULT_CHAR,
    ...example,
    effects: Array.isArray(example.effects) ? example.effects.map(normalizeEffect) : [],
  });
  return {
    nextState: {
      activeId: nextProfile.id,
      profiles: [...currentState.profiles, nextProfile],
    },
    nextProfile,
  };
}

/**
 * Clears service workers/caches and reloads to pull the newest deployed app shell.
 * @returns {Promise<void>}
 */
async function refreshEraAppVersion() {
  try {
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }
    if ("caches" in window) {
      const cacheKeys = await caches.keys();
      await Promise.all(cacheKeys.map((cacheKey) => caches.delete(cacheKey)));
    }
  } catch (error) {
  }
  window.location.reload();
}
