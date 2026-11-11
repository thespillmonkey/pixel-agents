/** Semantic activity text comes from status/tool state, never sprite motion. */
export function shouldShowAgentLabel(always: boolean, workOnly: boolean, status: string, selected: boolean, hovered: boolean): boolean {
  if (always) return true;
  if (workOnly) return status !== 'Idle';
  return selected || hovered;
}
