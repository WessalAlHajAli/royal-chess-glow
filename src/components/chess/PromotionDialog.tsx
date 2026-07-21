import type { Color, PieceSymbol } from "chess.js";
import { Piece } from "./Piece";

export function PromotionDialog({
  color,
  onPick,
}: {
  color: Color;
  onPick: (p: "q" | "r" | "b" | "n") => void;
}) {
  const options: PieceSymbol[] = ["q", "r", "b", "n"];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="glass-panel rounded-2xl p-6">
        <h3 className="mb-4 text-center font-display text-2xl text-gold-gradient">
          Promote pawn
        </h3>
        <div className="flex gap-3">
          {options.map((p) => (
            <button
              key={p}
              onClick={() => onPick(p as "q" | "r" | "b" | "n")}
              className="grid h-20 w-20 place-items-center rounded-xl border border-white/10 bg-white/5 transition hover:border-[var(--color-gold)] hover:bg-white/10"
            >
              <Piece type={p} color={color} size={56} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
