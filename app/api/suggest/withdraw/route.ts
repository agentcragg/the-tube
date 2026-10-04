import { withdrawFromSheet } from "@/lib/suggestions";
import { isVideoId } from "@/lib/videos";

// Withdraws a suggestion that's still waiting. The body is {id, key}, the key
// being the one /api/suggest gave the browser that sent it. Answers
// {withdrawn: true} once the sheet has it marked; {withdrawn: false} when the
// sheet can't or won't, with state "wall" if it's been ticked meanwhile or
// "gone" if its row is, and the browser then just forgets it.
export async function POST(request: Request) {
  let id = "";
  let key = "";
  try {
    const body = await request.json();
    id = String(body.id ?? "");
    key = String(body.key ?? "");
  } catch {}
  if (!isVideoId(id) || !/^[\w-]{16,64}$/.test(key)) {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
  const done = await withdrawFromSheet(id, key);
  if (!done) return Response.json({ error: "Couldn't reach the sheet" }, { status: 502 });
  return Response.json(done);
}
