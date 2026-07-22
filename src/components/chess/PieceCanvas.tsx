import { useRef, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { View } from "@react-three/drei";
import { ClientOnly } from "./ClientOnly";

/**
 * Provides a single shared WebGL Canvas for all piece <View>s in the app.
 * Every piece renders its scene into this Canvas via drei's <View> portal
 * (viewport/scissor), so we avoid the browser's ~16 WebGL context limit
 * that would otherwise be hit with one Canvas per piece.
 *
 * The Canvas is positioned fixed over the viewport, transparent, with
 * pointer-events disabled so clicks pass through to the board squares.
 */
export function PieceCanvasProvider({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={rootRef} className="relative">
      {children}
      <ClientOnly>
        <Canvas
          shadows={false}
          dpr={[1, 2]}
          gl={{
            antialias: true,
            alpha: true,
            premultipliedAlpha: true,
            preserveDrawingBuffer: false,
            powerPreference: "high-performance",
          }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
          }}
          style={{
            position: "fixed",
            inset: 0,
            width: "100vw",
            height: "100vh",
            pointerEvents: "none",
            zIndex: 30,
          }}
        >
          <View.Port />
        </Canvas>
      </ClientOnly>
    </div>
  );
}
