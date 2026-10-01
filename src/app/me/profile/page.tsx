"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { INTERESTS, GRADES } from "@/data/interests";
import { LOCALES } from "@/i18n/config";
import type { Profile, Transport } from "@/types";
import { PageHeader, Alert } from "@/components/ui/misc";
import { Card } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/ui/Field";
import { Chip } from "@/components/ui/Chip";
import { Toggle } from "@/components/ui/Toggle";
import { Button } from "@/components/ui/Button";
import { TagInput } from "@/components/ui/TagInput";

/** 1.4 Student profile. Saved only on this device. The AI uses it so students don't retype details. */
export default function ProfilePage() {
  const { t } = useT();
  const profile = useApp((s) => s.profile);
  const setProfile = useApp((s) => s.setProfile);
  const settings = useApp((s) => s.settings);
  const setSettings = useApp((s) => s.setSettings);
  const [p, setP] = useState<Profile>(profile);
  const [saved, setSaved] = useState(false);
  const up = (x: Partial<Profile>) => {
    setP((cur) => ({ ...cur, ...x }));
    setSaved(false);
  };
  const thisYear = new Date().getFullYear();

  function save(e: FormEvent) {
    e.preventDefault();
    setProfile({
      ...p,
      nickname: p.nickname?.trim().slice(0, 24) || undefined,
      zip: p.zip && /^\d{5}$/.test(p.zip) ? p.zip : undefined,
      city: p.city?.trim() || undefined,
      school: p.school?.trim() || undefined,
    });
    setSaved(true);
  }

  return (
    <div>
      <Link href="/me" className="mb-3 inline-flex min-h-10 items-center gap-1 font-bold text-primary">
        <ArrowLeft aria-hidden="true" className="size-4" /> {t("me.title")}
      </Link>
      <PageHeader title={t("me.profile")} subtitle={t("welcome.profileHelp")} />
      <form onSubmit={save} className="space-y-4">
        <Card className="space-y-4">
          <Field label={t("me.nickname")} help={t("welcome.nicknameHelp")}>
            {(id, d) => <Input id={id} aria-describedby={d} value={p.nickname ?? ""} maxLength={24} onChange={(e) => up({ nickname: e.target.value })} />}
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("me.grade")}>
              {(id) => (
                <Select id={id} value={p.grade ?? ""} onChange={(e) => up({ grade: e.target.value ? Number(e.target.value) : undefined })}>
                  <option value="">—</option>
                  {GRADES.map((g) => (
                    <option key={g} value={g}>
                      {t("common.gradeN", { n: g })}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label={t("me.birthYear")}>
              {(id) => (
                <Select id={id} value={p.birthYear ?? ""} onChange={(e) => up({ birthYear: e.target.value ? Number(e.target.value) : undefined })}>
                  <option value="">—</option>
                  {Array.from({ length: 16 }, (_, i) => thisYear - 6 - i).map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </div>
          <Field label={`${t("me.school")} (${t("common.optional")})`} help={t("me.schoolHelp")}>
            {(id, d) => <Input id={id} aria-describedby={d} value={p.school ?? ""} maxLength={80} onChange={(e) => up({ school: e.target.value })} />}
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label={t("me.zip")}>
              {(id) => <Input id={id} inputMode="numeric" maxLength={5} value={p.zip ?? ""} onChange={(e) => up({ zip: e.target.value.replace(/\D/g, "") })} />}
            </Field>
            <Field label={t("me.city")}>
              {(id) => <Input id={id} value={p.city ?? ""} maxLength={60} onChange={(e) => up({ city: e.target.value })} />}
            </Field>
          </div>
          <Field label={t("me.language")}>
            {(id) => (
              <Select id={id} value={settings.locale} onChange={(e) => setSettings({ locale: e.target.value })}>
                {LOCALES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </Card>

        <Card className="space-y-4">
          <fieldset>
            <legend className="mb-2 font-bold">{t("me.interests")}</legend>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((i) => (
                <Chip
                  key={i.id}
                  size="sm"
                  selected={p.interests.includes(i.id)}
                  onClick={() => up({ interests: p.interests.includes(i.id) ? p.interests.filter((x) => x !== i.id) : [...p.interests, i.id] })}
                  icon={<span aria-hidden="true">{i.emoji}</span>}
                >
                  {t(`interests.${i.id}`)}
                </Chip>
              ))}
            </div>
          </fieldset>
          <Field label={t("me.skills")} help={t("me.skillsHelp")}>
            {(id, d) => <TagInput id={id} describedBy={d} value={p.skills} onChange={(skills) => up({ skills })} />}
          </Field>
          <Field label={t("me.goals")} help={t("me.goalsHelp")}>
            {(id, d) => <TagInput id={id} describedBy={d} value={p.goals} onChange={(goals) => up({ goals })} max={5} />}
          </Field>
          <fieldset>
            <legend className="mb-2 font-bold">{t("me.transport")}</legend>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["car", "transportCar"],
                  ["rides", "transportRides"],
                  ["bus_walk", "transportBus"],
                ] as [Transport, string][]
              ).map(([v, k]) => (
                <Chip key={v} size="sm" selected={p.transport === v} onClick={() => up({ transport: v })}>
                  {t(`welcome.${k}`)}
                </Chip>
              ))}
            </div>
          </fieldset>
          <Toggle checked={!!p.firstGen} onChange={(v) => up({ firstGen: v })} label={t("me.firstGen")} />
        </Card>

        <Card className="space-y-4">
          <Field label={t("me.counselorName")} help={t("me.counselorHelp")}>
            {(id, d) => <Input id={id} aria-describedby={d} value={p.counselorName ?? ""} maxLength={60} onChange={(e) => up({ counselorName: e.target.value })} />}
          </Field>
          <Field label={t("me.counselorContact")}>
            {(id) => <Input id={id} value={p.counselorContact ?? ""} maxLength={100} onChange={(e) => up({ counselorContact: e.target.value })} />}
          </Field>
        </Card>

        {saved && (
          <Alert tone="success" role="status">
            {t("me.profileSaved")}
          </Alert>
        )}
        <Button type="submit" full size="lg">
          {t("common.save")}
        </Button>
      </form>
    </div>
  );
}
