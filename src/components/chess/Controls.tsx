import type { Difficulty } from "@/lib/chess/ai";
import { cn } from "@/lib/utils";

const DIFFS: { value: Difficulty; label: string }[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
  { value: "master", label: "Master" },
];

export function Controls({
  difficulty,
  onDifficulty,
  onNewGame,
  onUndo,
  onResign,
  canUndo,
  gameOver,
}: {
  difficulty: Difficulty;
  onDifficulty: (d: Difficulty) => void;
  onNewGame: () => void;
  onUndo: () => void;
  onResign: () => void;
  canUndo: boolean;
  gameOver: boolean;
}) {
  return (
    <div className="glass-panel rounded-2xl p-4">
      <div className="mb-3">
        <div className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Difficulty
        </div>
        <div className="grid grid-cols-4 gap-1 rounded-full bg-black/30 p-1">
          {DIFFS.map((d) => (
            <button
              key={d.value}
              onClick={() => onDifficulty(d.value)}
              className={cn(
                "h-9 rounded-full text-xs font-semibold uppercase tracking-wider transition",
                difficulty === d.value
                  ? "bg-[var(--color-gold)] text-[var(--primary-foreground)] shadow-[0_0_20px_-4px_var(--color-gold)]"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={onNewGame}
          className="h-11 rounded-xl bg-[var(--color-gold)] text-sm font-semibold text-[var(--primary-foreground)] transition hover:brightness-110 active:scale-[0.98]"
        >
          New game
        </button>
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="h-11 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-foreground/90 transition hover:bg-white/10 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Undo
        </button>
        <button
          onClick={onResign}
          disabled={gameOver}
          className="h-11 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-foreground/70 transition hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Resign
        </button>
      </div>
    </div>
  );
}
