/**
 * Offline migration only: input is an explicitly supplied copied config.json,
 * output is a NEW directory. Never opens a live preference path.
 * Original artwork is kept as external PNGs with byte-identical SHA256 identities.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const [inputArg, outputArg] = process.argv.slice(2);
if (!inputArg || !outputArg) throw new Error('Usage: node scripts/migrate-appearance-copy.mjs COPIED_CONFIG NEW_OUTPUT_DIR');
const input = fs.realpathSync(inputArg);
const output = path.resolve(outputArg);
const live = path.join(os.homedir(), '.pixel-agents');
if (input === live || input.startsWith(live + path.sep) || output === live || output.startsWith(live + path.sep)) throw new Error('Live state is forbidden');
const original = fs.readFileSync(input);
const inputSHA256 = createHash('sha256').update(original).digest('hex');
const config = JSON.parse(original);
const legacy = fileURLToPath(new URL('../migration/legacy-artwork', import.meta.url));
const pack = path.join(output, 'legacy-artwork');
const next = { ...config, externalAssetDirectories: [...new Set([...(config.externalAssetDirectories ?? []), pack])] };
const pins = config.agentAppearances ?? {};
// No palette-number to profile mapping: unproven old IDs remain saved and recoverable.
next.agentAppearances = pins;
const encoded = JSON.stringify(next, null, 2) + '\n';
if (fs.existsSync(output)) {
  const receipt = JSON.parse(fs.readFileSync(path.join(output, 'MIGRATION.json')));
  if (receipt.inputSHA256 !== inputSHA256 || fs.readFileSync(path.join(output, 'config.json'), 'utf8') !== encoded) throw new Error('Output is not this exact migration');
  for (const [name, hash] of Object.entries(receipt.artwork)) {
    const bytes = fs.readFileSync(path.join(pack, 'assets/characters', name));
    if (createHash('sha256').update(bytes).digest('hex') !== hash) throw new Error('Artwork changed');
  }
  console.log('UNCHANGED_EXACT_MIGRATION');
} else {
  fs.mkdirSync(output, { recursive: false });
  fs.cpSync(legacy, pack, { recursive: true });
  fs.writeFileSync(path.join(output, 'config.before.json'), original);
  fs.writeFileSync(path.join(output, 'config.json'), encoded);
  const artwork = Object.fromEntries(fs.readdirSync(path.join(pack, 'assets/characters')).map((name) => [name, createHash('sha256').update(fs.readFileSync(path.join(pack, 'assets/characters', name))).digest('hex')]));
  fs.writeFileSync(path.join(output, 'MIGRATION.json'), JSON.stringify({ inputSHA256, artwork, unresolvedPins: Object.values(pins).filter((id) => !String(id).startsWith('profile:') && !Object.values(artwork).some((h) => id === 'sha256:' + h)), rollback: 'config.before.json is byte-identical to supplied copy; no live state was touched' }, null, 2));
  console.log('CREATED_OFFLINE_MIGRATION');
}
