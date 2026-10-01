// Distance math (works in the browser and on the server).

/** Miles between two points on Earth ("as the crow flies"). */
export function milesBetween(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 3958.8;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** "Mcallen" → "McAllen", "SAN JUAN" → "San Juan" */
export function prettyCity(city: string): string {
  return city
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bMc(\w)/g, (_m, c: string) => `Mc${c.toUpperCase()}`);
}
