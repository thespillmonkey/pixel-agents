# r10 — Labels Only On Work

The native checkbox immediately below Always Show Labels defaults OFF.
Always Show Labels disables/greys the checkbox without clearing its saved value.
When Always is OFF and work-only is ON, visibility follows the existing semantic
activity text (`getActivityText`): Working, live tools, Needs approval and Waiting
for input are non-Idle; Idle hides even during hover/selection. Sprite motion is
never an input. Work-only applies independently to every rendered agent label.
With both options OFF the existing hover/selection behavior is unchanged.

The preference uses the existing namespaced FileStateAdapter settings persistence,
settingsLoaded message, and both standalone and VS Code setting handlers. Missing
or invalid legacy fields normalize to OFF; disabling Always reactivates a retained
work-only choice. Focused tests cover precedence, independent status transitions,
default behavior and adapter save/reload in both namespaces. Browser verification
uses synthetic dev-mode messages and is not genuine provider lifecycle evidence.

## Acceptance limits

WIP / NOT_INSTALLABLE / NOT_TEST_READY. Independent originalBugatha exact-artifact
QA is required; this writer does not self-accept. r9 cleaner-label selector
ambiguity and X acknowledgement timeout remain OPEN, not fixed or inherited as
passes. Frozen R1 transcript identity/offset and R2 socket custody paths must not
drift. Broader provider lifecycle and human visual approval remain outstanding.
Effective HIGH requested, not proven if runtime metadata is absent.
historical dependency-byte immutability remains unproven
