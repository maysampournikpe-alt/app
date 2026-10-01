"use client";

import { useState } from "react";
import { MapPin, LocateFixed } from "lucide-react";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { useFinder } from "@/lib/finder-client";
import { Sheet } from "@/components/ui/Sheet";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/misc";

/** Shows where we're searching, and lets the student use GPS or type a ZIP/town. */
export function LocationControl({ areaLabel }: { areaLabel?: string }) {
  const { t } = useT();
  const profile = useApp((s) => s.profile);
  const setProfile = useApp((s) => s.setProfile);
  const geo = useFinder((s) => s.geo);
  const setGeo = useFinder((s) => s.setGeo);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(profile.zip ?? profile.city ?? "");
  const [status, setStatus] = useState<"idle" | "locating" | "denied">("idle");

  const label = areaLabel ?? (geo ? t("find.useMyLocation") : profile.zip ?? profile.city);

  function locate() {
    if (!("geolocation" in navigator)) return setStatus("denied");
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus("idle");
        setOpen(false);
      },
      () => setStatus("denied"),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 600_000 },
    );
  }

  function saveTyped() {
    const v = value.trim();
    setGeo(undefined);
    if (/^\d{5}$/.test(v)) setProfile({ zip: v, city: undefined });
    else setProfile({ city: v || undefined, zip: undefined });
    setOpen(false);
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-surface-2 px-3 text-sm font-bold">
        <MapPin aria-hidden="true" className="size-4 text-primary" />
        <span>{label ? t("find.near", { place: label }) : t("find.noLocation")}</span>
        <span className="text-primary underline underline-offset-2">{t("find.changeLocation")}</span>
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title={t("find.location")} closeLabel={t("common.close")}>
        <div className="space-y-4">
          <Button full variant="soft" icon={<LocateFixed aria-hidden="true" className="size-5" />} onClick={locate} disabled={status === "locating"}>
            {status === "locating" ? t("find.locating") : t("find.useMyLocation")}
          </Button>
          {status === "denied" && <Alert tone="warning">{t("find.locationDenied")}</Alert>}
          <Field label={t("find.zipOrCity")}>
            {(id) => <Input id={id} value={value} onChange={(e) => setValue(e.target.value)} placeholder="78501 / Edinburg" autoComplete="postal-code" />}
          </Field>
          <Button full onClick={saveTyped}>
            {t("find.setLocation")}
          </Button>
          <p className="text-sm text-muted">{t("find.locationHelp")}</p>
        </div>
      </Sheet>
    </>
  );
}
