# Basement TV, step 1 of 2: for each candidate video, check it plays in
# embeds and how long it is, then save its 40 most popular YouTube comments.
# Writes WORK/raw/<id>.json. This is the script that made lib/tv-channel.json.
#
# To rerun it:
#   pip3 install youtube-comment-downloader
#   python3 scripts/tv-comments.py WORK [SUGGESTIONS_URL]
# WORK is any folder outside the repo holding candidates.json, a list of
# {"id", "title", "by", "year", "length", "from"}. SUGGESTIONS_URL, if given,
# is fetched for {"videos": [{"id", "title", "channel"}]} and any new ones are
# added to candidates.json. Videos that already have a raw/<id>.json are
# skipped, so delete one to fetch it again.
#
# Then pick the comments to keep into WORK/picks.json and rebuild the
# channel with step 2, scripts/tv-channel.py.
import json, re, subprocess, sys, time, os
from itertools import islice
from youtube_comment_downloader import YoutubeCommentDownloader, SORT_BY_POPULAR

if len(sys.argv) < 2:
    sys.exit("usage: python3 scripts/tv-comments.py WORK [SUGGESTIONS_URL]")
HERE = os.path.abspath(sys.argv[1])
os.makedirs(os.path.join(HERE, "raw"), exist_ok=True)
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"
cands = json.load(open(os.path.join(HERE, "candidates.json")))
extra = json.loads(subprocess.run(["curl", "-sL", sys.argv[2]], capture_output=True, text=True).stdout).get("videos", []) if len(sys.argv) > 2 else []
for v in extra:
    if not any(c["id"] == v["id"] for c in cands):
        cands.append({"id": v["id"], "title": v["title"], "by": v.get("channel"), "year": None, "length": None, "from": "suggestion"})
json.dump(cands, open(os.path.join(HERE, "candidates.json"), "w"), indent=1)

dl = YoutubeCommentDownloader()
for n, c in enumerate(cands):
    out = os.path.join(HERE, "raw", c["id"] + ".json")
    if os.path.exists(out):
        continue
    h = subprocess.run(["curl", "-s", "-A", UA, "-H", "Accept-Language: en-GB", f"https://www.youtube.com/watch?v={c['id']}"], capture_output=True, text=True).stdout
    g = lambda pat: (re.search(pat, h) or [None, None])[1]
    info = {
        "seconds": int(g(r'"lengthSeconds":"(\d+)"') or 0),
        "embed": g(r'"playableInEmbed":(true|false)') == "true",
        "status": g(r'"playabilityStatus":\{"status":"([A-Z_]+)"'),
        "familySafe": g(r'"isFamilySafe":(true|false)') == "true",
        "uploaded": (g(r'"uploadDate":"([^"]+)"') or "")[:10],
        "author": g(r'"ownerChannelName":"((?:[^"\\]|\\.)*)"'),
    }
    comments = []
    try:
        for cm in islice(dl.get_comments_from_url(f"https://www.youtube.com/watch?v={c['id']}", sort_by=SORT_BY_POPULAR), 40):
            comments.append({"author": cm.get("author"), "text": cm.get("text"), "votes": cm.get("votes"), "time": cm.get("time"), "reply": cm.get("reply", False)})
    except Exception as e:
        info["commentError"] = str(e)[:200]
    json.dump({**c, **info, "comments": comments}, open(out, "w"), indent=1, ensure_ascii=False)
    print(f"{n+1}/{len(cands)} {c['id']} {info['seconds']}s embed={info['embed']} {info['status']} comments={len(comments)}", flush=True)
    time.sleep(1.5)
print("DONE", flush=True)
