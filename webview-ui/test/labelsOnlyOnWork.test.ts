import { describe, expect, it } from 'vitest';

import { getActivityText } from '../src/office/activityText.js';
import { shouldShowAgentLabel as visible } from '../src/office/labelVisibility.js';
describe('Labels Only On Work semantic visibility', () => {
  it.each([[false,false],[false,true],[true,false],[true,true]])('precedence always=%s work=%s', (always,work) => {
    for (const selected of [false,true]) for (const hovered of [false,true]) {
      expect(visible(always,work,'Idle',selected,hovered)).toBe(always || (!work && (selected || hovered)));
      expect(visible(always,work,'Working',selected,hovered)).toBe(always || work || selected || hovered);
    }
  });
  it('immediately hides on Idle even when selected/hovered; agents stay independent', () => {
    let statuses = ['Idle','Working'];
    expect(statuses.map(s=>visible(false,true,s,true,true))).toEqual([false,true]);
    statuses = ['Working','Idle'];
    expect(statuses.map(s=>visible(false,true,s,true,true))).toEqual([true,false]);
  });
  it('uses actual semantic activity while ignoring motion (idle sprite working; walking sprite Idle)', () => {
    const movingIdle = { motion: 'walk', active: false };
    const stationaryWorking = { motion: 'idle', active: true };
    for (const agent of [movingIdle,stationaryWorking]) {
      const status=getActivityText(1,{},agent.active,null,false);
      expect(visible(false,true,status,false,false)).toBe(agent.active);
    }
    expect(visible(false,true,getActivityText(1,{},false,'permission',false),false,false)).toBe(true);
    expect(visible(false,true,getActivityText(1,{},false,'waiting',true),false,false)).toBe(true);
  });
});
