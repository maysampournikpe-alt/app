"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Sparkles, Lock, HeartHandshake, AlertTriangle } from "lucide-react";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { LOCALES } from "@/i18n/config";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Field, Input, Select } from "@/components/ui/Field";
import { Toggle } from "@/components/ui/Toggle";
import { Alert, ProgressBar } from "@/components/ui/misc";
import { Logo } from "@/components/layout/Logo";
import { INTERESTS, GRADES } from "@/data/interests";
import { sha256 } from "@/lib/utils";
import type { Transport } from "@/types";

type Step = "hello" | "age" | "parent" | "profile" | "promise";

/** First-time setup: language → age → (parent consent if under 13) → profile → privacy promise. */
export default function WelcomePage() {
  const { t } = useT();
  const router = useRouter();
  const s = useApp();
  const [step, setStep] = useState<Step>("hello");
  const [birthYear, setBirthYear] = useState<number | undefined>(s.profile.birthYear);
  const thisYear = new Date().getFullYear();
  const age = birthYear ? thisYear - birthYear : undefined;
  const under13 = age !== undefined && age < 13;

  // Parent consent form
  const [isGuardian, setIsGuardian] = useState(false);
  const [agrees, setAgrees] = useState(false);
  const [relationship, setRelationship] = useState("");
  const [pin, setPin] = useState("");
  const [requireApproval, setRequireApproval] = useState(true);
  const [declined, setDeclined] = useState(false);

  // Profile form
  const [nickname, setNickname] = useState(s.profile.nickname ?? "");
  const [grade, setGrade] = useState<number | undefined>(s.profile.grade);
  const [zip, setZip] = useState(s.profile.zip ?? "");
  const [city, setCity] = useState(s.profile.city ?? "");
  const [interests, setInterests] = useState<string[]>(s.profile.interests);
  const [transport, setTransport] = useState<Transport>(s.profile.transport);

  const steps: Step[] = under13 ? ["hello", "age", "parent", "profile", "promise"] : ["hello", "age", "profile", "promise"];
  const idx = steps.indexOf(step);

  const years = Array.from({ length: 16 }, (_, i) => thisYear - 6 - i); // ages 6–21

  async function finishParent() {
    const pinHash = /^\d{4}$/.test(pin) ? await sha256(pin) : undefined;
    s.setConsent({ under13: true, parentConsentAt: new Date().toISOString(), parentConsentName: relationship || undefined });
    s.setParental({ pinHash, requireApproval });
    setStep("profile");
  }

  function finishProfile() {
    s.setProfile({
      nickname: nickname.trim().slice(0, 24) || undefined,
      birthYear,
      grade,
      zip: /^\d{5}$/.test(zip.trim()) ? zip.trim() : undefined,
      city: city.trim() || undefined,
      interests,
      transport,
    });
    setStep("promise");
  }

  function finish() {
    s.setConsent({ onboarded: true, under13, privacyAcceptedAt: new Date().toISOString() });
    router.replace("/");
  }

  return (
    <div className="mx-auto max-w-xl">
      {idx > 0 && (
        <div className="mb-5">
          <p className="mb-1 text-sm font-bold text-muted">{t("welcome.stepOf", { a: idx, b: steps.length - 1 })}</p>
          <ProgressBar value={idx / (steps.length - 1)} label={t("welcome.stepOf", { a: idx, b: steps.length - 1 })} />
        </div>
      )}

      {step === "hello" && (
        <section aria-labelledby="hello-title" className="space-y-6 text-center">
          <Logo className="mx-auto size-24" />
          <div>
            <h1 id="hello-title" className="text-3xl font-bold">
              {t("welcome.hello")}
            </h1>
            <p className="mt-3 text-lg text-muted">{t("welcome.intro")}</p>
          </div>
          <div>
            <p className="mb-2 font-bold" id="pick-lang">
              {t("welcome.pickLanguage")}
            </p>
            <div role="group" aria-labelledby="pick-lang" className="flex flex-wrap justify-center gap-2">
              {LOCALES.map((l) => (
                <Chip key={l.code} selected={s.settings.locale === l.code} onClick={() => s.setSettings({ locale: l.code })}>
                  <span lang={l.code}>{l.name}</span>
                  {l.beta && <span className="text-xs opacity-80">({t("common.beta")})</span>}
                </Chip>
              ))}
            </div>
          </div>
          <Button size="lg" full onClick={() => setStep("age")}>
            {t("welcome.start")}
          </Button>
          <Link href="/privacy" className="inline-block font-bold text-primary underline underline-offset-4">
            {t("welcome.privacyLink")}
          </Link>
        </section>
      )}

      {step === "age" && (
        <section aria-labelledby="age-title" className="space-y-5">
          <h1 id="age-title" className="text-2xl font-bold">
            {t("welcome.ageTitle")}
          </h1>
          <p className="text-muted">{t("welcome.ageHelp")}</p>
          <Field label={t("welcome.birthYear")}>
            {(id) => (
              <Select id={id} value={birthYear ?? ""} onChange={(e) => setBirthYear(e.target.value ? Number(e.target.value) : undefined)}>
                <option value="">{t("welcome.chooseYear")}</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          {age !== undefined && age < 10 && <Alert tone="warning">{t("welcome.tooYoung")}</Alert>}
          {age !== undefined && age > 19 && <Alert tone="info">{t("welcome.tooOld")}</Alert>}
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStep("hello")}>
              {t("common.back")}
            </Button>
            <Button
              full
              disabled={!birthYear || (age !== undefined && age < 10)}
              onClick={() => {
                s.setProfile({ birthYear });
                setStep(under13 ? "parent" : "profile");
              }}
            >
              {t("common.next")}
            </Button>
          </div>
        </section>
      )}

      {step === "parent" && (
        <section aria-labelledby="parent-title" className="space-y-5">
          <h1 id="parent-title" className="text-2xl font-bold">
            {t("welcome.parentTitle")}
          </h1>
          <Alert tone="info">{t("welcome.parentWhy")}</Alert>
          {declined ? (
            <Alert tone="warning" role="status">
              {t("welcome.parentDeclined")}
            </Alert>
          ) : (
            <Card className="space-y-4">
              <h2 className="text-lg font-bold">{t("welcome.parentForParent")}</h2>
              <p>{t("welcome.parentSummary")}</p>
              <ul className="space-y-2">
                {[1, 2, 3, 4].map((n) => (
                  <li key={n} className="flex gap-2">
                    <ShieldCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
                    <span>{t(`welcome.parentPoint${n}`)}</span>
                  </li>
                ))}
              </ul>
              <Link href="/privacy" target="_blank" className="inline-block font-bold text-primary underline underline-offset-4">
                {t("welcome.parentReadPrivacy")}
              </Link>
              <label className="flex items-start gap-3">
                <input type="checkbox" className="mt-1 size-5 accent-[var(--primary)]" checked={isGuardian} onChange={(e) => setIsGuardian(e.target.checked)} />
                <span>{t("welcome.parentCheckGuardian")}</span>
              </label>
              <label className="flex items-start gap-3">
                <input type="checkbox" className="mt-1 size-5 accent-[var(--primary)]" checked={agrees} onChange={(e) => setAgrees(e.target.checked)} />
                <span>{t("welcome.parentCheckAgree")}</span>
              </label>
              <Field label={t("welcome.relationship")}>
                {(id) => (
                  <Select id={id} value={relationship} onChange={(e) => setRelationship(e.target.value)}>
                    <option value="">—</option>
                    <option value="mom">{t("welcome.relMom")}</option>
                    <option value="dad">{t("welcome.relDad")}</option>
                    <option value="guardian">{t("welcome.relGuardian")}</option>
                    <option value="other">{t("welcome.relOther")}</option>
                  </Select>
                )}
              </Field>
              <Field label={t("welcome.parentPin")} help={t("welcome.parentPinHelp")}>
                {(id, d) => (
                  <Input
                    id={id}
                    aria-describedby={d}
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                    className="max-w-32 tracking-[0.5em]"
                  />
                )}
              </Field>
              <Toggle checked={requireApproval} onChange={setRequireApproval} label={t("welcome.parentApproval")} />
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button full disabled={!isGuardian || !agrees || !relationship} onClick={finishParent}>
                  {t("welcome.parentAgree")}
                </Button>
                <Button variant="secondary" full onClick={() => setDeclined(true)}>
                  {t("welcome.parentDecline")}
                </Button>
              </div>
            </Card>
          )}
          <Button variant="ghost" onClick={() => setStep("age")}>
            {t("common.back")}
          </Button>
        </section>
      )}

      {step === "profile" && (
        <section aria-labelledby="profile-title" className="space-y-5">
          <h1 id="profile-title" className="text-2xl font-bold">
            {t("welcome.profileTitle")}
          </h1>
          <p className="text-muted">{t("welcome.profileHelp")}</p>
          <Field label={`${t("welcome.nickname")} (${t("common.optional")})`} help={t("welcome.nicknameHelp")}>
            {(id, d) => <Input id={id} aria-describedby={d} maxLength={24} value={nickname} onChange={(e) => setNickname(e.target.value)} autoComplete="off" />}
          </Field>
          <Field label={t("welcome.gradeQ")}>
            {(id) => (
              <Select id={id} value={grade ?? ""} onChange={(e) => setGrade(e.target.value ? Number(e.target.value) : undefined)}>
                <option value="">{t("welcome.chooseGrade")}</option>
                {GRADES.map((g) => (
                  <option key={g} value={g}>
                    {t("common.gradeN", { n: g })}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <fieldset className="space-y-2">
            <legend className="font-bold">{t("welcome.whereQ")}</legend>
            <p className="text-sm text-muted">{t("welcome.whereHelp")}</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t("welcome.zip")}>
                {(id) => (
                  <Input id={id} inputMode="numeric" maxLength={5} autoComplete="postal-code" value={zip} onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))} />
                )}
              </Field>
              <Field label={t("welcome.orCity")}>
                {(id) => <Input id={id} placeholder={t("welcome.cityPlaceholder")} value={city} onChange={(e) => setCity(e.target.value)} autoComplete="address-level2" />}
              </Field>
            </div>
          </fieldset>
          <fieldset>
            <legend className="font-bold">{t("welcome.interestsQ")}</legend>
            <p className="mb-2 text-sm text-muted">{t("welcome.interestsHelp")}</p>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((i) => (
                <Chip
                  key={i.id}
                  size="sm"
                  selected={interests.includes(i.id)}
                  onClick={() => setInterests((cur) => (cur.includes(i.id) ? cur.filter((x) => x !== i.id) : [...cur, i.id]))}
                  icon={<span aria-hidden="true">{i.emoji}</span>}
                >
                  {t(`interests.${i.id}`)}
                </Chip>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-2 font-bold">{t("welcome.transportQ")}</legend>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["car", "transportCar"],
                  ["rides", "transportRides"],
                  ["bus_walk", "transportBus"],
                ] as const
              ).map(([v, k]) => (
                <Chip key={v} size="sm" selected={transport === v} onClick={() => setTransport(v)}>
                  {t(`welcome.${k}`)}
                </Chip>
              ))}
            </div>
          </fieldset>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStep(under13 ? "parent" : "age")}>
              {t("common.back")}
            </Button>
            <Button full onClick={finishProfile}>
              {t("common.next")}
            </Button>
          </div>
        </section>
      )}

      {step === "promise" && (
        <section aria-labelledby="promise-title" className="space-y-5">
          <h1 id="promise-title" className="text-2xl font-bold">
            {t("welcome.promiseTitle")}
          </h1>
          <ul className="space-y-3">
            {[
              [Lock, "promise1"],
              [Sparkles, "promise2"],
              [AlertTriangle, "promise3"],
              [HeartHandshake, "promise4"],
            ].map(([Icon, key]) => {
              const I = Icon as typeof Lock;
              return (
                <li key={key as string} className="flex items-start gap-3 rounded-xl bg-surface p-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-on-primary-soft">
                    <I aria-hidden="true" className="size-5" />
                  </span>
                  <span className="pt-2 font-bold">{t(`welcome.${key as string}`)}</span>
                </li>
              );
            })}
          </ul>
          <Link href="/privacy" className="inline-block font-bold text-primary underline underline-offset-4">
            {t("welcome.privacyLink")}
          </Link>
          <Button size="lg" full onClick={finish}>
            {t("welcome.promiseAgree")}
          </Button>
        </section>
      )}
    </div>
  );
}
