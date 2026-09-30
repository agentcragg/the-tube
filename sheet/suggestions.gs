/**
 * The Tube: suggestion sheet (version 3).
 *
 * Paste this into the Google Sheet's Apps Script editor (Extensions > Apps Script),
 * replacing what's there, and save. Pick setUpAutoRefresh in the menu next to
 * Run, press Run, and allow access when Google asks (Advanced > Go to ... if it
 * warns): it sets the sheet to tell the website whenever it's edited, so ticks
 * show up straight away. Then Deploy > Manage deployments > Edit (the pencil) >
 * Version: New version > Deploy. The web app keeps its URL.
 * (Setting up from scratch: Deploy > New deployment > Web app, execute as Me,
 * access Anyone, and put the URL in lib/suggestions.ts.)
 *
 * Every video on the wall is a row: tick "On the wall?" to show it, untick to
 * hide it. The first time this version runs, the videos that were already on
 * the wall (STARTERS below) are added under the headers as ticked rows, or
 * ticked where they are if they're in the sheet already. That only happens
 * once; to run it again, delete "startersAdded" in Project Settings > Script
 * properties. Suggestions from the website, YouTube or TikTok, arrive as new
 * rows at the bottom.
 *
 * Columns: On the wall? | Title | Channel | Link | Suggested | Video ID
 * A TikTok's Video ID is "tt" followed by TikTok's number for the video.
 */

const VERSION = 3;
// The website, which is told about every edit (its app/api/sheet-changed)
const SITE = "https://the-tube-seven.vercel.app";
const HEADERS = ["On the wall?", "Title", "Channel", "Link", "Suggested", "Video ID"];
const YOUTUBE_ID = /^[\w-]{11}$/;
const TIKTOK_ID = /^tt\d{10,24}$/;

// What was on the wall before version 2 (seedVideos in the website's
// lib/videos.ts), in the same order. Channels are from YouTube.
const STARTERS = [
  { id: "mkRpQU2xVCo", title: "Nebraska City, episode 1: Promises", channel: "Nick Varvaro" },
  { id: "wompmqzTWi0", title: "Nebraska City, episode 5: Pregnant", channel: "Nick Varvaro" },
  { id: "ObcDCDDJN8k", title: "A Family Finds Entertainment (part 4)", channel: "WianTreetin" },
  { id: "IbpUzWGFGnM", title: "Center Jenny", channel: "oLI" },
  { id: "i8Dt_8JSRb4", title: "Trash Talkin", channel: "Qwerm" },
  { id: "er-OWkFeeV8", title: "Welcome to My Homeypage", channel: "DozzyrokALT" },
  { id: "S9DFdQvGn-w", title: "Feed Me", channel: "Film and Video Umbrella" },
  { id: "6e6RK8o1fcs", title: "Petscop", channel: "Petscop" },
  { id: "iGOJmdxdjeA", title: "BEN.wmv (Ben Drowned)", channel: "Jadusable" },
  { id: "3c66w6fVqOI", title: "Local 58: Contingency", channel: "LOCAL58TV" },
  { id: "M75VLQuFPrY", title: "Local 58: Weather Service", channel: "LOCAL58TV" },
  { id: "CBM-NZdWyk4", title: "FaZe 1 Million Subscribers Teamtage", channel: "FaZe Clan" },
  { id: "wk49clE9wuQ", title: "Genocide V2 (CoD4 montage)", channel: "xXxdan69xXx" },
  { id: "BY5TBKfEIWQ", title: "Rehearsals for Retirement", channel: "Max Felix" },
  { id: "eoSI9_I3sO8", title: "Last Days in a Lonely Place", channel: "Advanced Garbage" },
  { id: "u0Km5yvfDXY", title: "Still Raining, Still Dreaming", channel: "Sam W." },
  { id: "gldQKJfmizQ", title: "Crossroad", channel: "Helena Sampaio" },
  { id: "mq4Ks4Z_NGY", title: "Diary of a Camper", channel: "donkee" },
  { id: "mLyOj_QD4a4", title: "Leeroy Jenkins", channel: "J Jonah Jameson" },
  { id: "jHgZh4GV9G0", title: "Meet the Heavy", channel: "Valve" },
  { id: "OR4N5OhcY9s", title: "Meet the Spy", channel: "Valve" },
  { id: "9BAM9fgV-ts", title: "Red vs. Blue, episode 1: Why Are We Here?", channel: "Rooster Teeth" },
  { id: "5SQhfkpX9bc", title: "Freeman's Mind, episode 1", channel: "Accursed Farms" },
  { id: "nGQIQljaAc0", title: "Warthog jump", channel: "RoyalHoodie" },
  { id: "FxD9Rw_DXOk", title: "Hardly Workin'", channel: "United Recammers" },
  { id: "eEUR-Um21jY", title: "Skibidi Toilet, part 1", channel: "skibidi" },
  { id: "dKnwhokvgxE", title: "Max Headroom broadcast intrusion (WGN news)", channel: "The Museum of Classic Chicago Television (www.FuzzyMemories.TV)" },
  { id: "klqi_h9FElc", title: "Webdriver Torso", channel: "Webdriver Torso" },
  { id: "Bn59FJ4HrmU", title: "Marble Hornets, entry 1", channel: "Marble Hornets" },
  { id: "E3-vsKwQ0Cg", title: "Dots", channel: "thecipo" },
  { id: "eRvfxWRi6qQ", title: "Rubber Johnny", channel: "AphexAcid" },
  { id: "iLJNSD3H5sg", title: "Possibly in Michigan", channel: "ceceliacondit" },
  { id: "4AfAGE1r4Ew", title: "Hufflepuff", channel: "burnermunde" },
  { id: "kpk2tdsPh0A", title: "Watch for Rolling Rocks – 0.5x A Presses", channel: "pannenkoek2012" },
  { id: "6NSXbHWS5S0", title: "Avengers: Endgame audience reaction", channel: "Keen's Review." },
  { id: "8xqVeG9UiKs", title: "Southern nights", channel: "Wesley Crider" },
  { id: "q4lb0gXOq4I", title: "Mike Oldfield on Blue Peter", channel: "OneNoteAndMeanIt" },
];

