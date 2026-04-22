/*
 * Responsibility: isolate ERA bootstrap state, persistence and version refresh side effects.
 * Exports: loadEraAppBootState, persistEraAppBootState, updateActiveProfileState,
 * selectEraProfileState, renameEraActiveProfileState, createEraBlankProfileState,
 * duplicateEraActiveProfileState, deleteEraActiveProfileState,
 * createEraExampleProfileState, refreshEraAppVersion.
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

function persistEraAppBootState(profilesState, activeCharacter) {
  localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profilesState));
  localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(activeCharacter));
  localStorage.setItem(APP_META_STORAGE_KEY, JSON.stringify({ lastSeenVersion: APP_VERSION }));
}

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

function selectEraProfileState(currentState, profileId) {
  return { ...currentState, activeId: profileId };
}

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
