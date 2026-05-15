/**
 * simulationEngine.ts - v3 メインスレッド用シミュレーション
 * simulationCore.tsの関数を使用
 */

import type { ProductInfo, SliderParameters, SimulationResult } from "./types";
import { generateSinglePerson, computeStatistics } from "./simulationCore";

export function runSimulation(
  productData: ProductInfo,
  sliderParams: SliderParameters,
  populationSize: number = 100000
): SimulationResult {
  const persons = [];
  for (let i = 0; i < populationSize; i++) {
    persons.push(generateSinglePerson(i, productData, sliderParams));
  }
  const statistics = computeStatistics(persons);
  return { persons, statistics };
}
