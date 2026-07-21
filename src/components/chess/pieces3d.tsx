import { useMemo } from "react";
import * as THREE from "three";
import type { PieceSymbol, Color } from "chess.js";

// Half-silhouette (radius, height) profiles rotated around Y to form each
// piece body. Y is up.
type Profile = Array<[number, number]>;

const PAWN: Profile = [
  [0.0, 0.0], [0.32, 0.0], [0.32, 0.04], [0.24, 0.09], [0.19, 0.12],
  [0.14, 0.18], [0.13, 0.34], [0.16, 0.38], [0.2, 0.42], [0.19, 0.46],
  [0.15, 0.5], [0.18, 0.54], [0.2, 0.58], [0.2, 0.66], [0.16, 0.74],
  [0.08, 0.79], [0.0, 0.8],
];
const ROOK: Profile = [
  [0.0, 0.0], [0.36, 0.0], [0.36, 0.05], [0.28, 0.1], [0.22, 0.14],
  [0.2, 0.22], [0.19, 0.55], [0.22, 0.62], [0.28, 0.66], [0.3, 0.7],
  [0.3, 0.86], [0.22, 0.86], [0.22, 0.78], [0.0, 0.78],
];
const BISHOP: Profile = [
  [0.0, 0.0], [0.36, 0.0], [0.36, 0.05], [0.26, 0.1], [0.2, 0.16],
  [0.16, 0.24], [0.15, 0.5], [0.19, 0.55], [0.22, 0.62], [0.18, 0.68],
  [0.13, 0.78], [0.09, 0.88], [0.06, 0.98], [0.04, 1.06], [0.02, 1.12],
  [0.05, 1.16], [0.08, 1.2], [0.05, 1.24], [0.0, 1.26],
];
const QUEEN: Profile = [
  [0.0, 0.0], [0.4, 0.0], [0.4, 0.05], [0.3, 0.1], [0.24, 0.16], [0.2, 0.24],
  [0.18, 0.6], [0.22, 0.66], [0.26, 0.72], [0.2, 0.78], [0.16, 0.9],
  [0.13, 1.02], [0.12, 1.14], [0.16, 1.2], [0.22, 1.24], [0.24, 1.28],
  [0.24, 1.34], [0.14, 1.34], [0.0, 1.34],
];
const KING: Profile = [
  [0.0, 0.0], [0.42, 0.0], [0.42, 0.05], [0.32, 0.1], [0.26, 0.16],
  [0.22, 0.24], [0.2, 0.62], [0.24, 0.68], [0.28, 0.74], [0.22, 0.8],
  [0.18, 0.92], [0.15, 1.06], [0.14, 1.2], [0.18, 1.26], [0.24, 1.3],
  [0.26, 1.34], [0.26, 1.4], [0.14, 1.4], [0.0, 1.4],
];
const KNIGHT: Profile = [
  [0.0, 0.0], [0.36, 0.0], [0.36, 0.05], [0.28, 0.1], [0.22, 0.16],
  [0.2, 0.24], [0.2, 0.4], [0.24, 0.5], [0.24, 0.62], [0.18, 0.62],
  [0.14, 0.72], [0.0, 0.78],
];

const PROFILES: Record<PieceSymbol, Profile> = {
  p: PAWN, r: ROOK, b: BISHOP, n: KNIGHT, q: QUEEN, k: KING,
};

const GEO_CACHE = new Map<PieceSymbol, THREE.BufferGeometry>();
function geometryFor(type: PieceSymbol): THREE.BufferGeometry {
  let g = GEO_CACHE.get(type);
  if (!g) {
    const pts = PROFILES[type].map(([x, y]) => new THREE.Vector2(x, y));
    g = new THREE.LatheGeometry(pts, 48);
    g.computeVertexNormals();
    GEO_CACHE.set(type, g);
  }
  return g;
}

/**
 * Two distinct luxury materials:
 * - White = ivory / warm pearl with subtle champagne clearcoat sheen.
 * - Black = polished gunmetal / graphite with warm gold rim.
 */
export function usePieceMaterial(color: Color) {
  return useMemo(() => {
    if (color === "w") {
      return new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#f2e6c8"),
        metalness: 0.15,
        roughness: 0.32,
        clearcoat: 0.65,
        clearcoatRoughness: 0.3,
        sheen: 0.7,
        sheenColor: new THREE.Color("#d4a45a"),
        sheenRoughness: 0.5,
        emissive: new THREE.Color("#2a1a08"),
        emissiveIntensity: 0.1,
      });
    }
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#22252f"),
      metalness: 0.9,
      roughness: 0.26,
      clearcoat: 0.55,
      clearcoatRoughness: 0.32,
      sheen: 0.5,
      sheenColor: new THREE.Color("#e8c07a"),
      sheenRoughness: 0.4,
      emissive: new THREE.Color("#0a0b10"),
      emissiveIntensity: 0.22,
    });
  }, [color]);
}

const ACCENT_CACHE = new Map<Color, THREE.Material>();
function accentMaterial(color: Color) {
  let m = ACCENT_CACHE.get(color);
  if (!m) {
    m = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(color === "w" ? "#e8d089" : "#b48d54"),
      metalness: 0.95,
      roughness: 0.25,
      clearcoat: 0.6,
    });
    ACCENT_CACHE.set(color, m);
  }
  return m;
}

export interface Piece3DProps {
  type: PieceSymbol;
  color: Color;
  position: [number, number, number];
  scale?: number;
}

export function Piece3D({ type, color, position, scale = 1 }: Piece3DProps) {
  const geo = geometryFor(type);
  const mat = usePieceMaterial(color);
  const rotY = color === "w" ? 0 : Math.PI;
  return (
    <group position={position} scale={[scale, scale, scale]} rotation={[0, rotY, 0]}>
      <mesh geometry={geo} material={mat} />

      {type === "k" && (
        <group position={[0, 1.4, 0]}>
          <mesh material={accentMaterial(color)} position={[0, 0.1, 0]}>
            <boxGeometry args={[0.06, 0.28, 0.06]} />
          </mesh>
          <mesh material={accentMaterial(color)} position={[0, 0.17, 0]}>
            <boxGeometry args={[0.2, 0.06, 0.06]} />
          </mesh>
        </group>
      )}

      {type === "q" &&
        Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2;
          const r = 0.2;
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * r, 1.4, Math.sin(a) * r]}
              material={accentMaterial(color)}
            >
              <sphereGeometry args={[0.055, 14, 14]} />
            </mesh>
          );
        })}

      {type === "n" && (
        <mesh
          position={[0, 0.62, 0.18]}
          rotation={[Math.PI / 2.6, 0, 0]}
          material={mat}
        >
          <coneGeometry args={[0.14, 0.36, 20]} />
        </mesh>
      )}

      {type === "b" && (
        <mesh position={[0, 1.08, 0]} material={mat}>
          <boxGeometry args={[0.03, 0.16, 0.16]} />
        </mesh>
      )}
    </group>
  );
}
