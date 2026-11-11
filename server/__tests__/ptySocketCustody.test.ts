import * as fs from 'fs';
import * as path from 'path';
import { afterEach, expect, it } from 'vitest';

import { startPtyHost } from '../src/terminal/ptyHost.js';
import { defaultPtyHostSocket, socketPathProblem } from '../src/terminal/ptyHostProtocol.js';
const dirs: string[] = [];
afterEach(async () => {
  for (const dir of dirs.splice(0))
    await fs.promises.rm(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 50 });
});
function owned(): string {
  const dir = fs.mkdtempSync('/tmp/pxh-guard-');
  dirs.push(dir);
  return dir;
}
it('bounds default and custom path lengths', () => {
  expect(Buffer.byteLength(defaultPtyHostSocket())).toBeLessThanOrEqual(103);
  expect(socketPathProblem('/tmp/' + 'x'.repeat(104))).toMatch(/too long/);
});
it('rejects the verified Store NFS before binding', async () => {
  const socket = '/mnt/clawshare/pxh-must-not-bind.sock';
  expect(Number(fs.statfsSync(process.cwd()).type)).toBe(0x6969);
  await expect(startPtyHost({ socketPath: socket })).rejects.toThrow(/non-NFS/);
  expect(fs.existsSync(socket)).toBe(false);
});
it('does not unlink an owned regular file at the socket path', async () => {
  const socket = path.join(owned(), 'sentinel');
  fs.writeFileSync(socket, 'preserve');
  await expect(startPtyHost({ socketPath: socket })).rejects.toThrow(/non-socket/);
  expect(fs.readFileSync(socket, 'utf8')).toBe('preserve');
});
it('rejects permissive and symlink socket directories', async () => {
  const dir = owned();
  fs.chmodSync(dir, 0o755);
  await expect(startPtyHost({ socketPath: path.join(dir, 'h') })).rejects.toThrow(/0700/);
  fs.chmodSync(dir, 0o700);
  const outer = owned();
  const link = path.join(outer, 'link');
  fs.symlinkSync(dir, link);
  await expect(startPtyHost({ socketPath: path.join(link, 'h') })).rejects.toThrow(/symlink/);
});
