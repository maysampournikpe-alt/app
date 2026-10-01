declare module "zipcodes" {
  export interface ZipInfo {
    zip: string;
    latitude: number;
    longitude: number;
    city: string;
    state: string;
    country: string;
  }
  export function lookup(zip: string | number): ZipInfo | undefined;
  export function lookupByName(city: string, state: string): ZipInfo[];
  export function lookupByCoords(lat: number, lon: number): ZipInfo | null;
  export const states: { normalize(s: string): string; abbr: Record<string, string> };
}
