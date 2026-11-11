/**
 * `vscode:uninstall` hook (see package.json scripts) — VS Code executes this
 * with plain Node after the extension has been fully uninstalled. The `vscode`
 * module does not exist here; only Node APIs are available.
 *
 * Removes the Pixel Agents hook entries from ~/.claude/settings.json so an
 * uninstalled extension leaves no hooks running behind the user's back. The
 * copied hook script under ~/.pixel-agents/hooks/ is left in place: the
 * standalone CLI shares it and re-adds its own entries on next run.
 *
 * Also puts the user's own status line back if the usage bridge wraps it
 * (Settings → Usage Bars), for the same reason.
 */
import { resetHooksConfig } from '../../server/src/configPersistence.js';
import { uninstallHooks } from '../../server/src/providers/hook/claude/claudeHookInstaller.js';
import { uninstallOpenClawHooks } from '../../server/src/providers/hook/openclaw/openclawPluginInstaller.js';
import { hookProviders } from '../../server/src/providers/index.js';

Promise.allSettled([uninstallHooks(), uninstallOpenClawHooks(), ...hookProviders.map((p) => p.usageBridge?.uninstall())])
  .then((results) => {
    for (const result of results) if (result.status === 'rejected') console.error('[Pixel Agents]', result.reason);
  })
  .finally(() => {
    resetHooksConfig();
  });
