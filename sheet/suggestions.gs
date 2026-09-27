/**
 * The Tube: suggestion sheet.
 *
 * Paste this into the Google Sheet's Apps Script editor (Extensions > Apps Script),
 * then deploy it as a web app. Suggestions from the website arrive as new rows;
 * tick "On the wall?" to put one on the wall.
 *
 * Columns: On the wall? | Title | Channel | Link | Suggested | Video ID
 */

const HEADERS = ["On the wall?", "Title", "Channel", "Link", "Suggested", "Video ID"];

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

// The website sends new suggestions here
function doPost(e) {
  let d;
  try {
    d = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, error: "bad request" });
  }
  const id = String(d.id || "");
  if (!/^[\w-]{11}$/.test(id)) return json_({ ok: false, error: "bad id" });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = sheet_();
    const ids = sh.getLastRow() > 1 ? sh.getRange(2, 6, sh.getLastRow() - 1, 1).getValues().flat() : [];
    if (ids.indexOf(id) !== -1) return json_({ ok: true, duplicate: true });

    sh.appendRow([
      false,
      String(d.title || "").slice(0, 200),
      String(d.channel || "").slice(0, 100),
      "https://www.youtube.com/watch?v=" + id,
      new Date(),
      id,
    ]);
    sh.getRange(sh.getLastRow(), 1).insertCheckboxes();
    return json_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

// The website reads the ticked (approved) rows from here
function doGet() {
  const sh = sheet_();
  if (sh.getLastRow() < 2) return json_({ videos: [] });
  const rows = sh.getRange(2, 1, sh.getLastRow() - 1, HEADERS.length).getValues();
  const videos = rows
    .filter((r) => r[0] === true && /^[\w-]{11}$/.test(r[5]))
    .map((r) => ({
      id: r[5],
      title: r[1],
      channel: r[2],
      suggestedOn: r[4] instanceof Date ? Utilities.formatDate(r[4], "Europe/London", "yyyy-MM-dd") : "",
    }));
  return json_({ videos });
}
