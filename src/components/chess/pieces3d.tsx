import { useMemo } from "react";
import * as THREE from "three";
import type { PieceSymbol, Color } from "chess.js";

// Half-silhouette (radius, height) profiles rotated around Y to form each
// piece body. Y is up. Coordinates chosen so the base sits on y=0 and the
// piece stands within roughly [0, 1.4] tall.
type Profile = Array<[number, number]>;

const PAWN: Profile = [
  [0.0, 0.0], [0.34, 0.0], [0.34, 0.04], [0.32, 0.06], [0.24, 0.1],
  [0.2, 0.14], [0.16, 0.2], [0.14, 0.34], [0.16, 0.38], [0.2, 0.42],
  [0.19, 0.46], [0.15, 0.5], [0.18, 0.54], [0.2, 0.58], [0.2, 0.7],
  [0.17, 0.78], [0.1, 0.84], [0.0, 0.86],
];
const ROOK: Profile = [
  [0.0, 0.0], [0.38, 0.0], [0.38, 0.05], [0.34, 0.08], [0.26, 0.12],
  [0.22, 0.18], [0.2, 0.26], [0.19, 0.62], [0.22, 0.66], [0.28, 0.7],
  [0.3, 0.74], [0.3, 0.9], [0.22, 0.9], [0.22, 0.82], [0.0, 0.82],
];
const BISHOP: Profile = [
  [0.0, 0.0], [0.38, 0.0], [0.38, 0.05], [0.34, 0.08], [0.26, 0.12],
  [0.2, 0.2], [0.16, 0.28], [0.15, 0.56], [0.19, 0.6], [0.22, 0.66],
  [0.18, 0.72], [0.13, 0.84], [0.09, 0.96], [0.06, 1.06], [0.04, 1.14],
  [0.04, 1.2], [0.06, 1.24], [0.05, 1.28], [0.0, 1.3],
];
const QUEEN: Profile = [
  [0.0, 0.0], [0.4, 0.0], [0.4, 0.05], [0.36, 0.08], [0.28, 0.14],
  [0.22, 0.22], [0.19, 0.32], [0.18, 0.66], [0.22, 0.7], [0.26, 0.76],
  [0.2, 0.82], [0.16, 0.94], [0.13, 1.06], [0.12, 1.18], [0.16, 1.22],
  [0.22, 1.26], [0.24, 1.3], [0.24, 1.36], [0.14, 1.36], [0.0, 1.36],
];
const KING: Profile = [
  [0.0, 0.0], [0.42, 0.0], [0.42, 0.05], [0.38, 0.08], [0.3, 0.14],
  [0.24, 0.22], [0.21, 0.32], [0.2, 0.68], [0.24, 0.72], [0.28, 0.78],
  [0.22, 0.84], [0.18, 0.96], [0.15, 1.1], [0.14, 1.24], [0.18, 1.28],
  [0.24, 1.32], [0.26, 1.36], [0.26, 1.42], [0.14, 1.42], [0.0, 1.42],
];
const KNIGHT_BASE: Profile = [
  [0.0, 0.0], [0.38, 0.0], [0.38, 0.05], [0.34, 0.08], [0.26, 0.12],
  [0.22, 0.18], [0.2, 0.28], [0.22, 0.44], [0.24, 0.5], [0.0, 0.5],
];

const PROFILES: Record<PieceSymbol, Profile> = {
  p: PAWN, r: ROOK, b: BISHOP, n: KNIGHT_BASE, q: QUEEN, k: KING,
};

const GEO_CACHE = new Map<string, THREE.BufferGeometry>();
function latheGeometry(key: string, profile: Profile, segments = 64): THREE.BufferGeometry {
  let g = GEO_CACHE.get(key);
  if (!g) {
    const pts = profile.map(([x, y]) => new THREE.Vector2(x, y));
    g = new THREE.LatheGeometry(pts, segments);
    g.computeVertexNormals();
    GEO_CACHE.set(key, g);
  }
  return g;
}

/**
 * Physically-based luxury materials:
 * - White: warm ivory pearl with champagne sheen.
 * - Black: polished gunmetal with warm gold rim highlights.
 */
