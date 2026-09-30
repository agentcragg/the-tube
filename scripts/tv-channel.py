# Basement TV, step 2 of 2: rebuild lib/tv-channel.json, the channel's
# videos and their comments, from what scripts/tv-comments.py saved.
#
#   python3 scripts/tv-channel.py WORK [PICKS]
#
# WORK is the folder tv-comments.py wrote raw/<id>.json into. PICKS (default
# WORK/picks.json) is {"videos": [{"id", "comments": [{"author", "text",
# "votes", "time"}]}]}: the comments to show for each video, in the order
# they should appear. A picked comment has to be in that video's raw file
# word for word (ends trimmed) or it's left out, with a warning, so nothing
# on the channel is made up.
#
# A video is on the channel if it plays in embeds, is family safe and is
# 20 minutes or less. Its credit is "by" from candidates.json, or the
# YouTube channel if there isn't one. The page shuffles them (lib/tv.ts).
import glob, json, os, re, sys

MAX_SECONDS = 20 * 60
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "lib", "tv-channel.json")

if len(sys.argv) < 2:
    sys.exit("usage: python3 scripts/tv-channel.py WORK [PICKS]")
work = os.path.abspath(sys.argv[1])
picks_path = sys.argv[2] if len(sys.argv) > 2 else os.path.join(work, "picks.json")
picks = {v["id"]: v["comments"] for v in json.load(open(picks_path))["videos"]}

# Line endings to \n; spaces and zero-width marks off the ends
EDGES = re.compile("^[\\s\u200b\u200c\u200d\ufeff]+|[\\s\u200b\u200c\u200d\ufeff]+$")
clean = lambda s: EDGES.sub("", (s or "").replace("\r\n", "\n").replace("\r", "\n"))
squash = lambda s: re.sub(r"\n\s*\n+", "\n", clean(s))

videos, dropped = [], 0
for path in sorted(glob.glob(os.path.join(work, "raw", "*.json"))):
    raw = json.load(open(path))
    if not (raw.get("embed") and raw.get("status") == "OK" and raw.get("familySafe") and 0 < raw.get("seconds", 0) <= MAX_SECONDS):
        continue
    # A pick may have fewer blank lines than the original: they match, and the
    # original (blank lines and all) is what goes on the channel
    said = {(c.get("author"), squash(c.get("text"))): clean(c.get("text")) for c in raw.get("comments", [])}
    comments = []
    for c in picks.get(raw["id"], []):
        original = said.get((c["author"], squash(c["text"])))
        if original is None:
            print(f"dropped, not word for word in raw/{raw['id']}.json: {c['author']}: {c['text'][:60]!r}", file=sys.stderr)
            dropped += 1
            continue
        comments.append({"author": c["author"], "text": original, "votes": c.get("votes") or "0", "time": c.get("time") or ""})
    videos.append({
        "id": raw["id"],
        "title": raw["title"],
        "credit": raw.get("by") or raw.get("author") or "",
        "seconds": raw["seconds"],
        "comments": comments,
    })

for vid in picks:
    if not any(v["id"] == vid for v in videos):
        print(f"picked but not on the channel (won't embed, too long or no raw file): {vid}", file=sys.stderr)

with open(OUT, "w") as f:
    json.dump({"videos": videos}, f, indent=1, ensure_ascii=False)
    f.write("\n")
print(f"{len(videos)} videos, {sum(len(v['comments']) for v in videos)} comments, {dropped} dropped -> {os.path.normpath(OUT)}")
