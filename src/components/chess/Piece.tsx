import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import type { PieceSymbol, Color } from "chess.js";
import { Piece3D } from "./pieces3d";
import { ClientOnly } from "./ClientOnly";

function PieceScene({ type, color }: { type: PieceSymbol; color: Color }) {
  const isWhite = color === "w";
  return (
    <>
      <ambientLight intensity={0.55} />
      <hemisphereLight args={[isWhite ? "#fff2d0" : "#c1c9dc", "#141018", 0.7]} />
      <directionalLight position={[2.6, 4.2, 3]} intensity={2.6} color="#fff2d4" />
      <directionalLight position={[-3, 2.5, 1.5]} intensity={0.7} color="#8ea6ff" />
      <directionalLight
        position={[0.5, 1.4, -3.5]}
        intensity={isWhite ? 1.6 : 3.0}
        color="#f5c876"
      />
      <pointLight position={[0, 0.1, 1.8]} intensity={0.45} color="#ffd9a0" />
      <Suspense fallback={null}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.2, 1.2, 1.2]} />
          <meshBasicMaterial color="hotpink" />
        </mesh>
      </Suspense>
    </>
  );
}

/**
 * A single 3D chess piece rendered in its own tiny <Canvas>. Each canvas
 * uses `frameloop="demand"` so it renders once and stays idle — WebGL
 * contexts are cheap when they're not animating.
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
  return (
    <ClientOnly
      fallback={
        <div
          aria-hidden
          className="pointer-events-none select-none"
          style={{ width: dim, height: dim }}
        />
      }
    >
      <div
        aria-hidden
        className="pointer-events-none select-none"
        style={{ width: dim, height: dim }}
      >
        <Canvas
          shadows={false}
          dpr={[1, 2]}
          frameloop="always"
          camera={{ position: [0, 0, 3.4], fov: 30, near: 0.1, far: 20 }}
          gl={{
            antialias: true,
            alpha: true,
            premultipliedAlpha: true,
            powerPreference: "low-power",
          }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
          }}
          style={{ width: "100%", height: "100%" }}
        >
          <PieceScene type={type} color={color} />
        </Canvas>
      </div>
    </ClientOnly>
  );
}
