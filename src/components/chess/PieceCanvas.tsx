import { useRef, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { View } from "@react-three/drei";
import { ClientOnly } from "./ClientOnly";

/**
 * Provides a single WebGL Canvas for the whole app. Every <PieceView>
 * renders its scene into this Canvas via drei's <View> (viewport/scissor
 * portal). This avoids the browser's per-page WebGL context limit
 * (~16) that we would otherwise hit with one Canvas per piece.
 */
export function PieceCanvasProvider({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={rootRef} className="relative">
      {children}
      <ClientOnly>
        <Canvas
          eventSource={rootRef as unknown as React.MutableRefObject<HTMLElement>}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
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
