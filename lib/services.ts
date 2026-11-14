// The four service options, explained in plain language (design requirement R1).
import type { ServiceId } from "./types";

export interface ServiceOption {
  id: ServiceId;
  label: string;
  shortLabel: string;
  description: string;
}

export const SERVICE_OPTIONS: ServiceOption[] = [
  { id: "regular", label: "Regular buses & O-Train", shortLabel: "Regular buses & O-Train", description: "Most routes in Ottawa. Recommended." },
  { id: "sto", label: "STO buses (Gatineau, Quebec)", shortLabel: "STO buses", description: "Only useful if you are crossing to Gatineau." },
  { id: "school", label: "School routes", shortLabel: "School routes", description: "Run on school days only; may not suit you." },
  { id: "event", label: "Event shuttles", shortLabel: "Event shuttles", description: "Only during special events." },
];

export const RECOMMENDED_SERVICES: Record<ServiceId, boolean> = { regular: true, sto: true, school: false, event: false };

export function serviceLabel(id: ServiceId): string {
  return SERVICE_OPTIONS.find((s) => s.id === id)?.shortLabel ?? id;
}
