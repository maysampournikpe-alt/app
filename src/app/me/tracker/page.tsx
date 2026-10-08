"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Trash2, Plus, Printer } from "lucide-react";
import type { Accomplishment, Certificate } from "@/types";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { formatDate, todayISO, daysUntil } from "@/lib/utils";
import { PageHeader, Segmented, EmptyState, Alert } from "@/components/ui/misc";
import { Card } from "@/components/ui/Card";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

type Tab = "acc" | "hours" | "certs";
const CERT_IDEAS = ["CPR / First Aid", "Microsoft Office Specialist", "Food Handler (Texas)", "OSHA 10", "Google IT Support", "Adobe Certified Professional", "CompTIA IT Fundamentals", "Certified Nursing Assistant (CNA)"];

/** 2.2 Accomplishments, volunteer hours (with supervisor contact) and certificates. All on this device. */
export default function TrackerPage() {
  const { t, dateLocale } = useT();
  const s = useApp();
  const [tab, setTab] = useState<Tab>("acc");
  const [msg, setMsg] = useState(false);
  const flash = () => {
    setMsg(true);
    setTimeout(() => setMsg(false), 2500);
  };

  // Accomplishment form
  const [aTitle, setATitle] = useState("");
  const [aKind, setAKind] = useState<Accomplishment["kind"]>("award");
  const [aOrg, setAOrg] = useState("");
  const [aDate, setADate] = useState("");
  const [aDesc, setADesc] = useState("");
  // Hours form
  const [hDate, setHDate] = useState(todayISO());
  const [hOrg, setHOrg] = useState("");
  const [hHours, setHHours] = useState("");
  const [hAct, setHAct] = useState("");
  const [hSup, setHSup] = useState("");
  const [hSupC, setHSupC] = useState("");
  // Certificate form
  const [cName, setCName] = useState("");
  const [cIssuer, setCIssuer] = useState("");
  const [cEarned, setCEarned] = useState("");
  const [cExpires, setCExpires] = useState("");
  const [cStatus, setCStatus] = useState<Certificate["status"]>("earned");

  const total = s.volunteer.reduce((n, v) => n + v.hours, 0);
  const month = todayISO().slice(0, 7);
  const monthTotal = s.volunteer.filter((v) => v.date.startsWith(month)).reduce((n, v) => n + v.hours, 0);

  function addAcc(e: FormEvent) {
    e.preventDefault();
    if (!aTitle.trim()) return;
    s.addAccomplishment({ title: aTitle.trim(), kind: aKind, org: aOrg.trim() || undefined, date: aDate || undefined, description: aDesc.trim() || undefined });
    setATitle("");
    setAOrg("");
    setADate("");
    setADesc("");
    flash();
  }
  function addHours(e: FormEvent) {
    e.preventDefault();
    const h = Number(hHours);
    if (!hOrg.trim() || !(h > 0) || h > 24) return;
    s.addVolunteer({ date: hDate, org: hOrg.trim(), hours: Math.round(h * 4) / 4, activity: hAct.trim() || undefined, supervisor: hSup.trim() || undefined, supervisorContact: hSupC.trim() || undefined });
    setHOrg("");
    setHHours("");
    setHAct("");
    flash();
  }
  function addCert(e: FormEvent) {
    e.preventDefault();
    if (!cName.trim()) return;
    s.addCertificate({ name: cName.trim(), issuer: cIssuer.trim() || undefined, earned: cEarned || undefined, expires: cExpires || undefined, status: cStatus });
    setCName("");
    setCIssuer("");
    setCEarned("");
    setCExpires("");
    flash();
  }

  const del = (label: string, fn: () => void) => (
    <button type="button" onClick={fn} aria-label={t("tracker.remove", { name: label })} className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-danger hover:bg-danger-soft">
      <Trash2 aria-hidden="true" className="size-4" />
    </button>
  );

  return (
    <div>
      <Link href="/me" className="no-print mb-3 inline-flex min-h-10 items-center gap-1 font-bold text-primary">
        <ArrowLeft aria-hidden="true" className="size-4" /> {t("me.title")}
      </Link>
      <PageHeader title={t("tracker.title")} subtitle={t("tracker.subtitle")} />
      <div className="no-print mb-4">
        <Segmented<Tab>
          label={t("tracker.title")}
          value={tab}
          onChange={setTab}
          options={[
            { value: "acc", label: t("tracker.accomplishments") },
            { value: "hours", label: t("tracker.hours") },
            { value: "certs", label: t("tracker.certificates") },
          ]}
        />
      </div>
      {msg && (
        <Alert tone="success" role="status" className="mb-3">
          {t("tracker.added")}
        </Alert>
      )}

      {tab === "acc" && (
        <div className="space-y-4">
          <Card>
            <form onSubmit={addAcc} className="space-y-3">
              <h2 className="font-bold">{t("tracker.addAccomplishment")}</h2>
              <Field label={t("tracker.whatTitle")}>{(id) => <Input id={id} value={aTitle} onChange={(e) => setATitle(e.target.value)} maxLength={120} required />}</Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label={t("tracker.kind")}>
                  {(id) => (
                    <Select id={id} value={aKind} onChange={(e) => setAKind(e.target.value as Accomplishment["kind"])}>
                      {(["award", "activity", "result", "leadership", "other"] as const).map((k) => (
                        <option key={k} value={k}>
                          {t(`tracker.kind_${k}`)}
                        </option>
                      ))}
                    </Select>
                  )}
                </Field>
                <Field label={t("tracker.date")}>{(id) => <Input id={id} type="date" value={aDate} onChange={(e) => setADate(e.target.value)} />}</Field>
              </div>
              <Field label={t("tracker.org")}>{(id) => <Input id={id} value={aOrg} onChange={(e) => setAOrg(e.target.value)} maxLength={100} />}</Field>
              <Field label={t("tracker.description")}>{(id) => <Textarea id={id} value={aDesc} onChange={(e) => setADesc(e.target.value)} maxLength={400} className="min-h-16" />}</Field>
              <Button type="submit" icon={<Plus aria-hidden="true" className="size-4" />}>
                {t("common.add")}
              </Button>
            </form>
          </Card>
          {s.accomplishments.length === 0 ? (
            <EmptyState icon="🏅" title={t("tracker.empty")} />
          ) : (
            <ul className="space-y-2">
              {s.accomplishments.map((a) => (
                <li key={a.id} className="flex items-start gap-2 rounded-2xl border-2 border-b-4 border-border bg-surface p-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{a.title}</p>
                    <p className="text-sm text-muted">{[t(`tracker.kind_${a.kind}`), a.org, a.date && formatDate(a.date, dateLocale)].filter(Boolean).join(" · ")}</p>
                    {a.description && <p className="mt-1 text-sm">{a.description}</p>}
                  </div>
                  {del(a.title, () => s.removeAccomplishment(a.id))}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === "hours" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="success" className="!text-base">
              {t("tracker.totalHours", { n: total })}
            </Badge>
            <Badge tone="primary">{t("tracker.thisMonth", { n: monthTotal })}</Badge>
            {s.volunteer.length > 0 && (
              <Button variant="ghost" size="sm" className="no-print ml-auto" onClick={() => window.print()} icon={<Printer aria-hidden="true" className="size-4" />}>
                {t("tracker.printLog")}
              </Button>
            )}
          </div>
          <Card className="no-print">
            <form onSubmit={addHours} className="space-y-3">
              <h2 className="font-bold">{t("tracker.addHours")}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label={t("tracker.date")}>{(id) => <Input id={id} type="date" value={hDate} max={todayISO()} onChange={(e) => setHDate(e.target.value)} required />}</Field>
                <Field label={t("tracker.hoursN")}>{(id) => <Input id={id} type="number" inputMode="decimal" min={0.25} max={24} step={0.25} value={hHours} onChange={(e) => setHHours(e.target.value)} required />}</Field>
              </div>
              <Field label={t("tracker.org")}>{(id) => <Input id={id} value={hOrg} onChange={(e) => setHOrg(e.target.value)} maxLength={100} required />}</Field>
              <Field label={t("tracker.activity")}>{(id) => <Input id={id} value={hAct} onChange={(e) => setHAct(e.target.value)} maxLength={150} />}</Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label={t("tracker.supervisor")}>{(id) => <Input id={id} value={hSup} onChange={(e) => setHSup(e.target.value)} maxLength={80} />}</Field>
                <Field label={t("tracker.supervisorContact")} help={t("tracker.supervisorHelp")}>
                  {(id, d) => <Input id={id} aria-describedby={d} value={hSupC} onChange={(e) => setHSupC(e.target.value)} maxLength={100} />}
                </Field>
              </div>
              <Button type="submit" icon={<Plus aria-hidden="true" className="size-4" />}>
                {t("common.add")}
              </Button>
            </form>
          </Card>
          {s.volunteer.length === 0 ? (
            <EmptyState icon="🤝" title={t("tracker.empty")} />
          ) : (
            <ul className="space-y-2">
              {s.volunteer.map((v) => (
                <li key={v.id} className="flex items-start gap-2 rounded-2xl border-2 border-b-4 border-border bg-surface p-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">
                      {v.org} — {t("resume.hoursLine", { hours: v.hours })}
                    </p>
                    <p className="text-sm text-muted">{[formatDate(v.date, dateLocale), v.activity].filter(Boolean).join(" · ")}</p>
                    {(v.supervisor || v.supervisorContact) && <p className="text-sm">{[v.supervisor, v.supervisorContact].filter(Boolean).join(" — ")}</p>}
                  </div>
                  <span className="no-print">{del(v.org, () => s.removeVolunteer(v.id))}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === "certs" && (
        <div className="space-y-4">
          <Card>
            <form onSubmit={addCert} className="space-y-3">
              <h2 className="font-bold">{t("tracker.addCert")}</h2>
              <Field label={t("tracker.certName")}>
                {(id) => <Input id={id} list="cert-ideas" value={cName} placeholder={t("tracker.certNamePlaceholder")} onChange={(e) => setCName(e.target.value)} maxLength={100} required />}
              </Field>
              <datalist id="cert-ideas">
                {CERT_IDEAS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label={t("tracker.issuer")}>{(id) => <Input id={id} value={cIssuer} onChange={(e) => setCIssuer(e.target.value)} maxLength={100} />}</Field>
                <Field label={t("tracker.status")}>
                  {(id) => (
                    <Select id={id} value={cStatus} onChange={(e) => setCStatus(e.target.value as Certificate["status"])}>
                      {(["earned", "in_progress", "planned"] as const).map((k) => (
                        <option key={k} value={k}>
                          {t(`tracker.status_${k}`)}
                        </option>
                      ))}
                    </Select>
                  )}
                </Field>
                <Field label={t("tracker.earned")}>{(id) => <Input id={id} type="date" value={cEarned} onChange={(e) => setCEarned(e.target.value)} />}</Field>
                <Field label={t("tracker.expires")}>{(id) => <Input id={id} type="date" value={cExpires} onChange={(e) => setCExpires(e.target.value)} />}</Field>
              </div>
              <Button type="submit" icon={<Plus aria-hidden="true" className="size-4" />}>
                {t("common.add")}
              </Button>
            </form>
          </Card>
          {s.certificates.length === 0 ? (
            <EmptyState icon="📜" title={t("tracker.empty")} />
          ) : (
            <ul className="space-y-2">
              {s.certificates.map((c) => {
                const exp = daysUntil(c.expires);
                return (
                  <li key={c.id} className="flex items-start gap-2 rounded-2xl border-2 border-b-4 border-border bg-surface p-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold">{c.name}</p>
                      <p className="text-sm text-muted">{[c.issuer, c.earned && formatDate(c.earned, dateLocale)].filter(Boolean).join(" · ")}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <label className="sr-only" htmlFor={`cs-${c.id}`}>
                          {t("tracker.status")}: {c.name}
                        </label>
                        <Select id={`cs-${c.id}`} value={c.status} onChange={(e) => s.updateCertificate(c.id, { status: e.target.value as Certificate["status"] })} className="!w-auto !py-1">
                          {(["earned", "in_progress", "planned"] as const).map((k) => (
                            <option key={k} value={k}>
                              {t(`tracker.status_${k}`)}
                            </option>
                          ))}
                        </Select>
                        {exp !== undefined && exp <= 60 && <Badge tone="warning">{t("tracker.expiresSoon")}</Badge>}
                      </div>
                    </div>
                    {del(c.name, () => s.removeCertificate(c.id))}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
