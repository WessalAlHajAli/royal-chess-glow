import { Suspense, useRef } from "react";
import { View, PerspectiveCamera } from "@react-three/drei";
import type { PieceSymbol, Color } from "chess.js";
import { Piece3D } from "./pieces3d";
import { ClientOnly } from "./ClientOnly";

/**
 * Per-piece 3D scene rendered through drei's <View> into the app-wide
 * shared Canvas (see PieceCanvasProvider). Front-facing orthographic
 * camera keeps the board perfectly straight while pieces remain fully
 * 3D geometry with real materials and lighting.
 */
function PieceScene({ type, color }: { type: PieceSymbol; color: Color }) {
  const isWhite = color === "w";
  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[0, 0.75, 3.2]}
        fov={30}
        near={0.1}
        far={20}
      />
      {/* Look at piece center */}
      <ambientLight intensity={0.4} />
      <hemisphereLight args={[isWhite ? "#fff2d0" : "#c1c9dc", "#141018", 0.55]} />
      {/* Key light: warm from upper-right */}
      <directionalLight position={[2.6, 4.2, 3]} intensity={2.4} color="#fff2d4" />
      {/* Fill: cool from upper-left */}
      <directionalLight position={[-3, 2.5, 1.5]} intensity={0.65} color="#8ea6ff" />
      {/* Rim: warm gold, behind piece — strongest on black for edge readability */}
      <directionalLight
        position={[0.5, 1.4, -3.5]}
        intensity={isWhite ? 1.6 : 3.0}
        color="#f5c876"
      />
      {/* Front accent bounce */}
      <pointLight position={[0, 0.1, 1.8]} intensity={0.4} color="#ffd9a0" />
      <Suspense fallback={null}>
        <group position={[0, -0.7, 0]}>
          <Piece3D type={type} color={color} />
          {/* Contact shadow disc, painted onto the square underneath */}
          <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.42, 32]} />
            <meshBasicMaterial color="#000" transparent opacity={0.32} />
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
  return (
    <div
      ref={trackRef}
      aria-hidden
      className="pointer-events-none select-none"
      style={{ width: dim, height: dim }}
    >
      <ClientOnly>
        <View track={trackRef}>
          <PieceScene type={type} color={color} />
        </View>
      </ClientOnly>
    </div>
  );
}
