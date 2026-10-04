import scene from "@/lib/intro.json";

// The TV intro (idea "intro", components/Intro.tsx): on the first page of a
// visit the site opens on a dithered TV against a basement wall; it comes on,
// flickers through stills from the programme, then the view pushes into the
// screen and the site is behind it. The pictures are made by
// scripts/intro-assets.mjs, which also writes lib/intro.json.
//
// It runs from a plain script straight after the intro's markup, before React
// loads, so it plays from the first paint even on a slow connection. The
// script only touches <html> (classes, data-intro-*, a few CSS variables),
// which React leaves alone, so hydration doesn't trip over it.

export const INTRO_KEY = "tube-intro";
export { scene };

// One frame every 80ms, like a GIF: [ms from the start, still, snow].
// Still: which of the screen's stills shows, -1 for none (a dark screen).
// Snow: 0 none, 1 thick, 2 half, 3 sparse, "line" the tube warming up.
const FRAMES: [number, number, number | "line"][] = [
  [0, -1, 0],
  [650, -1, "line"],
  [730, -1, 1],
  [810, -1, 1],
  [890, 0, 2],
  [970, 0, 2],
  [1050, 0, 3],
  [1130, 0, 0],
  [1210, 0, 0],
  [1290, 0, 3],
  [1370, -1, 1],
  [1450, 1, 2],
  [1530, 1, 3],
  [1610, 1, 0],
  [1690, 1, 3],
  [1770, -1, 1],
  [1850, 2, 3],
  [1930, 2, 0],
  [2010, 2, 3],
  [2090, -1, 1],
  [2170, 3, 2],
  [2250, 3, 3],
  [2330, 3, 0],
  [2410, -1, 1],
];
const PUSH = 2490; // then into the screen
const PUSH_MS = 800;
// No intro if the TV picture takes longer than this to arrive: a moment of
// blank grey is fine, a long one isn't
const WAIT_MS = 400;

// The TV against the wall, wide and for tall phone screens
export const TV_WIDE = "/intro/tv-wide.png";
export const TV_TALL = "/intro/tv-tall.png";
const TALL = "(max-aspect-ratio: 2/3)";

// Plays this time: the idea's on, it hasn't played yet this visit (or
// ?look=intro asks again), and nobody's asked for less movement. ES5.
const PLAYS = `var d=document.documentElement,c=d.classList,K=${JSON.stringify(INTRO_KEY)};
var q=new URLSearchParams(location.search).get("look"),again=!!q&&q.split(",").indexOf("intro")>=0;
var plays=c.contains("idea-intro")&&(again||!sessionStorage.getItem(K))&&!matchMedia("(prefers-reduced-motion: reduce)").matches;`;

// In <head>, straight after the look script: starts the TV picture on its way
// while the page's CSS still is, so it's usually in by the time the intro starts.
export const INTRO_PRELOAD = `(function(){try{${PLAYS}
if(!plays)return;var l=document.createElement("link");l.rel="preload";l.as="image";
l.href=matchMedia(${JSON.stringify(TALL)}).matches?${JSON.stringify(TV_TALL)}:${JSON.stringify(TV_WIDE)};document.head.appendChild(l);
}catch(e){}})();`;

// Plain ES5, no imports. Once a visit, so it remembers in sessionStorage;
// ?look=intro in the address plays it again, for trying it out.
export const INTRO_SCRIPT = `(function(){try{${PLAYS}
if(!plays)return;
var el=document.getElementById("tv-intro");if(!el)return;
sessionStorage.setItem(K,"1");
var F=${JSON.stringify(FRAMES)},timers=[],started=false,over=false,EV=["pointerdown","keydown","wheel","touchstart"];
c.add("intro-on");
function set(f){d.setAttribute("data-intro-still",f[1]);d.setAttribute("data-intro-snow",f[2]);
d.style.setProperty("--intro-jx",Math.floor(Math.random()*400)+"px")}
function end(fast){if(over)return;over=true;timers.forEach(clearTimeout);
EV.forEach(function(t){removeEventListener(t,skip,true)});
if(fast)c.add("intro-skip");
setTimeout(function(){c.remove("intro-on","intro-go","intro-push","intro-skip");
d.removeAttribute("data-intro-still");d.removeAttribute("data-intro-snow");
["--intro-jx","--intro-dx","--intro-dy","--intro-s"].forEach(function(p){d.style.removeProperty(p)});
if(!d.getAttribute("style"))d.removeAttribute("style")},fast?160:0)}
function skip(e){if(e.type==="pointerdown"&&e.button)return;end(true)}
function push(){var s=el.querySelector(".tv-intro-screen").getBoundingClientRect(),w=innerWidth,h=innerHeight;
d.style.setProperty("--intro-dx",(w/2-(s.left+s.width/2))+"px");d.style.setProperty("--intro-dy",(h/2-(s.top+s.height/2))+"px");
d.style.setProperty("--intro-s",Math.max(w/s.width,h/s.height)*1.3);c.add("intro-push")}
function go(){if(started||over)return;started=true;c.add("intro-go");
F.forEach(function(f){timers.push(setTimeout(function(){set(f)},f[0]))});
timers.push(setTimeout(push,${PUSH}));timers.push(setTimeout(function(){end(false)},${PUSH + PUSH_MS}))}
EV.forEach(function(t){addEventListener(t,skip,{capture:true,passive:true})});
var img=new Image();img.onload=go;img.onerror=function(){end(true)};
img.src=el.getAttribute(matchMedia(${JSON.stringify(TALL)}).matches?"data-tall":"data-wide");
if(img.complete)go();
timers.push(setTimeout(function(){if(!started)end(true)},${WAIT_MS}));
}catch(e){}})();`;
