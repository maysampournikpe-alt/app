// All translation files. Each language is a folder in /messages with one JSON
// file per part of the app, combined by that folder's index.ts.
import en from "../../messages/en";
import es from "../../messages/es";
import vi from "../../messages/vi";

export type Messages = Record<string, unknown>;

export const MESSAGES: Record<string, Messages> = { en, es, vi };
