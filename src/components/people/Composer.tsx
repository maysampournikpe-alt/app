"use client";

import { useId, useState, type FormEvent } from "react";
import { useT } from "@/i18n/useT";
import { sendPost } from "@/lib/people-client";
import { Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/misc";
import { CrisisHelp } from "@/components/safety/CrisisHelp";

/** Writes a post. The server filters it; here we just explain what happened. */
export function Composer({ slug, kind, parentId, label, onPosted }: { slug: string; kind: string; parentId?: string; label: string; onPosted: () => void }) {
  const { t } = useT();
  const id = useId();
  const [body, setBody] = useState("");
  const [competition, setCompetition] = useState("");
  const [needs, setNeeds] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "success" | "warning" | "danger"; text: string } | null>(null);
  const [crisis, setCrisis] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const meta = kind === "team" ? { competition: competition.trim(), needs: needs.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 8) } : undefined;
    const r = await sendPost({ action: "post", slug, kind, body, parentId, meta });
    setBusy(false);
    if (r.ok) {
      setBody("");
      setCompetition("");
      setNeeds("");
      setMsg(r.removed.length ? { tone: "warning", text: t("people.removedInfo") } : { tone: "success", text: t("people.posted") });
      onPosted();
    } else if (r.error === "crisis") setCrisis(true);
    else setMsg({ tone: "danger", text: t(r.error === "blocked" ? "people.blocked" : r.error === "too_many" ? "people.tooMany" : r.error === "not_allowed" ? "people.notAllowed" : "people.error") });
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <label htmlFor={`${id}-body`} className="block font-bold">
        {label}
      </label>
      {kind === "ride" && <p className="text-sm text-muted">{t("people.rideHelp")}</p>}
      <Textarea id={`${id}-body`} value={body} onChange={(e) => setBody(e.target.value)} placeholder={t("people.postPlaceholder")} maxLength={800} rows={3} />
      {kind === "team" && (
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <label htmlFor={`${id}-comp`} className="block text-sm font-bold">
              {t("people.competition")}
            </label>
            <Input id={`${id}-comp`} value={competition} onChange={(e) => setCompetition(e.target.value)} maxLength={120} />
          </div>
          <div>
            <label htmlFor={`${id}-needs`} className="block text-sm font-bold">
              {t("people.needs")}
            </label>
            <Input id={`${id}-needs`} value={needs} onChange={(e) => setNeeds(e.target.value)} maxLength={200} />
          </div>
        </div>
      )}
      <Button type="submit" disabled={busy || body.trim().length < 2}>
        {t("people.post")}
      </Button>
      <div aria-live="polite">
        {msg && (
          <Alert tone={msg.tone} role="status">
            {msg.text}
          </Alert>
        )}
      </div>
      {crisis && <CrisisHelp />}
    </form>
  );
}
