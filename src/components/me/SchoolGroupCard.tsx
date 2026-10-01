"use client";

import { useState, type FormEvent } from "react";
import { School, LogOut } from "lucide-react";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { apiPost } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { Alert } from "@/components/ui/misc";

interface JoinResult {
  schoolId: string;
  schoolName: string;
  role: "student" | "staff" | "parent" | "mentor";
  code: string;
}

/** Join a school group with a code (unlocks school spaces and teacher recommendations). */
export function SchoolGroupCard() {
  const { t } = useT();
  const profile = useApp((s) => s.profile);
  const setProfile = useApp((s) => s.setProfile);
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<{ tone: "danger" | "info" | "success"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function join(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const r = await apiPost<JoinResult>("/api/school/join", { code });
      if (r.role === "student") setProfile({ schoolCode: r.code, schoolName: r.schoolName, schoolId: r.schoolId });
      else if (r.role === "mentor") {
        setProfile({ mentorCode: r.code });
        setMsg({ tone: "success", text: t("school.mentorCode") });
      } else if (r.role === "parent") {
        setProfile({ parentCode: r.code });
        setMsg({ tone: "success", text: t("school.parentCode") });
      } else setMsg({ tone: "info", text: t("school.staffCode") });
      setCode("");
    } catch {
      setMsg({ tone: "danger", text: t("school.notFound") });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="space-y-3">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <School aria-hidden="true" className="size-5 text-primary" />
        {t("school.title")}
      </h2>
      {profile.schoolCode ? (
        <>
          <p className="font-bold text-success">{t("school.joined", { school: profile.schoolName ?? "" })}</p>
          <Toggle checked={!!profile.shareEngagement} onChange={(v) => setProfile({ shareEngagement: v })} label={t("school.share")} help={t("school.shareHelp")} />
          <Button
            variant="ghost"
            size="sm"
            className="text-danger"
            icon={<LogOut aria-hidden="true" className="size-4" />}
            onClick={() => setProfile({ schoolCode: undefined, schoolName: undefined, schoolId: undefined, shareEngagement: false })}
          >
            {t("school.leave")}
          </Button>
        </>
      ) : (
        <form onSubmit={join} className="space-y-3">
          <p className="text-sm text-muted">{t("school.intro")}</p>
          <Field label={t("school.code")} help={t("school.demoCodes")}>
            {(id, d) => (
              <div className="flex gap-2">
                <Input id={id} aria-describedby={d} value={code} onChange={(e) => setCode(e.target.value)} autoComplete="off" autoCapitalize="characters" maxLength={40} />
                <Button type="submit" disabled={busy || code.trim().length < 4}>
                  {t("school.join")}
                </Button>
              </div>
            )}
          </Field>
        </form>
      )}
      {msg && (
        <Alert tone={msg.tone} role="status">
          {msg.text}
        </Alert>
      )}
    </Card>
  );
}
