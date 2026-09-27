import { films } from "./films";
import { seedVideos } from "./videos";

// Tags across the films and the wall, with how often each is used,
// for the tag cloud. Sorted alphabetically, like a 2007 cloud.
export function tagCloud() {
  const counts = new Map<string, number>();
  for (const item of [...films, ...seedVideos]) {
    for (const t of item.tags ?? []) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  const max = Math.max(...counts.values());
  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([tag, count]) => ({ tag, count, size: 1 + Math.round((count / max) * 4) })); // size 1..5
}

export const tagHref = (tag: string) => `/wall?tag=${encodeURIComponent(tag)}`;
