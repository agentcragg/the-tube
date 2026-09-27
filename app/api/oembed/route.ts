// Looks up a YouTube video's title and channel so suggestions show real details.
export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id || !/^[\w-]{11}$/.test(id)) {
    return Response.json({ error: "Not a YouTube video ID" }, { status: 400 });
  }
  const res = await fetch(
    `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}`,
  );
  if (!res.ok) {
    return Response.json({ error: "Couldn't find that video. It may be private or removed." }, { status: 404 });
  }
  const data = await res.json();
  return Response.json({ id, title: data.title as string, author: data.author_name as string });
}
