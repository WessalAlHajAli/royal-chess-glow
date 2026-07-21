import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Chess, type Move, type Square, type Color } from "chess.js";
import type { Difficulty } from "@/lib/chess/ai";
import { requestAIMove } from "@/lib/chess/aiClient";

export type GameStatus =
  | { kind: "playing" }
  | { kind: "check" }
  | { kind: "checkmate"; winner: Color }
  | { kind: "stalemate" }
  | { kind: "draw"; reason: string }
  | { kind: "resigned"; winner: Color };

export interface PendingPromotion {
  from: Square;
  to: Square;
  color: Color;
}

const PLAYER_COLOR: Color = "w";

export function useChessGame() {
  const chessRef = useRef(new Chess());
  const [fen, setFen] = useState(chessRef.current.fen());
  const [selected, setSelected] = useState<Square | null>(null);
  const [validTargets, setValidTargets] = useState<Square[]>([]);
  const [history, setHistory] = useState<Move[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(
    null,
  );
  const [pendingPromotion, setPendingPromotion] =
    useState<PendingPromotion | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [thinking, setThinking] = useState(false);
  const [resigned, setResigned] = useState<Color | null>(null);
  const aiTokenRef = useRef(0);

  const syncFromChess = useCallback(() => {
    const c = chessRef.current;
    setFen(c.fen());
    setHistory(c.history({ verbose: true }) as Move[]);
  }, []);

  const status: GameStatus = useMemo(() => {
    const c = chessRef.current;
    if (resigned) return { kind: "resigned", winner: resigned === "w" ? "b" : "w" };
    if (c.isCheckmate()) return { kind: "checkmate", winner: c.turn() === "w" ? "b" : "w" };
    if (c.isStalemate()) return { kind: "stalemate" };
    if (c.isThreefoldRepetition()) return { kind: "draw", reason: "Threefold repetition" };
    if (c.isInsufficientMaterial()) return { kind: "draw", reason: "Insufficient material" };
    if (c.isDraw()) return { kind: "draw", reason: "50-move rule" };
    if (c.inCheck()) return { kind: "check" };
    return { kind: "playing" };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen, resigned]);

  const gameOver =
    status.kind === "checkmate" ||
    status.kind === "stalemate" ||
    status.kind === "draw" ||
    status.kind === "resigned";

  const turn = chessRef.current.turn();
  const playerToMove = turn === PLAYER_COLOR && !gameOver;

  const runAIMove = useCallback(async () => {
    if (gameOver) return;
    const c = chessRef.current;
    if (c.turn() === PLAYER_COLOR) return;
    const token = ++aiTokenRef.current;
    setThinking(true);
    const fenAtRequest = c.fen();
    try {
      const resp = await requestAIMove(fenAtRequest, difficulty);
      if (token !== aiTokenRef.current) return; // canceled by new game / undo
      if (c.fen() !== fenAtRequest) return; // state changed under us
      c.move({ from: resp.from, to: resp.to, promotion: resp.promotion ?? "q" });
      setLastMove({ from: resp.from as Square, to: resp.to as Square });
      syncFromChess();
    } finally {
      if (token === aiTokenRef.current) setThinking(false);
    }
  }, [difficulty, gameOver, syncFromChess]);

  // Trigger AI whenever it's AI's turn.
  useEffect(() => {
    if (!playerToMove && !gameOver && !pendingPromotion) {
      const timer = setTimeout(() => void runAIMove(), 350);
      return () => clearTimeout(timer);
    }
  }, [playerToMove, gameOver, pendingPromotion, runAIMove, fen]);

  const legalTargetsFor = useCallback((sq: Square): Square[] => {
    const moves = chessRef.current.moves({ square: sq, verbose: true }) as Move[];
    return moves.map((m) => m.to as Square);
  }, []);

  const selectSquare = useCallback(
    (sq: Square) => {
      if (!playerToMove || pendingPromotion) return;
      const c = chessRef.current;
      const piece = c.get(sq);

      if (selected) {
        // Try to move.
        if (sq === selected) {
          setSelected(null);
          setValidTargets([]);
          return;
        }
        if (validTargets.includes(sq)) {
          const moving = c.get(selected);
          const isPromotion =
            moving?.type === "p" &&
            ((moving.color === "w" && sq.endsWith("8")) ||
              (moving.color === "b" && sq.endsWith("1")));
          if (isPromotion) {
            setPendingPromotion({ from: selected, to: sq, color: moving.color });
            setSelected(null);
            setValidTargets([]);
            return;
          }
          const result = c.move({ from: selected, to: sq, promotion: "q" });
          if (result) {
            setLastMove({ from: selected, to: sq });
            syncFromChess();
          }
          setSelected(null);
          setValidTargets([]);
          return;
        }
        // Clicked another own piece → reselect.
        if (piece && piece.color === PLAYER_COLOR) {
          setSelected(sq);
          setValidTargets(legalTargetsFor(sq));
          return;
        }
        setSelected(null);
        setValidTargets([]);
        return;
      }

      if (piece && piece.color === PLAYER_COLOR) {
        setSelected(sq);
        setValidTargets(legalTargetsFor(sq));
      }
    },
    [
      playerToMove,
      pendingPromotion,
      selected,
      validTargets,
      legalTargetsFor,
      syncFromChess,
    ],
  );

  const completePromotion = useCallback(
    (piece: "q" | "r" | "b" | "n") => {
      if (!pendingPromotion) return;
      const c = chessRef.current;
      const res = c.move({
        from: pendingPromotion.from,
        to: pendingPromotion.to,
        promotion: piece,
      });
      if (res) {
        setLastMove({ from: pendingPromotion.from, to: pendingPromotion.to });
        syncFromChess();
      }
      setPendingPromotion(null);
    },
    [pendingPromotion, syncFromChess],
  );

  const newGame = useCallback(() => {
    aiTokenRef.current++;
    chessRef.current = new Chess();
    setSelected(null);
    setValidTargets([]);
    setLastMove(null);
    setPendingPromotion(null);
    setResigned(null);
    setThinking(false);
    syncFromChess();
  }, [syncFromChess]);

  const undo = useCallback(() => {
    if (thinking) return;
    aiTokenRef.current++;
    const c = chessRef.current;
    // Undo last AI move + last player move so it's the player's turn again.
    if (c.history().length === 0) return;
    c.undo();
    if (c.turn() !== PLAYER_COLOR && c.history().length > 0) {
      c.undo();
    }
    setSelected(null);
    setValidTargets([]);
    setPendingPromotion(null);
    setResigned(null);
    const hist = c.history({ verbose: true }) as Move[];
    setLastMove(
      hist.length
        ? { from: hist[hist.length - 1].from as Square, to: hist[hist.length - 1].to as Square }
        : null,
    );
    syncFromChess();
  }, [thinking, syncFromChess]);

  const resign = useCallback(() => {
    if (gameOver) return;
    setResigned(PLAYER_COLOR);
  }, [gameOver]);

  const captured = useMemo(() => {
    const capturedByWhite: string[] = [];
    const capturedByBlack: string[] = [];
    for (const m of history) {
      if (!m.captured) continue;
      if (m.color === "w") capturedByWhite.push(m.captured);
      else capturedByBlack.push(m.captured);
    }
    return { capturedByWhite, capturedByBlack };
  }, [history]);

  return {
    fen,
    board: chessRef.current.board(),
    turn,
    playerColor: PLAYER_COLOR,
    selected,
    validTargets,
    history,
    lastMove,
    status,
    gameOver,
    thinking,
    difficulty,
    setDifficulty,
    pendingPromotion,
    captured,
    inCheck: chessRef.current.inCheck(),
    kingSquare: (() => {
      const c = chessRef.current;
      const b = c.board();
      for (let r = 0; r < 8; r++)
        for (let f = 0; f < 8; f++) {
          const sq = b[r][f];
          if (sq && sq.type === "k" && sq.color === c.turn()) {
            const file = "abcdefgh"[f];
            const rank = 8 - r;
            return `${file}${rank}` as Square;
          }
        }
      return null;
    })(),
    selectSquare,
    completePromotion,
    newGame,
    undo,
    resign,
  };
}
