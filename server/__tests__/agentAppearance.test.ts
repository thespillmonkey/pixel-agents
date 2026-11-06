import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  appearanceInventory,
  applyAgentAppearance,
  saveAgentAppearance,
} from '../src/agentAppearance.js';
import { AgentStateStore } from '../src/agentStateStore.js';
import {
  loadCharacterSprites,
  type LoadedCharacterSprites,
  loadExternalCharacterSprites,
  mergeCharacterSprites,
} from '../src/assetLoader.js';
import { type AssetCache, handleClientMessage } from '../src/clientMessageHandler.js';
import { readConfig } from '../src/configPersistence.js';
import { FileStateAdapter } from '../src/fileStateAdapter.js';
import { setPaletteCount } from '../src/paletteAssigner.js';
import type { AgentState } from '../src/types.js';

function createTestAgent(overrides: Partial<AgentState> = {}): AgentState {
  return {
    id: 1,
    sessionId: 'sess-1',
    terminalRef: undefined,
    isExternal: false,
    projectDir: '/test',
    jsonlFile: '/test/session.jsonl',
    fileOffset: 0,
    lineBuffer: '',
    activeToolIds: new Set(),
    activeToolStatuses: new Map(),
    activeToolNames: new Map(),
    activeSubagentToolIds: new Map(),
    activeSubagentToolNames: new Map(),
    backgroundAgentToolIds: new Set(),
    isWaiting: false,
    permissionSent: false,
    hadToolsInTurn: false,
    lastDataAt: 0,
    linesProcessed: 0,
    seenUnknownRecordTypes: new Set(),
    hookDelivered: false,
    contextTokens: 0,
    maxContextTokens: 200_000,
    ...overrides,
  } as AgentState;
}

const assetA = 'sha256:' + 'a'.repeat(64);
const assetB = 'sha256:' + 'b'.repeat(64);
const chars = { characters: [{}, {}], characterIds: [assetA, assetB] } as LoadedCharacterSprites;

