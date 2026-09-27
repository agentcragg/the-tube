// Fun lab idea: card. Slot components (placeholders until built).
import type { Film } from "@/lib/films";

// Film page, top of the Programme notes box body.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function HypeCard({ film }: { film: Film }): React.ReactNode {
  return null;
}

// Front page, inside the Next screening box body, after the seats line.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function HypeCardMini({ film }: { film: Film }): React.ReactNode {
  return null;
}

// Film page, overlaid on the main still (client). frame = current scrub frame index.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function FrameNotes({ film, frame }: { film: Film; frame: number }): React.ReactNode {
  return null;
}
