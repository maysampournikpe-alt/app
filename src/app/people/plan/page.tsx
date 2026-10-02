"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SharedPlanView } from "@/components/people/SharedPlanView";

/** 6.6 A friend's shared plan: follow along, copy it, send preset cheers. */
export default function SharedPlanPage() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}

function Inner() {
  const code = useSearchParams().get("code") ?? "";
  return <SharedPlanView key={code} code={code} />;
}
