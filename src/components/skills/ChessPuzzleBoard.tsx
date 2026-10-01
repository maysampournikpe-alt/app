"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Chess, type Square } from "chess.js";
import { useT } from "@/i18n/useT";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Alert } from "@/components/ui/misc";

// Text-style chess symbols (the ︎ keeps phones from turning them into emoji).
const GLYPH: Record<string, string> = { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" };
const NAMES_EN: Record<string, string> = { k: "king", q: "queen", r: "rook", b: "bishop", n: "knight", p: "pawn" };
const NAMES_ES: Record<string, string> = { k: "rey", q: "dama", r: "torre", b: "alfil", n: "caballo", p: "peón" };

/** Mate-in-one puzzle. Click (or tap/Enter) a piece, then a square — or type the move. */
export function ChessPuzzleBoard({ fen, onSolved }: { fen: string; onSolved: () => void }) {
  const { t, locale } = useT();
  const game = useMemo(() => new Chess(fen), [fen]);
  const turn = game.turn();
  const [selected, setSelected] = useState<Square | null>(null);
  const [status, setStatus] = useState<"idle" | "wrong" | "solved">("idle");
  const [typed, setTyped] = useState("");
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [boardFen, setBoardFen] = useState(fen);

  const board = new Chess(boardFen).board();
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  // Show the board from the side that is moving.
  const rows = turn === "w" ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
  const cols = turn === "w" ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
  const names = locale === "es" ? NAMES_ES : NAMES_EN;

  function tryMove(move: { from: string; to: string } | string) {
    const g = new Chess(fen);
    try {
      const m = typeof move === "string" ? g.move(move.trim()) : g.move({ ...move, promotion: "q" });
      setLastMove({ from: m.from, to: m.to });
      setBoardFen(g.fen());
      if (g.isCheckmate()) {
        setStatus("solved");
        onSolved();
      } else {
        setStatus("wrong");
        setTimeout(() => {
          setBoardFen(fen);
          setLastMove(null);
        }, 900);
      }
    } catch {
      setStatus("wrong");
    }
    setSelected(null);
  }

  function clickSquare(sq: Square) {
    if (status === "solved") return;
    const piece = new Chess(fen).get(sq);
    if (selected) {
      if (piece && piece.color === turn) setSelected(sq);
      else tryMove({ from: selected, to: sq });
    } else if (piece && piece.color === turn) {
      setSelected(sq);
      setStatus("idle");
    }
  }

  function submitTyped(e: FormEvent) {
    e.preventDefault();
    if (typed.trim()) tryMove(typed);
  }

  return (
    <div>
      <p className="mb-2 font-bold">{t("skills.chessTask", { side: turn === "w" ? t("skills.white") : t("skills.black") })}</p>
      <p className="mb-3 text-sm text-muted">{t("skills.chessSelect")}</p>
      <div role="grid" aria-label={t("skills.type_chess")} className="mx-auto grid aspect-square w-full max-w-sm grid-cols-8 overflow-hidden rounded-xl border-4 border-[#5b3a1a]">
        {rows.map((r) => (
          <div role="row" className="contents" key={r}>
            {cols.map((c) => {
              const sq = `${files[c]}${8 - r}` as Square;
              const p = board[r][c];
              const dark = (r + c) % 2 === 1;
              const isSel = selected === sq;
              const isLast = lastMove && (lastMove.from === sq || lastMove.to === sq);
              const label = `${sq}, ${p ? `${p.color === "w" ? t("skills.white") : t("skills.black")} ${names[p.type]}` : t("skills.empty")}${isSel ? `, ${t("skills.selected")}` : ""}`;
              return (
                <div role="gridcell" key={sq} className="contents">
                  <button
                    type="button"
                    aria-label={label}
                    onClick={() => clickSquare(sq)}
                    className={cn(
                      "relative flex aspect-square items-center justify-center text-[clamp(1.4rem,8vw,2.4rem)] leading-none focus-visible:z-10",
                      dark ? "bg-[#b58863]" : "bg-[#f0d9b5]",
                      isLast && "bg-[#cdd26a]",
                      isSel && "outline outline-4 -outline-offset-4 outline-blue-600",
                    )}
                  >
                    {p && (
                      <span aria-hidden="true" style={p.color === "w" ? { color: "#fff", WebkitTextStroke: "1.5px #222" } : { color: "#111" }} className="font-[DejaVu_Sans,Segoe_UI_Symbol,sans-serif]">
                        {GLYPH[p.type]}
                        {"︎"}
                      </span>
                    )}
                    {c === cols[0] && <span aria-hidden="true" className="absolute left-0.5 top-0 text-[10px] font-bold text-black/60">{8 - r}</span>}
                    {r === rows[7] && <span aria-hidden="true" className="absolute bottom-0 right-0.5 text-[10px] font-bold text-black/60">{files[c]}</span>}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <form onSubmit={submitTyped} className="mx-auto mt-3 flex max-w-sm items-end gap-2">
        <div className="flex-1">
          <label htmlFor="chess-move" className="mb-1 block text-sm font-bold">
            {t("skills.chessTypeLabel")}
          </label>
          <Input id="chess-move" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" autoCapitalize="off" spellCheck={false} />
        </div>
        <Button type="submit" disabled={status === "solved"}>
          {t("skills.check")}
        </Button>
      </form>
      <div aria-live="polite" className="mx-auto mt-3 max-w-sm">
        {status === "solved" && <Alert tone="success">{t("skills.correct")}</Alert>}
        {status === "wrong" && <Alert tone="warning">{t("skills.wrong")}</Alert>}
      </div>
    </div>
  );
}