describe('name-bound agent appearances', () => {
  let tempHome: string;
  let oldHome: string | undefined;
  let store: AgentStateStore;
  beforeEach(() => {
    tempHome = fs.mkdtempSync(path.join(os.tmpdir(), 'pxl-appearance-'));
    oldHome = process.env.HOME;
    process.env.HOME = tempHome;
    setPaletteCount(2);
    store = new AgentStateStore();
    store.setAdapter(new FileStateAdapter({ namespace: 'standalone' }));
    store.set(1, createTestAgent({ agentName: 'Mitsuki', palette: 0, hueShift: 80 }));
  });
  afterEach(() => {
    if (oldHome === undefined) delete process.env.HOME;
    else process.env.HOME = oldHome;
    setPaletteCount(6);
    store.dispose();
    fs.rmSync(tempHome, { recursive: true, force: true });
  });
  it('saves on disk by exact name and broadcasts to every same-named live session', () => {
    store.set(9, createTestAgent({ id: 9, agentName: 'Mitsuki', palette: 0 }));
    store.set(2, createTestAgent({ id: 2, agentName: 'Other', palette: 0 }));
    const events: unknown[] = [];
    store.on('broadcast', (message) => events.push(message));
    expect(saveAgentAppearance(store, chars, 1, assetB)).toBeNull();
    expect(readConfig().agentAppearances).toEqual({ Mitsuki: assetB });
    expect(store.get(1)?.palette).toBe(1);
    expect(store.get(9)?.palette).toBe(1);
    expect(store.get(2)?.palette).toBe(0);
    expect(events).toEqual([
      { type: 'agentAppearanceChanged', id: 1, palette: 1, hueShift: 0 },
      { type: 'agentAppearanceChanged', id: 9, palette: 1, hueShift: 0 },
    ]);
  });
  it('restores another numeric session ID and asset position from durable name/content identity', () => {
    saveAgentAppearance(store, chars, 1, assetB);
    const newStore = new AgentStateStore();
    newStore.appearanceResolver = (agent) => {
      applyAgentAppearance(agent, {
        characters: [{}, {}],
        characterIds: [assetB, assetA],
      } as LoadedCharacterSprites);
    };
    newStore.set(88, createTestAgent({ id: 88, agentName: 'Mitsuki', palette: 1, hueShift: 90 }));
    expect(newStore.get(88)).toMatchObject({ palette: 0, hueShift: 0 });
    newStore.dispose();
  });
  it('Random removes the pin and returns to the normal diverse palette algorithm', () => {
    saveAgentAppearance(store, chars, 1, assetB);
    store.set(2, createTestAgent({ id: 2, agentName: 'Other', palette: 1 }));
    expect(saveAgentAppearance(store, chars, 1, null)).toBeNull();
    expect(readConfig().agentAppearances).toEqual({});
    expect(store.get(1)).toMatchObject({ palette: 0, hueShift: 0 });
  });
  it('rejects missing IDs, invalid graphics, unnamed agents and read-only requests without mutation', () => {
    expect(saveAgentAppearance(store, chars, 100, assetB)).toBeTruthy();
    expect(saveAgentAppearance(store, chars, 1, '../private')).toBeTruthy();
    expect(saveAgentAppearance(store, chars, 1, undefined)).toBeTruthy();
    store.set(3, createTestAgent({ id: 3 }));
    expect(saveAgentAppearance(store, chars, 3, assetB)).toBeTruthy();
    const sent: unknown[] = [];
    handleClientMessage(
      { type: 'saveAgentAppearance', id: 1, assetId: assetB },
      (m) => sent.push(m),
      { store, cache: null, privileged: false },
    );
    expect(sent).toContainEqual({
      type: 'agentAppearanceError',
      id: 1,
      message: 'This office is read-only.',
    });
    expect(readConfig().agentAppearances).toEqual({});
    expect(store.get(1)).toMatchObject({ palette: 0, hueShift: 80 });
  });
  it('re-scans on every open without changing draft or persisting anything', async () => {
    const cache = { characters: chars } as AssetCache;
    const sent: Array<Record<string, unknown>> = [];
    let reloads = 0;
    const ctx = {
      store,
      cache,
      privileged: true,
      onReloadAssets: () => {
        reloads++;
        cache.characters = {
          ...chars,
          characters: [...chars.characters, chars.characters[0]],
          characterIds: [assetA, assetB, 'builtin:2'],
        };
      },
    };
    handleClientMessage({ type: 'requestAgentAppearance', id: 1 }, (m) => sent.push(m), ctx);
    await Promise.resolve();
    expect(sent[0]).toMatchObject({
      type: 'agentAppearanceOptions',
      id: 1,
      name: 'Mitsuki',
      selectedAssetId: null,
    });
    expect(sent[0].options as unknown[]).toHaveLength(3);
    expect(readConfig().agentAppearances).toEqual({});
    // Closing without Save (Cancel) has no server mutation.
    handleClientMessage({ type: 'requestAgentAppearance', id: 1 }, (m) => sent.push(m), ctx);
    await Promise.resolve();
    expect(reloads).toBe(2);
    expect(store.get(1)).toMatchObject({ palette: 0, hueShift: 80 });
  });
  it('stale seat snapshots cannot override a saved character', () => {
    saveAgentAppearance(store, chars, 1, assetB);
    handleClientMessage(
      { type: 'saveAgentSeats', seats: { '1': { palette: 0, hueShift: 90 } } },
      () => {},
      { store, cache: { characters: chars } as AssetCache, privileged: true },
    );
    expect(store.get(1)).toMatchObject({ palette: 1, hueShift: 0 });
  });
  it('removed assets keep their durable pin but never leave an out-of-range palette', () => {
    saveAgentAppearance(store, chars, 1, assetB);
    setPaletteCount(1);
    applyAgentAppearance(
      store.get(1)!,
      { characters: [{}], characterIds: [assetA] } as LoadedCharacterSprites,
      store,
    );
    expect(store.get(1)?.palette).toBe(0);
    expect(readConfig().agentAppearances.Mitsuki).toBe(assetB);
    expect(appearanceInventory(chars).map((i) => i.id)).toEqual([assetA, assetB]);
  });
  it('reports persistence failure and leaves every live character unchanged', () => {
    fs.mkdirSync(path.join(tempHome, '.pixel-agents'));
    fs.mkdirSync(path.join(tempHome, '.pixel-agents', 'config.json.tmp'));
    expect(saveAgentAppearance(store, chars, 1, assetB)).toContain('Could not save');
    expect(store.get(1)).toMatchObject({ palette: 0, hueShift: 80 });
  });
  it('discovers newly added PNGs on rescan, skips malformed files and preserves content identities', async () => {
    const root = path.join(tempHome, 'catalog');
    const dir = path.join(root, 'assets', 'characters');
    fs.mkdirSync(dir, { recursive: true });
    const pngA = fs.readFileSync(path.resolve('../webview-ui/public/assets/characters/char_0.png'));
    const pngB = fs.readFileSync(path.resolve('../webview-ui/public/assets/characters/char_1.png'));
    fs.writeFileSync(path.join(dir, 'char_10.png'), pngA);
    const first = await loadCharacterSprites(root);
    expect(first?.characters).toHaveLength(1);
    fs.writeFileSync(path.join(dir, 'char_2.png'), pngB);
    fs.writeFileSync(path.join(dir, 'char_99.png'), 'not a PNG');
    const next = await loadCharacterSprites(root);
    expect(next?.characters).toHaveLength(2);
    expect(next?.characterIds?.[1]).toBe(first?.characterIds?.[0]);
    const external = await loadExternalCharacterSprites(root);
    expect(external?.characterIds).toEqual(next?.characterIds);
    const merged = mergeCharacterSprites(first!, external!);
    expect(merged.characterIds).toHaveLength(3);
  });
});
