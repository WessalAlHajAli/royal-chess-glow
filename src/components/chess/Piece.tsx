import type { PieceSymbol, Color } from "chess.js";

const GLYPHS: Record<PieceSymbol, string> = {
  k: "♚",
  q: "♛",
  r: "♜",
  b: "♝",
  n: "♞",
  p: "♟",
};

export function Piece({
  type,
  color,
  size = 64,
}: {
  type: PieceSymbol;
  color: Color;
  size?: number;
}) {
  const isWhite = color === "w";
  return (
    <span
      aria-hidden
      className="pointer-events-none select-none leading-none"
      style={{
        fontSize: size,
        lineHeight: 1,
        display: "inline-block",
        transform: "translateY(-2%)",
        // Metallic ivory / charcoal gradient with rim light and cast shadow.
        background: isWhite
          ? "linear-gradient(180deg, #fdf6e3 0%, #f0e6cf 45%, #b8a882 100%)"
          : "linear-gradient(180deg, #4a4a52 0%, #2a2a30 50%, #0d0d10 100%)",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        WebkitTextStroke: isWhite
          ? "0.5px rgba(90,70,30,0.55)"
          : "0.5px rgba(0,0,0,0.9)",
        filter: isWhite
          ? "drop-shadow(0 3px 4px rgba(0,0,0,0.55)) drop-shadow(0 1px 0 rgba(255,240,200,0.35))"
          : "drop-shadow(0 3px 5px rgba(0,0,0,0.75)) drop-shadow(0 1px 0 rgba(255,255,255,0.05))",
      }}
    >
      {GLYPHS[type]}
    </span>
  );
}
