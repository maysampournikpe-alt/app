import type { MetadataRoute } from "next";

// The web app manifest makes Rumbo installable on phones like a real app.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rumbo — Find your path",
    short_name: "Rumbo",
    description: "Find real opportunities, build skills, and reach your goals. English y Español.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f7f6f2",
    theme_color: "#0b6b66",
    categories: ["education", "productivity"],
    lang: "en",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Find", url: "/", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Coach", url: "/coach", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "My saved", url: "/me/saved", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
