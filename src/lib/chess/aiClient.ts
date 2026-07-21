import type { AIRequest, AIResponse, Difficulty } from "./ai";

let worker: Worker | null = null;
let nextId = 1;
const pending = new Map<number, (r: AIResponse) => void>();

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL("./ai-worker.ts", import.meta.url), {
      type: "module",
    });
    worker.onmessage = (e: MessageEvent<AIResponse>) => {
      const cb = pending.get(e.data.id);
      if (cb) {
        pending.delete(e.data.id);
        cb(e.data);
      }
    };
  }
  return worker;
}

export function requestAIMove(
  fen: string,
  difficulty: Difficulty,
): Promise<AIResponse> {
  return new Promise((resolve) => {
    const id = nextId++;
    pending.set(id, resolve);
    const req: AIRequest = { id, fen, difficulty };
    getWorker().postMessage(req);
  });
}
