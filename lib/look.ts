// The look switch: a way to try design options on the live site without
// anyone else seeing them. Visit any page with ?look to get a small menu in
// the bottom-left corner; it's remembered in that browser. ?look=off turns
// everything off and hides the menu again.
//
// From the address bar:
//   ?look=<example>       one example at a time
//   ?look=<idea>,<idea>   add ideas; ?look=-<idea> takes one away
//   ?look=none            no example, ideas kept
//   ?today=2027-01-26     the browser behaves as if it's that day in London
//                         (the time of day stays real); ?today=off
//
// An example puts look-<id> on <html>, an idea puts idea-<id>. Markup that
// only belongs to an option carries x-<id> and is hidden unless it's on
// (app/looks.css); markup it replaces carries no-<id>. Ideas' styles go in
// app/ideas.css.
//
// Empty between rounds: the options Matt picks become the normal site and the
// rest are taken out.

export const LOOK_KEY = "tube-look";

type Option = { id: string; label: string };

export const EXAMPLES: Option[] = [];

export const IDEAS: Option[] = [];

export type Look = { example?: string; ideas: string[]; today?: string; closed?: boolean };

/** The saved look, or null when the switch isn't in use in this browser. */
export function readLook(): Look | null {
  try {
    const s = JSON.parse(localStorage.getItem(LOOK_KEY) ?? "null");
    return s && typeof s === "object" ? { ...s, ideas: Array.isArray(s.ideas) ? s.ideas : [] } : null;
  } catch {
    return null;
  }
}

export function writeLook(look: Look | null) {
  try {
    if (look) localStorage.setItem(LOOK_KEY, JSON.stringify(look));
    else localStorage.removeItem(LOOK_KEY);
  } catch {}
}

/** The chosen pretend day (YYYY-MM-DD), if any. */
export function pretendDay(): string | undefined {
  const day = readLook()?.today;
  return day && /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : undefined;
}

// Runs in <head> before the page paints: reads ?look and ?today, saves them
// (forgetting options that have since been taken out), and puts the classes
// on <html> so nothing flashes. Plain ES5, no imports.
export const LOOK_SCRIPT = `(function(){try{
var K=${JSON.stringify(LOOK_KEY)},EX=${JSON.stringify(EXAMPLES.map((e) => e.id))},ID=${JSON.stringify(IDEAS.map((i) => i.id))};
var s=JSON.parse(localStorage.getItem(K)||"null");if(s&&typeof s!=="object")s=null;
var q=new URLSearchParams(location.search);
if(q.has("look")){var v=q.get("look");
if(v==="off"){s=null}else{s=s||{ideas:[]};s.ideas=s.ideas||[];
v.split(",").forEach(function(t){t=t.trim();if(!t)return;var neg=t.charAt(0)==="-";if(neg)t=t.slice(1);
if(t==="none"){delete s.example}else if(EX.indexOf(t)>=0){if(neg){if(s.example===t)delete s.example}else s.example=t}
else if(ID.indexOf(t)>=0){s.ideas=s.ideas.filter(function(x){return x!==t});if(!neg)s.ideas.push(t)}});}}
if(s){if(s.example&&EX.indexOf(s.example)<0)delete s.example;s.ideas=(s.ideas||[]).filter(function(i){return ID.indexOf(i)>=0})}
if(q.has("today")){var d=q.get("today");if(/^\\d{4}-\\d{2}-\\d{2}$/.test(d)){s=s||{ideas:[]};s.today=d}else if(s){delete s.today}}
if(s)localStorage.setItem(K,JSON.stringify(s));else localStorage.removeItem(K);
if(s){var c=document.documentElement.classList;if(s.example&&EX.indexOf(s.example)>=0)c.add("look-"+s.example);
(s.ideas||[]).forEach(function(i){if(ID.indexOf(i)>=0)c.add("idea-"+i)})}
}catch(e){}})();`;
