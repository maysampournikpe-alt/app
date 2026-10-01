import type { LocationInput, ProfileSummary, Category } from "@/types";

export interface FinderRequest {
  query: string;
  locale: string;
  location?: LocationInput;
  profile: ProfileSummary;
  filters?: { freeOnly?: boolean; category?: Category; onlineOnly?: boolean; paidOnly?: boolean };
  lowData?: boolean;
  schoolCode?: string;
}
