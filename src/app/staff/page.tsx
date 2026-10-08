"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { BadgeCheck, LogOut, Trash2, EyeOff, Eye } from "lucide-react";
import { CATEGORIES } from "@/types";
import { useT } from "@/i18n/useT";
import { CATEGORY_EMOJI } from "@/lib/categories";
import { formatRelative } from "@/lib/time";
import { PageHeader, Segmented, Alert, EmptyState, SectionTitle } from "@/components/ui/misc";
import { Card } from "@/components/ui/Card";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Toggle } from "@/components/ui/Toggle";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

type Tab = "post" | "dashboard" | "report" | "clubs" | "moderation";
const SESSION_KEY = "rumbo-staff";

async function staffCall<T>(body: Record<string, unknown>): Promise<{ ok: boolean; data: T; status: number }> {
  const r = await fetch("/api/staff", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return { ok: r.ok, status: r.status, data: (await r.json().catch(() => ({}))) as T };
}

/** 2.1.3–2.1.5 Staff tools: verified posting, teacher dashboard, counselor reports, clubs, moderation. */
export default function StaffPage() {
  const { t, locale } = useT();
  const [code, setCode] = useState<string | null>(null);
  const [school, setSchool] = useState<string>("");
  const [codeInput, setCodeInput] = useState("");
  const [bad, setBad] = useState(false);
  const [tab, setTab] = useState<Tab>("post");
  const [staffName, setStaffName] = useState("");

  const verify = useCallback(async (c: string) => {
    const r = await staffCall<{ schoolName?: string }>({ action: "verify", code: c });
    if (r.ok && r.data.schoolName) {
      setCode(c);
      setSchool(r.data.schoolName);
      setBad(false);
      try {
        sessionStorage.setItem(SESSION_KEY, c);
      } catch {
        /* private mode */
      }
    } else {
      setBad(true);
    }
  }, []);

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = sessionStorage.getItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
    if (saved) void verify(saved);
  }, [verify]);

  if (!code) {
    return (
      <div>
        <PageHeader title={t("staff.title")} subtitle={t("staff.subtitle")} icon={<BadgeCheck className="size-7" />} />
        <Card>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void verify(codeInput.trim().toUpperCase());
            }}
            className="space-y-3"
          >
            <Field label={t("staff.codeLabel")} help={t("staff.codeHelp")}>
              {(id, d) => <Input id={id} aria-describedby={d} value={codeInput} onChange={(e) => setCodeInput(e.target.value)} autoComplete="off" autoCapitalize="characters" />}
            </Field>
            {bad && <Alert tone="danger" role="alert">{t("staff.badCode")}</Alert>}
            <Button type="submit">{t("staff.signIn")}</Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={t("staff.title")}
        subtitle={t("staff.signedIn", { school })}
        icon={<BadgeCheck className="size-7" />}
        action={
          <Button
            variant="ghost"
            size="sm"
            icon={<LogOut aria-hidden="true" className="size-4" />}
            onClick={() => {
              setCode(null);
              try {
                sessionStorage.removeItem(SESSION_KEY);
              } catch {
                /* ignore */
              }
            }}
          >
            {t("staff.signOut")}
          </Button>
        }
      />
      <Field label={t("staff.yourName")} className="mb-4">
        {(id) => <Input id={id} value={staffName} maxLength={60} placeholder={t("staff.yourNamePlaceholder")} onChange={(e) => setStaffName(e.target.value)} />}
      </Field>
      <div className="mb-4">
        <Segmented<Tab>
          label={t("staff.title")}
          value={tab}
          onChange={setTab}
          options={[
            { value: "post", label: t("staff.tabPost") },
            { value: "dashboard", label: t("staff.tabDashboard") },
            { value: "report", label: t("staff.tabReport") },
            { value: "clubs", label: t("staff.tabClubs") },
            { value: "moderation", label: t("staff.tabModeration") },
          ]}
        />
      </div>
      {tab === "post" && <PostTab code={code} staffName={staffName} locale={locale} />}
      {tab === "dashboard" && <DashboardTab code={code} locale={locale} />}
      {tab === "report" && <ReportTab code={code} />}
      {tab === "clubs" && <ClubsTab code={code} />}
      {tab === "moderation" && <ModerationTab code={code} locale={locale} />}
    </div>
  );
}

