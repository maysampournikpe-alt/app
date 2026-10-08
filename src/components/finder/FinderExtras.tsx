"use client";

import Link from "next/link";
import { History, BookmarkPlus, Check, Gift, Compass, TrendingUp, Bookmark, X } from "lucide-react";
import { SURPRISE_QUERIES, SEASONAL } from "@/data/explore";
import { EXPLORE_LINKS } from "@/components/explore/links";
import { CATEGORY_EMOJI } from "@/lib/categories";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { useFinder, type FinderResult } from "@/lib/finder-client";
import type { Opportunity } from "@/types";
import { Chip } from "@/components/ui/Chip";
import { SectionTitle } from "@/components/ui/misc";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { OpportunityCard } from "./OpportunityCard";

/** Extra tools shown with search results (save search; more added in Phase 3). */
export function FinderExtras({ response }: { response: FinderResult; visible: Opportunity[]; onOpen: (o: Opportunity) => void }) {
  const { t } = useT();
  const lastQuery = useFinder((s) => s.lastQuery);
  const savedSearches = useApp((s) => s.savedSearches);
  const addSavedSearch = useApp((s) => s.addSavedSearch);
  const isSaved = savedSearches.some((s) => s.query.toLowerCase() === lastQuery.toLowerCase());
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      <button
        type="button"
        disabled={isSaved}
        onClick={() => addSavedSearch(lastQuery, response.results.map((r) => r.id))}
        className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-2 text-sm font-bold text-primary disabled:text-success"
      >
        {isSaved ? <Check aria-hidden="true" className="size-4" /> : <BookmarkPlus aria-hidden="true" className="size-4" />}
        {isSaved ? t("find.searchSaved") : t("find.saveSearch")}
      </button>
    </div>
  );
}

/** Opportunities recommended by verified staff at the student's school (2.1.4). */
function SchoolRecommendations({ onOpen }: { onOpen: (o: Opportunity) => void }) {
  const { t } = useT();
  const code = useApp((s) => s.profile.schoolCode);
  const [items, setItems] = useState<{ id: string; staffName: string; note: string; opp: Opportunity }[]>([]);
  useEffect(() => {
    if (!code) return;
    apiGet<{ items: typeof items }>(`/api/school/recommendations?code=${encodeURIComponent(code)}`)
      .then((r) => setItems(r.items.slice(0, 5)))
      .catch(() => {});
  }, [code]);
  if (!code || !items.length) return null;
  return (
    <section aria-labelledby="rec-title">
      <SectionTitle id="rec-title">{t("school.recommendedTitle")}</SectionTitle>
      <ul className="space-y-3">
        {items.map((r) => (
          <li key={r.id}>
            {r.note && (
              <p className="mb-1 text-sm">
                <span className="font-bold">{t("school.from", { name: r.staffName })}:</span> {r.note}
              </p>
            )}
            <OpportunityCard opp={r.opp} onOpen={onOpen} compact />
          </li>
        ))}
      </ul>
    </section>
  );
}

/** What shows on the Find page before searching: school picks, saved searches, ideas, and more. */
export function FinderHomeSections({ onOpen }: { onOpen: (o: Opportunity) => void }) {
  return (
    <>
      <SurpriseAndExplore />
      <SchoolRecommendations onOpen={onOpen} />
      <SavedSearches />
      <Seasonal />
      <Trending onOpen={onOpen} />
      <RecentSearches />
    </>
  );
}

