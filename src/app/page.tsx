"use client";

import { useMemo, useState, type FormEvent } from "react";
import dynamic from "next/dynamic";
import { Search, Sparkles, RotateCcw } from "lucide-react";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { useFinder, applyFilters } from "@/lib/finder-client";
import type { Opportunity } from "@/types";
import { Logo } from "@/components/layout/Logo";
import { Alert, SectionTitle } from "@/components/ui/misc";
import { Chip } from "@/components/ui/Chip";
import { VoiceInputButton } from "@/components/a11y/VoiceInputButton";
import { ReadAloudButton } from "@/components/a11y/ReadAloudButton";
import { OpportunityCard } from "@/components/finder/OpportunityCard";
import { OpportunityDetails } from "@/components/finder/OpportunityDetails";
import { SuggestionCard } from "@/components/finder/SuggestionCard";
import { FilterBar } from "@/components/finder/Filters";
import { LocationControl } from "@/components/finder/LocationControl";
import { FinderExtras, FinderHomeSections } from "@/components/finder/FinderExtras";
import { CrisisHelp } from "@/components/safety/CrisisHelp";
import { Segmented } from "@/components/ui/misc";

// The map library is big, so it's only downloaded when the student opens the map.
const ResultsMap = dynamic(() => import("@/components/finder/ResultsMap"), { ssr: false, loading: () => <div className="h-80 animate-pulse rounded-xl bg-surface-2" /> });

