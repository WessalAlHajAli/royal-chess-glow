import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useChessGame } from "@/hooks/useChessGame";
import { ChessBoard } from "@/components/chess/ChessBoard";
import { PlayerPanel } from "@/components/chess/PlayerPanel";
import { MoveHistory } from "@/components/chess/MoveHistory";
import { Controls } from "@/components/chess/Controls";
import { PromotionDialog } from "@/components/chess/PromotionDialog";
import { GameOverDialog } from "@/components/chess/GameOverDialog";
import type { Difficulty } from "@/lib/chess/ai";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gilded — Play Chess Against a Modular AI" },
      {
        name: "description",
        content:
          "A premium, front-facing chess board with four AI difficulty levels — Easy, Medium, Hard, and Master. Full rules, castling, en passant, and promotion in a dark glassmorphism UI.",
      },
      { property: "og:title", content: "Gilded — Play Chess Against a Modular AI" },
      {
        property: "og:description",
        content:
          "Play a fully rules-correct chess game against a modular AI engine with adjustable difficulty.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const ELO_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 800,
  medium: 1400,
  hard: 1900,
  master: 2400,
};

const DIFF_LABEL: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
  master: "Master",
};

function Index() {
  const game = useChessGame();
  const [dismissedOver, setDismissedOver] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const {
    board: _b,
    turn,
    thinking,
    status,
    difficulty,
    setDifficulty,
    pendingPromotion,
    captured,
    history,
    gameOver,
    completePromotion,
    newGame,
    undo,
    resign,
  } = game;

  // Reset dismissal on new game.
  useEffect(() => {
    if (!gameOver) setDismissedOver(false);
  }, [gameOver]);

  const statusLabel = (() => {
    switch (status.kind) {
      case "check":
        return "Check";
      case "checkmate":
        return `Checkmate — ${status.winner === "w" ? "You win" : "AI wins"}`;
      case "stalemate":
        return "Stalemate";
      case "draw":
        return `Draw · ${status.reason}`;
      case "resigned":
        return status.winner === "w" ? "AI resigned" : "You resigned";
      default:
        return turn === "w" ? "Your move" : "AI to move";
    }
  })();

  return (
    <div className="min-h-screen w-full">
      {/* Header */}
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 sm:py-8">
        <div className="flex items-center gap-3">
          <div
            aria-hidden
            className="grid h-10 w-10 place-items-center rounded-xl text-2xl"
            style={{
              background:
                "linear-gradient(160deg, #f0d98a 0%, #b8892f 100%)",
              boxShadow:
                "0 0 24px -4px rgba(230,190,90,0.6), inset 0 1px 0 rgba(255,255,255,0.5)",
              color: "#3a2a10",
            }}
          >
            ♞
          </div>
          <div className="leading-tight">
            <div className="font-display text-2xl text-gold-gradient sm:text-3xl">
              Gilded
            </div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Chess Salon
            </div>
          </div>
        </div>
        <div className="hidden text-right text-xs text-muted-foreground sm:block">
          <div className="uppercase tracking-[0.25em]">Status</div>
          <div className="mt-0.5 font-semibold text-foreground/90">
            {statusLabel}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-3 pb-24 sm:px-6">
        {/* Mobile status banner */}
        <div className="mb-3 sm:hidden">
          <div className="glass-panel flex items-center justify-between rounded-xl px-4 py-2 text-xs">
            <span className="uppercase tracking-[0.25em] text-muted-foreground">
              Status
            </span>
            <span className="font-semibold text-foreground/90">{statusLabel}</span>
          </div>
        </div>

        {/* Mobile: compact player strip above the board */}
        <div className="mb-3 grid grid-cols-2 gap-2 sm:hidden">
          <PlayerPanel
            name="You"
            elo={1500}
            color="w"
            isTurn={turn === "w" && !gameOver}
            captured={captured.capturedByWhite as never}
            opponentCaptured={captured.capturedByBlack as never}
            align="left"
          />
          <PlayerPanel
            name="Gilded AI"
            elo={ELO_BY_DIFFICULTY[difficulty]}
            color="b"
            isTurn={turn === "b" && !gameOver}
            isThinking={thinking}
            isAI
            captured={captured.capturedByBlack as never}
            opponentCaptured={captured.capturedByWhite as never}
            align="right"
            difficulty={DIFF_LABEL[difficulty]}
          />
        </div>

        {/* Main 3-col layout on desktop, single column on mobile */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(240px,300px)_minmax(0,1fr)_minmax(240px,300px)]">
          {/* Left panel (desktop) */}
          <aside className="hidden flex-col gap-4 lg:flex">
            <PlayerPanel
              name="You"
              elo={1500}
              color="w"
              isTurn={turn === "w" && !gameOver}
              captured={captured.capturedByWhite as never}
              opponentCaptured={captured.capturedByBlack as never}
              align="left"
            />
            <MoveHistory history={history} />
          </aside>

          {/* Board */}
          <div className="flex flex-col items-center">
            <ChessBoard game={game} />
          </div>

          {/* Right panel (desktop) */}
          <aside className="hidden flex-col gap-4 lg:flex">
            <PlayerPanel
              name="Gilded AI"
              elo={ELO_BY_DIFFICULTY[difficulty]}
              color="b"
              isTurn={turn === "b" && !gameOver}
              isThinking={thinking}
              isAI
              captured={captured.capturedByBlack as never}
              opponentCaptured={captured.capturedByWhite as never}
              align="left"
              difficulty={DIFF_LABEL[difficulty]}
            />
            <Controls
              difficulty={difficulty}
              onDifficulty={setDifficulty}
              onNewGame={newGame}
              onUndo={undo}
              onResign={resign}
              canUndo={history.length > 0 && !thinking}
              gameOver={gameOver}
            />
          </aside>

          {/* Mobile-only controls + history bottom sheet */}
          <div className="flex flex-col gap-3 lg:hidden">
            <Controls
              difficulty={difficulty}
              onDifficulty={setDifficulty}
              onNewGame={newGame}
              onUndo={undo}
              onResign={resign}
              canUndo={history.length > 0 && !thinking}
              gameOver={gameOver}
            />
            <button
              onClick={() => setHistoryOpen((v) => !v)}
              className="glass-panel flex items-center justify-between rounded-xl px-4 py-3 text-sm"
            >
              <span className="uppercase tracking-[0.2em] text-muted-foreground">
                Move history · {history.length}
              </span>
              <span className={cn("transition", historyOpen && "rotate-180")}>
                ▾
              </span>
            </button>
            {historyOpen && <MoveHistory history={history} />}
          </div>
        </div>
      </main>

      {pendingPromotion && (
        <PromotionDialog
          color={pendingPromotion.color}
          onPick={completePromotion}
        />
      )}
      {gameOver && !dismissedOver && (
        <GameOverDialog
          status={status}
          onNewGame={newGame}
          onDismiss={() => setDismissedOver(true)}
        />
      )}
    </div>
  );
}
