// A slot for one Fun lab idea. Its contents stay hidden unless the idea is
// switched on (html.x-<id>, set by the Fun lab panel). Uses display: contents
// when on, so whatever's inside lays out as if the wrapper weren't there.

export default function Fun({ id, children }: { id: string; children: React.ReactNode }) {
  return <div className={`fun fun-${id}`}>{children}</div>;
}