function sheet_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
    sh.setFrozenRows(1);
  }
  return sh;
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

const isId_ = (id) => YOUTUBE_ID.test(id) || TIKTOK_ID.test(id);

// Every Video ID in the sheet, as text
function ids_(sh) {
  if (sh.getLastRow() < 2) return [];
  return sh.getRange(2, 6, sh.getLastRow() - 1, 1).getValues().map((r) => String(r[0]).trim());
}

// Kept as text, so a title starting with "=" isn't taken for a formula
function text_(value, max) {
  const s = String(value || "").slice(0, max);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

// The TikTok link the website sends, or a plain one made from the ID
function tikTokLink_(id, url) {
  const m = String(url || "").match(/^https:\/\/www\.tiktok\.com\/@[\w.]*\/video\/(\d+)$/);
  return m && "tt" + m[1] === id ? m[0] : "https://www.tiktok.com/@/video/" + id.slice(2);
}

// Once only: the starters go in as ticked rows under the headers. One that's in
// the sheet already is ticked where it is instead, since it was on the wall.
function addStarters_(sh) {
  const props = PropertiesService.getScriptProperties();
  if (props.getProperty("startersAdded")) return;
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    if (props.getProperty("startersAdded")) return;
    const have = ids_(sh);
    const ticks = sh.getLastRow() < 2 ? [] : sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues();
    STARTERS.forEach((v) => {
      const i = have.indexOf(v.id);
      if (i !== -1 && !have.some((id, j) => id === v.id && ticks[j][0] === true)) {
        sh.getRange(i + 2, 1).insertCheckboxes().check();
      }
    });
    const rows = STARTERS.filter((v) => have.indexOf(v.id) === -1).map((v) => [
      true,
      v.title,
      v.channel,
      "https://www.youtube.com/watch?v=" + v.id,
      "",
      v.id,
    ]);
    if (rows.length) {
      sh.insertRowsAfter(1, rows.length);
      const range = sh.getRange(2, 1, rows.length, HEADERS.length);
      range.clearFormat(); // new rows would otherwise copy the bold header row
      range.setValues(rows);
      // insertCheckboxes() unticks them all, so tick them again
      sh.getRange(2, 1, rows.length, 1).insertCheckboxes().check();
    }
    props.setProperty("startersAdded", new Date().toISOString());
  } finally {
    SpreadsheetApp.flush(); // so the next run sees these rows
    lock.releaseLock();
  }
}

