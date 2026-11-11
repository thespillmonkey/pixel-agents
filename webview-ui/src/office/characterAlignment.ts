import { CHARACTER_SITTING_OFFSET_PX } from '../constants.js';
import { getCharacterSprites } from './sprites/spriteData.js';
import type { Character } from './types.js';
import { CharacterState } from './types.js';

/** One anchor policy for rendered sprites, labels, and pointer picking. */
export function characterSittingOffset(ch: Character): number {
  return ch.state === CharacterState.TYPE &&
    !getCharacterSprites(ch.palette, ch.repeat).standingCasting
    ? CHARACTER_SITTING_OFFSET_PX : 0;
}
