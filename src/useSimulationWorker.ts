/**
 * useSimulationWorker.ts - Web Worker管理カスタムフック
 */

import { useState, useRef, useCallback } from "react";
import type {
  ProductInfo,
  SliderParameters,
  SimulationResult,
  SimulationWorkerResponse,
} from "./types";

export function useSimulationWorker() {
  const workerRef = useRef<Worker | null>(null);
  const [progress, setProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const runSimulationAsync = useCallback(
    (
      productData: ProductInfo,
      sliderParams: SliderParameters,
      populationSize: number
    ): Promise<SimulationResult> => {
      return new Promise((resolve, reject) => {
        // 既存workerがあれば終了
        if (workerRef.current) {
          workerRef.current.terminate();
        }

        const worker = new Worker(
          new URL("./simulationWorker.ts", import.meta.url),
          { type: "module" }
        );
        workerRef.current = worker;
        setIsRunning(true);
        setProgress(0);

        worker.onmessage = (e: MessageEvent<SimulationWorkerResponse>) => {
          const data = e.data;
          if (data.type === "progress") {
            setProgress(data.progress ?? 0);
          } else if (data.type === "complete") {
            setIsRunning(false);
            setProgress(100);
            worker.terminate();
            workerRef.current = null;
            if (!data.result) {
              reject(new Error("Simulation completed but result is missing"));
              return;
            }
            resolve(data.result);
          } else if (data.type === "error") {
            setIsRunning(false);
            worker.terminate();
            workerRef.current = null;
            reject(new Error(data.error));
          }
        };

        worker.onerror = (err) => {
          setIsRunning(false);
          worker.terminate();
          workerRef.current = null;
          reject(new Error(err.message));
        };

        worker.postMessage({ productData, sliderParams, populationSize });
      });
    },
    []
  );

  const cancel = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    setIsRunning(false);
    setProgress(0);
  }, []);

  return { runSimulationAsync, progress, isRunning, cancel };
}