/** "Surprise me" (3.1.2) + quick links to Explore. */
function SurpriseAndExplore() {
  const { t, L } = useT();
  const search = useFinder((s) => s.search);
  const setQuery = useFinder((s) => s.setQuery);
  return (
    <section aria-labelledby="explore-title" className="mt-6">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            const q = L(SURPRISE_QUERIES[Math.floor(Math.random() * SURPRISE_QUERIES.length)]);
            setQuery(q);
            void search(q, { surprise: true });
          }}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent-soft px-4 font-bold text-on-accent-soft hover:brightness-95"
        >
          <Gift aria-hidden="true" className="size-5" />
          {t("find.surprise")}
        </button>
        <Link href="/explore" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary-soft px-4 font-bold text-on-primary-soft hover:brightness-95">
          <Compass aria-hidden="true" className="size-5" />
          {t("find.explore")}
        </Link>
      </div>
      <h2 id="explore-title" className="sr-only">
        {t("find.explore")}
      </h2>
      <ul className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar">
        {EXPLORE_LINKS.slice(0, 8).map(({ href, key, icon: Icon }) => (
          <li key={href} className="shrink-0">
            <Link href={href} className="flex w-28 flex-col items-center gap-1 rounded-2xl border-2 border-b-4 border-border bg-surface p-3 text-center text-xs font-bold hover:border-primary">
              <Icon aria-hidden="true" className="size-6 text-primary" />
              {t(`explore.${key}`)}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Seasonal suggestions (3.1.5). */
function Seasonal() {
  const { t, L } = useT();
  const search = useFinder((s) => s.search);
  const setQuery = useFinder((s) => s.setQuery);
  const month = new Date().getMonth();
  const items = SEASONAL.filter((x) => x.months.includes(month)).slice(0, 3);
  if (!items.length) return null;
  return (
    <section aria-labelledby="seasonal-title">
      <SectionTitle id="seasonal-title">{t("find.seasonal")}</SectionTitle>
      <ul className="grid gap-2 sm:grid-cols-3">
        {items.map((x) => (
          <li key={L(x.title)}>
            <button
              type="button"
              onClick={() => {
                const q = L(x.query);
                setQuery(q);
                void search(q);
              }}
              className="h-full w-full rounded-2xl border-2 border-b-4 border-border bg-surface p-3 text-left hover:border-primary"
            >
              <span className="block font-bold">
                <span aria-hidden="true">{x.emoji}</span> {L(x.title)}
              </span>
              <span className="text-sm text-muted">{L(x.why)}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Trending near you (3.1.3): anonymous save counts in the student's area. */
function Trending({ onOpen }: { onOpen: (o: Opportunity) => void }) {
  const { t } = useT();
  const zip = useApp((s) => s.profile.zip);
  const lowData = useApp((s) => s.settings.lowData);
  const [items, setItems] = useState<{ opp: Opportunity; count: number }[]>([]);
  useEffect(() => {
    if (lowData) return;
    apiGet<{ items: typeof items }>(`/api/trending?area=${zip?.slice(0, 3) ?? ""}`)
      .then((r) => setItems(r.items))
      .catch(() => {});
  }, [zip, lowData]);
  if (!items.length) return null;
  return (
    <section aria-labelledby="trend-title">
      <SectionTitle id="trend-title">
        <span className="flex items-center gap-2">
          <TrendingUp aria-hidden="true" className="size-5" />
          {t("explore.trendingNear")}
        </span>
      </SectionTitle>
      <p className="-mt-2 mb-3 text-sm text-muted">{t("explore.trendingHelp")}</p>
      <ul className="space-y-2">
        {items.map(({ opp, count }) => (
          <li key={opp.id}>
            <button type="button" onClick={() => onOpen(opp)} className="flex w-full items-center gap-3 rounded-2xl border-2 border-b-4 border-border bg-surface p-3 text-left hover:border-primary">
              <span aria-hidden="true" className="text-2xl">
                {CATEGORY_EMOJI[opp.category]}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-bold">{opp.title}</span>
                <span className="text-sm text-muted">{t("explore.savedBy", { count })}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Saved searches with "new results" alerts (3.1.8). */
function SavedSearches() {
  const { t } = useT();
  const saved = useApp((s) => s.savedSearches);
  const remove = useApp((s) => s.removeSavedSearch);
  const search = useFinder((s) => s.search);
  const setQuery = useFinder((s) => s.setQuery);
  if (!saved.length) return null;
  return (
    <section aria-labelledby="ss-title">
      <SectionTitle id="ss-title">
        <span className="flex items-center gap-2">
          <Bookmark aria-hidden="true" className="size-5" />
          {t("explore.savedSearches")}
        </span>
      </SectionTitle>
      <ul className="space-y-2">
        {saved.map((x) => (
          <li key={x.id} className="flex items-center gap-2 rounded-2xl border-2 border-b-4 border-border bg-surface p-2 pl-3">
            <button
              type="button"
              className="min-w-0 flex-1 text-left font-bold hover:underline"
              onClick={() => {
                setQuery(x.query);
                void search(x.query);
              }}
            >
              {x.query}
              {!!x.newCount && (
                <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-xs text-white dark:text-black">{t("explore.newResults", { count: x.newCount })}</span>
              )}
            </button>
            <button type="button" aria-label={t("explore.removeSearch", { q: x.query })} onClick={() => remove(x.id)} className="inline-flex size-10 items-center justify-center rounded-full text-muted hover:bg-surface-2">
              <X aria-hidden="true" className="size-4" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function RecentSearches() {
  const { t } = useT();
  const history = useApp((s) => s.history);
  const { setQuery, search } = useFinder();
  if (!history.length) return null;
  return (
    <section aria-labelledby="history-title">
      <SectionTitle id="history-title">
        <span className="flex items-center gap-2">
          <History aria-hidden="true" className="size-5" />
          {t("find.history")}
        </span>
      </SectionTitle>
      <div className="flex flex-wrap gap-2">
        {history.slice(0, 8).map((h) => (
          <Chip
            key={h.query}
            size="sm"
            onClick={() => {
              setQuery(h.query);
              void search(h.query);
            }}
          >
            {h.query}
          </Chip>
        ))}
      </div>
    </section>
  );
}
