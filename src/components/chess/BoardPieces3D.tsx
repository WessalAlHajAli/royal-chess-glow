import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import type { Color, PieceSymbol, Square } from "chess.js";
import { Piece3D } from "./pieces3d";
import { ClientOnly } from "./ClientOnly";

type Board = Array<
  Array<{ type: PieceSymbol; color: Color; square: Square } | null>
>;

/**
 * Single Canvas overlaying the entire 8x8 board. All 32 pieces are rendered
 * as real 3D geometry inside one WebGL context, positioned so each piece
 * sits centered on its square. Orthographic camera looks straight at the
 * board from +Z, so the board stays flat/front-facing while the pieces are
 * true 3D objects (LatheGeometry + PBR materials).
 */
export function BoardPieces3D({ board }: { board: Board }) {
  const pieces = useMemo(() => {
    const out: Array<{
      key: string;
      type: PieceSymbol;
      color: Color;
      x: number;
      y: number;
    }> = [];
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const p = board[r]?.[f];
        if (!p) continue;
        out.push({
          key: p.square,
          type: p.type,
          color: p.color,
          x: f + 0.5,
          y: 7 - r + 0.05,
        });
      }
    }
    return out;
  }, [board]);

  // Each square is 1 unit; scale pieces so tallest (king, 1.42) fits ~0.9
  // units. That keeps every piece within its own square without overlap.
  const scale = 0.62;

  return (
    <ClientOnly fallback={null}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ zIndex: 5 }}
      >
        <Canvas
          shadows={false}
          dpr={[1, 2]}
          frameloop="always"
          orthographic
          camera={{
            position: [4, 4, 10],
            zoom: 1,
            near: 0.1,
            far: 100,
            left: -4,
            right: 4,
            top: 4,
            bottom: -4,
          }}
          gl={{
            antialias: true,
            alpha: true,
            premultipliedAlpha: true,
            powerPreference: "high-performance",
          }}
          onCreated={({ gl, camera }) => {
            gl.setClearColor(0x000000, 0);
            // Reposition camera to look at board center (4, 4) with the
            // orthographic frustum sized to exactly cover 0..8 on both axes.
            camera.position.set(4, 4, 10);
            camera.lookAt(4, 4, 0);
            camera.updateProjectionMatrix();
          }}
          style={{ width: "100%", height: "100%" }}
        >
          {/* Studio lighting — directional lights are parallel so every
              piece receives identical illumination regardless of position. */}
          <ambientLight intensity={0.55} />
          <hemisphereLight
            args={["#fff2d0", "#141018", 0.65]}
          />
          <directionalLight
            position={[6, 10, 8]}
            intensity={2.4}
            color="#fff2d4"
          />
          <directionalLight
            position={[-8, 4, 4]}
            intensity={0.7}
            color="#8ea6ff"
          />
          <directionalLight
            position={[2, 3, -6]}
            intensity={2.0}
            color="#f5c876"
          />

          <Suspense fallback={null}>
            {pieces.map((p) => (
              <group
                key={p.key}
                position={[p.x, p.y, 0.5]}
                scale={[scale, scale, scale]}
              >
                <Piece3D type={p.type} color={p.color} />
                {/* soft contact shadow disc */}
                <mesh
                  position={[0, 0.005, 0]}
                  rotation={[-Math.PI / 2, 0, 0]}
                >
                  <circleGeometry args={[0.5, 32]} />
                  <meshBasicMaterial
                    color="#000"
                    transparent
                    opacity={0.32}
                  />
                </mesh>
              </group>
            ))}
          </Suspense>
        </Canvas>
      </div>
    </ClientOnly>
  );
}
