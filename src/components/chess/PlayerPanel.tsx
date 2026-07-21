import type { Color, PieceSymbol } from "chess.js";
import { cn } from "@/lib/utils";

const GLYPHS: Record<PieceSymbol, string> = {
  k: "♚",
  q: "♛",
  r: "♜",
  b: "♝",
  n: "♞",
  p: "♟",
};

const VALUE: Record<PieceSymbol, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

export function PlayerPanel({
  name,
  elo,
  color,
  isTurn,
  isThinking,
  captured,
  opponentCaptured,
  isAI,
  align = "left",
  difficulty,
}: {
  name: string;
  elo: number;
  color: Color;
  isTurn: boolean;
  isThinking?: boolean;
  captured: PieceSymbol[];
  opponentCaptured: PieceSymbol[];
  isAI?: boolean;
  align?: "left" | "right";
  difficulty?: string;
}) {
  // Material advantage: sum of my captures - sum of opponent's captures.
  const myScore = captured.reduce((s, p) => s + VALUE[p], 0);
  const oppScore = opponentCaptured.reduce((s, p) => s + VALUE[p], 0);
  const advantage = myScore - oppScore;

  return (
    <div
      className={cn(
        "glass-panel rounded-2xl p-4 sm:p-5",
        align === "right" ? "text-right" : "text-left",
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3 sm:gap-4",
          align === "right" && "flex-row-reverse",
        )}
      >
        <div
          className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full text-2xl sm:h-14 sm:w-14"
          style={{
            background:
              color === "w"
                ? "linear-gradient(145deg, #fdf6e3, #b8a882)"
                : "linear-gradient(145deg, #3a3a42, #0d0d10)",
            boxShadow: isTurn
              ? "0 0 0 2px var(--color-gold), 0 0 24px -2px var(--color-gold)"
              : "0 0 0 1px rgba(255,255,255,0.08)",
            color: color === "w" ? "#3a2a10" : "#e8d9a8",
          }}
        >
          {isAI ? "◈" : "♛"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <span className="truncate">{isAI ? "AI Opponent" : "You"}</span>
            {isThinking && (
              <span className="inline-flex items-center gap-1 text-gold">
                <span className="h-1 w-1 animate-pulse rounded-full bg-current" />
                thinking
              </span>
            )}
          </div>
          <div className="truncate font-display text-2xl font-semibold text-gold-gradient sm:text-3xl">
            {name}
          </div>
          <div className="text-xs text-muted-foreground">
            ELO {elo}
            {difficulty ? ` · ${difficulty}` : ""}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "mt-3 flex flex-wrap items-center gap-1 text-xl leading-none",
          align === "right" && "justify-end",
        )}
        style={{ color: color === "w" ? "#d9c48a" : "#a8a8b0" }}
      >
        {captured.length === 0 ? (
          <span className="text-xs text-muted-foreground/70">no captures yet</span>
        ) : (
          captured
            .slice()
            .sort((a, b) => VALUE[b] - VALUE[a])
            .map((p, i) => (
              <span key={i} className="opacity-90">
                {GLYPHS[p]}
              </span>
            ))
        )}
        {advantage > 0 && (
          <span className="ml-1 text-xs font-semibold text-gold">
            +{advantage}
          </span>
        )}
      </div>
    </div>
  );
}
