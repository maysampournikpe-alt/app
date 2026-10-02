"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { GroupView } from "@/components/people/GroupView";

/** One People group: posts, replies and the post form. */
export default function GroupPage() {
  return (
    <Suspense>
      <GroupInner />
    </Suspense>
  );
}

function GroupInner() {
  const slug = useSearchParams().get("slug") ?? "";
  return <GroupView key={slug} slug={slug} />;
}
