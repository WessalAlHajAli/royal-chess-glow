import { Suspense, useRef } from "react";
import { View, OrthographicCamera } from "@react-three/drei";
import type { PieceSymbol, Color } from "chess.js";
import { Piece3D } from "./pieces3d";
import { ClientOnly } from "./ClientOnly";

/**
 * A single chess piece rendered as a real 3D object. Uses drei's <View>
 * to render into the app-wide shared Canvas (see PieceCanvasProvider),
 * so we don't spawn 32 WebGL contexts on the board.
 */
function PieceScene({ type, color }: { type: PieceSymbol; color: Color }) {
  const isWhite = color === "w";
  return (
    <>
      <OrthographicCamera
        makeDefault
        position={[0, 0.75, 4]}
        zoom={140}
        near={0.1}
        far={20}
      />
      <ambientLight intensity={0.35} />
      <hemisphereLight args={[isWhite ? "#fff2d0" : "#b7c1d8", "#141018", 0.55]} />
      <directionalLight position={[2.4, 4, 3]} intensity={2.2} color="#fff2d4" />
      <directionalLight position={[-2.8, 2, 1]} intensity={0.55} color="#8ea6ff" />
      <directionalLight
        position={[0.5, 1.6, -3.2]}
        intensity={isWhite ? 1.4 : 2.6}
        color="#f5c876"
      />
      <pointLight position={[0, 0.1, 1.6]} intensity={0.35} color="#ffd9a0" />
      <Suspense fallback={null}>
        <group>
          <Piece3D type={type} color={color} position={[0, 0, 0]} scale={1} />
          <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
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
  const trackRef = useRef<HTMLDivElement>(null!);
  const dim = size ?? "100%";
  const dropShadow =
    color === "w"
      ? "drop-shadow(0 3px 4px rgba(0,0,0,0.55))"
      : "drop-shadow(0 3px 6px rgba(0,0,0,0.85))";
  return (
    <div
      ref={trackRef}
      aria-hidden
      className="pointer-events-none select-none"
      style={{ width: dim, height: dim, filter: dropShadow }}
    >
      <ClientOnly>
        <View track={trackRef}>
          <PieceScene type={type} color={color} />
        </View>
      </ClientOnly>
    </div>
  );
}
