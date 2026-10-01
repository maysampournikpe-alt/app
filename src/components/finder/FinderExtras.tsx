"use client";

import { History, BookmarkPlus, Check } from "lucide-react";
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

/** What shows on the Find page before searching: school picks, recent searches, and more. */
export function FinderHomeSections({ onOpen }: { onOpen: (o: Opportunity) => void }) {
  return (
    <>
      <SchoolRecommendations onOpen={onOpen} />
      <RecentSearches />
    </>
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
