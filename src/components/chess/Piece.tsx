import type { PieceSymbol, Color } from "chess.js";

import wK from "@/assets/pieces3d/wK.png";
import wQ from "@/assets/pieces3d/wQ.png";
import wR from "@/assets/pieces3d/wR.png";
import wB from "@/assets/pieces3d/wB.png";
import wN from "@/assets/pieces3d/wN.png";
import wP from "@/assets/pieces3d/wP.png";
import bK from "@/assets/pieces3d/bK.png";
import bQ from "@/assets/pieces3d/bQ.png";
import bR from "@/assets/pieces3d/bR.png";
import bB from "@/assets/pieces3d/bB.png";
import bN from "@/assets/pieces3d/bN.png";
import bP from "@/assets/pieces3d/bP.png";

const SPRITES: Record<Color, Record<PieceSymbol, string>> = {
  w: { k: wK, q: wQ, r: wR, b: wB, n: wN, p: wP },
  b: { k: bK, q: bQ, r: bR, b: bB, n: bN, p: bP },
};

const NAMES: Record<PieceSymbol, string> = {
  k: "king",
  q: "queen",
  r: "rook",
  b: "bishop",
  n: "knight",
  p: "pawn",
};

/**
 * A single chess piece rendered as a photoreal pre-rendered 3D image.
 * Uses PNGs generated with premium image gen for consistent, high-quality
 * results across all 32 pieces without WebGL context pressure.
 */
export function Piece({
  type,
  color,
  size,
}: {
  type: PieceSymbol;
  color: Color;
  size?: number | string;
}) {
  const dim = size ?? "100%";
  const dropShadow =
    color === "w"
      ? "drop-shadow(0 4px 6px rgba(0,0,0,0.55))"
      : "drop-shadow(0 4px 8px rgba(0,0,0,0.8))";
  return (
    <img
      src={SPRITES[color][type]}
      alt={`${color === "w" ? "white" : "black"} ${NAMES[type]}`}
      draggable={false}
      className="pointer-events-none select-none object-contain"
      style={{
        width: dim,
        height: dim,
        filter: dropShadow,
      }}
    />
  );
}