export function usePieceMaterial(color: Color): THREE.MeshPhysicalMaterial {
  return useMemo(() => {
    if (color === "w") {
      return new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#f3e7c9"),
        metalness: 0.18,
        roughness: 0.28,
        clearcoat: 0.7,
        clearcoatRoughness: 0.28,
        sheen: 0.75,
        sheenColor: new THREE.Color("#d4a45a"),
        sheenRoughness: 0.5,
        emissive: new THREE.Color("#2a1a08"),
        emissiveIntensity: 0.08,
      });
    }
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#1e2028"),
      metalness: 0.85,
      roughness: 0.28,
      clearcoat: 0.6,
      clearcoatRoughness: 0.3,
      sheen: 0.6,
      sheenColor: new THREE.Color("#e8c07a"),
      sheenRoughness: 0.4,
      emissive: new THREE.Color("#0a0b10"),
      emissiveIntensity: 0.18,
    });
  }, [color]);
}

const ACCENT_CACHE = new Map<Color, THREE.Material>();
function accentMaterial(color: Color): THREE.Material {
  let m = ACCENT_CACHE.get(color);
  if (!m) {
    m = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(color === "w" ? "#e8d089" : "#c99a5a"),
      metalness: 0.98,
      roughness: 0.22,
      clearcoat: 0.7,
    });
    ACCENT_CACHE.set(color, m);
  }
  return m;
}

export interface Piece3DProps {
  type: PieceSymbol;
  color: Color;
}

/**
 * Real 3D piece rendered as three.js geometry + PBR material.
 * Faces the camera (rotY differs for black/white to give subtle asymmetry).
 */
export function Piece3D({ type, color }: Piece3DProps) {
  const mat = usePieceMaterial(color);

  if (type === "n") {
    // Knight: cylindrical base + sculpted horse head (composited primitives).
    const baseGeo = latheGeometry("n-base", KNIGHT_BASE);
    return (
      <group rotation={[0, color === "w" ? 0.15 : Math.PI - 0.15, 0]}>
        <mesh geometry={baseGeo} material={mat} castShadow receiveShadow />
        {/* neck */}
        <mesh
          position={[0, 0.6, 0.02]}
          rotation={[0.35, 0, 0]}
          material={mat}
          castShadow
        >
          <cylinderGeometry args={[0.14, 0.22, 0.5, 24]} />
        </mesh>
        {/* head block */}
        <mesh
          position={[0, 0.92, 0.16]}
          rotation={[0.2, 0, 0]}
          material={mat}
          castShadow
        >
          <boxGeometry args={[0.22, 0.32, 0.5]} />
        </mesh>
        {/* snout */}
        <mesh
          position={[0, 0.82, 0.42]}
          rotation={[0.35, 0, 0]}
          material={mat}
          castShadow
        >
          <boxGeometry args={[0.18, 0.18, 0.22]} />
        </mesh>
        {/* mane ridge */}
        <mesh
          position={[0, 1.05, -0.05]}
          rotation={[-0.2, 0, 0]}
          material={mat}
          castShadow
        >
          <boxGeometry args={[0.12, 0.28, 0.42]} />
        </mesh>
        {/* ears */}
        <mesh position={[0.09, 1.15, 0.12]} material={mat}>
          <coneGeometry args={[0.04, 0.12, 12]} />
        </mesh>
        <mesh position={[-0.09, 1.15, 0.12]} material={mat}>
          <coneGeometry args={[0.04, 0.12, 12]} />
        </mesh>
      </group>
    );
  }

  const geo = latheGeometry(type, PROFILES[type]);
  const rotY = color === "w" ? 0 : Math.PI;

  return (
    <group rotation={[0, rotY, 0]}>
      <mesh geometry={geo} material={mat} castShadow receiveShadow />

      {type === "k" && (
        <group position={[0, 1.42, 0]}>
          <mesh material={accentMaterial(color)} position={[0, 0.14, 0]}>
            <boxGeometry args={[0.07, 0.32, 0.07]} />
          </mesh>
          <mesh material={accentMaterial(color)} position={[0, 0.2, 0]}>
            <boxGeometry args={[0.22, 0.07, 0.07]} />
          </mesh>
        </group>
      )}

      {type === "q" &&
        Array.from({ length: 9 }).map((_, i) => {
          const a = (i / 9) * Math.PI * 2;
          const r = 0.19;
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

      {type === "b" && (
        <mesh position={[0, 1.06, 0]} material={mat}>
          <boxGeometry args={[0.03, 0.18, 0.16]} />
        </mesh>
      )}
    </group>
  );
}
