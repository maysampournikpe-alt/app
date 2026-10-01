"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Printer, Wand2 } from "lucide-react";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { runTask } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { PageHeader, Alert, EmptyState } from "@/components/ui/misc";
import { Card } from "@/components/ui/Card";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Button, ButtonLink } from "@/components/ui/Button";

/** Section heading on the printed resume. */
function H({ children }: { children: React.ReactNode }) {
  return <h3 className="mt-4 border-b border-gray-400 pb-0.5 text-sm font-bold uppercase tracking-wide">{children}</h3>;
}

/** 2.4.1 Resume builder: AI turns accomplishments into a resume; print or save as PDF. */
export default function ResumePage() {
  const { t, dateLocale } = useT();
  const s = useApp();
  const r = s.resume;
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<"idle" | "done" | "demo" | "error">("idle");

  const activities = s.accomplishments.filter((a) => a.kind === "activity" || a.kind === "leadership" || a.kind === "other");
  const awards = s.accomplishments.filter((a) => a.kind === "award" || a.kind === "result");
  const certs = s.certificates.filter((c) => c.status === "earned");
  // Group volunteer hours by organization.
  const volunteer = Object.values(
    s.volunteer.reduce<Record<string, { id: string; org: string; hours: number; acts: string[] }>>((acc, v) => {
      const key = v.org.toLowerCase();
      acc[key] ??= { id: `vol-${key.replace(/[^a-z0-9]+/g, "-")}`, org: v.org, hours: 0, acts: [] };
      acc[key].hours += v.hours;
      if (v.activity && !acc[key].acts.includes(v.activity)) acc[key].acts.push(v.activity);
      return acc;
    }, {}),
  );
  const isEmpty = !activities.length && !awards.length && !certs.length && !volunteer.length;

  const entryText = {
    acc: (a: (typeof s.accomplishments)[number]) => [a.title, a.org && `(${a.org})`, a.description].filter(Boolean).join(" "),
    vol: (v: (typeof volunteer)[number]) => `${t("resume.volunteeredAt", { hours: v.hours, org: v.org })}${v.acts.length ? `: ${v.acts.join("; ")}` : ""}`,
  };
  const bullet = (id: string, fallback: string) => r.bullets[id] ?? fallback;

  async function polish() {
    setBusy(true);
    setStatus("idle");
    try {
      const entries = [
        ...activities.map((a) => ({ id: a.id, kind: "activity" as const, text: entryText.acc(a) })),
        ...awards.map((a) => ({ id: a.id, kind: "accomplishment" as const, text: entryText.acc(a) })),
        ...volunteer.map((v) => ({ id: v.id, kind: "volunteer" as const, text: entryText.vol(v) })),
      ].slice(0, 40);
      if (!entries.length) return;
      const res = await runTask<{ items: { id: string; bullet: string }[] }>("resume", { entries });
      if (!res.output) return setStatus("error");
      s.setResume({ bullets: { ...r.bullets, ...Object.fromEntries(res.output.items.map((i) => [i.id, i.bullet])) } });
      setStatus(res.demo ? "demo" : "done");
    } catch {
      setStatus("error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <Link href="/me/progress" className="no-print mb-3 inline-flex min-h-10 items-center gap-1 font-bold text-primary">
        <ArrowLeft aria-hidden="true" className="size-4" /> {t("progress.title")}
      </Link>
      <div className="no-print">
        <PageHeader title={t("resume.title")} subtitle={t("resume.subtitle")} />
        <Card className="mb-4 space-y-3">
          <p className="text-sm text-muted">{t("resume.privacy")}</p>
          <Field label={t("resume.fullName")}>{(id) => <Input id={id} value={r.fullName ?? ""} maxLength={80} onChange={(e) => s.setResume({ fullName: e.target.value })} autoComplete="name" />}</Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t("resume.email")}>{(id) => <Input id={id} type="email" value={r.email ?? ""} maxLength={100} onChange={(e) => s.setResume({ email: e.target.value })} />}</Field>
            <Field label={t("resume.phone")}>{(id) => <Input id={id} type="tel" value={r.phone ?? ""} maxLength={30} onChange={(e) => s.setResume({ phone: e.target.value })} />}</Field>
            <Field label={t("resume.cityLine")}>{(id) => <Input id={id} value={r.cityLine ?? s.profile.city ?? ""} maxLength={60} onChange={(e) => s.setResume({ cityLine: e.target.value })} />}</Field>
            <Field label={t("resume.school")}>{(id) => <Input id={id} value={s.profile.school ?? ""} maxLength={80} onChange={(e) => s.setProfile({ school: e.target.value })} />}</Field>
            <Field label={t("resume.gradYear")}>{(id) => <Input id={id} inputMode="numeric" maxLength={4} value={r.gradYear ?? ""} onChange={(e) => s.setResume({ gradYear: e.target.value.replace(/\D/g, "") })} />}</Field>
            <Field label={t("resume.gpa")}>{(id) => <Input id={id} maxLength={8} value={r.gpa ?? ""} onChange={(e) => s.setResume({ gpa: e.target.value })} />}</Field>
          </div>
          <Field label={t("resume.objective")}>{(id) => <Textarea id={id} value={r.objective ?? ""} maxLength={300} placeholder={t("resume.objectivePlaceholder")} onChange={(e) => s.setResume({ objective: e.target.value })} className="min-h-16" />}</Field>
        </Card>

        {isEmpty ? (
          <EmptyState icon="📄" title={t("resume.empty")} action={<ButtonLink href="/me/tracker">{t("resume.openTracker")}</ButtonLink>} />
        ) : (
          <Card className="mb-4">
            <Button variant="soft" onClick={polish} disabled={busy} icon={<Wand2 aria-hidden="true" className="size-4" />}>
              {busy ? t("resume.polishing") : t("resume.polish")}
            </Button>
            <p className="mt-2 text-sm text-muted">{t("resume.polishHelp")}</p>
            {status === "done" && <Alert tone="success" role="status" className="mt-2">{t("resume.polished")}</Alert>}
            {status === "demo" && <Alert role="status" className="mt-2">{t("resume.demoNote")}</Alert>}
            {status === "error" && <Alert tone="danger" className="mt-2">{t("common.error")}</Alert>}
          </Card>
        )}
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">{t("resume.preview")}</h2>
          <Button onClick={() => window.print()} icon={<Printer aria-hidden="true" className="size-4" />}>
            {t("resume.print")}
          </Button>
        </div>
      </div>

      {/* The resume "paper" — black on white so it prints cleanly. */}
      <article lang={s.settings.locale} aria-label={t("resume.preview")} className="print-plain rounded-lg border border-border bg-white p-6 font-serif text-[15px] leading-snug text-black shadow-md">
        <header className="text-center">
          <h2 className="text-2xl font-bold">{r.fullName || "—"}</h2>
          <p className="text-sm">{[r.email, r.phone, r.cityLine ?? s.profile.city].filter(Boolean).join(" · ")}</p>
        </header>
        {r.objective && <p className="mt-3 text-sm">{r.objective}</p>}
        <H>{t("resume.education")}</H>
        {s.profile.school && <p className="mt-1 font-bold">{s.profile.school}</p>}
        <p className="text-sm">
          {[
            s.profile.grade ? (r.gradYear ? t("resume.gradeLine", { grade: s.profile.grade, year: r.gradYear }) : t("common.gradeN", { n: s.profile.grade })) : "",
            r.gpa ? `GPA ${r.gpa}` : "",
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {activities.length > 0 && (
          <>
            <H>{t("resume.experience")}</H>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm">
              {activities.map((a) => (
                <li key={a.id}>
                  {bullet(a.id, entryText.acc(a))}
                  {a.date && <span className="text-gray-600"> ({formatDate(a.date, dateLocale, { month: "short", year: "numeric" })})</span>}
                </li>
              ))}
            </ul>
          </>
        )}
        {volunteer.length > 0 && (
          <>
            <H>{t("resume.volunteer")}</H>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm">
              {volunteer.map((v) => (
                <li key={v.id}>{bullet(v.id, entryText.vol(v))}</li>
              ))}
            </ul>
          </>
        )}
        {awards.length > 0 && (
          <>
            <H>{t("resume.awards")}</H>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm">
              {awards.map((a) => (
                <li key={a.id}>
                  {bullet(a.id, entryText.acc(a))}
                  {a.date && <span className="text-gray-600"> ({formatDate(a.date, dateLocale, { month: "short", year: "numeric" })})</span>}
                </li>
              ))}
            </ul>
          </>
        )}
        {certs.length > 0 && (
          <>
            <H>{t("resume.certifications")}</H>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm">
              {certs.map((c) => (
                <li key={c.id}>
                  {c.name}
                  {c.issuer && ` — ${c.issuer}`}
                  {c.earned && ` (${formatDate(c.earned, dateLocale, { month: "short", year: "numeric" })})`}
                </li>
              ))}
            </ul>
          </>
        )}
        {s.profile.skills.length > 0 && (
          <>
            <H>{t("resume.skills")}</H>
            <p className="mt-1 text-sm">{s.profile.skills.join(" · ")}</p>
          </>
        )}
      </article>
    </div>
  );
}
