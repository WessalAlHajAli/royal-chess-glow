import type { GameStatus } from "@/hooks/useChessGame";

export function GameOverDialog({
  status,
  onNewGame,
  onDismiss,
}: {
  status: GameStatus;
  onNewGame: () => void;
  onDismiss: () => void;
}) {
  let title = "";
  let subtitle = "";
  switch (status.kind) {
    case "checkmate":
      title = status.winner === "w" ? "You win" : "Checkmate";
      subtitle =
        status.winner === "w"
          ? "A decisive victory."
          : "The AI delivered checkmate.";
      break;
    case "stalemate":
      title = "Stalemate";
      subtitle = "No legal moves — the game is drawn.";
      break;
    case "draw":
      title = "Draw";
      subtitle = status.reason;
      break;
    case "resigned":
      title = status.winner === "w" ? "AI resigned" : "You resigned";
      subtitle =
        status.winner === "w"
          ? "The AI conceded the game."
          : "Ready for another?";
      break;
    default:
      return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-sm rounded-2xl p-8 text-center">
        <h2 className="font-display text-4xl text-gold-gradient">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={onNewGame}
            className="rounded-full bg-[var(--color-gold)] px-5 py-2 text-sm font-semibold text-[var(--primary-foreground)] transition hover:brightness-110"
          >
            New game
          </button>
          <button
            onClick={onDismiss}
            className="rounded-full border border-white/15 px-5 py-2 text-sm text-foreground/80 transition hover:bg-white/5"
          >
            Review board
          </button>
        </div>
      </div>
    </div>
  );
}
