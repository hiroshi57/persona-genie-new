import { describe, it, expect } from 'vitest';
import { gaussianRandom, clamp } from '../simulationCore';

describe('clamp', () => {
  it('値が範囲内のときそのまま返す', () => {
    expect(clamp(50, 0, 100)).toBe(50);
  });
  it('値が最小値より小さいとき最小値を返す', () => {
    expect(clamp(-10, 0, 100)).toBe(0);
  });
  it('値が最大値より大きいとき最大値を返す', () => {
    expect(clamp(200, 0, 100)).toBe(100);
  });
});

describe('gaussianRandom', () => {
  it('NaN を返さない（u1=0 バグ修正確認）', () => {
    for (let i = 0; i < 1000; i++) {
      const result = gaussianRandom(50, 10);
      expect(result).not.toBeNaN();
      expect(isFinite(result)).toBe(true);
    }
  });

  it('平均付近に収束する（1万回の統計的確認）', () => {
    const samples = Array.from({ length: 10000 }, () => gaussianRandom(100, 15));
    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    expect(mean).toBeGreaterThan(95);
    expect(mean).toBeLessThan(105);
  });
});
