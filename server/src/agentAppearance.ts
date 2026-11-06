import type { AgentStateStore } from './agentStateStore.js';
import type { LoadedCharacterSprites } from './assetLoader.js';
import { readConfig, writeConfig } from './configPersistence.js';
import { assignPaletteIfNeeded } from './paletteAssigner.js';
import type { AgentState } from './types.js';

/** Names, never transient numeric session IDs, own the preference. */
export function appearanceName(agent: AgentState): string {
  return agent.agentName || agent.directoryName || '';
}

export function appearanceInventory(characters: LoadedCharacterSprites | null | undefined) {
  return (characters?.characters ?? []).map((_, palette) => ({
    id: characters?.characterIds?.[palette] ?? `builtin:${palette}`,
    label: `Character ${palette + 1}`,
    palette,
  }));
}

export function applyAgentAppearance(
  agent: AgentState,
  characters: LoadedCharacterSprites | null | undefined,
  store?: AgentStateStore,
): boolean {
  const name = appearanceName(agent);
  const appearances = readConfig().agentAppearances;
  const id = Object.hasOwn(appearances, name) ? appearances[name] : undefined;
  const item = id && appearanceInventory(characters).find((entry) => entry.id === id);
  if (!item) {
    // Removed assets fall back gracefully, retaining the saved identity for their return.
    if (
      store &&
      characters &&
      (agent.palette === undefined || agent.palette >= characters.characters.length)
    ) {
      delete agent.palette;
      delete agent.hueShift;
      assignPaletteIfNeeded(agent, store);
    }
    return false;
  }
  agent.palette = item.palette;
  agent.hueShift = 0;
  return true;
}

export function saveAgentAppearance(
  store: AgentStateStore,
  characters: LoadedCharacterSprites | null | undefined,
  id: unknown,
  assetId: unknown,
): string | null {
  const agent = typeof id === 'number' && Number.isInteger(id) ? store.get(id) : undefined;
  const name = agent && appearanceName(agent);
  if (!agent || !name || name.length > 512)
    return 'This agent no longer exists or has no persistent name.';
  if (
    assetId !== null &&
    (typeof assetId !== 'string' ||
      !appearanceInventory(characters).some((entry) => entry.id === assetId))
  )
    return 'That character is no longer available. Reopen the picker to refresh.';
  const config = readConfig();
  if (assetId === null) delete config.agentAppearances[name];
  else
    Object.defineProperty(config.agentAppearances, name, {
      value: assetId,
      enumerable: true,
      writable: true,
      configurable: true,
    });
  if (!writeConfig(config)) return 'Could not save the character on the server. Please try again.';
  for (const current of store.values()) {
    if (appearanceName(current) !== name) continue;
    if (assetId === null) {
      delete current.palette;
      delete current.hueShift;
      assignPaletteIfNeeded(current, store);
    } else applyAgentAppearance(current, characters);
    store.broadcast({
      type: 'agentAppearanceChanged',
      id: current.id,
      palette: current.palette,
      hueShift: current.hueShift ?? 0,
    });
  }
  store.persist();
  return null;
}
