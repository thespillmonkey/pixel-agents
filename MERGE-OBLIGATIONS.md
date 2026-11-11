# Merge obligations — Pixel v1.6 Phase 1 WIP

Base 4184e9fb78ede782375d92e2a85d8350555cc716; pinned upstream 4dd14d612fd37d89ffbbc977959f572395c4eec8. No network Git fetch. Canonical dirty source READ ONLY.

This is an integration candidate, NOT acceptance. Every textual conflict follows; automatic merges also require semantic validation.

## package.json

Retain BOTH dist/openclaw-plugin/ and dist/hooks/claude-statusline.js; upstream dependencies and lock adopted, canonical dirt excluded. Hunk count: 1.

## server/src/cli.ts

Retain relay token rotation, plugin installation and all provider handlers alongside upstream PTY-host controls/reconnect and cast watcher; refresh pinned appearances after asset reload. Hunk count: 3.

## server/src/hookEventHandler.ts

Retain child-only 120s lease, native settlement and non-team child stop path; add upstream pathsMatch and BackgroundSpawns. Use repeat on revived OpenClaw appearances. Hunk count: 3.

## server/src/httpServer.ts

Retain hook-only admin-or-relay bearer gate separate from admin-only usage route. Use upstream agentCreatedMessage; never grant relay bearer usage/WebSocket/admin/appearance authority. Hunk count: 2.

## server/src/clientMessageHandler.ts

Retain provider capability union/read-only appearance dispatch; upstream recentCharacters and usage bridge. Restore captured cache reference; repeat instead of hueShift; stale seats cannot undo name pins. Hunk count: 1.

## server/src/agentRuntime.ts

Keep primary provider field for upstream BackgroundSpawns; keep all provider handlers; stop disposes every handler, scanners, timers and file watchers WITHOUT deleting agents; dispose calls stop then removes agents. Hunk count: 2.

## server/src/assetLoader.ts

Use upstream 128x96/eight-frame decoder with 112x96 fallback; retain external SHA256 IDs; obsolete bundled six-character loader removed. Byte-identical old artwork in migration/legacy-artwork. Hunk count: 2.

## webview-ui/src/App.tsx

Combine CharactersView/sidebar/mobile shells with separate fork appearance modal; ToolOverlay in upstream z0 layer retains cleaner labels and privileged gear. Hunk count: 4.

## webview-ui/src/components/SettingsModal.tsx

Adopt upstream radio, usage consent, wardrobe/pixel UI; retain Cleaner Agent Labels checkbox and existing props. Hunk count: 1.

## webview-ui/src/components/ZoomControls.tsx

Use upstream sidebar/pixel icons/level UI, restore +/- ZOOM_STEP=0.25; wheel/pinch auto-merge retained, needs behavioral validation. Hunk count: 1.

## webview-ui/src/hooks/useExtensionMessages.ts

Retain appearance changed state plus React refresh, use repeat; remove obsolete duplicated characterSpritesLoaded branch in favor of upstream profile/external sprite handling. Hunk count: 1.

## webview-ui/src/office/components/ToolOverlay.tsx

Retain shared activityText/cleaner labels and vertically separate X/gear; keep upstream truthful contextReported gate/ContextBar. Hunk count: 3.

## README.md

Retain fork attribution/metadata-only OpenClaw scope; upstream feature list and Claude usage-bridge disclosure retained. Capabilities remain provider-specific. Hunk count: 3.

## e2e/README.md

Combine OpenClaw test entries and upstream terminal coverage; generated inventory count MUST be regenerated before acceptance. Hunk count: 3.

## adapters/vscode/uninstall.ts

allSettled hook uninstall for Claude/OpenClaw plus every provider usageBridge uninstall, reset hooks after settlement; unrelated-config negative tests pending. Hunk count: 1.

## Cross-cutting obligations / deferrals

