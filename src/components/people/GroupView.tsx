"use client";

import { useCallback, useEffect, useState } from "react";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { peopleQuery, type PeoplePost } from "@/lib/people-client";
import { PageHeader, Alert, Spinner, EmptyState } from "@/components/ui/misc";
import { Card } from "@/components/ui/Card";
import { BackLink } from "@/components/explore/common";
import { SafetyRules } from "./SafetyRules";
import { Composer } from "./Composer";
import { PostItem } from "./PostItem";

interface GroupData {
  group: { slug: string; kind: string; name: string; nameEs?: string | null; description?: string | null; descEs?: string | null };
  canPost: { post: boolean; answer: boolean; cheer: boolean };
  posts: PeoplePost[];
}

export function GroupView({ slug }: { slug: string }) {
  const { t, L } = useT();
  const locked = useApp((s) => s.consent.under13 && !s.parental.peopleEnabled);
  const [data, setData] = useState<GroupData | null>(null);
  const [error, setError] = useState<"locked" | "error" | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/people/posts?${peopleQuery({ slug })}`, { headers: { "x-device-id": useApp.getState().deviceId } });
    if (res.status === 403) return setError("locked");
    if (!res.ok) return setError("error");
    setData((await res.json()) as GroupData);
  }, [slug]);

  useEffect(() => {
    if (!locked) void load();
  }, [load, locked]);

  if (locked) {
    return (
      <div>
        <PageHeader title={t("nav.people")} />
        <Alert tone="info" title={t("people.locked")} />
      </div>
    );
  }

  const kind = data?.group.kind;
  const postKind = kind === "mentor" ? "question" : kind === "team" ? "team" : kind === "carpool" ? "ride" : "post";
  const label = t(postKind === "question" ? "people.writeQuestion" : postKind === "team" ? "people.writeTeam" : postKind === "ride" ? "people.writeRide" : "people.writePost");

  return (
    <div className="space-y-4">
      <BackLink href="/people" label={t("people.back")} />
      {error && <PageHeader title={t("nav.people")} />}
      {error === "locked" && <Alert tone="info">{t("people.lockedGroup")}</Alert>}
      {error === "error" && <Alert tone="warning">{t("people.error")}</Alert>}
      {!data && !error && <Spinner label={t("common.loading")} />}
      {data && (
        <>
          <PageHeader title={L({ en: data.group.name, es: data.group.nameEs ?? data.group.name })} subtitle={L({ en: data.group.description ?? "", es: data.group.descEs ?? data.group.description ?? "" })} />
          {kind === "mentor" && <p className="text-sm text-muted">{t("people.mentorNote")}</p>}
          {kind === "alumni" && <p className="text-sm text-muted">{t("people.alumniNote")}</p>}
          {data.canPost.post ? (
            <Card>
              <Composer slug={slug} kind={postKind} label={label} onPosted={load} />
            </Card>
          ) : (
            kind !== "alumni" && <Alert tone="info">{t("people.joinToPost")}</Alert>
          )}
          <SafetyRules />
          {data.posts.length === 0 ? (
            <EmptyState title={t("people.empty")} />
          ) : (
            <ul className="space-y-3">
              {data.posts.map((p) => (
                <PostItem key={p.id} post={p} slug={slug} canReply={kind === "mentor" ? data.canPost.answer : data.canPost.post && kind !== "alumni"} replyKind={kind === "mentor" ? "answer" : "post"} onChange={load} />
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
