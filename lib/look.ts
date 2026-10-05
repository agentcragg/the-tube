// The look switch: a way to try a design option on the live site without
// anyone else seeing it. There's no menu any more (Matt asked for it to go on
// 5 Oct 2026); a look is chosen only from the address bar, and remembered in
// that browser:
//   ?look=<example>   that example
//   ?look=off         back to the site as it is
//
// An example puts look-<id> on <html>. Markup that only belongs to an example
// carries x-<id> and is hidden unless it's on (app/looks.css); markup it
// replaces carries no-<id>.
//
// Empty between rounds: the examples Matt picks become the normal site and the
// rest are taken out.

const LOOK_KEY = "tube-look";

export const EXAMPLES: { id: string; label: string }[] = [];

// Runs in <head> before the page paints: reads ?look, saves it (forgetting
// an example that has since been taken out, or anything saved by the old
// menu), and puts the class on <html> so nothing flashes. Plain ES5, no imports.
export const LOOK_SCRIPT = `(function(){try{
var K=${JSON.stringify(LOOK_KEY)},EX=${JSON.stringify(EXAMPLES.map((e) => e.id))};
var q=new URLSearchParams(location.search),s=q.has("look")?q.get("look"):localStorage.getItem(K);
if(EX.indexOf(s)<0)s=null;
if(s){localStorage.setItem(K,s);document.documentElement.classList.add("look-"+s)}else localStorage.removeItem(K);
}catch(e){}})();`;