/** 1.1 Opportunity Finder — the home page. */
export default function FindPage() {
  const { t } = useT();
  const nickname = useApp((s) => s.profile.nickname);
  const grade = useApp((s) => s.profile.grade);
  const onlineOnly = useApp((s) => s.settings.onlineOnly);
  const aiAllowed = useApp((s) => s.parental.aiSearchEnabled || !s.consent.under13);
  const { query, setQuery, search, loading, error, response, filters, lastQuery } = useFinder();
  const [open, setOpen] = useState<Opportunity | null>(null);
  const [view, setView] = useState<"list" | "map">("list");
  const lowData = useApp((s) => s.settings.lowData);
  const surprise = useFinder((s) => s.surprise);

  const visible = useMemo(() => (response ? applyFilters(response.results, filters, { grade, onlineOnly }) : []), [response, filters, grade, onlineOnly]);
  const hidden = (response?.results.length ?? 0) - visible.length;

  function submit(e?: FormEvent) {
    e?.preventDefault();
    void search();
  }

  const examples = ["ex1", "ex2", "ex3", "ex4", "ex5", "ex6"].map((k) => t(`find.${k}`));
  const notice = response?.notice;

  return (
    <div>
      {/* Friendly AI greeting */}
      <div className="mb-4 flex items-start gap-3">
        <Logo className="size-11 shrink-0" />
        <div className="rounded-xl rounded-tl-sm bg-surface p-4 shadow-sm">
          <h1 className="text-xl font-bold sm:text-2xl">{nickname ? t("find.greetingName", { name: nickname }) : t("find.greeting")}</h1>
          <p className="mt-1 text-sm text-muted">{t("find.subtitle")}</p>
        </div>
      </div>

      <form role="search" onSubmit={submit} className="flex items-center gap-2 rounded-xl border border-input bg-card p-1.5 shadow-xs focus-within:border-primary">
        <label htmlFor="finder-q" className="sr-only">
          {t("find.searchLabel")}
        </label>
        <Search aria-hidden="true" className="ml-2 size-5 shrink-0 text-muted" />
        <input
          id="finder-q"
          type="search"
          enterKeyHint="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("find.placeholder")}
          maxLength={300}
          className="min-h-11 w-full min-w-0 bg-transparent text-base outline-none placeholder:text-muted focus-visible:outline-none"
        />
        <VoiceInputButton
          onText={(text, final) => {
            setQuery(text);
            if (final) void search(text);
          }}
        />
        <button type="submit" disabled={loading || query.trim().length < 2} className="inline-flex min-h-11 shrink-0 items-center rounded-xl bg-primary px-4 font-bold text-on-primary disabled:opacity-50">
          {t("find.searchButton")}
        </button>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <LocationControl areaLabel={response?.areaLabel} />
      </div>

      {!response && !loading && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-bold text-muted">{t("find.examples")}</p>
          <div className="flex flex-wrap gap-2">
            {examples.map((ex) => (
              <Chip
                key={ex}
                size="sm"
                onClick={() => {
                  setQuery(ex);
                  void search(ex);
                }}
              >
                {ex}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="mt-6 space-y-3" aria-busy="true">
          <p role="status" className="flex items-center gap-2 font-bold text-primary">
            <Sparkles aria-hidden="true" className="size-5 animate-pulse" />
            {aiAllowed ? t("find.searching") : t("find.searchingDemo")}
          </p>
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-surface-2" />
          ))}
        </div>
      )}

      {error && !loading && (
        <Alert tone="danger" className="mt-4" role="alert">
          {t("common.error")}{" "}
          <button type="button" onClick={() => submit()} className="font-bold underline">
            {t("common.retry")}
          </button>
        </Alert>
      )}

      {response && !loading && (
        <section aria-labelledby="results-title" className="mt-5">
          {response.crisis && <CrisisHelp />}
          {response.blocked && <Alert tone="warning">{t("find.blocked")}</Alert>}

          {!response.crisis && !response.blocked && (
            <>
              {notice && (
                <Alert tone={notice === "demo" ? "info" : "warning"} className="mb-3">
                  {t(`find.${notice}Notice`)}
                </Alert>
              )}
              {response.cached && <p className="mb-2 text-sm text-muted">{t("find.cachedNotice")}</p>}
              {!!response.removedCount && (
                <Alert tone="info" className="mb-3">
                  {t("find.removedNotice", { count: response.removedCount })}
                </Alert>
              )}
              {response.message && (
                <div className="mb-3 flex items-start gap-2 rounded-xl bg-surface p-3 text-sm shadow-sm">
                  <Sparkles aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
                  <p className="flex-1">
                    <span className="sr-only">{t("find.aiMessage")}: </span>
                    {response.message}
                  </p>
                  <ReadAloudButton compact text={response.message} />
                </div>
              )}

              <div className="mb-3 flex items-end justify-between gap-2">
                <div>
                  <h2 id="results-title" className="text-lg font-bold">
                    {t("find.resultsFor", { q: lastQuery })}
                  </h2>
                  <p className="text-sm text-muted" aria-live="polite">
                    {t("find.resultsCount", { count: visible.length })}
                    {hidden > 0 && ` · ${t("find.hiddenByFilters", { count: hidden })}`}
                  </p>
                </div>
                <button type="button" onClick={() => submit()} aria-label={t("common.retry")} className="inline-flex size-10 items-center justify-center rounded-full hover:bg-surface-2">
                  <RotateCcw aria-hidden="true" className="size-5" />
                </button>
              </div>

              <FilterBar />
              <FinderExtras response={response} visible={visible} onOpen={setOpen} />
              {surprise && <Alert className="mt-3">🎁 {t("explore.surpriseTitle")}</Alert>}
              {visible.length > 0 && (
                <div className="mt-3">
                  <Segmented<"list" | "map">
                    label={t("explore.mapTitle")}
                    value={view}
                    onChange={setView}
                    options={[
                      { value: "list", label: t("find.listView") },
                      { value: "map", label: t("find.mapView") },
                    ]}
                  />
                </div>
              )}

              {view === "map" && visible.length > 0 ? (
                <div className="mt-3">
                  {lowData ? (
                    <Alert>{t("explore.mapLowData")}</Alert>
                  ) : visible.some((o) => o.lat !== undefined) ? (
                    <ResultsMap items={visible} center={response.center} youLabel={t("explore.mapYou")} onOpen={setOpen} detailsLabel={t("opp.details")} />
                  ) : (
                    <Alert>{t("explore.mapNoPoints")}</Alert>
                  )}
                </div>
              ) : visible.length === 0 ? (
                <div className="mt-3 rounded-xl border border-dashed p-5 text-center">
                  <p className="font-bold">{t("find.noResults")}</p>
                  <p className="mt-1 text-sm text-muted">{t("find.noResultsHelp")}</p>
                </div>
              ) : (
                <ul className="mt-3 space-y-3">
                  {visible.map((o) => (
                    <li key={o.id}>
                      <OpportunityCard opp={o} onOpen={setOpen} />
                    </li>
                  ))}
                </ul>
              )}

              {response.suggestions.length > 0 && (
                <section aria-labelledby="sug-title" className="mt-6">
                  <SectionTitle id="sug-title">{t("find.suggestionsTitle")}</SectionTitle>
                  <p className="-mt-2 mb-3 text-sm text-muted">{t("find.suggestionsHelp")}</p>
                  <ul className="space-y-3">
                    {response.suggestions.map((s) => (
                      <li key={s.id}>
                        <SuggestionCard s={s} />
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </section>
      )}

      {!response && !loading && <FinderHomeSections onOpen={setOpen} />}

      <OpportunityDetails opp={open} onClose={() => setOpen(null)} onOpen={setOpen} pool={response?.results} />
    </div>
  );
}