function PostTab({ code, staffName, locale }: { code: string; staffName: string; locale: string }) {
  const { t } = useT();
  const empty = { title: "", organization: "", description: "", category: "volunteer", free: true, costText: "", gradeMin: "", gradeMax: "", deadline: "", startDate: "", dateText: "", online: false, city: "", sourceUrl: "" };
  const [f, setF] = useState(empty);
  const [recommend, setRecommend] = useState(true);
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState<{ tone: "success" | "danger"; text: string } | null>(null);
  const [posts, setPosts] = useState<{ id: string; createdAt: string; opp: { title: string; category: string } }[]>([]);
  const up = (x: Partial<typeof empty>) => setF((c) => ({ ...c, ...x }));

  const load = useCallback(async () => {
    const r = await staffCall<{ items: typeof posts }>({ action: "my-posts", code });
    if (r.ok) setPosts(r.data.items);
  }, [code]);
  useEffect(() => {
    void load();
  }, [load]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const name = staffName.trim() || "School staff";
    const opp = {
      title: f.title,
      organization: f.organization,
      description: f.description,
      category: f.category,
      free: f.free,
      costText: f.costText || undefined,
      gradeMin: f.gradeMin ? Number(f.gradeMin) : undefined,
      gradeMax: f.gradeMax ? Number(f.gradeMax) : undefined,
      deadline: f.deadline || undefined,
      startDate: f.startDate || undefined,
      dateText: f.dateText || undefined,
      online: f.online,
      city: f.city || undefined,
      sourceUrl: f.sourceUrl || undefined,
    };
    const r = await staffCall<{ id?: string; error?: string }>({ action: "post", code, staffName: name, opp });
    if (!r.ok) {
      setMsg({ tone: "danger", text: r.data.error === "scam_flags" || r.data.error === "blocked" ? t("staff.scamBlocked") : t("common.error") });
      return;
    }
    if (recommend) {
      await staffCall({
        action: "recommend",
        code,
        staffName: name,
        note,
        opp: {
          id: `staff-${r.data.id}`,
          title: opp.title,
          organization: opp.organization,
          description: opp.description,
          category: opp.category,
          cost: { type: opp.free ? "free" : "paid", text: opp.costText },
          grades: opp.gradeMin || opp.gradeMax ? { min: opp.gradeMin, max: opp.gradeMax } : undefined,
          deadline: opp.deadline,
          startDate: opp.startDate,
          dateText: opp.dateText,
          mode: opp.online ? "online" : "in_person",
          city: opp.city,
          carFree: opp.online ? "yes" : "unknown",
          sourceUrl: opp.sourceUrl,
          source: "staff",
          verified: true,
          staffName: name,
        },
      });
    }
    setMsg({ tone: "success", text: t("staff.published") });
    setF(empty);
    setNote("");
    void load();
  }

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-bold">{t("staff.postTitle")}</h2>
        <p className="mb-3 text-sm text-muted">{t("staff.postHelp")}</p>
        <form onSubmit={submit} className="space-y-3">
          <Field label={t("staff.fTitle")}>{(id) => <Input id={id} value={f.title} onChange={(e) => up({ title: e.target.value })} maxLength={160} required minLength={3} />}</Field>
          <Field label={t("staff.fOrg")}>{(id) => <Input id={id} value={f.organization} onChange={(e) => up({ organization: e.target.value })} maxLength={120} required minLength={2} />}</Field>
          <Field label={t("staff.fDesc")}>{(id) => <Textarea id={id} value={f.description} onChange={(e) => up({ description: e.target.value })} maxLength={800} required minLength={10} />}</Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t("staff.fCategory")}>
              {(id) => (
                <Select id={id} value={f.category} onChange={(e) => up({ category: e.target.value })}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {CATEGORY_EMOJI[c]} {t(`cat.${c}`)}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label={t("staff.fCost")}>{(id) => <Input id={id} value={f.costText} onChange={(e) => up({ costText: e.target.value })} maxLength={160} />}</Field>
            <Field label={t("staff.fGradeMin")}>{(id) => <Input id={id} type="number" min={1} max={12} value={f.gradeMin} onChange={(e) => up({ gradeMin: e.target.value })} />}</Field>
            <Field label={t("staff.fGradeMax")}>{(id) => <Input id={id} type="number" min={1} max={12} value={f.gradeMax} onChange={(e) => up({ gradeMax: e.target.value })} />}</Field>
            <Field label={t("staff.fDeadline")}>{(id) => <Input id={id} type="date" value={f.deadline} onChange={(e) => up({ deadline: e.target.value })} />}</Field>
            <Field label={t("staff.fStart")}>{(id) => <Input id={id} type="date" value={f.startDate} onChange={(e) => up({ startDate: e.target.value })} />}</Field>
            <Field label={t("staff.fCity")}>{(id) => <Input id={id} value={f.city} onChange={(e) => up({ city: e.target.value })} maxLength={80} />}</Field>
            <Field label={t("staff.fUrl")}>{(id) => <Input id={id} type="url" value={f.sourceUrl} onChange={(e) => up({ sourceUrl: e.target.value })} maxLength={600} />}</Field>
          </div>
          <Field label={t("staff.fDateText")}>{(id) => <Input id={id} value={f.dateText} onChange={(e) => up({ dateText: e.target.value })} maxLength={200} />}</Field>
          <div className="divide-y divide-border">
            <Toggle checked={f.free} onChange={(v) => up({ free: v })} label={t("staff.fFree")} />
            <Toggle checked={f.online} onChange={(v) => up({ online: v })} label={t("staff.fOnline")} />
            <Toggle checked={recommend} onChange={setRecommend} label={t("staff.alsoRecommend")} />
          </div>
          {recommend && <Field label={t("staff.recommendNote")}>{(id) => <Input id={id} value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} />}</Field>}
          {msg && (
            <Alert tone={msg.tone} role="status">
              {msg.text}
            </Alert>
          )}
          <Button type="submit">{t("staff.publish")}</Button>
        </form>
      </Card>
      <SectionTitle>{t("staff.myPosts")}</SectionTitle>
      {posts.length ? (
        <ul className="space-y-2">
          {posts.map((p) => (
            <li key={p.id} className="flex items-center gap-2 rounded-2xl border-2 border-b-4 border-border bg-surface p-3">
              <span className="min-w-0 flex-1">
                <span className="block font-bold">{p.opp.title}</span>
                <span className="text-xs text-muted">
                  {t(`cat.${p.opp.category}`)} · {formatRelative(p.createdAt, locale)}
                </span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="text-danger"
                icon={<Trash2 aria-hidden="true" className="size-4" />}
                onClick={async () => {
                  await staffCall({ action: "remove-post", code, id: p.id });
                  void load();
                }}
              >
                {t("staff.remove")}
                <span className="sr-only">: {p.opp.title}</span>
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">—</p>
      )}
    </div>
  );
}

interface Student {
  nickname: string;
  grade?: number;
  searches: number;
  saves: number;
  applied: number;
  planSteps: number;
  hours: number;
  updatedAt: string;
}

function DashboardTab({ code, locale }: { code: string; locale: string }) {
  const { t } = useT();
  const [rows, setRows] = useState<Student[] | null>(null);
  useEffect(() => {
    void staffCall<{ students: Student[] }>({ action: "dashboard", code }).then((r) => setRows(r.ok ? r.data.students : []));
  }, [code]);
  return (
    <Card>
      <h2 className="text-lg font-bold">{t("staff.dashTitle")}</h2>
      <p className="mb-3 text-sm text-muted">{t("staff.dashHelp")}</p>
      {rows && rows.length === 0 && <EmptyState icon="🧑‍🏫" title={t("staff.dashEmpty")} />}
      {rows && rows.length > 0 && (
        <div className="-mx-4 overflow-x-auto px-4">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                {["colStudent", "colGrade", "colSearches", "colSaves", "colApplied", "colSteps", "colHours", "colActive"].map((c) => (
                  <th key={c} scope="col" className="px-2 py-2 font-bold">
                    {t(`staff.${c}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((s, i) => {
                const low = s.saves + s.applied + s.planSteps === 0;
                return (
                  <tr key={i} className="border-b border-border">
                    <th scope="row" className="px-2 py-2 font-bold">
                      {s.nickname}
                      {low && (
                        <Badge tone="warning" className="ml-2">
                          {t("staff.lowEngagement")}
                        </Badge>
                      )}
                    </th>
                    <td className="px-2 py-2">{s.grade ?? "—"}</td>
                    <td className="px-2 py-2">{s.searches}</td>
                    <td className="px-2 py-2">{s.saves}</td>
                    <td className="px-2 py-2">{s.applied}</td>
                    <td className="px-2 py-2">{s.planSteps}</td>
                    <td className="px-2 py-2">{s.hours}</td>
                    <td className="px-2 py-2">{formatRelative(s.updatedAt, locale)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function Bars({ title, rows }: { title: string; rows: { category: string; count: number }[] }) {
  const { t } = useT();
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <div>
      <h3 className="mb-2 font-bold">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-muted">{t("staff.noData")}</p>
      ) : (
        <ul className="space-y-1.5">
          {rows.map((r) => (
            <li key={r.category} className="grid grid-cols-[9rem_1fr_2.5rem] items-center gap-2 text-sm">
              <span className="truncate">{r.category === "other" ? "—" : t(`cat.${r.category}`)}</span>
              <span className="h-4 overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
                <span className="block h-full rounded-full bg-primary" style={{ width: `${(r.count / max) * 100}%` }} />
              </span>
              <span className="text-right font-bold">{r.count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ReportTab({ code }: { code: string }) {
  const { t } = useT();
  const days = 30;
  const [data, setData] = useState<{ school: { category: string; count: number }[]; everyone: { category: string; count: number }[]; totals: { students: number; hours: number; applied: number } } | null>(null);
  useEffect(() => {
    void staffCall<NonNullable<typeof data>>({ action: "report", code, days }).then((r) => r.ok && setData(r.data));
  }, [code]);
  return (
    <Card className="space-y-5">
      <div>
        <h2 className="text-lg font-bold">{t("staff.reportTitle")}</h2>
        <p className="text-sm text-muted">{t("staff.reportHelp", { days })}</p>
      </div>
      {data && (
        <>
          <p className="font-bold">{t("staff.totals", { students: data.totals.students, hours: data.totals.hours, applied: data.totals.applied })}</p>
          <Bars title={t("staff.yourSchool")} rows={data.school} />
          <Bars title={t("staff.allStudents")} rows={data.everyone} />
        </>
      )}
    </Card>
  );
}

function ClubsTab({ code }: { code: string }) {
  const { t } = useT();
  const [clubs, setClubs] = useState<{ id: string; name: string; description: string; meets?: string; sponsor?: string }[]>([]);
  const [f, setF] = useState({ name: "", description: "", meets: "", sponsor: "" });
  const load = useCallback(async () => {
    const r = await fetch(`/api/people/clubs?code=${encodeURIComponent(code)}`);
    if (r.ok) setClubs((await r.json()).clubs);
  }, [code]);
  useEffect(() => {
    void load();
  }, [load]);
  return (
    <div className="space-y-4">
      <Card>
        <h2 className="mb-3 text-lg font-bold">{t("staff.addClub")}</h2>
        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const r = await staffCall({ action: "add-club", code, ...f, meets: f.meets || undefined, sponsor: f.sponsor || undefined });
            if (r.ok) {
              setF({ name: "", description: "", meets: "", sponsor: "" });
              void load();
            }
          }}
        >
          <Field label={t("staff.clubName")}>{(id) => <Input id={id} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} maxLength={80} required />}</Field>
          <Field label={t("staff.clubDesc")}>{(id) => <Textarea id={id} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} maxLength={400} required minLength={5} className="min-h-16" />}</Field>
          <Field label={t("staff.clubMeets")}>{(id) => <Input id={id} value={f.meets} onChange={(e) => setF({ ...f, meets: e.target.value })} maxLength={120} />}</Field>
          <Field label={t("staff.clubSponsor")}>{(id) => <Input id={id} value={f.sponsor} onChange={(e) => setF({ ...f, sponsor: e.target.value })} maxLength={80} />}</Field>
          <Button type="submit">{t("common.add")}</Button>
        </form>
      </Card>
      <SectionTitle>{t("staff.clubsTitle")}</SectionTitle>
      <ul className="space-y-2">
        {clubs.map((c) => (
          <li key={c.id} className="flex items-start gap-2 rounded-2xl border-2 border-b-4 border-border bg-surface p-3">
            <div className="min-w-0 flex-1">
              <p className="font-bold">{c.name}</p>
              <p className="text-sm">{c.description}</p>
              <p className="text-xs text-muted">{[c.meets, c.sponsor].filter(Boolean).join(" · ")}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-danger"
              onClick={async () => {
                await staffCall({ action: "remove-club", code, id: c.id });
                void load();
              }}
            >
              {t("staff.remove")}
              <span className="sr-only">: {c.name}</span>
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ModerationTab({ code, locale }: { code: string; locale: string }) {
  const { t } = useT();
  type Item = { id: string; group?: string; nickname: string; body: string; hidden: boolean; reports: number; createdAt: string };
  const [data, setData] = useState<{ posts: Item[]; reviews: Item[] } | null>(null);
  const load = useCallback(async () => {
    const r = await staffCall<{ posts: Item[]; reviews: Item[] }>({ action: "moderation", code });
    if (r.ok) setData(r.data);
  }, [code]);
  useEffect(() => {
    void load();
  }, [load]);
  const items = [...(data?.posts ?? []).map((p) => ({ ...p, target: "post" as const })), ...(data?.reviews ?? []).map((p) => ({ ...p, target: "review" as const }))];
  return (
    <Card>
      <h2 className="text-lg font-bold">{t("staff.modTitle")}</h2>
      <p className="mb-3 text-sm text-muted">{t("staff.modHelp")}</p>
      {data && items.length === 0 && <EmptyState icon="🛡️" title={t("staff.modEmpty")} />}
      <ul className="space-y-2">
        {items.map((p) => (
          <li key={p.id} className="rounded-xl border border-border p-3">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-bold">{p.nickname}</span>
              {p.group && <span className="text-muted">· {p.group}</span>}
              <span className="text-muted">· {formatRelative(p.createdAt, locale)}</span>
              <Badge tone="warning">{t("staff.reports", { count: p.reports })}</Badge>
              {p.hidden && <Badge tone="danger">{t("staff.hidden")}</Badge>}
            </div>
            <p className="mt-1">{p.body}</p>
            <div className="mt-2 flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                icon={<EyeOff aria-hidden="true" className="size-4" />}
                onClick={async () => {
                  await staffCall({ action: "moderate", code, id: p.id, target: p.target, hide: true });
                  void load();
                }}
              >
                {t("staff.hide")}
              </Button>
              <Button
                size="sm"
                variant="soft"
                icon={<Eye aria-hidden="true" className="size-4" />}
                onClick={async () => {
                  await staffCall({ action: "moderate", code, id: p.id, target: p.target, hide: false });
                  void load();
                }}
              >
                {t("staff.restore")}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
