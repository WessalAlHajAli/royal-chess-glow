import { Suspense, useRef } from "react";
import { View } from "@react-three/drei";
import type { PieceSymbol, Color } from "chess.js";
import { Piece3D } from "./pieces3d";
import { ClientOnly } from "./ClientOnly";

/**
 * Per-piece 3D scene rendered through drei's <View> into the app-wide
 * shared Canvas (see PieceCanvasProvider). Front-facing perspective camera
 * (managed by View) keeps the board perfectly straight while pieces remain
 * real 3D geometry with PBR materials and lighting.
 */
function PieceScene({ type, color }: { type: PieceSymbol; color: Color }) {
  const isWhite = color === "w";
  return (
    <>
      <ambientLight intensity={0.5} />
      <hemisphereLight args={[isWhite ? "#fff2d0" : "#c1c9dc", "#141018", 0.7]} />
      {/* Key: warm from upper-right */}
      <directionalLight position={[2.6, 4.2, 3]} intensity={2.6} color="#fff2d4" />
      {/* Fill: cool from upper-left */}
      <directionalLight position={[-3, 2.5, 1.5]} intensity={0.7} color="#8ea6ff" />
      {/* Rim: warm gold behind — strongest on black for edge readability */}
      <directionalLight
        position={[0.5, 1.4, -3.5]}
        intensity={isWhite ? 1.6 : 3.0}
        color="#f5c876"
      />
      <pointLight position={[0, 0.1, 1.8]} intensity={0.45} color="#ffd9a0" />
      <Suspense fallback={null}>
        <group position={[0, -0.7, 0]}>
          <Piece3D type={type} color={color} />
          <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.42, 32]} />
            <meshBasicMaterial color="#000" transparent opacity={0.34} />
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
        {/* drei's <View> manages its own camera; we position the piece
            slightly forward and let View's default perspective camera frame it. */}
        <View track={trackRef}>
          <PieceScene type={type} color={color} />
        </View>
      </ClientOnly>
    </div>
  );
}

