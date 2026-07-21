import type { Move } from "chess.js";
import { useEffect, useRef } from "react";

export function MoveHistory({ history }: { history: Move[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history.length]);

  const rows: { n: number; white?: Move; black?: Move }[] = [];
  for (let i = 0; i < history.length; i += 2) {
    rows.push({
      n: i / 2 + 1,
      white: history[i],
      black: history[i + 1],
    });
  }

  return (
    <div className="glass-panel flex h-full min-h-[180px] flex-col rounded-2xl p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Move history
        </h3>
        <span className="text-xs text-muted-foreground">
          {history.length} plies
        </span>
      </div>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto pr-1 font-mono text-sm"
      >
        {rows.length === 0 && (
          <p className="text-xs text-muted-foreground/70">
            The game will begin when you move.
          </p>
        )}
        {rows.map((row) => (
          <div
            key={row.n}
            className="grid grid-cols-[2rem_1fr_1fr] items-center gap-2 rounded px-1 py-0.5 hover:bg-white/[0.03]"
          >
            <span className="text-muted-foreground">{row.n}.</span>
            <span className="text-foreground/90">{row.white?.san ?? ""}</span>
            <span className="text-foreground/80">{row.black?.san ?? ""}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
