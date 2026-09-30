import { revalidatePath, revalidateTag } from "next/cache";
import { SHEET_TAG, sheetSentNotice } from "@/lib/suggestions";

// The suggestions sheet calls this whenever it's edited (onSheetEdit in
// sheet/suggestions.gs). The notice is checked with the sheet itself before
// anything is cleared, so no one else can make the site re-read it. Then the
// wall, the front page and Basement TV each show the change on their next visit.
export async function POST(request: Request) {
  let notice = "";
  try {
    notice = String((await request.json()).notice ?? "");
  } catch {}
  if (!/^[\w-]{16,64}$/.test(notice)) return Response.json({ ok: false }, { status: 400 });
  if (!(await sheetSentNotice(notice))) return Response.json({ ok: false }, { status: 403 });

  revalidateTag(SHEET_TAG, { expire: 0 });
  for (const path of ["/", "/wall", "/tv"]) revalidatePath(path);
  return Response.json({ ok: true });
}
