import type { Square } from "chess.js";
import { Piece } from "./Piece";
import { useChessGame } from "@/hooks/useChessGame";
import { cn } from "@/lib/utils";

type Game = ReturnType<typeof useChessGame>;

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;

export function ChessBoard({ game }: { game: Game }) {
  const {
    board,
    selected,
    validTargets,
    lastMove,
    selectSquare,
    inCheck,
    kingSquare,
  } = game;

  return (
    <div
      className="relative aspect-square w-full max-w-[min(92vw,720px)]"
      style={{
        // Gold beveled frame + ambient glow
        padding: "clamp(10px, 2.2%, 22px)",
        borderRadius: 18,
        background:
          "linear-gradient(145deg, #4a3a1e 0%, #2a1f10 45%, #1a130a 100%)",
        boxShadow:
          "0 0 0 1px rgba(212,175,90,0.35), 0 0 60px -10px rgba(212,175,90,0.35), 0 30px 80px -20px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,220,150,0.25), inset 0 -2px 6px rgba(0,0,0,0.7)",
      }}
    >
      <div
        className="relative grid h-full w-full overflow-hidden"
        style={{
          gridTemplateColumns: "repeat(8, 1fr)",
          gridTemplateRows: "repeat(8, 1fr)",
          borderRadius: 8,
          boxShadow:
            "inset 0 0 0 1px rgba(212,175,90,0.5), inset 0 0 30px rgba(0,0,0,0.5)",
        }}
      >
        {board.map((row, r) =>
          row.map((piece, f) => {
            const file = FILES[f];
            const rank = 8 - r;
            const sq = `${file}${rank}` as Square;
            const isLight = (r + f) % 2 === 0;
            const isSelected = selected === sq;
            const isTarget = validTargets.includes(sq);
            const isLast =
              lastMove && (lastMove.from === sq || lastMove.to === sq);
            const isCheck = inCheck && kingSquare === sq;
            const hasCapture = isTarget && !!piece;

            return (
              <button
                key={sq}
                type="button"
                onClick={() => selectSquare(sq)}
                className={cn(
                  "relative flex items-center justify-center transition-colors focus:outline-none",
                )}
                style={{
                  background: isLight
                    ? "linear-gradient(160deg, #efe1bc 0%, #d9c48a 100%)"
                    : "linear-gradient(160deg, #3a2f22 0%, #241c12 100%)",
                  boxShadow: isLight
                    ? "inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 2px rgba(0,0,0,0.15)"
                    : "inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -2px 4px rgba(0,0,0,0.6)",
                }}
                aria-label={sq}
              >
                {/* highlight overlays */}
                {isLast && (
                  <span
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(230,190,90,0.35), rgba(230,190,90,0.18))",
                      mixBlendMode: "overlay",
                    }}
                  />
                )}
                {isCheck && (
                  <span
                    className="pointer-events-none absolute inset-0 animate-pulse"
                    style={{
                      background:
                        "radial-gradient(circle at center, rgba(255,60,60,0.55), rgba(255,60,60,0) 70%)",
                    }}
                  />
                )}
                {isSelected && (
                  <span
                    className="pointer-events-none absolute inset-0"
                    style={{
                      boxShadow:
                        "inset 0 0 0 3px rgba(230,190,90,0.9), inset 0 0 24px rgba(230,190,90,0.4)",
                    }}
                  />
                )}

                {piece && (
                  <span
                    key={`${sq}-${piece.color}${piece.type}`}
                    className="relative z-10 flex h-[86%] w-[86%] items-center justify-center"
                    style={{
                      animation:
                        isLast && lastMove?.to === sq
                          ? "chess-move 260ms cubic-bezier(0.2,0.7,0.2,1)"
                          : undefined,
                    }}
                  >
                    <Piece type={piece.type} color={piece.color} />
                  </span>
                )}

                {/* move-target dot / capture ring */}
                {isTarget && !hasCapture && (
                  <span
                    className="pointer-events-none absolute rounded-full"
                    style={{
                      width: "26%",
                      height: "26%",
                      background:
                        "radial-gradient(circle, rgba(230,190,90,0.85) 0%, rgba(230,190,90,0.5) 60%, transparent 100%)",
                      boxShadow: "0 0 12px rgba(230,190,90,0.6)",
                    }}
                  />
                )}
                {isTarget && hasCapture && (
                  <span
                    className="pointer-events-none absolute inset-[6%] rounded-full"
                    style={{
                      boxShadow:
                        "inset 0 0 0 4px rgba(230,190,90,0.85), 0 0 18px rgba(230,190,90,0.55)",
                    }}
                  />
                )}

                {/* coordinates */}
                {f === 0 && (
                  <span
                    className="pointer-events-none absolute left-1 top-0.5 text-[10px] font-semibold sm:text-xs"
                    style={{
                      color: isLight
                        ? "rgba(80,55,20,0.7)"
                        : "rgba(230,200,140,0.7)",
                    }}
                  >
                    {rank}
                  </span>
                )}
                {r === 7 && (
                  <span
                    className="pointer-events-none absolute bottom-0.5 right-1 text-[10px] font-semibold sm:text-xs"
                    style={{
                      color: isLight
                        ? "rgba(80,55,20,0.7)"
                        : "rgba(230,200,140,0.7)",
                    }}
                  >
                    {file}
                  </span>
                )}
              </button>
            );
          }),
        )}
      </div>

      <style>{`
        @keyframes chess-move {
          0% { transform: scale(0.92); filter: brightness(1.35); }
          100% { transform: scale(1); filter: brightness(1); }
        }
      `}</style>
    </div>
  );
}
