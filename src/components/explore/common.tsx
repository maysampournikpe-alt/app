"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useT } from "@/i18n/useT";
import type { GuideSection } from "@/data/guides";
import { Card } from "@/components/ui/Card";
import { Alert, PageHeader } from "@/components/ui/misc";
import { ReadAloudButton } from "@/components/a11y/ReadAloudButton";
import { useFinder } from "@/lib/finder-client";
import { useRouter } from "next/navigation";

export function BackLink({ href = "/explore", label }: { href?: string; label?: string }) {
  const { t } = useT();
  return (
    <Link href={href} className="mb-3 inline-flex min-h-10 items-center gap-1 font-bold text-primary">
      <ArrowLeft aria-hidden="true" className="size-4" /> {label ?? t("explore.back")}
    </Link>
  );
}

export function ExternalA({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  const { t } = useT();
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className ?? "inline-flex min-h-10 items-center gap-1 font-bold text-primary underline underline-offset-4"}>
      {children}
      <ExternalLink aria-hidden="true" className="size-4 shrink-0" />
      <span className="sr-only">{t("common.externalLink")}</span>
    </a>
  );
}

/** Returns a function that runs a Find-tab search and opens the Find tab. */
export function useRunSearch() {
  const router = useRouter();
  return (q: string) => {
    const f = useFinder.getState();
    f.setQuery(q);
    void f.search(q);
    router.push("/");
  };
}

/** A plain-language guide page made of sections. */
export function GuidePage({ title, subtitle, icon, sections }: { title: string; subtitle?: string; icon?: React.ReactNode; sections: GuideSection[] }) {
  const { t, L } = useT();
  return (
    <div>
      <BackLink />
      <PageHeader title={title} subtitle={subtitle} icon={icon} />
      <div className="mb-4">
        <ReadAloudButton text={[title, ...sections.flatMap((s) => [L(s.title), L(s.body)])].join(". ")} />
      </div>
      <div className="space-y-3">
        {sections.map((s, i) => (
          <Card key={i}>
            <h2 className="mb-1 text-lg font-bold">{L(s.title)}</h2>
            <p className="whitespace-pre-line">{L(s.body)}</p>
            {s.link && <ExternalA href={s.link.url}>{L(s.link.label)}</ExternalA>}
          </Card>
        ))}
      </div>
      <Alert className="mt-4">{t("explore.guideNote")}</Alert>
    </div>
  );
}
