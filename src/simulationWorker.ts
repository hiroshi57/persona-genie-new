/**
 * simulationWorker.ts - Web Worker エントリーポイント
 * 100,000人のシミュレーションをバックグラウンドで実行
 */

import type {
  SimulationWorkerRequest,
  SimulationWorkerResponse,
  SimulatedPerson,
} from "./types";
import { generateSinglePerson, computeStatistics } from "./simulationCore";

const BATCH_SIZE = 10000;

self.onmessage = (e: MessageEvent<SimulationWorkerRequest>) => {
  const { productData, sliderParams, populationSize } = e.data;

  if (!productData || !sliderParams || !populationSize) {
    self.postMessage({ type: "error", error: "Invalid worker request data" } as SimulationWorkerResponse);
    return;
  }

  try {
    const persons: SimulatedPerson[] = [];

    for (let batch = 0; batch < populationSize; batch += BATCH_SIZE) {
      const batchSize = Math.min(BATCH_SIZE, populationSize - batch);

      for (let i = 0; i < batchSize; i++) {
        persons.push(generateSinglePerson(batch + i, productData, sliderParams));
      }

      const progress = Math.round(((batch + batchSize) / populationSize) * 100);
      self.postMessage({
        type: "progress",
        progress,
      } as SimulationWorkerResponse);
    }

    const statistics = computeStatistics(persons);

    self.postMessage({
      type: "complete",
      result: { persons, statistics },
    } as SimulationWorkerResponse);
  } catch (error) {
    self.postMessage({
      type: "error",
      error: String(error),
    } as SimulationWorkerResponse);
  }
};