- Relay: metadata-only, hook-only auth, separate token rotation, SecretRefs, HTTPS and redirect resistance. Fork sources preserved; full negative and browser tests required.
- Lifecycle: six configured-agent grouping, friendly names, priority/generation Working/native settlement, distinct children and 120s child-only expiry retained. Replay, reconnect and background spawn matrix pending.
- Appearance: generated profile IDs + external hashes, exact-name pins and repeat port implemented. Cast remaps reapply resolver, external hash aggregation preserved. Save/Cancel/Random, missing/returning asset and cross-browser/new-session behavior need immutable browser QA.
- Migration: copy-only explicit config input, new output/byte-identical backup, stable legacy external PNG pack; no unproven palette-to-profile mapping. Unknown builtin pins remain unresolved, never silently mapped. Migration fixture checks initial/replay/rejected-changed-input passed; no live data read or mutated.
- UI: upstream wardrobe/sidebar/mobile/rest/blink/seats/radio retained; radio explicit-play remains upstream behavior. Gear/X, labels, 0.25 button/wheel/pinch all require screenshot/real-input QA.
- Capabilities: Claude usage/statusline/conversation launch/resume must remain capability-gated, not OpenClaw/Codex controls or invented quota/context data. Exact type/test/browser validation pending.
- Protocol: AsyncAPI source changed from hueShift to repeat for appearance messages. Regeneration pending dependency completion; generated messages MUST NOT be hand-edited.
- Package: both relay plugin and Claude statusline required in tarball; VSIX, npm smoke/build not yet accepted. esbuild automatic merge needs measured validation.
- Custom furniture: Mektharion paired-electronics compatibility OPEN; no asset category-only workaround or live mutation.
- PR443 stays separate and unchanged; no push/PR/publish/install/deploy/restart authority.
- Independent Bugatha immutable exact-source/build/browser QA separate and NOT ADMITTED in this phase.

## Precise NEXT

Finish frozen-lock install once. Regenerate protocol; run targeted appearance/lifecycle/auth tests, types and package/relay checks; repair only evidenced failures within remaining engineering budget. Then production builds if fit. Seal local WIP with all measured failures and remaining obligations. Independent exact-artifact QA is required before any integration acceptance.

## Final Phase-1 measured status (supersedes pending-check text above)

{
  "status": "PHASE1_WIP_NOT_ACCEPTED",
  "types": "PASS final after profile filter fix",
  "protocol": "generated 110 models; AsyncAPI validate PASS",
  "webviewTests": "443/443 PASS",
  "packageContract": "7/7 PASS",
  "relayTests": "6/6 PASS",
  "migration": "initial/idempotent PASS, changed input rejected",
  "fullServer": "1050 pass / 16 fail / 23 skip in original full run; catalog and asset fixture defects subsequently repaired; no full-suite rerun claimed",
  "focusedFinal": [
    "Test Files \u001b[22m \u001b[1m\u001b[32m5 passed\u001b[39m\u001b[22m\u001b[90m (5)\u001b[39m",
    "Tests \u001b[22m \u001b[1m\u001b[32m95 passed\u001b[39m\u001b[22m\u001b[90m (95)\u001b[39m"
  ],
  "production": "extension/server and webview PASS; post-pin server bundle rebuilt",
  "npm": "frozen-lock npm ci PASS; WIP npm pack --ignore-scripts PASS; no installability claim",
  "lint": "PASS with one App effect-dependency warning",
  "quota": "latest verified coordinator40% at20:40:27Z; status --usage refresh SIGKILL timeout; older AIRI telemetry not authority",
  "independentQA": "NOT_ADMITTED",
  "canonicalUnchanged": true,
  "ownedProcessesRemaining": 0,
  "next": "Reproduce unresolved full-server PTY socket and initial-read timestamp failures under suitable verified Store test custody; validate npm/VSIX smoke and complete immutable browser/provider/appearance lifecycle matrix via separately admitted original reviewer. Do not publish/install."
}
