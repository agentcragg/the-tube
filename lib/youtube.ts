// A video's length and whether YouTube lets it play on other sites, read from
// its watch page (oEmbed doesn't give either). Used for videos ticked in the
// sheet after Basement TV's list was made. null if the page can't be read.

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";

export async function youtubePlayable(id: string): Promise<{ seconds: number; embeddable: boolean } | null> {
  if (!/^[\w-]{11}$/.test(id)) return null;
  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${id}`, {
      headers: { "User-Agent": UA, "Accept-Language": "en-GB" },
      next: { revalidate: 86400 }, // a video's length doesn't change
    });
    if (!res.ok) return null;
    const page = await res.text();
    const seconds = Number(page.match(/"lengthSeconds":"(\d+)"/)?.[1] ?? 0);
    const embeddable =
      /"playableInEmbed":true/.test(page) &&
      /"playabilityStatus":\{"status":"OK"/.test(page) &&
      !/"isFamilySafe":false/.test(page);
    return { seconds, embeddable };
  } catch {
    return null;
  }
}
