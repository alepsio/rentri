import { describe, expect, it } from '@jest/globals';

describe('tick simulation', () => {
  it('computes deterministic sanity', () => {
    const distance = 1000;
    const burn = 3;
    expect(distance * burn).toBe(3000);
  });
});
