"use client";

import { useEffect, useState } from "react";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { apiGet } from "@/lib/api";
import { Card } from "@/components/ui/Card";

interface Club {
  id: string;
  name: string;
  description: string;
  meets?: string | null;
  sponsor?: string | null;
}

/** 6.4 Club directory for the student's school (needs the school code). */
export function ClubDirectory() {
  const { t } = useT();
  const code = useApp((s) => s.profile.schoolCode);
  const [clubs, setClubs] = useState<Club[]>([]);
  useEffect(() => {
    if (!code) return;
    apiGet<{ clubs: Club[] }>(`/api/people/clubs?code=${encodeURIComponent(code)}`)
      .then((r) => setClubs(r.clubs))
      .catch(() => setClubs([]));
  }, [code]);
  if (!code || clubs.length === 0) return <p className="text-muted">{t("people.clubsEmpty")}</p>;
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {clubs.map((c) => (
        <li key={c.id}>
          <Card className="h-full">
            <h3 className="font-bold">{c.name}</h3>
            <p className="text-sm">{c.description}</p>
            {c.meets && <p className="mt-1 text-sm text-muted">{t("people.meets", { when: c.meets })}</p>}
            {c.sponsor && <p className="text-sm text-muted">{t("people.sponsor", { name: c.sponsor })}</p>}
          </Card>
        </li>
      ))}
    </ul>
  );
}
