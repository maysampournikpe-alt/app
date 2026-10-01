"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Lock, Unlock } from "lucide-react";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { sha256 } from "@/lib/utils";
import { PageHeader, Alert } from "@/components/ui/misc";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";
import { Toggle } from "@/components/ui/Toggle";
import { Button } from "@/components/ui/Button";

/** 10.5 Parental controls for students under 13 (locked with a parent PIN). */
export default function ParentalPage() {
  const { t } = useT();
  const under13 = useApp((s) => s.consent.under13);
  const parental = useApp((s) => s.parental);
  const setParental = useApp((s) => s.setParental);
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(!parental.pinHash);
  const [wrong, setWrong] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [pinSaved, setPinSaved] = useState(false);

  async function unlock(e: FormEvent) {
    e.preventDefault();
    const ok = (await sha256(pin)) === parental.pinHash;
    setWrong(!ok);
    setUnlocked(ok);
    setPin("");
  }

  async function savePin(e: FormEvent) {
    e.preventDefault();
    if (!/^\d{4}$/.test(newPin)) return;
    setParental({ pinHash: await sha256(newPin) });
    setNewPin("");
    setPinSaved(true);
  }

  return (
    <div>
      <Link href="/me" className="mb-3 inline-flex min-h-10 items-center gap-1 font-bold text-primary">
        <ArrowLeft aria-hidden="true" className="size-4" /> {t("me.title")}
      </Link>
      <PageHeader title={t("me.parentalTitle")} subtitle={t("me.parentalIntro")} icon={<Lock className="size-7" />} />
      {!under13 && <Alert className="mb-4">{t("me.notUnder13")}</Alert>}

      {!unlocked ? (
        <Card>
          <form onSubmit={unlock} className="space-y-3">
            <Field label={t("me.pinPrompt")}>
              {(id) => <Input id={id} type="password" inputMode="numeric" maxLength={4} autoComplete="off" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} className="max-w-32 tracking-[0.5em]" />}
            </Field>
            {wrong && <Alert tone="danger" role="alert">{t("me.wrongPin")}</Alert>}
            <Button type="submit" icon={<Unlock aria-hidden="true" className="size-4" />}>
              {t("me.unlock")}
            </Button>
          </form>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="divide-y divide-border">
            <Toggle checked={parental.peopleEnabled} onChange={(v) => setParental({ peopleEnabled: v })} label={t("me.ctlPeople")} />
            <Toggle checked={parental.coachEnabled} onChange={(v) => setParental({ coachEnabled: v })} label={t("me.ctlCoach")} />
            <Toggle checked={parental.aiSearchEnabled} onChange={(v) => setParental({ aiSearchEnabled: v })} label={t("me.ctlSearch")} />
            <Toggle checked={parental.requireApproval} onChange={(v) => setParental({ requireApproval: v })} label={t("me.ctlApproval")} />
          </Card>
          <Card>
            {!parental.pinHash && <p className="mb-3 text-sm text-muted">{t("me.noPinYet")}</p>}
            <form onSubmit={savePin} className="space-y-3">
              <Field label={t("me.setPin")}>
                {(id) => <Input id={id} type="password" inputMode="numeric" maxLength={4} autoComplete="new-password" value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))} className="max-w-32 tracking-[0.5em]" />}
              </Field>
              {pinSaved && <Alert tone="success" role="status">{t("me.pinSaved")}</Alert>}
              <div className="flex gap-2">
                <Button type="submit" disabled={!/^\d{4}$/.test(newPin)}>
                  {t("me.savePin")}
                </Button>
                {parental.pinHash && (
                  <Button variant="secondary" onClick={() => setUnlocked(false)} icon={<Lock aria-hidden="true" className="size-4" />}>
                    {t("me.lock")}
                  </Button>
                )}
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
