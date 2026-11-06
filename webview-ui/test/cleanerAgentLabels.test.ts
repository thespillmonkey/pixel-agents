import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ToolOverlay } from '../src/office/components/ToolOverlay.js';
import type { OfficeState } from '../src/office/engine/officeState.js';
import { CharacterState } from '../src/office/types.js';

function renderLabels(
  cleanerAgentLabels: boolean,
  alwaysShowOverlay = true,
  selectedAgentId: number | null = null,
) {
  vi.stubGlobal('window', { devicePixelRatio: 1 });
  const officeState = {
    getLayout: () => ({ cols: 25, rows: 22 }),
    selectedAgentId,
    hoveredAgentId: null,
    characters: new Map([
      [
        1,
        {
          x: 100,
          y: 100,
          state: CharacterState.IDLE,
          isActive: true,
          isSubagent: false,
          agentName: 'Codelia',
          directoryName: 'gateway-agent-name-longer-than-status',
          contextTokens: 0,
          maxContextTokens: 200000,
        },
      ],
    ]),
  } as unknown as OfficeState;
  return renderToStaticMarkup(
    createElement(ToolOverlay, {
      officeState,
      agents: [1],
      agentTools: { 1: [{ toolId: 'exec', status: 'Running a command', done: false }] },
      subagentTools: {},
      subagentCharacters: [],
      containerRef: {
        current: { getBoundingClientRect: () => ({ width: 1000, height: 800 }) },
      } as never,
      zoom: 2,
      panRef: { current: { x: 0, y: 0 } },
      onCloseAgent: () => {},
      alwaysShowOverlay,
      cleanerAgentLabels,
    }),
  );
}

afterEach(() => vi.unstubAllGlobals());

describe('Cleaner Agent Labels', () => {
  it('removes the gateway row entirely, preserving name and live activity', () => {
    const normal = renderLabels(false);
    expect(normal).toContain('gateway-agent-name-longer-than-status');
    const clean = renderLabels(true);
    expect(clean).toContain('Codelia');
    expect(clean).toContain('Running a command');
    expect(clean).not.toContain('gateway-agent-name-longer-than-status');
    expect((normal.match(/<span/g) ?? []).length - (clean.match(/<span/g) ?? []).length).toBe(1);
    expect(renderLabels(false)).toBe(normal);
  });
  it('does not make unselected labels visible when always-show is off', () => {
    expect(renderLabels(true, false)).toBe('');
    expect(renderLabels(false, false)).toBe('');
    expect(renderLabels(true, false, 1)).toContain('Codelia');
    expect(renderLabels(true, false, 1)).not.toContain('gateway-agent-name-longer-than-status');
  });
});
