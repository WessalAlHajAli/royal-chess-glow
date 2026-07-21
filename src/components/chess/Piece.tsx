import type { PieceSymbol, Color } from "chess.js";

// Cburnett SVG piece set (public domain / CC-BY-SA on Wikimedia Commons).
// Imported as raw text so we can inject gradient fills for a metallic look.
import wK from "@/assets/pieces/wK.svg?raw";
import wQ from "@/assets/pieces/wQ.svg?raw";
import wR from "@/assets/pieces/wR.svg?raw";
import wB from "@/assets/pieces/wB.svg?raw";
import wN from "@/assets/pieces/wN.svg?raw";
import wP from "@/assets/pieces/wP.svg?raw";
import bK from "@/assets/pieces/bK.svg?raw";
import bQ from "@/assets/pieces/bQ.svg?raw";
import bR from "@/assets/pieces/bR.svg?raw";
import bB from "@/assets/pieces/bB.svg?raw";
import bN from "@/assets/pieces/bN.svg?raw";
import bP from "@/assets/pieces/bP.svg?raw";

const RAW: Record<Color, Record<PieceSymbol, string>> = {
  w: { k: wK, q: wQ, r: wR, b: wB, n: wN, p: wP },
  b: { k: bK, q: bQ, r: bR, b: bB, n: bN, p: bP },
};

// Metallic gradient defs (pearl-ivory / charcoal) injected once into every SVG.
const DEFS = `
<defs>
  <linearGradient id="pieceLight" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#fffdf3"/>
    <stop offset="45%" stop-color="#f4e9c9"/>
    <stop offset="100%" stop-color="#b09867"/>
  </linearGradient>
  <linearGradient id="pieceLightRim" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="30%" stop-color="#ffffff" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="pieceDark" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#5a5a63"/>
    <stop offset="30%" stop-color="#33333a"/>
    <stop offset="70%" stop-color="#141418"/>
    <stop offset="100%" stop-color="#050508"/>
  </linearGradient>
  <linearGradient id="pieceDarkRim" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#a9a9b3" stop-opacity="0.55"/>
    <stop offset="18%" stop-color="#a9a9b3" stop-opacity="0"/>
  </linearGradient>
  <radialGradient id="pieceShine" cx="0.35" cy="0.25" r="0.5">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="60%" stop-color="#ffffff" stop-opacity="0"/>
  </radialGradient>
</defs>`;

function themeSvg(raw: string, color: Color): string {
  const bodyFill = color === "w" ? "url(#pieceLight)" : "url(#pieceDark)";
  const rimFill = color === "w" ? "url(#pieceLightRim)" : "url(#pieceDarkRim)";
  const strokeColor = color === "w" ? "#3d2a10" : "#000";
  const strokeWidth = color === "w" ? "1.3" : "1.5";

  let svg = raw
    // Body fills
    .replace(/fill="#fff"/gi, `fill="${bodyFill}"`)
    .replace(/fill="#ffffff"/gi, `fill="${bodyFill}"`)
    .replace(/fill="white"/gi, `fill="${bodyFill}"`)
    .replace(/fill="#000"/gi, `fill="${color === "w" ? strokeColor : bodyFill}"`)
    .replace(/fill="#000000"/gi, `fill="${color === "w" ? strokeColor : bodyFill}"`)
    .replace(/fill="black"/gi, `fill="${color === "w" ? strokeColor : bodyFill}"`)
    // Stroke colors — keep warm dark on white pieces, keep near-black on dark
    .replace(/stroke="#000"/gi, `stroke="${strokeColor}"`)
    .replace(/stroke="#000000"/gi, `stroke="${strokeColor}"`)
    // Add a subtle stroke on any root <g> that only sets fill.
    .replace(/<g /, `<g stroke-width="${strokeWidth}" `);

  // Inject defs + shine/rim overlays before </svg>
  const overlay = `
    <rect x="0" y="0" width="45" height="45" fill="url(#pieceShine)" pointer-events="none"/>
    <rect x="0" y="0" width="45" height="45" fill="${rimFill}" pointer-events="none"/>
  `;
  // Force viewBox + fluid sizing so the piece scales to its container.
  svg = svg
    .replace(/<svg([^>]*)>/, (_m, attrs: string) => {
      let a = attrs
        .replace(/\swidth="[^"]*"/i, "")
        .replace(/\sheight="[^"]*"/i, "");
      if (!/viewBox/i.test(a)) a += ' viewBox="0 0 45 45"';
      return `<svg${a} width="100%" height="100%" preserveAspectRatio="xMidYMid meet">${DEFS}`;
    })
    .replace(/<\/svg>/, `${overlay}</svg>`);
  return svg;
}

export function Piece({
  type,
  color,
  size = 64,
}: {
  type: PieceSymbol;
  color: Color;
  size?: number;
}) {
  const raw = RAW[color][type];
  const html = themeSvg(raw, color);
  return (
    <span
      aria-hidden
      className="pointer-events-none block select-none"
      style={{
        width: size,
        height: size,
        filter:
          color === "w"
            ? "drop-shadow(0 3px 4px rgba(0,0,0,0.55)) drop-shadow(0 1px 0 rgba(255,240,200,0.35))"
            : "drop-shadow(0 3px 6px rgba(0,0,0,0.85)) drop-shadow(0 0 1px rgba(255,255,255,0.08))",
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
