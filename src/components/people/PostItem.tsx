"use client";

import { useState } from "react";
import { Flag, Trash2, MessageSquareReply } from "lucide-react";
import { useT } from "@/i18n/useT";
import { formatRelative } from "@/lib/time";
import { sendPost, type PeoplePost } from "@/lib/people-client";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Composer } from "./Composer";

/** One post with its replies, a Report button and (for your own posts) Delete. */
export function PostItem({ post, slug, canReply, replyKind, onChange }: { post: PeoplePost; slug: string; canReply: boolean; replyKind: "post" | "answer"; onChange: () => void }) {
  const { t, locale } = useT();
  const [showReplies, setShowReplies] = useState(post.role !== "student" || (post.replies?.length ?? 0) <= 2);
  const [replying, setReplying] = useState(false);
  const replies = post.replies ?? [];
  return (
    <li className="rounded-2xl border border-border bg-surface p-4">
      <PostBody post={post} locale={locale} onChange={onChange} />
      {replies.length > 0 &&
        (showReplies ? (
          <ul className="mt-3 space-y-2 border-l-2 border-border pl-3">
            {replies.map((r) => (
              <li key={r.id}>
                <PostBody post={r} locale={locale} onChange={onChange} />
              </li>
            ))}
          </ul>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setShowReplies(true)}>
            {t("people.repliesShow", { count: replies.length })}
          </Button>
        ))}
      {canReply &&
        (replying ? (
          <div className="mt-3">
            <Composer
              slug={slug}
              kind={replyKind}
              parentId={post.id}
              label={replyKind === "answer" ? t("people.answer") : t("people.reply")}
              onPosted={() => {
                setReplying(false);
                setShowReplies(true);
                onChange();
              }}
            />
          </div>
        ) : (
          <Button variant="ghost" size="sm" className="mt-1" icon={<MessageSquareReply aria-hidden="true" className="size-4" />} onClick={() => setReplying(true)}>
            {replyKind === "answer" ? t("people.answer") : t("people.reply")}
          </Button>
        ))}
    </li>
  );
}

function PostBody({ post, locale, onChange }: { post: PeoplePost; locale: string; onChange: () => void }) {
  const { t } = useT();
  const [reported, setReported] = useState(false);
  const kindLabel = ["question", "team", "ride", "story"].includes(post.kind) ? t(`people.kind_${post.kind}`) : null;
  return (
    <article>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="font-bold">{post.nickname}</span>
        {post.role !== "student" && <Badge tone={post.role === "mentor" ? "success" : "accent"}>{t(`people.role_${post.role}`)}</Badge>}
        {kindLabel && <Badge>{kindLabel}</Badge>}
        <span className="text-muted">{formatRelative(post.createdAt, locale)}</span>
      </div>
      <p className="mt-1 whitespace-pre-wrap break-words">{post.body}</p>
      {post.meta?.competition && <p className="mt-1 text-sm font-bold">🏆 {post.meta.competition}</p>}
      {post.meta?.needs && post.meta.needs.length > 0 && <p className="mt-1 text-sm">{t("people.lookingFor", { skills: post.meta.needs.join(", ") })}</p>}
      <div className="mt-1 flex flex-wrap gap-1">
        {post.mine ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-danger"
            icon={<Trash2 aria-hidden="true" className="size-4" />}
            onClick={async () => {
              await sendPost({ action: "delete", id: post.id });
              onChange();
            }}
          >
            {t("people.delete")}
          </Button>
        ) : reported ? (
          <p role="status" className="text-sm text-muted">
            {t("people.reported")}
          </p>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            icon={<Flag aria-hidden="true" className="size-4" />}
            aria-label={`${t("people.report")}: ${post.nickname}`}
            onClick={async () => {
              await sendPost({ action: "report", id: post.id });
              setReported(true);
            }}
          >
            {t("people.report")}
          </Button>
        )}
      </div>
    </article>
  );
}
