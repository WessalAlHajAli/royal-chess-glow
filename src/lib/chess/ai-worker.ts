/// <reference lib="webworker" />
// Simple negamax + alpha-beta chess AI running inside a Web Worker so the
// UI thread stays responsive. The engine is intentionally modular: a future
// Stockfish WASM build can replace this file behind the same message shape.
import { Chess, type Move } from "chess.js";
import type { AIRequest, AIResponse, Difficulty } from "./ai";

const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Piece-square tables (from White's perspective, a8 = index 0)
// prettier-ignore
const PST: Record<string, number[]> = {
  p: [
     0,  0,  0,  0,  0,  0,  0,  0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
     5,  5, 10, 25, 25, 10,  5,  5,
     0,  0,  0, 20, 20,  0,  0,  0,
     5, -5,-10,  0,  0,-10, -5,  5,
     5, 10, 10,-20,-20, 10, 10,  5,
     0,  0,  0,  0,  0,  0,  0,  0,
  ],
  n: [
    -50,-40,-30,-30,-30,-30,-40,-50,
    -40,-20,  0,  0,  0,  0,-20,-40,
    -30,  0, 10, 15, 15, 10,  0,-30,
    -30,  5, 15, 20, 20, 15,  5,-30,
    -30,  0, 15, 20, 20, 15,  0,-30,
    -30,  5, 10, 15, 15, 10,  5,-30,
    -40,-20,  0,  5,  5,  0,-20,-40,
    -50,-40,-30,-30,-30,-30,-40,-50,
  ],
  b: [
    -20,-10,-10,-10,-10,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5, 10, 10,  5,  0,-10,
    -10,  5,  5, 10, 10,  5,  5,-10,
    -10,  0, 10, 10, 10, 10,  0,-10,
    -10, 10, 10, 10, 10, 10, 10,-10,
    -10,  5,  0,  0,  0,  0,  5,-10,
    -20,-10,-10,-10,-10,-10,-10,-20,
  ],
  r: [
     0,  0,  0,  0,  0,  0,  0,  0,
     5, 10, 10, 10, 10, 10, 10,  5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
     0,  0,  0,  5,  5,  0,  0,  0,
  ],
  q: [
    -20,-10,-10, -5, -5,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5,  5,  5,  5,  0,-10,
     -5,  0,  5,  5,  5,  5,  0, -5,
      0,  0,  5,  5,  5,  5,  0, -5,
    -10,  5,  5,  5,  5,  5,  0,-10,
    -10,  0,  5,  0,  0,  0,  0,-10,
    -20,-10,-10, -5, -5,-10,-10,-20,
  ],
  k: [
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -20,-30,-30,-40,-40,-30,-30,-20,
    -10,-20,-20,-20,-20,-20,-20,-10,
     20, 20,  0,  0,  0,  0, 20, 20,
     20, 30, 10,  0,  0, 10, 30, 20,
  ],
};

function evaluate(chess: Chess): number {
  if (chess.isCheckmate()) return chess.turn() === "w" ? -100000 : 100000;
  if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition())
    return 0;

  let score = 0;
  const board = chess.board();
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const sq = board[r][f];
      if (!sq) continue;
      const val = PIECE_VALUES[sq.type];
      const pstIdx = sq.color === "w" ? r * 8 + f : (7 - r) * 8 + f;
      const pst = PST[sq.type][pstIdx];
      const sign = sq.color === "w" ? 1 : -1;
      score += sign * (val + pst);
    }
  }
  return score;
}

function orderMoves(moves: Move[]): Move[] {
  return [...moves].sort((a, b) => {
    const score = (m: Move) => {
      let s = 0;
      if (m.captured) s += 10 * PIECE_VALUES[m.captured] - PIECE_VALUES[m.piece];
      if (m.promotion) s += 800;
      if (m.san.includes("+")) s += 50;
      return s;
    };
    return score(b) - score(a);
  });
}

function negamax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  color: 1 | -1,
): number {
  if (depth === 0 || chess.isGameOver()) {
    return color * evaluate(chess);
  }
  const moves = orderMoves(chess.moves({ verbose: true }) as Move[]);
  if (moves.length === 0) return color * evaluate(chess);

  let best = -Infinity;
  for (const m of moves) {
    chess.move(m);
    const val = -negamax(chess, depth - 1, -beta, -alpha, (-color) as 1 | -1);
    chess.undo();
    if (val > best) best = val;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
  }
  return best;
}

function pickBestMove(fen: string, depth: number, randomness = 0): Move {
  const chess = new Chess(fen);
  const color = chess.turn() === "w" ? 1 : -1;
  const moves = orderMoves(chess.moves({ verbose: true }) as Move[]);
  const scored: { move: Move; score: number }[] = [];
  let alpha = -Infinity;
  const beta = Infinity;
  let bestScore = -Infinity;

  for (const m of moves) {
    chess.move(m);
    const score = -negamax(chess, depth - 1, -beta, -alpha, (-color) as 1 | -1);
    chess.undo();
    scored.push({ move: m, score });
    if (score > bestScore) bestScore = score;
    if (score > alpha) alpha = score;
  }

  if (randomness > 0) {
    // Pick from moves within `randomness` centipawns of the best
    const pool = scored.filter((s) => s.score >= bestScore - randomness);
    return pool[Math.floor(Math.random() * pool.length)].move;
  }
  const bestMoves = scored.filter((s) => s.score === bestScore);
  return bestMoves[Math.floor(Math.random() * bestMoves.length)].move;
}

function difficultyConfig(d: Difficulty): { depth: number; randomness: number } {
  switch (d) {
    case "easy":
      return { depth: 1, randomness: 400 };
    case "medium":
      return { depth: 2, randomness: 120 };
    case "hard":
      return { depth: 3, randomness: 30 };
    case "master":
      return { depth: 4, randomness: 0 };
  }
}

self.onmessage = (e: MessageEvent<AIRequest>) => {
  const { id, fen, difficulty } = e.data;
  const { depth, randomness } = difficultyConfig(difficulty);
  const move = pickBestMove(fen, depth, randomness);
  const response: AIResponse = {
    id,
    from: move.from,
    to: move.to,
    promotion: move.promotion as AIResponse["promotion"],
  };
  (self as unknown as Worker).postMessage(response);
};
