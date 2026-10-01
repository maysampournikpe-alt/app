import "server-only";
import zipcodes from "zipcodes";
import type { LocationInput } from "@/types";
import { milesBetween, prettyCity } from "@/lib/geo";

// U.S. ZIP code coordinates come from the open "zipcodes" package (BSD license),
// which is based on U.S. Census data. Used only to measure distances.

export interface ResolvedLocation {
  lat: number;
  lng: number;
  city: string;
  state: string; // "TX"
  stateName: string; // "Texas"
  zip3: string; // first 3 digits of a nearby ZIP, used for anonymous "trending" counts
  label: string; // "McAllen, TX"
}

const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California", CO: "Colorado", CT: "Connecticut", DE: "Delaware",
  DC: "District of Columbia", FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota",
  MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico",
  NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", PR: "Puerto Rico",
  RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia",
  WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

function fromZipInfo(z: zipcodes.ZipInfo): ResolvedLocation {
  const city = prettyCity(z.city);
  return {
    lat: z.latitude,
    lng: z.longitude,
    city,
    state: z.state,
    stateName: STATE_NAMES[z.state] ?? z.state,
    zip3: z.zip.slice(0, 3),
    label: `${city}, ${z.state}`,
  };
}

/** Parse "Edinburg", "Edinburg, TX" or "Edinburg TX" into a location. Texas is tried first. */
export function lookupCity(raw: string): ResolvedLocation | null {
  const m = /^\s*(.+?)[,\s]+([A-Za-z]{2})\s*$/.exec(raw);
  const tries: [string, string][] = m ? [[m[1], m[2].toUpperCase()]] : [];
  tries.push([raw.trim(), "TX"]);
  for (const [city, st] of tries) {
    const hits = zipcodes.lookupByName(city, st);
    if (hits.length) {
      // Average all ZIPs in the city to get its center.
      const lat = hits.reduce((s, h) => s + h.latitude, 0) / hits.length;
      const lng = hits.reduce((s, h) => s + h.longitude, 0) / hits.length;
      return { ...fromZipInfo(hits[0]), lat, lng };
    }
  }
  return null;
}

export function resolveLocation(input?: LocationInput): ResolvedLocation | null {
  if (!input) return null;
  if (input.zip && /^\d{5}$/.test(input.zip)) {
    const z = zipcodes.lookup(input.zip);
    if (z) return fromZipInfo(z);
  }
  if (typeof input.lat === "number" && typeof input.lng === "number") {
    const z = zipcodes.lookupByCoords(input.lat, input.lng);
    if (z) return { ...fromZipInfo(z), lat: input.lat, lng: input.lng };
  }
  if (input.city) return lookupCity(input.city);
  return null;
}

/** Distance in miles from the student to an opportunity's city (rounded). */
export function distanceTo(from: ResolvedLocation | null, city?: string, coords?: { lat?: number; lng?: number }): { miles?: number; lat?: number; lng?: number } {
  let point: { lat: number; lng: number } | null = null;
  if (coords?.lat !== undefined && coords?.lng !== undefined) point = { lat: coords.lat, lng: coords.lng };
  else if (city) {
    const c = lookupCity(city);
    if (c) point = { lat: c.lat, lng: c.lng };
  }
  if (!point) return {};
  if (!from) return point;
  return { ...point, miles: Math.round(milesBetween(from, point) * 10) / 10 };
}
