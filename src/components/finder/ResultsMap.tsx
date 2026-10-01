"use client";

// Map view of results (3.1.1). Uses free OpenStreetMap tiles through Leaflet.
// Loaded only when the student opens the map (and never in Low data mode).
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from "react-leaflet";
import type { Opportunity } from "@/types";

export default function ResultsMap({
  items,
  center,
  youLabel,
  onOpen,
  detailsLabel,
}: {
  items: Opportunity[];
  center?: { lat: number; lng: number };
  youLabel: string;
  onOpen: (o: Opportunity) => void;
  detailsLabel: string;
}) {
  const points = items.filter((o) => typeof o.lat === "number" && typeof o.lng === "number");
  const start = center ?? (points[0] ? { lat: points[0].lat!, lng: points[0].lng! } : { lat: 26.2, lng: -98.2 });
  return (
    <MapContainer center={[start.lat, start.lng]} zoom={center ? 10 : 8} scrollWheelZoom={false} className="h-[60vh] min-h-80 w-full rounded-2xl" style={{ zIndex: 0 }}>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {center && (
        <CircleMarker center={[center.lat, center.lng]} radius={9} pathOptions={{ color: "#1d4ed8", fillColor: "#3b82f6", fillOpacity: 0.9 }}>
          <Tooltip>{youLabel}</Tooltip>
        </CircleMarker>
      )}
      {points.map((o) => (
        <CircleMarker key={o.id} center={[o.lat!, o.lng!]} radius={10} pathOptions={{ color: "#0b6b66", fillColor: o.cost.type === "free" ? "#16a34a" : "#f59e0b", fillOpacity: 0.85 }}>
          <Popup>
            <strong>{o.title}</strong>
            <br />
            {o.organization}
            <br />
            <button type="button" onClick={() => onOpen(o)} style={{ marginTop: 6, fontWeight: 700, textDecoration: "underline", color: "#0b6b66" }}>
              {detailsLabel}
            </button>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
