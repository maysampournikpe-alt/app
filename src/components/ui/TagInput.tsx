"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useT } from "@/i18n/useT";
import { Input } from "./Field";
import { Button } from "./Button";

/** Type a word and press Enter to add it as a chip. Used for skills and goals. */
export function TagInput({ id, value, onChange, max = 10, describedBy }: { id: string; value: string[]; onChange: (v: string[]) => void; max?: number; describedBy?: string }) {
  const { t } = useT();
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim().slice(0, 60);
    if (v && !value.includes(v) && value.length < max) onChange([...value, v]);
    setDraft("");
  };
  return (
    <div>
      {value.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-2">
          {value.map((v) => (
            <li key={v} className="inline-flex items-center gap-1 rounded-full bg-primary-soft py-1 pr-1 pl-3 text-sm font-semibold text-on-primary-soft">
              {v}
              <button type="button" aria-label={t("me.removeItem", { item: v })} onClick={() => onChange(value.filter((x) => x !== v))} className="inline-flex size-7 items-center justify-center rounded-full hover:bg-surface">
                <X aria-hidden="true" className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <Input
          id={id}
          aria-describedby={describedBy}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <Button variant="secondary" onClick={add} className="shrink-0">
          {t("me.addItem")}
        </Button>
      </div>
    </div>
  );
}
