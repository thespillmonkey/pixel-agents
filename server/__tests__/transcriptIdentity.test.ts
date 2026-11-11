import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { afterEach, expect, it } from 'vitest';

import { createAgentState } from '../src/agentState.js';
import { AgentStateStore } from '../src/agentStateStore.js';
import { initialReadOffset, readNewLines } from '../src/fileWatcher.js';
const dirs: string[] = [];
afterEach(() => {
  for (const dir of dirs.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
});
it('tracks consumed identity, append, truncate and replacement without birthtime', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'identity-'));
  dirs.push(dir);
  const file = path.join(dir, 's.jsonl');
  fs.writeFileSync(file, '{}\n{}\n');
  expect(initialReadOffset(file)).toBe(0);
  const agents = new AgentStateStore();
  const agent = createAgentState({
    projectDir: dir,
    isExternal: false,
    id: 1,
    sessionId: 's',
    jsonlFile: file,
  });
  agents.set(1, agent);
  const read = () => readNewLines(1, agents, new Map(), new Map());
  read();
  expect(initialReadOffset(file)).toBe(6);
  fs.appendFileSync(file, '{}\n');
  expect(initialReadOffset(file)).toBe(6);
  read();
  expect(agent.fileOffset).toBe(9);
  agent.contextTokens = 150000;
  agent.contextReported = true;
  agent.lineBuffer = 'stale';
  fs.writeFileSync(file, '{}\n');
  read();
  expect(agent.fileOffset).toBe(3);
  expect(agent.lineBuffer).toBe('');
  expect(agent.contextTokens).toBe(0);
  const other = path.join(dir, 'new');
  fs.writeFileSync(other, '{}\n{}\n');
  agent.contextTokens = 123;
  fs.renameSync(other, file);
  expect(initialReadOffset(file)).toBe(0);
  read();
  expect(agent.fileOffset).toBe(6);
  expect(agent.contextTokens).toBe(0);
  agent.contextTokens = 789;
  const current = fs.statSync(file);
  fs.writeFileSync(file, '{}\n{}\n');
  fs.utimesSync(file, current.atime, new Date(current.mtimeMs + 2000));
  expect(initialReadOffset(file)).toBe(0);
  read();
  expect(agent.contextTokens).toBe(0);
  expect(agent.fileOffset).toBe(6);
});
it('does not infer EOF for an old unseen transcript', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'identity-'));
  dirs.push(dir);
  const file = path.join(dir, 'old');
  fs.writeFileSync(file, '{}\n');
  fs.utimesSync(file, 1, 1);
  expect(initialReadOffset(file)).toBe(0);
});
