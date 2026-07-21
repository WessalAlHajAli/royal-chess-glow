import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrthographicCamera } from "@react-three/drei";
import type { PieceSymbol, Color } from "chess.js";
import { Piece3D } from "./pieces3d";
import { ClientOnly } from "./ClientOnly";

/**
 * Renders a single chess piece as a real 3D object (Three.js lathe geometry
 * with physically based materials, real lights, contact shadow).
 *
 * The 2D board stays exactly as it was; each square hosts one of these
 * self-contained mini-scenes.
 */
function PieceScene({ type, color }: { type: PieceSymbol; color: Color }) {
  const isWhite = color === "w";
  return (
    <>
      {/* Framing camera – ortho keeps sizes consistent across pieces */}
      <OrthographicCamera
        makeDefault
        position={[0, 0.75, 4]}
        zoom={140}
        near={0.1}
        far={20}
      />
      {/* Lighting: warm key, cool fill, gold rim */}
      <ambientLight intensity={0.35} />
      <hemisphereLight
        args={[isWhite ? "#fff2d0" : "#b7c1d8", "#141018", 0.55]}
      />
      {/* Key */}
      <directionalLight
        position={[2.4, 4, 3]}
        intensity={2.2}
        color="#fff2d4"
      />
      {/* Cool fill from opposite side */}
      <directionalLight
        position={[-2.8, 2, 1]}
        intensity={0.55}
        color="#8ea6ff"
      />
      {/* Warm gold rim from behind – reads the silhouette edge */}
      <directionalLight
        position={[0.5, 1.6, -3.2]}
        intensity={isWhite ? 1.4 : 2.4}
        color="#f5c876"
      />
      {/* Subtle up-fill to lift the base */}
      <pointLight position={[0, 0.1, 1.6]} intensity={0.35} color="#ffd9a0" />

      <Suspense fallback={null}>
        <group position={[0, 0, 0]}>
          <Piece3D type={type} color={color} position={[0, 0, 0]} scale={1} />
          {/* Soft contact shadow disc under the piece */}
          <mesh
            position={[0, 0.001, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            raycast={() => null}
          >
            <circleGeometry args={[0.4, 32]} />
            <meshBasicMaterial color="#000" transparent opacity={0.28} />
          </mesh>
        </group>
      </Suspense>
    </>
  );
}

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
      ? "drop-shadow(0 3px 4px rgba(0,0,0,0.55))"
      : "drop-shadow(0 3px 6px rgba(0,0,0,0.85))";

  return (
    <span
      aria-hidden
      className="pointer-events-none block select-none"
      style={{ width: dim, height: dim, filter: dropShadow }}
    >
      <ClientOnly>
        <Canvas
          shadows={false}
          dpr={[1, 2]}
          frameloop="demand"
          gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
          style={{ width: "100%", height: "100%" }}
        >
          <PieceScene type={type} color={color} />
        </Canvas>
      </ClientOnly>
    </span>
  );
}
