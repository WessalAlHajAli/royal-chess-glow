// Modular AI interface. A future Stockfish engine can implement the same shape.
export type Difficulty = "easy" | "medium" | "hard" | "master";

export interface AIRequest {
  id: number;
  fen: string;
  difficulty: Difficulty;
}

export interface AIResponse {
  id: number;
  from: string;
  to: string;
  promotion?: "q" | "r" | "b" | "n";
}