// The website sends new suggestions here: a YouTube ID, or a TikTok's ID and link
function doPost(e) {
  let d;
  try {
    d = JSON.parse(e.postData.contents) || {};
  } catch (err) {
    return json_({ ok: false, error: "bad request" });
  }
  const id = String(d.id || "");
  const tiktok = TIKTOK_ID.test(id);
  if (!tiktok && !YOUTUBE_ID.test(id)) return json_({ ok: false, error: "bad id" });

  const sh = sheet_();
  addStarters_(sh);
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    if (ids_(sh).indexOf(id) !== -1) return json_({ ok: true, duplicate: true });

    sh.appendRow([
      false,
      text_(d.title, 200),
      text_(d.channel, 100),
      tiktok ? tikTokLink_(id, d.url) : "https://www.youtube.com/watch?v=" + id,
      new Date(),
      id,
    ]);
    sh.getRange(sh.getLastRow(), 1).insertCheckboxes();
    return json_({ ok: true });
  } finally {
    SpreadsheetApp.flush(); // so a suggestion waiting on the lock sees this row
    lock.releaseLock();
  }
}

// Every edit tells the website, which checks the notice with doGet (?confirm)
// before showing the change. Set up by setUpAutoRefresh, not run by hand.
function onSheetEdit() {
  const notice = Utilities.getUuid();
  PropertiesService.getScriptProperties().setProperty("notice", notice + " " + Date.now());
  try {
    UrlFetchApp.fetch(SITE + "/api/sheet-changed", {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({ notice: notice }),
      muteHttpExceptions: true,
    });
  } catch (err) {
    // The website re-reads the sheet every couple of minutes anyway
  }
}

// Run once from the editor. Asks for the two permissions it needs (to reach
// the website, and to run on edits) and sets onSheetEdit to run on every edit.
function setUpAutoRefresh() {
  ScriptApp.getProjectTriggers()
    .filter((t) => t.getHandlerFunction() === "onSheetEdit")
    .forEach((t) => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger("onSheetEdit").forSpreadsheet(SpreadsheetApp.getActive()).onEdit().create();
  addStarters_(sheet_());
}

// Yes only to the last notice sent, for five minutes
function noticeSent_(notice) {
  const kept = String(PropertiesService.getScriptProperties().getProperty("notice") || "").split(" ");
  return !!kept[0] && kept[0] === notice && Date.now() - Number(kept[1]) < 5 * 60 * 1000;
}

// The website reads the ticked rows, which are everything on the wall, from
// here; and checks change notices with ?confirm=
function doGet(e) {
  const confirm = e && e.parameter && e.parameter.confirm;
  if (confirm) return json_({ confirmed: noticeSent_(String(confirm)) });
  const sh = sheet_();
  addStarters_(sh);
  if (sh.getLastRow() < 2) return json_({ version: VERSION, videos: [] });
  const rows = sh.getRange(2, 1, sh.getLastRow() - 1, HEADERS.length).getValues();
  const videos = rows
    .filter((r) => r[0] === true && isId_(String(r[5]).trim()))
    .map((r) => ({
      id: String(r[5]).trim(),
      title: String(r[1]),
      channel: String(r[2]),
      url: String(r[3]),
      suggestedOn: r[4] instanceof Date ? Utilities.formatDate(r[4], "Europe/London", "yyyy-MM-dd") : "",
    }));
  return json_({ version: VERSION, videos });
}
