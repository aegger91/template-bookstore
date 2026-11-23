import { ExternalLink } from "lucide-react";
import { rsvpUrl, site } from "@/lib/content";
import type { EventItem } from "@/lib/types";

export function RsvpLink({ event, label, note }: { event: EventItem; label: string; note: string }) {
  if (!site.orthodoxConnect.enabled || !site.orthodoxConnect.eventsRsvp.enabled) return null;
  return (
    <a
      href={rsvpUrl(event)}
      target="_blank"
      rel="noopener"
      className="inline-flex items-center gap-2 rounded-md bg-navy px-4 py-2 text-[0.98rem] text-paper hover:bg-navy-deep"
      title={note}
      data-orthodoxconnect-event={event.orthodoxConnectId}
    >
      {label}
      <ExternalLink className="size-3.5" />
    </a>
  );
}
