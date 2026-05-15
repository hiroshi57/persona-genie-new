import { describe, it, expect } from 'vitest';
import { computeBig5, computeAggregateBig5 } from '../big5Engine';
import type { SimulatedPerson } from '../types';

const mockPerson = (overrides: Partial<SimulatedPerson> = {}): SimulatedPerson => ({
  id: 'test-1',
  name: 'テスト太郎',
  age: 35,
  awarenessScore: 70,
  purchaseIntentScore: 60,
  quadrant: 'Q1',
  occupation: 'エンジニア',
  income: 'middle',
  region: '東京都',
  familyType: '単身',
  petOwnership: 'なし',
  detailedIncome: 600,
  financialAssets: '100~500万',
  housingType: '賃貸',
  hobbies: [],
  digitalLiteracy: 4,
  ...overrides,
});

describe('computeBig5', () => {
  it('全スコアが 0〜100 の範囲内', () => {
    const result = computeBig5(mockPerson());
    expect(result.openness).toBeGreaterThanOrEqual(0);
    expect(result.openness).toBeLessThanOrEqual(100);
    expect(result.conscientiousness).toBeGreaterThanOrEqual(0);
    expect(result.conscientiousness).toBeLessThanOrEqual(100);
    expect(result.extraversion).toBeGreaterThanOrEqual(0);
    expect(result.extraversion).toBeLessThanOrEqual(100);
    expect(result.agreeableness).toBeGreaterThanOrEqual(0);
    expect(result.agreeableness).toBeLessThanOrEqual(100);
    expect(result.neuroticism).toBeGreaterThanOrEqual(0);
    expect(result.neuroticism).toBeLessThanOrEqual(100);
  });

  it('digitalLiteracy が undefined でも NaN にならない（バグ修正確認）', () => {
    const person = mockPerson({ digitalLiteracy: undefined as unknown as number });
    const result = computeBig5(person);
    Object.values(result).forEach((score) => {
      expect(score).not.toBeNaN();
    });
  });

  it('エンジニアは開放性が高め', () => {
    const eng = computeBig5(mockPerson({ occupation: 'エンジニア' }));
    const sales = computeBig5(mockPerson({ occupation: '事務職' }));
    // ランダム変動があるため厳密比較はせず傾向のみ確認（10回試行）
    let engHigherCount = 0;
    for (let i = 0; i < 10; i++) {
      const e = computeBig5(mockPerson({ occupation: 'エンジニア' }));
      const s = computeBig5(mockPerson({ occupation: '事務職' }));
      if (e.openness > s.openness) engHigherCount++;
    }
    expect(engHigherCount).toBeGreaterThanOrEqual(5);
    void eng; void sales;
  });
});

describe('computeAggregateBig5', () => {
  it('空配列でも正常に動作する', () => {
    const result = computeAggregateBig5([]);
    Object.values(result).forEach((score) => {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  it('複数人の平均が範囲内', () => {
    const persons = Array.from({ length: 100 }, (_, i) =>
      mockPerson({ age: 20 + i % 50, digitalLiteracy: (i % 5) + 1 })
    );
    const result = computeAggregateBig5(persons);
    Object.values(result).forEach((score) => {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
      expect(score).not.toBeNaN();
    });
  });
});
